import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminRequest } from '@/lib/auth-admin';
import { requireCSRFToken } from '@/lib/csrf-protection';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { GamificationService } from '@/lib/services/GamificationService';

// POST /api/admin/gamification/assign-points - Asignar puntos manualmente a un usuario
export async function POST(req: NextRequest) {
  const adminRequest = req as AdminRequest;
  
  // SECURITY: CSRF Protection
  const csrfError = requireCSRFToken(adminRequest);
  if (csrfError) return csrfError;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();

    const body = await req.json();
    const { usuarioEmail, puntos, descripcion } = body;

    // Validar datos de entrada
    if (!usuarioEmail || !puntos || !descripcion) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan campos requeridos: usuarioEmail, puntos, descripcion' 
        },
        { status: 400 }
      );
    }

    if (typeof puntos !== 'number' || puntos <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Los puntos deben ser un número positivo' 
        },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const usuario = await User.findOne({ email: usuarioEmail });
    
    if (!usuario) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Usuario con email ${usuarioEmail} no encontrado` 
        },
        { status: 404 }
      );
    }

    // Otorgar puntos usando el servicio de gamificación
    const transaccion = await GamificationService.otorgarPuntos(
      usuario._id.toString(),
      'bonificacion_admin', // Tipo especial para bonificaciones de admin
      {
        razonPersonalizada: descripcion,
        adminId: adminRequest.user?.id,
        cantidad: puntos
      }
    );

    // Obtener estadísticas actualizadas del usuario
    const estadisticasActualizadas = await GamificationService.obtenerEstadisticasUsuario(
      usuario._id.toString()
    );

    return NextResponse.json({
      success: true,
      message: `Se asignaron ${puntos} puntos a ${usuario.firstName} ${usuario.lastName}`,
      data: {
        transaccion: {
          id: transaccion._id,
          cantidad: transaccion.cantidad,
          razon: transaccion.razon,
          fecha: transaccion.fechaTransaccion
        },
        usuario: {
          id: usuario._id,
          nombre: `${usuario.firstName} ${usuario.lastName}`,
          email: usuario.email,
          puntosActuales: estadisticasActualizadas.estadisticas?.puntos?.total || 0,
          nivelActual: estadisticasActualizadas.nivelInfo?.actual || 'Novato'
        }
      }
    });

  } catch (error) {
    console.error('Error asignando puntos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
