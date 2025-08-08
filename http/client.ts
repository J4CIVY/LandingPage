import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Build-time env (Next.js exposes NEXT_PUBLIC_* to the browser)
const PUBLIC_API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
const USE_HMAC = (process.env.NEXT_PUBLIC_USE_HMAC || 'false').toLowerCase() === 'true';

// Central allowlist (pathnames) where API key is allowed when no JWT is present
// Adjust as needed for new public endpoints
export const apiKeyRoutes: string[] = ['/auth/signup'];

// Base URL for the backend API
const BASE_URL = 'https://api.bskmt.com/api/v1';

// Lightweight JWT retriever: looks in cookies for common token names.
// Adjust to your auth storage if different.
function getJwtToken(): string | null {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie || '';
  const names = ['token', 'access_token', 'jwt'];
  for (const name of names) {
    const m = cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    if (m) return decodeURIComponent(m[1]);
  }
  return null;
}

// HMAC-SHA256 using Web Crypto API if available; falls back to Node crypto in SSR/tests
export async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const g: any = globalThis as any;
  if (!g.crypto?.subtle) {
    throw new Error('Web Crypto API is not available to compute HMAC-SHA256');
  }
  const enc = new TextEncoder();
  const key = await g.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await g.crypto.subtle.sign('HMAC', key, enc.encode(message));
  return bufferToHex(sig);
}

function bufferToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    const h = bytes[i].toString(16).padStart(2, '0');
    hex += h;
  }
  return hex;
}

function resolvePathname(url?: string, baseURL?: string): string {
  const base = baseURL || BASE_URL;
  let basePath = '/';
  try {
    basePath = new URL(base).pathname.replace(/\/$/, '') || '/';
  } catch {
    basePath = '/';
  }

  const u = url || '';
  // Absolute URL
  if (/^https?:\/\//i.test(u)) {
    try { return new URL(u).pathname; } catch { return u; }
  }
  // Leading slash -> axios concatenates base path + url
  if (u.startsWith('/')) {
    return (basePath + u).replace(/\/+/g, '/');
  }
  // Relative path
  return (basePath + '/' + u).replace(/\/+/g, '/');
}

function isApiKeyAllowedPath(url?: string, baseURL?: string): boolean {
  const pathname = resolvePathname(url, baseURL);
  return apiKeyRoutes.some((p) => pathname === p || pathname.endsWith(p));
}

async function maybeSign(
  config: AxiosRequestConfig,
  apiKey: string
): Promise<Record<string, string>> {
  if (!USE_HMAC) return {};

  const method = (config.method || 'GET').toUpperCase();
  const url = new URL(config.url || '', (config.baseURL as string) || BASE_URL);
  const path = url.pathname;
  const timestamp = Math.floor(Date.now() / 1000).toString();

  let body: any = {};
  if (config.data) {
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      body = config.data; // leave as-is if not JSON parseable
    }
  }

  const payload = `${method}\n${path}\n${timestamp}\n${JSON.stringify(body || {})}`;
  const signature = await hmacSha256Hex(payload, apiKey);

  return {
    'x-request-timestamp': timestamp,
    'x-signature': signature,
  };
}

export function createHttpClient(): AxiosInstance {
  const instance = axios.create({ baseURL: BASE_URL });

  instance.interceptors.request.use(async (config) => {
    // Inject JWT if present
    const token = getJwtToken();
    if (token) {
      const headers: Record<string, any> = (axios.AxiosHeaders && config.headers instanceof axios.AxiosHeaders)
        ? (config.headers as any).toJSON?.() || {}
        : { ...(config.headers as any) };
      config.headers = {
        ...headers,
        Authorization: `Bearer ${token}`,
      } as any;
      return config; // Early return: JWT path wins
    }

    // Otherwise, if path allowlisted, inject API key (and optional HMAC)
    if (PUBLIC_API_KEY && isApiKeyAllowedPath(config.url, (config.baseURL as string) || BASE_URL)) {
      const extra = await maybeSign(config, PUBLIC_API_KEY);
      const headers: Record<string, any> = (axios.AxiosHeaders && config.headers instanceof axios.AxiosHeaders)
        ? (config.headers as any).toJSON?.() || {}
        : { ...(config.headers as any) };
      config.headers = {
        ...headers,
        'x-api-key': PUBLIC_API_KEY,
        ...extra,
      } as any;
    }

    return config;
  });

  return instance;
}

// Default shared instance
const http = createHttpClient();
export default http;
