import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | BrandGuard AI',
  description: 'BrandGuard AI Refund and Cancellation Policy.',
  alternates: {
    canonical: 'https://brandguard-ai-eight.vercel.app/refund-policy',
  },
  openGraph: {
    title: 'Refund & Cancellation Policy | BrandGuard AI',
    description: 'BrandGuard AI Refund and Cancellation Policy.',
    url: 'https://brandguard-ai-eight.vercel.app/refund-policy',
  },
};

export default function RefundPolicyPage() {
  // [[TO BE COMPLETED]] - Commercial billing and refund policy terms will be published at launch
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Legal' }, { label: 'Refund & Cancellation' }]}
      badge="Billing Terms"
      title="Refund &amp; Cancellation Policy"
      subtitle="Terms governing subscription changes and billing."
    >
      <div className="space-y-6 max-w-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Commercial Refund &amp; Cancellation Terms</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            BrandGuard AI is currently provided for evaluation and demonstration purposes without recurring commercial billing. Details will be published at launch.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
          <span>Questions regarding account access or terms?</span>
          <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Contact Support &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
