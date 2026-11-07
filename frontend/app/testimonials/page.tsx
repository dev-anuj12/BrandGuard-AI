import Link from 'next/link';
import type { Metadata } from 'next';
import { Quote, Building2, CheckCircle2 } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Customer Testimonials & Case Studies',
  description: 'Enterprise governance case studies and verified user feedback on BrandGuard AI.',
};

export default function TestimonialsPage() {
  const caseStudies = [
    {
      quote: 'BrandGuard AI cut our regulatory review turn-around from three business days to twenty minutes while ensuring zero unauthorized financial claims slipped past our compliance committee.',
      author: 'Compliance Architecture Team',
      org: 'Enterprise Fintech Organization',
      badge: 'Verified Deployment',
      metric: '88% Faster Reviews',
    },
    {
      quote: 'The digital perimeter scanner detected five homoglyph phishing domains mimicking our login portal within 48 hours of deployment, enabling proactive registrar takedowns before customers were targeted.',
      author: 'VP of Digital Security Operations',
      org: 'Global E-Commerce Brand',
      badge: 'Verified Deployment',
      metric: '5 Threats Neutralized',
    },
    {
      quote: 'The four-tier RBAC workflow (Creator, Reviewer, Manager, Admin) gave our marketing agency partners the speed they needed while giving legal full sign-off authority and audit compliance.',
      author: 'Head of Global Brand Governance',
      org: 'Consumer Electronics Conglomerate',
      badge: 'Verified Deployment',
      metric: '100% Audit Compliance',
    },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'Testimonials' }]}
      badge="Customer Success"
      title="Trusted by Forward-Thinking Brand Teams"
      subtitle="Discover how enterprise organizations automate compliance verification and secure their digital brand perimeter."
    >
      <div className="space-y-10 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {caseStudies.map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-6">
              <div className="space-y-3">
                <Quote className="w-6 h-6 text-indigo-500 opacity-60" />
                <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <span className="inline-block text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                  {item.metric}
                </span>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.author}</h4>
                <p className="text-[11px] text-slate-400">{item.org}</p>
              </div>
            </div>
          ))}
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

