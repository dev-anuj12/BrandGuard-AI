import Link from 'next/link';
import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'The team behind BrandGuard AI.',
};

export default function TeamPage() {
  // [[TO BE COMPLETED]] - Team and leadership profiles will be published at launch
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
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Leadership &amp; Engineering</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Team and leadership profiles: details will be published at launch.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
          <span>Interested in connecting with our contributors?</span>
          <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Contact Us &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
