import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MembershipHistory from '@/lib/models/MembershipHistory';
import { verifyAuth } from '@/lib/auth-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';

// GET /api/membership/history - Obtener historial de membresías del usuario
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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const membershipType = searchParams.get('membershipType');

    // Construir filtros
    const filters: any = { userId: user.id };

    if (status) {
      filters.status = status;
    }

    if (membershipType) {
      filters.membershipType = membershipType;
    }

    // Calcular offset
    const skip = (page - 1) * limit;

    // Obtener historial
    const [history, total] = await Promise.all([
      MembershipHistory.find(filters)
        .populate('createdBy', 'firstName lastName')
        .populate('cancelledBy', 'firstName lastName')
        .populate('suspendedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MembershipHistory.countDocuments(filters)
    ]);

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: history,
      pagination: {
        current: page,
        total: totalPages,
        count: total,
        hasNext: hasNextPage,
        hasPrev: hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching membership history:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/membership/history - Crear entrada de historial (solo admin)
export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    await connectDB();
    
    // Autenticar usuario y verificar rol de admin
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado: se requieren permisos de administrador' },
        { status: 403 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const membershipData = await request.json();

    // Crear nueva entrada en el historial
    const newMembershipHistory = new MembershipHistory({
      ...membershipData,
      createdBy: authResult.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newMembershipHistory.save();

    return NextResponse.json({
      success: true,
      data: newMembershipHistory
    });

  } catch (error) {
    console.error('Error creating membership history:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}