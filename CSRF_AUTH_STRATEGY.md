# CSRF Protection Strategy - Authentication Flow

## 🔐 Overview

This document explains why certain authentication endpoints **DO NOT** require CSRF tokens, and how the system maintains security despite this.

## 📊 CSRF Protection by Endpoint Type

### ✅ Endpoints WITH CSRF Protection (Require Active Session)

These endpoints require the user to already have an active session with a CSRF token:

| Endpoint | Method | Reason |
|----------|--------|--------|
| `/api/auth/logout` | POST | User has active session |
| `/api/auth/change-password` | POST | User is authenticated |
| `/api/auth/delete-account` | POST | Critical operation, user authenticated |
| `/api/auth/verify-email` | POST | Verification link clicked, may have session |
| `/api/auth/reset-password` | POST | Password reset with token |
| `/api/auth/resend-verification` | POST | User may be logged in |
| `/api/auth/forgot-password` | POST | Public endpoint but state-changing |

### ❌ Endpoints WITHOUT CSRF Protection (No Session Yet)

These endpoints are part of the authentication flow itself - users don't have sessions yet:

| Endpoint | Method | Alternative Security | Reason |
|----------|--------|---------------------|--------|
| `/api/auth/login` | POST | • IP reputation check<br>• Rate limiting (Redis)<br>• reCAPTCHA v3<br>• Anomaly detection<br>• Password verification | No session exists yet. **CSRF token is generated AFTER successful login** |
| `/api/auth/2fa/generate` | POST | • preAuthToken validation<br>• Rate limiting<br>• OTP expiration | Called before session creation |
| `/api/auth/2fa/verify` | POST | • preAuthToken + OTP code<br>• Rate limiting<br>• Double verification | **CSRF token is generated AFTER successful 2FA** |
| `/api/auth/validate-credentials` | POST | • Client-side encryption<br>• Rate limiting<br>• No session creation | Pre-authentication step |

## 🔄 Complete Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER VISITS /login PAGE                                  │
│    Status: No session, No CSRF token                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. USER SUBMITS CREDENTIALS                                 │
│    POST /api/auth/login                                     │
│    ⚠️  NO CSRF token required (no session yet)              │
│    ✅ Protected by:                                          │
│       • IP reputation check                                 │
│       • Rate limiting (5 attempts per 15 min)               │
│       • reCAPTCHA v3 (score threshold)                      │
│       • Anomaly detection                                   │
│       • bcrypt password verification                        │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴──────────────┐
         │                          │
         ▼                          ▼
┌──────────────────┐      ┌──────────────────────┐
│ 3a. STANDARD     │      │ 3b. 2FA REQUIRED     │
│     LOGIN        │      │                      │
│                  │      │ Response includes:   │
│ ✅ Generates:    │      │ • preAuthToken       │
│   • Access token │      │ • requiresVerif=true │
│   • Refresh token│      │                      │
│   • CSRF token ✨│      │ ⚠️  No tokens yet    │
│   • Session      │      └──────────┬───────────┘
└──────────────────┘                 │
                                     ▼
                          ┌──────────────────────────┐
                          │ 4. GENERATE 2FA OTP      │
                          │    POST /api/auth/2fa/   │
                          │         generate         │
                          │                          │
                          │ ⚠️  NO CSRF required     │
                          │ ✅ Protected by:          │
                          │   • preAuthToken check   │
                          │   • Rate limiting        │
                          │   • MessageBird send     │
                          └──────────┬───────────────┘
                                     │
                                     ▼
                          ┌──────────────────────────┐
                          │ 5. VERIFY OTP CODE       │
                          │    POST /api/auth/2fa/   │
                          │         verify           │
                          │                          │
                          │ ⚠️  NO CSRF required     │
                          │ ✅ Protected by:          │
                          │   • preAuthToken check   │
                          │   • OTP code validation  │
                          │   • Rate limiting        │
                          │   • Expiration check     │
                          │                          │
                          │ ✅ Generates:            │
                          │   • Access token         │
                          │   • Refresh token        │
                          │   • CSRF token ✨        │
                          │   • Session              │
                          └──────────┬───────────────┘
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               │
┌─────────────────────────────────────────┐         │
│ 6. USER IS NOW AUTHENTICATED            │◄────────┘
│    Has: Session + Tokens + CSRF token   │
│                                         │
│    All subsequent requests MUST include │
│    CSRF token in x-csrf-token header    │
└─────────────────────────────────────────┘
```

## 🛡️ Security Layers

### Login Endpoint (`/api/auth/login`)

**Why no CSRF?** User has no session yet to get a CSRF token from.

**Alternative protections:**
1. **IP Reputation Check** - Blocks known malicious IPs
2. **Distributed Rate Limiting** - 5 attempts per 15 minutes (Redis-backed)
3. **reCAPTCHA v3** - Score-based bot detection (threshold: 0.5)
4. **Anomaly Detection** - Behavioral analysis (IP, location, time patterns)
5. **Password Verification** - bcrypt with salt
6. **Failed Login Tracking** - Locks account after 5 failed attempts
7. **Device Fingerprinting** - Detects new devices
8. **Security Alerts** - Email notifications for suspicious logins

### 2FA Endpoints

**Why no CSRF?** These are part of the authentication flow, before session creation.

**Alternative protections:**

#### `/api/auth/2fa/generate`
1. **preAuthToken Validation** - Short-lived, one-time token from login
2. **Rate Limiting** - 5 requests per 5 minutes
3. **Token Expiration** - preAuthToken expires in 5 minutes
4. **OTP Generation** - 6-digit code, expires in 3 minutes
5. **MessageBird Integration** - SMS delivery verification

#### `/api/auth/2fa/verify`
1. **preAuthToken + OTP** - Double verification required
2. **Rate Limiting** - 10 attempts per 5 minutes
3. **OTP Expiration** - Code expires in 3 minutes
4. **Attempt Counting** - Max 3 OTP verification attempts
5. **Code Invalidation** - Used codes can't be reused
6. **Session Creation** - Only after successful verification

## 📝 Implementation Details

### CSRF Token Generation (Login Success)

```typescript
// In /api/auth/login/route.ts
const response = NextResponse.json({
  success: true,
  data: { user: user.getPublicProfile() }
});

