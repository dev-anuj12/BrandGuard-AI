import Link from 'next/link';
import type { Metadata } from 'next';
import { Mail, HelpCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Customer Support Services | BrandGuard AI',
  description: 'BrandGuard AI Support — technical assistance, incident reporting, and platform guidance.',
  alternates: {
    canonical: 'https://brandguard-ai-eight.vercel.app/support',
  },
  openGraph: {
    title: 'Customer Support Services | BrandGuard AI',
    description: 'BrandGuard AI Support — technical assistance, incident reporting, and platform guidance.',
    url: 'https://brandguard-ai-eight.vercel.app/support',
  },
};

export default function SupportPage() {
  const tiers = [
    { title: 'Technical Support', desc: 'Assistance with workflow configuration, rule setup, and platform troubleshooting.', icon: Mail },
    { title: 'Documentation & FAQ', desc: 'Self-service guides covering API integration, role permissions, and compliance engines.', icon: HelpCircle },
    { title: 'Security Incident Reporting', desc: 'Direct reporting channel for perimeter anomalies or suspected brand impersonations.', icon: ShieldAlert },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Support' }, { label: 'Support Services' }]}
      badge="Operations"
      title="BrandGuard AI Technical Support"
      subtitle="Assistance, troubleshooting, and incident reporting for your workspace."
    >
      <div className="space-y-8 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="p-5 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">{t.title}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="p-6 rounded-2xl bg-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-600/10">
          <div className="space-y-1">
            <h2 className="font-bold text-base">Experiencing a technical issue or anomaly?</h2>
            <p className="text-xs text-indigo-100">Submit a tracked ticket to our support team.</p>
          </div>
          <Link
            href="/tickets"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm transition inline-flex items-center gap-1.5 shrink-0"
          >
            <span>Open Support Ticket</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
