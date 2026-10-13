import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Target,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { formatDate, CATEGORY_META, GOAL_CATEGORIES } from '../utils/formatters';

const GoalsList = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Delete Confirmation State
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await api.get('/goals', { params });
      if (res.data.success) {
        setGoals(res.data.goals);
      }
    } catch (err) {
      setError(err.message || 'Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedStatus]);

  useEffect(() => {
    // Debounce search/filter requests slightly
    const timer = setTimeout(() => {
      fetchGoals();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchGoals]);

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/goals/${goalToDelete._id}`);
      setGoals((prev) => prev.filter((g) => g._id !== goalToDelete._id));
      setGoalToDelete(null);
    } catch (err) {
      alert(`Failed to delete goal: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Header with Title and Create Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Learning Goals</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Track and master your skills one sprint at a time.
          </p>
        </div>
        <Link to="/goals/create" className="btn btn-primary" id="goals-create-btn">
          <PlusCircle size={18} /> New Learning Goal
        </Link>
      </div>

      {/* Filter and Search Controls */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        {/* Search Input */}
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search goals by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px' }}
            id="goals-search-input"
          />
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
        </div>

        {/* Category Select */}
        <div style={{ flex: '0 1 180px' }}>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            id="goals-category-select"
          >
            <option value="All">All Categories</option>
            {GOAL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Select */}
        <div style={{ flex: '0 1 160px' }}>
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            id="goals-status-select"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Goals Grid or Empty State */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div className="spinner spinner-lg" />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading goals...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <AlertCircle size={36} color="var(--accent-rose)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button onClick={fetchGoals} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All' ? 'No matching goals found' : 'No learning goals yet'}
          description={
            searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All'
              ? 'Try modifying your search or filter criteria to find what you are looking for.'
              : 'Set your first learning goal, such as "Learn React in 30 Days", and break it down into daily tasks!'
          }
          actionLabel={searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All' ? 'Clear Filters' : 'Create First Goal'}
          onAction={() => {
            if (searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All') {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedStatus('All');
            } else {
              navigate('/goals/create');
            }
          }}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}
          id="goals-grid"
        >
          {goals.map((goal) => {
            const catMeta = CATEGORY_META[goal.category] || CATEGORY_META.Other;
            const isCompleted = goal.status === 'completed';

            return (
              <div
                key={goal._id}
                className="glass-panel card-interactive"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                }}
              >
                {/* Top: Category & Status */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: catMeta.bgColor,
                        color: catMeta.color,
                        border: `1px solid ${catMeta.borderColor}`,
                      }}
                    >
                      {catMeta.label}
                    </span>
                    <span className={`badge ${isCompleted ? 'badge-completed' : 'badge-active'}`}>
                      {isCompleted ? 'Completed' : 'Active'}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      marginBottom: '0.5rem',
                      lineHeight: 1.3,
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/goals/${goal._id}`)}
                  >
                    {goal.title}
                  </h3>

                  {goal.description && (
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {goal.description}
                    </p>
                  )}

                  {/* Dates */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <Calendar size={14} />
                    <span>
                      {formatDate(goal.startDate)} → {formatDate(goal.targetDate)}
                    </span>
                  </div>
                </div>

                {/* Middle: Progress Bar & Task Count */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Tasks: <strong style={{ color: 'var(--text-primary)' }}>{goal.completedTasks || 0}</strong> / {goal.totalTasks || 0}
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                      {goal.progressPercentage || 0}%
                    </span>
                  </div>
                  <ProgressBar percentage={goal.progressPercentage || 0} showLabel={false} height={8} />
                </div>

                {/* Bottom: Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <Link
                    to={`/goals/${goal._id}`}
                    className="btn btn-outline"
                    style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                  >
                    View Tasks <ExternalLink size={14} />
                  </Link>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Link
                      to={`/goals/${goal._id}/edit`}
                      className="btn-icon"
                      title="Edit Goal"
                      aria-label="Edit Goal"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => setGoalToDelete(goal)}
                      className="btn-icon"
                      style={{ color: 'var(--accent-rose)' }}
                      title="Delete Goal"
                      aria-label="Delete Goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!goalToDelete}
        title="Delete Learning Goal"
        message={`Are you sure you want to delete "${goalToDelete?.title}"? All associated tasks will also be permanently deleted. This action cannot be undone.`}
        confirmText="Delete Goal"
        onConfirm={handleDeleteGoal}
        onCancel={() => setGoalToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default GoalsList;
