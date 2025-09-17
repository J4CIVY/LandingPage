import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UsuarioRanking } from '@/lib/models/Comunidad';
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

    // Calcular badges y niveles
    const rankingsConBadges = rankings.map((ranking, index) => {
      const puntosTotal = ranking.puntos.total || 0;
      const badges = calcularBadges(puntosTotal);
      const nivel = calcularNivel(puntosTotal);
      const progreso = calcularProgreso(puntosTotal, nivel);

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
    });

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
function calcularBadges(puntos: number): string[] {
  const badges: string[] = [];
  
  if (puntos >= 1000) badges.push('🏆 Leyenda');
  else if (puntos >= 500) badges.push('🥇 Experto');
  else if (puntos >= 200) badges.push('🥈 Avanzado');
  else if (puntos >= 100) badges.push('🥉 Intermedio');
  else if (puntos >= 50) badges.push('🎖️ Principiante');
  
  if (puntos >= 300) badges.push('💬 Comunicador');
  if (puntos >= 150) badges.push('👥 Sociable');
  if (puntos >= 75) badges.push('📝 Colaborador');
  
  return badges;
}

// Función para calcular nivel basado en puntos
function calcularNivel(puntos: number): number {
  if (puntos >= 1000) return 10;
  if (puntos >= 800) return 9;
  if (puntos >= 600) return 8;
  if (puntos >= 450) return 7;
  if (puntos >= 350) return 6;
  if (puntos >= 250) return 5;
  if (puntos >= 175) return 4;
  if (puntos >= 100) return 3;
  if (puntos >= 50) return 2;
  return 1;
}

// Función para calcular progreso al siguiente nivel
function calcularProgreso(puntos: number, nivelActual: number): { actual: number; siguiente: number; porcentaje: number } {
  const nivelesRequeridos = [0, 50, 100, 175, 250, 350, 450, 600, 800, 1000];
  
  if (nivelActual >= 10) {
    return { actual: puntos, siguiente: 1000, porcentaje: 100 };
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