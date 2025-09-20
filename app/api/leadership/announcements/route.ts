import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth-utils';
import { ObjectId } from 'mongodb';

// POST - Crear nuevo anuncio
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Verificar que el usuario sea Leader o Master
    if (user.membershipType !== 'leader' && user.membershipType !== 'master') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo Leaders y Masters pueden crear anuncios' },
        { status: 403 }
      );
    }

    const {
      title,
      content,
      type,
      targetAudience,
      scheduledFor
    } = await request.json();

    // Validaciones básicas
    if (!title || !content || !targetAudience) {
      return NextResponse.json(
        { error: 'Título, contenido y audiencia objetivo son requeridos' },
        { status: 400 }
      );
    }

    if (!Array.isArray(targetAudience) || targetAudience.length === 0) {
      return NextResponse.json(
        { error: 'La audiencia objetivo debe ser un array no vacío' },
        { status: 400 }
      );
    }

    const validTypes = ['info', 'warning', 'success', 'urgent'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de anuncio inválido' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Crear el anuncio
    const announcement = {
      title: title.trim(),
      content: content.trim(),
      type: type || 'info',
      targetAudience,
      createdBy: user.id,
      createdByEmail: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: scheduledFor ? 'scheduled' : 'draft',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      sentAt: null,
      metadata: {
        createdByRole: user.membershipType
      }
    };

    const result = await db.collection('leadership_announcements').insertOne(announcement);

    // Registrar en el log de actividades
    await db.collection('leadership_activity_log').insertOne({
      type: 'announcement_created',
      announcementId: result.insertedId.toString(),
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      metadata: {
        announcementTitle: title,
        announcementType: type || 'info',
        targetAudience,
        isScheduled: !!scheduledFor
      }
    });

    // Si el anuncio está programado para envío inmediato, procesarlo
    if (!scheduledFor) {
      // Aquí podrías agregar lógica para envío inmediato
      console.log(`Anuncio ${result.insertedId} creado como borrador`);
    }

    return NextResponse.json({
      success: true,
      message: 'Anuncio creado exitosamente',
      data: {
        announcementId: result.insertedId.toString(),
        title,
        status: announcement.status,
        createdAt: announcement.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Obtener anuncios
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Verificar que el usuario sea Leader o Master
    if (user.membershipType !== 'leader' && user.membershipType !== 'master') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo Leaders y Masters pueden ver anuncios administrativos' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const { db } = await connectToDatabase();

    // Construir filtros
    const filters: any = {
      $or: [
        { createdBy: user.id },
        { targetAudience: { $in: ['all', 'leaders', user.membershipType] } }
      ]
    };

    if (status) {
      filters.status = status;
    }

    // Obtener anuncios con paginación
    const announcements = await db.collection('leadership_announcements')
      .find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Contar total para paginación
    const total = await db.collection('leadership_announcements').countDocuments(filters);

    const formattedAnnouncements = announcements.map((announcement: any) => ({
      id: announcement._id.toString(),
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      targetAudience: announcement.targetAudience,
      status: announcement.status,
      createdAt: announcement.createdAt,
      scheduledFor: announcement.scheduledFor,
      sentAt: announcement.sentAt,
      createdByEmail: announcement.createdByEmail
    }));

    return NextResponse.json({
      success: true,
      data: {
        announcements: formattedAnnouncements,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}