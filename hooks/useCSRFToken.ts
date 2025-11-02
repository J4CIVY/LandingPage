'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCSRFTokenFromCookie } from '@/lib/csrf-protection';

/**
 * Hook para gestionar tokens CSRF en componentes cliente
 * 
 * @returns {Object} Estado del token CSRF
 * @property {string | null} token - El token CSRF actual
 * @property {boolean} isLoading - Si el token está siendo cargado
 * @property {Error | null} error - Error si hubo problema obteniendo el token
 * @property {Function} refreshToken - Función para refrescar el token manualmente
 * 
 * @example
 * const { token, isLoading, error } = useCSRFToken();
 * 
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 * 
 * // Usar token en fetch
 * fetch('/api/endpoint', {
 *   headers: { 'x-csrf-token': token }
 * })
 */
export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Primero intentar obtener de la cookie
      const cookieToken = getCSRFTokenFromCookie();

      if (cookieToken) {
        setToken(cookieToken);
        setIsLoading(false);
        return;
      }

      // Si no existe en cookie, solicitarlo al servidor
      const response = await fetch('/api/csrf-token', { 
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        setError(new Error(`Error obteniendo token CSRF: ${response.status}`));
        return;
      }

      const data = await response.json();

      if (data.success && data.csrfToken) {
        setToken(data.csrfToken);
      } else {
        setError(new Error('Respuesta inválida del servidor'));
      }
    } catch (err) {
      console.error('Error en useCSRFToken:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar token al montar el componente
  useEffect(() => {
    void fetchToken();
  }, [fetchToken]);

  // Función para refrescar el token manualmente
  const refreshToken = useCallback(() => {
    return fetchToken();
  }, [fetchToken]);

  return {
    token,
    isLoading,
    error,
    refreshToken
  };
}

/**
 * Versión simplificada que solo retorna el token
 * Útil cuando no necesitas manejar estados de carga/error
 * 
 * @example
 * const csrfToken = useCSRFTokenValue();
 */
export function useCSRFTokenValue(): string | null {
  const { token } = useCSRFToken();
  return token;
}
