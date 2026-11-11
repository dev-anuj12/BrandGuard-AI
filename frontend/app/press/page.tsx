import Link from 'next/link';
import type { Metadata } from 'next';
import { Newspaper } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Press & Media Resources',
  description: 'BrandGuard AI Press & Media — announcements and official media inquiries.',
};

export default function PressPage() {
  // [[TO BE COMPLETED]] - Official press releases and media kits to be published at launch
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'Press & Media' }]}
      badge="Media Hub"
      title="Press Releases &amp; Media Resources"
      subtitle="Corporate news, announcements, and media resources."
    >
      <div className="space-y-10 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Newspaper className="w-8 h-8 text-indigo-500 mx-auto opacity-70" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Press Announcements &amp; Media Assets</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Details will be published at launch. Official press releases and brand asset kits will be available here.
          </p>
        </div>

        {/* Media Inquiries */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
          <span>Journalist or media inquiry?</span>
          <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Contact Media Relations &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
