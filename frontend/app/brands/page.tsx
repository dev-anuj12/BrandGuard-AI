'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Plus, CheckCircle2, ShieldCheck, BarChart3, 
  Layers, ArrowRight, ExternalLink, RefreshCw, AlertCircle
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { api, getCurrentUser } from '../../lib/api';
import { getActiveBrand, setActiveBrand, ActiveBrand } from '../../lib/brandContext';

export default function BrandsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [activeBrand, setLocalActiveBrand] = useState<ActiveBrand | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('Financial Services');

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await api.getBrands();
      setBrands(data || []);
      const current = getActiveBrand();
      if (current) {
        setLocalActiveBrand(current);
      } else if (data && data.length > 0) {
        const defaultBrand = { id: data[0].id, name: data[0].name, code: data[0].code };
        setActiveBrand(defaultBrand);
        setLocalActiveBrand(defaultBrand);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load brands.', 'error');
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
    loadBrands();
  }, [router]);

  const handleSelectBrand = (brand: any) => {
    const newActive: ActiveBrand = { id: brand.id, name: brand.name, code: brand.code };
    setActiveBrand(newActive);
    setLocalActiveBrand(newActive);
    showToast(`Switched active workspace to "${brand.name}".`, 'success');
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      showToast('Please enter both brand name and unique code.', 'error');
      return;
    }
    setCreating(true);
    try {
      const created = await api.createBrand({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        industry: industry.trim() || 'Financial Services'
      });
      showToast(`Brand "${created.name}" created successfully.`, 'success');
      setName('');
      setCode('');
      setDescription('');
      setShowModal(false);
      await loadBrands();
      handleSelectBrand(created);
    } catch (err: any) {
      showToast(err.message || 'Failed to create brand.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const canCreate = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

  return (
    <AppLayout
      pageTitle="Multi-Brand Workspace"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Brands & Workspaces' }
      ]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Building2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Enterprise Multi-Brand Governance
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage multiple sub-brands, business units, and portfolio entities under your organization with complete tenant isolation.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadBrands}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Refresh brands"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {canCreate && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowModal(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Brand</span>
              </Button>
            )}
          </div>
        </div>

        {/* Active Brand Banner */}
        {activeBrand && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                  Active Brand Context
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{activeBrand.name}</span>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {activeBrand.code}
                  </span>
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
              All compliance scans, guideline checks, and submissions are scoped to this brand.
            </p>
          </div>
        )}

        {/* Brands Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : brands.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No Brands Found"
            description="Create your first enterprise brand or portfolio entity to start segmenting compliance rules."
            actionLabel={canCreate ? "Create First Brand" : undefined}
            onAction={canCreate ? () => setShowModal(true) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {brands.map((brand) => {
              const isActive = activeBrand?.id === brand.id;
              return (
                <div
                  key={brand.id}
                  className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 flex flex-col justify-between ${
                    isActive
                      ? 'border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-card'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-sm text-indigo-600 dark:text-indigo-400">
                          {brand.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {brand.name}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {brand.code}
                          </span>
                        </div>
                      </div>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                      {brand.description || 'Enterprise sub-brand workspace with dedicated compliance policies and asset catalog.'}
                    </p>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Industry:</span>
                      <span>{brand.industry}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleSelectBrand(brand)}
                      disabled={isActive}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default'
                          : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                        </>
                      ) : (
                        <>
                          <span>Switch to Brand</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Brand Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-dropdown space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Brand Workspace
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateBrand} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. BrandGuard Wealth"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Brand Identifier Code * (Uppercase, e.g. BGAI-WLTH)
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BGAI-WLTH"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Industry / Sector
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Wealth Management"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Description &amp; Guidelines Context
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe target audience and key brand positioning..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={creating}
                  >
                    Create Brand
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
