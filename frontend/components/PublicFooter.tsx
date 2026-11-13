'use client';

import React from 'react';
import Link from 'next/link';
import { Moon, Sun, Sliders } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import BrandLogo from './BrandLogo';

export default function PublicFooter() {
  const { resolvedTheme, toggleTheme } = useTheme();

  const handleOpenCookieModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('brandguard-open-cookie-modal'));
    }
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-slate-600 dark:text-slate-400 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* 5 Organized Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-slate-200/80 dark:border-slate-800/80 text-xs">
          {/* Column 1: COMPANY */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 dark:text-white">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-indigo-600 dark:hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Partners
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Press &amp; Media
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: PRODUCT */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 dark:text-white">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="hover:text-indigo-600 dark:hover:text-white transition">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/whats-new" className="hover:text-indigo-600 dark:hover:text-white transition">
                  What&apos;s New
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Changelog
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Request a Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: RESOURCES & SUPPORT */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 dark:text-white">
              Resources &amp; Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-indigo-600 dark:hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/tickets" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Submit a Ticket
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Feedback
                </Link>
              </li>
              <li>
                <Link href="/report-bug" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Report a Bug
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-indigo-600 dark:hover:text-white transition">
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: LEGAL */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 dark:text-white">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleOpenCookieModal}
                  className="hover:text-indigo-600 dark:hover:text-white transition text-left cursor-pointer"
                >
                  Cookie Preferences
                </button>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Acceptable Use Policy
                </Link>
              </li>
              <li>
                <Link href="/dpa" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Data Processing Agreement
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Refund &amp; Cancellation
                </Link>
              </li>
              <li>
                <Link href="/security-policy" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Security Policy
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Copyright &amp; IP Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: ACCOUNT */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 dark:text-white">
              Account
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Account Settings
                </Link>
              </li>
              <li>
                <Link href="/settings/security" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Security Settings
                </Link>
              </li>
              <li>
                <Link href="/settings/billing" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Billing &amp; Subscription
                </Link>
              </li>
              <li>
                <Link href="/settings/data-export" className="hover:text-indigo-600 dark:hover:text-white transition">
                  Export My Data
                </Link>
              </li>
              <li>
                <Link href="/settings/delete-account" className="hover:text-rose-600 dark:hover:text-rose-400 transition">
                  Delete Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showSubtitle={false} href="/" />
            <span>&copy; {new Date().getFullYear()} BrandGuard AI. All Rights Reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={handleOpenCookieModal}
              className="inline-flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-white transition"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Cookie Preferences</span>
            </button>

            <span className="hidden sm:inline">|</span>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-white transition"
              title="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

