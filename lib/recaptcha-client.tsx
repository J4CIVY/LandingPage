/**
 * Google reCAPTCHA v3 Integration
 * Provides invisible bot protection for forms
 * reCAPTCHA v3 returns a score (0.0-1.0) instead of challenge
 */

'use client';

import { useCallback } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

/**
 * reCAPTCHA Provider Component
 * Wrap your app or specific pages with this
 */
export function RecaptchaProvider({ children }: { children: React.ReactNode }) {
  if (!RECAPTCHA_SITE_KEY) {
    console.warn('reCAPTCHA site key not configured. Bot protection disabled.');
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      language="es"
      useRecaptchaNet={false}
      useEnterprise={false}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}

/**
 * Hook to execute reCAPTCHA verification
 */
export function useRecaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const verify = useCallback(
    async (action: string): Promise<string | null> => {
      if (!executeRecaptcha) {
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
    [executeRecaptcha]
  );

  return { verify };
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
