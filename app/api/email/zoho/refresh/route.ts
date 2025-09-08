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
 * POST /api/email/zoho/refresh
 * Renueva manualmente los tokens de Zoho Mail
 * Requiere autenticación de administrador
 */
async function handlePost(request: NextRequest) {
  // Verificar autenticación de administrador
  const authResult = await requireAdmin(request as any);
  if (authResult) {
    return authResult;
  }

  try {
    console.log('🔄 Iniciando renovación manual de tokens de Zoho...');
    
    const client = getZohoMailClient();
    
    // Intentar renovar el token
    const newTokens = await client.refreshAccessToken();
    
    console.log('✅ Tokens renovados exitosamente');
    
    return createSuccessResponse(
      {
        message: 'Tokens renovados exitosamente',
        newAccessToken: newTokens.access_token.substring(0, 20) + '...',
        expiresIn: newTokens.expires_in,
        timestamp: new Date().toISOString()
      },
      'Tokens de Zoho renovados correctamente'
    );

  } catch (error) {
    console.error('💥 Error renovando tokens de Zoho:', error);
    
    let errorMessage = 'Error renovando tokens de Zoho';
    
    if (error instanceof Error) {
      if (error.message.includes('REFRESH_TOKEN_EXPIRED')) {
        errorMessage = 'El refresh token ha expirado. Se requiere reautorización completa.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return createErrorResponse(
      errorMessage,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export const POST = withErrorHandling(handlePost);
