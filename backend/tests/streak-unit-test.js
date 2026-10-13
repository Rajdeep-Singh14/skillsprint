const { calculateStreak, formatDateKey } = require('../src/services/streakService');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n--- Streak Service Unit Tests ---');

// Case 1: Empty tasks
const s1 = calculateStreak([]);
assert(s1.currentStreak === 0 && !s1.activeToday, 'Empty tasks returns streak 0');

// Helper to create date N days from now
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

// Case 2: 1 task completed today
const s2 = calculateStreak([{ completedAt: daysAgo(0) }]);
assert(s2.currentStreak === 1 && s2.activeToday, '1 task today produces streak = 1 and activeToday = true');

// Case 3: 1 task completed yesterday, none today
const s3 = calculateStreak([{ completedAt: daysAgo(1) }]);
assert(s3.currentStreak === 1 && !s3.activeToday, '1 task yesterday (none today) preserves streak = 1 and activeToday = false');

// Case 4: Multiple tasks on same day
const s4 = calculateStreak([
  { completedAt: daysAgo(0) },
  { completedAt: daysAgo(0) },
  { completedAt: daysAgo(0) },
]);
assert(s4.currentStreak === 1 && s4.totalActiveDays === 1, 'Multiple tasks on same day collapse into 1 distinct day');

// Case 5: 3 consecutive days ending today
const s5 = calculateStreak([
  { completedAt: daysAgo(2) },
  { completedAt: daysAgo(1) },
  { completedAt: daysAgo(0) },
]);
assert(s5.currentStreak === 3 && s5.activeToday, '3 consecutive days ending today produces streak = 3');

// Case 6: 3 consecutive days ending yesterday
const s6 = calculateStreak([
  { completedAt: daysAgo(3) },
  { completedAt: daysAgo(2) },
  { completedAt: daysAgo(1) },
]);
assert(s6.currentStreak === 3 && !s6.activeToday, '3 consecutive days ending yesterday produces streak = 3');

// Case 7: Gap in streak (completed 2 days ago, none yesterday, none today)
const s7 = calculateStreak([
  { completedAt: daysAgo(5) },
  { completedAt: daysAgo(4) },
  { completedAt: daysAgo(2) },
]);
assert(s7.currentStreak === 0, 'Gap of 2+ days breaks streak to 0');

console.log(`\nStreak tests completed: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
