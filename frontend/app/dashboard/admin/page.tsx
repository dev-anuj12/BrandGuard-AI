'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Users, BookOpen, AlertOctagon, Link2, 
  Plus, Trash2, RefreshCw, CheckCircle2, AlertTriangle, FileText, Activity,
  Search, ShieldAlert, Check
} from 'lucide-react';
import AppLayout from '../../../components/AppLayout';
import { Button } from '../../../components/ui/Button';
import { TableSkeleton, CardSkeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SeverityBadge, StatusBadge } from '../../../components/Badges';
import { useToast } from '../../../components/ui/Toast';
import { api, getCurrentUser } from '../../../lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'guidelines' | 'banned' | 'sources' | 'users' | 'audit'>('guidelines');
  const [loading, setLoading] = useState(true);

  // Data states
  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [bannedWords, setBannedWords] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [newGuideline, setNewGuideline] = useState({ title: '', category: 'Financial Claims', description: '', severity: 'HIGH' });
  const [newBanned, setNewBanned] = useState({ word_or_phrase: '', category: 'Financial Claims', explanation: '', suggested_replacement: '', severity: 'HIGH' });
  const [newSource, setNewSource] = useState({ name: '', url: '', source_type: 'Regulatory Filing', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [gData, bwData, sData, uData, aData] = await Promise.all([
        api.getGuidelines(),
        api.getBannedWords(),
        api.getSources(),
        api.getUsers(),
        api.getAuditLogs(50)
      ]);
      setGuidelines(gData);
      setBannedWords(bwData);
      setSources(sData);
      setUsersList(uData);
      setAuditLogs(aData);
    } catch (err: any) {
      showToast(err.message || 'Failed to load system data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const curUser = getCurrentUser();
    if (!curUser) {
      router.push('/login');
      return;
    }
    setUser(curUser);
    loadAll();
  }, [router]);

  // Form submit handlers
  const handleAddGuideline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuideline.title.trim()) return;
    setSubmitting(true);
    try {
      await api.createGuideline({ ...newGuideline, rule_type: 'Deterministic', is_active: true });
      showToast(`Added brand guideline: "${newGuideline.title}"`, 'success');
      setNewGuideline({ title: '', category: 'Financial Claims', description: '', severity: 'HIGH' });
      const g = await api.getGuidelines();
      setGuidelines(g);
    } catch (err: any) {
      showToast(err.message || 'Failed to create guideline', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGuideline = async (id: number) => {
    try {
      await api.deleteGuideline(id);
      setGuidelines((prev) => prev.filter((g) => g.id !== id));
      showToast('Guideline deleted successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete guideline', 'error');
    }
  };

  const handleAddBanned = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanned.word_or_phrase.trim()) return;
    setSubmitting(true);
    try {
      await api.createBannedWord({ ...newBanned, is_active: true });
      showToast(`Added banned term: "${newBanned.word_or_phrase}"`, 'success');
      setNewBanned({ word_or_phrase: '', category: 'Financial Claims', explanation: '', suggested_replacement: '', severity: 'HIGH' });
      const bw = await api.getBannedWords();
      setBannedWords(bw);
    } catch (err: any) {
      showToast(err.message || 'Failed to add banned term', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBanned = async (id: number) => {
    try {
      await api.deleteBannedWord(id);
      setBannedWords((prev) => prev.filter((bw) => bw.id !== id));
      showToast('Banned term deleted.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete term', 'error');
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.name.trim() || !newSource.url.trim()) return;
    setSubmitting(true);
    try {
      await api.createSource({ ...newSource, is_verified: true });
      showToast(`Added approved source: "${newSource.name}"`, 'success');
      setNewSource({ name: '', url: '', source_type: 'Regulatory Filing', description: '' });
      const s = await api.getSources();
      setSources(s);
    } catch (err: any) {
      showToast(err.message || 'Failed to create source', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSource = async (id: number) => {
    try {
      await api.deleteSource(id);
      setSources((prev) => prev.filter((s) => s.id !== id));
      showToast('Approved source removed.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete source', 'error');
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.updateUser(userId, { role: newRole });
      setUsersList((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      showToast(`User role updated to ${newRole}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update user role', 'error');
    }
  };

  return (
    <AppLayout pageTitle="Administration" breadcrumbs={[{ label: 'Administration' }]}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Knowledge Base &amp; System Administration
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure brand compliance guidelines, banned vocabulary, verified knowledge sources, and member permissions.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadAll}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>

        {/* Admin KPI Overview */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Brand Rules</span>
                <BookOpen className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{guidelines.length}</div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">Active compliance rules</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Banned Terms</span>
                <AlertOctagon className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{bannedWords.length}</div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">Zero-tolerance vocabulary</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Approved Sources</span>
                <Link2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{sources.length}</div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">Verified evidence repository</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Team Members</span>
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{usersList.length}</div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">Configured user accounts</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-px">
          {[
            { id: 'guidelines', label: 'Brand Guidelines', count: guidelines.length, icon: BookOpen },
            { id: 'banned', label: 'Banned Terms', count: bannedWords.length, icon: AlertOctagon },
            { id: 'sources', label: 'Approved Sources', count: sources.length, icon: Link2 },
            { id: 'users', label: 'User Directory', count: usersList.length, icon: Users },
            { id: 'audit', label: 'Audit Trail', count: auditLogs.length, icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800/50'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  isActive 
                    ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: GUIDELINES */}
        {activeTab === 'guidelines' && (
          <div className="space-y-6">
            {/* Create Guideline Card */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Plus className="w-4 h-4 text-indigo-500" />
                Create New Brand Guideline
              </h3>
              <form onSubmit={handleAddGuideline} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Rule Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Guarantee Claims Restriction"
                      value={newGuideline.title}
                      onChange={(e) => setNewGuideline({ ...newGuideline, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={newGuideline.category}
                      onChange={(e) => setNewGuideline({ ...newGuideline, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option>Financial Claims</option>
                      <option>Tone &amp; Voice</option>
                      <option>Product Terminology</option>
                      <option>Legal &amp; Compliance</option>
                      <option>Marketing Standards</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Description / Rule Specification</label>
                    <input
                      type="text"
                      placeholder="e.g. Content must not guarantee future investment returns or promise fixed multipliers."
                      value={newGuideline.description}
                      onChange={(e) => setNewGuideline({ ...newGuideline, description: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Enforcement Severity</label>
                    <select
                      value={newGuideline.severity}
                      onChange={(e) => setNewGuideline({ ...newGuideline, severity: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="CRITICAL">CRITICAL (Immediate Reject)</option>
                      <option value="HIGH">HIGH (Block Approval)</option>
                      <option value="MEDIUM">MEDIUM (Warning)</option>
                      <option value="LOW">LOW (Informational)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button type="submit" size="sm" isLoading={submitting}>
                    Add Guideline Rule
                  </Button>
                </div>
              </form>
            </div>

            {/* List */}
            {guidelines.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No brand guidelines found"
                description="Create your first compliance guideline to enforce rules in the AI engine."
              />
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#080C16] border-b border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Title &amp; Rule</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Severity</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {guidelines.map((g) => (
                        <tr key={g.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900 dark:text-white block">{g.title}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5 line-clamp-1">{g.description}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{g.category}</td>
                          <td className="py-3 px-4">
                            <SeverityBadge severity={g.severity || 'HIGH'} />
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{g.rule_type || 'Rule'}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteGuideline(g.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete guideline"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BANNED WORDS */}
        {activeTab === 'banned' && (
          <div className="space-y-6">
            {/* Create Banned Card */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Plus className="w-4 h-4 text-rose-500" />
                Add Banned Expression / Term
              </h3>
              <form onSubmit={handleAddBanned} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Word or Exact Phrase</label>
                    <input
                      type="text"
                      placeholder="e.g. guaranteed profit"
                      value={newBanned.word_or_phrase}
                      onChange={(e) => setNewBanned({ ...newBanned, word_or_phrase: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={newBanned.category}
                      onChange={(e) => setNewBanned({ ...newBanned, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option>Financial Claims</option>
                      <option>Urgency &amp; Pressure</option>
                      <option>Misleading Superlatives</option>
                      <option>Unsupported Performance</option>
                      <option>Trademark Sensitivity</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Suggested Replacement</label>
                    <input
                      type="text"
                      placeholder="e.g. potential returns"
                      value={newBanned.suggested_replacement}
                      onChange={(e) => setNewBanned({ ...newBanned, suggested_replacement: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Explanation for Violation</label>
                    <input
                      type="text"
                      placeholder="e.g. Regulatory compliance guidelines prohibit promising guaranteed investment outcomes."
                      value={newBanned.explanation}
                      onChange={(e) => setNewBanned({ ...newBanned, explanation: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Severity</label>
                    <select
                      value={newBanned.severity}
                      onChange={(e) => setNewBanned({ ...newBanned, severity: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button type="submit" size="sm" variant="destructive" isLoading={submitting}>
                    Add Banned Term
                  </Button>
                </div>
              </form>
            </div>

            {/* List */}
            {bannedWords.length === 0 ? (
              <EmptyState
                icon={AlertOctagon}
                title="No banned terms configured"
                description="Add zero-tolerance words or phrases that the deterministic engine must flag."
              />
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#080C16] border-b border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Banned Term</th>
                        <th className="py-3 px-4">Suggested Replacement</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Severity</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {bannedWords.map((bw) => (
                        <tr key={bw.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                            &quot;{bw.word_or_phrase}&quot;
                            <span className="font-sans font-normal text-slate-400 text-[11px] block mt-0.5">{bw.explanation}</span>
                          </td>
                          <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">
                            {bw.suggested_replacement ? `→ "${bw.suggested_replacement}"` : '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{bw.category}</td>
                          <td className="py-3 px-4">
                            <SeverityBadge severity={bw.severity || 'HIGH'} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteBanned(bw.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete banned term"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SOURCES */}
        {activeTab === 'sources' && (
          <div className="space-y-6">
            {/* Create Source Card */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Plus className="w-4 h-4 text-emerald-500" />
                Register Approved Reference Source
              </h3>
              <form onSubmit={handleAddSource} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Source Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Regulatory Compliance Circular 2026"
                      value={newSource.name}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Source Type</label>
                    <select
                      value={newSource.source_type}
                      onChange={(e) => setNewSource({ ...newSource, source_type: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option>Regulatory Filing</option>
                      <option>Official Documentation</option>
                      <option>Financial Disclosure</option>
                      <option>Product Factsheet</option>
                      <option>Annual Report</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">URL / Document Reference</label>
                    <input
                      type="text"
                      placeholder="https://company.com/disclosures/..."
                      value={newSource.url}
                      onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Official statutory circular outlining compliance standards for retail advertising."
                    value={newSource.description}
                    onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button type="submit" size="sm" isLoading={submitting}>
                    Register Source
                  </Button>
                </div>
              </form>
            </div>

            {/* List */}
            {sources.length === 0 ? (
              <EmptyState
                icon={Link2}
                title="No approved sources found"
                description="Register official URLs or statutory filings for citation cross-validation."
              />
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#080C16] border-b border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Source Title</th>
                        <th className="py-3 px-4">Classification</th>
                        <th className="py-3 px-4">URL / Endpoint</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {sources.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                            {s.name}
                            {s.description && (
                              <span className="text-slate-400 font-normal text-[11px] block mt-0.5">{s.description}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{s.source_type}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 truncate max-w-xs">
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {s.url}
                            </a>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteSource(s.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete source"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#080C16] border-b border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Modify Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {u.full_name}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                            u.role === 'ADMIN'
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400'
                              : u.role === 'MANAGER'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400'
                              : u.role === 'REVIEWER'
                              ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400'
                              : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="CREATOR">CREATOR</option>
                            <option value="REVIEWER">REVIEWER</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            {auditLogs.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No audit entries recorded"
                description="Workflow transactions and decisions will appear here chronologically."
              />
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#080C16] border-b border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Content ID</th>
                        <th className="py-3 px-4">Actor</th>
                        <th className="py-3 px-4">Details / Comments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-mono text-[11px]">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">{log.action}</td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">#{log.content_id}</td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-sans">{log.user?.full_name || `User #${log.user_id}`}</td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-sans">{log.details || log.comments || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
