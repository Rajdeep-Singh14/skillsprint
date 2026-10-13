import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Target, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { GOAL_CATEGORIES, toInputDateFormat } from '../utils/formatters';

const EditGoal = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Programming');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState('active');

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const res = await api.get(`/goals/${id}`);
        if (res.data.success) {
          const g = res.data.goal;
          setTitle(g.title);
          setDescription(g.description || '');
          setCategory(g.category);
          setStartDate(toInputDateFormat(g.startDate));
          setTargetDate(toInputDateFormat(g.targetDate));
          setStatus(g.status);
        }
      } catch (err) {
        setServerError(err.message || 'Failed to load goal details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoal();
  }, [id]);

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

    setIsSubmitting(true);
    try {
      const res = await api.put(`/goals/${id}`, {
        title: title.trim(),
        description: description.trim(),
        category,
        startDate,
        targetDate,
        status,
      });

      if (res.data.success) {
        navigate(`/goals/${id}`);
      }
    } catch (err) {
      setServerError(err.message || 'Failed to update goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div className="spinner spinner-lg" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading goal...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/goals/${id}`} className="btn btn-outline" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.8125rem' }}>
          <ArrowLeft size={16} /> Back to Goal Details
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
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Edit Learning Goal</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Update your milestones, timelines, and goal status.
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

        <form onSubmit={handleSubmit} id="edit-goal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-goal-title">
              Goal Title *
            </label>
            <input
              id="edit-goal-title"
              type="text"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-goal-category">
              Category *
            </label>
            <select
              id="edit-goal-category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
            >
              {GOAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-goal-description">
              Description (Optional)
            </label>
            <textarea
              id="edit-goal-description"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-goal-start-date">
                Start Date *
              </label>
              <input
                id="edit-goal-start-date"
                type="date"
                className={`form-input ${errors.startDate ? 'input-error' : ''}`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-goal-target-date">
                Target Date *
              </label>
              <input
                id="edit-goal-target-date"
                type="date"
                className={`form-input ${errors.targetDate ? 'input-error' : ''}`}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.targetDate && <span className="error-text">{errors.targetDate}</span>}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label">Goal Status</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="radio"
                  name="edit-status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                />
                Active
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="radio"
                  name="edit-status"
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
              onClick={() => navigate(`/goals/${id}`)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              id="edit-goal-submit-btn"
            >
              {isSubmitting ? <div className="spinner" /> : <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGoal;
