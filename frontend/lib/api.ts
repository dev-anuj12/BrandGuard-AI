const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorDetail = 'API request failed';
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
};
