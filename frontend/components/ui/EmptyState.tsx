'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon | React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  const isComponent = typeof icon === 'function' || (icon && typeof icon === 'object' && 'render' in (icon as any));
  const IconComponent = isComponent ? (icon as LucideIcon) : null;

  return (
    <div className="py-12 px-4 text-center max-w-sm mx-auto space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-purple-50/50 dark:bg-[#1A0D30] border border-purple-200/60 dark:border-purple-500/30 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400 shadow-sm shadow-purple-900/20">
        {IconComponent ? <IconComponent className="w-6 h-6" /> : (icon as React.ReactNode)}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
      {actionLabel && (
        <div>
          {actionHref ? (
            <Link href={actionHref}>
              <Button size="sm">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

