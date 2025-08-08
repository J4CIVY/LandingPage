import { describe, it, expect, beforeEach, vi } from 'vitest';

// Helper to dynamically import the client after setting env vars
async function loadClient() {
  const mod = await import('../http/client');
  return mod;
}

// Minimal axios adapter stub to inspect the request config
function makeAdapter(spy: (config: any) => void) {
  return async (config: any) => {
    spy(config);
    return {
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  };
}

// Ensure global document can be toggled in tests
function setCookie(cookie: string | null) {
  if (cookie == null) {
    // @ts-ignore
    delete global.document;
  } else {
    // @ts-ignore
    global.document = { cookie } as any;
  }
}

describe('http client header injection', () => {
  beforeEach(() => {
    vi.resetModules();
    setCookie(null);
    process.env.NEXT_PUBLIC_API_KEY = 'test-public-key';
    process.env.NEXT_PUBLIC_USE_HMAC = 'false';
  });

  it('does NOT add x-api-key for non-allowlisted route when no JWT', async () => {
    const { createHttpClient } = await loadClient();

    let seen: any = null;
    const http = createHttpClient();
    // @ts-ignore override adapter
    http.defaults.adapter = makeAdapter((c) => (seen = c));

    await http.post('/not-allowlisted', { a: 1 });

    expect(seen.headers['x-api-key']).toBeUndefined();
    expect(seen.headers.Authorization).toBeUndefined();
  });

  it('adds x-api-key for allowlisted route when no JWT', async () => {
    const { createHttpClient } = await loadClient();

    let seen: any = null;
    const http = createHttpClient();
    // @ts-ignore
    http.defaults.adapter = makeAdapter((c) => (seen = c));

    await http.post('/auth/signup', { email: 'a@b.com' });

    expect(seen.headers['x-api-key']).toBe('test-public-key');
    expect(seen.headers.Authorization).toBeUndefined();
  });

  it('adds timestamp and signature when HMAC enabled', async () => {
    process.env.NEXT_PUBLIC_USE_HMAC = 'true';
    const { createHttpClient } = await loadClient();

    let seen: any = null;
    const http = createHttpClient();
    // @ts-ignore
    http.defaults.adapter = makeAdapter((c) => (seen = c));

    await http.post('/auth/signup', { email: 'a@b.com' });

    expect(typeof seen.headers['x-request-timestamp']).toBe('string');
    expect(seen.headers['x-signature']).toMatch(/^[a-f0-9]{64}$/);
  });

  it('prefers JWT Authorization over API key', async () => {
    setCookie('token=jwt-abc');
    const { createHttpClient } = await loadClient();

    let seen: any = null;
    const http = createHttpClient();
    // @ts-ignore
    http.defaults.adapter = makeAdapter((c) => (seen = c));

    await http.post('/auth/signup', { email: 'a@b.com' });

    expect(seen.headers.Authorization).toBe('Bearer jwt-abc');
    expect(seen.headers['x-api-key']).toBeUndefined();
    expect(seen.headers['x-signature']).toBeUndefined();
  });
});
