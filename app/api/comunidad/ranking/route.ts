import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifySession } from '@/lib/auth-utils';

function generarBadges(puntos: number): string[] {
  if (puntos >= 40000) return ['💎 Leader'];
  if (puntos >= 25000) return ['🤲 Volunteer'];
  if (puntos >= 18000) return ['👑 Master'];
  if (puntos >= 9000) return ['🏆 Legend'];
  if (puntos >= 3000) return ['⚡ Pro'];
  if (puntos >= 1500) return ['🏍️ Rider'];
  return ['🤝 Friend'];
}

function calcularNivel(puntos: number): number {
  if (puntos >= 40000) return 7;
  if (puntos >= 25000) return 6;
  if (puntos >= 18000) return 5;
  if (puntos >= 9000) return 4;
  if (puntos >= 3000) return 3;
  if (puntos >= 1500) return 2;
  return 1;
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session.success || !session.user) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get('limite') || '20');

    const rankings = await db.collection('usuarios').aggregate([
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          avatar: 1,
          puntos: { $ifNull: ['$puntos', 0] },
          fechaRegistro: 1
        }
      },
      { $sort: { puntos: -1 } },
      { $limit: limite }
    ]).toArray();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usuariosConBadges = rankings.map((usuario: any, index: number) => {
      const puntosTotal = usuario.puntos || 0;
      const badges = generarBadges(puntosTotal);
      const nivel = calcularNivel(puntosTotal);

      return {
        posicion: index + 1,
        id: usuario._id.toString(),
        firstName: usuario.firstName,
        lastName: usuario.lastName,
        email: usuario.email,
        nombreCompleto: `${usuario.firstName} ${usuario.lastName}`,
        avatar: usuario.avatar,
        puntos: {
          total: puntosTotal
        },
        nivel: nivel,
        insignias: badges.map(badge => ({
          id: badge,
          nombre: badge
        })),
        fechaRegistro: usuario.fechaRegistro
      };
    });

    const posicionUsuario = usuariosConBadges.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (u: any) => u.id === session.user!.id
    ) + 1;

    return NextResponse.json({
      exito: true,
      datos: {
        ranking: usuariosConBadges,
        posicionUsuario: posicionUsuario > 0 ? posicionUsuario : null,
        totalUsuarios: await db.collection('usuarios').countDocuments()
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
