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
      'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.99]';

    // Variant styles
    let variantStyles = '';
    switch (variant) {
      case 'primary':
        variantStyles =
          'bg-gradient-to-r from-[#782BDB] via-[#8B24D6] to-[#A855F7] hover:from-[#6722BF] hover:via-[#7820BD] hover:to-[#9333EA] text-white shadow-md shadow-purple-950/40 border border-purple-300/30 focus-visible:ring-purple-500';
        break;
      case 'secondary':
        variantStyles =
          'bg-slate-100 dark:bg-[#1A0D30] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#251342] border border-slate-200 dark:border-purple-800/40 focus-visible:ring-purple-400';
        break;
      case 'outline':
        variantStyles =
          'border border-slate-300 dark:border-purple-500/30 text-slate-700 dark:text-purple-100 bg-white/50 dark:bg-[#120924]/60 hover:bg-slate-50 dark:hover:bg-[#1A0D30] hover:border-slate-400 dark:hover:border-purple-400/60 focus-visible:ring-purple-500 shadow-2xs';
        break;
      case 'ghost':
        variantStyles =
          'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-purple-950/40 focus-visible:ring-purple-400';
        break;
      case 'destructive':
        variantStyles =
          'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-sm shadow-rose-600/25 border border-rose-500/30 focus-visible:ring-rose-500';
        break;
      case 'icon':
        variantStyles =
          'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-purple-950/50 focus-visible:ring-purple-400 rounded-xl p-2';
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
        aria-busy={showLoading}
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

