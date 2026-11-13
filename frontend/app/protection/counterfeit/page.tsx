'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '../../../components/AppLayout';
import { api } from '../../../lib/api';
import { ThreatRiskBadge, ThreatStatusBadge } from '../../../components/Badges';
import { 
  ShoppingBag, ShieldAlert, ShieldCheck, AlertTriangle, ExternalLink, 
  RefreshCw, CheckCircle2, XCircle, Search, Tag, Image as ImageIcon, 
  DollarSign, PackageCheck, FileWarning, Layers, Zap, Building2, Store
} from 'lucide-react';

interface Finding {
  rule_id: string;
  severity: string;
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
}

interface ProductScanReport {
  marketplace: string;
  listing_title: string;
  listing_url: string;
  seller_name: string;
  is_authorized_seller: boolean;
  matched_product: string;
  matched_sku: string;
  official_msrp: number;
  listed_price: number;
  price_disparity_pct: number;
  risk_score: number;
  risk_level: string;
  findings: Finding[];
  recommended_action: string;
  threat_id?: number;
  threat_code?: string;
}

interface LogoScanReport {
  partner_name: string;
  host_url: string;
  asset_name: string;
  has_written_authorization: boolean;
  risk_score: number;
  risk_level: string;
  findings: Finding[];
  recommended_action: string;
  threat_id?: number;
  threat_code?: string;
}

const PRODUCT_PRESETS = [
  {
    name: 'Counterfeit Bond on Marketplace (88% Cut)',
    marketplace: 'AliExpress',
    listing_title: 'SmartGrowth Managed Portfolio 1:1 replica certificate',
    listing_url: 'https://aliexpress.com/item/10042',
    seller_name: 'Shenzhen Liquidity Direct',
    listed_price: 1200.0,
    sku: 'BGD-SGP-01',
    description: '100% replica bond certificate OEM surplus unverified copy.',
    tag: 'Critical / Counterfeit',
  },
  {
    name: 'Unauthorized Reseller on Auction Site',
    marketplace: 'eBay',
    listing_title: 'Prime Yield Flexible Deposit Certificate - Pre-owned',
    listing_url: 'https://ebay.com/itm/3928172',
    seller_name: 'DiscountVouchersUSA',
    listed_price: 16500.0,
    sku: 'BGD-PYD-02',
    description: 'Surplus wealth voucher sold without original guarantee box.',
    tag: 'High / Unauthorized Reseller',
  },
  {
    name: 'Official Authorized Platform Listing',
    marketplace: 'Official Brand Portal',
    listing_title: 'SmartGrowth Managed Portfolio - Direct Subscription',
    listing_url: 'https://brandguard.io/invest/smartgrowth',
    seller_name: 'Official Brand Web Platform',
    listed_price: 10000.0,
    sku: 'BGD-SGP-01',
    description: 'Official direct subscription to SmartGrowth Portfolio.',
    tag: 'Safe / Authorized Channel',
  },
];

const LOGO_PRESETS = [
  {
    name: 'Unlicensed Third-Party Yield Site',
    partner_name: 'Apex Crypto Yield Portal',
    host_url: 'https://apexyields.cc/partners',
    asset_name: 'Brand Primary Corporate Emblem',
    has_auth: false,
    color_mod: true,
    aspect_mod: true,
    missing_tm: true,
    unauthorized_collateral: true,
    tag: 'Critical / Unlicensed Display',
  },
  {
    name: 'Partner with Distorted Mark & Colors',
    partner_name: 'Global FinTech Aggregate Inc',
    host_url: 'https://fintech-aggregator.com',
    asset_name: 'Brand Shield Icon Mark',
    has_auth: true,
    color_mod: true,
    aspect_mod: true,
    missing_tm: true,
    unauthorized_collateral: false,
    tag: 'Medium / Brand Guideline Breach',
  },
  {
    name: 'Compliant Licensed Distribution Partner',
    partner_name: 'Authorized Partner Branch Network',
    host_url: 'https://partner-portal.example.com/brand',
    asset_name: 'Brand Verified Trust Badge',
    has_auth: true,
    color_mod: false,
    aspect_mod: false,
    missing_tm: false,
    unauthorized_collateral: false,
    tag: 'Safe / Certified Partner',
  },
];

