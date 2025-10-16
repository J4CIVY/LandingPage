# 🔒 Security Policy - BSK Motorcycle Team

## Overview

This document outlines the security measures, best practices, and policies implemented in the BSK Motorcycle Team web application. Security is a top priority, and we follow industry-standard practices to protect user data and prevent vulnerabilities.

---

## 🛡️ Security Measures Implemented

### 1. Authentication & Authorization

#### JWT Token Security
- **Strong Secret Requirements**: Application enforces environment variables for JWT secrets (no default values)
- **Token Expiration**: Access tokens expire after 15 minutes, refresh tokens after 7 days
- **Token Rotation**: Automatic token refresh mechanism implemented
- **Secure Cookie Storage**: HTTPOnly, Secure, SameSite=Strict cookies for token storage
- **Session Management**: Maximum 5 active sessions per user with automatic cleanup

#### Password Security
- **Encryption**: RSA-OAEP 2048-bit encryption for password transmission
- **Hashing**: bcrypt with salt rounds for password storage
- **Strength Validation**: Enforced minimum 8 characters with uppercase, lowercase, numbers, and special characters
- **Account Lockout**: Temporary lockout after 5 failed login attempts
- **Common Pattern Detection**: Prevents use of common passwords like "password123"

#### Multi-Factor Authentication (2FA)
- Email verification required before account activation
- Security alerts for new device logins
- Session-based device tracking

### 2. XSS (Cross-Site Scripting) Protection

#### Input Sanitization
- All user inputs sanitized on both client and server side
- HTML entity encoding for special characters
- Maximum length restrictions on all text fields
- Recursive sanitization for nested objects

#### Output Encoding
- Safe usage of `dangerouslySetInnerHTML` only for:
  - JSON-LD structured data (with sanitization)
  - Critical inline CSS (static, no user input)
- React's built-in XSS protection for all dynamic content
- Sanitization functions applied to breadcrumbs and structured data

#### Content Security Policy (CSP)
- Strict CSP headers configured in `next.config.mjs`
- `script-src` restricted to trusted domains only
- `object-src` set to 'none'
- `frame-ancestors` set to 'none' (clickjacking protection)
- `upgrade-insecure-requests` enabled
- `block-all-mixed-content` enabled

### 3. CSRF (Cross-Site Request Forgery) Protection

- **SameSite Cookies**: All authentication cookies use `SameSite=Strict`
- **Origin Validation**: Server validates request origins
- **State Tokens**: Form submissions include time-based tokens
- **Double Submit Cookie Pattern**: Implemented for critical operations

### 4. SQL/NoSQL Injection Prevention

- **Parameterized Queries**: All MongoDB queries use parameterized inputs
- **Schema Validation**: Zod schemas validate all inputs before database operations
- **ORM Usage**: Mongoose provides additional protection layer
- **Input Type Enforcement**: Strict type checking on all database operations

### 5. Security Headers

Comprehensive security headers configured in `next.config.mjs`:

```javascript
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [Comprehensive CSP]
Permissions-Policy: camera=(), microphone=(), geolocation=(), ...
X-DNS-Prefetch-Control: on
X-Download-Options: noopen
X-Permitted-Cross-Domain-Policies: none
```

### 6. Rate Limiting

- **Login Attempts**: 5 attempts per 15 minutes per IP
- **API Endpoints**: Configurable limits per endpoint
- **Image Uploads**: 3 uploads per minute per IP
- **Form Submissions**: Custom limits based on action sensitivity

### 7. File Upload Security

#### Image Uploads
- **Authentication Required**: All uploads require valid authentication
- **File Type Validation**: Only allowed image types (JPEG, PNG, WebP, AVIF)
- **File Size Limits**: Maximum 10MB per image
- **Path Traversal Prevention**: Sanitized folder paths with whitelist
- **Content Type Verification**: Server-side MIME type validation
- **Cloudinary Processing**: All images processed through secure CDN

#### PDF Uploads
- **Size Restrictions**: Maximum file size enforced
- **Type Validation**: Strict PDF MIME type checking
- **Virus Scanning**: Recommended for production (integrate with service)

### 8. Data Privacy & GDPR Compliance

