import Link from 'next/link';
import type { Metadata } from 'next';
import { Handshake, Shield, Globe } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Partners & Ecosystem | BrandGuard AI',
  description: 'BrandGuard AI Partner Program — technology integrations, advisory alliances, and developer ecosystem.',
  alternates: {
    canonical: 'https://brandguard-ai-eight.vercel.app/partners',
  },
  openGraph: {
    title: 'Partners & Ecosystem | BrandGuard AI',
    description: 'BrandGuard AI Partner Program — technology integrations, advisory alliances, and developer ecosystem.',
    url: 'https://brandguard-ai-eight.vercel.app/partners',
  },
};

export default function PartnersPage() {
  // [[TO BE COMPLETED]] - Partner tracks and listings to be published at launch
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'Partners' }]}
      badge="Ecosystem"
      title="BrandGuard AI Partner Ecosystem"
      subtitle="Collaborating with enterprise technology platforms, advisory partners, and developer ecosystems."
    >
      <div className="space-y-10 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="p-8 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Handshake className="w-8 h-8 text-indigo-500 mx-auto opacity-70" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Partner Program</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Details will be published at launch. Partner integration programs and advisory alliances are currently under development.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Interested in Partnering?</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Reach out to our team to discuss technology integrations or advisory collaboration.</p>
          </div>
          <Link
            href="/contact"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition shrink-0"
          >
            Partner With Us &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
