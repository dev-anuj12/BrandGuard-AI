'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error monitoring in production
    if (process.env.NODE_ENV === 'production') {
      console.error('[BrandGuard Error Boundary]', error.digest || 'unknown');
    } else {
      console.error('[BrandGuard Error Boundary]', error.message);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#070A10] dark:to-slate-900 flex flex-col items-center justify-center px-4 text-center">
      <Link href="/" className="flex items-center gap-2 mb-10 group">
        <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" aria-hidden="true" />
        <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">BrandGuard AI</span>
      </Link>

      <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" aria-hidden="true" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
        Something Went Wrong
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        An unexpected error occurred. Our team has been notified.
        {error.digest && (
          <span className="block mt-2 text-xs font-mono text-slate-400 dark:text-slate-600">
            Reference: {error.digest}
          </span>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-700 transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}

