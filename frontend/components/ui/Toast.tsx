'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (options: { type?: 'success' | 'error' | 'warning' | 'info'; title?: string; message: string; duration?: number }) => void;
  addToast: (options: { type?: 'success' | 'error' | 'warning' | 'info'; title?: string; message: string; duration?: number }) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }: { type?: 'success' | 'error' | 'warning' | 'info'; title?: string; message: string; duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
      toast({ type, message });
    },
    [toast]
  );
  const success = useCallback((message: string, title?: string) => toast({ type: 'success', message, title }), [toast]);
  const error = useCallback((message: string, title?: string) => toast({ type: 'error', message, title }), [toast]);
  const warning = useCallback((message: string, title?: string) => toast({ type: 'warning', message, title }), [toast]);
  const info = useCallback((message: string, title?: string) => toast({ type: 'info', message, title }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, addToast: toast, showToast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let Icon = Info;
          let borderClass = 'border-slate-200 dark:border-slate-800';
          let bgClass = 'bg-white dark:bg-slate-900';
          let iconColor = 'text-blue-500';

          if (t.type === 'success') {
            Icon = CheckCircle2;
            iconColor = 'text-emerald-500';
            borderClass = 'border-emerald-200 dark:border-emerald-900/60';
          } else if (t.type === 'error') {
            Icon = AlertCircle;
            iconColor = 'text-rose-500';
            borderClass = 'border-rose-200 dark:border-rose-900/60';
          } else if (t.type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'text-amber-500';
            borderClass = 'border-amber-200 dark:border-amber-900/60';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-xl border ${borderClass} ${bgClass} shadow-lg shadow-black/5 flex items-start gap-3 transition-all duration-200`}
              role="alert"
            >
              <Icon className={`w-5 h-5 shrink-0 ${iconColor} mt-0.5`} />
              <div className="flex-1 text-xs">
                {t.title && <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-0.5">{t.title}</h4>}
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

