import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, Lock, FileCheck, Key } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Security & Compliance Standards | BrandGuard AI',
  description: 'BrandGuard AI Security & Compliance — multi-tenant isolation, data safeguards, and audit trails.',
  alternates: {
    canonical: 'https://brandguard-ai-eight.vercel.app/security',
  },
  openGraph: {
    title: 'Security & Compliance Standards | BrandGuard AI',
    description: 'BrandGuard AI Security & Compliance — multi-tenant isolation, data safeguards, and audit trails.',
    url: 'https://brandguard-ai-eight.vercel.app/security',
  },
};

export default function SecurityAndCompliancePage() {
  const controls = [
    { title: 'Zero Cross-Tenant Data Access', desc: 'All database queries enforce organization tenancy parameters preventing inadvertent cross-tenant visibility.' },
    { title: 'Data Encryption', desc: 'Encrypted in transit over HTTPS. Details will be published at launch.' },
    { title: 'Audit Trail Records', desc: 'Every content edit, score change, and managerial sign-off writes an audit entry.' },
    { title: 'SSRF Perimeter Protection', desc: 'Domain and threat scanners validate IP ranges to eliminate internal network probing risks.' },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Product' }, { label: 'Security & Compliance' }]}
      badge="Enterprise Trust"
      title="Security &amp; Compliance"
      subtitle="Architected to provide auditability and logical data isolation for enterprise teams."
    >
      <div className="space-y-10 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {controls.map((ctrl) => (
            <div key={ctrl.title} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{ctrl.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{ctrl.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Require Security Questionnaires or documentation?</h4>
            {/* [[TO BE COMPLETED]] */}
            <p className="text-xs text-slate-500 dark:text-slate-400">Our security team can assist with vendor assessments and documentation. Details will be published at launch.</p>
          </div>
          <Link
            href="/contact"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition shrink-0"
          >
            Contact Security Team &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
