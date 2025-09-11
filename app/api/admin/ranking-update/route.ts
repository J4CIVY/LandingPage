import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import RankingUpdateService from '@/lib/services/RankingUpdateService';
import User from '@/lib/models/User';
import connectDB from '@/lib/mongodb';

interface JWTPayload {
  userId: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Verificar que el usuario sea administrador
    await connectDB();
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Acceso denegado. Solo administradores pueden realizar esta acción.' },
        { status: 403 }
      );
    }

    // Obtener el servicio de actualización de rankings
    const rankingService = RankingUpdateService.getInstance();
    
    // Realizar actualización manual
    const result = await rankingService.manualRankingUpdate();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          stats: result.stats,
          updatedAt: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error updating rankings manually:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET!);

    // Obtener estadísticas generales del ranking
    const rankingService = RankingUpdateService.getInstance();
    const stats = await rankingService.getRankingStats();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        lastChecked: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error getting ranking stats:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}