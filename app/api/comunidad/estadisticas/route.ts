import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Publicacion, ChatMensaje, GrupoInteres } from '@/lib/models/Comunidad';
import User from '@/lib/models/User';
import { verifySession } from '@/lib/auth-utils';

// GET - Obtener estadísticas de la comunidad
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session.success || !session.user) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener fecha de hoy
    const hoy = new Date();
    const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const finDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);

    // Obtener estadísticas en paralelo
    const [
      publicacionesHoy,
      mensajesHoy,
      miembrosActivos,
      gruposActivos,
      totalPublicaciones,
      totalMensajes
    ] = await Promise.all([
      // Publicaciones creadas hoy
      Publicacion.countDocuments({
        fechaCreacion: {
          $gte: inicioDelDia,
          $lt: finDelDia
        },
        activa: true
      }),
      
      // Mensajes enviados hoy
      ChatMensaje.countDocuments({
        fechaEnvio: {
          $gte: inicioDelDia,
          $lt: finDelDia
        },
        activo: true
      }),
      
      // Usuarios activos (con actividad en los últimos 7 días)
      User.countDocuments({
        lastActivity: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        isActive: true
      }),
      
      // Grupos activos
      GrupoInteres.countDocuments({
        activo: true
      }),
      
      // Total de publicaciones
      Publicacion.countDocuments({
        activa: true
      }),
      
      // Total de mensajes
      ChatMensaje.countDocuments({
        activo: true
      })
    ]);

    // Obtener usuarios registrados hoy
    const usuariosHoy = await User.countDocuments({
      createdAt: {
        $gte: inicioDelDia,
        $lt: finDelDia
      }
    });

    // Calcular estadísticas adicionales
    const estadisticas = {
      hoy: {
        publicaciones: publicacionesHoy,
        mensajes: mensajesHoy,
        usuarios: usuariosHoy
      },
      general: {
        miembrosActivos: miembrosActivos,
        gruposActivos: gruposActivos,
        totalPublicaciones: totalPublicaciones,
        totalMensajes: totalMensajes
      },
      tendencias: {
        // Calcular tendencias comparando con ayer
        publicacionesAyer: await Publicacion.countDocuments({
          fechaCreacion: {
            $gte: new Date(inicioDelDia.getTime() - 24 * 60 * 60 * 1000),
            $lt: inicioDelDia
          },
          activa: true
        }),
        mensajesAyer: await ChatMensaje.countDocuments({
          fechaEnvio: {
            $gte: new Date(inicioDelDia.getTime() - 24 * 60 * 60 * 1000),
            $lt: inicioDelDia
          },
          activo: true
        })
      }
    };

    // Calcular porcentajes de cambio
    const cambioPublicaciones = estadisticas.tendencias.publicacionesAyer > 0 
      ? ((publicacionesHoy - estadisticas.tendencias.publicacionesAyer) / estadisticas.tendencias.publicacionesAyer * 100)
      : publicacionesHoy > 0 ? 100 : 0;

    const cambioMensajes = estadisticas.tendencias.mensajesAyer > 0 
      ? ((mensajesHoy - estadisticas.tendencias.mensajesAyer) / estadisticas.tendencias.mensajesAyer * 100)
      : mensajesHoy > 0 ? 100 : 0;

    return NextResponse.json({
      exito: true,
      datos: {
        ...estadisticas,
        cambios: {
          publicaciones: Math.round(cambioPublicaciones),
          mensajes: Math.round(cambioMensajes)
        }
      },
      mensaje: 'Estadísticas obtenidas exitosamente'
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}