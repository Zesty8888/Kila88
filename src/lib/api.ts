const API_BASE = 'https://kila88.onrender.com/api';

let token = localStorage.getItem('mall_token') || '';

export function setToken(t: string) {
  token = t;
  localStorage.setItem('mall_token', t);
}

export function clearToken() {
  token = '';
  localStorage.removeItem('mall_token');
}

export function getToken() {
  return token;
}

async function request<T = any>(path: string, options?: RequestInit): Promise<{ success: boolean; data?: T; error?: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    return res.json();
  } catch {
    return { success: false, error: '网络错误，请检查连接' };
  }
}

export const api = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, body: any) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(path: string, body: any) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T = any>(path: string) => request<T>(path, { method: 'DELETE' }),
};
