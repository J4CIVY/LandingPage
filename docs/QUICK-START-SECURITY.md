# 🚀 Quick Start: Security Protection Guide

## ⚡ 5-Minute Setup

### 1️⃣ **Install Dependencies** (Already Done ✅)
```bash
npm install react-google-recaptcha-v3 ioredis crypto-js @types/crypto-js
```

### 2️⃣ **Configure Environment Variables**
Create `.env.local` with:
```bash
# reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here

# Redis
REDIS_URL=redis://localhost:6379
```

### 3️⃣ **Get reCAPTCHA Keys**
1. Visit: https://www.google.com/recaptcha/admin/create
2. Select reCAPTCHA v3
3. Add domains: `localhost`, `yourdomain.com`
4. Copy keys to `.env.local`

### 4️⃣ **Start Redis** (Local Development)
```bash
# Option 1: Docker (recommended)
docker run -d -p 6379:6379 redis:alpine

# Option 2: Upstash (free tier)
# Sign up at https://upstash.com
# Copy Redis URL to .env.local
```

### 5️⃣ **Test Protection**
```bash
npm run dev
# Visit http://localhost:3000/register
# Fill form and submit - should see reCAPTCHA verification
```

---

## 🛡️ Protected Endpoints Overview

| Endpoint | Method | Protection Level | reCAPTCHA | Rate Limit |
|----------|--------|------------------|-----------|------------|
| `/api/auth/login` | POST | 🔴 Critical | ✅ (0.7) | 5/hour |
| `/api/users` | POST | 🔴 Critical | ✅ (0.6) | 3/hour |
| `/api/contact` | POST | 🟡 High | ✅ (0.5) | 5/hour |
| `/api/auth/forgot-password` | POST | 🟡 High | ✅ (0.4) | 3/hour |
| `/api/auth/reset-password` | POST | 🟡 High | ✅ | 5/hour |
| `/api/upload-image` | POST | 🟢 Medium | ❌ | 10/5min |
| `/api/users/profile` | PUT | 🟢 Medium | ❌ | 10/hour |

---

## 📖 How to Add Protection to New Endpoint

### **Example: Protect a new `/api/newsletter` endpoint**

