# SkillSprint — Personal Learning Management System

> **A modern MERN stack web application designed to help students set learning goals, break them down into daily actionable tasks, monitor real-time progress, and build consistent daily learning streaks.**

---

## 🌟 Key Features

1. **Secure Authentication & User Isolation:**
   - User registration with validation and duplicate email prevention.
   - Passwords hashed using **bcryptjs** (10 salt rounds); plain-text passwords are never saved.
   - **JWT-based authentication** using secure HttpOnly cookies with Authorization Bearer header fallback.
   - User identity derived strictly from verified tokens — cross-user data tampering is strictly blocked.

2. **Goal Management (CRUD):**
   - Create, view, edit, and delete learning goals with category tags (*Programming, Web Development, Computer Science, Communication, Other*).
   - Date range validation ensuring target completion dates are on or after start dates.
   - Real-time search by goal title and filtering by category and status.
   - Cascade deletion: deleting a goal automatically cleans up all associated tasks.

3. **Daily Task Management & Dynamic Progress:**
   - Create tasks under specific learning goals with due dates and descriptions.
   - Mark tasks completed or pending with dynamic `completedAt` timestamp tracking.
   - Dynamic progress percentage: `(Completed Tasks / Total Tasks) × 100`.
   - Division-by-zero protection: goals with 0 tasks safely display `0%` progress without NaN errors.
   - Overdue deadline alerts for pending tasks past their due date.

