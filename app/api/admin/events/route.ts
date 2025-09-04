import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminRequest } from '@/lib/auth-admin';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';

export async function GET(req: NextRequest) {
  const adminRequest = req as AdminRequest;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'all';

    // Construir filtros
    const filters: any = {};

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (type !== 'all') {
      filters.type = type;
    }

    if (status !== 'all') {
      switch (status) {
        case 'active':
          filters.isActive = true;
          break;
        case 'inactive':
          filters.isActive = false;
          break;
        case 'upcoming':
          filters.date = { $gte: new Date() };
          filters.isActive = true;
          break;
        case 'past':
          filters.date = { $lt: new Date() };
          break;
      }
    }

    // Contar total de eventos
    const totalEvents = await Event.countDocuments(filters);
    const totalPages = Math.ceil(totalEvents / limit);

    // Obtener eventos con paginación
    const events = await Event.find(filters)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('participants', 'firstName lastName email');

    // Agregar contador de participantes actuales
    const eventsWithCounts = events.map(event => ({
      ...event.toObject(),
      currentParticipants: event.participants?.length || 0
    }));

    return NextResponse.json({
      success: true,
      events: eventsWithCounts,
      pagination: {
        currentPage: page,
        totalPages,
        totalEvents,
        limit
      }
    });

  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const adminRequest = req as AdminRequest;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();
    const eventData = await req.json();

    // Validar datos requeridos
    const requiredFields = ['title', 'description', 'date', 'time', 'location', 'type'];

    for (const field of requiredFields) {
      if (!eventData[field]) {
        return NextResponse.json(
          { success: false, error: `El campo ${field} es requerido` },
          { status: 400 }
        );
      }
    }

    // Crear nuevo evento
    const newEvent = new Event({
      ...eventData,
      createdBy: adminRequest.user?.id,
      participants: [],
      isActive: true
    });

    await newEvent.save();

    return NextResponse.json({
      success: true,
      message: 'Evento creado exitosamente',
      event: newEvent
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando evento:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
