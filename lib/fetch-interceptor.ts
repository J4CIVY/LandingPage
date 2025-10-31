/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * Interceptor Global de Fetch para BFF
 * 
 * Este archivo intercepta TODAS las llamadas fetch() del cliente
 * y automáticamente agrega los headers necesarios para BFF:
 * - API Key
 * - CSRF Token (si existe)
 * 
 * IMPORTANTE: Este archivo debe importarse una sola vez en el layout raíz
 */

// API Key del frontend
const FRONTEND_API_KEY = process.env.NEXT_PUBLIC_BFF_FRONTEND_API_KEY || '';

let isInterceptorInstalled = false;

/**
 * Instala el interceptor de fetch global
 */
export function installFetchInterceptor() {
  // Evitar instalar múltiples veces
  if (isInterceptorInstalled) {
    console.log('[BFF Interceptor] Ya instalado');
    return;
  }

  // Guardar el fetch original
  const originalFetch = window.fetch;

  // Reemplazar fetch con versión interceptada
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Determinar si es una llamada a nuestra API
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const isApiCall = url.includes('/api/');

    // Si no es llamada a API, usar fetch original
    if (!isApiCall) {
      return originalFetch(input, init);
    }

    // Preparar headers modificados
    const headers = new Headers(init?.headers || {});

    // Agregar API Key si aún no existe
    if (!headers.has('x-api-key') && FRONTEND_API_KEY) {
      headers.set('x-api-key', FRONTEND_API_KEY);
    }

    // Agregar CSRF token si existe en cookies
    const csrfToken = getCookie('bsk-csrf-token') || getCookie('csrf-token');
    if (csrfToken && !headers.has('x-csrf-token')) {
      headers.set('x-csrf-token', csrfToken);
    }

    // Agregar Authorization header si hay token en localStorage o cookie
    if (!headers.has('authorization')) {
      const token = localStorage.getItem('auth-token') || 
                    getCookie('bsk-access-token') ||
                    getCookie('auth-token');
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Logging para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('[BFF Interceptor] Request interceptada:', {
        url,
        hasApiKey: headers.has('x-api-key'),
        hasAuth: headers.has('authorization'),
        hasCsrf: headers.has('x-csrf-token'),
      });
    }

    // Llamar al fetch original con headers modificados
    try {
      const response = await originalFetch(input, {
        ...init,
        headers,
      });

      // Si es 401 por API Key inválida, mostrar mensaje claro
      if (response.status === 401) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          if (data.code === 'INVALID_API_KEY') {
            console.error('[BFF Security] API Key inválida o faltante');
            console.error('[BFF Security] Verifica que NEXT_PUBLIC_BFF_FRONTEND_API_KEY esté configurada');
          }
        } catch (e) {
          // No es JSON, ignorar
        }
      }

      return response;
    } catch (error) {
      console.error('[BFF Interceptor] Error en fetch:', error);
      throw error;
    }
  };

  isInterceptorInstalled = true;
  console.log('[BFF Interceptor] ✅ Instalado correctamente');
}

/**
 * Helper para obtener cookies
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
}

/**
 * Desinstala el interceptor (útil para testing)
 */
export function uninstallFetchInterceptor() {
  // Nota: Esto requeriría guardar una referencia al fetch original
  // Por ahora, simplemente marcamos como no instalado
  isInterceptorInstalled = false;
  console.log('[BFF Interceptor] ⚠️ Desinstalado');
}

/**
 * Verifica si el interceptor está instalado
 */
export function isInterceptorActive(): boolean {
  return isInterceptorInstalled;
}

/**
 * Hook de React para instalar el interceptor automáticamente
 */
export function useFetchInterceptor() {
  if (typeof window !== 'undefined') {
    installFetchInterceptor();
  }
}
