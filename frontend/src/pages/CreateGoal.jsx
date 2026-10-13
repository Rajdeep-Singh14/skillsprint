import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Target, ArrowLeft, Calendar, Save, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { GOAL_CATEGORIES, toInputDateFormat } from '../utils/formatters';

const CreateGoal = () => {
  const navigate = useNavigate();

  const todayStr = toInputDateFormat(new Date());
  // Default target date: 30 days from now
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  const defaultTargetStr = toInputDateFormat(thirtyDaysLater);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Programming');
  const [startDate, setStartDate] = useState(todayStr);
  const [targetDate, setTargetDate] = useState(defaultTargetStr);
  const [status, setStatus] = useState('active');

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Goal title is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!targetDate) newErrors.targetDate = 'Target completion date is required';

    if (startDate && targetDate && new Date(targetDate) < new Date(startDate)) {
      newErrors.targetDate = 'Target date must be on or after start date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/goals', {
        title: title.trim(),
        description: description.trim(),
        category,
        startDate,
        targetDate,
        status,
      });

      if (res.data.success) {
        navigate(`/goals/${res.data.goal._id}`);
      }
    } catch (err) {
      setServerError(err.message || 'Failed to create goal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/goals" className="btn btn-outline" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.8125rem' }}>
          <ArrowLeft size={16} /> Back to Goals
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary)',
            }}
          >
            <Target size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create Learning Goal</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Define what you want to achieve and set a realistic target date.
            </p>
          </div>
        </div>

        {serverError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} id="create-goal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="goal-title">
              Goal Title *
            </label>
            <input
              id="goal-title"
              type="text"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. Learn Java in 30 Days"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="goal-category">
              Category *
            </label>
            <select
              id="goal-category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
            >
              {GOAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="goal-description">
              Description (Optional)
            </label>
            <textarea
              id="goal-description"
              className="form-textarea"
              placeholder="What are your objectives? What resources or syllabus will you follow?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="goal-start-date">
                Start Date *
              </label>
              <input
                id="goal-start-date"
                type="date"
                className={`form-input ${errors.startDate ? 'input-error' : ''}`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="goal-target-date">
                Target Date *
              </label>
              <input
                id="goal-target-date"
                type="date"
                className={`form-input ${errors.targetDate ? 'input-error' : ''}`}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                disabled={isLoading}
              />
              {errors.targetDate && <span className="error-text">{errors.targetDate}</span>}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label">Initial Status</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                />
                Active
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="radio"
                  name="status"
                  value="completed"
                  checked={status === 'completed'}
                  onChange={() => setStatus('completed')}
                />
                Completed
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/goals')}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              id="goal-submit-btn"
            >
              {isLoading ? <div className="spinner" /> : <><Save size={18} /> Create Goal</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGoal;