4. **Learning Streak Engine:**
   - Calculates consecutive calendar days with completed study activity.
   - Accounts for user local calendar dates and timezones.
   - Streak remains alive if completed today OR yesterday (giving the user time to complete today's task before midnight).
   - Streak breaks to 0 if 2 or more consecutive calendar days have elapsed without activity.

5. **Personalized Analytics Dashboard:**
   - Total, active, and completed goal metrics.
   - Total, completed, and pending task counters.
   - Overall task completion rate with visual progress indicator.
   - Active learning streak counter with glowing flame indicator.
   - Quick-toggle recent tasks and upcoming deadlines.

6. **Responsive UI & Aesthetics:**
   - Sleek dark slate aesthetic with Plus Jakarta Sans typography, glassmorphism panels, and smooth micro-interactions.
   - Desktop sidebar navigation and mobile-responsive drawer menu.
   - Accessible confirmation dialogs for destructive actions (deleting goals or tasks).

---

## 🏗️ Project Architecture

```
SkillSprint/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB Atlas & Mongoose connection
│   │   ├── controllers/     # Express route handlers (auth, goals, tasks, dashboard)
│   │   ├── middleware/      # JWT auth protection & centralized error handling
│   │   ├── models/          # Mongoose schemas (User, Goal, Task) with indexes
│   │   ├── routes/          # Express API route declarations
│   │   ├── services/        # Learning streak calculation service
│   │   ├── utils/           # JWT generation & cookie helpers
│   │   ├── app.js           # Express app setup & CORS configuration
│   │   └── server.js        # Server listener entry point
│   ├── tests/
│   │   ├── run-tests.js     # 52 integration tests with In-Memory MongoDB
│   │   └── streak-unit-test.js # Streak calendar boundary tests
│   ├── .env.example         # Backend environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # MetricCard, ProgressBar, ConfirmModal, TaskModal, EmptyState
│   │   ├── context/         # AuthContext (login, register, logout, session restoration)
│   │   ├── layouts/         # AppLayout with desktop sidebar and responsive mobile menu
│   │   ├── pages/           # Login, Register, Dashboard, GoalsList, CreateGoal, EditGoal, GoalDetails, Profile, NotFound
│   │   ├── services/        # Centralized Axios client (api.js) with credentials
│   │   ├── utils/           # Date formatters, category color tokens, overdue checks
│   │   ├── App.jsx          # React Router configuration & ProtectedRoute guards
│   │   ├── index.css        # Vanilla CSS design system
│   │   └── main.jsx
│   ├── .env.example         # Frontend environment template
│   └── package.json
├── .gitignore
├── package.json             # Root convenience scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ (tested on v24)
- **npm** v9+

### 1. Installation

From the project root:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## ⚙️ Environment Configuration

### Backend Setup (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:
```bash
cd backend
cp .env.example .env
```

Configure your variables:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long

# MongoDB Atlas Cloud Database Connection String:
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/skillsprint?retryWrites=true&w=majority
```

> **Note on Zero-Config Development Preview:**  
> If you start the backend before adding your MongoDB Atlas URI, the application automatically launches a temporary in-memory MongoDB database so you can preview and test all features immediately! To persist records across restarts, configure your MongoDB Atlas URI.

### Frontend Setup (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:
```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## ☁️ How to Configure MongoDB Atlas

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Create a free **M0 Sandbox Cluster**.
3. Under **Security → Database Access**:
   - Create a database user with **Read and write to any database** privileges.
   - Note down the username and password.
4. Under **Security → Network Access**:
   - Click **Add IP Address** → Choose **Allow Access from Anywhere (`0.0.0.0/0`)** or add your current IP address.
5. Under **Deployment → Database**:
   - Click **Connect** → Choose **Drivers (Node.js)**.
   - Copy the connection string and replace `<password>` with your database user password and database name with `skillsprint`.
   - Paste the string into `backend/.env` under `MONGODB_URI`.

---

## 🖥️ Running the Application

### Option A: Run Both Simultaneously (Recommended)

In Terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

In Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Client starts at http://localhost:5173
```

---

## 🧪 Running Automated Tests

SkillSprint includes a full integration and unit test suite that tests all API routes, database schemas, password hashing, cross-user isolation, division-by-zero handling, and learning streaks:

```bash
cd backend
npm test
```

### Test Results:
- **52 Integration Tests** (`backend/tests/run-tests.js`): **52 Passed, 0 Failed**
  - Registration validations & password hashing
  - Duplicate email rejection
  - JWT token verification and protected route access
  - Cross-user authorization isolation (User B cannot read/modify User A's data)
  - Goal CRUD and date order constraints (`targetDate >= startDate`)
  - Task completion toggling and `completedAt` timestamp updates
  - Cascade goal deletion (removing a goal deletes its tasks)
  - Division-by-zero protection on goals with 0 tasks
  - Dashboard statistics and learning streak engine
- **7 Unit Tests** (`backend/tests/streak-unit-test.js`): **7 Passed, 0 Failed**
  - Boundary calendar test for streak counting across timezones and multi-day gaps

---

## 📊 Learning Streak Algorithm

The streak calculation logic (`backend/src/services/streakService.js`) works as follows:
1. Queries distinct calendar dates (`YYYY-MM-DD`) on which the authenticated user completed at least one task (`status = 'completed'` and `completedAt != null`).
2. Compares against **Today** and **Yesterday** in the user's local timezone:
   - **Case 1 (Completed Today):** Streak is active today. Consecutive days are counted backwards starting from today (today, yesterday, day - 2, etc.).
   - **Case 2 (Completed Yesterday, Pending Today):** The streak is still alive! The user has until midnight to complete a task. Streak is counted backwards starting from yesterday.
   - **Case 3 (Gap of 2+ days):** The streak has broken. Returns `0`.
3. Multiple tasks completed on the same calendar day count as a single active day.

---

## 🛡️ Viva / Academic Explanation Guide

- **Why bcryptjs?** Uses adaptive salted hashing (`bcrypt.genSalt(10)`). Protects passwords against rainbow table and dictionary attacks.
- **Why HttpOnly Cookies + Bearer Token fallback?** HttpOnly prevents client-side JavaScript from accessing cookies (mitigating XSS theft), while the Authorization Bearer fallback ensures API clients and automated tests work seamlessly.
- **Why Mongoose Schemas & Indexes?** Indexed queries on `{ userId: 1, status: 1 }` and `{ userId: 1, goalId: 1 }` ensure $O(1)$ and logarithmic lookup times as data scales.
- **Why Centralized Axios Client?** Interceptors automatically normalize error responses and handle session expirations in a single place without duplicate code across React components.
