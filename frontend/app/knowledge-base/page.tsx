'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, CheckCircle2, ShieldAlert, FileText, Image as ImageIcon, 
  Upload, Search, Plus, Trash2, RefreshCw, AlertTriangle, Check, 
  ExternalLink, Layers, FileCheck, FileWarning, HelpCircle
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { SeverityBadge } from '../../components/Badges';
import { useToast } from '../../components/ui/Toast';
import { api, getCurrentUser } from '../../lib/api';

export default function KnowledgeBasePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'guidelines' | 'facts' | 'assets' | 'documents' | 'validation'>('guidelines');
  const [loading, setLoading] = useState(true);

  // Guidelines & Facts data
  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [facts, setFacts] = useState<any[]>([]);
  const [bannedWords, setBannedWords] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Forms
  const [newGuideline, setNewGuideline] = useState({ title: '', category: 'Financial Claims', description: '', severity: 'HIGH' });
  const [newFact, setNewFact] = useState({ statement: '', category: 'Company Information' });
  const [newAsset, setNewAsset] = useState({ asset_name: '', asset_type: 'Primary Logo', category: 'logo', dimensions: '800x600', file_size_kb: 150 });
  const [submitting, setSubmitting] = useState(false);

  // Document Upload
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docCategory, setDocCategory] = useState('Financial Claims');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docResult, setDocResult] = useState<any>(null);

  // Asset Validation Tool
  const [valFile, setValFile] = useState<File | null>(null);
  const [valType, setValType] = useState('Primary Logo');
  const [validating, setValidating] = useState(false);
  const [valReport, setValReport] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gData, fData, bwData, aData] = await Promise.all([
        api.getGuidelines(),
        api.getFacts(),
        api.getBannedWords(),
        api.getBrandAssets()
      ]);
      setGuidelines(gData || []);
      setFacts(fData || []);
      setBannedWords(bwData || []);
      setAssets(aData || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load knowledge base.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    loadData();
  }, [router]);

  // Form Handlers
  const handleAddGuideline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuideline.title.trim()) return;
    setSubmitting(true);
    try {
      await api.createGuideline({ ...newGuideline, rule_type: 'Deterministic', is_active: true });
      showToast(`Added guideline: "${newGuideline.title}"`, 'success');
      setNewGuideline({ title: '', category: 'Financial Claims', description: '', severity: 'HIGH' });
      const g = await api.getGuidelines();
      setGuidelines(g);
    } catch (err: any) {
      showToast(err.message || 'Failed to create guideline.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGuideline = async (id: number) => {
    try {
      await api.deleteGuideline(id);
      setGuidelines((prev) => prev.filter((g) => g.id !== id));
      showToast('Guideline deleted.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete guideline.', 'error');
    }
  };

  const handleAddFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.statement.trim()) return;
    setSubmitting(true);
    try {
      await api.createFact({ ...newFact, is_active: true });
      showToast('Verified claim added to Knowledge Base.', 'success');
      setNewFact({ statement: '', category: 'Company Information' });
      const f = await api.getFacts();
      setFacts(f);
    } catch (err: any) {
      showToast(err.message || 'Failed to add fact.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.asset_name.trim()) return;
    setSubmitting(true);
    try {
      await api.createBrandAsset({
        ...newAsset,
        approval_status: 'approved',
        image_path: `/assets/brand/${newAsset.asset_name.toLowerCase().replace(/\s+/g, '-')}.svg`
      });
      showToast(`Registered brand asset "${newAsset.asset_name}".`, 'success');
      setNewAsset({ asset_name: '', asset_type: 'Primary Logo', category: 'logo', dimensions: '800x600', file_size_kb: 150 });
      const a = await api.getBrandAssets();
      setAssets(a);
    } catch (err: any) {
      showToast(err.message || 'Failed to register asset.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAsset = async (id: number) => {
    try {
      await api.deleteBrandAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      showToast('Asset removed from Knowledge Base.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete asset.', 'error');
    }
  };

  // Document Upload Handler
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      showToast('Please select a PDF or DOCX file to upload.', 'error');
      return;
    }
    setUploadingDoc(true);
    setDocResult(null);
    try {
      const formData = new FormData();
      formData.append('file', docFile);
      formData.append('category', docCategory);
      formData.append('auto_create_rules', 'true');

      const res = await api.uploadGuidelineDocument(formData);
      setDocResult(res);
      showToast(res.message || 'Document ingested successfully.', 'success');
      setDocFile(null);
      // Reload guidelines to reflect extracted policies
      const g = await api.getGuidelines();
      setGuidelines(g);
    } catch (err: any) {
      showToast(err.message || 'Document ingestion failed.', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Asset Validation Handler
  const handleValidateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valFile) {
      showToast('Please choose an image file to validate.', 'error');
      return;
    }
    setValidating(true);
    setValReport(null);
    try {
      const formData = new FormData();
      formData.append('file', valFile);
      formData.append('asset_type', valType);

      const res = await api.validateAsset(formData);
      setValReport(res);
      if (res.valid) {
        showToast('Asset validated: fully compliant with brand guidelines.', 'success');
      } else {
        showToast('Asset flagged for compliance issues.', 'warning');
      }
    } catch (err: any) {
      showToast(err.message || 'Asset validation failed.', 'error');
    } finally {
      setValidating(false);
    }
  };

  const canEdit = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

  return (
    <AppLayout
      pageTitle="Brand Knowledge Base"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Brand Knowledge Base' }
      ]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Enterprise Brand Knowledge Base
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Centralized repository of approved guidelines, verified facts, official digital assets, and automated validation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Refresh Knowledge Base"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: 'guidelines', label: 'Brand Guidelines', count: guidelines.length },
            { id: 'facts', label: 'Verified Claims & Facts', count: facts.length },
            { id: 'assets', label: 'Approved Assets', count: assets.length },
            { id: 'documents', label: 'Document Ingestion (PDF/DOCX)' },
            { id: 'validation', label: 'Asset Validation Tool' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB 1: Guidelines ── */}
        {activeTab === 'guidelines' && (
          <div className="space-y-6">
            {canEdit && (
              <form onSubmit={handleAddGuideline} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Define Brand Policy Rule</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Policy Title *</label>
                    <input
                      type="text"
                      required
                      value={newGuideline.title}
                      onChange={(e) => setNewGuideline({ ...newGuideline, title: e.target.value })}
                      placeholder="e.g. Prohibited Guaranteed Yield Terms"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Severity</label>
                    <select
                      value={newGuideline.severity}
                      onChange={(e) => setNewGuideline({ ...newGuideline, severity: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Detailed Rule Requirement *</label>
                    <textarea
                      rows={2}
                      required
                      value={newGuideline.description}
                      onChange={(e) => setNewGuideline({ ...newGuideline, description: e.target.value })}
                      placeholder="Marketing copy must never guarantee fixed double-digit returns without statutory regulatory disclosures..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                    Add Policy Rule
                  </Button>
                </div>
              </form>
            )}

            {/* List */}
            <div className="space-y-3">
              {guidelines.map((g) => (
                <div key={g.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={g.severity} />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{g.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {g.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">{g.description}</p>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleDeleteGuideline(g.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      title="Delete guideline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 2: Verified Facts ── */}
        {activeTab === 'facts' && (
          <div className="space-y-6">
            {canEdit && (
              <form onSubmit={handleAddFact} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Register Verified Claim or Company Fact</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Verified Fact Statement *</label>
                    <input
                      type="text"
                      required
                      value={newFact.statement}
                      onChange={(e) => setNewFact({ ...newFact, statement: e.target.value })}
                      placeholder="e.g. BrandGuard AI processes over 10,000 regulatory compliance evaluations daily."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={newFact.category}
                      onChange={(e) => setNewFact({ ...newFact, category: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Company Information">Company Information</option>
                      <option value="Product Details">Product Details</option>
                      <option value="Performance Metric">Performance Metric</option>
                      <option value="Regulatory Compliance">Regulatory Compliance</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                    Add Verified Fact
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {facts.map((f) => (
                <div key={f.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                        {f.statement}
                      </p>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mt-1 inline-block">
                        {f.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: Approved Assets ── */}
        {activeTab === 'assets' && (
          <div className="space-y-6">
            {canEdit && (
              <form onSubmit={handleAddAsset} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Register Approved Digital Asset</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Asset Name *</label>
                    <input
                      type="text"
                      required
                      value={newAsset.asset_name}
                      onChange={(e) => setNewAsset({ ...newAsset, asset_name: e.target.value })}
                      placeholder="e.g. BrandGuard Vector Primary Lockup"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Asset Type</label>
                    <select
                      value={newAsset.asset_type}
                      onChange={(e) => setNewAsset({ ...newAsset, asset_type: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Primary Logo">Primary Logo</option>
                      <option value="Icon Mark">Icon Mark</option>
                      <option value="Watermark">Watermark</option>
                      <option value="Product Emblem">Product Emblem</option>
                      <option value="Typography Mark">Typography Mark</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Dimensions</label>
                    <input
                      type="text"
                      value={newAsset.dimensions}
                      onChange={(e) => setNewAsset({ ...newAsset, dimensions: e.target.value })}
                      placeholder="e.g. 1200x800"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                    Register Asset
                  </Button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {asset.asset_type}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Approved
                      </span>
                    </div>
                    <div className="h-28 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-3">
                      <ImageIcon className="w-10 h-10 text-slate-400" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {asset.asset_name}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{asset.dimensions || 'Vector'}</span>
                      <span>{asset.file_size_kb ? `${asset.file_size_kb} KB` : 'High-Res'}</span>
                    </div>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 pt-2 border-t border-slate-100 dark:border-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove from Catalog
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: Document Ingestion ── */}
        {activeTab === 'documents' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Upload Brand Guideline Documents (PDF / DOCX)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload formal brand manuals, legal disclosures, or tone standards. BrandGuard AI will parse the document and extract active compliance rules into your knowledge base.
              </p>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition cursor-pointer bg-slate-50/50 dark:bg-slate-950/50">
                <input
                  type="file"
                  id="doc-upload"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="doc-upload" className="cursor-pointer space-y-2 block">
                  <FileText className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {docFile ? docFile.name : 'Click to select PDF or DOCX brand document'}
                  </p>
                  <p className="text-xs text-slate-400">Maximum file size: 10MB</p>
                </label>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Policy Category:</span>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Financial Claims">Financial Claims</option>
                    <option value="Brand Tone">Brand Tone</option>
                    <option value="Legal Disclosures">Legal Disclosures</option>
                    <option value="Terminology">Terminology</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={uploadingDoc}
                  disabled={!docFile}
                >
                  Parse &amp; Ingest Document
                </Button>
              </div>
            </form>

            {docResult && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Document Extracted Successfully</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  {docResult.message} ({docResult.word_count} total words analyzed).
                </p>
                {docResult.sample_extracted_text && (
                  <pre className="p-3 rounded-lg bg-white/70 dark:bg-slate-950 text-[11px] font-mono text-slate-600 dark:text-slate-400 overflow-x-auto">
                    {docResult.sample_extracted_text}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: Advanced Asset Validation ── */}
        {activeTab === 'validation' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Advanced Digital Brand Asset Validation</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Validate creative collateral, logos, and digital artwork against approved assets in your Knowledge Base.
                  Automatically checks file uniqueness, resolution, format standards, and detects unapproved duplicates.
                </p>
              </div>

              <form onSubmit={handleValidateAsset} className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition cursor-pointer bg-slate-50/50 dark:bg-slate-950/50">
                  <input
                    type="file"
                    id="val-upload"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={(e) => setValFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="val-upload" className="cursor-pointer space-y-2 block">
                    <ImageIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {valFile ? valFile.name : 'Select or drag artwork (PNG, JPG, SVG, WEBP)'}
                    </p>
                    <p className="text-xs text-slate-400">Supported formats: PNG, JPG, SVG, WEBP up to 10MB</p>
                  </label>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Expected Type:</span>
                    <select
                      value={valType}
                      onChange={(e) => setValType(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Primary Logo">Primary Logo</option>
                      <option value="Icon Mark">Icon Mark</option>
                      <option value="Watermark">Watermark</option>
                      <option value="Product Emblem">Product Emblem</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={validating}
                    disabled={!valFile}
                  >
                    Run Validation Scan
                  </Button>
                </div>
              </form>

              {/* Validation Report Card */}
              {valReport && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    valReport.valid
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      {valReport.valid ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {valReport.summary}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                          Format: {valReport.file_type} | Size: {valReport.file_size_kb} KB | Dimensions: {valReport.dimensions || 'Vector'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      valReport.valid
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                        : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                    }`}>
                      {valReport.approval_status}
                    </span>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Compliance Inspection Criteria
                    </h5>
                    {valReport.checks.map((chk: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs"
                      >
                        {chk.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{chk.name}</span>
                          <p className="text-slate-600 dark:text-slate-400 mt-0.5">{chk.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fingerprint Footnote */}
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                    <span>SHA-256 Fingerprint:</span>
                    <span className="truncate max-w-xs">{valReport.sha256_hash}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
