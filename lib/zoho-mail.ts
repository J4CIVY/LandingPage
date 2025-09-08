import { ZohoAuthTokens, ZohoAccount, ZohoEmailConfig, ZohoEmailResponse } from '@/types/email';

/**
 * Cliente para la API de Zoho Mail
 * Maneja autenticación OAuth 2.0 y envío de correos electrónicos
 */
export class ZohoMailClient {
  private clientId: string;
  private clientSecret: string;
  private accountId: string;
  private accessToken: string;
  private refreshToken: string;
  private apiDomain: string;
  private baseUrl: string;

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
      console.log('🔍 Account ID no configurado, obteniendo cuentas disponibles...');
      const accounts = await this.getUserAccounts();
      if (accounts.length === 0) {
        throw new Error('No email accounts found');
      }
      this.accountId = accounts[0].accountId;
      console.log(`✅ Account ID configurado automáticamente: ${this.accountId}`);
    }

    const response = await this.makeApiRequest(
      `/accounts/${this.accountId}/messages`,
      'POST',
      emailConfig
    );

    const result: ZohoEmailResponse = await response.json();

    if (!response.ok) {
      // Si el error es por Account ID incorrecto, intentar obtener el correcto
      if (result.data?.moreInfo === 'Account not exists') {
        console.log('⚠️ Account ID incorrecto, obteniendo el Account ID válido...');
        try {
          const accounts = await this.getUserAccounts();
          if (accounts.length > 0) {
            this.accountId = accounts[0].accountId;
            console.log(`🔄 Reintentando con Account ID correcto: ${this.accountId}`);
            
            // Reintentar la petición con el Account ID correcto
            const retryResponse = await this.makeApiRequest(
              `/accounts/${this.accountId}/messages`,
              'POST',
              emailConfig
            );
            
            const retryResult: ZohoEmailResponse = await retryResponse.json();
            
            if (retryResponse.ok) {
              console.log('✅ Email enviado exitosamente después de corregir Account ID');
              return retryResult;
            } else {
              throw new Error(`Failed to send email after Account ID correction: ${retryResult.status?.description || 'Unknown error'}`);
            }
          }
        } catch (accountError) {
          console.error('❌ Error obteniendo Account ID correcto:', accountError);
        }
      }
      
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
   */
  private async makeApiRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
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

    let response = await fetch(url, config);

    // Si el token ha expirado, intentar renovarlo
    if (response.status === 401 && this.refreshToken) {
      try {
        console.log('🔄 Access token expirado, renovando automáticamente...');
        await this.refreshAccessToken();
        headers['Authorization'] = `Zoho-oauthtoken ${this.accessToken}`;
        config.headers = headers;
        response = await fetch(url, config);
        
        if (response.ok) {
          console.log('✅ Token renovado y petición exitosa');
        }
      } catch (error) {
        console.error('❌ Error renovando token:', error);
        throw new Error('Token renovation failed: ' + error);
      }
    }

    return response;
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
