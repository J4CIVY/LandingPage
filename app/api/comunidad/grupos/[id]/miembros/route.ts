import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { GrupoInteres, UsuarioRanking } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';
import { Types } from 'mongoose';

type Params = Promise<{
  id: string;
}>;

// POST - Unirse/Salir de grupo
export async function POST(request: NextRequest, { params }: { params: Params }) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session.success || !session.user) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { accion } = await request.json(); // 'unirse' o 'salir'
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { exito: false, error: 'ID de grupo inválido' },
        { status: 400 }
      );
    }

    if (!['unirse', 'salir'].includes(accion)) {
      return NextResponse.json(
        { exito: false, error: 'Acción no válida' },
        { status: 400 }
      );
    }

    const grupo = await GrupoInteres.findById(id);
    if (!grupo || !grupo.activo) {
      return NextResponse.json(
        { exito: false, error: 'Grupo no encontrado' },
        { status: 404 }
      );
    }

    const usuarioId = new Types.ObjectId(session.user!.id);
    const yaEsMiembro = grupo.miembros.some((miembroId: any) => 
      miembroId.toString() === session.user!.id
    );

    if (accion === 'unirse') {
      if (yaEsMiembro) {
        return NextResponse.json(
          { exito: false, error: 'Ya eres miembro de este grupo' },
          { status: 400 }
        );
      }

      // Verificar si el grupo es privado
      if (grupo.esPrivado) {
        return NextResponse.json(
          { exito: false, error: 'Este grupo es privado y requiere invitación' },
          { status: 403 }
        );
      }

      // Unirse al grupo
      grupo.miembros.push(usuarioId);
      await grupo.save();

      // Otorgar puntos por unirse a un grupo
      await UsuarioRanking.findOneAndUpdate(
        { usuarioId: session.user!.id },
        { 
          $inc: { puntos: 5 },
          $set: { fechaActualizacion: new Date() }
        },
        { upsert: true }
      );

      return NextResponse.json({
        exito: true,
        mensaje: 'Te has unido al grupo exitosamente',
        datos: { 
          miembroCount: grupo.miembros.length,
          puntosSumados: 5
        }
      });

    } else if (accion === 'salir') {
      if (!yaEsMiembro) {
        return NextResponse.json(
          { exito: false, error: 'No eres miembro de este grupo' },
          { status: 400 }
        );
      }

      // Verificar que no sea el admin (no puede salir)
      if (grupo.adminId.toString() === session.user!.id) {
        return NextResponse.json(
          { exito: false, error: 'El administrador no puede salir del grupo' },
          { status: 400 }
        );
      }

      // Salir del grupo
      grupo.miembros = grupo.miembros.filter((miembroId: any) => 
        miembroId.toString() !== session.user!.id
      );
      await grupo.save();

      return NextResponse.json({
        exito: true,
        mensaje: 'Has salido del grupo exitosamente',
        datos: { miembroCount: grupo.miembros.length }
      });
    }

  } catch (error) {
    console.error('Error en membresía de grupo:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}