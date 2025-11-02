import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { requireCSRFToken } from '@/lib/csrf-protection';
import { internalApiFetch } from '@/lib/internal-api-client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// POST - Ejecutar generación de notificaciones (solo para administradores)
export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await User.findById(decoded.userId).select('role').lean() as any;

    if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
      return NextResponse.json(
        { success: false, message: 'Permisos de administrador requeridos' },
        { status: 403 }
      );
    }

    // Ejecutar la generación automática usando internal API client (SSRF protection)
    const generateResponse = await internalApiFetch('/api/notifications/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!generateResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Error al generar notificaciones' },
        { status: 500 }
      );
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
export async function GET() {
  try {
    await connectDB();

    // Verificar autenticación y permisos de admin
    const cookieStore = await cookies();
    const token = cookieStore.get('bsk-access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    const adminUser = await User.findById(decoded.userId);

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Obtener estadísticas detalladas
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Estadísticas básicas
    const total = await Notification.countDocuments();
    const unread = await Notification.countDocuments({ isRead: false });
    const recent = await Notification.countDocuments({ 
      createdAt: { $gte: oneDayAgo } 
    });

    // Contar notificaciones expiradas (que ya se eliminaron automáticamente)
    const expired = await Notification.countDocuments({
      expiresAt: { $lt: now }
    });

    // Estadísticas por tipo
    const byTypeStats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const byType = {
      event_upcoming: 0,
      event_registration_open: 0,
      event_reminder: 0,
      membership_update: 0,
      system_announcement: 0
    };

    byTypeStats.forEach(stat => {
      if (Object.prototype.hasOwnProperty.call(byType, stat._id)) {
        byType[stat._id as keyof typeof byType] = stat.count;
      }
    });

    // Estadísticas por prioridad
    const byPriorityStats = await Notification.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const byPriority = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };

    byPriorityStats.forEach(stat => {
      if (Object.prototype.hasOwnProperty.call(byPriority, stat._id)) {
        byPriority[stat._id as keyof typeof byPriority] = stat.count;
      }
    });

    // Estadísticas adicionales
    const topUsers = await Notification.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          userId: '$_id',
          count: 1,
          unreadCount: 1,
          userName: { $arrayElemAt: ['$user.name', 0] },
          userEmail: { $arrayElemAt: ['$user.email', 0] }
        }
      }
    ]);

    const stats = {
      total,
      unread,
      recent,
      expired,
      byType,
      byPriority,
      topUsers,
      lastGeneration: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting notification stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
