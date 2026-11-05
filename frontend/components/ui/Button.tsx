'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className = '',
      ...props
    },
    ref
  ) => {
    const showLoading = isLoading || loading;
    // Base styles
    let baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

    // Variant styles
    let variantStyles = '';
    switch (variant) {
      case 'primary':
        variantStyles =
          'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus-visible:ring-indigo-500 shadow-sm dark:bg-indigo-600 dark:hover:bg-indigo-500';
        break;
      case 'secondary':
        variantStyles =
          'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';
        break;
      case 'outline':
        variantStyles =
          'border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/80';
        break;
      case 'ghost':
        variantStyles =
          'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200 focus-visible:ring-slate-400 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60';
        break;
      case 'destructive':
        variantStyles =
          'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-500 shadow-sm dark:bg-rose-600 dark:hover:bg-rose-500';
        break;
      case 'icon':
        variantStyles =
          'text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400 rounded-lg p-2 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800';
        break;
    }

    // Size styles
    let sizeStyles = '';
    if (variant === 'icon') {
      sizeStyles = 'p-2';
    } else {
      switch (size) {
        case 'sm':
          sizeStyles = 'text-xs px-2.5 py-1.5 gap-1.5';
          break;
        case 'md':
          sizeStyles = 'text-sm px-3.5 py-2 gap-2';
          break;
        case 'lg':
          sizeStyles = 'text-base px-5 py-2.5 gap-2.5';
          break;
      }
    }

    return (
      <button
        ref={ref}
        disabled={disabled || showLoading}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {showLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

