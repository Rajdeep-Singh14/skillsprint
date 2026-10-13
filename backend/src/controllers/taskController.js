const Task = require('../models/Task');
const { Goal } = require('../models/Goal');

/**
 * @desc    Create a new task under a goal
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const { goalId, title, description, dueDate, status } = req.body;

    if (!goalId || !title || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Goal ID, title, and due date are required',
      });
    }

    // Verify goal exists and belongs to the authenticated user
    const goal = await Goal.findOne({
      _id: goalId,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Associated learning goal not found or access denied',
      });
    }

    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid due date format',
      });
    }

    const isCompleted = status === 'completed';

    const task = await Task.create({
      userId: req.user._id,
      goalId: goal._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      dueDate: parsedDueDate,
      status: isCompleted ? 'completed' : 'pending',
      completedAt: isCompleted ? new Date() : null,
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tasks for authenticated user with filtering & sorting
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { goalId, status, sortBy, limit } = req.query;

    const query = { userId: req.user._id };

    if (goalId) {
      query.goalId = goalId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    let sortOption = { dueDate: 1 }; // default: earliest due date first
    if (sortBy === 'dueDate_desc') {
      sortOption = { dueDate: -1 };
    } else if (sortBy === 'createdAt_desc') {
      sortOption = { createdAt: -1 };
    } else if (sortBy === 'completedAt_desc') {
      sortOption = { completedAt: -1 };
    }

    let queryBuilder = Task.find(query).sort(sortOption).populate('goalId', 'title category');

    if (limit && !isNaN(parseInt(limit, 10))) {
      queryBuilder = queryBuilder.limit(parseInt(limit, 10));
    }

    const tasks = await queryBuilder;

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('goalId', 'title category');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied',
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task (title, description, dueDate, status)
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied',
      });
    }

    const { title, description, dueDate, status } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Task title cannot be empty',
        });
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description.trim();
    }

    if (dueDate !== undefined) {
      const parsed = new Date(dueDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid due date format',
        });
      }
      task.dueDate = parsed;
    }

    if (status !== undefined) {
      if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be pending or completed',
        });
      }

      // Manage completedAt timestamp according to PRD
      if (status === 'completed' && task.status !== 'completed') {
        task.status = 'completed';
        task.completedAt = new Date();
      } else if (status === 'pending' && task.status !== 'pending') {
        task.status = 'pending';
        task.completedAt = null;
      }
    }

    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied',
      });
    }

    await Task.deleteOne({ _id: task._id });

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
