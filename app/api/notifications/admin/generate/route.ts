import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import Notification from '@/lib/models/Notification';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// POST - Ejecutar generación de notificaciones (solo para administradores)
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

    // Verificar token y permisos de administrador
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    const user = await User.findById(decoded.userId).select('role').lean();

    if (!user || ((user as any).role !== 'admin' && (user as any).role !== 'super-admin')) {
      return NextResponse.json(
        { success: false, message: 'Permisos de administrador requeridos' },
        { status: 403 }
      );
    }

    // Ejecutar la generación automática
    const generateResponse = await fetch(`${request.nextUrl.origin}/api/notifications/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!generateResponse.ok) {
      throw new Error('Error al generar notificaciones');
    }

    const generateData = await generateResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Generación de notificaciones ejecutada exitosamente',
      data: generateData.data
    });

  } catch (error) {
    console.error('Error en POST /api/notifications/admin/generate:', error);
    
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Obtener estadísticas de notificaciones (solo para administradores)
export async function GET(request: NextRequest) {
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

    // Verificar token y permisos de administrador
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    const user = await User.findById(decoded.userId).select('role').lean();

    if (!user || ((user as any).role !== 'admin' && (user as any).role !== 'super-admin')) {
      return NextResponse.json(
        { success: false, message: 'Permisos de administrador requeridos' },
        { status: 403 }
      );
    }

    // Obtener estadísticas
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });
    const notificationsByType = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const notificationsByPriority = await Notification.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum:1 }
        }
      }
    ]);

    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'firstName lastName email')
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        statistics: {
          total: totalNotifications,
          unread: unreadNotifications,
          byType: notificationsByType,
          byPriority: notificationsByPriority
        },
        recentNotifications
      }
    });

  } catch (error) {
    console.error('Error en GET /api/notifications/admin/generate:', error);
    
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
