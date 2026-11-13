'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, KeyRound, AlertCircle, CheckCircle2, Sun, Moon, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../components/ThemeProvider';
import { useToast } from '../../components/ui/Toast';
import BrandLogo from '../../components/BrandLogo';

export default function ForgotPasswordPage() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { error: toastError, success: toastSuccess } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Forgot Password | BrandGuard AI';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.requestPasswordRecovery({ email });
      setSubmitted(true);
      toastSuccess('Password recovery request initiated.');
    } catch (err: any) {
      setError(err.message || 'Unable to process request.');
      toastError(err.message || 'Unable to process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <BrandLogo size="sm" showSubtitle={false} href="/" />
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          title="Toggle theme"
          type="button"
        >
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>

      <div className="max-w-md w-full mx-auto my-8 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your work email to receive a single-use expiring recovery link
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          {submitted ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recovery Email Dispatched
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  If <strong className="text-slate-800 dark:text-slate-200">{email}</strong> matches an enterprise account, instructions to securely reset your credentials have been sent.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/reset-password"
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  Have your reset token ready? Reset now <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href="/login" className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                  &larr; Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="recovery-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="recovery-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-9 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full"
                size="md"
              >
                Send Recovery Instructions
              </Button>

              <div className="text-center pt-2 text-xs">
                <Link href="/login" className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                  &larr; Remember your password? Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 py-4">
        BrandGuard AI &copy; {new Date().getFullYear()} Enterprise Content Governance
      </footer>
    </div>
  );
}
