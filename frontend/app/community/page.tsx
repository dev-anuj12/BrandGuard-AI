import Link from 'next/link';
import type { Metadata } from 'next';
import { Users, BookOpen, MessageSquare } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Community & Guidelines Exchange | BrandGuard AI',
  description: 'Connect with enterprise brand governance practitioners, compliance officers, and security researchers.',
  alternates: {
    canonical: 'https://brandguard-ai-eight.vercel.app/community',
  },
  openGraph: {
    title: 'Community & Guidelines Exchange | BrandGuard AI',
    description: 'Connect with enterprise brand governance practitioners, compliance officers, and security researchers.',
    url: 'https://brandguard-ai-eight.vercel.app/community',
  },
};

export default function CommunityPage() {
  // [[TO BE COMPLETED]] - Community discussion channels to be published at launch
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Support' }, { label: 'Community' }]}
      badge="Network"
      title="Brand Governance Community"
      subtitle="Connect with practitioners sharing regulatory compliance insights and brand protection practices."
    >
      <div className="space-y-8 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Users className="w-8 h-8 text-indigo-500 mx-auto opacity-70" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Community Discussion Forums</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Details will be published at launch. Community exchange forums and guideline template repositories will be hosted here.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
          <span>Have feedback or questions for our development team?</span>
          <Link href="/feedback" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Submit Feedback &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
