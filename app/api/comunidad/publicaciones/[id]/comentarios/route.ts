import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Comentario } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';
import { Types } from 'mongoose';

// GET - Obtener comentarios de una publicación específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { exito: false, error: 'ID de publicación inválido' },
        { status: 400 }
      );
    }

    // Obtener comentarios de la publicación
    const comentarios = await Comentario
      .find({ 
        publicacionId: id,
        activo: true 
      })
      .populate('autorId', 'firstName lastName email avatar')
      .sort({ fechaCreacion: -1 })
      .exec();

    // Transformar datos para el frontend
    const comentariosTransformados = comentarios.map(comentario => ({
      id: comentario._id.toString(),
      publicacionId: comentario.publicacionId.toString(),
      autorId: comentario.autorId._id.toString(),
      autor: {
        firstName: comentario.autorId.firstName,
        lastName: comentario.autorId.lastName,
        email: comentario.autorId.email,
        avatar: comentario.autorId.avatar
      },
      contenido: comentario.contenido,
      fechaCreacion: comentario.fechaCreacion,
      fechaActualizacion: comentario.fechaActualizacion,
      comentarioPadreId: comentario.comentarioPadreId?.toString(),
      respuestas: [], // Las respuestas se pueden cargar por separado si es necesario
      reacciones: {
        meGusta: comentario.reacciones.meGusta.map((id: any) => id.toString())
      }
    }));

    return NextResponse.json({
      exito: true,
      datos: comentariosTransformados,
      mensaje: 'Comentarios obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}