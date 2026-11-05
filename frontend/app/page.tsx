'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, 
  Search, Cpu, Users, Building, BarChart3, Lock, 
  FileText, Check, ChevronRight, Moon, Sun, Sliders, Globe
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { getCurrentUser } from '../lib/api';
import BrandLogo from '../components/BrandLogo';

export default function LandingPage() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Professional Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo size="md" showSubtitle={true} href="/" />

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition">Capabilities</a>
            <a href="#workflow" className="hover:text-indigo-600 dark:hover:text-white transition">Workflow Engine</a>
            <a href="#governance" className="hover:text-indigo-600 dark:hover:text-white transition">Governance &amp; RBAC</a>
            <a href="#security" className="hover:text-indigo-600 dark:hover:text-white transition">Security &amp; Audit</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle theme"
              aria-label="Toggle between dark and light theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {user ? (
              <Link
                href={`/dashboard/${user.role?.toLowerCase() || 'creator'}`}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition flex items-center gap-1.5"
              >
                <span>Go to Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* JSON-LD Structured Data for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "BrandGuard AI",
            "operatingSystem": "All",
            "applicationCategory": "BusinessApplication",
            "url": "https://brandguard-ai-eight.vercel.app",
            "description": "Enterprise AI-Powered Brand Governance & Digital Brand Protection Platform",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />

      <main id="main-content">
      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Intelligent Content Governance &amp; Brand Safety</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
          Brand Compliance, <br />
          <span className="text-indigo-600 dark:text-indigo-400">Made Intelligent.</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Review content, enforce brand guidelines, validate citations, and manage approvals through one intelligent compliance platform.
        </p>

        {/* Core Product Promise */}
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-blue-50/80 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-blue-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Core Promise: &ldquo;Every content decision should be explainable, evidence-backed and human-controlled.&rdquo;
          </span>
        </div>

        {/* Primary and Secondary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 transition flex items-center gap-2"
          >
            <span>Explore Platform</span>
          </Link>
        </div>

        {/* 4. Product Dashboard Preview */}
        <div className="mt-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 shadow-card text-left backdrop-blur-xl">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070A10] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 ml-2">BrandGuard Review Workspace</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                Compliance Score: 42% (Changes Mandated)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm leading-relaxed font-mono text-slate-800 dark:text-slate-200 shadow-inner">
              FinNova is an ultra-fast{' '}
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800 font-bold">
                money app [Incorrect Terminology]
              </span>{' '}
              that promises{' '}
              <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-800 font-bold">
                guaranteed returns [Banned Expression]
              </span>{' '}
              for every customer! Our platform provides a{' '}
              <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-800 font-bold">
                risk-free investment [Prohibited Claim]
              </span>{' '}
              with 100% profit guaranteed.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Regulatory Violation</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Unconditional yield promise violates FinNova Financial Claims Policy.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>Citation Validation</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Zero grounding evidence found in approved regulatory filings.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Suggested Correction</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  &quot;market-competitive returns designed around your risk profile&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Main Features */}
      <section id="features" className="py-20 border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">Product Capabilities</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Built for Enterprise Scale and Brand Integrity
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm">
            Everything your organization needs to protect brand voice, satisfy regulatory scrutiny, and streamline publication.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Deterministic Rule Engine</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Instant regex-level detection of prohibited expressions, non-compliant naming, and omitted legal disclosures with zero false-negative tolerance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Contextual LLM Analysis</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Analyzes brand tone nuances, sensationalized marketing claims, and inappropriate collateral against your active corporate guidelines.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Citation Grounding</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Cross-references claims against verified regulatory registries, preventing unsubstantiated superlatives from reaching the public.
            </p>
          </div>
        </div>
      </section>

      {/* 6. AI-assisted compliance workflow & 7. Human review & approval process */}
      <section id="workflow" className="py-20 bg-slate-100/60 dark:bg-[#070A10] border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">Governance Pipeline</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AI Efficiency With Human Authority
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm">
              AI provides rapid diagnostic evidence, but authorized human personnel retain complete decision-making control at every gate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: 'Stage 01',
                title: 'Draft Submission',
                role: 'Creator',
                desc: 'Marketing teams draft content and submit collateral for automated compliance review.',
              },
              {
                step: 'Stage 02',
                title: 'Automated Audit',
                role: 'BrandGuard AI',
                desc: 'Multi-engine pipeline scans for terminology, tone deviations, and citation verification.',
              },
              {
                step: 'Stage 03',
                title: 'Quality Verification',
                role: 'Reviewer',
                desc: 'Compliance specialists inspect flagged issues, examine evidence, and add auditor notes.',
              },
              {
                step: 'Stage 04',
                title: 'Executive Sign-Off',
                role: 'Manager',
                desc: 'Department leadership reviews verified material and grants formal approval or rejects.',
              },
            ].map((st, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 shadow-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 font-mono">{st.step}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {st.role}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{st.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Analytics and Governance */}
      <section id="governance" className="py-20 border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">Enterprise Analytics</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Real-Time Compliance Telemetry &amp; Decision History
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Track organization-wide compliance performance over time. View violation frequencies, suggestion acceptance rates, and average review turnaround directly from live database metrics.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero fabricated metrics — telemetry generated directly from relational records</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Categorized frequency charts for proactive copywriter training</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Immutable version history preserved across all content revisions</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Compliance KPI Overview</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Live PostgreSQL Engine</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">Passing Benchmark</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">80.0%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">Turnaround Time</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">~3.2s</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">Strict Banned Rules</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400">5 Active</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">Governance Roles</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">4 Stakeholders</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Security and Administration */}
      <section id="security" className="py-20 bg-slate-100/60 dark:bg-[#070A10] border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">Enterprise Security</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Complete Auditability &amp; Role-Based Access Control
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm">
              Every status transition, content modification, and managerial sign-off is cryptographically tracked in an immutable audit ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">JWT Authentication</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tokens signed with HS256 and salted bcrypt password hashing across all user sessions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Backend RBAC</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Four distinct permission boundaries strictly validated at the API layer for all operations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Immutable Audit Trail</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Timestamped snapshots recording user ID, action, prior state, and resulting state.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Privacy First</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Zero client credential leakage and deterministic fallback capability for sensitive air-gapped environments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Call-to-Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Ready to Elevate Your Brand Governance?
        </h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Experience how intelligent brand compliance and structured human oversight protect your organization from regulatory risk.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 transition"
          >
            <span>Explore Platform</span>
          </Link>
        </div>
      </section>
      </main>

      {/* 11. Professional Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070A10] py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showSubtitle={false} href="/" />
            <span className="text-slate-400">&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-slate-600 dark:text-slate-400">
            <Link href="/login" className="hover:text-indigo-600 dark:hover:text-white transition">Sign In</Link>
            <Link href="/register" className="hover:text-indigo-600 dark:hover:text-white transition">Register</Link>
            <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-white transition">Contact</Link>
            <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-white transition">Terms</Link>
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition">Capabilities</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
