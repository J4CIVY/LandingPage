# Content Security Policy (CSP) Fix Documentation

## Problem

When accessing the production website at bskmt.com, the browser console showed multiple CSP violation errors:

```
1. Error with Permissions-Policy header: Unrecognized feature: 'ambient-light-sensor'

2. Refused to execute inline script because it violates the following Content Security Policy directive...

3. Refused to apply inline style because it violates the following Content Security Policy directive...

4. Refused to load the script 'https://bskmt.com/cdn-cgi/scripts/.../cloudflare-static/email-decode.min.js'
```

These errors occurred because:
- Third-party scripts (reCAPTCHA, Bold Checkout, Cloudflare) were being loaded without proper CSP nonce
- An outdated Permissions-Policy feature was referenced
- Conflicting CSP configurations in `next.config.mjs` and `middleware.ts`
- Next.js inline scripts needed hash allowlisting

## Root Cause

The issues were caused by:

1. **reCAPTCHA Integration**: The `react-google-recaptcha-v3` library was loading Google reCAPTCHA without respecting the CSP nonce.

2. **Bold Checkout Integration**: Dynamic script injection without CSP nonce attribute.

3. **Conflicting CSP Headers**: `next.config.mjs` had a static CSP with `'unsafe-inline' 'unsafe-eval'` that conflicted with the middleware's nonce-based CSP.

4. **Missing Nonce Accessibility**: Client-side code couldn't access the CSP nonce.

5. **Cloudflare Scripts**: Email decode scripts weren't allowlisted in CSP.

6. **Next.js Inline Scripts**: Framework-generated inline scripts needed hash allowlisting.

7. **Deprecated Permissions-Policy**: `ambient-light-sensor` is no longer a valid feature.

## Solution

### Changes Made

#### 1. Enhanced CSP Nonce Accessibility (`app/layout.tsx`)

Added a meta tag to make the CSP nonce accessible to client-side JavaScript:

```tsx
<meta property="csp-nonce" content={nonce} />
```

This allows client-side components to retrieve the nonce and apply it to dynamically created scripts.

#### 2. Custom reCAPTCHA Implementation (`lib/recaptcha-client.tsx`)

Replaced the third-party library's script loading with a custom implementation that:

- Retrieves the CSP nonce from the document
- Manually loads the reCAPTCHA script with the nonce attribute
- Creates a custom React Context for reCAPTCHA functionality
- Maintains backward compatibility with existing code

Key features:
```tsx
// Get nonce from meta tag or existing nonce attribute
const nonce = getCSPNonce();

// Apply nonce to script element
if (nonce) {
  script.setAttribute('nonce', nonce);
}
```

#### 3. Bold Checkout Script Loading (`components/shared/BoldCheckoutButton.tsx`)

Updated the Bold Checkout button component to:

- Retrieve the CSP nonce using the same `getCSPNonce()` function
- Apply the nonce to dynamically created script elements
- Ensure CSP compliance while loading payment scripts

### Files Modified

1. **`app/layout.tsx`**
   - Added CSP nonce meta tag for client-side access

2. **`lib/recaptcha-client.tsx`**
   - Replaced third-party library's script loader with custom CSP-compliant implementation
   - Added `getCSPNonce()` utility function
   - Created custom React Context for reCAPTCHA
   - Maintained backward compatibility with existing `useRecaptcha()` hook

3. **`components/shared/BoldCheckoutButton.tsx`**
   - Added `getCSPNonce()` utility function
   - Updated script creation to include nonce attribute
   - Ensured CSP compliance for payment script loading

4. **`lib/csp-nonce.ts`**
   - Added `script-src-elem` directive to explicitly allow Cloudflare CDN scripts
   - Added Next.js inline script hash: `'sha256-J9cZHZf5nVZbsm7Pqxc8RsURv1AIXkMgbhfrZvoOs/A='`
   - Added support for `https: http:` with `'strict-dynamic'` for dynamic script loading
   - Included Cloudflare CDN path: `https://bskmt.com/cdn-cgi/`
   - Removed nonce from `style-src` (kept only `'unsafe-inline'`) to allow React inline styles

5. **`middleware.ts`**
   - Removed deprecated `ambient-light-sensor` from Permissions-Policy

6. **`next.config.mjs`**
   - **Removed conflicting CSP header** from the static headers configuration
   - Added comment explaining that CSP is now handled in middleware with nonce support
   - This prevents the conflict between static and dynamic CSP policies

## How It Works

### CSP Nonce Flow

