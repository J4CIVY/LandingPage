# 🔐 Security Quick Reference - Developer Guide
## BSK Motorcycle Team

**Last Updated**: October 16, 2025  
**For Developers**: Quick security guidelines and code examples

---

## 🚀 Quick Start Security Checklist

### Before Writing Any Code
- [ ] Review `docs/SECURITY.md` for comprehensive guidelines
- [ ] Understand the security utilities available
- [ ] Never commit `.env` files
- [ ] Use the provided security utilities

---

## 🛡️ Common Security Tasks

### 1. Validating User Input

```typescript
// ✅ DO THIS - Use Zod schemas
import { contactMessageSchema } from '@/lib/validation-schemas';

const result = contactMessageSchema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
  return { errors: result.error.issues };
}
const validData = result.data; // Type-safe and validated
```

```typescript
// ❌ DON'T DO THIS - Trust user input
const data = JSON.parse(userInput); // Dangerous!
await db.save(data); // Injection risk!
```

---

### 2. Sanitizing User Content

```typescript
// ✅ DO THIS - Sanitize before display/storage
import { sanitizeHtml, sanitizeUrl, sanitizeEmail } from '@/lib/input-sanitization';

const safeComment = sanitizeHtml(userComment);
const safeUrl = sanitizeUrl(userLink);
const safeEmail = sanitizeEmail(userEmail);

// Deep sanitize entire objects
import { deepSanitize } from '@/lib/input-sanitization';
const safeData = deepSanitize(formData);
```

```typescript
// ❌ DON'T DO THIS
<div dangerouslySetInnerHTML={{ __html: userComment }} /> // XSS risk!
```

---

### 3. Storing Data Client-Side

```typescript
// ✅ DO THIS - Use SecureStorage
import { SecureStorage } from '@/lib/secure-storage';

// With expiration
SecureStorage.set('preferences', userData, { 
  expiresIn: 86400000 // 24 hours 
});

// With obfuscation (non-sensitive data only)
SecureStorage.set('ui-state', state, { encrypt: true });

// Retrieve
const data = SecureStorage.get<UserPreferences>('preferences');

// Cleanup expired data
SecureStorage.cleanupExpired();
```

```typescript
// ❌ DON'T DO THIS
localStorage.setItem('password', password); // NEVER!
localStorage.setItem('token', token); // Use httpOnly cookies!
localStorage.setItem('creditCard', cardNumber); // NEVER!
```

**What's Safe in localStorage:**
- ✅ Theme preferences
- ✅ Language settings
- ✅ UI state (collapsed panels, etc.)
- ✅ Non-sensitive form drafts
- ❌ Passwords
- ❌ Tokens
- ❌ Any PII (Personally Identifiable Information)

---

### 4. Making API Requests

```typescript
// ✅ DO THIS - Use csrfFetch for state-changing operations
import { csrfFetch } from '@/lib/csrf-client';

const response = await csrfFetch('/api/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(eventData),
});
```

```typescript
// ✅ DO THIS - Handle errors securely
try {
  const response = await csrfFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    // Don't expose detailed errors to users
    throw new Error('Failed to create user');
  }
} catch (error) {
  console.error('Error:', error); // Log for debugging
  // Show generic message to user
  setError('An error occurred. Please try again.');
}
```

---

### 5. Handling Authentication

```typescript
// ✅ DO THIS - Use the auth context
import { useAuth } from '@/hooks/useAuth';

function ProtectedComponent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Redirect to="/login" />;
  
  return <div>Welcome, {user.name}</div>;
}
```

```typescript
// ✅ DO THIS - Verify auth on API routes
import { verifyAuth } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if (!authResult.isValid) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const userId = authResult.user?.id;
  // Continue with authenticated logic
}
```

---

### 6. Rate Limiting API Routes

```typescript
// ✅ DO THIS - Add rate limiting to sensitive endpoints
import { checkRateLimit, addRateLimitHeaders, RateLimitPresets } from '@/lib/distributed-rate-limit';

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = await checkRateLimit(request, RateLimitPresets.LOGIN);
  
  if (!rateLimitResult.success) {
    const response = NextResponse.json(
      { 
        success: false, 
        message: `Too many attempts. Try again in ${Math.ceil((rateLimitResult.retryAfter || 0) / 60)} minutes.`
      },
      { status: 429 }
    );
    addRateLimitHeaders(response.headers, rateLimitResult);
    return response;
  }
  
  // Continue with request handling
}
```

**Available Rate Limit Presets:**
- `RateLimitPresets.LOGIN` - 5 req / 15 min
- `RateLimitPresets.REGISTER` - 3 req / 1 hour
- `RateLimitPresets.API` - 100 req / 1 min
- `RateLimitPresets.UPLOAD` - 10 req / 5 min
- `RateLimitPresets.PASSWORD_RESET` - 3 req / 1 hour

---

### 7. Using reCAPTCHA

```typescript
// ✅ DO THIS - Client-side
import { useRecaptcha, RecaptchaActions } from '@/lib/recaptcha-client';

function LoginForm() {
  const { verify } = useRecaptcha();
  
  const handleSubmit = async (data) => {
    // Get reCAPTCHA token
    const recaptchaToken = await verify(RecaptchaActions.LOGIN);
    
    // Include in API request
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        recaptchaToken,
      }),
    });
  };
}
```

