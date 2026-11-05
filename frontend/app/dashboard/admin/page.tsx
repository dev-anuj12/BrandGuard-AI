'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Users, BookOpen, AlertOctagon, Link2, 
  Plus, Trash2, RefreshCw, CheckCircle2, AlertTriangle, FileText, Activity
} from 'lucide-react';
import { api, getCurrentUser } from '../../../lib/api';
import { SeverityBadge } from '../../../components/Badges';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'guidelines' | 'banned' | 'sources' | 'users' | 'audit'>('guidelines');
  const [loading, setLoading] = useState(true);

  // Data states
  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [bannedWords, setBannedWords] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Form states
  const [newGuideline, setNewGuideline] = useState({ title: '', category: 'Financial Claims', description: '', severity: 'HIGH' });
  const [newBanned, setNewBanned] = useState({ word_or_phrase: '', category: 'Financial Claims', explanation: '', suggested_replacement: '', severity: 'HIGH' });
  const [newSource, setNewSource] = useState({ name: '', url: '', source_type: 'Regulatory Filing', description: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [gData, bwData, sData, uData, aData] = await Promise.all([
        api.getGuidelines(),
        api.getBannedWords(),
        api.getSources(),
        api.getUsers(),
        api.getAuditLogs(30)
      ]);
      setGuidelines(gData);
      setBannedWords(bwData);
      setSources(sData);
      setUsersList(uData);
      setAuditLogs(aData);
    } catch (err: any) {
      console.error(err);
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
    try {
      await api.createGuideline({ ...newGuideline, rule_type: 'Deterministic', is_active: true });
      setMessage({ type: 'success', text: `Added brand guideline: "${newGuideline.title}"` });
      setNewGuideline({ title: '', category: 'Financial Claims', description: '', severity: 'HIGH' });
      const g = await api.getGuidelines();
      setGuidelines(g);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteGuideline = async (id: number) => {
    try {
      await api.deleteGuideline(id);
      setGuidelines(guidelines.filter((g) => g.id !== id));
      setMessage({ type: 'success', text: 'Guideline deleted.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleAddBanned = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBannedWord({ ...newBanned, is_active: true });
      setMessage({ type: 'success', text: `Added banned term: "${newBanned.word_or_phrase}"` });
      setNewBanned({ word_or_phrase: '', category: 'Financial Claims', explanation: '', suggested_replacement: '', severity: 'HIGH' });
      const bw = await api.getBannedWords();
      setBannedWords(bw);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteBanned = async (id: number) => {
    try {
      await api.deleteBannedWord(id);
      setBannedWords(bannedWords.filter((b) => b.id !== id));
      setMessage({ type: 'success', text: 'Banned term deleted.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSource({ ...newSource, is_verified: true });
      setMessage({ type: 'success', text: `Added approved source: "${newSource.name}"` });
      setNewSource({ name: '', url: '', source_type: 'Regulatory Filing', description: '' });
      const s = await api.getSources();
      setSources(s);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteSource = async (id: number) => {
    try {
      await api.deleteSource(id);
      setSources(sources.filter((s) => s.id !== id));
      setMessage({ type: 'success', text: 'Approved source deleted.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.updateUser(userId, { role: newRole });
      const u = await api.getUsers();
      setUsersList(u);
      setMessage({ type: 'success', text: `Updated user #${userId} role to ${newRole}.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800 text-[11px] font-semibold text-emerald-300 mb-2">
            <span>Admin Control Center</span>
            <span>•</span>
            <span className="text-slate-400">Knowledge Base &amp; System Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Knowledge Base — {user?.full_name?.split(' ')[0] || 'Administrator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Maintain FinNova brand guidelines, manage banned terminology, verify official sources, and inspect audit trails.
          </p>
        </div>

        <button
          onClick={loadAll}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950 border border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Admin KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Active Brand Guidelines</span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-400 mt-2">{guidelines.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Rules enforced across AI engine</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Banned Terms &amp; Phrases</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-2">{bannedWords.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Deterministic violations</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Approved Sources</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-2">{sources.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Grounding URLs &amp; filings</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total System Users</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">{usersList.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">4 Stakeholder roles active</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex items-center space-x-2 overflow-x-auto pb-1 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('guidelines')}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === 'guidelines'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Brand Guidelines ({guidelines.length})
        </button>

        <button
          onClick={() => setActiveTab('banned')}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === 'banned'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Banned Terminology ({bannedWords.length})
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === 'sources'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Approved Sources ({sources.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === 'users'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          User Permissions ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === 'audit'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* TAB 1: GUIDELINES */}
      {activeTab === 'guidelines' && (
        <div className="space-y-6">
          <form onSubmit={handleAddGuideline} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Add New Brand Guideline</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                required
                value={newGuideline.title}
                onChange={(e) => setNewGuideline({ ...newGuideline, title: e.target.value })}
                placeholder="Guideline Title (e.g. Social Media Claims Policy)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
              <input
                type="text"
                required
                value={newGuideline.category}
                onChange={(e) => setNewGuideline({ ...newGuideline, category: e.target.value })}
                placeholder="Category (e.g. Tone, Legal, Financial Claims)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
              <select
                value={newGuideline.severity}
                onChange={(e) => setNewGuideline({ ...newGuideline, severity: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="CRITICAL">Critical Severity</option>
                <option value="HIGH">High Severity</option>
                <option value="MEDIUM">Medium Severity</option>
                <option value="LOW">Low Severity</option>
              </select>
            </div>
            <textarea
              required
              rows={2}
              value={newGuideline.description}
              onChange={(e) => setNewGuideline({ ...newGuideline, description: e.target.value })}
              placeholder="Detailed rule specification and compliance criteria..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Add Guideline
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guidelines.map((g) => (
              <div key={g.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase">{g.category}</span>
                    <SeverityBadge severity={g.severity} />
                  </div>
                  <h4 className="font-bold text-white text-sm mt-1">{g.title}</h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{g.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Type: {g.rule_type}</span>
                  <button
                    onClick={() => handleDeleteGuideline(g.id)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                    title="Delete rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BANNED WORDS */}
      {activeTab === 'banned' && (
        <div className="space-y-6">
          <form onSubmit={handleAddBanned} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-400" />
              <span>Register Banned Word or Prohibited Expression</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                required
                value={newBanned.word_or_phrase}
                onChange={(e) => setNewBanned({ ...newBanned, word_or_phrase: e.target.value })}
                placeholder="Prohibited phrase (e.g. 100% safe)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
              <input
                type="text"
                required
                value={newBanned.suggested_replacement}
                onChange={(e) => setNewBanned({ ...newBanned, suggested_replacement: e.target.value })}
                placeholder="Suggested compliant replacement"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
              <select
                value={newBanned.severity}
                onChange={(e) => setNewBanned({ ...newBanned, severity: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="CRITICAL">Critical Severity</option>
                <option value="HIGH">High Severity</option>
                <option value="MEDIUM">Medium Severity</option>
              </select>
            </div>
            <textarea
              required
              rows={2}
              value={newBanned.explanation}
              onChange={(e) => setNewBanned({ ...newBanned, explanation: e.target.value })}
              placeholder="Why this phrase is prohibited (e.g. Violates SEBI/FINRA advertising guarantee restrictions)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
            >
              Add Banned Expression
            </button>
          </form>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Banned Phrase</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Regulatory Rationale</th>
                  <th className="p-3">Suggested Alternative</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {bannedWords.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900">
                    <td className="p-3 font-bold text-rose-300 font-mono">{b.word_or_phrase}</td>
                    <td className="p-3">
                      <SeverityBadge severity={b.severity} />
                    </td>
                    <td className="p-3 text-slate-300">{b.explanation}</td>
                    <td className="p-3 text-emerald-400 font-medium">{b.suggested_replacement || 'None'}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteBanned(b.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="Delete banned expression"
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

      {/* TAB 3: SOURCES */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <form onSubmit={handleAddSource} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Register Approved Regulatory / Official Source</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                required
                value={newSource.name}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                placeholder="Source Title (e.g. Annual Factsheet 2026)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
              <input
                type="url"
                required
                value={newSource.url}
                onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                placeholder="Official URL (e.g. https://finnova-demo.com/docs)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
              <select
                value={newSource.source_type}
                onChange={(e) => setNewSource({ ...newSource, source_type: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="Product Documentation">Product Documentation</option>
                <option value="Regulatory Filing">Regulatory Filing</option>
                <option value="Audit Report">Audit Report</option>
                <option value="Official Press Release">Official Press Release</option>
              </select>
            </div>
            <textarea
              rows={2}
              value={newSource.description}
              onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
              placeholder="What facts and metrics does this source officially verify?"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
            >
              Add Approved Source
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((s) => (
              <div key={s.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase">{s.source_type}</span>
                  <h4 className="font-bold text-white text-sm mt-1">{s.name}</h4>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:underline break-all block mt-1"
                  >
                    {s.url}
                  </a>
                  {s.description && <p className="text-xs text-slate-400 mt-2">{s.description}</p>}
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                  <button
                    onClick={() => handleDeleteSource(s.id)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                    title="Delete source"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3">User ID</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Update Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900">
                  <td className="p-3 font-mono text-slate-500">#{u.id}</td>
                  <td className="p-3 font-bold text-white">{u.full_name}</td>
                  <td className="p-3 text-slate-400">{u.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-emerald-400 font-semibold">Active</span>
                  </td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
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
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900 font-mono">
                  <td className="p-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </td>
                  <td className="p-3 text-indigo-300">{log.user_email || 'System'}</td>
                  <td className="p-3 font-semibold text-slate-200">{log.action}</td>
                  <td className="p-3 text-slate-400">{log.entity_type} #{log.entity_id}</td>
                  <td className="p-3 text-slate-300 max-w-md truncate">{log.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
