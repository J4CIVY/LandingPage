/**
 * useCSRFToken Hook
 * 
 * Custom React hook for managing CSRF tokens in client components.
 * Automatically fetches and caches the CSRF token for use in API requests.
 * 
 * @example
 * ```tsx
 * const csrfToken = useCSRFToken();
 * 
 * const handleSubmit = async () => {
 *   const response = await fetch('/api/endpoint', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'x-csrf-token': csrfToken || ''
 *     },
 *     body: JSON.stringify(data)
 *   });
 * };
 * ```
 */

'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Obtiene el token CSRF de las cookies del navegador
 * Versión cliente de getCSRFTokenFromCookie
 */
function getCSRFTokenFromCookie(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const CSRF_COOKIE_NAME = 'bsk-csrf-token-readable';
  
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${CSRF_COOKIE_NAME}=`)
  );
  
  if (!csrfCookie) {
    return null;
  }
  
  return csrfCookie.split('=')[1] || null;
}

interface UseCSRFTokenReturn {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage CSRF token retrieval and caching
 * 
 * @returns {UseCSRFTokenReturn} Object containing token, loading state, error, and refetch function
 */
export function useCSRFToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      // First, try to get token from cookie
      const cookieToken = getCSRFTokenFromCookie();

      if (cookieToken) {
        setToken(cookieToken);
        return;
      }

      // If not in cookie, fetch from server
      try {
        const response = await fetch('/api/csrf-token', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.csrfToken) {
            setToken(data.data.csrfToken);
          }
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };

    fetchToken();
  }, []);

  return token;
}

/**
 * Advanced hook with loading states and error handling
 * 
 * @returns {UseCSRFTokenReturn} Extended object with loading and error states
 */
export function useCSRFTokenAdvanced(): UseCSRFTokenReturn {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try cookie first
      const cookieToken = getCSRFTokenFromCookie();

      if (cookieToken) {
        setToken(cookieToken);
        setIsLoading(false);
        return;
      }

      // Fetch from server
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorMessage = `Failed to fetch CSRF token: ${response.status}`;
        setError(errorMessage);
        console.error('CSRF token fetch error:', errorMessage);
        return;
      }

      const data = await response.json();

      if (data.success && data.data?.csrfToken) {
        setToken(data.data.csrfToken);
      } else {
        setError('Invalid CSRF token response');
        console.error('CSRF token fetch error: Invalid CSRF token response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('CSRF token fetch error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchToken();
  }, [fetchToken]);

  return {
    token,
    isLoading,
    error,
    refetch: fetchToken
  };
}

/**
 * Hook for components that need to validate CSRF token availability
 * Throws error if token is not available after timeout
 * 
 * @param timeout - Timeout in milliseconds (default: 5000)
 * @throws Error if token is not available after timeout
 */
export function useRequireCSRFToken(timeout: number = 5000): string {
  const [token, setToken] = useState<string | null>(null);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, timeout);

    const fetchToken = async () => {
      const cookieToken = getCSRFTokenFromCookie();

      if (cookieToken) {
        setToken(cookieToken);
        clearTimeout(timer);
        return;
      }

      try {
        const response = await fetch('/api/csrf-token', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.csrfToken) {
            setToken(data.data.csrfToken);
            clearTimeout(timer);
          }
        }
      } catch (error) {
        console.error('Failed to fetch required CSRF token:', error);
      }
    };

    fetchToken();

    return () => clearTimeout(timer);
  }, [timeout]);

  if (timeoutReached && !token) {
    throw new Error('CSRF token is required but not available');
  }

  return token || '';
}
