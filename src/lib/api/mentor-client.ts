const TOKEN_KEY = 'algora_mentor_token';

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
    throw new Error(body?.message || body?.error || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const mentorApiClient = {
  async get<T>(url: string): Promise<T> {
    return handleResponse<T>(await fetch(url, { method: 'GET', headers: authHeaders() }));
  },
  async post<T>(url: string, body?: unknown): Promise<T> {
    return handleResponse<T>(await fetch(url, { method: 'POST', headers: authHeaders(), body: body ? JSON.stringify(body) : undefined }));
  },
  async patch<T>(url: string, body?: unknown): Promise<T> {
    return handleResponse<T>(await fetch(url, { method: 'PATCH', headers: authHeaders(), body: body ? JSON.stringify(body) : undefined }));
  },
  async put<T>(url: string, body?: unknown): Promise<T> {
    return handleResponse<T>(await fetch(url, { method: 'PUT', headers: authHeaders(), body: body ? JSON.stringify(body) : undefined }));
  },
  async delete<T>(url: string): Promise<T> {
    return handleResponse<T>(await fetch(url, { method: 'DELETE', headers: authHeaders() }));
  },
  async postMultipart<T>(url: string, formData: FormData): Promise<T> {
    return handleResponse<T>(await fetch(url, { method: 'POST', headers: authHeadersMultipart(), body: formData }));
  },
  async patchMultipart<T>(url: string, formData: FormData): Promise<T> {
    return handleResponse<T>(await fetch(url, { method: 'PATCH', headers: authHeadersMultipart(), body: formData }));
  },
};
