import Link from 'next/link';
import type { Metadata } from 'next';
import { Wrench, ShieldCheck, Clock } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Scheduled Maintenance',
  description: 'BrandGuard AI is currently performing scheduled infrastructure maintenance.',
};

export default function MaintenancePage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'System' }, { label: 'Maintenance' }]}
      badge="Infrastructure"
      title="Scheduled System Maintenance"
      subtitle="We are performing planned database index upgrades and model weights optimization."
    >
      <div className="p-8 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-xl mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
          <Wrench className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upgrades in Progress</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Platform access is temporarily paused to preserve audit ledger consistency. Normal operations will resume automatically.
        </p>
        <div className="pt-2">
          <Link
            href="/status"
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition inline-block"
          >
            Check Live Status &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

