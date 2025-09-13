import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Publicacion, UsuarioRanking } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';

// POST - Toggle reacción en publicación
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { tipo } = await request.json();

    if (!['meGusta', 'corazones', 'fuego'].includes(tipo)) {
      return NextResponse.json(
        { exito: false, error: 'Tipo de reacción inválido' },
        { status: 400 }
      );
    }

    // Buscar publicación
    const publicacion = await Publicacion.findById(params.id).populate('autorId');
    
    if (!publicacion || !publicacion.activa) {
      return NextResponse.json(
        { exito: false, error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }

    const usuarioId = session.user.id;
    const reacciones = publicacion.reacciones[tipo as keyof typeof publicacion.reacciones];
    const yaReacciono = reacciones.includes(usuarioId);

    if (yaReacciono) {
      // Quitar reacción
      publicacion.reacciones[tipo as keyof typeof publicacion.reacciones] = 
        reacciones.filter(id => id.toString() !== usuarioId);
      
      // Restar punto al autor de la publicación
      await actualizarPuntosReaccion(publicacion.autorId._id.toString(), -1);
    } else {
      // Agregar reacción
      publicacion.reacciones[tipo as keyof typeof publicacion.reacciones].push(usuarioId);
      
      // Sumar punto al autor de la publicación
      await actualizarPuntosReaccion(publicacion.autorId._id.toString(), 1);
    }

    await publicacion.save();

    // Respuesta con datos actualizados
    const publicacionActualizada = {
      id: publicacion._id.toString(),
      autorId: publicacion.autorId._id.toString(),
      autor: {
        firstName: publicacion.autorId.firstName,
        lastName: publicacion.autorId.lastName,
        email: publicacion.autorId.email,
        role: publicacion.autorId.role
      },
      contenido: publicacion.contenido,
      imagenes: publicacion.imagenes || [],
      fechaCreacion: publicacion.fechaCreacion,
      fechaActualizacion: publicacion.fechaActualizacion,
      reacciones: {
        meGusta: publicacion.reacciones.meGusta.map(id => id.toString()),
        corazones: publicacion.reacciones.corazones.map(id => id.toString()),
        fuego: publicacion.reacciones.fuego.map(id => id.toString())
      },
      comentarios: [],
      grupoId: publicacion.grupoId?.toString(),
      esEditado: publicacion.esEditado
    };

    return NextResponse.json({
      exito: true,
      datos: publicacionActualizada,
      mensaje: `Reacción ${yaReacciono ? 'eliminada' : 'agregada'} exitosamente`
    });

  } catch (error) {
    console.error('Error al manejar reacción:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función auxiliar para actualizar puntos por reacciones
async function actualizarPuntosReaccion(usuarioId: string, cambio: number) {
  try {
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

    // Actualizar puntos de reacciones recibidas
    ranking.puntos.reaccionesRecibidas = Math.max(0, ranking.puntos.reaccionesRecibidas + cambio);
    
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
    console.error('Error al actualizar puntos de reacción:', error);
  }
}