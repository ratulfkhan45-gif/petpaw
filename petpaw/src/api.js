// Thin client for the Laravel API (petpaw-backend). In dev, Vite proxies /api to http://127.0.0.1:8000.
const BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'petpaw_token';

export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } };
export const setToken = (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch (e) { /* storage unavailable */ } };
export const clearToken = () => { try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* storage unavailable */ } };

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors; // { field: [messages] } from Laravel validation
  }
  /** First message for a field, e.g. err.first('email'). */
  first(field) { return this.errors[field]?.[0]; }
}

async function send(method, path, body, raw = false) {
  const headers = { Accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  } catch (e) {
    throw new ApiError('Can’t reach the PetPaw server. Check that the backend is running and try again.', 0);
  }
  if (!res.ok) {
    let data = {};
    try { data = await res.json(); } catch (e) { /* non-JSON error body */ }
    throw new ApiError(data.message || `Request failed (${res.status})`, res.status, data.errors || {});
  }
  if (raw) return res;
  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (path) => send('GET', path),
  post: (path, body) => send('POST', path, body),
  patch: (path, body) => send('PATCH', path, body),
  /** Fetches a protected file and opens it in a new tab. */
  async openFile(path) {
    const res = await send('GET', path, undefined, true);
    const url = URL.createObjectURL(await res.blob());
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  },
};
