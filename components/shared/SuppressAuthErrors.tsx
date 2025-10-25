/**
 * Suppress Auth Errors Component
 * Suppresses expected 401 errors from /api/auth/me in browser console
 * These are normal when users are not authenticated and don't need to be shown
 */

'use client';

import { useEffect } from 'react';

export default function SuppressAuthErrors() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Store original console.error
    const originalError = console.error;

    // Override console.error to filter auth check errors
    console.error = (...args: any[]) => {
      // Convert args to string to check content
      const errorString = args.join(' ');
      
      // Suppress 401 errors from /api/auth/me (expected when not logged in)
      if (
        errorString.includes('/api/auth/me') && 
        (errorString.includes('401') || errorString.includes('Unauthorized'))
      ) {
        // Silently ignore - this is expected behavior
        return;
      }
      
      // Log all other errors normally
      originalError.apply(console, args);
    };

    // Cleanup: restore original console.error on unmount
    return () => {
      console.error = originalError;
    };
  }, []);

  return null; // This component doesn't render anything
}
