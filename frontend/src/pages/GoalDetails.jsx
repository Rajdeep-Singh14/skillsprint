import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Target,
  ArrowLeft,
  PlusCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Filter,
  AlertCircle,
  Check,
  ChevronDown,
} from 'lucide-react';
import api from '../services/api';
import ProgressBar from '../components/ProgressBar';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { formatDate, isOverdue, CATEGORY_META } from '../utils/formatters';

const GoalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Task Filter & Sort
  const [taskFilter, setTaskFilter] = useState('All'); // 'All' | 'pending' | 'completed'
  const [sortBy, setSortBy] = useState('dueDate_asc'); // 'dueDate_asc' | 'dueDate_desc'

  // Task Modal (Create & Edit)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSavingTask, setIsSavingTask] = useState(false);

  // Delete Confirmations
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  const [isDeletingGoal, setIsDeletingGoal] = useState(false);
  const [showDeleteGoalModal, setShowDeleteGoalModal] = useState(false);

  const fetchGoalData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/goals/${id}`);
      if (res.data.success) {
        setGoal(res.data.goal);
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load goal details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGoalData();
  }, [fetchGoalData]);

  // Handle task create or edit submission
  const handleTaskSubmit = async (taskData) => {
    setIsSavingTask(true);
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, taskData);
      } else {
        await api.post('/tasks', {
          ...taskData,
          goalId: id,
        });
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      await fetchGoalData(); // Refresh tasks & progress
    } catch (err) {
      alert(`Could not save task: ${err.message}`);
    } finally {
      setIsSavingTask(false);
    }
  };

  // Toggle single task completion
  const handleToggleTaskStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      await fetchGoalData();
    } catch (err) {
      alert(`Failed to update task status: ${err.message}`);
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeletingTask(true);
    try {
      await api.delete(`/tasks/${taskToDelete._id}`);
      setTaskToDelete(null);
      await fetchGoalData();
    } catch (err) {
      alert(`Failed to delete task: ${err.message}`);
    } finally {
      setIsDeletingTask(false);
    }
  };

  // Delete entire goal
  const handleDeleteGoal = async () => {
    setIsDeletingGoal(true);
    try {
      await api.delete(`/goals/${id}`);
      navigate('/goals');
    } catch (err) {
      alert(`Failed to delete goal: ${err.message}`);
      setIsDeletingGoal(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div className="spinner spinner-lg" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading goal details...</p>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertCircle size={40} color="var(--accent-rose)" style={{ marginBottom: '1rem' }} />
        <h3>Goal Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem' }}>{error || 'The requested goal could not be found or you do not have permission.'}</p>
        <Link to="/goals" className="btn btn-primary">
          Back to Goals
        </Link>
      </div>
    );
  }

  const catMeta = CATEGORY_META[goal.category] || CATEGORY_META.Other;
  const isGoalCompleted = goal.status === 'completed';

  // Filter & sort tasks in-memory
  const filteredTasks = tasks
    .filter((task) => {
      if (taskFilter === 'All') return true;
      return task.status === taskFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate_asc') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return new Date(b.dueDate) - new Date(a.dueDate);
    });

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/goals" className="btn btn-outline" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.8125rem' }}>
          <ArrowLeft size={16} /> Back to All Goals
        </Link>
      </div>

      {/* Goal Overview Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 68, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: catMeta.bgColor,
                  color: catMeta.color,
                  border: `1px solid ${catMeta.borderColor}`,
                }}
              >
                {catMeta.label}
              </span>
              <span className={`badge ${isGoalCompleted ? 'badge-completed' : 'badge-active'}`}>
                {isGoalCompleted ? 'Completed' : 'Active'}
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {goal.title}
            </h1>

            {goal.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                {goal.description}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} />
                <span>
                  <strong>Timeline:</strong> {formatDate(goal.startDate)} → {formatDate(goal.targetDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to={`/goals/${id}/edit`} className="btn btn-secondary" id="goal-edit-btn">
              <Edit size={16} /> Edit Goal
            </Link>
            <button
              onClick={() => setShowDeleteGoalModal(true)}
              className="btn btn-danger"
              id="goal-delete-btn"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        {/* Progress bar and statistics */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Overall Goal Progress: <strong style={{ color: 'var(--text-primary)' }}>{goal.completedTasks || 0}</strong> of{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{goal.totalTasks || 0}</strong> tasks completed
            </span>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {goal.progressPercentage || 0}%
            </span>
          </div>
          <ProgressBar percentage={goal.progressPercentage || 0} showLabel={false} height={10} />
        </div>
      </div>

      {/* Task Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700 }}>Daily Action Tasks</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
            Break down this goal into manageable daily study tasks.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          className="btn btn-primary"
          id="add-task-btn"
        >
          <PlusCircle size={18} /> Add Task
        </button>
      </div>

      {/* Filter and Sort Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '0.875rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
          {['All', 'pending', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setTaskFilter(status)}
              className={`btn ${taskFilter === status ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '4px 10px', fontSize: '0.75rem', textTransform: 'capitalize' }}
            >
              {status}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</span>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 'auto', padding: '4px 10px', fontSize: '0.75rem' }}
          >
            <option value="dueDate_asc">Earliest Due Date</option>
            <option value="dueDate_desc">Latest Due Date</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={Target}
          title={taskFilter !== 'All' ? `No ${taskFilter} tasks found` : 'No tasks created for this goal yet'}
          description={
            taskFilter !== 'All'
              ? 'Try switching to All to view tasks with different completion statuses.'
              : 'Add your first task like "Read Chapter 1" or "Solve 3 Practice Problems".'
          }
          actionLabel={taskFilter === 'All' ? 'Add First Task' : 'Show All Tasks'}
          onAction={() => {
            if (taskFilter === 'All') {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            } else {
              setTaskFilter('All');
            }
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} id="tasks-list">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const overdue = isOverdue(task.dueDate, task.status);

            return (
              <div
                key={task._id}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  border: isCompleted
                    ? '1px solid rgba(16, 185, 129, 0.2)'
                    : overdue
                    ? '1px solid rgba(244, 63, 94, 0.3)'
                    : '1px solid var(--border-subtle)',
                }}
              >
                {/* Left: Checkbox & Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: 0 }}>
                  <button
                    onClick={() => handleToggleTaskStatus(task)}
                    className="btn-icon"
                    style={{
                      marginTop: '2px',
                      color: isCompleted ? 'var(--accent-emerald)' : 'var(--text-muted)',
                      padding: '4px',
                    }}
                    title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                    aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={22} />
                    ) : (
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: '2px solid var(--text-muted)',
                        }}
                      />
                    )}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h4
                        style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </h4>
                      <span className={`badge ${isCompleted ? 'badge-completed' : overdue ? 'badge-overdue' : 'badge-pending'}`}>
                        {isCompleted ? 'Completed' : overdue ? 'Overdue' : 'Pending'}
                      </span>
                    </div>

                    {task.description && (
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-secondary)',
                          marginTop: '4px',
                          lineHeight: 1.4,
                        }}
                      >
                        {task.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> Due: {formatDate(task.dueDate)}
                      </span>
                      {isCompleted && task.completedAt && (
                        <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={13} /> Done on: {formatDate(task.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Task action buttons */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => {
                      setEditingTask(task);
                      setIsTaskModalOpen(true);
                    }}
                    className="btn-icon"
                    title="Edit task"
                    aria-label="Edit task"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setTaskToDelete(task)}
                    className="btn-icon"
                    style={{ color: 'var(--accent-rose)' }}
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        isLoading={isSavingTask}
        goalTitle={goal.title}
      />

      {/* Delete Task Confirmation Modal */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        title="Delete Task"
        message={`Are you sure you want to delete the task "${taskToDelete?.title}"?`}
        confirmText="Delete Task"
        onConfirm={handleDeleteTask}
        onCancel={() => setTaskToDelete(null)}
        isLoading={isDeletingTask}
      />

      {/* Delete Goal Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteGoalModal}
        title="Delete Learning Goal"
        message={`Are you sure you want to delete "${goal.title}"? All associated tasks will also be permanently deleted. This action cannot be undone.`}
        confirmText="Delete Goal"
        onConfirm={handleDeleteGoal}
        onCancel={() => setShowDeleteGoalModal(false)}
        isLoading={isDeletingGoal}
      />
    </div>
  );
};

export default GoalDetails;
