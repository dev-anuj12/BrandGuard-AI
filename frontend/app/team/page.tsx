import Link from 'next/link';
import type { Metadata } from 'next';
import { Users, Code, ShieldCheck, Mail } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'Meet the engineering and compliance leadership behind BrandGuard AI.',
};

export default function TeamPage() {
  const leadership = [
    { name: 'Dr. Evelyn Vance', role: 'Head of Regulatory AI Architecture', focus: 'Heuristic verification & explainable compliance models' },
    { name: 'Marcus Chen', role: 'VP of Platform Engineering', focus: 'Distributed multi-tenant isolation & FastAPI backend architecture' },
    { name: 'Sarah Al-Mansoor', role: 'Director of Threat Intelligence', focus: 'Homoglyph domain detection & perimeter cyber defense' },
    { name: 'Arjun Mehta', role: 'Chief Product Officer', focus: 'Human-in-the-loop governance & workflow design' },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'Our Team' }]}
      badge="Leadership"
      title="The Team Behind BrandGuard AI"
      subtitle="Engineers, compliance specialists, and cybersecurity researchers dedicated to protecting global enterprise brands."
    >
      <div className="space-y-10 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {leadership.map((member) => (
            <div key={member.name} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                {member.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{member.name}</h3>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{member.role}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">{member.focus}</p>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <h4 className="font-bold text-base text-slate-900 dark:text-white">Interested in joining our mission?</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            We are actively hiring distributed systems engineers, NLP specialists, and security analysts.
          </p>
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
          >
            Explore Open Roles &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

