import Link from 'next/link';
import type { Metadata } from 'next';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Coming Soon',
  description: 'Exciting brand governance and digital threat defense capabilities are launching soon.',
};

export default function ComingSoonPage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Product' }, { label: 'Coming Soon' }]}
      badge="Under Construction"
      title="Exciting Capability Launching Soon"
      subtitle="Our engineering team is finalizing testing on this platform module."
    >
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-xl mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Feature in Final QA</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          This capability is currently in private beta testing with select enterprise design partners. Check our product roadmap for target deployment windows.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/roadmap"
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition inline-block"
          >
            View Roadmap &rarr;
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
          >
            Home
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

