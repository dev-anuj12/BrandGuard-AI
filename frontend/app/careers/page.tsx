import Link from 'next/link';
import type { Metadata } from 'next';
import { Briefcase } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Careers | BrandGuard AI',
  description: 'Join the BrandGuard AI team — building the future of automated brand compliance and threat intelligence.',
  alternates: {
    canonical: 'https://brandguard-ai-eight.vercel.app/careers',
  },
  openGraph: {
    title: 'Careers | BrandGuard AI',
    description: 'Join the BrandGuard AI team — building the future of automated brand compliance and threat intelligence.',
    url: 'https://brandguard-ai-eight.vercel.app/careers',
  },
};

export default function CareersPage() {
  // [[TO BE COMPLETED]] - Job openings to be published at launch
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'Careers' }]}
      badge="Join Us"
      title="Careers at BrandGuard AI"
      subtitle="Building the future of automated brand compliance and threat intelligence."
    >
      <div className="space-y-8 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Briefcase className="w-8 h-8 text-indigo-500 mx-auto opacity-70" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Open Opportunities</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            There are currently no active job openings. Details will be published at launch.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
          <span>Interested in future engineering or security roles?</span>
          <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Get in touch &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
