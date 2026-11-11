import Link from 'next/link';
import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'The team behind BrandGuard AI.',
};

export default function TeamPage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'Our Team' }]}
      badge="Team"
      title="The Team Behind BrandGuard AI"
      subtitle="Engineers and compliance specialists dedicated to protecting enterprise brand integrity."
    >
      <div className="space-y-10 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Users className="w-8 h-8 text-indigo-500 mx-auto opacity-70" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Team and leadership profiles [[TO BE COMPLETED]].
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <h4 className="font-bold text-base text-slate-900 dark:text-white">Interested in joining our mission?</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            We are actively hiring distributed systems engineers and security analysts.
          </p>
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
          >
            Explore Open Roles &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
