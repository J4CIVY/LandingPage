import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    endpoints: {
      signup: '/api/auth/signup',
      users: '/api/auth/signup (GET para listar usuarios)'
    }
  });
}
