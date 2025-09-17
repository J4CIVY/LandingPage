import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PQRSDF from '@/lib/models/PQRSDF';
import { rateLimit } from '@/utils/rateLimit';
import { verifyAuth } from '@/lib/auth-utils';
import mongoose from 'mongoose';

// Rate limiting
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    try {
      const clientIP = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      await limiter.check(clientIP, 10); // 10 requests per minute
    } catch {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes' },
        { status: 429 }
      );
    }

    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;

    // Validar formato de ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID de solicitud no válido' },
        { status: 400 }
      );
    }

    // Buscar la solicitud
    const solicitud = await PQRSDF.findById(id).lean();

    if (!solicitud) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos: solo el dueño o admin pueden ver la solicitud
    if (authResult.user.role !== 'admin' && solicitud.usuarioId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver esta solicitud' },
        { status: 403 }
      );
    }

    // Formatear fechas para el frontend
    const solicitudFormateada = {
      ...solicitud,
      id: (solicitud._id as any).toString(),
      _id: (solicitud._id as any).toString(),
      fechaCreacion: solicitud.fechaCreacion,
      fechaActualizacion: solicitud.fechaActualizacion,
      fechaCierre: solicitud.fechaCierre || undefined,
      fechaLimiteRespuesta: solicitud.fechaLimiteRespuesta || undefined,
      mensajes: solicitud.mensajes.map((mensaje: any) => ({
        ...mensaje,
        fechaCreacion: mensaje.fechaCreacion
      })),
      timeline: solicitud.timeline.map((evento: any) => ({
        ...evento,
        fecha: evento.fecha
      }))
    };

    return NextResponse.json(solicitudFormateada);

  } catch (error) {
    console.error('Error al obtener solicitud PQRSDF:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    try {
      const clientIP = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      await limiter.check(clientIP, 5); // 5 requests per minute
    } catch {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes' },
        { status: 429 }
      );
    }

    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();

    // Validar formato de ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID de solicitud no válido' },
        { status: 400 }
      );
    }

    // Buscar la solicitud
    const solicitud = await PQRSDF.findById(id);

    if (!solicitud) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos
    const esAdmin = authResult.user.role === 'admin';
    const esPropietario = solicitud.usuarioId === authResult.user.id;

    if (!esAdmin && !esPropietario) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar esta solicitud' },
        { status: 403 }
      );
    }

    // Procesar diferentes tipos de actualizaciones
    const { accion, datos } = body;

    switch (accion) {
      case 'agregar_mensaje':
        if (!datos.contenido) {
          return NextResponse.json(
            { error: 'El contenido del mensaje es requerido' },
            { status: 400 }
          );
        }

        // Agregar mensaje directamente
        const nuevoMensaje = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          contenido: datos.contenido,
          tipo: (esAdmin ? 'admin' : 'usuario') as 'admin' | 'usuario',
          autorId: authResult.user.id,
          autorNombre: authResult.user.email || 'Usuario',
          fechaCreacion: new Date(),
          adjuntos: datos.adjuntos || []
        };

        solicitud.mensajes.push(nuevoMensaje);

        // Agregar evento al timeline
        const timelineEvento = {
          id: `tl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tipo: 'mensaje' as const,
          descripcion: `Nuevo mensaje de ${authResult.user.email || 'Usuario'}`,
          fecha: new Date(),
          autorId: authResult.user.id,
          autorNombre: authResult.user.email || 'Usuario'
        };

        solicitud.timeline.push(timelineEvento);
        break;

      case 'cambiar_estado':
        if (!esAdmin) {
          return NextResponse.json(
            { error: 'Solo los administradores pueden cambiar el estado' },
            { status: 403 }
          );
        }

        const estadosValidos = ['en_revision', 'respondida', 'cerrada', 'escalada'];
        if (!estadosValidos.includes(datos.estado)) {
          return NextResponse.json(
            { error: 'Estado no válido' },
            { status: 400 }
          );
        }

        // Cambiar estado directamente
        const estadoAnterior = solicitud.estado;
        solicitud.estado = datos.estado;

        if (datos.estado === 'cerrada') {
          solicitud.fechaCierre = new Date();
        }

        // Mapear estado a tipo de timeline
        let tipoTimeline: 'creada' | 'actualizada' | 'respondida' | 'cerrada' | 'escalada' | 'mensaje';
        switch (datos.estado) {
          case 'respondida':
          case 'cerrada':
          case 'escalada':
            tipoTimeline = datos.estado;
            break;
          default:
            tipoTimeline = 'actualizada';
        }

        // Agregar evento al timeline
        const timelineEstado = {
          id: `tl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tipo: tipoTimeline,
          descripcion: datos.descripcion || `Estado cambiado de ${estadoAnterior} a ${datos.estado}`,
          fecha: new Date(),
          autorId: authResult.user.id,
          autorNombre: authResult.user.email || 'Administrador'
        };

        solicitud.timeline.push(timelineEstado);
        break;

      case 'calificar':
        if (!esPropietario) {
          return NextResponse.json(
            { error: 'Solo el propietario puede calificar la solicitud' },
            { status: 403 }
          );
        }

        if (datos.satisfaccion < 1 || datos.satisfaccion > 5) {
          return NextResponse.json(
            { error: 'La calificación debe estar entre 1 y 5' },
            { status: 400 }
          );
        }

        solicitud.satisfaccion = datos.satisfaccion;
        solicitud.comentarioSatisfaccion = datos.comentario || undefined;

        // Agregar evento al timeline
        const timelineCalificacion = {
          id: `tl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tipo: 'actualizada' as const,
          descripcion: `Solicitud calificada con ${datos.satisfaccion} estrellas`,
          fecha: new Date(),
          autorId: authResult.user.id,
          autorNombre: authResult.user.email || 'Usuario'
        };
        solicitud.timeline.push(timelineCalificacion);
        break;

      case 'asignar':
        if (!esAdmin) {
          return NextResponse.json(
            { error: 'Solo los administradores pueden asignar solicitudes' },
            { status: 403 }
          );
        }

        solicitud.asignadoA = datos.asignadoA;

        // Agregar evento al timeline
        const timelineAsignacion = {
          id: `tl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tipo: 'actualizada' as const,
          descripcion: `Solicitud asignada a ${datos.nombreAsignado}`,
          fecha: new Date(),
          autorId: authResult.user.id,
          autorNombre: authResult.user.email || 'Administrador'
        };
        solicitud.timeline.push(timelineAsignacion);
        break;

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

    // Guardar cambios
    await solicitud.save();

    // Formatear respuesta
    const solicitudFormateada = {
      ...solicitud.toObject(),
      id: (solicitud._id as any).toString(),
      _id: (solicitud._id as any).toString()
    };

    return NextResponse.json({
      message: 'Solicitud actualizada exitosamente',
      solicitud: solicitudFormateada
    });

  } catch (error) {
    console.error('Error al actualizar solicitud PQRSDF:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}