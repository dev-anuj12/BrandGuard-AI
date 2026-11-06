'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Building2, User, Mail, MessageSquare } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export default function ContactForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [inquiryType, setInquiryType] = useState('enterprise');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!email.trim()) {
      errs.email = 'Work email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!message.trim()) {
      errs.message = 'Please provide details regarding your inquiry.';
    } else if (message.trim().length < 15) {
      errs.message = 'Message must be at least 15 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simulate real submission with validation
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Inquiry Successfully Dispatched
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          Thank you, <strong className="text-slate-900 dark:text-white">{fullName}</strong>. Our governance and security operations team will review your inquiry ({email}) and follow up within one business day.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFullName('');
            setEmail('');
            setOrganization('');
            setMessage('');
            setErrors({});
          }}
          className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
    >
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Direct Enterprise Inquiries</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Connect directly with our solutions architects and governance compliance team.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          required
          placeholder="e.g. Sarah Jenkins"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Work Email"
          type="email"
          required
          placeholder="e.g. s.jenkins@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Organization / Company"
          placeholder="e.g. Global Financial Corp"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          leftIcon={<Building2 className="w-4 h-4" />}
        />

        <div className="w-full space-y-1.5">
          <label
            htmlFor="inquiry-type"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Inquiry Category
          </label>
          <select
            id="inquiry-type"
            value={inquiryType}
            onChange={(e) => setInquiryType(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <option value="enterprise">Enterprise Deployment &amp; Dedicated Hosting</option>
            <option value="custom_rules">Custom Brand Guidelines &amp; LLM Configuration</option>
            <option value="security">Security &amp; Compliance Audit Documentation</option>
            <option value="support">Technical &amp; Operational Platform Support</option>
          </select>
        </div>
      </div>

      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="message"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Inquiry Details <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            {message.length}/1000
          </span>
        </div>
        <textarea
          id="message"
          rows={4}
          maxLength={1000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please describe your deployment requirements, user volume, or compliance questions..."
          className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            errors.message
              ? 'border-rose-400 dark:border-rose-600 focus-visible:ring-rose-500'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        />
        {errors.message && (
          <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.message}</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          We respect your privacy. No spam or unsolicited marketing communications.
        </p>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          leftIcon={<Send className="w-4 h-4" />}
        >
          Send Inquiry
        </Button>
      </div>
    </form>
  );
}
