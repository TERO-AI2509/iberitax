'use client';

import { useEffect, useState, useCallback } from 'react';

type Toast = { id: number; message: string };

export default function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const detail = (e as CustomEvent).detail as { id: number; message: string };
      if (detail?.message) setToasts((ts) => [...ts, { id: detail.id, message: detail.message }]);
    }
    window.addEventListener('toast', onToast);
    return () => window.removeEventListener('toast', onToast);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reason') === 'expired') {
      setToasts((ts) => [...ts, { id: Date.now(), message: 'Session expired, please log in again.' }]);
    }
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => setTimeout(() => dismiss(t.id), 4000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  if (!toasts.length) return null;

  return (
    <div style={{ position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)', maxWidth: '90%', zIndex: 1000 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ background: 'rgba(20,20,20,0.95)', color: 'white', padding: '10px 14px', borderRadius: '10px', boxShadow: '0 6px 18px rgba(0,0,0,0.25)', marginTop: '8px', fontSize: '14px' }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
