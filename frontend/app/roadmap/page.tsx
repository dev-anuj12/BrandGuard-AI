import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Product Roadmap | BrandGuard AI',
  description: 'BrandGuard AI Product Roadmap — planned architectural milestones and future enhancements.',
  alternates: {
    canonical: 'https://brandguard-ai-eight.vercel.app/roadmap',
  },
  openGraph: {
    title: 'Product Roadmap | BrandGuard AI',
    description: 'BrandGuard AI Product Roadmap — planned architectural milestones and future enhancements.',
    url: 'https://brandguard-ai-eight.vercel.app/roadmap',
  },
};

export default function RoadmapPage() {
  const items = [
    {
      title: 'Real-LLM Benchmark with a Larger Labelled Set',
      desc: 'Expanding evaluation coverage beyond the current dataset with a broader labelled corpus and live LLM provider comparisons.',
      status: 'Planned',
    },
    {
      title: 'Vector Retrieval for Large Guideline Sets',
      desc: 'Dense semantic indexing and embedding retrieval for enterprises maintaining hundreds of regulatory rules.',
      status: 'Planned',
    },
    {
      title: 'In-App Notifications',
      desc: 'Real-time notification tray for assigned review tasks, manager approvals, and threat detections.',
      status: 'Planned',
    },
    {
      title: 'Password Reset and Email Verification',
      desc: 'Self-service password recovery workflows and transactional email verification for user accounts.',
      status: 'Planned',
    },
    {
      title: 'Authorised Platform APIs for Social Monitoring',
      desc: 'Direct integration with authorized social platform APIs for automated perimeter monitoring of brand impersonations.',
      status: 'Planned',
    },
    {
      title: 'Single Sign-On (SSO)',
      desc: 'SAML 2.0 and OIDC enterprise identity provider integrations for centralized corporate authentication.',
      status: 'Planned',
    },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'Roadmap' }]}
      badge="Future Vision"
      title="BrandGuard AI Product Roadmap"
      subtitle="A transparent overview of planned capabilities and engineering milestones."
    >
      <div className="space-y-6 max-w-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.title} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
