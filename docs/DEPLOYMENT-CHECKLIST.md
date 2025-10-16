# 🚀 Deployment Checklist - Security v2.4.0

## ✅ Pre-Deployment Verification

### **1. Code Compilation**
```bash
npm run build
```
- [ ] ✅ No TypeScript errors
- [ ] ✅ All dependencies installed
- [ ] ✅ Build completes successfully

### **2. Environment Variables**
Required in production environment (Vercel/hosting):
```bash
# reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_production_site_key
RECAPTCHA_SECRET_KEY=your_production_secret_key

# Redis (Upstash recommended)
REDIS_URL=rediss://:password@production.upstash.io:6379

# Existing variables
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=your_production_secret
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret
```

- [ ] Add all variables to hosting platform
- [ ] Verify `NEXT_PUBLIC_*` variables are client-side accessible
- [ ] Test Redis connection from production environment

### **3. reCAPTCHA Configuration**
Visit: https://www.google.com/recaptcha/admin

- [ ] Add production domain to allowed domains list
- [ ] Verify site key works on staging/production
- [ ] Enable domain verification
- [ ] Set up alerts for suspicious activity

### **4. Redis Setup (Upstash)**
Visit: https://console.upstash.com

- [ ] Create new Redis database (free tier available)
- [ ] Select region closest to your hosting (e.g., US East for Vercel)
- [ ] Copy `REDIS_URL` to hosting environment variables
- [ ] Enable TLS (default for Upstash)
- [ ] Set up eviction policy: `allkeys-lru` (for rate limiting)

---

## 🧪 Testing Checklist

### **Test 1: Rate Limiting**
```powershell
# PowerShell (Windows)
1..10 | ForEach-Object {
  curl -X POST https://yourdomain.com/api/auth/login `
    -H "Content-Type: application/json" `
    -d '{"email":"test@test.com","password":"wrong"}'
  Start-Sleep -Seconds 1
}
```
**Expected:**
- ✅ First 5 requests return 401 (wrong password)
- ✅ 6th request returns 429 (rate limited)
- ✅ Response includes headers:
  - `X-RateLimit-Limit: 5`
  - `X-RateLimit-Remaining: 0`
  - `X-RateLimit-Reset: <timestamp>`
  - `Retry-After: <seconds>`

### **Test 2: reCAPTCHA Integration**
1. Open https://yourdomain.com/register
2. Fill registration form
3. Open Browser DevTools → Console
4. Submit form
5. Check console logs for: `[reCAPTCHA] Score: 0.X`

**Expected:**
- ✅ reCAPTCHA script loads without errors
- ✅ Token generated on form submission
- ✅ Backend verifies token successfully
- ✅ Score above threshold (>0.6 for registration)

### **Test 3: Contact Form**
1. Visit https://yourdomain.com/contact
2. Submit complaint or PQRSDF form
3. Check Network tab for `/api/contact` request

**Expected:**
- ✅ Request includes `recaptchaToken` in body
- ✅ Response includes rate limit headers
- ✅ Form submission succeeds with 200 status

### **Test 4: Anomaly Detection**
Try to trigger velocity attack:
1. Attempt 6+ failed logins within 5 minutes
2. Use same IP but different credentials

**Expected:**
- ✅ 6th attempt returns 403 with message: "Suspicious activity detected"
- ✅ Console logs show: `[ANOMALY BLOCKED] Velocity attack detected`

### **Test 5: Profile Update**
1. Login to authenticated account
2. Navigate to profile page
3. Change email address
4. Submit update

**Expected:**
- ✅ Anomaly detection checks for email change
- ✅ Rate limit headers appear in response
- ✅ 10 updates allowed per hour

---

## 🔒 Security Verification

### **Headers Check**
```bash
curl -I https://yourdomain.com
```
**Expected Headers:**
```http
Content-Security-Policy: script-src 'self' 'nonce-...' https://www.google.com https://www.gstatic.com
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

### **Rate Limit Headers (on API routes)**
```bash
curl -v https://yourdomain.com/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
```
**Expected:**
```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1704067200
```

---

## 📊 Post-Deployment Monitoring

### **Week 1: Daily Checks**
- [ ] Monitor Redis memory usage (Upstash dashboard)
- [ ] Check reCAPTCHA analytics (Google console)
- [ ] Review 429 error rate (<1% of total requests)
- [ ] Look for anomaly blocks in application logs

### **Week 2-4: Weekly Checks**
- [ ] Analyze reCAPTCHA score distribution
  - Target: >70% scores above 0.5
  - Flag: >10% scores below 0.3 (potential bot traffic)
- [ ] Review Redis command latency (<5ms)
- [ ] Check for false positives in anomaly detection
- [ ] Verify rate limit windows are effective

### **Ongoing Monitoring**
Set up alerts for:
- Redis connection failures
- reCAPTCHA quota exceeded (100k requests/day free tier)
- Spike in 429 rate limit errors (>5% of requests)
- Repeated anomaly blocks from same user

---

## 🐛 Rollback Plan

If issues occur post-deployment:

### **Quick Rollback (Emergency):**
```typescript
// 1. Disable reCAPTCHA temporarily
// In lib/recaptcha-server.ts
export async function verifyRecaptcha(token: string, action: string) {
  // EMERGENCY BYPASS - Remove after fixing
  return { success: true, score: 1.0 };
}

