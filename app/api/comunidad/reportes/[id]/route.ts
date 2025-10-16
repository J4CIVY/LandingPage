import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ReporteContenido, Publicacion, Comentario, ChatMensaje } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';
import { Types } from 'mongoose';
import { requireCSRFToken } from '@/lib/csrf-protection';

type Params = Promise<{
  id: string;
}>;

// PUT - Resolver reporte (solo moderadores/admins)
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session.success || !session.user) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar permisos de moderador/admin
    if (!['admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.json(
        { exito: false, error: 'Sin permisos para resolver reportes' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { accion, razon } = await request.json();
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { exito: false, error: 'ID de reporte inválido' },
        { status: 400 }
      );
    }

    if (!['aprobar', 'rechazar', 'eliminar_contenido'].includes(accion)) {
      return NextResponse.json(
        { exito: false, error: 'Acción no válida' },
        { status: 400 }
      );
    }

    const reporte = await ReporteContenido.findById(id);
    if (!reporte) {
      return NextResponse.json(
        { exito: false, error: 'Reporte no encontrado' },
        { status: 404 }
      );
    }

    if (reporte.estado !== 'pendiente') {
      return NextResponse.json(
        { exito: false, error: 'Este reporte ya ha sido resuelto' },
        { status: 400 }
      );
    }

    // Ejecutar acción según el tipo
    if (accion === 'eliminar_contenido') {
      // Eliminar el contenido reportado
      const eliminado = await eliminarContenido(
        reporte.tipoContenido, 
        reporte.contenidoId.toString()
      );

      if (!eliminado) {
        return NextResponse.json(
          { exito: false, error: 'No se pudo eliminar el contenido' },
          { status: 500 }
        );
      }

      reporte.estado = 'resuelto';
      reporte.accionTomada = 'contenido_eliminado';
    } else if (accion === 'aprobar') {
      reporte.estado = 'resuelto';
      reporte.accionTomada = 'reporte_valido';
    } else if (accion === 'rechazar') {
      reporte.estado = 'rechazado';
      reporte.accionTomada = 'reporte_invalido';
    }

    // Actualizar reporte
    reporte.moderadorId = session.user.id;
    reporte.fechaResolucion = new Date();
    if (razon?.trim()) {
      reporte.descripcion += `\n\nResolución del moderador: ${razon.trim()}`;
    }

    await reporte.save();

    return NextResponse.json({
      exito: true,
      mensaje: `Reporte ${accion === 'aprobar' ? 'aprobado' : accion === 'rechazar' ? 'rechazado' : 'resuelto con eliminación de contenido'} exitosamente`
    });

  } catch (error) {
    console.error('Error al resolver reporte:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función auxiliar para eliminar contenido según tipo
async function eliminarContenido(tipo: string, contenidoId: string): Promise<boolean> {
  try {
    switch (tipo) {
      case 'publicacion':
        const publicacion = await Publicacion.findById(contenidoId);
        if (publicacion) {
          publicacion.activo = false;
          await publicacion.save();
          return true;
        }
        break;

      case 'comentario':
        const comentario = await Comentario.findById(contenidoId);
        if (comentario) {
          comentario.activo = false;
          await comentario.save();
          return true;
        }
        break;

      case 'mensaje':
        const mensaje = await ChatMensaje.findById(contenidoId);
        if (mensaje) {
          mensaje.activo = false;
          await mensaje.save();
          return true;
        }
        break;

      default:
        return false;
    }
    return false;
  } catch (error) {
    console.error('Error al eliminar contenido:', error);
    return false;
  }
}