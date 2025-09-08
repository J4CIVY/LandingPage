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
 * GET /api/email/zoho/status
 * Verifica el estado de la configuración de Zoho Mail
 * Requiere autenticación de administrador
 */
async function handleGet(request: NextRequest) {
  // Verificar autenticación de administrador
  const authResult = await requireAdmin(request as any);
  if (authResult) {
    return authResult;
  }

  try {
    console.log('🔍 Verificando estado de configuración de Zoho Mail...');
    
    const client = getZohoMailClient();
    const status = await client.getConfigStatus();
    
    console.log('📊 Estado obtenido:', status);
    
    return createSuccessResponse(
      {
        ...status,
        timestamp: new Date().toISOString(),
        environment: {
          hasClientId: !!process.env.ZOHO_CLIENT_ID,
          hasClientSecret: !!process.env.ZOHO_CLIENT_SECRET,
          hasAccessToken: !!process.env.ZOHO_ACCESS_TOKEN,
          hasRefreshToken: !!process.env.ZOHO_REFRESH_TOKEN,
          hasAccountId: !!process.env.ZOHO_ACCOUNT_ID,
          hasFromEmail: !!process.env.ZOHO_FROM_EMAIL,
        }
      },
      'Estado de configuración de Zoho obtenido exitosamente'
    );

  } catch (error) {
    console.error('💥 Error verificando estado de Zoho:', error);
    
    return createErrorResponse(
      error instanceof Error ? error.message : 'Error verificando configuración de Zoho',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export const GET = withErrorHandling(handleGet);
