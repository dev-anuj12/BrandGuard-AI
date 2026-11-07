import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Data Processing Agreement (DPA)',
  description: 'BrandGuard AI Data Processing Agreement — GDPR Article 28 and DPDP Act compliant enterprise data processing terms.',
};

export default function DPAPage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Legal' }, { label: 'Data Processing Agreement' }]}
      badge="Enterprise Compliance"
      title="Data Processing Agreement (DPA)"
      subtitle="Standard contractual clauses detailing how customer data is processed, secured, and audited."
      lastUpdated="November 7, 2026"
      legalNotice={true}
    >
      <div className="space-y-6 max-w-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Scope and Applicability</h2>
          <p>
            This Data Processing Agreement (&quot;DPA&quot;) supplements the BrandGuard AI Terms of Service and applies whenever BrandGuard AI processes Personal Data on behalf of an enterprise Customer in connection with the provision of our compliance review and brand governance services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Processor Obligations</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Process personal data strictly in accordance with Customer&apos;s documented instructions and the agreed subscription scope.</li>
            <li>Ensure all personnel authorized to access customer submissions are bound by strict contractual confidentiality commitments.</li>
            <li>Maintain appropriate technical and organizational measures (TOMs) including AES-256 encryption at rest, TLS 1.3 in transit, and tenant database partitioning.</li>
            <li>Promptly notify the Customer within 48 hours of discovering any confirmed personal data breach affecting Customer data.</li>
            <li>Assist Customer in fulfilling data principal rights requests under DPDP Act and GDPR.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Deletion and Return of Data</h2>
          <p>
            Upon termination of the service agreement, BrandGuard AI shall, at Customer&apos;s election, delete or return all customer content and personal data within ninety (90) days, unless applicable statutory regulations mandate continued archival retention.
          </p>
        </section>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
          <span>Require a countersigned enterprise DPA with custom standard contractual clauses (SCCs)?</span>
          <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Request DPA Packet &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

