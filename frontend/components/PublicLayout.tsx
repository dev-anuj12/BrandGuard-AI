'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PublicLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  badge?: string;
  title?: string;
  subtitle?: string;
  lastUpdated?: string;
  legalNotice?: boolean;
}

export default function PublicLayout({
  children,
  breadcrumbs,
  badge,
  title,
  subtitle,
  lastUpdated,
  legalNotice = false,
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200 relative overflow-hidden">
      {/* Atmospheric Top Radial Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 dark:opacity-25"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99, 102, 241, 0.25), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-indigo-600 dark:hover:text-white transition">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-900 dark:text-white" aria-current="page">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Standard Page Header */}
        {(title || badge) && (
          <div className="mb-10 pb-6 border-b border-slate-200 dark:border-slate-800/80">
            {badge && (
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 mb-3 shadow-2xs">
                {badge}
              </span>
            )}
            {title && (
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                {subtitle}
              </p>
            )}
            {lastUpdated && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-mono">
                Last reviewed: {lastUpdated}
              </p>
            )}

            {legalNotice && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-300">
                <strong>Notice:</strong> This policy describes the governance standards, architecture, and contractual provisions of BrandGuard AI. For custom enterprise MSAs, DPA riders, or jurisdictional legal review, consult your organization&apos;s corporate legal counsel.
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div>{children}</div>
      </main>

      <PublicFooter />
    </div>
  );
}

