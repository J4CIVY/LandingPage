import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Comentario, UsuarioRanking } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';

// POST - Crear nuevo comentario
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session) {
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

    // Actualizar puntos del usuario
    await actualizarPuntosUsuario(session.user.id, 'comentario');

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

// Función auxiliar para actualizar puntos del usuario
async function actualizarPuntosUsuario(usuarioId: string, accion: 'comentario') {
  try {
    const puntos = { comentario: 2 };
    const puntosAgregar = puntos[accion];

    let ranking = await UsuarioRanking.findOne({ usuarioId });
    
    if (!ranking) {
      ranking = new UsuarioRanking({
        usuarioId,
        puntos: {
          publicaciones: 0,
          comentarios: 0,
          reaccionesRecibidas: 0,
          participacionEventos: 0,
          total: 0
        },
        insignias: [],
        nivel: 'Novato',
        fechaActualizacion: new Date()
      });
    }

    ranking.puntos.comentarios += puntosAgregar;
    
    // Recalcular total
    ranking.puntos.total = 
      ranking.puntos.publicaciones + 
      ranking.puntos.comentarios + 
      ranking.puntos.reaccionesRecibidas + 
      ranking.puntos.participacionEventos;

    // Actualizar nivel
    if (ranking.puntos.total >= 1500) {
      ranking.nivel = 'Leyenda BSKMT';
    } else if (ranking.puntos.total >= 500) {
      ranking.nivel = 'Motociclista Activo';
    } else if (ranking.puntos.total >= 100) {
      ranking.nivel = 'Colaborador';
    } else {
      ranking.nivel = 'Novato';
    }

    ranking.fechaActualizacion = new Date();
    await ranking.save();

  } catch (error) {
    console.error('Error al actualizar puntos:', error);
  }
}