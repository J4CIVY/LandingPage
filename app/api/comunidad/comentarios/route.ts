import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Comentario } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';
import { actualizarPuntos } from '@/lib/services/GamificacionService';
import { requireCSRFToken } from '@/lib/csrf-protection';

// POST - Crear nuevo comentario
export async function POST(request: NextRequest) {
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

    const { contenido, publicacionId, comentarioPadreId } = await request.json();

    if (!contenido?.trim()) {
      return NextResponse.json(
        { exito: false, error: 'El contenido es obligatorio' },
        { status: 400 }
      );
    }

    if (!publicacionId) {
      return NextResponse.json(
        { exito: false, error: 'ID de publicación es obligatorio' },
        { status: 400 }
      );
    }

    // Crear nuevo comentario
    const nuevoComentario = new Comentario({
      publicacionId,
      autorId: session.user.id,
      contenido: contenido.trim(),
      fechaCreacion: new Date(),
      comentarioPadreId: comentarioPadreId || undefined,
      reacciones: {
        meGusta: []
      },
      activo: true
    });

    await nuevoComentario.save();

    // Actualizar puntos del usuario (+2 puntos por comentario)
    await actualizarPuntos(session.user.id, 'comentario');

    // Obtener datos completos para respuesta
    await nuevoComentario.populate('autorId', 'firstName lastName email role');

    const comentarioRespuesta = {
      id: nuevoComentario._id.toString(),
      publicacionId: nuevoComentario.publicacionId.toString(),
      autorId: nuevoComentario.autorId._id.toString(),
      autor: {
        firstName: nuevoComentario.autorId.firstName,
        lastName: nuevoComentario.autorId.lastName,
        email: nuevoComentario.autorId.email,
        role: nuevoComentario.autorId.role
      },
      contenido: nuevoComentario.contenido,
      fechaCreacion: nuevoComentario.fechaCreacion,
      fechaActualizacion: nuevoComentario.fechaActualizacion,
      comentarioPadreId: nuevoComentario.comentarioPadreId?.toString(),
      respuestas: [],
      reacciones: {
        meGusta: []
      }
    };

    return NextResponse.json({
      exito: true,
      datos: comentarioRespuesta,
      mensaje: 'Comentario creado exitosamente'
    });

  } catch (error) {
    console.error('Error al crear comentario:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}