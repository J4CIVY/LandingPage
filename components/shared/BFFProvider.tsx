'use client';

import { useEffect } from 'react';
import { installFetchInterceptor } from '@/lib/fetch-interceptor';

/**
 * Provider BFF - Instala el interceptor de fetch global
 * 
 * Este provider debe envolver toda la aplicación en el layout raíz
 * para que TODAS las llamadas fetch incluyan automáticamente:
 * - API Key
 * - JWT Token
 * - CSRF Token
 */
export function BFFProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Instalar interceptor cuando el componente se monta
    installFetchInterceptor();

    // Verificar que la API Key esté configurada
    const apiKey = process.env.NEXT_PUBLIC_BFF_FRONTEND_API_KEY;
    
    if (!apiKey) {
      console.error(
        '❌ [BFF Provider] NEXT_PUBLIC_BFF_FRONTEND_API_KEY no está configurada!'
      );
      console.error(
        '   Todas las llamadas a la API fallarán hasta que configures esta variable.'
      );
      console.error(
        '   Ver: docs/BFF_IMPLEMENTATION.md para instrucciones'
      );
    } else {
      console.log('✅ [BFF Provider] Sistema BFF inicializado correctamente');
    }
  }, []);

  return <>{children}</>;
}
