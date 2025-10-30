/**
 * Internal API Client
 * 
 * Provides a safe method for making internal API calls from server-side code.
 * This prevents Server-Side Request Forgery (SSRF) attacks by using a 
 * controlled base URL from environment variables instead of user-controllable
 * request headers.
 */

/**
 * Gets the safe base URL for internal API calls
 * 
 * Priority:
 * 1. NEXT_PUBLIC_BASE_URL environment variable
 * 2. Vercel URL (in production deployments)
 * 3. Localhost fallback for development
 * 
 * @returns The safe base URL without trailing slash
 */
function getInternalApiBaseUrl(): string {
  // Use explicit base URL if configured
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  }
  
  // In Vercel deployments, use VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Development fallback
  return 'http://localhost:3000';
}

/**
 * The validated base URL for internal API calls
 * This URL is controlled by the server and cannot be manipulated by users
 */
const INTERNAL_API_BASE_URL = getInternalApiBaseUrl();

/**
 * Makes a safe internal API call
 * 
 * This function prevents SSRF attacks by using a controlled base URL
 * instead of deriving it from user-controllable request data.
 * 
 * @param path - The API path (e.g., '/api/notifications/generate')
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise resolving to the fetch Response
 * 
 * @example
 * ```typescript
 * const response = await internalApiFetch('/api/notifications/admin/create', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'Cookie': `bsk-access-token=${token}`
 *   },
 *   body: JSON.stringify(data)
 * });
 * ```
 */
export async function internalApiFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Validate that the path is an internal API path
  if (!normalizedPath.startsWith('/api/')) {
    throw new Error('Internal API calls must use paths starting with /api/');
  }
  
  const url = `${INTERNAL_API_BASE_URL}${normalizedPath}`;
  
  return fetch(url, options);
}

/**
 * Gets the base URL for internal API calls
 * Use this when you need the base URL but not making a fetch call
 * 
 * @returns The safe base URL
 */
export function getInternalApiUrl(): string {
  return INTERNAL_API_BASE_URL;
}