// Set access & refresh tokens
response.cookies.set('bsk-access-token', accessToken, cookieOptions);
response.cookies.set('bsk-refresh-token', refreshToken, cookieOptions);

// Generate CSRF token for this new session
const csrfToken = setCSRFToken(response);
// ☝️ Sets two cookies:
//    • bsk-csrf-token (httpOnly) - server validation
//    • bsk-csrf-token-readable - client can read to send in headers
```

### CSRF Token Generation (2FA Success)

```typescript
// In /api/auth/2fa/verify/route.ts
const response = NextResponse.json({
  success: true,
  message: 'Autenticación exitosa'
});

response.cookies.set('bsk-access-token', finalAccessToken, cookieOptions);
response.cookies.set('bsk-refresh-token', finalRefreshToken, cookieOptions);

// Generate CSRF token after 2FA verification
const csrfToken = setCSRFToken(response);
```

## 🔍 Why This Approach is Secure

### CSRF Attack Vector Analysis

**Scenario:** Attacker tries to forge a login request

```javascript
// Attacker's malicious site
fetch('https://bskmt.com/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    email: 'victim@example.com',
    password: 'guessed_password'
  })
});
```

**Why this fails:**
1. ❌ **No reCAPTCHA token** - Attacker can't solve reCAPTCHA programmatically
2. ❌ **Rate limiting** - Multiple attempts get blocked
3. ❌ **IP reputation** - Suspicious IPs are blocked
4. ❌ **Anomaly detection** - Unusual patterns detected
5. ❌ **No password knowledge** - Attacker doesn't know victim's password
6. ❌ **Even if password known** - Needs 2FA code sent to victim's phone
7. ❌ **CORS policy** - Browser blocks cross-origin requests with credentials

### Key Differences from State-Changing Operations

**Why POST/PUT/DELETE to `/api/events` needs CSRF:**
- User is **already authenticated** (has session)
- Browser automatically sends cookies (including auth tokens)
- Attacker can craft request that browser will send with user's cookies
- **Solution:** CSRF token proves request came from legitimate app

**Why POST to `/api/auth/login` doesn't need CSRF:**
- User is **NOT authenticated** (no session)
- No auth cookies to steal/abuse
- Multiple other security layers prevent abuse
- **Result:** Chicken-and-egg problem solved with alternative security

## 📊 Comparison Table

| Security Concern | Regular Endpoints | Auth Endpoints |
|-----------------|------------------|----------------|
| **Session hijacking** | Protected by CSRF | No session yet |
| **Bot attacks** | Protected by CSRF + rate limit | reCAPTCHA + rate limit |
| **Brute force** | Not applicable | Rate limit + account lockout |
| **Credential stuffing** | Not applicable | Anomaly detection + IP reputation |
| **Cross-site requests** | CSRF token required | CORS + reCAPTCHA + password |

## 🎯 Best Practices Followed

✅ **Defense in Depth** - Multiple security layers
✅ **Least Privilege** - Only what's needed when needed
✅ **Fail Secure** - Errors block access, don't allow bypass
✅ **Auditability** - All attempts logged
✅ **Standards Compliance** - Follows OWASP recommendations

## 🔗 References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [RFC 6749 - OAuth 2.0](https://tools.ietf.org/html/rfc6749) (Token-based auth)

## 📝 Summary

**CSRF protection is NOT needed for authentication endpoints because:**

1. ✅ Users don't have sessions yet (no token to steal)
2. ✅ Multiple alternative security layers protect these endpoints
3. ✅ CSRF tokens ARE generated immediately after successful authentication
4. ✅ All subsequent requests MUST include CSRF tokens
5. ✅ This follows industry best practices and OWASP guidelines

**The system is secure because it uses the right protection for each endpoint type.**
