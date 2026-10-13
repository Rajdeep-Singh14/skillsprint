import React from 'react';

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-medium)',
        background: 'rgba(15, 23, 42, 0.4)',
      }}
    >
      {Icon && (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            marginBottom: '1rem',
          }}
        >
          <Icon size={28} />
        </div>
      )}
      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.375rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '420px', marginBottom: actionLabel ? '1.25rem' : 0 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary" id="empty-state-action-btn">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
