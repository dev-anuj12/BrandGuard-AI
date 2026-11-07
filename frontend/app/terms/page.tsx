import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'BrandGuard AI Terms of Service — service level agreements, acceptable usage, AI advisory disclaimers, and subscription terms.',
};

export default function TermsOfServicePage() {
  const lastUpdated = 'November 7, 2026';

  const sections = [
    { title: '1. Agreement to Terms', text: 'By registering for an account, accessing the BrandGuard AI web portal, or integrating our APIs, you enter into a binding contractual agreement with BrandGuard AI. If acting on behalf of an enterprise or corporate entity, you represent and warrant that you possess requisite corporate authorization to bind the organization.' },
    { title: '2. Provision of Platform Services', text: 'BrandGuard AI grants authorized users a non-exclusive, non-transferable, revocable subscription license to use our brand governance engine, automated rule analysis, citation validation, and external digital threat scanners in accordance with chosen subscription tiers.' },
    { title: '3. Multi-Tenant Account Responsibilities', text: 'Organizations are responsible for designating administrators, configuring role-segregated governance workflows (Creator, Reviewer, Manager, Admin), maintaining credential secrecy, and revoking credentials for departed personnel.' },
    { title: '4. AI Analysis Disclaimer & Professional Judgment', text: 'BrandGuard AI compliance scores, rule findings, and remediation suggestions are operational advisory aids powered by automated heuristic algorithms and large language models. They DO NOT constitute formal legal advice, statutory regulatory certification, or guarantees against third-party regulatory enforcement. Organizations retain exclusive responsibility for approving and publishing content.' },
    { title: '5. Intellectual Property Rights', text: 'Customers retain all right, title, and interest in and to their proprietary logos, trademarks, content submissions, and brand documentation. BrandGuard AI retains all rights, title, and intellectual property in the platform software, algorithms, UI designs, and documentation.' },
    { title: '6. Acceptable Use Standards', text: 'Users shall not reverse engineer, decompile, or tamper with security controls; submit malicious code, defamatory material, or unlawful content; or bypass tenant data isolation. Violations result in immediate account suspension.' },
    { title: '7. Service Levels & Maintenance Windows', text: 'We target 99.9% platform availability for enterprise tiers, excluding scheduled maintenance windows announced at least 48 hours in advance via our System Status portal.' },
    { title: '8. Term, Renewals & Cancellation', text: 'Subscriptions renew automatically for successive monthly or annual terms unless cancelled prior to the renewal date. Enterprise contract terms are governed by specific Master Services Agreements (MSAs).' },
    { title: '9. Limitation of Liability', text: 'To the maximum extent permitted by applicable law, neither party shall be liable for indirect, incidental, punitive, or consequential damages. Total cumulative liability under any claim shall not exceed total fees paid during the preceding twelve (12) month period.' },
    { title: '10. Dispute Resolution & Governing Law', text: 'These terms are governed by the laws of India and applicable regional commercial statutes. Any dispute arising out of or in connection with this agreement shall be submitted to binding arbitration.' },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Legal' }, { label: 'Terms of Service' }]}
      badge="Legal &amp; Contracts"
      title="Terms of Service"
      subtitle="The contractual framework governing access, licensing, and usage of the BrandGuard AI platform."
      lastUpdated={lastUpdated}
      legalNotice={true}
    >
      <div className="space-y-8 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {sections.map(({ title, text }) => (
          <section key={title} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="leading-relaxed">{text}</p>
          </section>
        ))}

        <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Need a customized Master Services Agreement?</span>
          <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Contact Enterprise Legal Team &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
