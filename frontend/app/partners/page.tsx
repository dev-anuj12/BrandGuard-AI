import Link from 'next/link';
import type { Metadata } from 'next';
import { Handshake, Shield, Globe, Award } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Partners & Ecosystem',
  description: 'BrandGuard AI Partner Program — integration partners, regulatory consultants, and enterprise legal advisors.',
};

export default function PartnersPage() {
  const tracks = [
    { title: 'Technology & CMS Integrations', description: 'Integrate BrandGuard AI compliance scanning directly into WordPress, Adobe Experience Manager, Contentful, and enterprise marketing pipelines.', icon: Globe },
    { title: 'Legal & Regulatory Advisory', description: 'Partner with regulatory compliance firms to deploy standardized rule frameworks for financial, healthcare, and retail sectors.', icon: Shield },
    { title: 'Cybersecurity & Registrar Alliances', description: 'Cooperate with domain registrars, anti-abuse networks, and trust & safety teams to accelerate takedown execution.', icon: Handshake },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'Partners' }]}
      badge="Ecosystem"
      title="BrandGuard AI Partner Ecosystem"
      subtitle="Collaborating with enterprise technology leaders, regulatory advisory firms, and cybersecurity networks."
    >
      <div className="space-y-10 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tracks.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{t.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.description}</p>
              </div>
            );
          })}
        </div>

        <div className="p-6 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Become a Certified Solution Partner</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Gain access to specialized partner APIs, co-marketing, and enterprise referral incentives.</p>
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

