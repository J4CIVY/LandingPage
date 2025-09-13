import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { GrupoInteres } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';
import { Types } from 'mongoose';

type Params = {
  id: string;
};

// PUT - Actualizar grupo
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { exito: false, error: 'ID de grupo inválido' },
        { status: 400 }
      );
    }

    const grupo = await GrupoInteres.findById(id);
    if (!grupo) {
      return NextResponse.json(
        { exito: false, error: 'Grupo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos (solo admin del grupo o administrador general)
    if (grupo.adminId.toString() !== session.user.id && 
        session.user.role !== 'admin') {
      return NextResponse.json(
        { exito: false, error: 'Sin permisos para editar este grupo' },
        { status: 403 }
      );
    }

    const { nombre, descripcion, icono, esPrivado } = await request.json();

    // Verificar nombre único si se está cambiando
    if (nombre && nombre.trim() !== grupo.nombre) {
      const grupoExistente = await GrupoInteres.findOne({ 
        nombre: nombre.trim(),
        activo: true,
        _id: { $ne: id }
      });

      if (grupoExistente) {
        return NextResponse.json(
          { exito: false, error: 'Ya existe un grupo con ese nombre' },
          { status: 400 }
        );
      }
    }

    // Actualizar campos
    if (nombre?.trim()) grupo.nombre = nombre.trim();
    if (descripcion?.trim()) grupo.descripcion = descripcion.trim();
    if (icono) grupo.icono = icono;
    if (typeof esPrivado === 'boolean') grupo.esPrivado = esPrivado;

    await grupo.save();
    await grupo.populate('adminId', 'firstName lastName email');

    const grupoRespuesta = {
      id: grupo._id.toString(),
      nombre: grupo.nombre,
      descripcion: grupo.descripcion,
      icono: grupo.icono,
      miembros: grupo.miembros.map(id => id.toString()),
      adminId: grupo.adminId._id.toString(),
      fechaCreacion: grupo.fechaCreacion,
      esPrivado: grupo.esPrivado
    };

    return NextResponse.json({
      exito: true,
      datos: grupoRespuesta,
      mensaje: 'Grupo actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar grupo:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar grupo (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { exito: false, error: 'ID de grupo inválido' },
        { status: 400 }
      );
    }

    const grupo = await GrupoInteres.findById(id);
    if (!grupo) {
      return NextResponse.json(
        { exito: false, error: 'Grupo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos (solo admin del grupo o administrador general)
    if (grupo.adminId.toString() !== session.user.id && 
        session.user.role !== 'admin') {
      return NextResponse.json(
        { exito: false, error: 'Sin permisos para eliminar este grupo' },
        { status: 403 }
      );
    }

    // Soft delete
    grupo.activo = false;
    await grupo.save();

    return NextResponse.json({
      exito: true,
      mensaje: 'Grupo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}