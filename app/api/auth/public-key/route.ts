import { NextRequest, NextResponse } from 'next/server';
import { getPublicKey } from '@/lib/encryption-utils';

/**
 * Endpoint para obtener la llave pública RSA del servidor
 * Esta llave se usa en el cliente para encriptar credenciales
 * 
 * GET /api/auth/public-key
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener la llave pública
    const publicKey = getPublicKey();

    return NextResponse.json(
      {
        success: true,
        publicKey,
        keySize: 2048,
        algorithm: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600', // Cachear por 1 hora
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error obteniendo llave pública:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener la llave pública',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