```typescript
// ✅ DO THIS - Server-side verification
import { verifyRecaptcha, isLikelyHuman, RecaptchaThresholds } from '@/lib/recaptcha-server';

export async function POST(request: NextRequest) {
  const { recaptchaToken } = await request.json();
  
  const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'login');
  
  if (!recaptchaResult.success || !isLikelyHuman(recaptchaResult.score, RecaptchaThresholds.LOGIN)) {
    return NextResponse.json(
      { success: false, message: 'Bot verification failed' },
      { status: 403 }
    );
  }
  
  // Continue with login
}
```

---

### 8. Validating Environment Variables

```typescript
// ✅ DO THIS - Validate on startup
import { validateEnv, getSecurityChecklist } from '@/lib/env-validation';

// In your server startup file
try {
  const env = validateEnv();
  console.log('✅ Environment variables validated');
  
  // Check security
  const checklist = getSecurityChecklist();
  if (checklist.critical.length > 0) {
    console.error('❌ Critical security issues:', checklist.critical);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Invalid environment:', error);
  process.exit(1);
}
```

---

## 🔍 Security Testing

### Running Security Audit

```typescript
// ✅ DO THIS - Run in development
import { runSecurityAudit } from '@/lib/security-audit';

// Automatically runs on page load in development
// Or manually trigger:
const results = await runSecurityAudit(true); // verbose

if (!results.passed) {
  console.error('Security issues found:', results.issues);
}
```

### Testing Tools

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check security headers
# Visit: https://securityheaders.com/?q=your-domain.com

# Test SSL/TLS configuration
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com
```

---

## ⚠️ Common Security Mistakes

### 1. Exposing Sensitive Data

```typescript
// ❌ DON'T DO THIS
console.log('User data:', user); // May contain sensitive info
console.log('API Key:', process.env.API_KEY); // Exposes secrets

// ✅ DO THIS
console.log('User ID:', user.id); // Only log necessary info
// Never log secrets
```

---

### 2. Trusting User Input

```typescript
// ❌ DON'T DO THIS
const query = `SELECT * FROM users WHERE id = ${userId}`; // SQL injection!

// ✅ DO THIS
const user = await User.findById(userId); // Parameterized query
```

---

### 3. Not Validating on Server

```typescript
// ❌ DON'T DO THIS
// Only validate on client
if (isValidEmail(email)) {
  await api.post('/users', { email });
}

// ✅ DO THIS
// Validate on BOTH client (UX) and server (security)
export async function POST(request: NextRequest) {
  const schema = z.object({
    email: z.string().email(),
  });
  
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  // Continue...
}
```

---

### 4. Weak Error Messages

```typescript
// ❌ DON'T DO THIS
catch (error) {
  return { error: error.message }; // May expose stack traces, DB info
}

// ✅ DO THIS
catch (error) {
  console.error('Error:', error); // Log for debugging
  return { error: 'An error occurred' }; // Generic message to user
}
```

---

## 📚 Security Resources

### Internal Documentation
- `docs/SECURITY.md` - Comprehensive security guide
- `docs/SECURITY_AUDIT_REPORT.md` - Latest audit results
- `docs/SECURITY_IMPLEMENTATION_SUMMARY.md` - Implementation details

### Security Utilities
- `lib/secure-storage.ts` - Safe localStorage wrapper
- `lib/input-sanitization.ts` - XSS prevention
- `lib/security-audit.ts` - Runtime security checks
- `lib/env-validation.ts` - Config validation
- `lib/validation-schemas.ts` - Input validation schemas
- `lib/csrf-protection.ts` - CSRF token management
- `lib/auth-utils.ts` - Authentication utilities

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Next.js Security](https://nextjs.org/docs/pages/building-your-application/configuring/content-security-policy)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

---

## 🆘 When to Ask for Help

Contact the security team if:
- You're handling sensitive data (passwords, PII, payment info)
- You're implementing authentication/authorization
- You're integrating a new third-party service
- You find a potential security vulnerability
- You're unsure about security implications

**Security Contact**: security@bskmt.com  
**Response Time**: 24 hours

---

## ✅ Pre-Commit Checklist

Before committing code with security implications:

- [ ] All user input validated with Zod schemas
- [ ] All output sanitized (no XSS risks)
- [ ] No sensitive data in localStorage
- [ ] No secrets in code (use environment variables)
- [ ] CSRF protection on state-changing operations
- [ ] Rate limiting on sensitive endpoints
- [ ] Error messages don't expose details
- [ ] Authentication checked on protected routes
- [ ] reCAPTCHA on public forms
- [ ] Security tests passing

---

## 🎯 Security Goals

1. **Validate Everything** - Never trust user input
2. **Sanitize Output** - Prevent XSS attacks
3. **Authenticate Properly** - Verify identity on every request
4. **Limit Access** - Principle of least privilege
5. **Monitor Activity** - Log security events
6. **Update Regularly** - Keep dependencies current
7. **Document Changes** - Maintain security docs

---

**Remember**: Security is everyone's responsibility! 🔒

When in doubt, ask. It's better to be safe than sorry.

---

*Last Updated: October 16, 2025*  
*Version: 2.5.0*
