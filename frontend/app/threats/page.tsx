'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Search, Filter, 
  RefreshCw, ExternalLink, ChevronDown, ChevronUp, Clock, 
  CheckCircle2, XCircle, ArrowRight, Activity, FileText, 
  Globe, Users, Eye, HelpCircle, MessageSquare, Copy, Download, FileCheck, Send
} from 'lucide-react';

import AppLayout from '../../components/AppLayout';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton, CardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ThreatRiskBadge, ThreatStatusBadge } from '../../components/Badges';
import { useToast } from '../../components/ui/Toast';
import { api, getCurrentUser } from '../../lib/api';

export default function ThreatIntelligencePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [threats, setThreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Interactive Investigation Drawer
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<number | null>(null);
  const [triageNotes, setTriageNotes] = useState<Record<number, string>>({});

  // Legal Notice Generator Modal
  const [noticeModalThreat, setNoticeModalThreat] = useState<any | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [dispatchingNotice, setDispatchingNotice] = useState(false);

  const generateNoticeText = (threat: any) => {
    if (!threat) return '';
    const dateStr = new Date(threat.detected_at).toUTCString();
    const brandName = threat.target_brand || 'Protected Enterprise Brand';
    return `FORMAL NOTICE OF TRADEMARK INFRINGEMENT & DEMAND FOR IMMEDIATE TAKEDOWN
Date: ${new Date().toUTCString()}
Reference Code: ${threat.threat_code}

TO: Designated Legal & Abuse Desk
RE: Unauthorized Infringement of "${brandName}" Trademarks & Brand Assets

Complainant Information:
Brand Owner: ${brandName}
Authorized Contact: Legal Operations / Brand Protection Team
Email: legal-abuse@brandguard.internal

Infringing Location / Endpoint:
Target URL / Identifier: ${threat.source_url}
Category of Infringement: ${threat.category}
Assessed Risk Level: ${threat.risk_level}
Incident Discovery Timestamp: ${dateStr}

Specific Details of Infringement:
${threat.explanation}

Recommended Remediation:
${threat.recommended_action || 'Immediate suspension of offending domain/account and removal of unauthorized brand assets.'}

Evidence Summary:
${threat.evidence_items?.map((ev: any) => `- [${ev.evidence_type}]: ${ev.data_payload}`).join('\n') || '- Automated digital threat telemetry snapshot'}

Statement of Good Faith:
We confirm under penalty of perjury that:
1. ${brandName} is the proprietor of the registered trademarks, brand marks, and associated intellectual property.
2. The use of the aforementioned trademarks and trade dress at ${threat.source_url} is not authorized by the trademark owner, its agents, or the law.
3. This notice is issued in good faith with the expectation of immediate remedial suspension within twenty-four (24) hours of receipt.

Signed,
BrandGuard AI Perimeter Threat Inspection & Legal Governance Operations
On behalf of ${brandName}`;
  };

  const handleCopyNotice = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    showToast('Takedown notice copied to clipboard', 'success');
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const loadThreats = async () => {
    setLoading(true);
    try {
      const data = await api.getThreats({
        category: categoryFilter,
        risk_level: riskFilter,
        status_filter: statusFilter,
        search: search.trim() ? search : undefined,
      });
      setThreats(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load threat incidents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cur = getCurrentUser();
    if (!cur) {
      router.push('/login');
      return;
    }
    setUser(cur);
    loadThreats();
  }, [router, categoryFilter, riskFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadThreats();
  };

  const handleUpdateStatus = async (threatId: number, newStatus: string) => {
    setStatusUpdateLoading(threatId);
    try {
      await api.updateThreatStatus(threatId, {
        status: newStatus,
        notes: triageNotes[threatId] || `Status updated to ${newStatus} by ${user?.full_name}`,
      });
      showToast(`Threat incident marked as ${newStatus}`, 'success');
      await loadThreats();
    } catch (err: any) {
      showToast(err.message || 'Failed to update threat status', 'error');
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  // KPI Calculations
  const criticalHighCount = threats.filter(t => t.risk_level === 'Critical' || t.risk_level === 'High').length;
  const investigatingCount = threats.filter(t => t.status === 'Under Investigation').length;
  const resolvedCount = threats.filter(t => t.status === 'Resolved').length;

  return (
    <AppLayout pageTitle="Threat Intelligence Center" breadcrumbs={[{ label: 'Threat Intelligence' }]}>
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 text-[11px] font-semibold text-rose-700 dark:text-rose-300 mb-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>External Digital Perimeter</span>
              <span>•</span>
              <span className="text-slate-500 dark:text-slate-400">Threat Surveillance &amp; Triage</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Centralized Threat Intelligence Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive registry of active phishing domains, social impersonators, counterfeit products, and unauthorized brand usage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadThreats}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Incidents</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{threats.length}</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Cataloged brand threats</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 shadow-sm">
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Critical &amp; High Risk</span>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1.5">{criticalHighCount}</div>
            <span className="text-[11px] text-rose-500/80 mt-0.5 block">Priority takedown actions</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Under Investigation</span>
            <div className="text-2xl font-bold text-amber-500 mt-1.5">{investigatingCount}</div>
            <span className="text-[11px] text-amber-500/80 mt-0.5 block">Active forensic reviews</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Remediated &amp; Resolved</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{resolvedCount}</div>
            <span className="text-[11px] text-emerald-500 mt-0.5 block">Takedowns completed</span>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Search threat code, domain, handle, or title"
                placeholder="Search threat code, domain, handle, or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Button type="submit" size="sm" variant="secondary">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium text-[11px]">Category:</span>
              <select
                aria-label="Filter threats by category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Categories</option>
                <option value="Phishing Domain">Phishing Domain</option>
                <option value="Lookalike Website">Lookalike Website</option>
                <option value="Social Impersonation">Social Impersonation</option>
                <option value="Counterfeit Product">Counterfeit Product</option>
                <option value="Unauthorized Logo">Unauthorized Logo</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium text-[11px]">Risk:</span>
              <select
                aria-label="Filter threats by risk level"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-2 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium text-[11px]">Status:</span>
              <select
                aria-label="Filter threats by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="New">New</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Verified Threat">Verified Threat</option>
                <option value="False Positive">False Positive</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Threat Incidents Table with Expandable Triage Drawer */}
        {loading ? (
          <TableSkeleton rows={5} />
        ) : threats.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No threat incidents match criteria"
            description="Adjust your search query or filter selections to view other records."
          />
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-[#080C16] border-b border-slate-200/80 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Threat Code</th>
                    <th className="py-3 px-4">Category &amp; Source</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Detected</th>
                    <th className="py-3 px-4 text-right">Investigation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {threats.map((t) => {
                    const isExpanded = expandedId === t.id;
                    const confidencePct = Math.round(t.confidence_score || 85);

                    return (
                      <React.Fragment key={t.id}>
                        <tr className={`hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors ${
                          isExpanded ? 'bg-slate-50/90 dark:bg-slate-700/40' : ''
                        }`}>
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                            {t.threat_code}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900 dark:text-white block">{t.title}</span>
                            <a
                              href={t.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 truncate max-w-sm mt-0.5"
                            >
                              <span className="truncate">{t.source_url}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          </td>
                          <td className="py-3 px-4">
                            <ThreatRiskBadge risk={t.risk_level} />
                          </td>
                          <td className="py-3 px-4 font-mono font-bold">
                            <span className={confidencePct >= 90 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
                              {confidencePct}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <ThreatStatusBadge status={t.status} />
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {t.detected_at ? new Date(t.detected_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : t.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            >
                              <span>{isExpanded ? 'Hide' : 'Triage'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </td>
                        </tr>

                        {/* Collapsible Triage & Evidence Panel */}
                        {isExpanded && (
                          <tr className="bg-slate-50/95 dark:bg-slate-900/80">
                            <td colSpan={7} className="p-5 border-b border-slate-200 dark:border-slate-700/80 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Explanation & Recommended Action */}
                                <div className="space-y-3">
                                  <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                      Detection Explanation &amp; Attack Vectors
                                    </h3>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                      {t.explanation}
                                    </p>
                                  </div>

                                  {t.recommended_action && (
                                    <div>
                                      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                                        Recommended Remediation Action
                                      </h3>
                                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 font-medium">
                                        {t.recommended_action}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Attached Technical Evidence */}
                                <div className="space-y-3">
                                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Technical Evidence Repository ({t.evidence_items?.length || 0})
                                  </h3>

                                  {(!t.evidence_items || t.evidence_items.length === 0) ? (
                                    <p className="text-xs text-slate-400 italic p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                      No technical snapshots attached to this incident.
                                    </p>
                                  ) : (
                                    <div className="space-y-2">
                                      {t.evidence_items.map((ev: any) => (
                                        <div key={ev.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono space-y-1">
                                          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                            <span>[{ev.evidence_type}]</span>
                                            <span className="text-slate-400 font-normal">
                                              {new Date(ev.created_at).toLocaleTimeString()}
                                            </span>
                                          </div>
                                          <p className="text-slate-600 dark:text-slate-300 text-[11px] break-all">
                                            {ev.data_payload}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Incident Triage Action Bar */}
                              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                <div className="flex-1 max-w-md">
                                  <input
                                    type="text"
                                    placeholder="Add investigator triage note..."
                                    value={triageNotes[t.id] || ''}
                                    onChange={(e) => setTriageNotes({ ...triageNotes, [t.id]: e.target.value })}
                                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setNoticeModalThreat(t)}
                                    className="border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                                  >
                                    <FileCheck className="w-3.5 h-3.5 mr-1" />
                                    Generate Legal Notice
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={statusUpdateLoading === t.id}
                                    onClick={() => handleUpdateStatus(t.id, 'Under Investigation')}
                                  >
                                    Mark Investigating
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={statusUpdateLoading === t.id}
                                    onClick={() => handleUpdateStatus(t.id, 'Verified Threat')}
                                  >
                                    Confirm Threat
                                  </Button>
                                  <Button
                                    size="sm"
                                    disabled={statusUpdateLoading === t.id}
                                    onClick={() => handleUpdateStatus(t.id, 'Resolved')}
                                  >
                                    Resolve Incident
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legal Notice Generator Modal */}
        <Modal
          isOpen={!!noticeModalThreat}
          onClose={() => setNoticeModalThreat(null)}
          title={`Generate Formal Legal Takedown Notice — ${noticeModalThreat?.threat_code}`}
          description="Statutory cease &amp; desist declaration pre-formatted for domain registrars, hosting ISPs, and social platform trust &amp; safety teams."
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400">
                Governing Law: 17 U.S.C. § 512 &amp; UDRP Trademark Rules
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleCopyNotice(generateNoticeText(noticeModalThreat))}
                >
                  {copiedNotice ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      <span>Copy Notice</span>
                    </>
                  )}
                </Button>
                <Button
                  disabled={dispatchingNotice}
                  onClick={async () => {
                    if (!noticeModalThreat) return;
                    setDispatchingNotice(true);
                    try {
                      await api.updateThreatStatus(noticeModalThreat.id, {
                        status: 'Under Investigation',
                        notes: 'Formal takedown notice dispatched to registrar/host abuse desk.'
                      });
                      showToast('Takedown notice dispatched and status recorded.', 'success');
                      setNoticeModalThreat(null);
                      await loadThreats();
                    } catch (e: any) {
                      showToast(e.message || 'Failed to dispatch notice', 'error');
                    } finally {
                      setDispatchingNotice(false);
                    }
                  }}
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  Dispatch Notice
                </Button>
                <Button variant="ghost" onClick={() => setNoticeModalThreat(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          {noticeModalThreat && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Offending Target:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white truncate max-w-md block">
                    {noticeModalThreat.source_url}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase">Category:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {noticeModalThreat.category}
                  </span>
                </div>
              </div>

              <textarea
                readOnly
                rows={14}
                value={generateNoticeText(noticeModalThreat)}
                className="w-full p-3 font-mono text-[11px] leading-relaxed rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950 text-slate-800 dark:text-slate-200 select-all resize-none focus:outline-none"
              />
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}

