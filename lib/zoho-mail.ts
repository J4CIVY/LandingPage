/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZohoAuthTokens, ZohoAccount, ZohoEmailConfig, ZohoEmailResponse } from '@/types/email';

/**
 * Cliente para la API de Zoho Mail
 * Maneja autenticación OAuth 2.0 y envío de correos electrónicos
 * 
 * SECURITY FEATURES:
 * - SSRF Protection: Todas las URLs son validadas contra una allowlist de dominios Zoho
 * - Path Traversal Prevention: Los endpoints son sanitizados para prevenir ataques de traversal
 * - HTTPS Enforcement: Solo se permiten conexiones HTTPS
 * - Input Validation: Caracteres peligrosos y patrones maliciosos son rechazados
 * 
 * @see validateZohoUrl - Validación de dominios contra allowlist
 * @see sanitizeEndpoint - Sanitización de endpoints contra path traversal
 * @see buildAndValidateUrl - Construcción segura de URLs
 */
export class ZohoMailClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private accountId: string;
  private accessToken: string;
  private refreshToken: string;
  private readonly apiDomain: string;
  private readonly baseUrl: string;

  // Allowlist de dominios Zoho permitidos para prevenir SSRF
  private readonly ALLOWED_ZOHO_DOMAINS = [
    'mail.zoho.com',
    'mail.zoho.eu',
    'mail.zoho.in',
    'mail.zoho.com.au',
    'mail.zoho.com.cn',
    'mail.zoho.jp',
    'accounts.zoho.com',
    'accounts.zoho.eu',
    'accounts.zoho.in',
    'accounts.zoho.com.au',
    'accounts.zoho.com.cn',
    'accounts.zoho.jp',
    'www.zohoapis.com',
    'www.zohoapis.eu',
    'www.zohoapis.in',
    'www.zohoapis.com.au',
    'www.zohoapis.com.cn',
    'www.zohoapis.jp'
  ];

  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID || '';
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET || '';
    this.accountId = process.env.ZOHO_ACCOUNT_ID || '';
    this.accessToken = process.env.ZOHO_ACCESS_TOKEN || '';
    this.refreshToken = process.env.ZOHO_REFRESH_TOKEN || '';
    this.apiDomain = process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com';
    this.baseUrl = process.env.ZOHO_MAIL_API_URL || 'https://mail.zoho.com/api';

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Zoho client credentials not configured');
    }

    // Validar que las URLs base sean seguras
    this.validateZohoUrl(this.apiDomain);
    this.validateZohoUrl(this.baseUrl);
  }

  /**
   * Valida que una URL sea segura y pertenezca a dominios Zoho permitidos
   * Previene ataques SSRF
   */
  private validateZohoUrl(urlString: string): void {
    try {
      const url = new URL(urlString);

      // 1. Verificar que use HTTPS
      if (url.protocol !== 'https:') {
        throw new Error('Only HTTPS URLs are allowed for Zoho API');
      }

      // 2. Verificar que el hostname esté en la allowlist
      if (!this.ALLOWED_ZOHO_DOMAINS.includes(url.hostname)) {
        throw new Error(`Domain ${url.hostname} is not in the allowed Zoho domains list`);
      }

      // 3. Prevenir credenciales en la URL
      if (url.username || url.password) {
        throw new Error('URLs with embedded credentials are not allowed');
      }
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(`Invalid URL format: ${urlString}`);
      }
      throw error;
    }
  }

  /**
   * Sanitiza y valida el endpoint para prevenir path traversal y SSRF
   */
  private sanitizeEndpoint(endpoint: string): string {
    // Eliminar espacios en blanco
    endpoint = endpoint.trim();

    // 1. Prevenir path traversal
    if (endpoint.includes('..') || endpoint.includes('//') || endpoint.includes('\\')) {
      throw new Error('Invalid endpoint: path traversal detected');
    }

    // 2. Asegurar que empiece con /
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }

    // 3. Prevenir caracteres peligrosos
    const dangerousChars = ['<', '>', '"', "'", '`', '{', '}', '|', '^'];
    for (const char of dangerousChars) {
      if (endpoint.includes(char)) {
        throw new Error(`Invalid endpoint: dangerous character '${char}' detected`);
      }
    }

    // 4. Validar que solo contenga caracteres seguros para URLs
    const safeEndpointRegex = /^\/[a-zA-Z0-9/_\-.]*$/;
    if (!safeEndpointRegex.test(endpoint)) {
      throw new Error('Invalid endpoint: contains unsafe characters');
    }

    return endpoint;
  }

  /**
   * Obtiene la URL de autorización para OAuth 2.0
   */
  getAuthorizationUrl(redirectUri: string, scopes: string[] = ['ZohoMail.messages.CREATE', 'ZohoMail.accounts.READ', 'ZohoMail.folders.READ']): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes.join(','),
      access_type: 'offline'
    });

    return `https://accounts.zoho.com/oauth/v2/auth?${params.toString()}`;
  }

  /**
   * Intercambia el código de autorización por tokens de acceso
   */
  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<ZohoAuthTokens> {
    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
        scope: 'ZohoMail.messages.CREATE,ZohoMail.accounts.READ,ZohoMail.folders.READ'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for tokens: ${error}`);
    }

    const tokens: ZohoAuthTokens = await response.json();
    this.accessToken = tokens.access_token;
    if (tokens.refresh_token) {
      this.refreshToken = tokens.refresh_token;
    }

    return tokens;
  }

  /**
   * Renueva el token de acceso usando el refresh token
   */
  async refreshAccessToken(): Promise<ZohoAuthTokens> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      
      // Detectar si el refresh token ha expirado
      if (response.status === 401 || error.includes('invalid_grant') || error.includes('invalid_token')) {
        throw new Error('REFRESH_TOKEN_EXPIRED: El refresh token ha expirado. Necesitas reautorizar la aplicación.');
      }
      
      throw new Error(`Failed to refresh access token: ${error}`);
    }

    const tokens: ZohoAuthTokens = await response.json();
    this.accessToken = tokens.access_token;

    return tokens;
  }

  /**
   * Obtiene todas las cuentas del usuario autenticado
   */
  async getUserAccounts(): Promise<ZohoAccount[]> {
    const response = await this.makeApiRequest('/accounts', 'GET');
    
    if (!response.ok) {
      throw new Error('Failed to fetch user accounts');
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Envía un correo electrónico
   */
  async sendEmail(emailConfig: ZohoEmailConfig): Promise<ZohoEmailResponse> {
    if (!this.accountId) {
      const accounts = await this.getUserAccounts();
      if (accounts.length === 0) {
        throw new Error('No email accounts found');
      }
      this.accountId = accounts[0].accountId;
    }

    const response = await this.makeApiRequest(
      `/accounts/${this.accountId}/messages`,
      'POST',
      emailConfig
    );

    const result: ZohoEmailResponse = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to send email: ${result.status?.description || 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Envía un correo electrónico programado
   */
  async sendScheduledEmail(emailConfig: ZohoEmailConfig & {
    isSchedule: boolean;
    scheduleType?: number;
    timeZone?: string;
    scheduleTime?: string;
  }): Promise<ZohoEmailResponse> {
    return this.sendEmail(emailConfig);
  }

  /**
   * Realiza una petición a la API de Zoho Mail
   * Incluye protección contra SSRF mediante validación de URLs
   * 
   * SECURITY: Este método implementa múltiples capas de protección contra SSRF:
   * 1. sanitizeEndpoint() previene path traversal y caracteres peligrosos
   * 2. buildAndValidateUrl() valida la URL contra allowlist de dominios Zoho
   * 3. Solo se permite HTTPS a dominios Zoho autorizados
   * 
   * @param endpoint - Ruta del endpoint de la API (será sanitizado)
   * @param method - Método HTTP
   * @param body - Cuerpo de la petición (opcional)
   * @returns Respuesta de la API
   */
  private async makeApiRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<Response> {
    // SECURITY: Sanitizar el endpoint para prevenir SSRF y path traversal
    const safeEndpoint = this.sanitizeEndpoint(endpoint);
    
    // SECURITY: Construir y validar la URL completa antes de cualquier uso
    // La URL solo puede apuntar a dominios Zoho en la allowlist
    const url = this.buildAndValidateUrl(safeEndpoint);
    
    const headers: Record<string, string> = {
      'Authorization': `Zoho-oauthtoken ${this.accessToken}`,
      'Accept': 'application/json',
    };

    if (method !== 'GET' && body) {
      headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (method !== 'GET' && body) {
      config.body = JSON.stringify(body);
    }

    // SECURITY: La URL ha sido validada por buildAndValidateUrl()
    // Solo puede apuntar a dominios Zoho autorizados con HTTPS
    let response = await fetch(url, config);

    // Si el token ha expirado, intentar renovarlo
    if (response.status === 401 && this.refreshToken) {
      try {
        await this.refreshAccessToken();
        headers['Authorization'] = `Zoho-oauthtoken ${this.accessToken}`;
        config.headers = headers;
        // SECURITY: Reconstruir y revalidar la URL antes de reintentar
        const retryUrl = this.buildAndValidateUrl(safeEndpoint);
        response = await fetch(retryUrl, config);
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    }

    return response;
  }

  /**
   * Construye y valida una URL completa de forma segura
   * Este método garantiza que la URL final es segura antes de ser usada
   * 
   * SECURITY: Esta función actúa como barrera de sanitización para prevenir SSRF.
   * La URL construida es validada contra una allowlist de dominios Zoho permitidos,
   * asegurando que solo se pueden hacer peticiones a endpoints legítimos de Zoho.
   * 
   * @param safeEndpoint - Endpoint ya sanitizado por sanitizeEndpoint()
   * @returns URL validada y segura para usar en fetch()
   * @throws Error si la URL no pasa la validación de seguridad
   */
  private buildAndValidateUrl(safeEndpoint: string): string {
    // Construir la URL completa
    const url = `${this.baseUrl}${safeEndpoint}`;
    
    // SECURITY: Validación crítica contra SSRF
    // Esta validación garantiza que:
    // 1. La URL usa HTTPS
    // 2. El dominio está en la allowlist de dominios Zoho
    // 3. No hay credenciales embebidas en la URL
    this.validateZohoUrl(url);
    
    // La URL ha sido validada y es segura para usar
    return url;
  }

  /**
   * Valida la configuración del cliente
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.accessToken);
  }

  /**
   * Obtiene el estado de configuración
   */
  async getConfigStatus(): Promise<{
    hasClientCredentials: boolean;
    hasTokens: boolean;
    hasAccountId: boolean;
    isFullyConfigured: boolean;
    refreshTokenValid: boolean;
    needsReauthorization: boolean;
    lastTokenCheck?: string;
  }> {
    const status = {
      hasClientCredentials: !!(this.clientId && this.clientSecret),
      hasTokens: !!(this.accessToken && this.refreshToken),
      hasAccountId: !!this.accountId,
      isFullyConfigured: false,
      refreshTokenValid: false,
      needsReauthorization: false,
      lastTokenCheck: new Date().toISOString(),
    };

    status.isFullyConfigured = status.hasClientCredentials && status.hasTokens && status.hasAccountId;

    // Verificar validez del refresh token solo si tenemos tokens
    if (status.hasTokens) {
      try {
        // Intentar hacer una llamada simple para verificar el token
        const response = await this.makeApiRequest('/accounts', 'GET');
        status.refreshTokenValid = response.ok;
        status.needsReauthorization = !response.ok;
      } catch (error) {
        status.refreshTokenValid = false;
        status.needsReauthorization = true;
        
        // Si el error indica que el refresh token expiró
        if (error instanceof Error && error.message.includes('REFRESH_TOKEN_EXPIRED')) {
          status.needsReauthorization = true;
        }
      }
    } else {
      status.needsReauthorization = true;
    }

    return status;
  }
}

// Instancia singleton del cliente
let zohoClient: ZohoMailClient | null = null;

export function getZohoMailClient(): ZohoMailClient {
  if (!zohoClient) {
    zohoClient = new ZohoMailClient();
  }
  return zohoClient;
}
