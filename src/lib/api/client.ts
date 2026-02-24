// =============================================
// API Client — Centralized HTTP client
// =============================================

const TOKEN_KEY = 'algora_supervisor_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function authHeadersMultipart(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body?.message || body?.error || res.statusText;
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const apiClient = {
  async get<T>(url: string): Promise<T> {
    const res = await fetch(url, { method: 'GET', headers: authHeaders() });
    return handleResponse<T>(res);
  },

  async post<T>(url: string, body?: unknown): Promise<T> {
    const res = await fetch(url, { method: 'POST', headers: authHeaders(), body: body ? JSON.stringify(body) : undefined });
    return handleResponse<T>(res);
  },

  async patch<T>(url: string, body?: unknown): Promise<T> {
    const res = await fetch(url, { method: 'PATCH', headers: authHeaders(), body: body ? JSON.stringify(body) : undefined });
    return handleResponse<T>(res);
  },

  async put<T>(url: string, body?: unknown): Promise<T> {
    const res = await fetch(url, { method: 'PUT', headers: authHeaders(), body: body ? JSON.stringify(body) : undefined });
    return handleResponse<T>(res);
  },

  async delete<T>(url: string): Promise<T> {
    const res = await fetch(url, { method: 'DELETE', headers: authHeaders() });
    return handleResponse<T>(res);
  },

  async postMultipart<T>(url: string, formData: FormData): Promise<T> {
    const res = await fetch(url, { method: 'POST', headers: authHeadersMultipart(), body: formData });
    return handleResponse<T>(res);
  },

  async patchMultipart<T>(url: string, formData: FormData): Promise<T> {
    const res = await fetch(url, { method: 'PATCH', headers: authHeadersMultipart(), body: formData });
    return handleResponse<T>(res);
  },
};
