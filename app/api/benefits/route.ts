import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Benefit from '@/lib/models/Benefit';
import { verifyAuth } from '@/lib/auth-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';

// GET /api/benefits - Obtener beneficios disponibles para el usuario
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
    const category = searchParams.get('category');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Construir filtros
    const filters: any = {
      isVisible: true,
      membershipTypes: { $in: [user.membershipType] }
    };

    if (!includeInactive) {
      filters.isActive = true;
    }

    if (category) {
      filters.category = category;
    }

    // Obtener beneficios
    const benefits = await Benefit.find(filters)
      .populate('createdBy', 'firstName lastName')
      .sort({ category: 1, title: 1 })
      .lean();

    // Filtrar beneficios por validez temporal
    const validBenefits = benefits.filter(benefit => {
      if (!benefit.isTemporary) return true;
      
      const now = new Date();
      const validFrom = benefit.validFrom ? new Date(benefit.validFrom) : new Date(0);
      const validUntil = benefit.validUntil ? new Date(benefit.validUntil) : new Date('2099-12-31');
      
      return now >= validFrom && now <= validUntil;
    });

    return NextResponse.json({
      success: true,
      data: validBenefits,
      total: validBenefits.length
    });

  } catch (error) {
    console.error('Error fetching benefits:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/benefits - Crear nuevo beneficio (solo admin)
export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    await connectDB();
    
    // Autenticar usuario y verificar rol de admin
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (user.role !== 'admin' && user.role !== 'super-admin') {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    const benefitData = await request.json();
    
    // Validar datos requeridos
    const {
      title,
      description,
      category,
      membershipTypes,
      redemptionProcess
    } = benefitData;

    if (!title || !description || !category || !membershipTypes || !redemptionProcess) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Crear beneficio
    const benefit = new Benefit({
      ...benefitData,
      createdBy: user.id
    });

    await benefit.save();

    return NextResponse.json({
      success: true,
      data: benefit,
      message: 'Beneficio creado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating benefit:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}