/**
 * Learning Streak Service
 *
 * Rules:
 * 1. A learning streak is the number of consecutive calendar days on which the user completed at least 1 task.
 * 2. If the user completed a task TODAY:
 *    - The streak is actively maintained today.
 *    - Consecutive days are counted backwards starting from today (today, yesterday, day before, etc.).
 * 3. If the user has NOT completed a task TODAY yet:
 *    - If they completed a task YESTERDAY, their streak is still alive! It hasn't broken yet because today isn't over.
 *    - Consecutive days are counted backwards starting from yesterday.
 * 4. If the most recent completion was before yesterday (2+ days ago) or never:
 *    - The streak is broken and returns 0.
 * 5. Uses actual completedAt timestamps from tasks in the database.
 */

/**
 * Format a Date object to YYYY-MM-DD string in a specific timezone or UTC
 * @param {Date} date
 * @param {string} [timeZone]
 * @returns {string} YYYY-MM-DD
 */
function formatDateKey(date, timeZone) {
  try {
    if (timeZone) {
      // Formatter in specified user timezone
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(date); // outputs YYYY-MM-DD
    }
  } catch (err) {
    // If timezone is invalid, fallback to UTC
  }

  // Fallback to UTC ISO string date part
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Shift a date by a given number of days
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate user learning streak based on completed task records
 * @param {Array<{completedAt: Date}>} completedTasks
 * @param {string} [timeZone]
 * @returns {Object} { currentStreak, activeToday, totalActiveDays }
 */
function calculateStreak(completedTasks, timeZone) {
  if (!completedTasks || completedTasks.length === 0) {
    return {
      currentStreak: 0,
      activeToday: false,
      totalActiveDays: 0,
    };
  }

  // Create a unique set of active dates (YYYY-MM-DD)
  const activeDateSet = new Set();
  completedTasks.forEach((task) => {
    if (task.completedAt) {
      const dateKey = formatDateKey(new Date(task.completedAt), timeZone);
      activeDateSet.add(dateKey);
    }
  });

  if (activeDateSet.size === 0) {
    return {
      currentStreak: 0,
      activeToday: false,
      totalActiveDays: 0,
    };
  }

  const now = new Date();
  const todayKey = formatDateKey(now, timeZone);
  const yesterdayKey = formatDateKey(addDays(now, -1), timeZone);

  const activeToday = activeDateSet.has(todayKey);
  const activeYesterday = activeDateSet.has(yesterdayKey);

  // If neither today nor yesterday had any activity, streak is 0
  if (!activeToday && !activeYesterday) {
    return {
      currentStreak: 0,
      activeToday: false,
      totalActiveDays: activeDateSet.size,
    };
  }

  // Determine starting reference date for consecutive counting
  let streak = 0;
  let checkDate = now;

  if (activeToday) {
    // Count starts from today
    checkDate = now;
  } else {
    // Hasn't completed today yet, but completed yesterday: count starts from yesterday
    checkDate = addDays(now, -1);
  }

  // Step backwards day by day to count consecutive active days
  while (true) {
    const key = formatDateKey(checkDate, timeZone);
    if (activeDateSet.has(key)) {
      streak += 1;
      checkDate = addDays(checkDate, -1);
    } else {
      break;
    }
  }

  return {
    currentStreak: streak,
    activeToday,
    totalActiveDays: activeDateSet.size,
  };
}

module.exports = {
  calculateStreak,
  formatDateKey,
};
