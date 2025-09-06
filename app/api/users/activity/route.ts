import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

interface Activity {
  id: string;
  type: 'event_registration' | 'event_attendance' | 'event_favorite' | 'profile_update' | 'membership_upgrade';
  title: string;
  description: string;
  date: Date;
  icon: string;
  iconColor: string;
  bgColor: string;
  details?: any;
}

// GET - Obtener actividades del usuario
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Obtener token de las cookies
    const token = request.cookies.get('bsk-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    
    // Buscar usuario con sus eventos y favoritos
    const user = await User.findById(decoded.userId)
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener eventos registrados del usuario
    const registeredEvents = await Event.find({
      _id: { $in: (user as any).events || [] }
    }).sort({ createdAt: -1 }).lean();

    // Obtener eventos favoritos del usuario
    const favoriteEvents = await Event.find({
      _id: { $in: (user as any).favoriteEvents || [] }
    }).sort({ createdAt: -1 }).lean();

    console.log('Usuario encontrado:', (user as any)._id);
    console.log('Events IDs del usuario:', (user as any).events);
    console.log('FavoriteEvents IDs del usuario:', (user as any).favoriteEvents);
    console.log('Eventos registrados encontrados:', registeredEvents.length);
    console.log('Eventos favoritos encontrados:', favoriteEvents.length);
    if (registeredEvents.length > 0) {
      console.log('Primer evento registrado:', {
        id: registeredEvents[0]._id,
        name: (registeredEvents[0] as any).name,
        startDate: (registeredEvents[0] as any).startDate
      });
    }

    // Crear array de actividades
    const activities: Activity[] = [];

    // Agregar eventos registrados
    for (const event of registeredEvents) {
      if (!event) continue; // Skip si el evento es null/undefined
      
      const eventStartDate = (event as any).startDate ? new Date((event as any).startDate) : null;
      const eventEndDate = (event as any).endDate ? new Date((event as any).endDate) : null;
      const now = new Date();
      
      // Verificar si tenemos una fecha válida
      const displayDate = eventStartDate && !isNaN(eventStartDate.getTime()) ? eventStartDate : new Date();
      const isValidDate = eventStartDate && !isNaN(eventStartDate.getTime());
      
      // Construir ubicación desde departureLocation o arrivalLocation
      const location = (event as any).departureLocation?.city || 
                      (event as any).arrivalLocation?.city || 
                      (event as any).departureLocation?.address || 
                      'Ubicación no especificada';
      
      // Evento completado (fecha de fin pasada)
      if (eventEndDate && eventEndDate < now) {
        activities.push({
          id: `event_attendance_${(event as any)._id}`,
          type: 'event_attendance',
          title: `Evento completado: ${(event as any).name || 'Evento sin título'}`,
          description: `${location} • ${isValidDate ? displayDate.toLocaleDateString('es-ES') : 'Fecha por confirmar'}`,
          date: eventEndDate,
          icon: 'FaCheck',
          iconColor: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          details: {
            eventId: (event as any)._id,
            eventTitle: (event as any).name,
            location: location,
            eventDate: displayDate
          }
        });
      } else {
        // Evento futuro (registrado)
        activities.push({
          id: `event_registration_${(event as any)._id}`,
          type: 'event_registration',
          title: `Inscrito al evento: ${(event as any).name || 'Evento sin título'}`,
          description: `${location} • ${isValidDate ? displayDate.toLocaleDateString('es-ES') : 'Fecha por confirmar'}`,
          date: new Date((event as any).createdAt || Date.now()),
          icon: 'FaCalendarPlus',
          iconColor: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          details: {
            eventId: (event as any)._id,
            eventTitle: (event as any).name,
            location: location,
            eventDate: displayDate
          }
        });
      }
    }

    // Agregar eventos favoritos
    for (const event of favoriteEvents) {
      if (!event) continue; // Skip si el evento es null/undefined
      
      const eventStartDate = (event as any).startDate ? new Date((event as any).startDate) : null;
      const isValidDate = eventStartDate && !isNaN(eventStartDate.getTime());
      const displayDate = isValidDate ? eventStartDate : new Date();
      
      // Construir ubicación desde departureLocation o arrivalLocation
      const location = (event as any).departureLocation?.city || 
                      (event as any).arrivalLocation?.city || 
                      (event as any).departureLocation?.address || 
                      'Ubicación no especificada';
      
      activities.push({
        id: `event_favorite_${(event as any)._id}`,
        type: 'event_favorite',
        title: `Evento marcado como favorito: ${(event as any).name || 'Evento sin título'}`,
        description: `${location} • ${isValidDate ? displayDate.toLocaleDateString('es-ES') : 'Fecha por confirmar'}`,
        date: new Date((event as any).createdAt || Date.now()),
        icon: 'FaHeart',
        iconColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        details: {
          eventId: (event as any)._id,
          eventTitle: (event as any).name,
          location: location,
          eventDate: displayDate
        }
      });
    }

    // Agregar actualización de perfil (usando updatedAt del usuario)
    if ((user as any).updatedAt) {
      const profileUpdateDate = new Date((user as any).updatedAt);
      const daysSinceUpdate = Math.floor((new Date().getTime() - profileUpdateDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceUpdate <= 30) { // Solo mostrar actualizaciones de los últimos 30 días
        activities.push({
          id: `profile_update_${(user as any)._id}`,
          type: 'profile_update',
          title: 'Perfil actualizado',
          description: `Información personal modificada • ${profileUpdateDate.toLocaleDateString('es-ES')}`,
          date: profileUpdateDate,
          icon: 'FaUser',
          iconColor: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
          details: {
            updateDate: profileUpdateDate
          }
        });
      }
    }

    // Agregar actividad de membresía (usando joinDate o createdAt)
    const joinDate = new Date((user as any).joinDate || (user as any).createdAt);
    const daysSinceJoining = Math.floor((new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceJoining <= 7) { // Mostrar solo si se unió en los últimos 7 días
      activities.push({
        id: `membership_start_${(user as any)._id}`,
        type: 'membership_upgrade',
        title: '¡Bienvenido a BSK Motorcycle Team!',
        description: `Membresía ${(user as any).membershipType} activada • ${joinDate.toLocaleDateString('es-ES')}`,
        date: joinDate,
        icon: 'FaMedal',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        details: {
          membershipType: (user as any).membershipType,
          joinDate: joinDate
        }
      });
    }

    // Ordenar actividades por fecha (más recientes primero)
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Aplicar paginación
    const paginatedActivities = activities.slice(offset, offset + limit);
    const totalActivities = activities.length;
    const totalPages = Math.ceil(totalActivities / limit);

    return NextResponse.json({
      success: true,
      data: {
        activities: paginatedActivities,
        pagination: {
          current: page,
          total: totalPages,
          limit: limit,
          totalItems: totalActivities,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error en GET /api/users/activity:', error);
    
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
