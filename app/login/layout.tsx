'use client';

import { RecaptchaProvider } from '@/lib/recaptcha-client';
import { ReactNode } from 'react';

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <RecaptchaProvider>
      {children}
    </RecaptchaProvider>
  );
}
