import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Home } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found | BrandGuard AI',
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#070A10] dark:to-slate-900 flex flex-col items-center justify-center px-4 text-center">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2 mb-10 group">
        <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-purple-400 group-hover:scale-110 transition-transform" aria-hidden="true" />
        <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">BrandGuard AI</span>
      </Link>

      {/* 404 visual */}
      <div className="relative mb-8">
        <div className="text-[120px] sm:text-[180px] font-black leading-none select-none bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent opacity-20 dark:opacity-10">
          404
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-[#1A0D30] border border-indigo-200 dark:border-purple-500/30 flex items-center justify-center mb-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-purple-400" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Message */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
        Page Not Found
      </h1>
      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. It may have been a private compliance route that requires authentication.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          Back to Home
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl hover:bg-slate-50 dark:hover:bg-purple-950/40 text-slate-800 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-purple-900/35 transition"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Sign In
        </Link>
      </div>

      {/* Footer note */}
      <p className="mt-10 text-xs text-slate-400 dark:text-slate-600">
        BrandGuard AI &copy; {new Date().getFullYear()} — Enterprise Brand Governance Platform
      </p>
    </div>
  );
}

