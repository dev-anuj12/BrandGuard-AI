'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Key, AlertCircle, CheckCircle2, Sun, Moon, Check, X } from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../components/ThemeProvider';
import { useToast } from '../../components/ui/Toast';
import BrandLogo from '../../components/BrandLogo';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { error: toastError, success: toastSuccess } = useToast();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Set New Password | BrandGuard AI';
    }
    const qToken = searchParams.get('token');
    if (qToken) {
      setToken(qToken);
    }
  }, [searchParams]);

  // Real-time password criteria
  const hasMinLength = newPassword.length >= 10;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasDigit = /\d/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasDigit && hasSymbol;
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please provide your password reset token.');
      return;
    }
    if (!isPasswordValid) {
      setError('Please ensure your password satisfies all security requirements.');
      return;
    }
    if (!passwordsMatch) {
      setError('New passwords do not match.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await api.confirmPasswordRecovery({
        token: token.trim(),
        new_password: newPassword,
      });
      setCompleted(true);
      toastSuccess('Password updated successfully. Please log in.');
    } catch (err: any) {
      const msg = err.message || 'Failed to reset password. Token may be invalid or expired.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090414] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <BrandLogo size="sm" showSubtitle={false} href="/" />
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-purple-950/40 transition"
          title="Toggle theme"
          type="button"
        >
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>

      <div className="max-w-md w-full mx-auto my-8 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-[#1A0D30] border border-indigo-200 dark:border-purple-500/30 flex items-center justify-center mx-auto text-indigo-600 dark:text-purple-400">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Set New Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create an enterprise-grade password for your account
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#120924]/90 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-xl shadow-black/10 space-y-4">
          {completed ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Password Reset Complete
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your master password has been successfully updated. All prior sessions have been invalidated.
                </p>
              </div>

              <div className="pt-3">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full"
                  size="md"
                >
                  Sign In with New Password
                </Button>
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

              {/* Reset Token Input */}
              <div className="space-y-1">
                <label htmlFor="reset-token" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Reset Token
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="reset-token"
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your 32-character reset token"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-purple-900/35 rounded-xl px-9 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label htmlFor="new-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-purple-900/35 rounded-xl px-9 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-purple-900/35 space-y-1.5 text-[11px]">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Password Requirements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-600 dark:text-slate-400">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    <span>10+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    {hasUpper ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    {hasLower ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasDigit ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    {hasDigit ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSymbol ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    {hasSymbol ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Special character (!@#$)</span>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label htmlFor="confirm-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-purple-900/35 rounded-xl px-9 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-[11px] text-rose-500">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                isLoading={loading}
                disabled={!isPasswordValid || !passwordsMatch}
                className="w-full"
                size="md"
              >
                Reset Password
              </Button>

              <div className="text-center pt-2 text-xs">
                <Link href="/login" className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                  &larr; Back to Sign In
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#090414] flex items-center justify-center text-xs text-slate-400">Loading reset password...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
