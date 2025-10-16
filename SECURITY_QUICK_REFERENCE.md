# 🛡️ Security Best Practices - Quick Reference Guide

**BSK Motorcycle Team Development Team**  
**Last Updated:** October 16, 2025

---

## 🎯 Quick Security Rules

### ❌ NEVER DO THIS

1. **Never store JWT tokens in localStorage or sessionStorage**
   ```typescript
   // ❌ WRONG
   localStorage.setItem('token', accessToken);
   sessionStorage.setItem('authToken', token);
   ```

2. **Never expose tokens in API response bodies**
   ```typescript
   // ❌ WRONG
   return { user, accessToken, refreshToken };
   ```

3. **Never log sensitive data**
   ```typescript
   // ❌ WRONG
   console.log('Password:', password);
   console.log('User email:', user.email);
   console.log('Token:', token);
   ```

4. **Never trust client-side validation alone**
   ```typescript
   // ❌ WRONG - Always validate on server too!
   if (clientSaysValid) { saveToDatabase(); }
   ```

5. **Never use weak password requirements**
   ```typescript
   // ❌ WRONG
   if (password.length >= 6) { /* too weak! */ }
   ```

### ✅ ALWAYS DO THIS

1. **Use HttpOnly cookies for authentication**
   ```typescript
   // ✅ CORRECT
   response.cookies.set('bsk-access-token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
     path: '/',
     maxAge: 2 * 60 * 60
   });
   ```

2. **Validate tokens server-side**
   ```typescript
   // ✅ CORRECT
   import { verifyAuth } from '@/lib/auth-utils';
   
   const authResult = await verifyAuth(request);
   if (!authResult.isValid) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

3. **Sanitize user inputs**
   ```typescript
   // ✅ CORRECT
   import { z } from 'zod';
   
   const schema = z.object({
     email: z.string().email(),
     name: z.string().max(100).trim()
   });
   
   const validatedData = schema.parse(userInput);
   ```

4. **Use CSRF protection for state-changing operations**
   ```typescript
   // ✅ CORRECT
   import { requireCSRFToken } from '@/lib/csrf-protection';
   
   export async function POST(request: NextRequest) {
     const csrfError = requireCSRFToken(request);
     if (csrfError) return csrfError;
     // ... rest of logic
   }
   ```

5. **Implement proper error handling**
   ```typescript
   // ✅ CORRECT
   try {
     await riskyOperation();
   } catch (error) {
     // Don't expose internal errors
     if (process.env.NODE_ENV === 'development') {
       console.error('Error:', error);
     }
     return NextResponse.json(
       { error: 'Operation failed' },  // Generic message
       { status: 500 }
     );
   }
   ```

---

## 🔐 Authentication Patterns

### Login Flow
```typescript
// Client Component
async function handleLogin(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Important!
    body: JSON.stringify({ email, password })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Tokens are automatically set in HttpOnly cookies
    router.push('/dashboard');
  }
}

// API Route
export async function POST(request: NextRequest) {
  // 1. Validate input
  const { email, password } = await validateInput(request);
  
  // 2. Verify credentials
  const user = await User.findOne({ email });
  const isValid = await user.comparePassword(password);
  
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // 3. Generate tokens
  const accessToken = generateAccessToken({ userId: user._id, ... });
  const refreshToken = generateRefreshToken({ userId: user._id, ... });
  
  // 4. Set HttpOnly cookies
  const response = NextResponse.json({
    success: true,
    data: { user: user.getPublicProfile() }
    // ⚠️ No tokens in response body!
  });
  
  response.cookies.set('bsk-access-token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 2 * 60 * 60
  });
  
  return response;
}
```

### Protected API Route
```typescript
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  // 1. Verify authentication
  const auth = await verifyAuth(request);
  
  if (!auth.isValid) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // 2. Check authorization (if needed)
  if (auth.user?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  // 3. Process request
  const data = await getData(auth.user.id);
  
  return NextResponse.json({ data });
}
```

### Protected Page Component
```typescript
'use client';

import { useRequireAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  // This hook automatically redirects if not authenticated
  const { user, isLoading } = useRequireAuth();
  
  if (isLoading) {
    return <Loading />;
  }
  
  return <Dashboard user={user} />;
}
```

---

## 🔒 Data Exposure Guidelines

### What to NEVER expose to client

```typescript
// User Model - getPublicProfile() method
getPublicProfile() {
  return {
    // ✅ OK to expose:
    id: this._id,
    firstName: this.firstName,
    email: this.email,
    membershipType: this.membershipType,
    role: this.role,
    
    // ❌ NEVER expose these:
    // password: this.password,           // Obvious
    // passwordResetToken: this.token,    // Security token
    // loginAttempts: this.loginAttempts, // Security metric
    // isLocked: this.isAccountLocked(),  // Security state
    // emailVerificationToken: this.token // Verification token
  };
}
```

### Sanitizing API responses
```typescript
// ✅ CORRECT
function sanitizeUser(user: IUser) {
  const { password, passwordResetToken, emailVerificationToken, ...safe } = user.toObject();
  return safe;
}

// ❌ WRONG
function getUser(user: IUser) {
  return user; // Might include sensitive fields!
}
```

---

## 🛡️ Input Validation

### Using Zod schemas
```typescript
import { z } from 'zod';

// Define schema
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password too short'),
  rememberMe: z.boolean().optional()
});

