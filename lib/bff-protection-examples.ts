/**
 * Script de protección masiva de rutas API
 * 
 * Este archivo contiene ejemplos de cómo proteger diferentes tipos de rutas
 * usando el sistema BFF implementado.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiProtection, withAdminProtection, ApiAuthContext } from '@/lib/api-auth-middleware';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { requireResourcePermission } from '@/lib/authorization';

// =============================================================================
// EJEMPLO 1: Ruta pública (solo requiere API Key)
// =============================================================================
// Para rutas como /api/auth/login, /api/auth/register
// Estas rutas NO están protegidas por defecto en el middleware
// porque están en la lista PUBLIC_ROUTES

export async function examplePublicRoute(request: NextRequest) {
  // Esta ruta NO necesita protección adicional
  // El middleware permite acceso con solo API Key válida
  
  return NextResponse.json({ message: 'Ruta pública accesible' });
}

// =============================================================================
// EJEMPLO 2: Ruta protegida (requiere autenticación)
// =============================================================================
// Para rutas que solo usuarios autenticados pueden acceder

export const exampleProtectedRoute = withApiProtection(
  async (request: NextRequest, context: ApiAuthContext) => {
    // context.user contiene la información del usuario autenticado
    // context.authenticated es true
    
    return createSuccessResponse({
      userId: context.user?.userId,
      email: context.user?.email,
      message: 'Datos del usuario autenticado',
    });
  }
);

// =============================================================================
// EJEMPLO 3: Ruta admin (solo administradores)
// =============================================================================
// Para rutas como /api/users, /api/admin/*

export const exampleAdminRoute = withAdminProtection(
  async (request: NextRequest, context: ApiAuthContext) => {
    // Solo administradores llegan aquí
    // context.isAdmin es true
    
    return createSuccessResponse({
      message: 'Solo administradores pueden ver esto',
      admin: context.user?.email,
    });
  }
);

// =============================================================================
// EJEMPLO 4: Ruta con permisos específicos
// =============================================================================
// Para rutas que necesitan verificar permisos específicos sobre recursos

export const exampleResourceRoute = withApiProtection(
  async (request: NextRequest, context: ApiAuthContext) => {
    // Verificar permiso específico
    if (!requireResourcePermission(context.user, 'events', 'create')) {
      return createErrorResponse('No tienes permisos para crear eventos', 403);
    }
    
    // Procesar la creación del evento
    return createSuccessResponse({ message: 'Evento creado' });
  }
);

// =============================================================================
// EJEMPLO 5: Diferentes handlers para GET/POST/PUT/DELETE
// =============================================================================

const handleGet = withApiProtection(
  async (request: NextRequest, context: ApiAuthContext) => {
    // Cualquier usuario autenticado puede leer
    return createSuccessResponse({ message: 'Datos leídos' });
  }
);

const handlePost = withAdminProtection(
  async (request: NextRequest, context: ApiAuthContext) => {
    // Solo admin puede crear
    return createSuccessResponse({ message: 'Recurso creado' });
  }
);

const handleDelete = withAdminProtection(
  async (request: NextRequest, context: ApiAuthContext) => {
    // Verificar permiso específico de eliminación
    if (!requireResourcePermission(context.user, 'users', 'delete')) {
      return createErrorResponse('Solo superadmin puede eliminar', 403);
    }
    
    return createSuccessResponse({ message: 'Recurso eliminado' });
  }
);

export { handleGet as GET, handlePost as POST, handleDelete as DELETE };

// =============================================================================
// EJEMPLO 6: Migración de ruta existente
// =============================================================================

// ANTES:
/*
export async function GET(request: NextRequest) {
  await connectDB();
  const users = await User.find({});
  return NextResponse.json({ users });
}
*/

// DESPUÉS:
/*
export const GET = withAdminProtection(
  async (request: NextRequest, context: ApiAuthContext) => {
    // Verificar permisos
    if (!requireResourcePermission(context.user, 'users', 'read')) {
      return createErrorResponse('Sin permisos para ver usuarios', 403);
    }
    
    await connectDB();
    const users = await User.find({});
    return createSuccessResponse({ users });
  }
);
*/

// =============================================================================
// EJEMPLO 7: Ruta con parámetros dinámicos
// =============================================================================

interface RouteContext {
  params: {
    id: string;
  };
}

export const exampleDynamicRoute = withApiProtection(
  async (
    request: NextRequest,
    context: ApiAuthContext,
    routeContext: RouteContext
  ) => {
    const { id } = routeContext.params;
    
    // Verificar que el usuario solo pueda acceder a sus propios recursos
    // o que sea admin
    if (context.user?.userId !== id && !context.isAdmin) {
      return createErrorResponse('No puedes acceder a este recurso', 403);
    }
    
    return createSuccessResponse({
      message: `Acceso a recurso ${id}`,
    });
  }
);

// =============================================================================
// CHECKLIST PARA PROTEGER UNA RUTA
// =============================================================================

/*
1. ¿Es una ruta pública (login, register, etc)?
   - NO agregar protección
   - Asegurarse que esté en PUBLIC_ROUTES en api-auth-middleware.ts

2. ¿Usuarios autenticados deben acceder?
   - Usar withApiProtection()
   - context.user tendrá la info del usuario

3. ¿Solo admin debe acceder?
   - Usar withAdminProtection()
   - Automáticamente bloquea no-admin

4. ¿Necesitas verificar permisos específicos?
   - Usar withApiProtection() + requireResourcePermission()
   - Verificar permisos manualmente en el handler

5. ¿Ruta con parámetros dinámicos?
   - Agregar tipo RouteContext como tercer parámetro
   - Verificar ownership si es necesario

6. ¿Diferentes métodos HTTP?
   - Proteger cada método según sus necesidades
   - GET puede ser menos restrictivo que DELETE
*/
