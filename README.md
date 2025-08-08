# BSK MT Frontend

## API Key support for public POSTs

This app supports calling protected backend endpoints without a logged-in user by using an API Key in the browser for a small allowlist of routes.

- If a JWT is present (via cookie), requests include `Authorization: Bearer <token>` and no API key is sent.
- If no JWT and the request path is allowlisted (e.g., `/auth/signup`), the client adds `x-api-key: <NEXT_PUBLIC_API_KEY>`.
- Optional signing can be enabled to include `x-request-timestamp` and `x-signature` (HMAC-SHA256 over `method\npath\ntimestamp\nJSON.stringify(body)` using the API key as secret).

### Configuration

Provide per-domain values at build time (CI/CD):

- `NEXT_PUBLIC_API_KEY` – API key for this domain. This is public by design (embedded in the JS bundle). Rotate if leaked.
- `NEXT_PUBLIC_USE_HMAC` – `true` or `false` to enable/disable request signing.

See `.env.example` for variables.

### Centralized HTTP client

- Source: `http/client.ts`
- Allowlist: `apiKeyRoutes` array in `http/client.ts` (default: `['/auth/signup']`). Add paths as needed for additional public endpoints.

### Usage

Use the shared client for requests:

```ts
import http from '@/http/client';

await http.post('/auth/signup', payload);
```

Don’t attempt to set `Origin` or `Referer`; browsers handle that.

### Tests

Run minimal unit tests for header injection logic:

```bash
npm run test
```

### Notes

- Never store the API key in localStorage/sessionStorage.
- Keep HTTPS enforced.
- Avoid logging the API key and signature.
