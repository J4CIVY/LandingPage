'use client';

import { useEffect } from 'react';
import { initSecurityMonitoring, runSecurityAudit } from '@/lib/security-audit';

/**
 * Security Monitor Component
 * Runs security audits in development mode and monitors for issues
 * 
 * Features:
 * - Checks secure context (HTTPS)
 * - Audits security headers
 * - Detects sensitive data in browser storage
 * - Monitors inline scripts without CSP nonce
 * - Detects mixed content issues
 * - Checks for XSS vulnerabilities
 * - Audits cookie security
 * 
 * Usage: Add to root layout or specific pages
 */
export default function SecurityMonitor() {
  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV === 'development') {
      // Initialize security monitoring
      initSecurityMonitoring();
      
      // Run initial audit
      runSecurityAudit(true).then((result) => {
        if (result.passed) {
          console.log('✅ Security audit passed - No issues detected');
        } else {
          console.warn('⚠️ Security audit found issues:', result.issues);
        }
      });
    }
  }, []);

  // This component doesn't render anything
  return null;
}
