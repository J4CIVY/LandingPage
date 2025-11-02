import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Publicacion } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';
import { actualizarPuntos } from '@/lib/services/GamificacionService';
import { requireCSRFToken } from '@/lib/csrf-protection';

// POST - Toggle reacción en publicación
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session.success || !session.user) {
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

    const { id } = await params;

    // Buscar publicación
    const publicacion = await Publicacion.findById(id).populate('autorId');
    
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reacciones.filter((id: any) => id.toString() !== usuarioId);
      
      // No descontamos puntos al quitar reacciones para evitar penalizaciones
    } else {
      // Agregar reacción
      publicacion.reacciones[tipo as keyof typeof publicacion.reacciones].push(usuarioId);
      
      // Solo dar puntos cuando alguien recibe una nueva reacción
      if (publicacion.autorId._id.toString() !== usuarioId) {
        // +1 punto al autor de la publicación por recibir reacción
        await actualizarPuntos(publicacion.autorId._id.toString(), 'reaccionRecibida');
      }
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        meGusta: publicacion.reacciones.meGusta.map((id: any) => id.toString()),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        corazones: publicacion.reacciones.corazones.map((id: any) => id.toString()),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fuego: publicacion.reacciones.fuego.map((id: any) => id.toString())
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