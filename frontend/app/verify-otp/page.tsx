'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, AlertCircle, RefreshCw, CheckCircle2, ArrowRight, Sun, Moon } from 'lucide-react';
import { api, setAuthSession } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../components/ThemeProvider';
import { useToast } from '../../components/ui/Toast';
import BrandLogo from '../../components/BrandLogo';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { error: toastError, success: toastSuccess } = useToast();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Verify Email | BrandGuard AI';
    }
    const qEmail = searchParams.get('email');
    if (qEmail) {
      setEmail(qEmail);
    }
  }, [searchParams]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, 5);
    document.getElementById(`otp-input-${focusIdx}`)?.focus();
  };

  const fullCode = otp.join('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please provide your email address.');
      return;
    }
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await api.verifyOtp({ email: cleanEmail, otp: fullCode });
      setAuthSession(data.access_token, data.user, data.refresh_token);
      toastSuccess('Email verified successfully! Welcome to BrandGuard AI.');

      const roleStr = typeof data.user?.role === 'string' ? data.user.role.toUpperCase() : 'CREATOR';
      switch (roleStr) {
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
          router.push('/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Invalid or expired verification code.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address to resend code.');
      toastError('Please enter your email address.');
      return;
    }
    if (cooldown > 0) return;
    setError(null);
    setResending(true);
    try {
      const data = await api.resendOtp({ email: cleanEmail });
      if (data.email_sent === false) {
        setError(data.message || 'Verification email could not be delivered.');
        toastError(data.message || 'Verification email could not be delivered.');
      } else {
        setSuccess(data.message || 'A new verification code has been dispatched.');
        toastSuccess('New verification code sent to your email.');
        setCooldown(60);
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-input-0')?.focus();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
      toastError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
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
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Verify Your Email
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We sent a 6-digit verification code to{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-200">{email || 'your email'}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="p-6 rounded-2xl bg-white dark:bg-[#120924]/90 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-xl shadow-black/10 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="verify-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              {email && (
                <span className="text-[10px] text-slate-400">Verifying this address</span>
              )}
            </div>
            <input
              id="verify-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-purple-900/35 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 6-Digit OTP Box Grid */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block text-center">
              Security Code (Expires in 5 minutes)
            </label>
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-purple-900/35 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  autoFocus={idx === 0}
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            disabled={fullCode.length !== 6 || loading || !email.trim()}
            className="w-full"
            size="md"
          >
            Verify &amp; Continue
          </Button>

          {/* Resend Cooldown Counter */}
          <div className="text-center pt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <span>Didn't receive the code?</span>
            {cooldown > 0 ? (
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Resend in {cooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-indigo-600 dark:text-purple-400 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-50"
              >
                {resending && <RefreshCw className="w-3 h-3 animate-spin" />}
                Resend Code
              </button>
            )}
          </div>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-purple-900/35 text-xs">
            <Link href="/login" className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
              &larr; Back to Sign In
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

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#090414] flex items-center justify-center text-xs text-slate-400">Loading verification...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
