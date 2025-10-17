import { NextRequest } from 'next/server';
import { JWTPayload } from './auth-utils';

/**
 * Sistema de autorización basado en roles
 * 
 * Proporciona funciones centralizadas para verificar permisos
 * en toda la aplicación.
 */

// Roles del sistema
export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

// Permisos por rol
export const ROLE_PERMISSIONS = {
  [UserRole.SUPERADMIN]: [
    'users:read',
    'users:write',
    'users:delete',
    'admin:access',
    'events:manage',
    'memberships:manage',
    'reports:view',
    'settings:manage',
    'roles:manage',
  ],
  [UserRole.ADMIN]: [
    'users:read',
    'users:write',
    'admin:access',
    'events:manage',
    'memberships:manage',
    'reports:view',
  ],
  [UserRole.MEMBER]: [
    'profile:read',
    'profile:write',
    'events:view',
    'events:register',
  ],
  [UserRole.GUEST]: [
    'events:view',
  ],
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: string, permission: string): boolean {
  const roleEnum = role as UserRole;
  const permissions = ROLE_PERMISSIONS[roleEnum] || [];
  return permissions.includes(permission);
}

/**
 * Verifica si un usuario es administrador
 */
export function isAdmin(user: JWTPayload | null | undefined): boolean {
  if (!user) return false;
  return user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN;
}

/**
 * Verifica si un usuario es superadministrador
 */
export function isSuperAdmin(user: JWTPayload | null | undefined): boolean {
  if (!user) return false;
  return user.role === UserRole.SUPERADMIN;
}

/**
 * Verifica si un usuario puede acceder a un recurso
 */
export function canAccess(user: JWTPayload | null | undefined, permission: string): boolean {
  if (!user) return false;
  return hasPermission(user.role, permission);
}

/**
 * Verifica si un usuario puede modificar otro usuario
 */
export function canModifyUser(
  requestingUser: JWTPayload,
  targetUserId: string
): boolean {
  // Los usuarios pueden modificarse a sí mismos
  if (requestingUser.userId === targetUserId) {
    return true;
  }

  // Los administradores pueden modificar a cualquiera
  return isAdmin(requestingUser);
}

/**
 * Verifica si un usuario puede eliminar otro usuario
 */
export function canDeleteUser(
  requestingUser: JWTPayload,
  targetUserId: string
): boolean {
  // Los usuarios no pueden eliminarse a sí mismos
  if (requestingUser.userId === targetUserId) {
    return false;
  }

  // Solo superadmin puede eliminar usuarios
  return isSuperAdmin(requestingUser);
}

/**
 * Obtiene el nivel de acceso de un rol (para comparaciones)
 */
export function getRoleLevel(role: string): number {
  const levels: Record<UserRole, number> = {
    [UserRole.SUPERADMIN]: 4,
    [UserRole.ADMIN]: 3,
    [UserRole.MEMBER]: 2,
    [UserRole.GUEST]: 1,
  };
  return levels[role as UserRole] || 0;
}

/**
 * Verifica si un rol tiene mayor jerarquía que otro
 */
export function hasHigherRole(role1: string, role2: string): boolean {
  return getRoleLevel(role1) > getRoleLevel(role2);
}

/**
 * Verifica permisos para operaciones CRUD en recursos
 */
export interface ResourcePermissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

/**
 * Obtiene permisos para un recurso específico
 */
export function getResourcePermissions(
  user: JWTPayload | null | undefined,
  resourceType: 'users' | 'events' | 'memberships' | 'reports' | 'settings'
): ResourcePermissions {
  if (!user) {
    return {
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    };
  }

  const roleLevel = getRoleLevel(user.role);

  switch (resourceType) {
    case 'users':
      return {
        canRead: roleLevel >= getRoleLevel(UserRole.ADMIN),
        canCreate: roleLevel >= getRoleLevel(UserRole.ADMIN),
        canUpdate: roleLevel >= getRoleLevel(UserRole.ADMIN),
        canDelete: roleLevel >= getRoleLevel(UserRole.SUPERADMIN),
      };

    case 'events':
      return {
        canRead: roleLevel >= getRoleLevel(UserRole.MEMBER),
        canCreate: roleLevel >= getRoleLevel(UserRole.ADMIN),
        canUpdate: roleLevel >= getRoleLevel(UserRole.ADMIN),
        canDelete: roleLevel >= getRoleLevel(UserRole.ADMIN),
      };

    case 'memberships':
      return {
        canRead: roleLevel >= getRoleLevel(UserRole.MEMBER),
        canCreate: roleLevel >= getRoleLevel(UserRole.ADMIN),
        canUpdate: roleLevel >= getRoleLevel(UserRole.ADMIN),
        canDelete: roleLevel >= getRoleLevel(UserRole.SUPERADMIN),
      };

    case 'reports':
      return {
        canRead: roleLevel >= getRoleLevel(UserRole.ADMIN),
        canCreate: roleLevel >= getRoleLevel(UserRole.ADMIN),
        canUpdate: roleLevel >= getRoleLevel(UserRole.ADMIN),
        canDelete: roleLevel >= getRoleLevel(UserRole.SUPERADMIN),
      };

    case 'settings':
      return {
        canRead: roleLevel >= getRoleLevel(UserRole.ADMIN),
        canCreate: roleLevel >= getRoleLevel(UserRole.SUPERADMIN),
        canUpdate: roleLevel >= getRoleLevel(UserRole.SUPERADMIN),
        canDelete: roleLevel >= getRoleLevel(UserRole.SUPERADMIN),
      };

    default:
      return {
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      };
  }
}

/**
 * Middleware helper para validar permisos de recurso
 */
export function requireResourcePermission(
  user: JWTPayload | null | undefined,
  resourceType: 'users' | 'events' | 'memberships' | 'reports' | 'settings',
  operation: 'read' | 'create' | 'update' | 'delete'
): boolean {
  const permissions = getResourcePermissions(user, resourceType);

  switch (operation) {
    case 'read':
      return permissions.canRead;
    case 'create':
      return permissions.canCreate;
    case 'update':
      return permissions.canUpdate;
    case 'delete':
      return permissions.canDelete;
    default:
      return false;
  }
}

/**
 * Formatea mensajes de error de permisos
 */
export function getPermissionErrorMessage(
  resourceType: string,
  operation: string
): string {
  return `No tienes permisos para ${operation} ${resourceType}. Contacta a un administrador si necesitas acceso.`;
}
