import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Publicacion } from '@/lib/models/Comunidad';
import { IUser } from '@/lib/models/User';
import { UsuarioRanking } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';
import { actualizarPuntos, esPrimeraPublicacion } from '@/lib/services/GamificacionService';
import { requireCSRFToken } from '@/lib/csrf-protection';

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
        meGusta: pub.reacciones.meGusta.map((id: any) => id.toString()),
        corazones: pub.reacciones.corazones.map((id: any) => id.toString()),
        fuego: pub.reacciones.fuego.map((id: any) => id.toString())
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
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    await connectToDatabase();
    
    // Verificar sesión
    const session = await verifySession(request);
    if (!session.success || !session.user) {
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

    // Verificar si es primera publicación para bonus
    const esPrimera = await esPrimeraPublicacion(session.user.id);
    
    // Actualizar puntos del usuario (10 puntos por publicación)
    await actualizarPuntos(session.user.id, 'publicacion');
    
    // Bonus por primera publicación (+20 puntos adicionales)
    if (esPrimera) {
      await actualizarPuntos(session.user.id, 'primeraPublicacion');
    }

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