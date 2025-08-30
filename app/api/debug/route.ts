import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔍 Debug endpoint llamado');
  
  try {
    const body = await request.json();
    
    console.log('🔍 Datos recibidos en debug:', {
      body: body,
      keys: Object.keys(body),
      keysCount: Object.keys(body).length,
      types: Object.keys(body).reduce((acc: any, key) => {
        acc[key] = typeof body[key];
        return acc;
      }, {}),
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      status: 'success',
      message: 'Debug completado',
      received: {
        keys: Object.keys(body),
        keysCount: Object.keys(body).length,
        types: Object.keys(body).reduce((acc: any, key) => {
          acc[key] = typeof body[key];
          return acc;
        }, {}),
        data: { ...body, password: '[REDACTED]' }
      }
    });
    
  } catch (error) {
    console.error('❌ Error en debug endpoint:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Error en debug',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
