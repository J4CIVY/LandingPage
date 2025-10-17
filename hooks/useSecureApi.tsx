'use client';

import { useCallback } from 'react';

/**
 * Hook para hacer requests al API con protección BFF
 * 
 * Este hook automáticamente agrega los headers necesarios
 * para la autenticación BFF (API Key + JWT)
 */

// API Key del frontend (en producción debe estar en variable de entorno)
const FRONTEND_API_KEY = process.env.NEXT_PUBLIC_BFF_FRONTEND_API_KEY || '';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
  body?: any;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export function useSecureApi() {
  /**
   * Genera los headers necesarios para BFF
   */
  const generateBffHeaders = useCallback((method: string, path: string, body?: string): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': FRONTEND_API_KEY,
    };

    // Agregar JWT token si está disponible
    const authToken = localStorage.getItem('auth-token');
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Para requests que modifican datos, agregar firma
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const timestamp = Date.now();
      headers['x-api-timestamp'] = timestamp.toString();
      
      // En producción, generar firma HMAC real
      // Por ahora, el servidor validará principalmente API Key + JWT
      const signature = generateSignature(FRONTEND_API_KEY, timestamp, method, path, body);
      headers['x-api-signature'] = signature;
    }

    return headers;
  }, []);

  /**
   * Genera una firma simple (en producción usar HMAC real)
   */
  const generateSignature = (apiKey: string, timestamp: number, method: string, path: string, body?: string): string => {
    // Esta es una implementación simplificada
    // En producción, usar HMAC SHA-256
    const payload = `${apiKey}:${timestamp}:${method}:${path}:${body || ''}`;
    
    // Usar Web Crypto API para generar hash
    // Nota: Esta es una versión simplificada, idealmente usar HMAC
    return btoa(payload).substring(0, 64);
  };

  /**
   * Hace un request al API con protección BFF
   */
  const secureFetch = useCallback(async <T = any>(
    url: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const { requireAuth = true, body, ...fetchOptions } = options;
      const method = fetchOptions.method || 'GET';

      // Parsear URL para obtener path
      const urlObj = new URL(url, window.location.origin);
      const path = urlObj.pathname;

      // Preparar body
      const bodyString = body ? JSON.stringify(body) : undefined;

      // Generar headers BFF
      const bffHeaders = generateBffHeaders(method, path, bodyString);

      // Merge headers
      const finalHeaders = {
        ...bffHeaders,
        ...fetchOptions.headers,
      };

      // Hacer request
      const response = await fetch(url, {
        ...fetchOptions,
        method,
        headers: finalHeaders,
        body: bodyString,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Error en la petición',
          code: data.code,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('Error en secure fetch:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }, [generateBffHeaders]);

  /**
   * GET request seguro
   */
  const get = useCallback(<T = any>(url: string, options?: Omit<FetchOptions, 'method' | 'body'>) => {
    return secureFetch<T>(url, { ...options, method: 'GET' });
  }, [secureFetch]);

  /**
   * POST request seguro
   */
  const post = useCallback(<T = any>(url: string, body?: any, options?: Omit<FetchOptions, 'method' | 'body'>) => {
    return secureFetch<T>(url, { ...options, method: 'POST', body });
  }, [secureFetch]);

  /**
   * PUT request seguro
   */
  const put = useCallback(<T = any>(url: string, body?: any, options?: Omit<FetchOptions, 'method' | 'body'>) => {
    return secureFetch<T>(url, { ...options, method: 'PUT', body });
  }, [secureFetch]);

  /**
   * PATCH request seguro
   */
  const patch = useCallback(<T = any>(url: string, body?: any, options?: Omit<FetchOptions, 'method' | 'body'>) => {
    return secureFetch<T>(url, { ...options, method: 'PATCH', body });
  }, [secureFetch]);

  /**
   * DELETE request seguro
   */
  const del = useCallback(<T = any>(url: string, options?: Omit<FetchOptions, 'method' | 'body'>) => {
    return secureFetch<T>(url, { ...options, method: 'DELETE' });
  }, [secureFetch]);

  return {
    secureFetch,
    get,
    post,
    put,
    patch,
    delete: del,
  };
}

/**
 * Helper para verificar si el usuario está autenticado
 */
export function useAuth() {
  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('auth-token');
    return !!token;
  }, []);

  const getToken = useCallback(() => {
    return localStorage.getItem('auth-token');
  }, []);

  const setToken = useCallback((token: string) => {
    localStorage.setItem('auth-token', token);
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem('auth-token');
  }, []);

  return {
    isAuthenticated,
    getToken,
    setToken,
    clearToken,
  };
}
