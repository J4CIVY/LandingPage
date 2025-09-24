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
    // Niveles de gamificación alineados con membresías
    const niveles = {
      'Aspirante': { 
        color: 'text-gray-500', 
        minPuntos: 0,
        descripcion: 'Nuevo en la comunidad BSK',
        beneficios: ['Acceso básico', 'Participación limitada']
      },
      'Explorador': { 
        color: 'text-blue-500', 
        minPuntos: 250,
        descripcion: 'Comenzando a participar',
        beneficios: ['Crear publicaciones', 'Comentar libremente']
      },
      'Participante': { 
        color: 'text-indigo-600', 
        minPuntos: 500,
        descripcion: 'Participante activo',
        beneficios: ['Crear grupos', 'Moderar contenido propio']
      },
      'Friend': { 
        color: 'text-purple-600', 
        minPuntos: 1000,
        descripcion: 'Miembro Friend del BSK MT',
        beneficios: ['Acceso a eventos gratuitos', 'Beneficios básicos de membresía']
      },
      'Rider': { 
        color: 'text-green-600', 
        minPuntos: 1500,
        descripcion: 'Rider activo y comprometido',
        beneficios: ['Descuentos en eventos', 'Acceso a talleres', 'Equipamiento básico']
      },
      'Pro': { 
        color: 'text-yellow-600', 
        minPuntos: 3000,
        descripcion: 'Motociclista experimentado',
        beneficios: ['Equipamiento gratuito', 'Eventos exclusivos', 'Mentoría avanzada']
      },
      'Legend': { 
        color: 'text-red-600', 
        minPuntos: 9000,
        descripcion: 'Leyenda de la comunidad',
        beneficios: ['Eventos VIP', 'Reconocimiento especial', 'Acceso premium']
      },
      'Master': { 
        color: 'text-purple-700', 
        minPuntos: 18000,
        descripcion: 'Maestro del motociclismo',
        beneficios: ['Todos los beneficios', 'Acceso completo', 'Status élite']
      },
      'Volunteer': { 
        color: 'text-green-700', 
        minPuntos: 25000,
        descripcion: 'Voluntario comprometido',
        beneficios: ['Puntos extra', 'Reconocimiento especial', 'Acceso administrativo']
      },
      'Leader': { 
        color: 'text-gray-900', 
        minPuntos: 40000,
        descripcion: 'Líder de la comunidad BSK',
        beneficios: ['Liderazgo de proyectos', 'Toma de decisiones', 'Máximo privilegio']
      }
    };    // Sistema de puntos actualizado para alinear con membresías
    const sistemaPuntos = {
      publicacion: { puntos: 10, descripcion: 'Crear una nueva publicación' },
      comentario: { puntos: 2, descripcion: 'Comentar en una publicación' },
      reaccionRecibida: { puntos: 1, descripcion: 'Recibir una reacción en tu contenido' },
      participacionEvento: { puntos: 100, descripcion: 'Participar en un evento confirmado' },
      creaEvento: { puntos: 500, descripcion: 'Crear y organizar un evento' },
      primeraPublicacion: { puntos: 50, descripcion: 'Bonus por tu primera publicación' },
      comentarioUtil: { puntos: 5, descripcion: 'Comentario marcado como útil por moderador' },
      invitarAmigo: { puntos: 300, descripcion: 'Invitar a un nuevo miembro que se registre' },
      voluntariado: { puntos: 200, descripcion: 'Participar en actividad de voluntariado' },
      mentoría: { puntos: 150, descripcion: 'Mentorizar a nuevos miembros' },
      liderazgoProyecto: { puntos: 1000, descripcion: 'Liderar proyecto comunitario' }
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