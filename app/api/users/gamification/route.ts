import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth-utils';

// GET /api/users/gamification - Obtener datos de gamificación del usuario
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Autenticar usuario
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    
    // Buscar datos del usuario
    const userDetails = await User.findById(user.id)
      .select('firstName lastName membershipType joinDate');

    if (!userDetails) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Calcular estadísticas de gamificación
    const joinDate = userDetails.joinDate ? new Date(userDetails.joinDate) : new Date();
    const now = new Date();
    const daysSinceJoining = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Datos de gamificación simulados (se pueden reemplazar con datos reales)
    const gamificationData = {
      level: Math.min(Math.floor(daysSinceJoining / 30) + 1, 10), // Nivel basado en días
      points: daysSinceJoining * 10, // 10 puntos por día
      badges: [
        {
          id: 'member',
          name: 'Miembro',
          description: 'Te uniste a BSK Motorcycle Team',
          earnedAt: joinDate.toISOString(),
          icon: 'FaUser'
        }
      ],
      achievements: [
        {
          id: 'first_week',
          name: 'Primera Semana',
          description: 'Completaste tu primera semana como miembro',
          progress: Math.min((daysSinceJoining / 7) * 100, 100),
          completed: daysSinceJoining >= 7,
          earnedAt: daysSinceJoining >= 7 ? new Date(joinDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
        },
        {
          id: 'first_month',
          name: 'Primer Mes',
          description: 'Completaste tu primer mes como miembro',
          progress: Math.min((daysSinceJoining / 30) * 100, 100),
          completed: daysSinceJoining >= 30,
          earnedAt: daysSinceJoining >= 30 ? new Date(joinDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
        }
      ],
      stats: {
        totalDays: daysSinceJoining,
        eventsAttended: 0, // TODO: Calcular desde eventos reales
        eventRegistrations: 0, // TODO: Calcular desde registraciones reales
        loyaltyScore: Math.min(daysSinceJoining * 2, 1000) // Máximo 1000 puntos de lealtad
      },
      nextLevelProgress: {
        currentLevel: Math.min(Math.floor(daysSinceJoining / 30) + 1, 10),
        nextLevel: Math.min(Math.floor(daysSinceJoining / 30) + 2, 10),
        daysToNextLevel: 30 - (daysSinceJoining % 30),
        progressPercentage: (daysSinceJoining % 30) / 30 * 100
      }
    };

    return NextResponse.json({
      success: true,
      data: gamificationData
    });

  } catch (error) {
    console.error('Error fetching gamification data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/users/gamification - Actualizar puntos de gamificación (para acciones específicas)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Autenticar usuario
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { action, points } = await request.json();
    
    // Validar datos de entrada
    if (!action || typeof points !== 'number') {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Aquí se podría implementar la lógica para actualizar puntos en la base de datos
    // Por ahora retornamos un éxito simple
    
    return NextResponse.json({
      success: true,
      message: `Puntos actualizados por acción: ${action}`,
      pointsAdded: points
    });

  } catch (error) {
    console.error('Error updating gamification:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}