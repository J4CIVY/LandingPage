import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ChatMensaje, UsuarioRanking } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';
import { Types } from 'mongoose';

// GET - Obtener mensajes del chat
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session.success) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const grupoId = searchParams.get('grupoId');
    const limite = parseInt(searchParams.get('limite') || '50');
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const skip = (pagina - 1) * limite;

    // Construir filtro
    const filtro: any = { activo: true };
    if (grupoId) {
      if (!Types.ObjectId.isValid(grupoId)) {
        return NextResponse.json(
          { exito: false, error: 'ID de grupo inválido' },
          { status: 400 }
        );
      }
      filtro.grupoId = grupoId;
    } else {
      // Chat general (sin grupo específico)
      filtro.grupoId = null;
    }

    // Obtener mensajes
    const mensajes = await ChatMensaje
      .find(filtro)
      .populate('autorId', 'firstName lastName email avatar')
      .sort({ fechaEnvio: -1 })
      .skip(skip)
      .limit(limite)
      .exec();

    // Obtener total para paginación
    const total = await ChatMensaje.countDocuments(filtro);

    // Transformar datos para el frontend
    const mensajesTransformados = mensajes.reverse().map(mensaje => ({
      id: mensaje._id.toString(),
      contenido: mensaje.contenido,
      autorId: mensaje.autorId._id.toString(),
      autorNombre: `${mensaje.autorId.firstName} ${mensaje.autorId.lastName}`,
      autorAvatar: mensaje.autorId.avatar,
      fechaEnvio: mensaje.fechaEnvio,
      grupoId: mensaje.grupoId?.toString() || null,
      esEditado: mensaje.esEditado,
      fechaEdicion: mensaje.fechaEdicion
    }));

    return NextResponse.json({
      exito: true,
      datos: {
        mensajes: mensajesTransformados,
        paginacion: {
          paginaActual: pagina,
          totalPaginas: Math.ceil(total / limite),
          totalMensajes: total,
          tieneAnterior: pagina > 1,
          tieneSiguiente: pagina < Math.ceil(total / limite)
        }
      },
      mensaje: 'Mensajes obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Enviar nuevo mensaje
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { contenido, grupoId } = await request.json();

    if (!contenido?.trim()) {
      return NextResponse.json(
        { exito: false, error: 'El contenido del mensaje es obligatorio' },
        { status: 400 }
      );
    }

    if (contenido.trim().length > 1000) {
      return NextResponse.json(
        { exito: false, error: 'El mensaje no puede exceder 1000 caracteres' },
        { status: 400 }
      );
    }

    // Validar grupoId si se proporciona
    if (grupoId && !Types.ObjectId.isValid(grupoId)) {
      return NextResponse.json(
        { exito: false, error: 'ID de grupo inválido' },
        { status: 400 }
      );
    }

    // Crear nuevo mensaje
    const nuevoMensaje = new ChatMensaje({
      contenido: contenido.trim(),
      autorId: session.user.id,
      grupoId: grupoId || null,
      fechaEnvio: new Date(),
      activo: true,
      esEditado: false
    });

    await nuevoMensaje.save();

    // Obtener datos completos para respuesta
    await nuevoMensaje.populate('autorId', 'firstName lastName email avatar');

    // Otorgar puntos por participar en chat
    await UsuarioRanking.findOneAndUpdate(
      { usuarioId: session.user.id },
      { 
        $inc: { puntos: 2 },
        $set: { fechaActualizacion: new Date() }
      },
      { upsert: true }
    );

    const mensajeRespuesta = {
      id: nuevoMensaje._id.toString(),
      contenido: nuevoMensaje.contenido,
      autorId: nuevoMensaje.autorId._id.toString(),
      autorNombre: `${nuevoMensaje.autorId.firstName} ${nuevoMensaje.autorId.lastName}`,
      autorAvatar: nuevoMensaje.autorId.avatar,
      fechaEnvio: nuevoMensaje.fechaEnvio,
      grupoId: nuevoMensaje.grupoId?.toString() || null,
      esEditado: nuevoMensaje.esEditado,
      fechaEdicion: nuevoMensaje.fechaEdicion
    };

    return NextResponse.json({
      exito: true,
      datos: {
        mensaje: mensajeRespuesta,
        puntosSumados: 2
      },
      mensaje: 'Mensaje enviado exitosamente'
    });

  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}