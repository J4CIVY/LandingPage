import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import UserActivity from '@/lib/models/UserActivity';

// GET - Obtener actividades del usuario
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const type = searchParams.get('type'); // Filtrar por tipo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { userId: authResult.session.userId };
    
    if (type && type !== 'all') {
      query.type = type;
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Obtener actividades
    const [activities, total] = await Promise.all([
      UserActivity.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      UserActivity.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        activities: activities.map((activity: any) => ({
          id: activity._id.toString(),
          type: activity.type,
          title: activity.title,
          description: activity.description,
          status: activity.status,
          metadata: activity.metadata,
          date: activity.createdAt.toISOString()
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching user activities:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener actividades' },
      { status: 500 }
    );
  }
}
