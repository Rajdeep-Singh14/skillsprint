const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');

// Test runner helper
let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedCount++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 Starting SkillSprint Comprehensive Integration Tests');
  console.log('======================================================\n');

  let mongoServer;
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('📦 Connected to In-Memory MongoDB test instance.\n');
  } catch (err) {
    console.error('Failed to initialize in-memory mongo test instance:', err.message);
    process.exit(1);
  }

  try {
    // -------------------------------------------------------------------
    // 1. HEALTH CHECK TEST
    // -------------------------------------------------------------------
    console.log('--- 1. API Health Check ---');
    const healthRes = await request(app).get('/api/health');
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK');
    assert(healthRes.body.status === 'healthy', 'Health check body status is healthy');

    // -------------------------------------------------------------------
    // 2. AUTHENTICATION & SECURITY TESTS
    // -------------------------------------------------------------------
    console.log('\n--- 2. User Registration & Authentication ---');

    // Missing fields validation
    const missingFieldsRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' });
    assert(missingFieldsRes.status === 400, 'Rejects registration with missing fields (400)');

    // Short password validation
    const shortPasswordRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Short Pass', email: 'short@example.com', password: '123' });
    assert(shortPasswordRes.status === 400, 'Rejects password shorter than 6 characters (400)');

    // Valid registration for User A
    const userARegRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Learner',
        email: 'alice@skillsprint.edu',
        password: 'password123',
      });
    assert(userARegRes.status === 201, 'User A registered successfully with 201 Created');
    assert(userARegRes.body.token !== undefined, 'Registration returns signed JWT token');
    assert(userARegRes.body.user.name === 'Alice Learner', 'Returns correct user profile');
    assert(userARegRes.body.user.passwordHash === undefined, 'passwordHash is stripped from response JSON');

    const tokenA = userARegRes.body.token;
    const cookieA = userARegRes.headers['set-cookie'];
    assert(cookieA && cookieA.some((c) => c.includes('token=')), 'Sets HttpOnly authentication cookie in headers');

    // Duplicate email registration rejected
    const dupEmailRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Twin',
        email: 'alice@skillsprint.edu',
        password: 'anotherpassword',
      });
    assert(dupEmailRes.status === 400, 'Rejects duplicate email address registration (400)');

    // Valid login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@skillsprint.edu',
        password: 'password123',
      });
    assert(loginRes.status === 200, 'User A logged in successfully (200)');
    assert(loginRes.body.user.email === 'alice@skillsprint.edu', 'Login returns valid user data');

    // Invalid login
    const badLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@skillsprint.edu',
        password: 'wrongpassword',
      });
    assert(badLoginRes.status === 401, 'Rejects incorrect password with 401 Unauthorized');

    // GET /api/auth/me with Bearer token
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenA}`);
    assert(meRes.status === 200, 'GET /api/auth/me returns current user info');
    assert(meRes.body.user.email === 'alice@skillsprint.edu', 'Verified user identity matches token');

    // GET /api/auth/me without token
    const unauthMeRes = await request(app).get('/api/auth/me');
    assert(unauthMeRes.status === 401, 'Protected route rejects unauthenticated request (401)');

    // Register User B for cross-user isolation tests
    const userBRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Competitor',
        email: 'bob@skillsprint.edu',
        password: 'bobpassword456',
      });
    const tokenB = userBRegRes.body.token;
    assert(userBRegRes.status === 201, 'User B registered for authorization testing');

    // -------------------------------------------------------------------
    // 3. GOALS CRUD & DATE VALIDATION TESTS
    // -------------------------------------------------------------------
    console.log('\n--- 3. Learning Goals Management ---');

    // Invalid date order: targetDate < startDate
    const invalidDateGoalRes = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Time Traveler Goal',
        category: 'Programming',
        startDate: '2026-10-20',
        targetDate: '2026-10-10', // earlier than start date
      });
    assert(invalidDateGoalRes.status === 400, 'Rejects goal when targetDate is before startDate (400)');

    // Create Goal 1 for User A
    const createGoal1Res = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Master React & Vite',
        description: 'Complete all React hooks and component composition patterns',
        category: 'Web Development',
        startDate: '2026-10-01',
        targetDate: '2026-11-01',
      });
    assert(createGoal1Res.status === 201, 'Goal 1 created successfully by User A');
    const goal1Id = createGoal1Res.body.goal._id;

    // Create Goal 2 for User A
    const createGoal2Res = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Learn Data Structures in C++',
        description: 'Trees, Graphs, and Hash Tables',
        category: 'Computer Science',
        startDate: '2026-10-05',
        targetDate: '2026-11-15',
      });
    assert(createGoal2Res.status === 201, 'Goal 2 created successfully by User A');
    const goal2Id = createGoal2Res.body.goal._id;

    // Get User A goals (should return 2)
    const getGoalsARes = await request(app)
      .get('/api/goals')
      .set('Authorization', `Bearer ${tokenA}`);
    assert(getGoalsARes.status === 200, 'GET /api/goals returns 200');
    assert(getGoalsARes.body.goals.length === 2, 'User A sees their 2 goals');

    // Zero-tasks progress check: Goal 1 has 0 tasks, progress must be 0% without NaN
    assert(getGoalsARes.body.goals[0].progressPercentage === 0, 'Empty goal calculates 0% progress without division errors');

    // Search filter test
    const searchRes = await request(app)
      .get('/api/goals?search=React')
      .set('Authorization', `Bearer ${tokenA}`);
    assert(searchRes.body.goals.length === 1 && searchRes.body.goals[0].title.includes('React'), 'Filters goals by title search query');

    // Category filter test
    const catFilterRes = await request(app)
      .get('/api/goals?category=Computer%20Science')
      .set('Authorization', `Bearer ${tokenA}`);
    assert(catFilterRes.body.goals.length === 1 && catFilterRes.body.goals[0].category === 'Computer Science', 'Filters goals by category');

    // Cross-user test: User B should see 0 goals initially
    const getGoalsBRes = await request(app)
      .get('/api/goals')
      .set('Authorization', `Bearer ${tokenB}`);
    assert(getGoalsBRes.body.goals.length === 0, 'User B cannot see User A goals (User isolation verified)');

    // Cross-user test: User B cannot access Goal 1 by ID
    const getGoalB_A1 = await request(app)
      .get(`/api/goals/${goal1Id}`)
      .set('Authorization', `Bearer ${tokenB}`);
    assert(getGoalB_A1.status === 404, 'User B receives 404 Not Found when attempting to access User A goal');

    // -------------------------------------------------------------------
    // 4. TASKS CRUD & PROGRESS CALCULATION TESTS
    // -------------------------------------------------------------------
    console.log('\n--- 4. Daily Tasks Management & Progress Tracking ---');

    // Cross-user task creation: User B cannot create a task under User A goal
    const unauthTaskRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        goalId: goal1Id,
        title: 'Hacker Task',
        dueDate: '2026-10-15',
      });
    assert(unauthTaskRes.status === 404, 'Prevents User B from attaching task to User A goal (404)');

    // Create Task 1 under Goal 1 for User A
    const createTask1Res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        goalId: goal1Id,
        title: 'Learn useState and useEffect',
        description: 'Read official documentation and build a counter app',
        dueDate: '2026-10-14',
        status: 'pending',
      });
    assert(createTask1Res.status === 201, 'Task 1 created for Goal 1');
    const task1Id = createTask1Res.body.task._id;
    assert(createTask1Res.body.task.completedAt === null, 'Pending task has completedAt = null');

    // Create Task 2 under Goal 1 for User A
    const createTask2Res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        goalId: goal1Id,
        title: 'Learn useContext & custom hooks',
        dueDate: '2026-10-16',
        status: 'pending',
      });
    assert(createTask2Res.status === 201, 'Task 2 created for Goal 1');
    const task2Id = createTask2Res.body.task._id;

    // Check Goal 1 progress: 0 completed out of 2 tasks = 0%
    const goal1DetailsBefore = await request(app)
      .get(`/api/goals/${goal1Id}`)
      .set('Authorization', `Bearer ${tokenA}`);
    assert(goal1DetailsBefore.body.goal.progressPercentage === 0, 'Goal progress is 0% when both tasks are pending');
    assert(goal1DetailsBefore.body.tasks.length === 2, 'Goal details returns 2 tasks');

    // Mark Task 1 as completed
    const completeTask1Res = await request(app)
      .put(`/api/tasks/${task1Id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ status: 'completed' });
    assert(completeTask1Res.status === 200, 'Task 1 updated to completed');
    assert(completeTask1Res.body.task.completedAt !== null, 'completedAt timestamp set on task completion');

    // Check Goal 1 progress: 1 of 2 tasks completed = 50%
    const goal1DetailsAfter = await request(app)
      .get(`/api/goals/${goal1Id}`)
      .set('Authorization', `Bearer ${tokenA}`);
    assert(goal1DetailsAfter.body.goal.progressPercentage === 50, 'Goal progress recalculated dynamically to 50%');

    // Toggle Task 1 back to pending
    const revertTask1Res = await request(app)
      .put(`/api/tasks/${task1Id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ status: 'pending' });
    assert(revertTask1Res.body.task.completedAt === null, 'completedAt cleared when task reverts to pending');

    // Re-complete Task 1 for dashboard streak tests
    await request(app)
      .put(`/api/tasks/${task1Id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ status: 'completed' });

    // Cross-user test: User B cannot delete or modify User A task
    const crossDeleteTask = await request(app)
      .delete(`/api/tasks/${task1Id}`)
      .set('Authorization', `Bearer ${tokenB}`);
    assert(crossDeleteTask.status === 404, 'User B cannot delete User A task (Cross-user access denied)');

    // -------------------------------------------------------------------
    // 5. DASHBOARD STATS & LEARNING STREAK TESTS
    // -------------------------------------------------------------------
    console.log('\n--- 5. Dashboard Aggregations & Streak Calculations ---');

    const statsRes = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${tokenA}`);
    assert(statsRes.status === 200, 'GET /api/dashboard/stats returns 200');

    const { stats, recentTasks, upcomingDeadlines } = statsRes.body;
    assert(stats.goals.total === 2, 'Dashboard shows 2 total goals');
    assert(stats.tasks.total === 2, 'Dashboard shows 2 total tasks');
    assert(stats.tasks.completed === 1, 'Dashboard shows 1 completed task');
    assert(stats.tasks.pending === 1, 'Dashboard shows 1 pending task');
    assert(stats.tasks.completionPercentage === 50, 'Overall task completion rate is 50%');
    assert(stats.streak.currentStreak >= 1, 'Current learning streak is active (at least 1 day because task completed today)');
    assert(stats.streak.activeToday === true, 'activeToday flag is true');
    assert(recentTasks.length > 0, 'Returns list of recent tasks');
    assert(upcomingDeadlines.length > 0, 'Returns list of upcoming deadlines');

    // -------------------------------------------------------------------
    // 6. CASCADE DELETION TEST
    // -------------------------------------------------------------------
    console.log('\n--- 6. Cascade Goal Deletion ---');

    // Deleting Goal 1 should also remove Task 1 and Task 2
    const deleteGoalRes = await request(app)
      .delete(`/api/goals/${goal1Id}`)
      .set('Authorization', `Bearer ${tokenA}`);
    assert(deleteGoalRes.status === 200, 'Goal 1 deleted successfully');

    // Verify tasks associated with Goal 1 were cascade deleted
    const tasksAfterDelete = await request(app)
      .get(`/api/tasks?goalId=${goal1Id}`)
      .set('Authorization', `Bearer ${tokenA}`);
    assert(tasksAfterDelete.body.tasks.length === 0, 'Associated tasks cascade deleted when goal is deleted');

    // -------------------------------------------------------------------
    // 7. LOGOUT TEST
    // -------------------------------------------------------------------
    console.log('\n--- 7. Logout & Cookie Invalidation ---');

    const logoutRes = await request(app).post('/api/auth/logout');
    assert(logoutRes.status === 200, 'POST /api/auth/logout returns 200');
    const logoutCookie = logoutRes.headers['set-cookie'];
    assert(
      logoutCookie && logoutCookie.some((c) => c.includes('token=;') || c.includes('Expires=Thu, 01 Jan 1970')),
      'Logout clears authentication cookie'
    );
  } catch (error) {
    console.error('Unexpected test error occurred:', error);
    failedCount++;
  } finally {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }

  console.log('\n======================================================');
  console.log(`📊 Test Results: ${passedCount} Passed, ${failedCount} Failed`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();
