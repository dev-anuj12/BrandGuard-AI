import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'BrandGuard AI Changelog — track platform updates, AI engine improvements, and security patches.',
};

export default function ChangelogPage() {
  const releases = [
    {
      title: 'Workflow Governance & Grounding Validation',
      highlights: [
        'Central transition table with 4-role segregation of duties (Creator, Reviewer, Manager, Admin).',
        'Append-only audit logging recording all state transitions and review decisions.',
        'Knowledge-grounded validation attaching verified guideline references to compliance findings.',
        'Rule engine tuning with text normalisation and false-positive guard filters.',
        'Evaluation benchmark suite with dev baseline and frozen test split.',
      ],
    },
    {
      title: 'Digital Threat Perimeter & Telemetry Export',
      highlights: [
        'Homoglyph domain scanner and punycode lookalike analysis.',
        'Counterfeit product catalog matching and brand asset verification.',
        'Analytics dashboard with Recharts visualizations and CSV export capability.',
        'FastAPI backend lifespan context manager and Pydantic V2 ConfigDict migration.',
        'Self-service user data export and account management.',
      ],
    },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'Changelog' }]}
      badge="Releases"
      title="Product Changelog"
      subtitle="Platform updates, engine enhancements, and architectural improvements delivered to BrandGuard AI."
    >
      <div className="space-y-8 max-w-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {releases.map((rel) => (
          <div key={rel.title} className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">{rel.title}</h3>
            <ul className="space-y-1.5 pt-1">
              {rel.highlights.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}
