import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'purple';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    info: 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    success: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    danger: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
    purple: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
  }[variant];

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide transition-colors ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

