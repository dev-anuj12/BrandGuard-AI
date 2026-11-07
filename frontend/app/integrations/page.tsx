import Link from 'next/link';
import type { Metadata } from 'next';
import { Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Integrations & Webhooks',
  description: 'Connect BrandGuard AI with your existing enterprise marketing stack, CMS, and communication channels.',
};

export default function IntegrationsPage() {
  const tools = [
    { name: 'Slack & Microsoft Teams', desc: 'Real-time compliance alerts, manager approval prompts, and perimeter threat notifications.', status: 'Supported' },
    { name: 'Headless CMS (Contentful, Strapi)', desc: 'Pre-publish compliance webhook validation blocking non-compliant blog and landing page deployments.', status: 'Supported' },
    { name: 'Jira & Linear', desc: 'Auto-create bug and task tickets when compliance reviewers reject draft copy or threat actors are detected.', status: 'Supported' },
    { name: 'CI/CD Pipelines (GitHub Actions)', desc: 'Automated repository scanning ensuring all legal disclaimers and brand terms adhere to corporate standards.', status: 'Supported' },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Product' }, { label: 'Integrations' }]}
      badge="Ecosystem"
      title="Enterprise Ecosystem Integrations"
      subtitle="Embed BrandGuard AI compliance checks and perimeter defense into your existing toolchain via REST APIs and Webhooks."
    >
      <div className="space-y-8 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tools.map((t) => (
            <div key={t.name} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
          <span>Need a bespoke enterprise integration for an in-house CMS?</span>
          <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Talk to Solutions Engineering &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

