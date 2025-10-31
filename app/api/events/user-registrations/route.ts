import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import { verifyAuth } from '@/lib/auth-utils';

/**
 * GET /api/events/user-registrations
 * Obtiene los eventos a los que el usuario está actualmente registrado
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;

    // Conectar a la base de datos
    await connectDB();

    // Obtener eventos donde el usuario está registrado
    // Solo eventos futuros o actuales, ordenados por fecha
    const eventos = await Event.find({
      participants: userId,
      startDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Incluye eventos de hoy
    })
      .select('_id name startDate price departureLocation arrivalLocation registrationDeadline maxParticipants participants')
      .sort({ startDate: 1 })
      .lean();

    // Formatear la respuesta
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventosFormateados = eventos.map((evento: any) => ({
      id: evento._id.toString(),
      nombre: evento.name,
      fecha: evento.startDate,
      precio: evento.price || 0,
      ubicacion: evento.departureLocation?.address || evento.arrivalLocation?.address || 'Por definir',
      participantes: evento.participants?.length || 0,
      maxParticipantes: evento.maxParticipants
    }));

    return NextResponse.json({
      success: true,
      events: eventosFormateados,
      total: eventosFormateados.length
    });

  } catch (error) {
    console.error('Error al obtener eventos registrados:', error);
    return NextResponse.json(
      { error: 'Error al obtener los eventos registrados' },
      { status: 500 }
    );
  }
}
