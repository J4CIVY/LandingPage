/**
 * Security Audit Utilities
 * Provides runtime security checks and monitoring
 * 
 * This file contains utilities to detect and prevent common security issues
 * in the BSK Motorcycle Team application.
 */

/**
 * Check if the application is running in a secure context
 * @returns true if HTTPS or localhost
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return true;
  
  // Check if we're using HTTPS or localhost
  return window.isSecureContext || 
         window.location.protocol === 'https:' ||
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
}

/**
 * Check if required security headers are present
 * Logs warnings if critical headers are missing
 */
export async function auditSecurityHeaders(): Promise<{
  passed: boolean;
  warnings: string[];
}> {
  if (typeof window === 'undefined') {
    return { passed: true, warnings: [] };
  }

  const warnings: string[] = [];

  try {
    // Make a HEAD request to check headers
    const response = await fetch(window.location.href, { method: 'HEAD' });
    
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security',
      'content-security-policy',
      'referrer-policy',
      'permissions-policy',
    ];

    requiredHeaders.forEach(header => {
      if (!response.headers.get(header)) {
        warnings.push(`Missing security header: ${header}`);
      }
    });

    // Check for dangerous headers
    const poweredBy = response.headers.get('x-powered-by');
    if (poweredBy) {
      warnings.push(`Server is exposing technology stack: ${poweredBy}`);
    }

  } catch (error) {
    warnings.push('Unable to audit security headers');
  }

  return {
    passed: warnings.length === 0,
    warnings,
  };
}

/**
 * Check if sensitive data might be exposed in browser storage
 * @returns Array of potential security issues
 */
export function auditBrowserStorage(): string[] {
  if (typeof window === 'undefined') return [];

  const issues: string[] = [];
  const sensitivePatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /api[_-]?key/i,
    /private[_-]?key/i,
    /credit[_-]?card/i,
    /ssn/i,
    /social[_-]?security/i,
  ];

  // Check localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      sensitivePatterns.forEach(pattern => {
        if (pattern.test(key)) {
          issues.push(`Potentially sensitive data in localStorage: ${key}`);
        }
      });

      // Check value too (sample first 100 chars to avoid performance issues)
      const value = localStorage.getItem(key)?.substring(0, 100) || '';
      sensitivePatterns.forEach(pattern => {
        if (pattern.test(value)) {
          issues.push(`Potentially sensitive data in localStorage value: ${key}`);
        }
      });
    }
  } catch (error) {
    issues.push('Unable to audit localStorage');
  }

  // Check sessionStorage
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) continue;

      sensitivePatterns.forEach(pattern => {
        if (pattern.test(key)) {
          issues.push(`Potentially sensitive data in sessionStorage: ${key}`);
        }
      });
    }
  } catch (error) {
    issues.push('Unable to audit sessionStorage');
  }

  return issues;
}

/**
 * Check for potentially dangerous inline scripts or event handlers
 * @returns Array of DOM elements with security concerns
 */
export function auditInlineScripts(): string[] {
  if (typeof window === 'undefined' || typeof document === 'undefined') return [];

  const issues: string[] = [];

  // Check for inline scripts without nonce
  // IMPORTANT: Ignore Next.js framework scripts (they use hash-based CSP)
  const scripts = document.querySelectorAll('script:not([src]):not([nonce])');
  const userScripts = Array.from(scripts).filter(script => {
    const content = script.textContent || '';
    // Ignore Next.js internal scripts (they have CSP hash)
    return !content.includes('self.__next_f') && 
           !content.includes('__webpack') &&
           !content.includes('__NEXT_DATA__') &&
           !content.includes('requestAnimationFrame');
  });
  
  if (userScripts.length > 0) {
    issues.push(`Found ${userScripts.length} inline script(s) without CSP nonce`);
  }

  // Check for inline event handlers
  const elementsWithEvents = document.querySelectorAll('[onclick], [onload], [onerror]');
  if (elementsWithEvents.length > 0) {
    issues.push(`Found ${elementsWithEvents.length} element(s) with inline event handlers`);
  }

  // Check for javascript: protocol in links
  const jsLinks = document.querySelectorAll('a[href^="javascript:"]');
  if (jsLinks.length > 0) {
    issues.push(`Found ${jsLinks.length} link(s) with javascript: protocol`);
  }

  return issues;
}

/**
 * Check for mixed content issues (HTTP resources on HTTPS page)
 */
export function auditMixedContent(): string[] {
  if (typeof window === 'undefined' || typeof document === 'undefined') return [];
  if (window.location.protocol !== 'https:') return [];

  const issues: string[] = [];

  // Check for HTTP images
  const httpImages = document.querySelectorAll('img[src^="http:"]');
  if (httpImages.length > 0) {
    issues.push(`Found ${httpImages.length} HTTP image(s) on HTTPS page`);
  }

  // Check for HTTP scripts
  const httpScripts = document.querySelectorAll('script[src^="http:"]');
  if (httpScripts.length > 0) {
    issues.push(`Found ${httpScripts.length} HTTP script(s) on HTTPS page`);
  }

  // Check for HTTP stylesheets
  const httpStyles = document.querySelectorAll('link[rel="stylesheet"][href^="http:"]');
  if (httpStyles.length > 0) {
    issues.push(`Found ${httpStyles.length} HTTP stylesheet(s) on HTTPS page`);
  }

  return issues;
}

