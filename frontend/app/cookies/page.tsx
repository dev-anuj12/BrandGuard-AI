import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'BrandGuard AI Cookie Policy — disclosures regarding local storage, session tokens, analytics, and consent management.',
};

export default function CookiePolicyPage() {
  const lastUpdated = 'November 7, 2026';

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Legal' }, { label: 'Cookie Policy' }]}
      badge="Privacy &amp; Tracking"
      title="Cookie Policy"
      subtitle="Detailed disclosure of how BrandGuard AI handles cookies, browser local storage, and session identifiers."
      lastUpdated={lastUpdated}
      legalNotice={false}
    >
      <div className="space-y-8 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Minimal Storage Philosophy</h2>
          <p>
            Unlike ad-driven web services, BrandGuard AI is an enterprise B2B platform. We do not sell tracking profiles or display third-party behavioral advertisements. Our web client relies primarily on <strong>HTML5 LocalStorage</strong> and secure HTTP session headers rather than invasive tracking cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Storage Technologies in Use</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-200 dark:border-purple-900/35 rounded-lg">
              <thead className="bg-slate-100 dark:bg-[#120924]/85 backdrop-blur-xl text-slate-900 dark:text-white">
                <tr>
                  <th className="p-2.5 text-left font-semibold">Key / Identifier</th>
                  <th className="p-2.5 text-left font-semibold">Classification</th>
                  <th className="p-2.5 text-left font-semibold">Duration</th>
                  <th className="p-2.5 text-left font-semibold">Technical Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="p-2.5 font-mono">access_token</td>
                  <td className="p-2.5 font-semibold text-emerald-600 dark:text-emerald-400">Strictly Necessary</td>
                  <td className="p-2.5">24 Hours / Session</td>
                  <td className="p-2.5">Stores the signed JWT used to authorize API calls to protected endpoints.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono">user</td>
                  <td className="p-2.5 font-semibold text-emerald-600 dark:text-emerald-400">Strictly Necessary</td>
                  <td className="p-2.5">Session</td>
                  <td className="p-2.5">Stores active user role context (CREATOR, REVIEWER, MANAGER, ADMIN) to render authorized routes.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono">brandguard_theme</td>
                  <td className="p-2.5 text-indigo-600 dark:text-purple-400">Functional</td>
                  <td className="p-2.5">Persistent (1 Year)</td>
                  <td className="p-2.5">Remembers your preferred color theme mode (dark vs light).</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono">brandguard_cookie_consent_v1</td>
                  <td className="p-2.5 font-semibold text-emerald-600 dark:text-emerald-400">Strictly Necessary</td>
                  <td className="p-2.5">Persistent (1 Year)</td>
                  <td className="p-2.5">Records your verified consent choices and timestamp.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Controlling Your Preferences</h2>
          <p>
            You can modify or withdraw your consent for optional functional and telemetry categories at any moment using our dedicated manager:
          </p>
          <div className="pt-2">
            <Link
              href="/cookie-preferences"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
            >
              Open Interactive Cookie Preferences &rarr;
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

