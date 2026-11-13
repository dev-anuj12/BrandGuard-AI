'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Key, Smartphone, Lock, CheckCircle2, AlertCircle, Copy, RefreshCw, LogOut, Check } from 'lucide-react';
import AppLayout from '../../../components/AppLayout';
import { api, getCurrentUser, clearAuthSession } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Change Password State
  const [passwords, setPasswords] = useState({ next: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // MFA Setup State
  const [mfaData, setMfaData] = useState<{ secret: string; otpauth_url: string; backup_codes: string[] } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackups, setCopiedBackups] = useState(false);

  // Session Logout State
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user?.mfa_enabled) {
      setMfaEnabled(true);
    }
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (passwords.next.length < 10) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 10 characters long.' });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    try {
      // Request password recovery token for self and confirm update
      const user = getCurrentUser();
      await api.requestPasswordRecovery({ email: user.email });
      setPwdMsg({
        type: 'success',
        text: 'Password recovery verification dispatched to your email. Check inbox to finalize master reset.',
      });
      showToast('Password reset link sent to your registered email.', 'success');
      setPasswords({ next: '', confirm: '' });
    } catch (err: any) {
      setPwdMsg({ type: 'error', text: err.message || 'Failed to initiate password change.' });
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleStartMfaSetup = async () => {
    setMfaLoading(true);
    try {
      const res = await api.setupMfa();
      setMfaData(res);
      showToast('MFA setup key generated. Configure your authenticator app.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to initiate MFA setup.', 'error');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode.trim()) return;

    setMfaLoading(true);
    try {
      await api.enableMfa({ code: mfaCode.trim() });
      setMfaEnabled(true);
      showToast('Two-Factor Authentication is now actively protecting your account!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Invalid authenticator code. Check clock drift.', 'error');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleTerminateAllSessions = async () => {
    setLogoutLoading(true);
    try {
      await api.logout();
      clearAuthSession();
      showToast('All active sessions revoked. Please sign in again.', 'success');
      router.push('/login');
    } catch (err: any) {
      clearAuthSession();
      router.push('/login');
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <AppLayout pageTitle="Security Settings">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Security &amp; Authentication Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage password credentials, active JWT sessions, and Multi-Factor Authentication (TOTP).
          </p>
        </div>

        {/* Change Password Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Master Password</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Requires at least 10 characters with uppercase, lowercase, numbers, and symbols.
              </p>
            </div>
          </div>

          {pwdMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                pwdMsg.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {pwdMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{pwdMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-3 max-w-md">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Password</label>
              <input
                type="password"
                required
                value={passwords.next}
                onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Button type="submit" isLoading={passwordLoading} size="sm">
              Update Password
            </Button>
          </form>
        </div>

        {/* 2FA / TOTP Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Two-Factor Authentication (TOTP MFA)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Adds an extra layer of security using standard authenticator apps (Google Authenticator, Authy, 1Password).
                </p>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                mfaEnabled
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
              }`}
            >
              {mfaEnabled ? 'MFA Active' : 'Not Configured'}
            </span>
          </div>

          {!mfaEnabled && !mfaData && (
            <div className="pt-2">
              <Button onClick={handleStartMfaSetup} isLoading={mfaLoading} size="sm">
                Enroll in Two-Factor Authentication
              </Button>
            </div>
          )}

          {/* MFA Setup View */}
          {!mfaEnabled && mfaData && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Step 1: Add to Your Authenticator App
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter this manual Base32 secret key into Google Authenticator or 1Password:
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <code className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 select-all">
                    {mfaData.secret}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(mfaData.secret);
                      setCopiedSecret(true);
                      setTimeout(() => setCopiedSecret(false), 2000);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs flex items-center gap-1"
                  >
                    {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Single-Use Backup Codes */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Step 2: Save Your Emergency Backup Codes
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(mfaData.backup_codes.join('\n'));
                      setCopiedBackups(true);
                      setTimeout(() => setCopiedBackups(false), 2000);
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    {copiedBackups ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBackups ? 'Codes Copied' : 'Copy All'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {mfaData.backup_codes.map((code, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-center font-bold text-slate-800 dark:text-slate-200"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Verify and Enable */}
              <form onSubmit={handleEnableMfa} className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  Step 3: Enter 6-Digit Authenticator Code to Confirm
                </label>
                <div className="flex gap-2 max-w-xs">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="123456"
                    className="w-36 text-center tracking-widest font-mono text-sm px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button type="submit" isLoading={mfaLoading} size="sm">
                    Enable 2FA
                  </Button>
                </div>
              </form>
            </div>
          )}

          {mfaEnabled && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                Your account is protected by mandatory Two-Factor Authentication. Authenticator code will be required on each sign in.
              </span>
            </div>
          )}
        </div>

        {/* Active Sessions & Global Revocation */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Sessions &amp; Sign Out</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Revoke all current refresh tokens and active JWT sessions across all devices.
            </p>
          </div>

          <Button
            onClick={handleTerminateAllSessions}
            isLoading={logoutLoading}
            variant="secondary"
            size="sm"
            className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950"
          >
            Log Out All Sessions
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
