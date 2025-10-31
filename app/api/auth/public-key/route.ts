import { NextResponse } from 'next/server';
import { getPublicKey } from '@/lib/encryption-utils';

/**
 * Endpoint para obtener la llave pública RSA del servidor
 * Esta llave se usa en el cliente para encriptar credenciales
 * 
 * GET /api/auth/public-key
 */
export async function GET() {
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
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
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
