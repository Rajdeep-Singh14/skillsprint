import React from 'react';

const ProgressBar = ({ percentage = 0, showLabel = true, height = 8, color }) => {
  const safePercentage = Math.min(100, Math.max(0, isNaN(percentage) ? 0 : percentage));

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.8125rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Progress</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {safePercentage}%
          </span>
        </div>
      )}
      <div
        className="progress-container"
        style={{ height: `${height}px` }}
        role="progressbar"
        aria-valuenow={safePercentage}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="progress-fill"
          style={{
            width: `${safePercentage}%`,
            ...(color && { background: color }),
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
