import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verificar autenticación y permisos de admin
    const cookieStore = await cookies();
    const token = cookieStore.get('bsk-access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    const adminUser = await User.findById(decoded.userId);

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Construir filtros
    const filters: any = {};

    if (type) filters.type = type;
    if (priority) filters.priority = priority;
    if (userId) filters.userId = userId;

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Obtener notificaciones con información del usuario
    const notifications = await Notification.aggregate([
      { $match: filters },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          type: 1,
          priority: 1,
          title: 1,
          message: 1,
          isRead: 1,
          createdAt: 1,
          expiresAt: 1,
          metadata: 1,
          userName: { $arrayElemAt: ['$user.name', 0] },
          userEmail: { $arrayElemAt: ['$user.email', 0] }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Contar total para paginación
    const total = await Notification.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    // Estadísticas de la consulta actual
    const queryStats = await Notification.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          byType: {
            $push: '$type'
          },
          byPriority: {
            $push: '$priority'
          }
        }
      }
    ]);

    const stats = queryStats[0] || {
      total: 0,
      unread: 0,
      byType: [],
      byPriority: []
    };

    // Contar por tipo y prioridad
    const typeCounts = stats.byType.reduce((acc: any, type: string) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const priorityCounts = stats.byPriority.reduce((acc: any, priority: string) => {
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        type,
        priority,
        userId,
        startDate,
        endDate
      },
      stats: {
        total: stats.total,
        unread: stats.unread,
        byType: typeCounts,
        byPriority: priorityCounts
      }
    });

  } catch (error) {
    console.error('Error getting notification history:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
