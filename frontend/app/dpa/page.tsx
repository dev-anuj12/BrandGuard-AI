import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Data Processing Agreement (DPA)',
  description: 'BrandGuard AI Data Processing Agreement — enterprise data processing terms. Details will be published at launch.',
};

export default function DPAPage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Legal' }, { label: 'Data Processing Agreement' }]}
      badge="Enterprise Compliance"
      title="Data Processing Agreement (DPA)"
      subtitle="Contractual terms detailing how customer data is processed and protected."
      lastUpdated="November 7, 2026"
      legalNotice={true}
    >
      <div className="space-y-6 max-w-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Scope and Applicability</h2>
          <p>
            {/* [[TO BE COMPLETED]] */}
            This Data Processing Agreement (&quot;DPA&quot;) supplements the BrandGuard AI Terms of Service and applies whenever BrandGuard AI processes data on behalf of an enterprise Customer in connection with our compliance review and brand governance services. Details will be published at launch.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Processor Obligations</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Process customer data in accordance with Customer&apos;s documented instructions.</li>
            <li>Ensure authorized personnel are bound by appropriate confidentiality commitments.</li>
            {/* [[TO BE COMPLETED]] */}
            <li>Maintain technical and organizational measures (TOMs) including encryption in transit, logical tenant database partitioning, and access controls. Details will be published at launch.</li>
            <li>Notify the Customer without undue delay upon confirming a personal data breach affecting Customer data.</li>
            <li>Assist Customer in fulfilling data subject requests using available account export and deletion tools.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Deletion and Return of Data</h2>
          <p>
            {/* [[TO BE COMPLETED]] */}
            Upon termination of the service agreement, BrandGuard AI shall delete or return customer content in accordance with contractual terms. Details will be published at launch.
          </p>
        </section>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 text-xs flex items-center justify-between">
          <span>Require a countersigned enterprise DPA?</span>
          <Link href="/contact" className="text-indigo-600 dark:text-purple-400 font-bold hover:underline">
            Request DPA Information &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
