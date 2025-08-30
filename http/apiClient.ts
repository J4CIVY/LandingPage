import axios, { AxiosInstance } from 'axios';

// Simple HTTP client for internal API
class InternalApiClient {
  private instance: AxiosInstance;

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
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        console.log('📤 Enviando petición a:', config.url);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        console.log('📥 Respuesta recibida:', response.status);
        return response;
      },
      (error) => {
        console.error('❌ Error en petición:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  async get(endpoint: string, config?: any) {
    return this.instance.get(`/api${endpoint}`, config);
  }

  async post(endpoint: string, data?: any, config?: any) {
    return this.instance.post(`/api${endpoint}`, data, config);
  }

  async put(endpoint: string, data?: any, config?: any) {
    return this.instance.put(`/api${endpoint}`, data, config);
  }

  async delete(endpoint: string, config?: any) {
    return this.instance.delete(`/api${endpoint}`, config);
  }
}

// Export singleton instance
export const apiClient = new InternalApiClient();
export default apiClient;
