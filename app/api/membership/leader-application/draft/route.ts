import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/auth-utils';
import { ObjectId } from 'mongodb';
import { requireCSRFToken } from '@/lib/csrf-protection';

// POST - Guardar borrador de postulación Leader
export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                 request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener datos del formulario
    const formData = await request.json();

    // Conectar a la base de datos
    const { db } = await connectToDatabase();
    
    // Verificar que el usuario existe y es elegible
    const user = await db.collection('users').findOne({
      _id: new ObjectId(payload.userId)
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (user.membershipType !== 'Master') {
      return NextResponse.json(
        { success: false, message: 'Solo Masters pueden postular a Leader' },
        { status: 403 }
      );
    }

    // Crear o actualizar borrador
    const draftData = {
      userId: new ObjectId(payload.userId),
      userName: user.name,
      type: 'leader_application_draft',
      formData,
      lastSaved: new Date(),
      status: 'draft'
    };

    // Verificar si ya existe un borrador
    const existingDraft = await db.collection('application_drafts').findOne({
      userId: new ObjectId(payload.userId),
      type: 'leader_application_draft'
    });

    let result;
    if (existingDraft) {
      result = await db.collection('application_drafts').updateOne(
        { _id: existingDraft._id },
        { $set: draftData }
      );
    } else {
      result = await db.collection('application_drafts').insertOne(draftData);
    }

    return NextResponse.json({
      success: true,
      data: {
        draftId: existingDraft?._id || result.insertedId,
        lastSaved: draftData.lastSaved
      },
      message: 'Borrador guardado exitosamente'
    });

  } catch (error) {
    console.error('Error saving draft:', error);
    
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Obtener borrador guardado
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                 request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Conectar a la base de datos
    const { db } = await connectToDatabase();
    
    // Buscar borrador existente
    const draft = await db.collection('application_drafts').findOne({
      userId: new ObjectId(payload.userId),
      type: 'leader_application_draft'
    });

    if (!draft) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No hay borrador guardado'
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        formData: draft.formData,
        lastSaved: draft.lastSaved
      }
    });

  } catch (error) {
    console.error('Error fetching draft:', error);
    
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}