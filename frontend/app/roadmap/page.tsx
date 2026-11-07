import type { Metadata } from 'next';
import { Compass, Clock, CheckCircle2 } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Product Roadmap',
  description: 'BrandGuard AI Product Roadmap — upcoming features, planned integrations, and engine milestones.',
};

export default function RoadmapPage() {
  const roadmapStages = [
    {
      quarter: 'Q1 2027 — In Development',
      badge: 'In Progress',
      color: 'bg-indigo-500',
      features: [
        'Multi-Modal Image Compliance: Automated logo clear-space & color palette verification via computer vision.',
        'Automated Registrar Takedown Dispatch: One-click UDRP evidence compilation and hosting abuse dispatch.',
        'Slack & Microsoft Teams Notifications: Interactive approval buttons within enterprise chat clients.',
      ],
    },
    {
      quarter: 'Q2 2027 — Planned',
      badge: 'Upcoming',
      color: 'bg-purple-500',
      features: [
        'Browser Extension for Real-Time Content Verification across Google Docs, Figma, and Notion.',
        'Automated Regulatory Rule Ingestion: Parsing SEBI, SEC, and FTC circulars directly into rule trees.',
        'Granular Tenant IP Whitelisting: Restricting admin portal access to corporate VPN IP blocks.',
      ],
    },
    {
      quarter: 'Q3 2027 — Future Horizon',
      badge: 'Under Research',
      color: 'bg-slate-400',
      features: [
        'Air-Gapped On-Premise LLM Appliance for banking and national defense environments.',
        'Cross-Platform Counterfeit Image Hash Correlation across global marketplace clusters.',
      ],
    },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'Roadmap' }]}
      badge="Future Vision"
      title="BrandGuard AI Product Roadmap"
      subtitle="A transparent look at upcoming capabilities and technical milestones planned for the BrandGuard AI platform."
    >
      <div className="space-y-8 max-w-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {roadmapStages.map((stage) => (
          <div key={stage.quarter} className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">{stage.quarter}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {stage.badge}
              </span>
            </div>
            <ul className="space-y-2 pt-1">
              {stage.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${stage.color}`} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}

