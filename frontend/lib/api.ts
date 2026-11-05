function getApiBase(): string {
  let base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    return 'http://localhost:8000';
  }
  // Strip trailing slashes
  base = base.replace(/\/+$/, '');
  // Strip redundant /api/v1 suffix if user included it in their environment variable
  if (base.endsWith('/api/v1')) {
    base = base.slice(0, -'/api/v1'.length);
  }
  return base;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('brandguard_token');
}

export function setAuthSession(token: string, user: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('brandguard_token', token);
  localStorage.setItem('brandguard_user', JSON.stringify(user));
}

export function getCurrentUser(): any | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('brandguard_user');
  return user ? JSON.parse(user) : null;
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('brandguard_token');
  localStorage.removeItem('brandguard_user');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const base = getApiBase();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${base}${cleanEndpoint}`;

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err: any) {
    throw new Error(`Unable to reach backend API at ${base}. Please ensure backend is running and NEXT_PUBLIC_API_URL is configured.`);
  }

  if (!response.ok) {
    let errorDetail = `API request failed (${response.status})`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // fallback text
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return null as any;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<any>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: { email: string; password: string; full_name: string; role: string }) =>
    request<any>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<any>('/api/v1/auth/me'),

  // Users
  getUsers: () => request<any[]>('/api/v1/users/'),
  updateUser: (id: number, data: any) =>
    request<any>(`/api/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Content
  submitContent: (data: { title: string; original_body: string; channel: string; target_audience: string }, autoReview = true) =>
    request<any>(`/api/v1/content/?auto_review=${autoReview}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listContent: (status?: string, channel?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status_filter', status);
    if (channel) params.append('channel_filter', channel);
    return request<any[]>(`/api/v1/content/?${params.toString()}`);
  },

  getContentById: (id: number | string) => request<any>(`/api/v1/content/${id}`),

  getContentRevisions: (id: number | string) => request<any[]>(`/api/v1/content/${id}/revisions`),

  reviseContent: (id: number | string, data: { current_body: string; change_summary?: string }) =>
    request<any>(`/api/v1/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Review
  getLatestReview: (contentId: number | string) =>
    request<any>(`/api/v1/review/${contentId}/latest`),

  triggerReview: (contentId: number | string) =>
    request<any>(`/api/v1/review/${contentId}/trigger`, { method: 'POST' }),

  handleSuggestion: (suggestionId: number, action: 'accept' | 'reject' | 'manual', customText?: string) =>
    request<any>(`/api/v1/review/suggestions/${suggestionId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, custom_text: customText }),
    }),

  // Approvals & Workflow
  verifyContent: (contentId: number | string, decision: { action: 'verify' | 'request_changes'; comments?: string }) =>
    request<any>(`/api/v1/approvals/verify/${contentId}`, {
      method: 'POST',
      body: JSON.stringify(decision),
    }),

  managerDecision: (contentId: number | string, decision: { action: 'Approved' | 'Rejected' | 'Changes Requested'; comments?: string }) =>
    request<any>(`/api/v1/approvals/decision/${contentId}`, {
      method: 'POST',
      body: JSON.stringify(decision),
    }),

  getComments: (contentId: number | string) => request<any[]>(`/api/v1/approvals/${contentId}/comments`),

  addComment: (contentId: number | string, commentText: string) =>
    request<any>(`/api/v1/approvals/${contentId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment_text: commentText }),
    }),

  getAuditLogs: (limit = 50) => request<any[]>(`/api/v1/approvals/audit-logs?limit=${limit}`),

  // Knowledge Base
  getGuidelines: () => request<any[]>('/api/v1/guidelines/rules'),
  createGuideline: (data: any) =>
    request<any>('/api/v1/guidelines/rules', { method: 'POST', body: JSON.stringify(data) }),
  deleteGuideline: (id: number) =>
    request<void>(`/api/v1/guidelines/rules/${id}`, { method: 'DELETE' }),

  getSources: () => request<any[]>('/api/v1/guidelines/sources'),
  createSource: (data: any) =>
    request<any>('/api/v1/guidelines/sources', { method: 'POST', body: JSON.stringify(data) }),
  deleteSource: (id: number) =>
    request<void>(`/api/v1/guidelines/sources/${id}`, { method: 'DELETE' }),

  getFacts: () => request<any[]>('/api/v1/guidelines/facts'),
  createFact: (data: any) =>
    request<any>('/api/v1/guidelines/facts', { method: 'POST', body: JSON.stringify(data) }),

  getBannedWords: () => request<any[]>('/api/v1/guidelines/banned-words'),
  createBannedWord: (data: any) =>
    request<any>('/api/v1/guidelines/banned-words', { method: 'POST', body: JSON.stringify(data) }),
  deleteBannedWord: (id: number) =>
    request<void>(`/api/v1/guidelines/banned-words/${id}`, { method: 'DELETE' }),

  getTerminology: () => request<any[]>('/api/v1/guidelines/terminology'),
  createTerminology: (data: any) =>
    request<any>('/api/v1/guidelines/terminology', { method: 'POST', body: JSON.stringify(data) }),
  deleteTerminology: (id: number) =>
    request<void>(`/api/v1/guidelines/terminology/${id}`, { method: 'DELETE' }),

  // Analytics
  getAnalytics: () => request<any>('/api/v1/analytics/overview'),
  getUnifiedAnalytics: () => request<any>('/api/v1/analytics/unified'),

  // Threat Intelligence & Digital Protection
  getThreats: (filters?: { category?: string; risk_level?: string; status_filter?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters?.risk_level && filters.risk_level !== 'ALL') params.append('risk_level', filters.risk_level);
    if (filters?.status_filter && filters.status_filter !== 'ALL') params.append('status_filter', filters.status_filter);
    if (filters?.search) params.append('search', filters.search);
    return request<any[]>(`/api/v1/threats/?${params.toString()}`);
  },

  getThreatById: (id: number | string) => request<any>(`/api/v1/threats/${id}`),

  updateThreatStatus: (id: number | string, data: { status?: string; risk_level?: string; notes?: string; assigned_to_id?: number }) =>
    request<any>(`/api/v1/threats/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  createThreat: (data: any) =>
    request<any>('/api/v1/threats/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Digital Protection - Website & Lookalike Domains
  scanDomain: (url: string, autoCreateThreat: boolean = true) =>
    request<any>('/api/v1/protection/domains/scan', {
      method: 'POST',
      body: JSON.stringify({ url, auto_create_threat: autoCreateThreat }),
    }),

  getDomainScanHistory: (limit: number = 50, skip: number = 0) =>
    request<any[]>(`/api/v1/protection/domains/history?limit=${limit}&skip=${skip}`),

  getDomainScanStats: () =>
    request<any>('/api/v1/protection/domains/stats'),

  getDomainScanDetail: (id: number) =>
    request<any>(`/api/v1/protection/domains/${id}`),

  // Digital Protection - Social Media Impersonation
  scanSocialProfile: (data: {
    platform: string;
    handle: string;
    display_name?: string;
    bio_text?: string;
    followers_count?: number;
    following_count?: number;
    is_verified?: boolean;
    auto_create_threat?: boolean;
  }) =>
    request<any>('/api/v1/protection/social/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSocialThreats: (status?: string, limit: number = 50) => {
    const q = status ? `?status_filter=${status}&limit=${limit}` : `?limit=${limit}`;
    return request<any[]>(`/api/v1/protection/social/threats${q}`);
  },

  getSocialStats: () =>
    request<any>('/api/v1/protection/social/stats'),

  // Digital Protection - Counterfeit & Brand Assets
  scanProductListing: (data: {
    marketplace: string;
    listing_title: string;
    listing_url: string;
    seller_name: string;
    listed_price: number;
    sku_or_product_id?: string;
    description?: string;
    auto_create_threat?: boolean;
  }) =>
    request<any>('/api/v1/protection/products/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  scanLogoMisuse: (data: {
    partner_name: string;
    host_url: string;
    asset_name: string;
    has_written_authorization?: boolean;
    is_aspect_ratio_altered?: boolean;
    is_color_palette_modified?: boolean;
    missing_trademark_symbol?: boolean;
    placed_on_unauthorized_collateral?: boolean;
    auto_create_threat?: boolean;
  }) =>
    request<any>('/api/v1/protection/products/logo/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProductCatalog: () =>
    request<any[]>('/api/v1/protection/products/catalog'),

  getBrandAssetCatalog: () =>
    request<any[]>('/api/v1/protection/products/assets'),

  getCounterfeitThreats: (limit: number = 50) =>
    request<any[]>(`/api/v1/protection/products/threats?limit=${limit}`),

  getCounterfeitStats: () =>
    request<any>('/api/v1/protection/products/stats'),
};

