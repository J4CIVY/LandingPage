# Security Implementation Guide - BSK Motorcycle Team

## 📋 Table of Contents
1. [Security Headers](#security-headers)
2. [Authentication & Session Management](#authentication--session-management)
3. [CSRF Protection](#csrf-protection)
4. [Input Validation & Sanitization](#input-validation--sanitization)
5. [Rate Limiting](#rate-limiting)
6. [Content Security Policy (CSP)](#content-security-policy-csp)
7. [Data Storage Security](#data-storage-security)
8. [Third-Party Integrations](#third-party-integrations)
9. [Security Best Practices](#security-best-practices)
10. [Security Audit Tools](#security-audit-tools)

---

## 🛡️ Security Headers

### Implementation Location
- `middleware.ts` - Edge runtime middleware
- `next.config.mjs` - Static headers configuration

### Headers Implemented

#### 1. **X-Content-Type-Options: nosniff**
- **Purpose**: Prevents MIME-type sniffing attacks
- **Impact**: Browsers won't try to "guess" content types, reducing XSS risk
- **Status**: ✅ Implemented

#### 2. **X-Frame-Options: DENY**
- **Purpose**: Prevents clickjacking attacks
- **Impact**: Site cannot be embedded in iframes
- **Status**: ✅ Implemented

#### 3. **Strict-Transport-Security (HSTS)**
- **Value**: `max-age=31536000; includeSubDomains; preload`
- **Purpose**: Forces HTTPS connections for 1 year
- **Impact**: Prevents man-in-the-middle attacks
- **Status**: ✅ Implemented (production only)

#### 4. **Referrer-Policy: strict-origin-when-cross-origin**
- **Purpose**: Controls referrer information sent to other sites
- **Impact**: Protects user privacy and prevents information leakage
- **Status**: ✅ Implemented

#### 5. **Permissions-Policy**
- **Purpose**: Restricts browser feature access
- **Restrictions**:
  - Camera: Disabled
  - Microphone: Disabled
  - Geolocation: Same-origin only
  - Payment: Self + Bold checkout
  - USB/Bluetooth: Disabled
  - Interest-cohort (FLoC): Disabled
- **Status**: ✅ Implemented

#### 6. **Content-Security-Policy (CSP)**
- **Purpose**: Prevents XSS and data injection attacks
- **Implementation**: Nonce-based for inline scripts
- **Status**: ✅ Implemented (see CSP section below)

---

## 🔐 Authentication & Session Management

### Implementation Files
- `lib/auth-utils.ts` - Core authentication utilities
- `lib/auth-admin.ts` - Admin role verification
- `hooks/useAuth.tsx` - Client-side auth context
- `middleware.ts` - Route protection

### Security Measures

#### 1. **JWT Token Management**
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days), httpOnly cookie
- **Signing Algorithm**: RS256 with environment-based secrets
- **Validation**: Issuer, audience, expiration checks

#### 2. **Password Security**
- **Hashing**: bcrypt with salt rounds (automatic via mongoose)
- **Strength Requirements**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character

#### 3. **Session Management**
- **Device Tracking**: IP, User-Agent, Browser, OS
- **Multi-Session Support**: Users can have multiple active sessions
- **Session Invalidation**: On logout, all user sessions are cleared
- **Automatic Expiration**: Sessions expire based on JWT expiration

#### 4. **Account Protection**
- **Login Attempt Limiting**: Max 5 failed attempts
- **Account Lockout**: 15-minute lockout after 5 failed attempts
- **Email Verification**: Required before first login
- **2FA Support**: Infrastructure ready (not yet enabled)

---

## 🛡️ CSRF Protection

### Implementation Files
- `lib/csrf-protection.ts` - Server-side CSRF utilities
- `lib/csrf-client.ts` - Client-side CSRF helpers
- `hooks/useCSRFToken.tsx` - React hook for CSRF tokens

### Implementation Details

#### **Double Submit Cookie Pattern**
1. Server generates cryptographically random token
2. Token stored in two places:
   - httpOnly cookie (not accessible to JS)
   - Readable cookie (accessible to JS for header inclusion)
3. Client includes token in `x-csrf-token` header
4. Server validates token match using timing-safe comparison

#### **Protected Methods**
- POST
- PUT
- PATCH
- DELETE

#### **Exceptions**
- `/api/auth/login` - No CSRF (users don't have session yet)
- `/api/auth/register` - No CSRF (users don't have session yet)
- GET requests - No CSRF needed

#### **Usage Example**
```typescript
import { csrfFetch } from '@/lib/csrf-client';

// Automatic CSRF token inclusion
const response = await csrfFetch('/api/events', {
  method: 'POST',
  body: JSON.stringify(eventData)
});
```

---

## ✅ Input Validation & Sanitization

### Implementation Files
- `lib/validation-schemas.ts` - Zod validation schemas
- `lib/input-sanitization.ts` - XSS prevention utilities
- `lib/api-utils.ts` - API validation helpers

### Validation Layers

#### 1. **Client-Side Validation** (UX)
- React Hook Form with Zod resolvers
- Immediate user feedback
- Reduces unnecessary API calls

#### 2. **Server-Side Validation** (Security)
- Zod schemas on all API routes
- Never trust client input
- Validates data types, ranges, formats

#### 3. **Database-Level Validation** (Data Integrity)
- Mongoose schemas with validators
- Unique constraints
- Required fields enforcement

### Sanitization Functions

```typescript
// Prevent XSS attacks
sanitizeHtml(userInput) // Escapes HTML entities

// Validate and clean URLs
sanitizeUrl(url) // Only allows http(s), mailto, tel protocols

// Clean filenames
sanitizeFilename(filename) // Prevents directory traversal

// Validate emails
sanitizeEmail(email) // RFC 5322 validation

// Clean phone numbers
sanitizePhone(phone) // Removes non-numeric except +

// Deep sanitize objects
deepSanitize(object) // Recursively sanitizes all strings
```

---

## ⏱️ Rate Limiting

### Implementation Files
- `lib/distributed-rate-limit.ts` - Redis-backed rate limiting
- `lib/redis-client.ts` - Redis connection management

### Strategy: Multi-Factor Rate Limiting

#### **Identification Factors**
1. **IP Address**: Primary identifier
2. **Device Fingerprint**: User-Agent + Headers
3. **User ID**: For authenticated requests

#### **Key Generation**
```
ratelimit:{endpoint}:{ip}:{fingerprint}[:user:{userId}]
```

### Rate Limit Presets

| Endpoint | Max Requests | Window | Description |
|----------|--------------|--------|-------------|
| Login | 5 | 15 min | Prevent brute force |
| Register | 3 | 1 hour | Prevent spam accounts |
| API | 100 | 1 min | General API protection |
| Upload | 10 | 5 min | Prevent abuse |
| Password Reset | 3 | 1 hour | Prevent spam |
| Email Verification | 5 | 1 hour | Prevent spam |

### Response Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
Retry-After: 60 (if rate limited)
```

### Fallback Strategy
- **Production**: Redis-backed (distributed)
- **Development**: In-memory (single instance)
- **On Redis Failure**: Fail open (allow requests to maintain availability)

---

## 🔒 Content Security Policy (CSP)

### Implementation Files
- `lib/csp-nonce.ts` - Nonce generation and CSP headers
- `middleware.ts` - CSP header injection
- `app/layout.tsx` - Nonce usage in inline styles

### CSP Directives

```
default-src 'self';
script-src 'self' 'nonce-{NONCE}' 'strict-dynamic' [trusted-domains];
style-src 'self' 'nonce-{NONCE}' 'unsafe-inline' [trusted-domains];
img-src 'self' data: https: blob: [trusted-domains];
font-src 'self' https://fonts.gstatic.com data:;
connect-src 'self' [trusted-apis];
media-src 'self' https: data: blob:;
worker-src 'self' blob:;
object-src 'none';
frame-src [trusted-iframes];
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
block-all-mixed-content;
```

### Trusted Domains

#### **Scripts**
- Google Analytics / Tag Manager
- Google Maps
- Cloudflare Insights
- Facebook Pixel
- Bold Payment Checkout
- reCAPTCHA

#### **Images**
- Cloudinary (CDN)
- Unsplash
- Facebook

#### **Frames**
- Google Maps
- Facebook
- Bold Payment
- Government sites (SIRE, SAB)
- reCAPTCHA

### Nonce Implementation

```typescript
// Server-side (middleware.ts)
const nonce = generateNonce(); // Cryptographically random
response.headers.set('x-nonce', nonce);

// Server Component (layout.tsx)
const nonce = await getNonce();
<style nonce={nonce}>/* critical CSS */</style>
```

---

## 💾 Data Storage Security

### Implementation Files
- `lib/secure-storage.ts` - Client-side storage wrapper
- `lib/encryption-utils.ts` - Server-side encryption

### Storage Guidelines

#### **❌ NEVER Store in localStorage/sessionStorage**
- Passwords (even hashed)
- Authentication tokens (use httpOnly cookies)
- Credit card information
- Personal identification numbers
- Social Security numbers
- Any PII (Personally Identifiable Information)

#### **✅ Safe to Store**
- User preferences (theme, language)
- UI state (collapsed panels)
- Non-sensitive form drafts
- Cache for public data
- Analytics IDs

### Cookie Security

```typescript
// Authentication cookies
{
  httpOnly: true,      // Not accessible to JavaScript
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  path: '/',
  maxAge: 7 * 24 * 60 * 60 // 7 days
}
```

### Database Security
- **Encryption at Rest**: MongoDB Atlas encryption
- **Encryption in Transit**: TLS 1.2+
- **Password Hashing**: bcrypt
- **Sensitive Fields**: Excluded from queries by default
- **Connection String**: Environment variables only

---

## 🔌 Third-Party Integrations

### Security Measures

#### 1. **Cloudinary (Image CDN)**
- **API Keys**: Server-side only
- **Upload Security**: Signed uploads with timestamps
- **Transformations**: Automatic format optimization (WebP/AVIF)
- **SVG Disabled**: Prevents XSS via SVG files

#### 2. **Bold Payment Gateway**
- **Integrity Hash**: SHA256 signature verification
- **API Keys**: Environment variables
- **Client-Side**: Public key only
- **Webhook Validation**: Signature verification

#### 3. **reCAPTCHA v3**
- **Score-Based**: 0.0 (bot) to 1.0 (human)
- **Thresholds**: Configurable per action
- **Actions**: login, register, contact, etc.
- **Fallback**: Allows request on verification failure

#### 4. **Google Analytics**
- **Privacy**: IP anonymization enabled
- **Cookie Consent**: Required before tracking
- **Data Minimization**: Only necessary events tracked

---

## 🔧 Security Best Practices

### Development

1. **Environment Variables**
   - Never commit `.env` files
   - Use `.env.example` as template
   - Validate on startup (see `lib/env-validation.ts`)

2. **Dependencies**
   - Regular updates: `npm audit`
   - Automated: Dependabot / Renovate
   - Review: Check changelogs before updating

3. **Code Review**
   - All PRs require review
   - Security checklist before merge
   - Automated: ESLint + custom rules

4. **Testing**
   - Unit tests for auth functions
   - Integration tests for API routes
   - E2E tests for critical flows

### Deployment

1. **Production Checklist**
   ```bash
   ✓ Change default JWT secrets
   ✓ Enable HTTPS
   ✓ Configure HSTS preload
   ✓ Set up WAF (Cloudflare)
   ✓ Enable DDoS protection
   ✓ Configure rate limiting
   ✓ Set up monitoring (Sentry)
   ✓ Enable automatic backups
   ```

2. **Monitoring**
   - Error tracking: Sentry
   - Security events: Custom logging
   - Rate limit hits: Redis metrics
   - Failed auth attempts: Alert on threshold

3. **Incident Response**
   - Security contact: security@bskmt.com
   - Disclosure policy: Responsible disclosure
   - Response time: 24 hours
   - Patch deployment: ASAP

---

## 🛠️ Security Audit Tools

### Built-in Tools

#### 1. **`lib/security-audit.ts`**
Runtime security checks:
```typescript
import { runSecurityAudit } from '@/lib/security-audit';

// Run comprehensive audit
const results = await runSecurityAudit(true); // verbose

if (!results.passed) {
  console.error('Security issues found:', results.issues);
}
```

Checks:
- ✅ Secure context (HTTPS)
- ✅ Security headers presence
- ✅ Browser storage for sensitive data
- ✅ Inline scripts without nonce
- ✅ Mixed content (HTTP on HTTPS)
- ✅ XSS vulnerabilities
- ✅ Cookie security

#### 2. **`lib/env-validation.ts`**
Environment variable validation:
```typescript
import { validateEnv, getSecurityChecklist } from '@/lib/env-validation';

// Validates on import
const env = validateEnv();

// Get security warnings
const checklist = getSecurityChecklist();
```

### External Tools

#### **Recommended Tools**
1. **npm audit** - Dependency vulnerabilities
2. **Lighthouse** - Security headers & best practices
3. **OWASP ZAP** - Automated penetration testing
4. **Snyk** - Continuous vulnerability scanning
5. **SonarQube** - Code quality & security

#### **Manual Testing**
1. **XSS Testing**: Input special characters in all forms
2. **CSRF Testing**: Try requests without CSRF token
3. **Auth Testing**: Try accessing protected routes
4. **Rate Limiting**: Send rapid requests
5. **SQL Injection**: Test with SQL payloads (should fail validation)

---

## 📊 Security Metrics

### KPIs to Monitor

1. **Failed Authentication Attempts**
   - Threshold: >100/hour
   - Action: Alert security team

2. **Rate Limit Violations**
   - Threshold: >1000/hour
   - Action: Review patterns, adjust limits

3. **CSRF Token Failures**
   - Threshold: >50/hour
   - Action: Check for misconfiguration

4. **Validation Errors**
   - Threshold: >500/hour
   - Action: Review for attack patterns

5. **Security Header Compliance**
   - Target: 100%
   - Check: Weekly automated scan

---

## 🚨 Incident Response

### Security Incident Process

1. **Detection**
   - Automated alerts
   - User reports
   - Security scans

2. **Assessment**
   - Severity: Critical, High, Medium, Low
   - Impact: User data, service availability
   - Scope: Affected systems/users

3. **Containment**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious IPs

4. **Eradication**
   - Patch vulnerabilities
   - Update dependencies
   - Deploy fixes

5. **Recovery**
   - Restore services
   - Verify integrity
   - Monitor for recurrence

6. **Post-Incident**
   - Document incident
   - Update procedures
   - Communicate to stakeholders

---

## 📞 Security Contact

**Security Email**: security@bskmt.com  
**Response Time**: 24 hours  
**PGP Key**: Available on request

### Responsible Disclosure

We welcome security researchers to report vulnerabilities responsibly:

1. **Email**: security@bskmt.com with details
2. **Do Not**: Publicly disclose before patch
3. **Wait**: Allow 90 days for patch deployment
4. **Recognition**: Hall of fame + acknowledgment

---

## 📝 Security Changelog

### Version 2.5.0 (2025-10-16)
- ✅ Enhanced CSP with nonce-based inline scripts
- ✅ Implemented distributed rate limiting with Redis
- ✅ Added IP reputation checking
- ✅ Enhanced Permissions-Policy
- ✅ Added input sanitization utilities
- ✅ Created secure storage wrapper
- ✅ Environment variable validation
- ✅ Security audit tools

### Version 2.0.0 (Previous)
- ✅ JWT authentication with refresh tokens
- ✅ CSRF protection (double submit cookie)
- ✅ reCAPTCHA v3 integration
- ✅ Basic security headers
- ✅ Password hashing with bcrypt
- ✅ Session management

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Next.js Security](https://nextjs.org/docs/pages/building-your-application/configuring/content-security-policy)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Last Updated**: October 16, 2025  
**Version**: 2.5.0  
**Status**: Production Ready ✅
