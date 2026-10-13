import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { toInputDateFormat } from '../utils/formatters';

const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
  goalTitle = '',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setDueDate(toInputDateFormat(initialData.dueDate));
      setStatus(initialData.status || 'pending');
    } else {
      setTitle('');
      setDescription('');
      // Default due date to today
      setDueDate(toInputDateFormat(new Date()));
      setStatus('pending');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    }
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      status,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose} id="task-modal-backdrop">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {initialData ? 'Edit Task' : 'Add New Task'}
            </h3>
            {goalTitle && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Under goal: <strong style={{ color: 'var(--text-primary)' }}>{goalTitle}</strong>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-icon"
            aria-label="Close dialog"
            id="task-modal-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title *
            </label>
            <input
              id="task-title"
              type="text"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. Read Chapter 3 on Polymorphism"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">
              Description (Optional)
            </label>
            <textarea
              id="task-desc"
              className="form-textarea"
              placeholder="Add key notes, resources, or checkboxes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-due-date">
              Due Date *
            </label>
            <input
              id="task-due-date"
              type="date"
              className={`form-input ${errors.dueDate ? 'input-error' : ''}`}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isLoading}
            />
            {errors.dueDate && <span className="error-text">{errors.dueDate}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`btn ${status === 'pending' ? 'btn-secondary' : 'btn-outline'}`}
                style={{
                  border: status === 'pending' ? '1px solid var(--accent-amber)' : undefined,
                  color: status === 'pending' ? 'var(--accent-amber)' : undefined,
                }}
              >
                <Clock size={16} /> Pending
              </button>
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`btn ${status === 'completed' ? 'btn-secondary' : 'btn-outline'}`}
                style={{
                  border: status === 'completed' ? '1px solid var(--accent-emerald)' : undefined,
                  color: status === 'completed' ? 'var(--accent-emerald)' : undefined,
                }}
              >
                <CheckCircle2 size={16} /> Completed
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
              id="task-modal-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              id="task-modal-submit-btn"
            >
              {isLoading ? <div className="spinner" /> : initialData ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
