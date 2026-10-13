import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  CheckCircle2,
  Clock,
  Flame,
  ListTodo,
  TrendingUp,
  PlusCircle,
  Calendar,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import { formatDate, isOverdue } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchDashboardStats = useCallback(async () => {
    try {
      // Pass client timezone for accurate calendar streak calculation
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await api.get(`/dashboard/stats?timezone=${encodeURIComponent(timeZone)}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Quick toggle task completion directly from dashboard
  const handleToggleTask = async (task) => {
    setActionLoadingId(task._id);
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      // Refresh dashboard statistics and streak
      await fetchDashboardStats();
    } catch (err) {
      alert(`Could not update task: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading your learning dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertCircle size={40} color="var(--accent-rose)" style={{ marginBottom: '1rem' }} />
        <h3>Unable to load dashboard</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem' }}>{error}</p>
        <button onClick={fetchDashboardStats} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const { stats, recentTasks, upcomingDeadlines } = data || {};
  const currentStreak = stats?.streak?.currentStreak || 0;
  const activeToday = stats?.streak?.activeToday || false;

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 68, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <Sparkles size={14} /> Ready for today's learning
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            {activeToday
              ? "Awesome job! You've completed a task today and your streak is actively glowing."
              : 'Keep up the momentum: complete a daily task to maintain your learning streak!'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/goals/create" className="btn btn-primary" id="dashboard-create-goal-btn">
            <PlusCircle size={18} /> New Learning Goal
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Learning Streak Card */}
        <div
          className="glass-panel card-interactive"
          id="metric-streak-card"
          style={{
            padding: '1.25rem',
            border: activeToday ? '1px solid rgba(245, 158, 11, 0.4)' : undefined,
            boxShadow: activeToday ? '0 0 20px -5px rgba(245, 158, 11, 0.3)' : undefined,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Learning Streak
            </span>
            <div
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-amber)',
                display: 'flex',
              }}
            >
              <Flame size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {currentStreak}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {currentStreak === 1 ? 'Day' : 'Days'}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: activeToday ? 'var(--accent-amber)' : 'var(--text-muted)', marginTop: '0.375rem' }}>
            {activeToday ? '🔥 Streak active today!' : 'Complete 1 task to extend streak'}
          </p>
        </div>

        {/* Total Goals */}
        <MetricCard
          id="metric-goals-card"
          title="Learning Goals"
          value={stats?.goals?.total || 0}
          subtext={`${stats?.goals?.active || 0} Active • ${stats?.goals?.completed || 0} Completed`}
          icon={Target}
          accentColor="#6366f1"
        />

        {/* Tasks Overview */}
        <MetricCard
          id="metric-tasks-card"
          title="Daily Tasks"
          value={stats?.tasks?.total || 0}
          subtext={`${stats?.tasks?.completed || 0} Done • ${stats?.tasks?.pending || 0} Pending`}
          icon={ListTodo}
          accentColor="#06b6d4"
        />

        {/* Task Completion % */}
        <div className="glass-panel card-interactive" id="metric-completion-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Completion Rate
            </span>
            <div
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                display: 'flex',
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats?.tasks?.completionPercentage || 0}%
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <ProgressBar percentage={stats?.tasks?.completionPercentage || 0} showLabel={false} height={6} />
          </div>
        </div>
      </div>

      {/* Two-Column Section: Upcoming Deadlines & Recent Tasks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Upcoming Deadlines */}
        <div className="glass-panel" style={{ padding: '1.5rem' }} id="dashboard-upcoming-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--accent-amber)" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Upcoming Deadlines</h2>
            </div>
            <Link to="/goals" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All Goals
            </Link>
          </div>

          {!upcomingDeadlines || upcomingDeadlines.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No pending deadlines"
              description="You have completed all pending tasks or haven't scheduled any upcoming tasks yet."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingDeadlines.map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);
                return (
                  <div
                    key={task._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'var(--transition)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <button
                        onClick={() => handleToggleTask(task)}
                        disabled={actionLoadingId === task._id}
                        className="btn-icon"
                        style={{ color: 'var(--text-muted)', padding: '4px' }}
                        title="Mark complete"
                      >
                        {actionLoadingId === task._id ? (
                          <div className="spinner" style={{ width: '16px', height: '16px' }} />
                        ) : (
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              border: '2px solid var(--text-muted)',
                            }}
                          />
                        )}
                      </button>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {task.title}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {task.goalId?.title || 'Learning Goal'}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                      <span className={`badge ${overdue ? 'badge-overdue' : 'badge-pending'}`}>
                        {overdue ? 'Overdue' : formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="glass-panel" style={{ padding: '1.5rem' }} id="dashboard-recent-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListTodo size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Tasks</h2>
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Latest Activity</span>
          </div>

          {!recentTasks || recentTasks.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No tasks created yet"
              description="Create your first learning goal and break it down into daily actionable tasks."
              actionLabel="Create a Goal"
              onAction={() => window.location.assign('/goals/create')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <button
                        onClick={() => handleToggleTask(task)}
                        disabled={actionLoadingId === task._id}
                        className="btn-icon"
                        style={{
                          color: isCompleted ? 'var(--accent-emerald)' : 'var(--text-muted)',
                          padding: '4px',
                        }}
                        title={isCompleted ? 'Mark pending' : 'Mark completed'}
                      >
                        {actionLoadingId === task._id ? (
                          <div className="spinner" style={{ width: '16px', height: '16px' }} />
                        ) : isCompleted ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              border: '2px solid var(--text-muted)',
                            }}
                          />
                        )}
                      </button>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {task.title}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {task.goalId?.title || 'Learning Goal'}
                        </p>
                      </div>
                    </div>

                    <div style={{ flexShrink: 0, marginLeft: '12px' }}>
                      <span className={`badge ${isCompleted ? 'badge-completed' : 'badge-pending'}`}>
                        {isCompleted ? 'Done' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
