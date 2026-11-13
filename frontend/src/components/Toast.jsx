import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className={`toast-notification ${toast.type || 'info'}`}>
      <div className="toast-icon-box">
        {isSuccess && <CheckCircle2 size={20} />}
        {isError && <AlertCircle size={20} />}
        {!isSuccess && !isError && <Info size={20} />}
      </div>
      <div className="toast-message-box">
        {toast.title && <strong className="toast-title">{toast.title}</strong>}
        <span className="toast-text">{toast.message}</span>
      </div>
      <button className="toast-close-btn" onClick={onClose} aria-label="Dismiss toast">
        <X size={16} />
      </button>
    </div>
  );
}
