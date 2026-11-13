'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Lock, Mail, AlertCircle, Sun, Moon, Smartphone, Key, RefreshCw } from 'lucide-react';
import { api, setAuthSession } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../components/ThemeProvider';
import { useToast } from '../../components/ui/Toast';
import BrandLogo from '../../components/BrandLogo';

export default function LoginPage() {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { error: toastError, success: toastSuccess } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  // MFA Challenge State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Sign In | BrandGuard AI';
    }
  }, []);

  const routeUserByRole = (user: any) => {
    switch (user.role) {
      case 'CREATOR':
        router.push('/dashboard/creator');
        break;
      case 'REVIEWER':
        router.push('/dashboard/reviewer');
        break;
      case 'MANAGER':
        router.push('/dashboard/manager');
        break;
      case 'ADMIN':
        router.push('/dashboard/admin');
        break;
      default:
        router.push('/dashboard/creator');
    }
  };

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError(null);
    setUnverifiedEmail(null);
    setLoading(true);
    try {
      const data = await api.login({ email: loginEmail, password: loginPass });

      // Check if MFA is required for this account
      if (data.mfa_required) {
        setMfaRequired(true);
        setMfaToken(data.mfa_token);
        toastSuccess('Please enter your 2-Factor Authentication code.');
        return;
      }

      setAuthSession(data.access_token, data.user, data.refresh_token);
      toastSuccess(`Signed in as ${data.user.full_name} (${data.user.role})`);
      routeUserByRole(data.user);
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please verify credentials.';
      setError(msg);
      toastError(msg);

      if (msg.toLowerCase().includes('not verified') || msg.toLowerCase().includes('verification required')) {
        setUnverifiedEmail(loginEmail);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode.trim()) {
      setError('Please enter your authenticator or backup code.');
      return;
    }

    setError(null);
    setMfaLoading(true);
    try {
      const data = await api.verifyMfaLogin({
        mfa_token: mfaToken,
        code: mfaCode.trim(),
      });
      setAuthSession(data.access_token, data.user, data.refresh_token);
      toastSuccess(`MFA Verified. Welcome, ${data.user.full_name}`);
      routeUserByRole(data.user);
    } catch (err: any) {
      const msg = err.message || 'Invalid authentication code. Please try again.';
      setError(msg);
      toastError(msg);
    } finally {
      setMfaLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060913] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <BrandLogo size="sm" showSubtitle={false} href="/" />

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          title="Toggle theme"
          aria-label="Toggle theme"
          type="button"
        >
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>

      {/* Main Login / MFA Card */}
      <div className="max-w-md w-full mx-auto my-8 space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {mfaRequired ? 'Two-Factor Authentication' : 'Sign In to BrandGuard AI'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mfaRequired
              ? 'Enter the 6-digit code from your authenticator app'
              : 'Access your enterprise compliance workspace'}
          </p>
        </div>

        {/* MFA Challenge Form */}
        {mfaRequired ? (
          <form onSubmit={handleMfaSubmit} className="p-6 rounded-2xl bg-white dark:bg-[#0D1224]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-black/10 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
              <Smartphone className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="mfa-code" className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center block">
                {useBackupCode ? '10-Character Backup Code' : '6-Digit TOTP Authenticator Code'}
              </label>
              <div className="relative">
                <input
                  id="mfa-code"
                  type="text"
                  required
                  autoFocus
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder={useBackupCode ? 'A1B2C3D4E5' : '123456'}
                  className="w-full text-center tracking-widest font-mono text-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={mfaLoading}
              className="w-full"
              size="md"
            >
              Verify &amp; Sign In
            </Button>

            <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setMfaCode('');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                {useBackupCode ? 'Use Authenticator Code' : 'Use a Backup Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMfaRequired(false);
                  setMfaCode('');
                  setError(null);
                }}
                className="hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-[#0D1224]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-black/10 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                {unverifiedEmail && (
                  <Link
                    href={`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`}
                    className="mt-1 text-xs font-bold underline text-indigo-700 dark:text-indigo-300"
                  >
                    Click here to enter your 6-digit OTP &rarr;
                  </Link>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="work-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="work-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-9 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="user-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="user-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-9 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
              size="md"
            >
              Sign In
            </Button>

            <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
              Need an enterprise account?{' '}
              <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Register here
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-4">
        BrandGuard AI &copy; {new Date().getFullYear()} Enterprise Content Governance
      </footer>
    </div>
  );
}
