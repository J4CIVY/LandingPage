import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook endpoint para recibir confirmaciones de MessageBird
 * Este endpoint es llamado por MessageBird cuando el mensaje es entregado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Aquí puedes agregar lógica adicional como:
    // - Actualizar el estado del código 2FA en la base de datos
    // - Registrar métricas de entrega
    // - Manejar errores de entrega
    
    return NextResponse.json(
      {
        success: true,
        message: 'Webhook procesado exitosamente'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error procesando webhook de MessageBird:', error);
    
    // Devolver 200 de todos modos para que MessageBird no reintente
    return NextResponse.json(
      {
        success: false,
        message: 'Error al procesar webhook'
      },
      { status: 200 }
    );
  }
}

/**
 * GET endpoint para verificación del webhook
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'Webhook endpoint activo',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
