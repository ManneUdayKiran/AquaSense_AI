import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export default function ConfirmDeleteModal({
  isOpen,
  title = "Delete Observation?",
  observationId,
  locationName,
  description,
  isDeleting,
  onConfirm,
  onCancel
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Lock body scrolling when modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the modal for keyboard accessibility
    if (modalRef.current) {
      modalRef.current.focus();
    }

    // Handle Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={isDeleting ? undefined : onCancel}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
        animation: 'fadeInOverlay 0.2s ease-out'
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '500px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.95)',
          borderRadius: '18px',
          border: '1px solid rgba(244, 63, 94, 0.45)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(244, 63, 94, 0.2)',
          padding: '28px',
          position: 'relative',
          outline: 'none',
          animation: 'popInModal 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fb7185',
            flexShrink: 0
          }}>
            <Trash2 size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
              {title}
            </h3>
            {observationId && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ID: {observationId}
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '12px',
          padding: '14px 16px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: '20px'
        }}>
          {locationName && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Location Reach</span>
              <p style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600, margin: '2px 0 0 0' }}>
                📍 {locationName}
              </p>
            </div>
          )}
          {description && (
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Field Note</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0', fontStyle: 'italic', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                "{description}"
              </p>
            </div>
          )}
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 24px 0' }}>
          Are you sure you want to permanently delete this observation? This action cannot be undone and will erase the photographic telemetry, AI assessment recommendations, and audit logs.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="btn btn-secondary"
            style={{ fontSize: '0.86rem', padding: '9px 18px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="btn btn-danger"
            style={{
              fontSize: '0.86rem',
              padding: '9px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
              borderColor: '#e11d48',
              boxShadow: '0 0 15px rgba(225, 29, 72, 0.4)'
            }}
          >
            <Trash2 size={16} />
            <span>{isDeleting ? 'Deleting Record...' : 'Delete Permanently'}</span>
          </button>
        </div>

      </div>

      {/* Embedded Animations */}
      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popInModal {
          from { opacity: 0; transform: scale(0.92) translateY(14px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
