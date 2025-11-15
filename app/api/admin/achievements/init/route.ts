import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';
import { GamificationService } from '@/lib/services/GamificationService';

const gamificationService = new GamificationService();


export async function POST(request: NextRequest) {
  // SECURITY: CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;
  
  try {
    // Verificar autenticación y permisos de admin
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { user } = authResult;

    // Verificar que sea admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden inicializar logros.' },
        { status: 403 }
      );
    }

    // Inicializar logros del sistema
    await gamificationService.inicializarLogros();

    return NextResponse.json({
      success: true,
      mensaje: 'Logros del sistema inicializados correctamente'
    });

  } catch (error) {
    console.error('Error inicializando logros:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}