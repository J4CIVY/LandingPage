import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  checkMethod, 
  methodNotAllowed, 
  createSuccessResponse, 
  createErrorResponse,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { db } from '@/lib/database';
import { compatibleUserSchema } from '@/schemas/compatibleUserSchema';

/**
 * GET /api/users
 * Obtiene todos los usuarios registrados
 */
async function handleGet(request: NextRequest) {
  const users = db.getAllUsers();
  
  return createSuccessResponse({
    users,
    total: users.length
  }, 'Usuarios obtenidos exitosamente');
}

/**
 * POST /api/users
 * Registra un nuevo usuario
 */
async function handlePost(request: NextRequest) {
  const validation = await validateRequestBody(request, compatibleUserSchema);
  
  if (!validation.success) {
    return validation.response;
  }

  const userData = validation.data;

  // Verificar si el usuario ya existe
  const existingUser = db.getUserByEmail(userData.email);
  if (existingUser) {
    return createErrorResponse(
      'El usuario ya existe con este email',
      HTTP_STATUS.CONFLICT
    );
  }

  // Crear nuevo usuario
  const newUser = db.createUser({
    ...userData,
    isActive: true,
    membershipType: 'friend' // Membresía por defecto
  });

  return createSuccessResponse(
    {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        membershipType: newUser.membershipType,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    },
    'Usuario registrado exitosamente',
    HTTP_STATUS.CREATED
  );
}

// Handler principal
export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handlePost)(request);
}
