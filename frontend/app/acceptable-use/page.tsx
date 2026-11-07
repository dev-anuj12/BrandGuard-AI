import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy',
  description: 'BrandGuard AI Acceptable Use Policy — prohibited activities, API consumption limits, and security conduct rules.',
};

export default function AcceptableUsePage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Legal' }, { label: 'Acceptable Use' }]}
      badge="Conduct &amp; Security"
      title="Acceptable Use Policy"
      subtitle="Defines permissible and prohibited activities across BrandGuard AI web applications, scanners, and APIs."
      lastUpdated="November 7, 2026"
    >
      <div className="space-y-6 max-w-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Permitted Uses</h2>
          <p>
            BrandGuard AI is licensed exclusively for legitimate organizational brand governance, trademark enforcement, marketing compliance verification, and proactive digital brand protection against external threat actors.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Strictly Prohibited Activities</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Submitting malware, malicious payloads, or automated exploit scripts to scanners or content forms.</li>
            <li>Attempting to bypass multi-tenant isolation, tamper with user roles, or forge JWT authentication tokens.</li>
            <li>Using perimeter scanners to conduct denial-of-service (DoS) or port-scanning against unrelated third-party infrastructure.</li>
            <li>Reverse engineering proprietary scoring weights, regex rule trees, or system architecture.</li>
            <li>Scraping the platform or reselling raw intelligence feeds without an authorized Partner agreement.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. API Rate Limits &amp; Infrastructure Fair Use</h2>
          <p>
            API endpoints are governed by tier-based concurrency thresholds. Automated clients must respect HTTP 429 throttling headers. Accounts exhibiting sustained abusive request volumes may face automated rate-limiting or temporary credential suspension.
          </p>
        </section>
      </div>
    </PublicLayout>
  );
}

