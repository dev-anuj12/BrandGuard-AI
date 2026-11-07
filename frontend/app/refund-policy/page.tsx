import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'BrandGuard AI Refund and Cancellation Policy — terms governing subscription changes, invoice billing, and service termination.',
};

export default function RefundPolicyPage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Legal' }, { label: 'Refund & Cancellation' }]}
      badge="Billing Terms"
      title="Refund &amp; Cancellation Policy"
      subtitle="Clear and predictable terms governing subscription tiers, renewal cancellations, and dispute protocols."
      lastUpdated="November 7, 2026"
    >
      <div className="space-y-6 max-w-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Subscription Cancellation</h2>
          <p>
            Customers may cancel their recurring monthly or annual BrandGuard AI subscription at any time via the billing management tab in <Link href="/settings" className="text-indigo-600 dark:text-indigo-400 underline">Account Settings</Link> or by contacting customer support. Cancellation takes effect at the conclusion of the currently paid billing cycle.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Refund Eligibility &amp; Exceptions</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Monthly Subscriptions:</strong> Non-refundable once the billing cycle commences. Access continues uninterrupted until the period expires.</li>
            <li><strong>Annual Enterprise Contracts:</strong> Subject to custom cancellation clauses stipulated in your Master Services Agreement (MSA). Partial pro-rated refunds may be evaluated for verified prolonged platform downtime exceeding SLA commitments.</li>
            <li><strong>Free Pilot &amp; Demo Periods:</strong> Trial accounts are not billed and incur zero cancellation fees.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Billing Disputes &amp; Inquiries</h2>
          <p>
            If you believe an invoice error has occurred, please notify our finance team within thirty (30) days of the invoice date at <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">billing@brandguard.io</Link>.
          </p>
        </section>
      </div>
    </PublicLayout>
  );
}

