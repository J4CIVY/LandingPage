import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { GamificationService } from '@/lib/services/GamificationService';

const gamificationService = new GamificationService();

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { user } = authResult;

    // Obtener logros del usuario
    const logros = await gamificationService.obtenerLogrosUsuario(user.id);

    // Calcular estadísticas de logros
    const logrosDesbloqueados = logros.filter(l => l.desbloqueado).length;
    const totalLogros = logros.length;
    const porcentajeCompletado = Math.round((logrosDesbloqueados / totalLogros) * 100);

    // Obtener logros recientes (últimos 5 desbloqueados)
    const logrosRecientes = logros
      .filter(l => l.desbloqueado && l.fechaDesbloqueo)
      .sort((a, b) => new Date(b.fechaDesbloqueo!).getTime() - new Date(a.fechaDesbloqueo!).getTime())
      .slice(0, 5);

    // Obtener próximos logros (no desbloqueados con mayor progreso)
    const proximosLogros = logros
      .filter(l => !l.desbloqueado)
      .sort((a, b) => {
        const progresoA = (a.progreso.actual / a.progreso.total) * 100;
        const progresoB = (b.progreso.actual / b.progreso.total) * 100;
        return progresoB - progresoA;
      })
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      logros,
      estadisticas: {
        total: totalLogros,
        desbloqueados: logrosDesbloqueados,
        porcentajeCompletado,
        logrosRecientes,
        proximosLogros
      }
    });

  } catch (error) {
    console.error('Error obteniendo logros:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { user } = authResult;

    // Verificar logros del usuario
    const logrosObtenidos = await gamificationService.verificarLogros(user.id);

    return NextResponse.json({
      success: true,
      logrosObtenidos,
      mensaje: logrosObtenidos.length > 0 
        ? `¡Felicidades! Has desbloqueado ${logrosObtenidos.length} logro(s): ${logrosObtenidos.join(', ')}`
        : 'No hay nuevos logros desbloqueados'
    });

  } catch (error) {
    console.error('Error verificando logros:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}