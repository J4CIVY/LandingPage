import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { getZohoMailClient } from '@/lib/zoho-mail';
import { requireAdmin } from '@/lib/auth-admin';

/**
 * GET /api/email/config/auth-url
 * Obtiene la URL de autorización de Zoho OAuth (solo para administradores)
 */
async function handleGet(request: NextRequest) {
  // Verificar autenticación de administrador
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authResult = await requireAdmin(request as any);
  if (authResult) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const redirectUri = searchParams.get('redirect_uri') || 
                       `${process.env.NEXT_PUBLIC_BASE_URL}/admin/email-config/callback`;

    const client = getZohoMailClient();
    const authUrl = client.getAuthorizationUrl(redirectUri, [
      'ZohoMail.messages.ALL',
      'ZohoMail.accounts.READ'
    ]);

    return createSuccessResponse(
      { 
        authUrl,
        redirectUri,
        scopes: ['ZohoMail.messages.CREATE', 'ZohoMail.accounts.READ', 'ZohoMail.folders.READ']
      },
      'URL de autorización generada'
    );

  } catch (error) {
    console.error('Error generating auth URL:', error);
    return createErrorResponse(
      'Error al generar URL de autorización',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/email/config/exchange-token
 * Intercambia el código de autorización por tokens de acceso
 */
async function handlePost(request: NextRequest) {
  // Verificar autenticación de administrador
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authResult = await requireAdmin(request as any);
  if (authResult) {
    return authResult;
  }

  try {
    const { code, redirectUri } = await request.json();

    if (!code) {
      return createErrorResponse(
        'Código de autorización requerido',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const client = getZohoMailClient();
    const tokens = await client.exchangeCodeForTokens(code, redirectUri);

    // En un entorno de producción, estos tokens deberían guardarse de forma segura
    // Por ejemplo, en variables de entorno o en una base de datos encriptada
    
    return createSuccessResponse(
      { 
        message: 'Tokens obtenidos exitosamente',
        tokenInfo: {
          hasAccessToken: !!tokens.access_token,
          hasRefreshToken: !!tokens.refresh_token,
          expiresIn: tokens.expires_in,
          apiDomain: tokens.api_domain,
          scope: tokens.scope
        }
      },
      'Configuración OAuth completada'
    );

  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return createErrorResponse(
      'Error al intercambiar código por tokens',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * GET /api/email/config/status
 * Obtiene el estado de configuración del sistema de correo
 */
async function handleGetStatus(request: NextRequest) {
  // Verificar autenticación de administrador
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authResult = await requireAdmin(request as any);
  if (authResult) {
    return authResult;
  }

  try {
    const client = getZohoMailClient();
    const configStatus = await client.getConfigStatus();

    // Intentar obtener las cuentas para verificar conectividad adicional
    let accountsStatus = false;
    let accountsCount = 0;
    
    if (configStatus.isFullyConfigured && configStatus.refreshTokenValid) {
      try {
        const accounts = await client.getUserAccounts();
        accountsStatus = true;
        accountsCount = accounts.length;
      } catch (error) {
        console.warn('Cannot fetch accounts, tokens might be expired:', error);
      }
    }

    return createSuccessResponse(
      {
        ...configStatus,
        emailEnabled: process.env.EMAIL_NOTIFICATION_ENABLED === 'true',
        fromEmail: process.env.ZOHO_FROM_EMAIL || null,
        adminEmail: process.env.EMAIL_ADMIN_ADDRESS || null,
        supportEmail: process.env.EMAIL_SUPPORT_ADDRESS || null,
        accountsStatus,
        accountsCount,
        lastCheck: configStatus.lastTokenCheck || new Date().toISOString()
      },
      configStatus.needsReauthorization 
        ? 'Se requiere reautorización - Refresh token expirado'
        : 'Estado de configuración obtenido'
    );

  } catch (error) {
    console.error('Error getting config status:', error);
    return createErrorResponse(
      'Error al obtener estado de configuración',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'status') {
    return handleGetStatus(request);
  } else {
    return handleGet(request);
  }
});

export const POST = withErrorHandling(handlePost);
