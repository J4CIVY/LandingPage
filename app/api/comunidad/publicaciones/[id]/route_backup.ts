import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Publicacion } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';

// PUT - Editar publicación
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session.success || !session.user) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { contenido } = await request.json();

    if (!contenido?.trim()) {
      return NextResponse.json(
        { exito: false, error: 'El contenido es obligatorio' },
        { status: 400 }
      );
    }

    // Buscar publicación
    const publicacion = await Publicacion.findById(params.id).populate('autorId');
    
    if (!publicacion) {
      return NextResponse.json(
        { exito: false, error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos (autor o admin)
    const esAutor = publicacion.autorId._id.toString() === session.user.id;
    const esAdmin = session.user.role === 'admin' || session.user.role === 'moderator';

    if (!esAutor && !esAdmin) {
      return NextResponse.json(
        { exito: false, error: 'Sin permisos para editar esta publicación' },
        { status: 403 }
      );
    }

    // Actualizar publicación
    publicacion.contenido = contenido.trim();
    publicacion.esEditado = true;
    publicacion.fechaActualizacion = new Date();

    await publicacion.save();

    // Respuesta con datos actualizados
    const publicacionActualizada = {
      id: publicacion._id.toString(),
      autorId: publicacion.autorId._id.toString(),
      autor: {
        firstName: publicacion.autorId.firstName,
        lastName: publicacion.autorId.lastName,
        email: publicacion.autorId.email,
        role: publicacion.autorId.role
      },
      contenido: publicacion.contenido,
      imagenes: publicacion.imagenes || [],
      fechaCreacion: publicacion.fechaCreacion,
      fechaActualizacion: publicacion.fechaActualizacion,
      reacciones: {
        meGusta: publicacion.reacciones.meGusta.map(id => id.toString()),
        corazones: publicacion.reacciones.corazones.map(id => id.toString()),
        fuego: publicacion.reacciones.fuego.map(id => id.toString())
      },
      comentarios: [],
      grupoId: publicacion.grupoId?.toString(),
      esEditado: publicacion.esEditado
    };

    return NextResponse.json({
      exito: true,
      datos: publicacionActualizada,
      mensaje: 'Publicación actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al editar publicación:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar publicación
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Buscar publicación
    const publicacion = await Publicacion.findById(params.id).populate('autorId');
    
    if (!publicacion) {
      return NextResponse.json(
        { exito: false, error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos (autor o admin)
    const esAutor = publicacion.autorId._id.toString() === session.user.id;
    const esAdmin = session.user.role === 'admin' || session.user.role === 'moderator';

    if (!esAutor && !esAdmin) {
      return NextResponse.json(
        { exito: false, error: 'Sin permisos para eliminar esta publicación' },
        { status: 403 }
      );
    }

    // Marcar como inactiva en lugar de eliminar
    publicacion.activa = false;
    await publicacion.save();

    return NextResponse.json({
      exito: true,
      mensaje: 'Publicación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}