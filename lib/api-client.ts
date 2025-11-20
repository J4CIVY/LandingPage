/**
 * API Client for NestJS Backend
 * Centralizes all API calls with authentication and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
  csrfToken?: string;
  params?: Record<string, string>;
}

/**
 * Authentication is handled via httpOnly cookies
 * No localStorage is used for security reasons
 */

/**
 * Centralized API client
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Build headers for API requests
   */
  private buildHeaders(options: RequestOptions = {}, isFormData = false): HeadersInit {
    const headers: HeadersInit = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    } as Record<string, string>;

    // Authentication is handled via httpOnly cookies sent automatically with credentials: 'include'

    // Add CSRF token if provided
    if (options.csrfToken) {
      headers['X-CSRF-Token'] = options.csrfToken;
    }

    return headers as HeadersInit;
  }

  /**
   * Handle API response
   * Authentication via httpOnly cookies - redirect on 401 for protected routes
   */
  private async handleResponse<T>(response: Response, url: string): Promise<T> {
    // Check if this is a public endpoint
    const publicEndpoints = [
      '/auth/register',
      '/auth/verify-email',
      '/auth/login',
      '/auth/forgot-password',
      '/auth/reset-password',
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint));

    // Handle 401 Unauthorized on protected endpoints - redirect to login
    // But don't redirect if we're already on login page
    if (response.status === 401 && !isPublicEndpoint) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    let data: unknown;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle errors
    if (!response.ok) {
      const error = new Error((data as Record<string, string>).message || `HTTP ${response.status}: ${response.statusText}`) as Error & { status: number; data: unknown; response?: { data?: unknown } };
      error.status = response.status;
      error.data = data;
      error.response = { data };
      throw error;
    }

    return data as T;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;
    
    // Add query parameters if provided
    if (options.params) {
      const queryString = new URLSearchParams(options.params).toString();
      url += `?${queryString}`;
    }
    
    const headers = this.buildHeaders(options);

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
      ...options,
    });

    return this.handleResponse<T>(response, url);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: Record<string, unknown> | FormData, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const isFormData = body instanceof FormData;
    const headers = this.buildHeaders(options, isFormData);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
      credentials: 'include',
      ...options,
    });

    return this.handleResponse<T>(response, url);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: Record<string, unknown> | FormData, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const isFormData = body instanceof FormData;
    const headers = this.buildHeaders(options, isFormData);

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      credentials: 'include',
      ...options,
    });

    return this.handleResponse<T>(response, url);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: Record<string, unknown> | FormData, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const isFormData = body instanceof FormData;
    const headers = this.buildHeaders(options, isFormData);

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      credentials: 'include',
      ...options,
    });

    return this.handleResponse<T>(response, url);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.buildHeaders(options);

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      credentials: 'include',
      ...options,
    });

    return this.handleResponse<T>(response, url);
  }

  /**
   * Upload file (multipart/form-data)
   * Authentication via httpOnly cookies sent automatically
   */
  async upload<T>(endpoint: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Don't set Content-Type for FormData - browser will set it with boundary
    const headers = {
      ...options.headers,
    } as Record<string, string>;

    // Authentication is handled via httpOnly cookies sent automatically with credentials: 'include'

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
      ...options,
    });

    return this.handleResponse<T>(response, url);
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export convenience methods
export default apiClient;
