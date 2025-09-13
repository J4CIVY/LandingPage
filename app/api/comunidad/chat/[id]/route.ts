import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ChatMensaje } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';
import { Types } from 'mongoose';

type Params = Promise<{
  id: string;
}>;

// PUT - Editar mensaje
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session.success) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { contenido } = await request.json();
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { exito: false, error: 'ID de mensaje inválido' },
        { status: 400 }
      );
    }

    if (!contenido?.trim()) {
      return NextResponse.json(
        { exito: false, error: 'El contenido es obligatorio' },
        { status: 400 }
      );
    }

    if (contenido.trim().length > 1000) {
      return NextResponse.json(
        { exito: false, error: 'El mensaje no puede exceder 1000 caracteres' },
        { status: 400 }
      );
    }

    const mensaje = await ChatMensaje.findById(id);
    if (!mensaje || !mensaje.activo) {
      return NextResponse.json(
        { exito: false, error: 'Mensaje no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos (solo el autor o administrador)
    if (mensaje.autorId.toString() !== session.user?.id && 
        session.user?.role !== 'admin') {
      return NextResponse.json(
        { exito: false, error: 'Sin permisos para editar este mensaje' },
        { status: 403 }
      );
    }

    // Verificar límite de tiempo para edición (5 minutos)
    const tiempoLimite = 5 * 60 * 1000; // 5 minutos en millisegundos
    const tiempoTranscurrido = Date.now() - mensaje.fechaEnvio.getTime();
    
    if (tiempoTranscurrido > tiempoLimite && session.user?.role !== 'admin') {
      return NextResponse.json(
        { exito: false, error: 'El tiempo para editar ha expirado (5 minutos)' },
        { status: 400 }
      );
    }

    // Actualizar mensaje
    mensaje.contenido = contenido.trim();
    mensaje.esEditado = true;
    mensaje.fechaEdicion = new Date();

    await mensaje.save();
    await mensaje.populate('autorId', 'firstName lastName email avatar');

    const mensajeRespuesta = {
      id: mensaje._id.toString(),
      contenido: mensaje.contenido,
      autorId: mensaje.autorId._id.toString(),
      autorNombre: `${mensaje.autorId.firstName} ${mensaje.autorId.lastName}`,
      autorAvatar: mensaje.autorId.avatar,
      fechaEnvio: mensaje.fechaEnvio,
      grupoId: mensaje.grupoId?.toString() || null,
      esEditado: mensaje.esEditado,
      fechaEdicion: mensaje.fechaEdicion
    };

    return NextResponse.json({
      exito: true,
      datos: mensajeRespuesta,
      mensaje: 'Mensaje editado exitosamente'
    });

  } catch (error) {
    console.error('Error al editar mensaje:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar mensaje
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session.success) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { exito: false, error: 'ID de mensaje inválido' },
        { status: 400 }
      );
    }

    const mensaje = await ChatMensaje.findById(id);
    if (!mensaje || !mensaje.activo) {
      return NextResponse.json(
        { exito: false, error: 'Mensaje no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos (solo el autor, moderador o administrador)
    if (mensaje.autorId.toString() !== session.user?.id && 
        !['admin', 'moderator'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { exito: false, error: 'Sin permisos para eliminar este mensaje' },
        { status: 403 }
      );
    }

    // Soft delete
    mensaje.activo = false;
    await mensaje.save();

    return NextResponse.json({
      exito: true,
      mensaje: 'Mensaje eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}