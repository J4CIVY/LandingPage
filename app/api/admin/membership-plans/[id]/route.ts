import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { requireCSRFToken } from '@/lib/csrf-protection';
import Membership from '@/lib/models/Membership';
import { updateMembershipSchema } from '@/lib/validation-schemas';
import { verifyAuth } from '@/lib/auth-utils';

// GET - Obtener una membresía específica
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    // Verificar si el ID es válido
    if (!id || id.length !== 24) {
      return NextResponse.json({
        success: false,
        message: 'ID de membresía inválido'
      }, { status: 400 });
    }

    const membership = await Membership.findById(id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .lean();

    if (!membership) {
      return NextResponse.json({
        success: false,
        message: 'Membresía no encontrada'
      }, { status: 404 });
    }

    // Verificar permisos de visualización
    const authResult = await verifyAuth(request);
    const isAdmin = authResult.success && authResult.user?.role === 'admin';

    // Si no es admin y la membresía no es pública, denegar acceso
    if (!isAdmin && (!(membership as any).display?.showInPublic || (membership as any).status !== 'active')) {
      return NextResponse.json({
        success: false,
        message: 'Membresía no disponible'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: membership
    });

  } catch (error) {
    console.error('Error fetching membership:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener la membresía',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// PUT - Actualizar una membresía (solo admins)
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  // SECURITY: CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;
  
  try {
    // Verificar autenticación y permisos de admin
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: 'No autorizado'
      }, { status: 401 });
    }

    if (authResult.user?.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Se requieren permisos de administrador'
      }, { status: 403 });
    }

    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();

    // Verificar si el ID es válido
    if (!id || id.length !== 24) {
      return NextResponse.json({
        success: false,
        message: 'ID de membresía inválido'
      }, { status: 400 });
    }

    // Validar datos de entrada
    const validatedData = updateMembershipSchema.parse({ ...body, id });

    // Verificar que la membresía existe
    const existingMembership = await Membership.findById(id);
    if (!existingMembership) {
      return NextResponse.json({
        success: false,
        message: 'Membresía no encontrada'
      }, { status: 404 });
    }

    // Si se está actualizando el slug, verificar que sea único
    if (validatedData.slug && validatedData.slug !== existingMembership.slug) {
      const conflictingMembership = await Membership.findOne({ 
        slug: validatedData.slug,
        _id: { $ne: id }
      });
      
      if (conflictingMembership) {
        return NextResponse.json({
          success: false,
          message: 'El slug ya existe. Por favor, elige uno diferente.'
        }, { status: 400 });
      }
    }

    // Actualizar la membresía
    const updatedMembership = await Membership.findByIdAndUpdate(
      id,
      {
        ...validatedData,
        lastModifiedBy: authResult.user.id,
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name email')
     .populate('lastModifiedBy', 'name email');

    return NextResponse.json({
      success: true,
      data: updatedMembership,
      message: 'Plan de membresía actualizado exitosamente'
    });

  } catch (error: any) {
    console.error('Error updating membership:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors
      }, { status: 400 });
    }

    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: 'El slug ya existe. Por favor, elige uno diferente.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Error al actualizar el plan de membresía',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE - Eliminar una membresía (solo admins)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // SECURITY: CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;
  
  try {
    // Verificar autenticación y permisos de admin
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: 'No autorizado'
      }, { status: 401 });
    }

    if (authResult.user?.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Se requieren permisos de administrador'
      }, { status: 403 });
    }

    await connectToDatabase();

    const { id } = await params;    // Verificar si el ID es válido
    if (!id || id.length !== 24) {
      return NextResponse.json({
        success: false,
        message: 'ID de membresía inválido'
      }, { status: 400 });
    }

    // Verificar que la membresía existe
    const membership = await Membership.findById(id);
    if (!membership) {
      return NextResponse.json({
        success: false,
        message: 'Membresía no encontrada'
      }, { status: 404 });
    }

    // TODO: Verificar si hay usuarios activos con esta membresía
    // const activeMembers = await User.countDocuments({ membershipType: membership.slug });
    // if (activeMembers > 0) {
    //   return NextResponse.json({
    //     success: false,
    //     message: `No se puede eliminar la membresía. Hay ${activeMembers} miembros activos usando este plan.`
    //   }, { status: 400 });
    // }

    // En lugar de eliminar completamente, marcar como archivada
    const archivedMembership = await Membership.findByIdAndUpdate(
      id,
      {
        status: 'archived',
        lastModifiedBy: authResult.user.id,
        updatedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: archivedMembership,
      message: 'Plan de membresía archivado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting membership:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al eliminar el plan de membresía',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}