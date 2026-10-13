const { Goal } = require('../models/Goal');
const Task = require('../models/Task');
const { calculateStreak } = require('../services/streakService');

/**
 * @desc    Get aggregated dashboard statistics for the authenticated user
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const timeZone = req.query.timezone;

    // 1. Calculate Goal Statistics
    const [totalGoals, activeGoals, completedGoals] = await Promise.all([
      Goal.countDocuments({ userId }),
      Goal.countDocuments({ userId, status: 'active' }),
      Goal.countDocuments({ userId, status: 'completed' }),
    ]);

    // 2. Calculate Task Statistics
    const [totalTasks, completedTasksCount, pendingTasksCount] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: 'completed' }),
      Task.countDocuments({ userId, status: 'pending' }),
    ]);

    // 3. Overall completion percentage (handle 0 tasks gracefully)
    const overallCompletionPercentage =
      totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

    // 4. Retrieve completed tasks with completedAt for streak calculation
    const completedTasksWithDates = await Task.find({
      userId,
      status: 'completed',
      completedAt: { $ne: null },
    }).select('completedAt');

    const streakData = calculateStreak(completedTasksWithDates, timeZone);

    // 5. Recent tasks (5 most recently updated/created tasks)
    const recentTasks = await Task.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('goalId', 'title category');

    // 6. Upcoming deadlines (5 nearest pending tasks)
    const upcomingDeadlines = await Task.find({
      userId,
      status: 'pending',
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate('goalId', 'title category');

    return res.status(200).json({
      success: true,
      stats: {
        goals: {
          total: totalGoals,
          active: activeGoals,
          completed: completedGoals,
        },
        tasks: {
          total: totalTasks,
          completed: completedTasksCount,
          pending: pendingTasksCount,
          completionPercentage: overallCompletionPercentage,
        },
        streak: streakData,
      },
      recentTasks,
      upcomingDeadlines,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
