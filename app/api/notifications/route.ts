import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Notification from '@/lib/models/Notification';
import { requireCSRFToken } from '@/lib/csrf-protection';


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// GET - Obtener notificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
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
    
    // Construir filtros
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any = { userId: decoded.userId };
    if (unreadOnly) {
      filters.isRead = false;
    }

    // Obtener notificaciones
    const notifications = await Notification.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    // Obtener conteo total
    const totalNotifications = await Notification.countDocuments(filters);
    const totalPages = Math.ceil(totalNotifications / limit);

    // Obtener conteo de no leídas
    const unreadCount = await Notification.countDocuments({ 
      userId: decoded.userId, 
      isRead: false 
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: page,
          total: totalPages,
          limit: limit,
          totalItems: totalNotifications,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Error en GET /api/notifications:', error);
    
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

// PUT - Marcar notificación como leída
export async function PUT(request: NextRequest) {
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

    // Verificar token
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    
    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Marcar todas las notificaciones como leídas
      await Notification.updateMany(
        { userId: decoded.userId, isRead: false },
        { 
          isRead: true, 
          readAt: new Date() 
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas'
      });
    } else if (notificationId) {
      // Marcar una notificación específica como leída
      const notification = await Notification.findOneAndUpdate(
        { 
          _id: notificationId, 
          userId: decoded.userId 
        },
        { 
          isRead: true, 
          readAt: new Date() 
        },
        { new: true }
      );

      if (!notification) {
        return NextResponse.json(
          { success: false, message: 'Notificación no encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Notificación marcada como leída',
        data: { notification }
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Se requiere notificationId o markAllAsRead' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error en PUT /api/notifications:', error);
    
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

// DELETE - Eliminar notificación
export async function DELETE(request: NextRequest) {
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

    // Verificar token
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    
    // Obtener ID de notificación de los parámetros de query
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: 'ID de notificación requerido' },
        { status: 400 }
      );
    }

    // Eliminar notificación
    const deletedNotification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: decoded.userId
    });

    if (!deletedNotification) {
      return NextResponse.json(
        { success: false, message: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notificación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en DELETE /api/notifications:', error);
    
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
