import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Benefit from '@/lib/models/Benefit';
import { verifyAuth } from '@/lib/auth-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';

// GET /api/benefits/[id] - Obtener un beneficio específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const benefitId = id;

    // Buscar beneficio
    const benefit = await Benefit.findById(benefitId)
      .populate('createdBy', 'firstName lastName');

    if (!benefit) {
      return NextResponse.json(
        { error: 'Beneficio no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el usuario puede acceder a este beneficio
    if (!benefit.membershipTypes.includes(user.membershipType)) {
      return NextResponse.json(
        { error: 'No tienes acceso a este beneficio' },
        { status: 403 }
      );
    }

    // Verificar si el beneficio está activo y visible
    if (!benefit.isVisible || !benefit.isActive) {
      return NextResponse.json(
        { error: 'Beneficio no disponible' },
        { status: 404 }
      );
    }

    // Verificar validez temporal
    if (benefit.isTemporary) {
      const now = new Date();
      const validFrom = benefit.validFrom ? new Date(benefit.validFrom) : new Date(0);
      const validUntil = benefit.validUntil ? new Date(benefit.validUntil) : new Date('2099-12-31');
      
      if (now < validFrom || now > validUntil) {
        return NextResponse.json(
          { error: 'Beneficio no está vigente' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: benefit
    });

  } catch (error) {
    console.error('Error fetching benefit:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/benefits/[id] - Actualizar un beneficio específico (solo admins)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    await connectDB();
    
    // Autenticar usuario y verificar rol de admin
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado: se requieren permisos de administrador' },
        { status: 403 }
      );
    }

    const benefitId = id;
    const updateData = await request.json();

    // Buscar y actualizar el beneficio
    const updatedBenefit = await Benefit.findByIdAndUpdate(
      benefitId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBenefit) {
      return NextResponse.json(
        { error: 'Beneficio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedBenefit
    });

  } catch (error) {
    console.error('Error updating benefit:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/benefits/[id] - Eliminar beneficio (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. CSRF Protection (Security Audit Phase 3)
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
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

    const benefitId = id;

    // Buscar y eliminar beneficio
    const benefit = await Benefit.findByIdAndDelete(benefitId);

    if (!benefit) {
      return NextResponse.json(
        { error: 'Beneficio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Beneficio eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting benefit:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}