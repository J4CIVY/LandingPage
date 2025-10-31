import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { requireCSRFToken } from '@/lib/csrf-protection';

// POST - Generar notificaciones automáticas
export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    await connectDB();

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    let notificationsCreated = 0;

    // 1. Notificaciones para eventos próximos (3 días antes)
    const upcomingEvents = await Event.find({
      startDate: {
        $gte: now,
        $lte: threeDaysFromNow
      },
      isActive: true
    }).lean();

    for (const event of upcomingEvents) {
      // Buscar usuarios registrados en este evento
      const registeredUsers = await User.find({
        events: event._id,
        isActive: true
      }).select('_id').lean();

      for (const user of registeredUsers) {
        // Verificar que no existe ya una notificación similar
        const existingNotification = await Notification.findOne({
          userId: user._id,
          type: 'event_upcoming',
          'data.eventId': event._id,
          createdAt: {
            $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        });

        if (!existingNotification) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const daysUntilEvent = Math.ceil((new Date((event as any).startDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          await Notification.create({
            userId: user._id,
            type: 'event_upcoming',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            title: `Evento próximo: ${(event as any).name}`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message: `El evento "${(event as any).name}" será en ${daysUntilEvent} ${daysUntilEvent === 1 ? 'día' : 'días'}. ¡No te lo pierdas!`,
            data: {
              eventId: event._id,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              eventName: (event as any).name,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              eventDate: (event as any).startDate,
              url: `/events/${event._id}`
            },
            priority: daysUntilEvent <= 1 ? 'urgent' : 'high',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expiresAt: new Date((event as any).startDate.getTime() + 24 * 60 * 60 * 1000)
          });

          notificationsCreated++;
        }
      }
    }

    // 2. Notificaciones para registro abierto (eventos que abren registro en los próximos 7 días)
    const eventsOpeningRegistration = await Event.find({
      registrationStartDate: {
        $gte: now,
        $lte: sevenDaysFromNow
      },
      isActive: true
    }).lean();

    for (const event of eventsOpeningRegistration) {
      // Notificar a todos los usuarios activos
      const allUsers = await User.find({
        isActive: true,
        role: 'user'
      }).select('_id').lean();

      for (const user of allUsers) {
        // Verificar que no existe ya una notificación similar
        const existingNotification = await Notification.findOne({
          userId: user._id,
          type: 'event_registration_open',
          'data.eventId': event._id,
          createdAt: {
            $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          }
        });

        if (!existingNotification) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const registrationDate = new Date((event as any).registrationStartDate);
          const isToday = registrationDate.toDateString() === now.toDateString();
          
          await Notification.create({
            userId: user._id,
            type: 'event_registration_open',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            title: isToday ? `¡Registro abierto!: ${(event as any).name}` : `Próximo registro: ${(event as any).name}`,
            message: isToday 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ? `Ya está abierto el registro para "${(event as any).name}". ¡Inscríbete ahora!`
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              : `El registro para "${(event as any).name}" abrirá el ${registrationDate.toLocaleDateString('es-ES')}.`,
            data: {
              eventId: event._id,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              eventName: (event as any).name,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              eventDate: (event as any).startDate,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              registrationStartDate: (event as any).registrationStartDate,
              url: `/events/${event._id}`
            },
            priority: isToday ? 'urgent' : 'high',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expiresAt: (event as any).registrationDeadline || new Date((event as any).startDate.getTime() - 24 * 60 * 60 * 1000)
          });

          notificationsCreated++;
        }
      }
    }

    // 3. Recordatorios para eventos mañana
    const eventsTomorrow = await Event.find({
      startDate: {
        $gte: oneDayFromNow,
        $lt: new Date(oneDayFromNow.getTime() + 24 * 60 * 60 * 1000)
      },
      isActive: true
    }).lean();

    for (const event of eventsTomorrow) {
      const registeredUsers = await User.find({
        events: event._id,
        isActive: true
      }).select('_id').lean();

      for (const user of registeredUsers) {
        const existingNotification = await Notification.findOne({
          userId: user._id,
          type: 'event_reminder',
          'data.eventId': event._id,
          createdAt: {
            $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          }
        });

        if (!existingNotification) {
          await Notification.create({
            userId: user._id,
            type: 'event_reminder',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            title: `Recordatorio: ${(event as any).name} es mañana`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message: `No olvides que mañana tienes el evento "${(event as any).name}". ¡Nos vemos allí!`,
            data: {
              eventId: event._id,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              eventName: (event as any).name,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              eventDate: (event as any).startDate,
              url: `/events/${event._id}`
            },
            priority: 'urgent',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expiresAt: new Date((event as any).startDate.getTime() + 24 * 60 * 60 * 1000)
          });

          notificationsCreated++;
        }
      }
    }

    // 4. Limpiar notificaciones expiradas
    const deletedExpired = await Notification.deleteMany({
      expiresAt: { $lt: now }
    });

    return NextResponse.json({
      success: true,
      message: 'Notificaciones generadas exitosamente',
      data: {
        notificationsCreated,
        expiredNotificationsDeleted: deletedExpired.deletedCount,
        upcomingEventsProcessed: upcomingEvents.length,
        registrationEventsProcessed: eventsOpeningRegistration.length,
        tomorrowEventsProcessed: eventsTomorrow.length
      }
    });

  } catch (error) {
    console.error('Error en POST /api/notifications/generate:', error);

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
