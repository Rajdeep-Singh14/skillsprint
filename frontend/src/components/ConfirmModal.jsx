import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = true,
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} id="confirm-modal-backdrop">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isDangerous && (
              <div
                style={{
                  padding: '8px',
                  borderRadius: '50%',
                  background: 'rgba(244, 63, 94, 0.15)',
                  color: 'var(--accent-rose)',
                  display: 'flex',
                }}
              >
                <AlertTriangle size={20} />
              </div>
            )}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="btn-icon"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
            id="confirm-modal-cancel-btn"
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
            id="confirm-modal-submit-btn"
          >
            {isLoading ? <div className="spinner" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