// 2. Disable rate limiting
// In lib/distributed-rate-limit.ts
export async function checkRateLimit(...) {
  // EMERGENCY BYPASS
  return { success: true, remaining: 999, limit: 999, reset: Date.now() };
}

// 3. Deploy immediately
git commit -am "Emergency: Disable security checks"
git push origin main  # Triggers Vercel deployment
```

### **Gradual Rollback (Recommended):**
```typescript
// 1. Increase rate limits (less disruptive)
export const RateLimitPresets = {
  LOGIN: { maxRequests: 20, windowSeconds: 3600 }, // Was 5
};

// 2. Lower reCAPTCHA threshold
export const RECAPTCHA_THRESHOLDS = {
  login: 0.3, // Was 0.7
};

// 3. Disable anomaly detection (least risky)
export async function detectBehaviorAnomaly(...) {
  return { shouldBlock: false, score: 1.0, reasons: [] };
}
```

---

## ✅ Final Deployment Steps

### **1. Staging Environment**
- [ ] Deploy to staging with production-like config
- [ ] Run all tests above
- [ ] Monitor for 24 hours
- [ ] Verify no false positives

### **2. Production Deployment**
```bash
# Commit all changes
git add .
git commit -m "feat: Complete security protection v2.4.0 - All endpoints protected"

# Push to main (triggers Vercel deployment)
git push origin main

# Or manual deployment
vercel --prod
```

### **3. Post-Deployment Verification** (Within 1 hour)
- [ ] Test login flow
- [ ] Test registration
- [ ] Test contact form
- [ ] Verify rate limiting works
- [ ] Check Redis metrics (Upstash)
- [ ] Review reCAPTCHA analytics

### **4. Monitoring Setup**
- [ ] Set up Upstash alerts (memory >80%)
- [ ] Set up error tracking (Sentry/Rollbar)
- [ ] Configure log aggregation (LogRocket/Datadog)
- [ ] Create monitoring dashboard (Grafana/New Relic)

---

## 📈 Success Metrics

Track these KPIs for 30 days:

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| **Rate Limit 429 Errors** | <1% of requests | >5% |
| **reCAPTCHA Avg Score** | >0.5 | <0.3 |
| **Anomaly Blocks** | 0-10/day | >50/day |
| **Redis Latency** | <5ms | >20ms |
| **Redis Memory** | <50% | >80% |
| **reCAPTCHA Requests** | <100k/day (free tier) | >95k/day |

---

## 🎯 Definition of Done

- [x] ✅ All 8 critical endpoints protected
- [x] ✅ reCAPTCHA v3 integrated (frontend + backend)
- [x] ✅ Redis rate limiting deployed
- [x] ✅ Anomaly detection active
- [x] ✅ CSP nonces applied globally
- [x] ✅ TypeScript compiles without errors
- [ ] Environment variables configured in production
- [ ] Redis instance deployed (Upstash)
- [ ] reCAPTCHA domain registered
- [ ] Staging tests passed (24h monitoring)
- [ ] Production deployed successfully
- [ ] Post-deployment verification complete
- [ ] Monitoring dashboards set up
- [ ] Team trained on new security features

---

## 📞 Emergency Contacts

**If critical issues occur:**
1. **Disable security temporarily** (see Rollback Plan above)
2. **Check status pages:**
   - Upstash: https://status.upstash.com
   - Google reCAPTCHA: https://status.cloud.google.com
3. **Review logs:**
   - Vercel: https://vercel.com/[your-project]/logs
   - Upstash: https://console.upstash.com/[your-db]/logs

**Support Channels:**
- Upstash Discord: https://upstash.com/discord
- reCAPTCHA Support: https://support.google.com/recaptcha

---

## 🎉 Deployment Complete!

Once all checklist items are marked:
- ✅ Security v2.4.0 is production-ready
- ✅ All critical endpoints protected
- ✅ Monitoring and alerts configured
- ✅ Rollback plan documented

**Next Steps:**
1. Monitor for 1 week
2. Tune rate limits based on traffic patterns
3. Adjust reCAPTCHA thresholds if needed
4. Document learnings in team wiki

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Version:** 2.4.0  
**Status:** 🚀 Production Ready
