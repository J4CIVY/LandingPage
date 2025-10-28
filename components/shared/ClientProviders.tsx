'use client';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/components/shared/ToastProvider';
import { AuthProvider } from '@/hooks/useAuth';
import { RecaptchaProvider } from '@/lib/recaptcha-client';
import { ReactNode } from 'react';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RecaptchaProvider>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </RecaptchaProvider>
    </ThemeProvider>
  );
}
