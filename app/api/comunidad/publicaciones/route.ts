import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Publicacion } from '@/lib/models/Comunidad';
import { User } from '@/lib/models/User';
import { UsuarioRanking } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';

// GET - Obtener publicaciones
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const grupoId = searchParams.get('grupoId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir filtros
    const filtros: any = { activa: true };
    if (grupoId) {
      filtros.grupoId = grupoId;
    } else {
      // Si no hay grupoId, solo mostrar publicaciones generales (sin grupo)
      filtros.$or = [
        { grupoId: { $exists: false } },
        { grupoId: null }
      ];
    }

    // Obtener publicaciones con populate de autor
    const publicaciones = await Publicacion
      .find(filtros)
      .populate('autorId', 'firstName lastName email role')
      .sort({ fechaCreacion: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    // Transformar datos para el frontend
    const publicacionesTransformadas = publicaciones.map(pub => ({
      id: pub._id.toString(),
      autorId: pub.autorId._id.toString(),
      autor: {
        firstName: pub.autorId.firstName,
        lastName: pub.autorId.lastName,
        email: pub.autorId.email,
        role: pub.autorId.role
      },
      contenido: pub.contenido,
      imagenes: pub.imagenes || [],
      fechaCreacion: pub.fechaCreacion,
      fechaActualizacion: pub.fechaActualizacion,
      reacciones: {
        meGusta: pub.reacciones.meGusta.map(id => id.toString()),
        corazones: pub.reacciones.corazones.map(id => id.toString()),
        fuego: pub.reacciones.fuego.map(id => id.toString())
      },
      comentarios: [], // Los comentarios se cargan por separado
      grupoId: pub.grupoId?.toString(),
      esEditado: pub.esEditado
    }));

    return NextResponse.json({
      exito: true,
      datos: publicacionesTransformadas,
      mensaje: 'Publicaciones obtenidas exitosamente'
    });

  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    return NextResponse.json(
      { 
        exito: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// POST - Crear nueva publicación
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Verificar sesión
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const contenido = formData.get('contenido') as string;
    const grupoId = formData.get('grupoId') as string | null;

    if (!contenido?.trim()) {
      return NextResponse.json(
        { exito: false, error: 'El contenido es obligatorio' },
        { status: 400 }
      );
    }

    // Procesar imágenes si existen
    const imagenes: string[] = [];
    let index = 0;
    while (formData.has(`imagen_${index}`)) {
      const archivo = formData.get(`imagen_${index}`) as File;
      
      // Aquí deberías subir la imagen a tu servicio de almacenamiento
      // Por ahora, simularemos con una URL
      const urlImagen = `/uploads/comunidad/${Date.now()}_${archivo.name}`;
      imagenes.push(urlImagen);
      
      index++;
    }

    // Crear nueva publicación
    const nuevaPublicacion = new Publicacion({
      autorId: session.user.id,
      contenido: contenido.trim(),
      imagenes,
      grupoId: grupoId || undefined,
      fechaCreacion: new Date(),
      reacciones: {
        meGusta: [],
        corazones: [],
        fuego: []
      },
      esEditado: false,
      activa: true
    });

    await nuevaPublicacion.save();

    // Actualizar puntos del usuario
    await actualizarPuntosUsuario(session.user.id, 'publicacion');

    // Obtener datos completos para respuesta
    await nuevaPublicacion.populate('autorId', 'firstName lastName email role');

    const publicacionRespuesta = {
      id: nuevaPublicacion._id.toString(),
      autorId: nuevaPublicacion.autorId._id.toString(),
      autor: {
        firstName: nuevaPublicacion.autorId.firstName,
        lastName: nuevaPublicacion.autorId.lastName,
        email: nuevaPublicacion.autorId.email,
        role: nuevaPublicacion.autorId.role
      },
      contenido: nuevaPublicacion.contenido,
      imagenes: nuevaPublicacion.imagenes || [],
      fechaCreacion: nuevaPublicacion.fechaCreacion,
      fechaActualizacion: nuevaPublicacion.fechaActualizacion,
      reacciones: {
        meGusta: [],
        corazones: [],
        fuego: []
      },
      comentarios: [],
      grupoId: nuevaPublicacion.grupoId?.toString(),
      esEditado: false
    };

    return NextResponse.json({
      exito: true,
      datos: publicacionRespuesta,
      mensaje: 'Publicación creada exitosamente'
    });

  } catch (error) {
    console.error('Error al crear publicación:', error);
    return NextResponse.json(
      { 
        exito: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// Función auxiliar para actualizar puntos del usuario
async function actualizarPuntosUsuario(usuarioId: string, accion: 'publicacion' | 'comentario' | 'reaccion') {
  try {
    const puntos = {
      publicacion: 10,
      comentario: 2,
      reaccion: 1
    };

    const puntosAgregar = puntos[accion];

    // Buscar o crear registro de ranking
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

    // Actualizar puntos específicos
    if (accion === 'publicacion') {
      ranking.puntos.publicaciones += puntosAgregar;
    } else if (accion === 'comentario') {
      ranking.puntos.comentarios += puntosAgregar;
    } else if (accion === 'reaccion') {
      ranking.puntos.reaccionesRecibidas += puntosAgregar;
    }

    // Recalcular total
    ranking.puntos.total = 
      ranking.puntos.publicaciones + 
      ranking.puntos.comentarios + 
      ranking.puntos.reaccionesRecibidas + 
      ranking.puntos.participacionEventos;

    // Actualizar nivel basado en puntos totales
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