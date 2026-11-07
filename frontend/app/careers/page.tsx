import Link from 'next/link';
import type { Metadata } from 'next';
import { Briefcase, MapPin, ArrowRight } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join the BrandGuard AI team — building the future of automated brand compliance and threat intelligence.',
};

export default function CareersPage() {
  const openings = [
    { title: 'Senior Backend Engineer (Python / FastAPI)', team: 'Core Platform', location: 'Remote / Bengaluru / Hybrid', type: 'Full-time' },
    { title: 'AI / NLP Applied Scientist', team: 'Inference Engine', location: 'Remote / San Francisco / Hybrid', type: 'Full-time' },
    { title: 'Senior Frontend Engineer (Next.js / TypeScript)', team: 'Enterprise Experience', location: 'Remote', type: 'Full-time' },
    { title: 'Threat Intelligence Security Researcher', team: 'Digital Defense', location: 'Remote / London / Hybrid', type: 'Full-time' },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'Careers' }]}
      badge="Join Us"
      title="Build the Future of Brand Governance"
      subtitle="Join a world-class team solving complex AI explainability, multi-tenant security, and real-time cyber defense challenges."
    >
      <div className="space-y-8 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Open Opportunities</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We value high autonomy, deep engineering rigor, and customer obsession. All positions offer competitive equity and flexible remote policies.
          </p>
        </div>

        <div className="space-y-3">
          {openings.map((job) => (
            <div
              key={job.title}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {job.team}
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{job.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                  <span>&bull;</span>
                  <span>{job.type}</span>
                </div>
              </div>

              <Link
                href="/contact"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition inline-flex items-center gap-1.5 shrink-0"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

