import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UsuarioRanking, Publicacion, Comentario } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';

// GET - Obtener ranking de usuarios
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

    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get('limite') || '20');
    const tipo = searchParams.get('tipo') || 'puntos'; // 'puntos' o 'actividad'

    // Construir ordenamiento según tipo
    let sortOrder: any = {};
    if (tipo === 'puntos') {
      sortOrder = { puntos: -1, fechaActualizacion: -1 };
    } else if (tipo === 'actividad') {
      sortOrder = { fechaActualizacion: -1, puntos: -1 };
    }

    // Obtener rankings
    const rankings = await UsuarioRanking
      .find()
      .populate('usuarioId', 'firstName lastName email avatar')
      .sort(sortOrder)
      .limit(limite)
      .exec();

    // Calcular badges y niveles con contadores reales
    const rankingsConBadges = await Promise.all(rankings.map(async (ranking, index) => {
      const puntosTotal = ranking.puntos.total || 0;
      const badges = generarBadges(puntosTotal);
      const nivel = calcularNivel(puntosTotal);
      const progreso = calcularProgreso(puntosTotal, nivel);

      // Obtener contadores reales de actividad del usuario
      const [conteoPublicaciones, conteoComentarios, conteoReacciones] = await Promise.all([
        Publicacion.countDocuments({ 
          autorId: ranking.usuarioId._id, 
          activa: true 
        }),
        Comentario.countDocuments({ 
          autorId: ranking.usuarioId._id, 
          activo: true 
        }),
        Publicacion.aggregate([
          { $match: { autorId: ranking.usuarioId._id, activa: true } },
          {
            $project: {
              totalReacciones: {
                $add: [
                  { $size: '$reacciones.meGusta' },
                  { $size: '$reacciones.corazones' },
                  { $size: '$reacciones.fuego' }
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalReacciones' }
            }
          }
        ]).then(result => result[0]?.total || 0)
      ]);

      return {
        posicion: index + 1,
        id: ranking.usuarioId._id.toString(),
        usuarioId: ranking.usuarioId._id.toString(),
        firstName: ranking.usuarioId.firstName,
        lastName: ranking.usuarioId.lastName,
        email: ranking.usuarioId.email,
        nombreCompleto: `${ranking.usuarioId.firstName} ${ranking.usuarioId.lastName}`,
        avatar: ranking.usuarioId.avatar,
        puntos: {
          publicaciones: ranking.puntos.publicaciones || 0,
          comentarios: ranking.puntos.comentarios || 0,
          reaccionesRecibidas: ranking.puntos.reaccionesRecibidas || 0,
          participacionEventos: ranking.puntos.participacionEventos || 0,
          total: puntosTotal
        },
        contadores: {
          publicaciones: conteoPublicaciones,
          comentarios: conteoComentarios,
          reaccionesRecibidas: conteoReacciones,
          participacionEventos: 0 // Por implementar con eventos
        },
        nivel: nivel,
        progreso: progreso,
        insignias: badges.map(badge => ({
          id: badge,
          nombre: badge,
          descripcion: '',
          icono: '',
          criterio: '',
          fechaObtenida: new Date()
        })),
        fechaActualizacion: ranking.fechaActualizacion
      };
    }));

    // Obtener posición del usuario actual
    const usuarioActual = rankings.find(r => 
      r.usuarioId._id.toString() === session.user!.id
    );

    let posicionUsuario = null;
    if (!usuarioActual) {
      // Si el usuario no está en el top, buscar su posición
      const usuarioRanking = await UsuarioRanking.findOne({ usuarioId: session.user!.id });
      if (usuarioRanking) {
        const usuariosConMasPuntos = await UsuarioRanking.countDocuments({
          puntos: { $gt: usuarioRanking.puntos }
        });
        posicionUsuario = usuariosConMasPuntos + 1;
      }
    } else {
      posicionUsuario = rankingsConBadges.find(r => 
        r.usuarioId === session.user!.id
      )?.posicion || null;
    }

    return NextResponse.json({
      exito: true,
      datos: {
        ranking: rankingsConBadges,
        posicionUsuario: posicionUsuario,
        totalUsuarios: await UsuarioRanking.countDocuments(),
        tipo: tipo
      },
      mensaje: 'Ranking obtenido exitosamente'
    });

  } catch (error) {
    console.error('Error al obtener ranking:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función para calcular badges basado en puntos
function generarBadges(puntos: number): string[] {
  const badges: string[] = [];
  
  if (puntos >= 40000) badges.push('💎 Leader');
  else if (puntos >= 25000) badges.push('� Volunteer');
  else if (puntos >= 18000) badges.push('👑 Master');
  else if (puntos >= 9000) badges.push('🏆 Legend');
  else if (puntos >= 3000) badges.push('⚡ Pro');
  else if (puntos >= 1500) badges.push('�️ Rider');
  else if (puntos >= 1000) badges.push('🤝 Friend');
  else if (puntos >= 500) badges.push('� Participante');
  else if (puntos >= 250) badges.push('� Explorador');
  else badges.push('🌱 Aspirante');
  
  return badges;
}

// Función para calcular nivel basado en puntos (alineado con membresías)
function calcularNivel(puntos: number): number {
  if (puntos >= 40000) return 11; // Leader
  if (puntos >= 25000) return 10; // Volunteer
  if (puntos >= 18000) return 9;  // Master
  if (puntos >= 9000) return 8;   // Legend
  if (puntos >= 3000) return 7;   // Pro
  if (puntos >= 1500) return 6;   // Rider
  if (puntos >= 1000) return 5;   // Friend
  if (puntos >= 500) return 4;    // Participante
  if (puntos >= 250) return 3;    // Explorador
  if (puntos >= 50) return 2;     // Inicial
  return 1;                       // Aspirante
}

// Función para calcular progreso al siguiente nivel (alineado con membresías)
function calcularProgreso(puntos: number, nivelActual: number): { actual: number; siguiente: number; porcentaje: number } {
  const nivelesRequeridos = [0, 50, 250, 500, 1000, 1500, 3000, 9000, 18000, 25000, 40000, 60000];
  
  if (nivelActual >= 11) {
    return { actual: puntos, siguiente: 60000, porcentaje: 100 };
  }
  
  const puntosActuales = nivelesRequeridos[nivelActual - 1];
  const puntosSiguientes = nivelesRequeridos[nivelActual];
  const progresoPuntos = puntos - puntosActuales;
  const puntosNecesarios = puntosSiguientes - puntosActuales;
  const porcentaje = Math.min(100, (progresoPuntos / puntosNecesarios) * 100);
  
  return {
    actual: progresoPuntos,
    siguiente: puntosNecesarios,
    porcentaje: Math.round(porcentaje)
  };
}