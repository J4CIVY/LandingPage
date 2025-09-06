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
 * PATCH /api/admin/memberships/[id]/communication
 * Agrega una entrada al historial de comunicación
 */
async function handlePatch(
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
    
    if (!body.type || !body.description?.trim()) {
      return createErrorResponse('El tipo y descripción de comunicación son requeridos', HTTP_STATUS.BAD_REQUEST);
    }
    
    const application = await MembershipApplication.findById(params.id);
    if (!application) {
      return createErrorResponse('Solicitud de membresía no encontrada', HTTP_STATUS.NOT_FOUND);
    }
    
    const communicationEntry = {
      date: new Date(),
      type: body.type,
      description: body.description.trim(),
      performedBy: `${authResult.user.firstName} ${authResult.user.lastName}`
    };
    
    const updatedApplication = await MembershipApplication.findByIdAndUpdate(
      params.id,
      {
        $push: { communicationHistory: communicationEntry }
      },
      { new: true, runValidators: true }
    )
      .populate('reviewedBy', 'firstName lastName email')
      .populate('referredByMember', 'firstName lastName email')
      .exec();
    
    return createSuccessResponse({
      application: updatedApplication,
      message: 'Comunicación agregada exitosamente'
    });
    
  } catch (error) {
    console.error('Error adding communication entry:', error);
    return createErrorResponse('Error al agregar la comunicación', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Exportar el handler con manejo de errores
export const PATCH = withErrorHandling(handlePatch);
