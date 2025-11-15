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

// Prevent prerendering - this route needs request data
export const dynamic = 'force-dynamic';

// Función auxiliar para verificar autenticación de admin
async function verifyAdminAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('bsk-access-token')?.value;
    
    if (!token) {
      return { success: false, error: 'Token de acceso requerido', status: HTTP_STATUS.UNAUTHORIZED };
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-change-in-production';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !['admin', 'super-admin'].includes(user.role)) {
      return { success: false, error: 'Acceso denegado', status: HTTP_STATUS.FORBIDDEN };
    }

    return { success: true, user };
  } catch {
    return { success: false, error: 'Token inválido', status: HTTP_STATUS.UNAUTHORIZED };
  }
}

/**
 * PATCH /api/admin/memberships/[id]/approve
 * Aprueba una solicitud de membresía
 */
async function handlePatch(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar autenticación de administrador
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return createErrorResponse(authResult.error!, authResult.status!);
  }

  const { id } = await params;

  await connectDB();
  
  try {
    const body = await request.json();
    
    const application = await MembershipApplication.findById(id);
    if (!application) {
      return createErrorResponse('Solicitud de membresía no encontrada', HTTP_STATUS.NOT_FOUND);
    }
    
    if (application.status === 'approved') {
      return createErrorResponse('La solicitud ya ha sido aprobada', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Generar número de membresía si no existe
    let membershipNumber = application.membershipNumber;
    if (!membershipNumber) {
      const year = new Date().getFullYear().toString().slice(-2);
      const lastMember = await MembershipApplication.findOne({ membershipNumber: { $exists: true } })
        .sort({ membershipNumber: -1 })
        .limit(1);
      
      let nextNumber = 1;
      if (lastMember?.membershipNumber) {
        const lastNumber = parseInt(lastMember.membershipNumber.split('-')[1] || '0');
        nextNumber = lastNumber + 1;
      }
      
      membershipNumber = `BSK-${year}-${nextNumber.toString().padStart(4, '0')}`;
    }
    
    const updatedApplication = await MembershipApplication.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        reviewedBy: authResult.user._id,
        reviewedByName: `${authResult.user.firstName} ${authResult.user.lastName}`,
        reviewDate: new Date(),
        approvalNotes: body.approvalNotes?.trim(),
        membershipNumber,
        membershipStartDate: body.membershipStartDate || new Date()
      },
      { new: true, runValidators: true }
    )
      .populate('reviewedBy', 'firstName lastName email')
      .populate('referredByMember', 'firstName lastName email')
      .exec();
    
    return createSuccessResponse({
      application: updatedApplication,
      message: 'Solicitud de membresía aprobada exitosamente'
    });
    
  } catch (error) {
    console.error('Error approving membership application:', error);
    return createErrorResponse('Error al aprobar la solicitud de membresía', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Exportar el handler con manejo de errores
export const PATCH = withErrorHandling(handlePatch);