/**
 * Check for common XSS vulnerabilities in the DOM
 */
export function auditXSSVulnerabilities(): string[] {
  if (typeof window === 'undefined' || typeof document === 'undefined') return [];

  const issues: string[] = [];

  // Check for dangerouslySetInnerHTML usage (React)
  // Note: This can only catch elements after React has rendered
  const elementsWithHtml = document.querySelectorAll('[data-dangerous-html="true"]');
  if (elementsWithHtml.length > 0) {
    issues.push(`Found ${elementsWithHtml.length} element(s) using dangerouslySetInnerHTML`);
  }

  // Check for iframes without sandbox
  const unsandboxedIframes = document.querySelectorAll('iframe:not([sandbox])');
  if (unsandboxedIframes.length > 0) {
    issues.push(`Found ${unsandboxedIframes.length} iframe(s) without sandbox attribute`);
  }

  return issues;
}

/**
 * Check cookie security settings
 */
export function auditCookies(): string[] {
  if (typeof document === 'undefined') return [];

  const issues: string[] = [];
  const cookies = document.cookie.split(';');

  // Note: We can only see the cookie names/values from JavaScript,
  // not the HttpOnly, Secure, or SameSite flags
  // This is actually good for security (HttpOnly cookies aren't accessible)

  // Known cookies that are intentionally readable by JS (for legitimate reasons)
  const legitimateReadableCookies = [
    'bsk-csrf-token-readable', // Required for CSRF protection (client must read and send)
    'theme', // User preference cookies
    'locale', // Language preference
    'consent', // Cookie consent tracking
  ];

  cookies.forEach(cookie => {
    const [name] = cookie.trim().split('=');
    
    // Skip known legitimate cookies
    if (legitimateReadableCookies.some(allowed => name.includes(allowed))) {
      return;
    }
    
    // Check for potentially sensitive cookie names that shouldn't be accessible
    const sensitiveCookiePatterns = [
      /session/i,
      /^token$/i, // Exact match for "token" but not "csrf-token"
      /auth(?!-csrf)/i, // "auth" but not "auth-csrf"
      /password/i,
    ];

    sensitiveCookiePatterns.forEach(pattern => {
      if (pattern.test(name)) {
        issues.push(`Cookie "${name}" may contain sensitive data and should be HttpOnly`);
      }
    });
  });

  return issues;
}

/**
 * Run comprehensive security audit
 * @param verbose - If true, logs results to console
 * @returns Audit results
 */
export async function runSecurityAudit(verbose: boolean = false): Promise<{
  passed: boolean;
  issues: Array<{ category: string; items: string[] }>;
}> {
  if (typeof window === 'undefined') {
    return { passed: true, issues: [] };
  }

  const issues: Array<{ category: string; items: string[] }> = [];

  // Check secure context
  if (!isSecureContext()) {
    issues.push({
      category: 'Secure Context',
      items: ['Application is not running in a secure context (HTTPS required)'],
    });
  }

  // Audit security headers
  const headersAudit = await auditSecurityHeaders();
  if (headersAudit.warnings.length > 0) {
    issues.push({
      category: 'Security Headers',
      items: headersAudit.warnings,
    });
  }

  // Audit browser storage
  const storageIssues = auditBrowserStorage();
  if (storageIssues.length > 0) {
    issues.push({
      category: 'Browser Storage',
      items: storageIssues,
    });
  }

  // Audit inline scripts
  const inlineScriptIssues = auditInlineScripts();
  if (inlineScriptIssues.length > 0) {
    issues.push({
      category: 'Inline Scripts',
      items: inlineScriptIssues,
    });
  }

  // Audit mixed content
  const mixedContentIssues = auditMixedContent();
  if (mixedContentIssues.length > 0) {
    issues.push({
      category: 'Mixed Content',
      items: mixedContentIssues,
    });
  }

  // Audit XSS vulnerabilities
  const xssIssues = auditXSSVulnerabilities();
  if (xssIssues.length > 0) {
    issues.push({
      category: 'XSS Vulnerabilities',
      items: xssIssues,
    });
  }

  // Audit cookies
  const cookieIssues = auditCookies();
  if (cookieIssues.length > 0) {
    issues.push({
      category: 'Cookies',
      items: cookieIssues,
    });
  }

  if (verbose) {
    console.group('🔒 Security Audit Results');
    
    if (issues.length === 0) {
      console.log('✅ No security issues detected');
    } else {
      console.warn(`⚠️ Found ${issues.length} security concern(s):`);
      issues.forEach(({ category, items }) => {
        console.group(`📋 ${category}`);
        items.forEach(item => console.warn(`  - ${item}`));
        console.groupEnd();
      });
    }
    
    console.groupEnd();
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Initialize security monitoring in development mode
 * Automatically runs audits and logs issues
 */
export function initSecurityMonitoring(): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV === 'production') return;

  console.log('🔒 Security monitoring enabled (development mode)');

  // Run audit on page load
  if (document.readyState === 'complete') {
    runSecurityAudit(true);
  } else {
    window.addEventListener('load', () => {
      runSecurityAudit(true);
    });
  }

  // Monitor for new scripts being added
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT' && node instanceof HTMLScriptElement) {
            if (!node.src && !node.nonce) {
              console.warn('🔒 Security: Inline script added without CSP nonce', node);
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
}
