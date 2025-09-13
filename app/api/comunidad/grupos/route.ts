import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { GrupoInteres } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';

// GET - Obtener grupos de interés
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Obtener grupos activos
    const grupos = await GrupoInteres
      .find({ activo: true })
      .populate('adminId', 'firstName lastName email')
      .sort({ fechaCreacion: -1 })
      .exec();

    // Transformar datos para el frontend
    const gruposTransformados = grupos.map(grupo => ({
      id: grupo._id.toString(),
      nombre: grupo.nombre,
      descripcion: grupo.descripcion,
      icono: grupo.icono,
      miembros: grupo.miembros.map(id => id.toString()),
      adminId: grupo.adminId._id.toString(),
      fechaCreacion: grupo.fechaCreacion,
      esPrivado: grupo.esPrivado
    }));

    return NextResponse.json({
      exito: true,
      datos: gruposTransformados,
      mensaje: 'Grupos obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error al obtener grupos:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo grupo
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

    // Verificar permisos de administrador/moderador
    if (session.user.role !== 'admin' && session.user.role !== 'moderator') {
      return NextResponse.json(
        { exito: false, error: 'Sin permisos para crear grupos' },
        { status: 403 }
      );
    }

    const { nombre, descripcion, icono, esPrivado } = await request.json();

    if (!nombre?.trim() || !descripcion?.trim()) {
      return NextResponse.json(
        { exito: false, error: 'Nombre y descripción son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar que no exista un grupo con el mismo nombre
    const grupoExistente = await GrupoInteres.findOne({ 
      nombre: nombre.trim(),
      activo: true 
    });

    if (grupoExistente) {
      return NextResponse.json(
        { exito: false, error: 'Ya existe un grupo con ese nombre' },
        { status: 400 }
      );
    }

    // Crear nuevo grupo
    const nuevoGrupo = new GrupoInteres({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      icono: icono || '🏍️',
      miembros: [session.user.id], // El creador se une automáticamente
      adminId: session.user.id,
      fechaCreacion: new Date(),
      esPrivado: esPrivado || false,
      activo: true
    });

    await nuevoGrupo.save();

    // Obtener datos completos para respuesta
    await nuevoGrupo.populate('adminId', 'firstName lastName email');

    const grupoRespuesta = {
      id: nuevoGrupo._id.toString(),
      nombre: nuevoGrupo.nombre,
      descripcion: nuevoGrupo.descripcion,
      icono: nuevoGrupo.icono,
      miembros: nuevoGrupo.miembros.map(id => id.toString()),
      adminId: nuevoGrupo.adminId._id.toString(),
      fechaCreacion: nuevoGrupo.fechaCreacion,
      esPrivado: nuevoGrupo.esPrivado
    };

    return NextResponse.json({
      exito: true,
      datos: grupoRespuesta,
      mensaje: 'Grupo creado exitosamente'
    });

  } catch (error) {
    console.error('Error al crear grupo:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}