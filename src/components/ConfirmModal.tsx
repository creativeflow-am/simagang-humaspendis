import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Ya, Lanjutkan', 
  cancelText = 'Batal',
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'var(--bg)',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: type === 'danger' ? '#fef2f2' : type === 'warning' ? '#fffbeb' : '#f0fdfa',
            color: type === 'danger' ? '#ef4444' : type === 'warning' ? '#f59e0b' : 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span className="material-symbols-outlined">
              {type === 'danger' ? 'warning' : type === 'warning' ? 'error' : 'info'}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text)' }}>{title}</h3>
        </div>
        
        <p style={{ color: 'var(--text-light)', fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button 
            onClick={onCancel}
            className="btn btn-secondary" 
            style={{ padding: '8px 16px', fontSize: 14 }}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="btn"
            style={{ 
              padding: '8px 16px', fontSize: 14, border: 'none', borderRadius: 8, cursor: 'pointer',
              fontWeight: 500,
              background: type === 'danger' ? '#ef4444' : 'var(--primary)',
              color: 'white'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
