/**
 * CSRF Client Utilities
 * Helper functions for client-side CSRF token handling
 */

/**
 * Gets CSRF token from cookie
 * @returns CSRF token string or null if not found
 */
export function getCSRFToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => 
    cookie.trim().startsWith('bsk-csrf-token-readable=')
  );
  
  if (!csrfCookie) {
    return null;
  }
  
  return csrfCookie.split('=')[1];
}

/**
 * Adds CSRF token to fetch headers
 * @param headers - Existing headers object (optional)
 * @returns Headers with CSRF token added
 */
export function addCSRFHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = getCSRFToken();
  
  if (!token) {
    console.warn('[CSRF] No CSRF token found in cookies. Request may fail.');
    return headers;
  }
  
  return {
    ...headers,
    'x-csrf-token': token,
  };
}

/**
 * Wrapper for fetch that automatically adds CSRF token
 * Use this for POST/PUT/PATCH/DELETE requests
 * 
 * @example
 * ```typescript
 * const response = await csrfFetch('/api/events', {
 *   method: 'POST',
 *   body: JSON.stringify(eventData)
 * });
 * ```
 */
export async function csrfFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = init?.method?.toUpperCase() || 'GET';
  
  // Only add CSRF token for state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const headers = addCSRFHeaders(init?.headers || {});
    
    return fetch(input, {
      ...init,
      headers,
    });
  }
  
  // For GET requests, just pass through
  return fetch(input, init);
}

/**
 * Hook-style function to check if CSRF token exists
 * Useful for debugging and ensuring user is properly authenticated
 */
export function hasCSRFToken(): boolean {
  return getCSRFToken() !== null;
}
