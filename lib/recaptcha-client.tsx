/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Google reCAPTCHA v3 Integration
 * Provides invisible bot protection for forms
 * reCAPTCHA v3 returns a score (0.0-1.0) instead of challenge
 * 
 * SECURITY: CSP-compliant implementation with nonce support
 * This implementation loads reCAPTCHA with proper CSP nonce to avoid violations
 */

'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

/**
 * Get the current CSP nonce from the document
 * This is set by the middleware and injected into inline styles/scripts
 */
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

/**
 * Custom script loader that respects CSP nonce
 */
function loadRecaptchaScript(siteKey: string, nonce: string | null): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
    if (existingScript) {
      // Wait for grecaptcha to be ready
      const checkReady = setInterval(() => {
        if ((window as any).grecaptcha?.ready) {
          clearInterval(checkReady);
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        if ((window as any).grecaptcha?.ready) {
          resolve();
        } else {
          reject(new Error('reCAPTCHA took too long to load'));
        }
      }, 10000);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    
    // SECURITY: Add nonce for CSP compliance
    if (nonce) {
      script.setAttribute('nonce', nonce);
    }

    script.onload = () => {
      // Wait for grecaptcha to be ready
      if ((window as any).grecaptcha?.ready) {
        resolve();
      } else {
        // Poll for grecaptcha.ready
        const checkReady = setInterval(() => {
          if ((window as any).grecaptcha?.ready) {
            clearInterval(checkReady);
            resolve();
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkReady);
          if ((window as any).grecaptcha?.ready) {
            resolve();
          } else {
            reject(new Error('grecaptcha.ready not available'));
          }
        }, 5000);
      }
    };
    
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA script'));

    document.head.appendChild(script);
  });
}

// Context for reCAPTCHA
interface RecaptchaContextValue {
  executeRecaptcha: ((action: string) => Promise<string>) | null;
  isReady: boolean;
}

const RecaptchaContext = createContext<RecaptchaContextValue>({
  executeRecaptcha: null,
  isReady: false,
});

/**
 * reCAPTCHA Provider Component with CSP nonce support
 * Wrap your app or specific pages with this
 */
export function RecaptchaProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [scriptError, setScriptError] = useState<Error | null>(null);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      console.warn('reCAPTCHA site key not configured. Bot protection disabled.');
      setIsReady(true); // Allow children to render
      return;
    }

    const nonce = getCSPNonce();
    
    loadRecaptchaScript(RECAPTCHA_SITE_KEY, nonce)
      .then(() => {
        // Initialize reCAPTCHA
        (window as any).grecaptcha.ready(() => {
          setIsReady(true);
        });
      })
      .catch((error) => {
        console.error('Failed to load reCAPTCHA:', error);
        setScriptError(error);
        setIsReady(true); // Still render children even if reCAPTCHA fails
      });
  }, []);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string> => {
      if (!RECAPTCHA_SITE_KEY) {
        console.warn('reCAPTCHA not configured');
        return '';
      }

      if (!isReady || scriptError) {
        console.warn('reCAPTCHA not ready');
        return '';
      }

      return new Promise((resolve, reject) => {
        (window as any).grecaptcha.ready(async () => {
          try {
            const token = await (window as any).grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
            resolve(token);
          } catch (error) {
            console.error('reCAPTCHA execution error:', error);
            reject(error);
          }
        });
      });
    },
    [isReady, scriptError]
  );

  if (!RECAPTCHA_SITE_KEY) {
    return <>{children}</>;
  }

  if (scriptError) {
    console.warn('reCAPTCHA failed to load, continuing without bot protection');
  }

  return (
    <RecaptchaContext.Provider value={{ executeRecaptcha: isReady ? executeRecaptcha : null, isReady }}>
      {children}
    </RecaptchaContext.Provider>
  );
}

/**
 * Hook to execute reCAPTCHA verification
 */
export function useRecaptcha() {
  const { executeRecaptcha, isReady } = useContext(RecaptchaContext);

  const verify = useCallback(
    async (action: string): Promise<string | null> => {
      if (!executeRecaptcha || !isReady) {
        console.warn('reCAPTCHA not ready yet');
        return null;
      }

      try {
        const token = await executeRecaptcha(action);
        return token;
      } catch (error) {
        console.error('reCAPTCHA execution error:', error);
        return null;
      }
    },
    [executeRecaptcha, isReady]
  );

  return { verify, isReady };
}

/**
 * Common reCAPTCHA actions
 */
export const RecaptchaActions = {
  LOGIN: 'login',
  REGISTER: 'register',
  PASSWORD_RESET: 'password_reset',
  CONTACT_FORM: 'contact_form',
  COMMENT_SUBMIT: 'comment_submit',
  PROFILE_UPDATE: 'profile_update',
} as const;