// Validate in API route
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // This will throw if validation fails
  const validatedData = loginSchema.parse(body);
  
  // Or use safeParse for manual error handling
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: result.error.issues
    }, { status: 400 });
  }
  
  // Use result.data (guaranteed to be valid)
}
```

### SQL Injection Prevention
```typescript
// ✅ CORRECT - Using Mongoose (parameterized queries)
const user = await User.findOne({ email: userInput.email });

// ❌ WRONG - Raw query with concatenation
const query = `SELECT * FROM users WHERE email = '${userInput.email}'`;
```

### XSS Prevention
```typescript
// ✅ CORRECT - React automatically escapes
<div>{userInput}</div>

// ⚠️ DANGEROUS - Only use for trusted content
<div dangerouslySetInnerHTML={{ __html: sanitize(content) }} />

// Sanitization function
function sanitize(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}
```

---

## 🔐 Password Security

### Hashing (handled by User model)
```typescript
// ✅ Automatically hashed by pre-save hook
const user = new User({
  email: 'user@example.com',
  password: 'PlainTextPassword123!'  // Will be hashed
});
await user.save();

// ✅ Comparing passwords
const isMatch = await user.comparePassword(candidatePassword);
```

### Password requirements
```typescript
const passwordSchema = z.string()
  .min(8, 'At least 8 characters')
  .regex(/[a-z]/, 'At least one lowercase letter')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/\d/, 'At least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/, 'At least one special character');
```

---

## 🌐 API Security Headers

### In middleware.ts
```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(self)'
  );
  
  // HSTS (production only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  return response;
}
```

---

## 🚨 Common Vulnerabilities & Fixes

### 1. XSS (Cross-Site Scripting)
```typescript
// ❌ VULNERABLE
<div>{userInput}</div>  // If userInput contains scripts

// ✅ SAFE (React auto-escapes)
<div>{userInput}</div>  // Actually safe in React!

// ⚠️ ONLY FOR TRUSTED CONTENT
<div dangerouslySetInnerHTML={{ __html: trustedHTML }} />
```

### 2. CSRF (Cross-Site Request Forgery)
```typescript
// ✅ PROTECTED
import { requireCSRFToken } from '@/lib/csrf-protection';

export async function POST(request: NextRequest) {
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;
  
  // Process state-changing operation
}
```

### 3. SQL Injection
```typescript
// ✅ SAFE - Mongoose uses parameterized queries
User.findOne({ email: userInput });

// ❌ VULNERABLE - Raw SQL
db.query(`SELECT * FROM users WHERE email = '${userInput}'`);
```

### 4. Authentication Bypass
```typescript
// ❌ VULNERABLE
if (request.headers.get('user-id') === adminId) {
  // Never trust client headers!
}

// ✅ SECURE
const auth = await verifyAuth(request);
if (auth.user?.role === 'admin') {
  // Verified server-side
}
```

---

## 📝 Logging Best Practices

### Development
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', { userId, action });
}
```

### Production
```typescript
// ✅ SAFE - No PII
console.error('Authentication failed', {
  timestamp: new Date(),
  endpoint: request.url,
  // Don't log: email, userId, tokens, etc.
});

// ❌ UNSAFE - Contains PII
console.log('User login:', {
  email: user.email,  // PII!
  password: password  // NEVER!
});
```

### Security Events
```typescript
// ✅ Log security events (sanitized)
import { logSecurityEvent } from '@/lib/security-events';

logSecurityEvent({
  event: 'FAILED_LOGIN_ATTEMPT',
  timestamp: new Date(),
  ipAddress: getClientIP(request),
  // Don't include: email, password, tokens
});
```

---

## 🧪 Testing Security

### Manual Tests
```bash
# 1. Verify tokens not in response
curl -X POST https://bskmt.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  | grep -i "token"  # Should not find tokens in JSON

# 2. Verify HttpOnly cookies
curl -i https://bskmt.com/api/auth/login \
  | grep -i "Set-Cookie.*httponly"  # Should see HttpOnly flag

# 3. Check security headers
curl -I https://bskmt.com \
  | grep -E "X-Frame-Options|Content-Security-Policy|Permissions-Policy"
```

### Automated Tests
```typescript
// In your test suite
describe('Authentication Security', () => {
  it('should not expose tokens in response body', async () => {
    const response = await fetch('/api/auth/login', { ... });
    const json = await response.json();
    
    expect(json.accessToken).toBeUndefined();
    expect(json.refreshToken).toBeUndefined();
  });
  
  it('should set HttpOnly cookies', async () => {
    const response = await fetch('/api/auth/login', { ... });
    const cookies = response.headers.get('Set-Cookie');
    
    expect(cookies).toContain('HttpOnly');
    expect(cookies).toContain('Secure');
    expect(cookies).toContain('SameSite=Strict');
  });
});
```

---

## 📚 Resources

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8725
- **Next.js Security:** https://nextjs.org/docs/app/building-your-application/configuring/security-headers
- **Zod Documentation:** https://zod.dev/

---

## 🆘 Security Incident Response

If you discover a security vulnerability:

1. **DO NOT** commit the vulnerable code
2. **DO NOT** disclose publicly
3. **DO** notify the security team immediately
4. **DO** document the issue privately
5. **DO** follow responsible disclosure practices

---

## ✅ Pre-Commit Checklist

Before committing code:

- [ ] No tokens in localStorage/sessionStorage
- [ ] No sensitive data in console.logs
- [ ] Input validation implemented
- [ ] Authentication checks in place
- [ ] No PII exposed to client
- [ ] Error messages are generic
- [ ] CSRF protection for state changes
- [ ] Security headers configured

---

*Keep this guide handy and refer to it during development!*