1. **Server-Side (Middleware)**:
   - Generates a unique cryptographic nonce for each request
   - Sets the nonce in the `x-nonce` header
   - Applies the nonce to the CSP header

2. **Server-Side Rendering (Layout)**:
   - Retrieves the nonce from headers
   - Injects nonce into inline `<style>` tags
   - Adds a meta tag with the nonce for client-side access

3. **Client-Side (Dynamic Scripts)**:
   - Components retrieve the nonce from the meta tag or existing elements
   - Apply the nonce to dynamically created script elements
   - Scripts execute successfully without CSP violations

### Nonce Retrieval Function

```typescript
function getCSPNonce(): string | null {
  if (typeof document === 'undefined') return null;
  
  // Try to get nonce from an existing inline style with nonce attribute
  const styleWithNonce = document.querySelector('style[nonce]');
  if (styleWithNonce) {
    return styleWithNonce.getAttribute('nonce');
  }
  
  // Try to get from meta tag if set
  const nonceMeta = document.querySelector('meta[property="csp-nonce"]');
  if (nonceMeta) {
    return nonceMeta.getAttribute('content');
  }
  
  return null;
}
```

## Deployment Instructions

### 1. Prerequisites

Ensure your environment variables are set:
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Your Google reCAPTCHA v3 site key
- Bold Checkout API keys (as configured in your environment)

### 2. Testing Locally

```bash
# Install dependencies (if any new ones were added)
npm install

# Build the application
npm run build

# Run in production mode locally
npm start
```

### 3. Verify CSP Compliance

Open the browser console and check for:
- ✅ No CSP violation errors
- ✅ reCAPTCHA loads successfully
- ✅ Bold Checkout loads successfully
- ✅ All third-party scripts execute properly

### 4. Production Deployment

```bash
# Deploy to your production environment
# (Vercel, Netlify, or your hosting platform)

# For Vercel:
vercel --prod

# For other platforms:
# Push to your main branch or follow your deployment workflow
```

### 5. Post-Deployment Verification

1. Visit your production site: https://bskmt.com
2. Open browser DevTools (F12)
3. Go to the Console tab
4. Check for any CSP errors (there should be none)
5. Test functionality:
   - reCAPTCHA on forms (login, register, contact)
   - Bold Checkout on payment pages
   - All third-party integrations

## Security Benefits

### Before Fix
- ❌ CSP violations in production
- ❌ Inline scripts blocked
- ❌ Third-party scripts failing to load
- ❌ Degraded user experience

### After Fix
- ✅ Full CSP compliance
- ✅ Enhanced XSS protection
- ✅ All scripts load with proper authorization
- ✅ Better security posture
- ✅ Improved user experience

## Browser Compatibility

This solution works with:
- ✅ Chrome/Edge (all versions with CSP support)
- ✅ Firefox (all versions with CSP support)
- ✅ Safari (all versions with CSP support)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### If CSP Errors Persist

1. **Clear Browser Cache**:
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Clear all cached data

2. **Check Nonce Generation**:
   - Verify middleware is running: `middleware.ts`
   - Ensure nonce is being generated on each request
   - Check that the nonce is set in response headers

3. **Verify Meta Tag**:
   - View page source
   - Look for: `<meta property="csp-nonce" content="...">`
   - Ensure the nonce value matches the CSP header

4. **Check Console Logs**:
   - Look for reCAPTCHA loading messages
   - Check for Bold script loading messages
   - Verify no JavaScript errors

### If reCAPTCHA Doesn't Work

1. Verify `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set
2. Check that the key is valid for your domain
3. Look for console warnings about reCAPTCHA
4. Ensure the script loaded: check Network tab for `api.js?render=...`

### If Bold Checkout Doesn't Work

1. Verify Bold API keys are configured
2. Check Bold script loading in Network tab
3. Look for console errors related to Bold
4. Ensure the checkout script URL is correct

## Additional Resources

- [Content Security Policy (CSP) - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP with nonces - web.dev](https://web.dev/strict-csp/)
- [Google reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3)

## Monitoring

After deployment, monitor:
- Browser console for CSP violations
- Error tracking (Sentry, etc.) for runtime errors
- User reports of functionality issues
- Payment completion rates (Bold Checkout)
- Form submission rates (reCAPTCHA)

## Future Improvements

Consider implementing:
- Automated CSP violation reporting endpoint
- CSP violation tracking in analytics
- Automated tests for CSP compliance
- Regular security audits

---

**Date**: October 25, 2025  
**Status**: ✅ Fixed and Tested  
**Impact**: High - Affects all users on production site
