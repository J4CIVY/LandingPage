import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import MembershipApplication from '@/lib/models/MembershipApplication';
import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';

// Función auxiliar para verificar autenticación de admin
async function verifyAdminAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('bsk-access-token')?.value;
    
    if (!token) {
      return { success: false, error: 'Token de acceso requerido', status: HTTP_STATUS.UNAUTHORIZED };
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !['admin', 'super-admin'].includes(user.role)) {
      return { success: false, error: 'Acceso denegado', status: HTTP_STATUS.FORBIDDEN };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Token inválido', status: HTTP_STATUS.UNAUTHORIZED };
  }
}

/**
 * GET /api/admin/memberships/[id]
 * Obtiene una aplicación de membresía específica
 */
async function handleGet(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar autenticación de administrador
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return createErrorResponse(authResult.error!, authResult.status!);
  }

  await connectDB();
  
  try {
    const application = await MembershipApplication.findById(params.id)
      .populate('reviewedBy', 'firstName lastName email')
      .populate('referredByMember', 'firstName lastName email')
      .exec();
    
    if (!application) {
      return createErrorResponse('Solicitud de membresía no encontrada', HTTP_STATUS.NOT_FOUND);
    }
    
    return createSuccessResponse({ application });
    
  } catch (error) {
    console.error('Error fetching membership application:', error);
    return createErrorResponse('Error al obtener la solicitud de membresía', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PUT /api/admin/memberships/[id]
 * Actualiza una aplicación de membresía
 */
async function handlePut(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar autenticación de administrador
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return createErrorResponse(authResult.error!, authResult.status!);
  }

  await connectDB();
  
  try {
    const body = await request.json();
    
    const application = await MembershipApplication.findById(params.id);
    if (!application) {
      return createErrorResponse('Solicitud de membresía no encontrada', HTTP_STATUS.NOT_FOUND);
    }
    
    // Campos que se pueden actualizar
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.email !== undefined) updateData.email = body.email.toLowerCase().trim();
    if (body.phone !== undefined) updateData.phone = body.phone.trim();
    if (body.membershipType !== undefined) updateData.membershipType = body.membershipType;
    if (body.message !== undefined) updateData.message = body.message?.trim();
    if (body.age !== undefined) updateData.age = body.age;
    if (body.city !== undefined) updateData.city = body.city?.trim();
    if (body.motorcycleBrand !== undefined) updateData.motorcycleBrand = body.motorcycleBrand?.trim();
    if (body.motorcycleModel !== undefined) updateData.motorcycleModel = body.motorcycleModel?.trim();
    if (body.ridingExperience !== undefined) updateData.ridingExperience = body.ridingExperience;
    if (body.referredBy !== undefined) updateData.referredBy = body.referredBy?.trim();
    
    // Campos de proceso de incorporación
    if (body.orientationCompleted !== undefined) updateData.orientationCompleted = body.orientationCompleted;
    if (body.orientationDate !== undefined) updateData.orientationDate = body.orientationDate;
    if (body.membershipStartDate !== undefined) updateData.membershipStartDate = body.membershipStartDate;
    if (body.membershipNumber !== undefined) updateData.membershipNumber = body.membershipNumber?.trim();
    
    // Notas adicionales
    if (body.approvalNotes !== undefined) updateData.approvalNotes = body.approvalNotes?.trim();
    if (body.rejectionReason !== undefined) updateData.rejectionReason = body.rejectionReason?.trim();
    
    // Si hay cambios en el status, agregar información de revisión
    if (body.status !== undefined && body.status !== application.status) {
      updateData.status = body.status;
      updateData.reviewedBy = authResult.user._id;
      updateData.reviewedByName = `${authResult.user.firstName} ${authResult.user.lastName}`;
      updateData.reviewDate = new Date();
    }
    
    const updatedApplication = await MembershipApplication.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('reviewedBy', 'firstName lastName email')
      .populate('referredByMember', 'firstName lastName email')
      .exec();
    
    return createSuccessResponse({
      application: updatedApplication,
      message: 'Solicitud de membresía actualizada exitosamente'
    });
    
  } catch (error: any) {
    console.error('Error updating membership application:', error);
    
    if (error.code === 11000) {
      return createErrorResponse('Ya existe una solicitud con este email', HTTP_STATUS.CONFLICT);
    }
    
    return createErrorResponse('Error al actualizar la solicitud de membresía', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * DELETE /api/admin/memberships/[id]
 * Elimina una aplicación de membresía
 */
async function handleDelete(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar autenticación de administrador
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return createErrorResponse(authResult.error!, authResult.status!);
  }

  await connectDB();
  
  try {
    const application = await MembershipApplication.findById(params.id);
    if (!application) {
      return createErrorResponse('Solicitud de membresía no encontrada', HTTP_STATUS.NOT_FOUND);
    }
    
    await MembershipApplication.findByIdAndDelete(params.id);
    
    return createSuccessResponse({
      message: 'Solicitud de membresía eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error deleting membership application:', error);
    return createErrorResponse('Error al eliminar la solicitud de membresía', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Exportar los handlers con manejo de errores
export const GET = withErrorHandling(handleGet);
export const PUT = withErrorHandling(handlePut);
export const DELETE = withErrorHandling(handleDelete);
