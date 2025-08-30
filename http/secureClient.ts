import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// Secure HTTP client that uses server-side proxy
class SecureHttpClient {
  private instance: AxiosInstance;
  private csrfToken: string | null = null;
  private retryAttempts = new Set<string>(); // Track retry attempts

  constructor() {
    this.instance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add CSRF token
    this.instance.interceptors.request.use(
      async (config) => {
        // Get CSRF token if not available
        if (!this.csrfToken) {
          await this.refreshCSRFToken();
        }

        if (this.csrfToken) {
          config.headers['x-csrf-token'] = this.csrfToken;
        }

        console.log('🔐 SecureClient: Token CSRF agregado:', this.csrfToken ? 'Si' : 'No');
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        console.log('❌ SecureClient Error:', error.response?.status, error.response?.statusText);
        
        // Create a unique key for this request
        const requestKey = `${error.config?.method}-${error.config?.url}`;
        
        // If CSRF token is invalid, refresh and retry ONCE
        if (error.response?.status === 403 && !this.retryAttempts.has(requestKey)) {
          console.log('🔄 Refrescando token CSRF...');
          this.retryAttempts.add(requestKey);
          
          await this.refreshCSRFToken();
          
          if (error.config && this.csrfToken) {
            error.config.headers['x-csrf-token'] = this.csrfToken;
            
            // Clean up the retry attempt after successful retry
            setTimeout(() => this.retryAttempts.delete(requestKey), 5000);
            
            return this.instance.request(error.config);
          }
        }

        // Clean up failed retry attempts
        this.retryAttempts.delete(requestKey);
        return Promise.reject(error);
      }
    );
  }

  private async refreshCSRFToken(): Promise<void> {
    try {
      const response = await fetch('/api/proxy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.csrfToken;
      }
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
    }
  }

  // Sanitize input data
  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return data
        .replace(/[<>]/g, '') // Remove potential XSS characters
        .trim()
        .substring(0, 10000); // Limit length
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value);
      }
      return sanitized;
    }
    
    return data;
  }

  async get(endpoint: string, config?: AxiosRequestConfig) {
    const url = `/api/proxy?endpoint=${encodeURIComponent(endpoint)}`;
    return this.instance.get(url, config);
  }

  async post(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    const url = `/api/proxy?endpoint=${encodeURIComponent(endpoint)}`;
    const sanitizedData = this.sanitizeData(data);
    return this.instance.post(url, sanitizedData, config);
  }

  async put(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    const url = `/api/proxy?endpoint=${encodeURIComponent(endpoint)}`;
    const sanitizedData = this.sanitizeData(data);
    return this.instance.put(url, sanitizedData, config);
  }

  async delete(endpoint: string, config?: AxiosRequestConfig) {
    const url = `/api/proxy?endpoint=${encodeURIComponent(endpoint)}`;
    return this.instance.delete(url, config);
  }
}

// Export singleton instance
export const secureHttp = new SecureHttpClient();
export default secureHttp;
