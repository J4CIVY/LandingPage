import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifySession } from '@/lib/auth-utils';

// GET - Obtener configuración de gamificación (insignias y niveles)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session.success || !session.user) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Configuración de insignias (esto podría venir de la base de datos en el futuro)
    const insignias = {
      'Colaborador': {
        icono: '🤝',
        color: 'bg-blue-100 text-blue-800',
        descripcion: 'Ha ayudado activamente a otros miembros',
        requisitos: 'Tener al menos 50 comentarios útiles'
      },
      'Motociclista Activo': {
        icono: '🏍️',
        color: 'bg-green-100 text-green-800',
        descripcion: 'Participa regularmente en eventos',
        requisitos: 'Participar en al menos 5 eventos'
      },
      'Leyenda BSKMT': {
        icono: '👑',
        color: 'bg-purple-100 text-purple-800',
        descripcion: 'Miembro destacado con contribución excepcional',
        requisitos: 'Tener más de 2000 puntos y múltiples insignias'
      },
      'Socializado': {
        icono: '💬',
        color: 'bg-yellow-100 text-yellow-800',
        descripcion: 'Muy activo en comentarios y conversaciones',
        requisitos: 'Tener más de 100 comentarios'
      },
      'Influyente': {
        icono: '⭐',
        color: 'bg-orange-100 text-orange-800',
        descripcion: 'Sus publicaciones reciben muchas reacciones',
        requisitos: 'Recibir más de 500 reacciones en total'
      },
      'Pionero': {
        icono: '🎯',
        color: 'bg-indigo-100 text-indigo-800',
        descripcion: 'Uno de los primeros miembros de la comunidad',
        requisitos: 'Ser miembro fundador o de los primeros 100'
      },
      'Mentor': {
        icono: '👨‍🏫',
        color: 'bg-teal-100 text-teal-800',
        descripcion: 'Ayuda y guía a nuevos miembros',
        requisitos: 'Tener respuestas útiles marcadas por moderadores'
      },
      'Aventurero': {
        icono: '🗺️',
        color: 'bg-red-100 text-red-800',
        descripcion: 'Participa en rutas y aventuras',
        requisitos: 'Participar en eventos de ruta o aventura'
      }
    };

    // Configuración de niveles
    const niveles = {
      'Novato': { 
        color: 'text-gray-600', 
        minPuntos: 0,
        descripcion: 'Nuevo en la comunidad, ¡bienvenido!',
        beneficios: ['Acceso básico a la comunidad', 'Crear publicaciones']
      },
      'Colaborador': { 
        color: 'text-blue-600', 
        minPuntos: 100,
        descripcion: 'Miembro activo que contribuye regularmente',
        beneficios: ['Reaccionar a publicaciones', 'Unirse a grupos', 'Crear eventos básicos']
      },
      'Motociclista Activo': { 
        color: 'text-green-600', 
        minPuntos: 500,
        descripcion: 'Miembro experimentado y comprometido',
        beneficios: ['Moderar grupos propios', 'Crear grupos de interés', 'Promocionar eventos']
      },
      'Leyenda BSKMT': { 
        color: 'text-purple-600', 
        minPuntos: 1500,
        descripcion: 'Miembro élite de la comunidad',
        beneficios: ['Privilegios especiales', 'Moderación avanzada', 'Acceso exclusivo']
      }
    };

    // Sistema de puntos
    const sistemaPuntos = {
      publicacion: { puntos: 10, descripcion: 'Crear una nueva publicación' },
      comentario: { puntos: 2, descripcion: 'Comentar en una publicación' },
      reaccionRecibida: { puntos: 1, descripcion: 'Recibir una reacción en tu contenido' },
      participacionEvento: { puntos: 25, descripcion: 'Participar en un evento confirmado' },
      creaEvento: { puntos: 15, descripcion: 'Crear y organizar un evento' },
      primeraPublicacion: { puntos: 20, descripcion: 'Bonus por tu primera publicación' },
      comentarioUtil: { puntos: 5, descripcion: 'Comentario marcado como útil por moderador' },
      invitarAmigo: { puntos: 30, descripcion: 'Invitar a un nuevo miembro que se registre' }
    };

    return NextResponse.json({
      exito: true,
      datos: {
        insignias,
        niveles,
        sistemaPuntos
      },
      mensaje: 'Configuración de gamificación obtenida exitosamente'
    });

  } catch (error) {
    console.error('Error al obtener configuración de gamificación:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}