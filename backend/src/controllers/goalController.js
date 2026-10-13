const { Goal, GOAL_CATEGORIES } = require('../models/Goal');
const Task = require('../models/Task');

/**
 * @desc    Create a new learning goal
 * @route   POST /api/goals
 * @access  Private
 */
const createGoal = async (req, res, next) => {
  try {
    const { title, description, category, startDate, targetDate, status } = req.body;

    if (!title || !startDate || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, start date, and target date are required',
      });
    }

    const start = new Date(startDate);
    const target = new Date(targetDate);

    if (isNaN(start.getTime()) || isNaN(target.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided for start date or target date',
      });
    }

    if (target < start) {
      return res.status(400).json({
        success: false,
        message: 'Target date must be on or after start date',
      });
    }

    if (category && !GOAL_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${GOAL_CATEGORIES.join(', ')}`,
      });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category || 'Other',
      startDate: start,
      targetDate: target,
      status: status === 'completed' ? 'completed' : 'active',
    });

    return res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      goal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all goals for the authenticated user with optional filter/search & calculated progress
 * @route   GET /api/goals
 * @access  Private
 */
const getGoals = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;

    const query = { userId: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const goals = await Goal.find(query).sort({ createdAt: -1 });

    // Aggregate task completion statistics per goal for the user
    const goalIds = goals.map((g) => g._id);

    const taskStats = await Task.aggregate([
      {
        $match: {
          userId: req.user._id,
          goalId: { $in: goalIds },
        },
      },
      {
        $group: {
          _id: '$goalId',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]);

    const statsMap = {};
    taskStats.forEach((stat) => {
      statsMap[stat._id.toString()] = stat;
    });

    const goalsWithProgress = goals.map((goal) => {
      const stat = statsMap[goal._id.toString()] || { totalTasks: 0, completedTasks: 0 };
      const progressPercentage =
        stat.totalTasks > 0
          ? Math.round((stat.completedTasks / stat.totalTasks) * 100)
          : 0;

      return {
        ...goal.toObject(),
        totalTasks: stat.totalTasks,
        completedTasks: stat.completedTasks,
        pendingTasks: stat.totalTasks - stat.completedTasks,
        progressPercentage,
      };
    });

    return res.status(200).json({
      success: true,
      count: goalsWithProgress.length,
      goals: goalsWithProgress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single goal by ID with its tasks and calculated progress
 * @route   GET /api/goals/:id
 * @access  Private
 */
const getGoalById = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or access denied',
      });
    }

    // Fetch tasks for this goal
    const tasks = await Task.find({
      goalId: goal._id,
      userId: req.user._id,
    }).sort({ dueDate: 1, createdAt: 1 });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const progressPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.status(200).json({
      success: true,
      goal: {
        ...goal.toObject(),
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        progressPercentage,
      },
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a goal
 * @route   PUT /api/goals/:id
 * @access  Private
 */
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or access denied',
      });
    }

    const { title, description, category, startDate, targetDate, status } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty',
        });
      }
      goal.title = title.trim();
    }

    if (description !== undefined) {
      goal.description = description.trim();
    }

    if (category !== undefined) {
      if (!GOAL_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${GOAL_CATEGORIES.join(', ')}`,
        });
      }
      goal.category = category;
    }

    if (startDate !== undefined) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid start date' });
      }
      goal.startDate = start;
    }

    if (targetDate !== undefined) {
      const target = new Date(targetDate);
      if (isNaN(target.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid target date' });
      }
      goal.targetDate = target;
    }

    // Verify targetDate >= startDate after updates
    if (goal.targetDate < goal.startDate) {
      return res.status(400).json({
        success: false,
        message: 'Target date must be on or after start date',
      });
    }

    if (status !== undefined) {
      if (!['active', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be active or completed',
        });
      }
      goal.status = status;
    }

    await goal.save();

    return res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      goal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a goal and its associated tasks (cascade delete)
 * @route   DELETE /api/goals/:id
 * @access  Private
 */
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or access denied',
      });
    }

    // Delete associated tasks first
    await Task.deleteMany({
      goalId: goal._id,
      userId: req.user._id,
    });

    // Delete the goal
    await Goal.deleteOne({ _id: goal._id });

    return res.status(200).json({
      success: true,
      message: 'Goal and associated tasks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
};
