import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verificar autenticación y permisos de admin
    const cookieStore = await cookies();
    const token = cookieStore.get('bsk-access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const adminUser = await User.findById(decoded.userId);

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await request.json();
    const {
      type,
      priority,
      title,
      message,
      targetUsers,
      specificUsers,
      metadata,
      expiresInDays = 30
    } = body;

    // Validar campos requeridos
    if (!type || !priority || !title || !message || !targetUsers) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Determinar usuarios objetivo
    let targetUserIds: string[] = [];

    switch (targetUsers) {
      case 'all':
        const allUsers = await User.find({}, '_id');
        targetUserIds = allUsers.map(user => user._id.toString());
        break;

      case 'active':
        const activeUsers = await User.find(
          { 
            isActive: true,
            lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          },
          '_id'
        );
        targetUserIds = activeUsers.map(user => user._id.toString());
        break;

      case 'premium':
        const premiumUsers = await User.find(
          { membershipType: { $in: ['premium', 'vip'] } },
          '_id'
        );
        targetUserIds = premiumUsers.map(user => user._id.toString());
        break;

      case 'specific':
        if (!specificUsers || !Array.isArray(specificUsers)) {
          return NextResponse.json(
            { error: 'Se requiere lista de usuarios específicos' },
            { status: 400 }
          );
        }
        targetUserIds = specificUsers;
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo de destinatario no válido' },
          { status: 400 }
        );
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron usuarios objetivo' },
        { status: 400 }
      );
    }

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Crear notificaciones para cada usuario
    const notifications = targetUserIds.map(userId => ({
      userId,
      type,
      priority,
      title,
      message,
      metadata: {
        ...metadata,
        createdBy: adminUser._id,
        createdByName: adminUser.name,
        source: 'admin_custom'
      },
      expiresAt,
      isRead: false,
      createdAt: new Date()
    }));

    // Insertar notificaciones en lotes para mejor rendimiento
    const batchSize = 1000;
    let totalCreated = 0;

    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      await Notification.insertMany(batch);
      totalCreated += batch.length;
    }

    // Registrar actividad del admin

    return NextResponse.json({
      success: true,
      created: totalCreated,
      targetUsers: targetUserIds.length,
      type,
      priority,
      expiresAt
    });

  } catch (error) {
    console.error('Error creating admin notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