- **Data Minimization**: Only collect necessary user data
- **Consent Management**: Cookie banner with granular consent options
- **Right to Access**: Users can download their data via `/api/user/download-data`
- **Right to Deletion**: Account deletion endpoint with data purge
- **Data Encryption**: Sensitive data encrypted at rest and in transit
- **Privacy Policy**: Comprehensive privacy policy available
- **Data Retention**: Automatic cleanup of expired sessions and tokens

### 9. Secure Communication

- **HTTPS Only**: Application enforces HTTPS in production
- **TLS 1.2+**: Minimum TLS version enforced
- **HSTS**: HTTP Strict Transport Security with preload
- **Certificate Pinning**: Recommended for mobile apps

### 10. Dependency Security

- **Regular Updates**: Dependencies updated regularly
- **Vulnerability Scanning**: Automated scanning for known vulnerabilities
- **Minimal Dependencies**: Only essential packages included
- **Lock Files**: Package-lock.json committed for reproducibility
- **Security Plugins**: ESLint security plugin enabled

---

## 🚨 Vulnerability Fixes Applied

### Critical Fixes

1. **Removed Default JWT Secrets** (CRITICAL)
   - Enforced environment variable requirement
   - Application fails to start without proper secrets
   - File: `lib/auth-utils.ts`

2. **Authentication Bypass Prevention** (HIGH)
   - Centralized authentication using `verifyAuth()` function
   - Consistent token validation across all API routes
   - Fixed inconsistent JWT verification in `/api/users/profile`

3. **File Upload Authentication** (HIGH)
   - Enforced authentication for all file uploads
   - Added path traversal prevention
   - Whitelisted allowed upload directories
   - File: `app/api/upload-image/route.ts`

### High Priority Fixes

4. **XSS in Structured Data** (HIGH)
   - Added sanitization to JSON-LD structured data
   - Removed script tags and dangerous content from user inputs
   - Files: `components/shared/StructuredData.tsx`, `components/shared/Breadcrumbs.tsx`

5. **Password Exposure in localStorage** (HIGH)
   - Removed password fields from localStorage auto-save
   - Added explicit checks to prevent sensitive data storage
   - File: `app/register/page.tsx`

6. **Input Sanitization Enhancement** (MEDIUM)
   - Added length limits to all user inputs in profile updates
   - Type coercion to prevent injection attacks
   - File: `app/api/users/profile/route.ts`

### Medium Priority Fixes

7. **Missing Input Validation** (MEDIUM)
   - Enhanced Zod schemas with maximum length constraints
   - Added recursive sanitization for nested objects
   - File: `lib/validation-schemas.ts`

8. **Image Optimization Security** (MEDIUM)
   - Disabled `dangerouslyAllowSVG` for image optimization
   - Set `unoptimized: false` to ensure processing
   - File: `next.config.mjs`

---

## 🔐 Environment Variables Security

### Required Environment Variables

**CRITICAL - Must be set in production:**
```bash
JWT_SECRET=<strong-random-secret-min-32-chars>
JWT_REFRESH_SECRET=<strong-random-secret-min-32-chars>
MONGODB_URI=<your-mongodb-connection-string>
```

**Recommended:**
```bash
SESSION_SECRET=<additional-encryption-secret>
CLOUDINARY_API_SECRET=<cloudinary-secret>
SMTP_PASS=<email-password>
```

### Secret Generation

Generate strong secrets using:
```bash
# Linux/Mac
openssl rand -base64 64

# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Security Best Practices for Secrets

1. **Never commit secrets to version control**
2. **Use different secrets for development and production**
3. **Rotate secrets every 90 days**
4. **Use environment-specific secret management** (Vercel Secrets, AWS Secrets Manager, etc.)
5. **Limit secret access to necessary personnel only**
6. **Monitor for exposed secrets** (use tools like GitGuardian, TruffleHog)

---

## 🔍 Security Testing

### Automated Testing

```bash
# Run security audit on dependencies
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for outdated packages
npm outdated

