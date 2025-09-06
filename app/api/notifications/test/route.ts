import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Notification from '@/lib/models/Notification';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// POST - Crear notificaciones de prueba
export async function POST(request: NextRequest) {
  try {
    await connectDB();

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

    // Crear notificaciones de ejemplo
    const testNotifications = [
      {
        userId: decoded.userId,
        type: 'event_upcoming',
        title: 'Evento próximo: Rodada de Montaña',
        message: 'El evento "Rodada de Montaña" será en 2 días. ¡No te lo pierdas!',
        data: {
          eventName: 'Rodada de Montaña',
          eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          url: '/events/test-event'
        },
        priority: 'high',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        userId: decoded.userId,
        type: 'event_registration_open',
        title: '¡Registro abierto!: Tour de la Costa',
        message: 'Ya está abierto el registro para "Tour de la Costa". ¡Inscríbete ahora!',
        data: {
          eventName: 'Tour de la Costa',
          eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          url: '/events/test-event-2'
        },
        priority: 'urgent',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        userId: decoded.userId,
        type: 'event_reminder',
        title: 'Recordatorio: Encuentro BSK es mañana',
        message: 'No olvides que mañana tienes el evento "Encuentro BSK". ¡Nos vemos allí!',
        data: {
          eventName: 'Encuentro BSK',
          eventDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          url: '/events/test-event-3'
        },
        priority: 'urgent',
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: decoded.userId,
        type: 'membership_update',
        title: '¡Bienvenido a BSK Motorcycle Team!',
        message: 'Tu membresía ha sido activada exitosamente. ¡Disfruta de todos los beneficios!',
        data: {
          membershipType: 'rider',
          url: '/profile'
        },
        priority: 'medium',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        userId: decoded.userId,
        type: 'system_announcement',
        title: 'Nueva funcionalidad disponible',
        message: 'Ahora puedes personalizar tu perfil con información de tu motocicleta.',
        data: {
          url: '/profile'
        },
        priority: 'low',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ];

    // Crear las notificaciones
    const createdNotifications = await Notification.insertMany(testNotifications);

    return NextResponse.json({
      success: true,
      message: 'Notificaciones de prueba creadas exitosamente',
      data: {
        notificationsCreated: createdNotifications.length,
        notifications: createdNotifications
      }
    });

  } catch (error) {
    console.error('Error en POST /api/notifications/test:', error);
    
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
