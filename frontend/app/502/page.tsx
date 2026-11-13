import Link from 'next/link';
import type { Metadata } from 'next';
import { ServerCrash, RefreshCw, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: '502 — Bad Gateway',
  description: 'Upstream gateway error encountered.',
  robots: { index: false, follow: false },
};

export default function BadGatewayPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090414] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mb-6 text-amber-600 dark:text-amber-400">
        <ServerCrash className="w-8 h-8" />
      </div>

      <div className="text-8xl sm:text-9xl font-black text-slate-200 dark:text-slate-800/60 leading-none select-none mb-2 font-mono">
        502
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
        Bad Gateway &bull; Upstream Communication Issue
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        The edge reverse proxy received an invalid response from the upstream application server. This is typically transient during rolling deployments.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <Link
          href="/status"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-purple-950/40 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Check Status</span>
        </Link>
      </div>
    </div>
  );
}