export default function CounterfeitProtectionPage() {
  const [activeTab, setActiveTab] = useState<'product' | 'logo'>('product');

  // Product Scanner State
  const [marketplace, setMarketplace] = useState('AliExpress');
  const [listingTitle, setListingTitle] = useState('');
  const [listingUrl, setListingUrl] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [listedPrice, setListedPrice] = useState<number | ''>('');
  const [productSku, setProductSku] = useState('FNV-SGP-01');
  const [productDesc, setProductDesc] = useState('');
  const [autoEscalateProduct, setAutoEscalateProduct] = useState(true);

  // Logo Scanner State
  const [partnerName, setPartnerName] = useState('');
  const [hostUrl, setHostUrl] = useState('');
  const [assetName, setAssetName] = useState('Brand Primary Corporate Emblem');
  const [hasWrittenAuth, setHasWrittenAuth] = useState(false);
  const [isColorMod, setIsColorMod] = useState(false);
  const [isAspectMod, setIsAspectMod] = useState(false);
  const [isMissingTm, setIsMissingTm] = useState(false);
  const [isUnauthorizedCollateral, setIsUnauthorizedCollateral] = useState(false);
  const [autoEscalateLogo, setAutoEscalateLogo] = useState(true);

  // Results State
  const [scanning, setScanning] = useState(false);
  const [productReport, setProductReport] = useState<ProductScanReport | null>(null);
  const [logoReport, setLogoReport] = useState<LogoScanReport | null>(null);
  const [threats, setThreats] = useState<any[]>([]);
  const [productsCatalog, setProductsCatalog] = useState<any[]>([]);
  const [assetsCatalog, setAssetsCatalog] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total_counterfeit_threats: 0,
    critical_high_threats: 0,
    takedowns_resolved: 0,
    registered_products: 0,
    registered_brand_assets: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const loadData = async () => {
    try {
      const [threatsData, catalogData, assetsData, statsData] = await Promise.all([
        api.getCounterfeitThreats(),
        api.getProductCatalog(),
        api.getBrandAssetCatalog(),
        api.getCounterfeitStats(),
      ]);
      setThreats(threatsData || []);
      setProductsCatalog(catalogData || []);
      setAssetsCatalog(assetsData || []);
      setStats(statsData || {});
    } catch (err) {
      console.error('Failed to load protection catalog data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProductScan = async (preset?: typeof PRODUCT_PRESETS[0]) => {
    const targetMarketplace = preset ? preset.marketplace : marketplace;
    const targetTitle = preset ? preset.listing_title : listingTitle;
    const targetUrl = preset ? preset.listing_url : listingUrl;
    const targetSeller = preset ? preset.seller_name : sellerName;
    const targetPrice = preset ? preset.listed_price : Number(listedPrice);
    const targetSku = preset ? preset.sku : productSku;
    const targetDesc = preset ? preset.description : productDesc;

    if (!targetTitle.trim()) {
      setErrorMessage('Please provide a listing title.');
      return;
    }
    if (isNaN(targetPrice) || targetPrice <= 0) {
      setErrorMessage('Please provide a valid listed price.');
      return;
    }

    setScanning(true);
    setErrorMessage(null);

    try {
      const report = await api.scanProductListing({
        marketplace: targetMarketplace,
        listing_title: targetTitle,
        listing_url: targetUrl || `https://${targetMarketplace.toLowerCase()}.com/item/test`,
        seller_name: targetSeller || 'Unknown Merchant',
        listed_price: targetPrice,
        sku_or_product_id: targetSku,
        description: targetDesc,
        auto_create_threat: autoEscalateProduct,
      });

      setProductReport(report);
      setLogoReport(null);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Product listing scan failed.');
      setProductReport(null);
    } finally {
      setScanning(false);
    }
  };

  const handleLogoScan = async (preset?: typeof LOGO_PRESETS[0]) => {
    const targetPartner = preset ? preset.partner_name : partnerName;
    const targetUrl = preset ? preset.host_url : hostUrl;
    const targetAsset = preset ? preset.asset_name : assetName;
    const targetAuth = preset ? preset.has_auth : hasWrittenAuth;
    const targetColor = preset ? preset.color_mod : isColorMod;
    const targetAspect = preset ? preset.aspect_mod : isAspectMod;
    const targetTm = preset ? preset.missing_tm : isMissingTm;
    const targetCollateral = preset ? preset.unauthorized_collateral : isUnauthorizedCollateral;

    if (!targetPartner.trim()) {
      setErrorMessage('Please specify the partner or entity name.');
      return;
    }

    setScanning(true);
    setErrorMessage(null);

    try {
      const report = await api.scanLogoMisuse({
        partner_name: targetPartner,
        host_url: targetUrl || 'https://partner-portal.com',
        asset_name: targetAsset,
        has_written_authorization: targetAuth,
        is_color_palette_modified: targetColor,
        is_aspect_ratio_altered: targetAspect,
        missing_trademark_symbol: targetTm,
        placed_on_unauthorized_collateral: targetCollateral,
        auto_create_threat: autoEscalateLogo,
      });

      setLogoReport(report);
      setProductReport(null);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Logo misuse analysis failed.');
      setLogoReport(null);
    } finally {
      setScanning(false);
    }
  };

  const applyProductPreset = (p: typeof PRODUCT_PRESETS[0]) => {
    setMarketplace(p.marketplace);
    setListingTitle(p.listing_title);
    setListingUrl(p.listing_url);
    setSellerName(p.seller_name);
    setListedPrice(p.listed_price);
    setProductSku(p.sku);
    setProductDesc(p.description);
    handleProductScan(p);
  };

  const applyLogoPreset = (l: typeof LOGO_PRESETS[0]) => {
    setPartnerName(l.partner_name);
    setHostUrl(l.host_url);
    setAssetName(l.asset_name);
    setHasWrittenAuth(l.has_auth);
    setIsColorMod(l.color_mod);
    setIsAspectMod(l.aspect_mod);
    setIsMissingTm(l.missing_tm);
    setIsUnauthorizedCollateral(l.unauthorized_collateral);
    handleLogoScan(l);
  };

  return (
    <AppLayout
      pageTitle="Counterfeit & Brand Asset Protection"
      breadcrumbs={[
        { label: 'Overview', href: '/dashboard' },
        { label: 'Counterfeit & Assets', href: '/protection/counterfeit' },
      ]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Counterfeit Products & Logo Misuse
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Autonomous inspection of marketplace listings, extreme price undercutting, unauthorized vendors, and trademark visual distortion.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Catalog Items Monitored: <strong className="text-slate-900 dark:text-white font-semibold">{stats.registered_products} Products / {stats.registered_brand_assets} Assets</strong></span>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Infringements Flagged
              </span>
              <FileWarning className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.total_counterfeit_threats}
              </span>
              <span className="text-xs text-slate-400">listings</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Critical IP Violations
              </span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {stats.critical_high_threats}
              </span>
              <span className="text-xs text-slate-400">severe</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Registered Products
              </span>
              <PackageCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.registered_products}
              </span>
              <span className="text-xs text-slate-400">active SKUs</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Brand Asset Marks
              </span>
              <ImageIcon className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.registered_brand_assets}
              </span>
              <span className="text-xs text-slate-400">signatures</span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('product')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'product'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Marketplace Product Authenticity Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('logo')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'logo'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Logo & Trademark Usage Inspector</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-sm flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div>
              <strong className="font-semibold">Inspection Error:</strong>
              <p className="mt-0.5 text-xs">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* TAB A: Product Listing Scanner */}
        {activeTab === 'product' && (
          <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Search className="w-4 h-4 text-indigo-500" />
              <span>Evaluate Marketplace Product Listing</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Marketplace Platform
                </label>
                <select
                  value={marketplace}
                  onChange={(e) => setMarketplace(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="AliExpress">AliExpress</option>
                  <option value="Amazon">Amazon</option>
                  <option value="eBay">eBay</option>
                  <option value="Flipkart">Flipkart</option>
                  <option value="Shopee">Shopee</option>
                  <option value="Telegram Shop">Telegram Channel Shop</option>
                  <option value="Official Brand Portal">Official Brand Portal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Official Brand SKU to Verify
                </label>
                <select
                  value={productSku}
                  onChange={(e) => setProductSku(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                >
                  {productsCatalog.map((p) => (
                    <option key={p.id} value={p.sku}>
                      {p.sku} — {p.product_name} (${p.official_msrp.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Offered Price ($ USD)
                </label>
                <input
                  type="number"
                  value={listedPrice}
                  onChange={(e) => setListedPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 1200.00"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Listing Title as Published
                </label>
                <input
                  type="text"
                  value={listingTitle}
                  onChange={(e) => setListingTitle(e.target.value)}
                  placeholder="e.g. SmartGrowth Portfolio certificate 1:1 replica"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Seller / Merchant Entity Name
                </label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="e.g. Shenzhen Liquidity Direct"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Listing URL & Description Text
              </label>
              <textarea
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                rows={2}
                placeholder="Paste listing description text or notes to check for 'OEM surplus', '1:1 replica', or 'unauthorized authentic' flags..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoEscalateProduct}
                  onChange={(e) => setAutoEscalateProduct(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <span>Auto-register severe counterfeit infractions (&ge; 60%) to Threat Intel</span>
              </label>

              <button
                onClick={() => handleProductScan()}
                disabled={scanning || !listingTitle.trim()}
                className="px-6 py-2.5 rounded-lg font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center space-x-2"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Listing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Analyze Listing</span>
                  </>
                )}
              </button>
            </div>

            {/* Dev Presets Row */}
            {process.env.NODE_ENV === 'development' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                  Quick Test Targets (Dev Only):
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyProductPreset(p)}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                        {p.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB B: Logo Misuse Scanner */}
        {activeTab === 'logo' && (
          <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-indigo-500" />
              <span>Inspect Logo & Trademark Asset Usage</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Partner / Entity Displaying Asset
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. Apex High-Yield Lending Portal"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Host Web Address / Destination URL
                </label>
                <input
                  type="text"
                  value={hostUrl}
                  onChange={(e) => setHostUrl(e.target.value)}
                  placeholder="e.g. https://apexyields.cc/partners"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Brand Asset Tested
                </label>
                <select
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {assetsCatalog.map((a) => (
                    <option key={a.id} value={a.asset_name}>
                      {a.asset_name} ({a.asset_type})
                    </option>
                  ))}
                  <option value="Brand Primary Corporate Emblem">Brand Primary Corporate Emblem</option>
                </select>
              </div>
            </div>

            {/* Compliance Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs">
              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWrittenAuth}
                  onChange={(e) => setHasWrittenAuth(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <span>Entity possesses a signed Brand Partner License Agreement</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isColorMod}
                  onChange={(e) => setIsColorMod(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <span className="text-rose-600 dark:text-rose-400 font-medium">Color Palette Modified (Non-standard hues / gradient)</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAspectMod}
                  onChange={(e) => setIsAspectMod(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <span className="text-amber-600 dark:text-amber-400 font-medium">Aspect Ratio Altered (Distorted or stretched mark)</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnauthorizedCollateral}
                  onChange={(e) => setIsUnauthorizedCollateral(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Affixed to Prohibited Product / Predatory Crypto Offer</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoEscalateLogo}
                  onChange={(e) => setAutoEscalateLogo(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <span>Auto-register trademark infringement (&ge; 60%) to Threat Intel</span>
              </label>

              <button
                onClick={() => handleLogoScan()}
                disabled={scanning || !partnerName.trim()}
                className="px-6 py-2.5 rounded-lg font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center space-x-2"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Trademark Usage...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Inspect Trademark Asset</span>
                  </>
                )}
              </button>
            </div>

            {/* Dev Presets Row */}
            {process.env.NODE_ENV === 'development' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                  Quick Test Targets (Dev Only):
                </span>
                <div className="flex flex-wrap gap-2">
                  {LOGO_PRESETS.map((l, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyLogoPreset(l)}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">{l.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                        {l.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Product Diagnostic Report */}
        {productReport && (
          <div className="rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden animate-in fade-in duration-300">
            <div className={`p-5 border-b ${
              productReport.risk_score >= 80 
                ? 'bg-rose-500/10 border-rose-200 dark:border-rose-900/60' 
                : productReport.risk_score >= 60
                ? 'bg-amber-500/10 border-amber-200 dark:border-amber-900/60'
                : 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/60'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <ThreatRiskBadge risk={productReport.risk_level as any} />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {productReport.matched_product}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      {productReport.matched_sku}
                    </span>
                    {productReport.threat_code && (
                      <Link 
                        href="/threats"
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:underline"
                      >
                        <span>{productReport.threat_code}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Marketplace: <span className="font-semibold text-slate-800 dark:text-slate-200">{productReport.marketplace}</span> &bull; Seller: <span className="font-medium text-slate-700 dark:text-slate-300">"{productReport.seller_name}"</span> &bull; Title: <span className="font-mono text-slate-600 dark:text-slate-400">"{productReport.listing_title}"</span>
                  </p>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                      Price Disparity
                    </span>
                    <p className={`text-xl font-bold ${
                      productReport.price_disparity_pct >= 50 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {productReport.price_disparity_pct > 0 ? `-${productReport.price_disparity_pct}%` : `${productReport.price_disparity_pct}%`}
                    </p>
                    <span className="text-[10px] text-slate-400">MSRP ${productReport.official_msrp.toLocaleString()} vs Listed ${productReport.listed_price.toLocaleString()}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                      Counterfeit Risk
                    </span>
                    <p className={`text-2xl font-black ${
                      productReport.risk_score >= 80 ? 'text-rose-600 dark:text-rose-400' :
                      productReport.risk_score >= 60 ? 'text-amber-600 dark:text-amber-400' :
                      'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {productReport.risk_score}
                      <span className="text-xs font-normal text-slate-400"> / 100</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Playbook */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-amber-500/5">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                Remediation Playbook
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                {productReport.recommended_action}
              </p>
            </div>

            {/* Findings */}
            <div className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Technical Evidence Findings ({productReport.findings?.length || 0})
              </h3>
              <div className="space-y-3">
                {productReport.findings?.map((f, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          f.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400' :
                          f.severity === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-400' :
                          'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {f.severity}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{f.title}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{f.rule_id}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{f.description}</p>
                    <div className="text-xs bg-slate-100 dark:bg-slate-800/80 p-2 rounded border border-slate-200/60 dark:border-slate-700/60 font-mono text-slate-700 dark:text-slate-300">
                      <strong>Evidence:</strong> {f.evidence}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Logo Diagnostic Report */}
        {logoReport && (
          <div className="rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden animate-in fade-in duration-300">
            <div className={`p-5 border-b ${
              logoReport.risk_score >= 80 
                ? 'bg-rose-500/10 border-rose-200 dark:border-rose-900/60' 
                : logoReport.risk_score >= 60
                ? 'bg-amber-500/10 border-amber-200 dark:border-amber-900/60'
                : 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/60'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <ThreatRiskBadge risk={logoReport.risk_level as any} />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {logoReport.partner_name}
                    </h2>
                    {logoReport.threat_code && (
                      <Link 
                        href="/threats"
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:underline"
                      >
                        <span>{logoReport.threat_code}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Asset Inspected: <span className="font-semibold text-slate-800 dark:text-slate-200">{logoReport.asset_name}</span> &bull; URL: <a href={logoReport.host_url} target="_blank" rel="noopener noreferrer" className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline">{logoReport.host_url}</a>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Trademark Misuse Score
                  </span>
                  <p className={`text-2xl font-black ${
                    logoReport.risk_score >= 80 ? 'text-rose-600 dark:text-rose-400' :
                    logoReport.risk_score >= 60 ? 'text-amber-600 dark:text-amber-400' :
                    'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {logoReport.risk_score}
                    <span className="text-xs font-normal text-slate-400"> / 100</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-amber-500/5">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                Remediation Playbook
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                {logoReport.recommended_action}
              </p>
            </div>

            <div className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Trademark Evidence ({logoReport.findings?.length || 0})
              </h3>
              <div className="space-y-3">
                {logoReport.findings?.map((f, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          f.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400' :
                          f.severity === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-400' :
                          'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {f.severity}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{f.title}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{f.rule_id}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{f.description}</p>
                    <div className="text-xs bg-slate-100 dark:bg-slate-800/80 p-2 rounded border border-slate-200/60 dark:border-slate-700/60 font-mono text-slate-700 dark:text-slate-300">
                      <strong>Evidence:</strong> {f.evidence}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Counterfeit & Asset Threat Registry Table */}
        <div className="rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Marketplace & Trademark Threat Registry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active counterfeit listings, unauthorized vendors, and trademark misuse incidents
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              title="Refresh Registry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Threat Code</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Title / Vendor</th>
                  <th className="py-3 px-3">Source URL</th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {threats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      {loadingData ? 'Loading registry...' : 'No counterfeit or trademark threats recorded.'}
                    </td>
                  </tr>
                ) : (
                  threats.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-rose-600 dark:text-rose-400 font-semibold">
                        <Link href="/threats" className="hover:underline">
                          {t.threat_code}
                        </Link>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {t.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {t.explanation}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        <a 
                          href={t.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                        >
                          <span className="truncate max-w-[150px]">{t.source_url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3 px-3">
                        <ThreatRiskBadge risk={t.risk_level} />
                      </td>
                      <td className="py-3 px-3">
                        <ThreatStatusBadge status={t.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href="/threats"
                          className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-[11px] font-medium"
                        >
                          Triage in Intel
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

