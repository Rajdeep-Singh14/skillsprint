import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <Compass size={36} />
      </div>

      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', marginBottom: '2rem' }}>
        The page you are looking for does not exist, has been removed, or is temporarily unavailable.
      </p>

      <Link to="/dashboard" className="btn btn-primary" id="not-found-home-btn">
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
