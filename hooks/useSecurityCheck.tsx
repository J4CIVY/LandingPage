'use client';

import { useEffect, useState } from 'react';
import { runSecurityAudit } from '@/lib/security-audit';

/**
 * Hook to check security status before sensitive operations
 * Useful for admin pages, payment forms, authentication flows
 * 
 * @returns Security status and issues
 */
export function useSecurityCheck() {
  const [securityStatus, setSecurityStatus] = useState<{
    checked: boolean;
    passed: boolean;
    issues: Array<{ category: string; items: string[] }>;
  }>({
    checked: false,
    passed: false,
    issues: [],
  });

  useEffect(() => {
    runSecurityAudit(false).then((result) => {
      setSecurityStatus({
        checked: true,
        passed: result.passed,
        issues: result.issues,
      });

      // Log critical issues in production
      if (!result.passed && process.env.NODE_ENV === 'production') {
        console.error('🔒 Security audit failed:', result.issues);
      }
    });
  }, []);

  return securityStatus;
}

/**
 * Component that displays a security warning if issues are detected
 * Use on sensitive pages (admin, payment, profile)
 */
export function SecurityWarning() {
  const { checked, passed, issues } = useSecurityCheck();

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null;
  if (!checked) return null;
  if (passed) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg shadow-lg z-50">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔒</span>
        <div className="flex-1">
          <h4 className="font-bold text-red-800 dark:text-red-200 mb-2">
            Security Issues Detected
          </h4>
          <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
            {issues.slice(0, 3).map((issue, idx) => (
              <div key={idx}>
                <strong>{issue.category}:</strong>
                <ul className="list-disc list-inside ml-2">
                  {issue.items.slice(0, 2).map((item, itemIdx) => (
                    <li key={itemIdx} className="text-xs">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs mt-2 text-red-600 dark:text-red-400">
            Check console for full details (Development only)
          </p>
        </div>
      </div>
    </div>
  );
}
