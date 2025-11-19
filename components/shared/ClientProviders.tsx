'use client';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/lib/components/shared/ToastProvider';
import { AuthProvider } from '@/hooks/useAuth';
import { ReactNode } from 'react';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
