import React from 'react';

const MetricCard = ({ title, value, subtext, icon: Icon, accentColor = '#6366f1', id }) => {
  return (
    <div
      id={id}
      className="glass-panel card-interactive"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative subtle background radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: accentColor,
          opacity: 0.12,
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: `${accentColor}20`,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
          {value}
        </div>
        {subtext && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