# Run ESLint with security rules
npm run lint
```

### Manual Testing Checklist

- [ ] Test authentication bypass attempts
- [ ] Verify rate limiting on all endpoints
- [ ] Test XSS with common payloads
- [ ] Verify CSRF protection
- [ ] Test file upload restrictions
- [ ] Check for exposed sensitive data in responses
- [ ] Verify password strength requirements
- [ ] Test account lockout mechanism
- [ ] Check security headers with securityheaders.com
- [ ] Test with OWASP ZAP or Burp Suite

### Recommended Security Tools

- **OWASP ZAP**: Automated vulnerability scanning
- **Burp Suite**: Manual penetration testing
- **npm audit**: Dependency vulnerability checking
- **Snyk**: Continuous security monitoring
- **SonarQube**: Code quality and security analysis
- **Lighthouse**: Performance and security audits

---

## 📋 Security Checklist for Deployment

### Pre-Deployment

- [ ] All environment variables set correctly
- [ ] Strong JWT secrets generated and configured
- [ ] HTTPS certificates installed and valid
- [ ] Database access restricted to application servers
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] Security headers verified
- [ ] CSP tested and working
- [ ] Dependency vulnerabilities resolved
- [ ] Security audit completed

### Post-Deployment

- [ ] Monitor logs for suspicious activity
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure uptime monitoring
- [ ] Enable automated backups
- [ ] Test all authentication flows
- [ ] Verify HTTPS redirection
- [ ] Check security headers on live site
- [ ] Test rate limiting under load
- [ ] Review and update CORS settings

---

## 🚀 Incident Response Plan

### If a Security Issue is Discovered

1. **Immediate Actions**
   - Document the issue with screenshots/logs
   - Assess severity (Critical, High, Medium, Low)
   - Notify the development team immediately

2. **Containment**
   - If critical, take affected systems offline
   - Rotate compromised credentials
   - Block malicious IP addresses

3. **Investigation**
   - Review logs for exploitation attempts
   - Identify affected users
   - Determine root cause

4. **Remediation**
   - Apply security patches
   - Update dependencies
   - Fix vulnerable code

5. **Communication**
   - Notify affected users (if data breach)
   - Update security documentation
   - Post-mortem analysis

6. **Prevention**
   - Implement additional safeguards
   - Update security policies
   - Schedule security training

---

## 📞 Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

**Email**: security@bskmt.com  
**Subject**: [SECURITY] Brief description

**Please include:**
- Detailed description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

**Do NOT:**
- Publicly disclose the vulnerability before it's fixed
- Exploit the vulnerability beyond proof-of-concept
- Access or modify user data

We will acknowledge your report within 48 hours and provide updates on remediation progress.

---

## 🔄 Security Update Schedule

- **Critical vulnerabilities**: Immediate patching (within 24 hours)
- **High severity**: Patching within 1 week
- **Medium severity**: Patching within 1 month
- **Low severity**: Addressed in regular updates
- **Dependency updates**: Monthly review and updates
- **Security audits**: Quarterly comprehensive audits
- **Penetration testing**: Annual third-party testing

---

## 📚 Additional Resources

### OWASP Top 10 Coverage

1. ✅ **Broken Access Control**: Authentication and authorization implemented
2. ✅ **Cryptographic Failures**: Encryption for passwords and sensitive data
3. ✅ **Injection**: Parameterized queries and input validation
4. ✅ **Insecure Design**: Security-by-design approach
5. ✅ **Security Misconfiguration**: Comprehensive security headers
6. ✅ **Vulnerable Components**: Regular dependency updates
7. ✅ **Authentication Failures**: MFA, rate limiting, account lockout
8. ✅ **Data Integrity Failures**: Signed JWTs, HTTPS enforcement
9. ✅ **Security Logging**: Comprehensive logging implemented
10. ✅ **SSRF**: API requests validated and whitelisted

### References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE/SANS Top 25](https://www.sans.org/top25-software-errors/)

---

## ✅ Compliance

- **GDPR**: General Data Protection Regulation compliant
- **CCPA**: California Consumer Privacy Act compliant
- **COPPA**: Children's Online Privacy Protection Act compliant
- **PCI-DSS**: Payment Card Industry compliance (via Bold payment gateway)
- **OWASP**: Following OWASP security guidelines

---

**Last Updated**: 2025-01-15  
**Security Version**: 2.3.1  
**Next Review**: 2025-04-15

For questions or concerns about this security policy, contact: security@bskmt.com
