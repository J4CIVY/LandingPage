import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Publicacion } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';

type Params = Promise<{
  id: string;
}>;

// PUT - Editar publicación
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

    const { id } = await params;
    const { contenido } = await request.json();

    if (!contenido?.trim()) {
      return NextResponse.json(
        { exito: false, error: 'El contenido es obligatorio' },
        { status: 400 }
      );
    }

    // Buscar publicación
    const publicacion = await Publicacion.findById(id).populate('autorId');
    
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

    // Actualizar contenido
    publicacion.contenido = contenido.trim();
    publicacion.fechaEdicion = new Date();
    await publicacion.save();

    // Obtener datos actualizados
    await publicacion.populate('autorId', 'firstName lastName email role');

    const publicacionData = {
      id: publicacion._id.toString(),
      contenido: publicacion.contenido,
      autorId: publicacion.autorId._id.toString(),
      autorNombre: `${publicacion.autorId.firstName} ${publicacion.autorId.lastName}`,
      autorEmail: publicacion.autorId.email,
      autorRole: publicacion.autorId.role,
      fechaCreacion: publicacion.fechaCreacion,
      fechaEdicion: publicacion.fechaEdicion,
      grupoId: publicacion.grupoId?.toString() || null,
      imagenes: publicacion.imagenes || [],
      tipoPublicacion: publicacion.tipoPublicacion,
      reacciones: {
        meGusta: publicacion.reacciones.meGusta.map((id: any) => id.toString()),
        corazones: publicacion.reacciones.corazones.map((id: any) => id.toString()),
        fuego: publicacion.reacciones.fuego.map((id: any) => id.toString())
      },
      cantidadComentarios: publicacion.cantidadComentarios || 0,
      activa: publicacion.activa
    };

    return NextResponse.json({
      exito: true,
      publicacion: publicacionData
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
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
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

    const { id } = await params;

    // Buscar publicación
    const publicacion = await Publicacion.findById(id).populate('autorId');
    
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