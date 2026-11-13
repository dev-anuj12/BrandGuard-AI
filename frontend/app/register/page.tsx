'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, User, AlertCircle, Sun, Moon, Check, X, Building } from 'lucide-react';
import { api, setAuthSession } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../components/ThemeProvider';
import { useToast } from '../../components/ui/Toast';
import BrandLogo from '../../components/BrandLogo';

export default function RegisterPage() {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { error: toastError, success: toastSuccess } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('CREATOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Create Enterprise Account | BrandGuard AI';
    }
  }, []);

  // Password criteria verification
  const hasMinLength = password.length >= 10;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasDigit && hasSymbol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Please ensure your password satisfies all security requirements.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await api.register({
        full_name: fullName,
        email,
        password,
        role,
        organization: organization.trim() || undefined,
      });

      if (!data.user.is_verified) {
        if (data.email_sent === false) {
          toastError('Account created, but verification email could not be delivered. Please check email or click resend.');
        } else {
          toastSuccess('Account created! A 6-digit verification code was sent to your email.');
        }
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setAuthSession(data.access_token, data.user, data.refresh_token);
        toastSuccess(`Welcome, ${data.user.full_name}`);
        router.push('/dashboard/creator');
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please check your details.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
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

      <div className="max-w-md w-full mx-auto my-8 space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create an Enterprise Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your organization's compliance and brand governance workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-[#0D1224]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-black/10 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="reg-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="reg-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jordan Lee"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-9 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-9 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-org" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Organization Name
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="reg-org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="FinNova Technologies"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-9 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="reg-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-9 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Password Requirements Checklist */}
          {password.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Password Requirements:
              </span>
              <div className="grid grid-cols-2 gap-1 text-slate-600 dark:text-slate-400">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                  {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>10+ chars</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                  {hasUpper ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Uppercase</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                  {hasLower ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Lowercase</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasDigit ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                  {hasDigit ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Number</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSymbol ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                  {hasSymbol ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Symbol (!@#$)</span>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            isLoading={loading}
            disabled={!isPasswordValid}
            className="w-full"
            size="md"
          >
            Create Account &rarr;
          </Button>

          <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>

      <footer className="text-center text-xs text-slate-400 py-4">
        BrandGuard AI &copy; {new Date().getFullYear()} Enterprise Content Governance
      </footer>
    </div>
  );
}
