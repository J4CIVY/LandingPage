/**
 * Subresource Integrity (SRI) Hashes
 * Ensures third-party scripts haven't been tampered with
 * 
 * Generate SRI hashes with: 
 * curl -s URL | openssl dgst -sha384 -binary | openssl base64 -A
 * 
 * Or use: https://www.srihash.org/
 */

export interface SRIResource {
  src: string;
  integrity: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  referrerPolicy?: string;
}

/**
 * Third-party script integrity hashes
 * IMPORTANT: Update these hashes when upgrading third-party libraries
 * Check script versions and regenerate hashes periodically
 */
export const SRIHashes = {
  // Google Analytics (gtag.js) - Updates frequently, use fallback verification
  googleAnalytics: {
    src: 'https://www.googletagmanager.com/gtag/js',
    integrity: '', // Google Analytics updates frequently, verify via CSP
    crossOrigin: 'anonymous' as const,
  },

  // Google Maps API - No SRI needed (loaded from googleapis.com, verified via API key)
  googleMaps: {
    src: 'https://maps.googleapis.com/maps/api/js',
    integrity: '', // API key provides security
    crossOrigin: 'anonymous' as const,
  },

  // Cloudflare Analytics Beacon
  cloudflareAnalytics: {
    src: 'https://static.cloudflareinsights.com/beacon.min.js',
    integrity: '', // Cloudflare's beacon updates frequently
    crossOrigin: 'anonymous' as const,
  },

  // Facebook Pixel (fbevents.js) - Updates frequently
  facebookPixel: {
    src: 'https://connect.facebook.net/en_US/fbevents.js',
    integrity: '', // Facebook updates frequently, rely on CSP + HTTPS
    crossOrigin: 'anonymous' as const,
  },

  // Note: For scripts that update frequently (analytics, social media SDKs),
  // SRI hashes become maintenance burden. Instead:
  // 1. Use CSP to whitelist trusted domains
  // 2. Use HTTPS to ensure transport security
  // 3. Monitor scripts with Content Security Policy reports
  // 4. Use Subresource Integrity for stable, versioned libraries only
} as const;

/**
 * Create script tag with SRI
 */
export function createSRIScript(resource: SRIResource): string {
  const integrityAttr = resource.integrity ? `integrity="${resource.integrity}"` : '';
  const crossOriginAttr = resource.crossOrigin ? `crossorigin="${resource.crossOrigin}"` : '';
  const referrerPolicyAttr = resource.referrerPolicy ? `referrerpolicy="${resource.referrerPolicy}"` : '';

  return `<script src="${resource.src}" ${integrityAttr} ${crossOriginAttr} ${referrerPolicyAttr} async></script>`;
}

/**
 * Verify script integrity on load (client-side)
 */
export function verifyScriptIntegrity(
  scriptElement: HTMLScriptElement,
  expectedIntegrity: string
): boolean {
  if (!expectedIntegrity) return true; // No integrity check required

  const actualIntegrity = scriptElement.integrity;
  return actualIntegrity === expectedIntegrity;
}

/**
 * Static library SRI hashes (for versioned, stable libraries)
 * Example: If you self-host libraries or use specific CDN versions
 */
export const StaticLibrarySRI = {
  // Example: React CDN (if using CDN instead of npm)
  // react18: {
  //   src: 'https://unpkg.com/react@18.2.0/umd/react.production.min.js',
  //   integrity: 'sha384-ACTUAL-HASH-HERE',
  //   crossOrigin: 'anonymous' as const,
  // },
  
  // Add your static libraries here with their SRI hashes
} as const;

/**
 * CSP Report URI endpoint for monitoring script violations
 * Configure in next.config.mjs CSP: report-uri /api/csp-report
 */
export const CSP_REPORT_CONFIG = {
  endpoint: '/api/csp-report',
  enableReporting: process.env.NODE_ENV === 'production',
} as const;

/**
 * Best practices for third-party scripts:
 * 
 * 1. Frequently Updated Scripts (Analytics, Social Media):
 *    - Use CSP whitelist instead of SRI
 *    - Monitor with CSP reporting
 *    - Load asynchronously
 * 
 * 2. Versioned Libraries (CDN-hosted):
 *    - Use SRI hashes
 *    - Pin specific versions
 *    - Update hashes when upgrading
 * 
 * 3. Critical Scripts:
 *    - Self-host when possible
 *    - Use SRI with fallback
 *    - Monitor loading failures
 * 
 * 4. Payment/Security Scripts:
 *    - Verify via API keys/tokens
 *    - Use HTTPS exclusively
 *    - Implement CSP strict policies
 */
