import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Customer Stories | BrandGuard AI',
  description: 'Customer stories will be published as customer deployments become available.',
  alternates: {
    canonical: 'https://brandguard-ai-eight.vercel.app/testimonials',
  },
  openGraph: {
    title: 'Customer Stories | BrandGuard AI',
    description: 'Customer stories will be published as customer deployments become available.',
    url: 'https://brandguard-ai-eight.vercel.app/testimonials',
  },
};

export default function TestimonialsPage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'Customer Stories' }]}
      badge="Customer Stories"
      title="Customer Stories"
      subtitle="Customer stories will be published as customer deployments become available."
    >
      <div className="space-y-6 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <p className="text-base text-slate-600 dark:text-slate-300">
            Case studies will be published when real customers are available.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
          <span>Interested in publishing a joint enterprise case study?</span>
          <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Connect With Marketing &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