#### **1. Backend (route.ts):**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, addRateLimitHeaders } from '@/lib/distributed-rate-limit';
import { verifyRecaptcha, isLikelyHuman } from '@/lib/recaptcha-server';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const rateLimitResult = await checkRateLimit(request, {
      maxRequests: 5,
      windowSeconds: 3600, // 5 per hour
      keyPrefix: 'ratelimit:newsletter',
    });
    
    if (!rateLimitResult.success) {
      const response = NextResponse.json(
        { error: `Too many requests. Retry in ${Math.ceil((rateLimitResult.retryAfter || 0) / 60)} min.` },
        { status: 429 }
      );
      addRateLimitHeaders(response.headers, rateLimitResult);
      return response;
    }

    // 2. reCAPTCHA Verification
    const body = await request.json();
    const recaptchaResult = await verifyRecaptcha(body.recaptchaToken, 'newsletter_signup');
    
    if (!isLikelyHuman(recaptchaResult.score, 0.5)) {
      return NextResponse.json(
        { error: 'Verification failed. Please try again.' },
        { status: 403 }
      );
    }

    // 3. Your business logic here
    const { email } = body;
    // ... save to database ...

    // 4. Success response with headers
    const response = NextResponse.json({ success: true });
    addRateLimitHeaders(response.headers, rateLimitResult);
    return response;

  } catch (error) {
    console.error('Error in newsletter signup:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

#### **2. Frontend (component.tsx):**
```typescript
'use client';

import { useState } from 'react';
import { useRecaptcha, RecaptchaActions } from '@/lib/recaptcha-client';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { verify } = useRecaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Get reCAPTCHA token
      const recaptchaToken = await verify(RecaptchaActions.SUBMIT_FORM);
      
      if (!recaptchaToken) {
        alert('Verification failed. Please refresh the page.');
        return;
      }

      // 2. Send request with token
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, recaptchaToken }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      alert('Subscribed successfully!');
      setEmail('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to subscribe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
}
```

#### **3. Add reCAPTCHA Action (optional):**
```typescript
// lib/recaptcha-client.tsx
export const RecaptchaActions = {
  // ... existing actions ...
  NEWSLETTER_SIGNUP: 'newsletter_signup',
} as const;
```

---

## 🎯 Best Practices

### ✅ **DO:**
- ✅ Always use `addRateLimitHeaders()` on success responses
- ✅ Include user ID in rate limit key for authenticated endpoints
- ✅ Set appropriate reCAPTCHA score thresholds (0.4-0.7)
- ✅ Log anomaly blocks for security review
- ✅ Return clear error messages with retry times

### ❌ **DON'T:**
- ❌ Don't expose reCAPTCHA secret key to client-side
- ❌ Don't set rate limits too strict (causes UX issues)
- ❌ Don't forget to test rate limiting in production
- ❌ Don't skip reCAPTCHA on public forms
- ❌ Don't hardcode Redis credentials

---

## 🔍 Testing Your Protection

### **Test Rate Limiting:**
```bash
# PowerShell (Windows)
1..10 | ForEach-Object {
  curl -X POST http://localhost:3000/api/auth/login `
    -H "Content-Type: application/json" `
    -d '{"email":"test@test.com","password":"wrong"}'
  Start-Sleep -Seconds 1
}
# Request #6+ should return 429 error
```

### **Test reCAPTCHA:**
```javascript
// Browser Console (while on your site)
grecaptcha.ready(() => {
  grecaptcha.execute('YOUR_SITE_KEY', { action: 'login' })
    .then(token => console.log('Token:', token));
});
```

### **Test Anomaly Detection:**
```typescript
// Try 6 failed login attempts within 5 minutes
// Should trigger velocity attack detection
```

---

## 📊 Monitoring Dashboard

### **Rate Limit Headers (Every Response):**
```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1704067200
Retry-After: 3600  # (only on 429)
```

### **reCAPTCHA Score Distribution:**
- Visit: https://www.google.com/recaptcha/admin
- Check "Analytics" tab
- Review score distribution (aim for >0.5 average)

### **Redis Monitoring (Upstash):**
- Dashboard: https://console.upstash.com
- Check: Active connections, Memory usage, Command latency

---

## 🆘 Troubleshooting

### **Problem: reCAPTCHA not loading**
```bash
# Check if site key is correct
echo $NEXT_PUBLIC_RECAPTCHA_SITE_KEY

# Verify domain is registered in Google reCAPTCHA console
# Make sure RecaptchaProvider wraps your app in layout.tsx
```

### **Problem: Rate limit too strict**
```typescript
// Edit lib/distributed-rate-limit.ts
export const RateLimitPresets = {
  LOGIN: {
    maxRequests: 10, // Increase from 5
    windowSeconds: 3600,
  },
};
```

### **Problem: Redis connection fails**
```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping  # Should return PONG

# For Upstash, check firewall settings
# Make sure REDIS_URL includes password: rediss://:password@host:6379
```

### **Problem: Anomaly detection too sensitive**
```typescript
// Edit lib/anomaly-detection.ts
const VELOCITY_ATTACK_THRESHOLD = 10; // Increase from 5
const IMPOSSIBLE_TRAVEL_THRESHOLD_KM = 1000; // Increase from 500
```

---

## 🎓 Learning Resources

### **Official Documentation:**
- reCAPTCHA v3: https://developers.google.com/recaptcha/docs/v3
- Redis Rate Limiting: https://redis.io/commands/incr#pattern-rate-limiter
- OWASP Rate Limiting: https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html

### **Example Implementations:**
- See `app/api/auth/login/route.ts` for complete pattern
- See `app/register/page.tsx` for frontend integration
- See `lib/distributed-rate-limit.ts` for rate limiting logic

---

## ✅ Quick Checklist

- [ ] Environment variables configured (`.env.local`)
- [ ] reCAPTCHA keys obtained from Google
- [ ] Redis running (local or Upstash)
- [ ] RecaptchaProvider added to `layout.tsx`
- [ ] Test login/registration with protection
- [ ] Verify rate limit headers appear in responses
- [ ] Test rate limiting (6+ failed attempts)
- [ ] Check reCAPTCHA analytics dashboard

---

**Need Help?** Check the full documentation: `docs/SECURITY-PROTECTION-COMPLETE.md`
