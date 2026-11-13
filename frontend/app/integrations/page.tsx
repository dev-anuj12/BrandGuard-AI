import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Integrations & Webhooks | BrandGuard AI',
  description: 'Connect BrandGuard AI with your existing enterprise stack via REST APIs and planned integrations.',
  alternates: {
    canonical: 'https://brandguard-ai-eight.vercel.app/integrations',
  },
  openGraph: {
    title: 'Integrations & Webhooks | BrandGuard AI',
    description: 'Connect BrandGuard AI with your existing enterprise stack via REST APIs and planned integrations.',
    url: 'https://brandguard-ai-eight.vercel.app/integrations',
  },
};

export default function IntegrationsPage() {
  const tools = [
    {
      name: 'REST API v1',
      desc: 'JSON REST endpoints for automated content review, workflow approvals, brand guidelines management, and perimeter threat scans.',
      status: 'Supported',
    },
    {
      name: 'Slack & Microsoft Teams',
      desc: 'Compliance notifications, reviewer prompts, and threat perimeter alerts delivered directly into team channels.',
      status: 'Planned',
    },
    {
      name: 'Headless CMS (Contentful, Strapi)',
      desc: 'Pre-publish compliance webhook validation blocking unreviewed content deployments.',
      status: 'Planned',
    },
    {
      name: 'Jira & Linear',
      desc: 'Automated ticket creation when compliance reviewers reject draft copy or perimeter threats are detected.',
      status: 'Planned',
    },
    {
      name: 'CI/CD Pipelines (GitHub Actions)',
      desc: 'Repository scanning ensuring marketing copy and disclaimers adhere to corporate brand standards.',
      status: 'Planned',
    },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Product' }, { label: 'Integrations' }]}
      badge="Ecosystem"
      title="Integrations &amp; API Connectivity"
      subtitle="Connect BrandGuard AI compliance checks and perimeter defense into your existing toolchain."
    >
      <div className="space-y-8 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tools.map((t) => (
            <div key={t.name} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</h2>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    t.status === 'Supported'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
          <span>Looking to build custom integrations with our API?</span>
          <Link href="/api-docs" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            View API Documentation &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
