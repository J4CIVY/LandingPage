# 🔒 Guía de Seguridad para APIs - BSK Motorcycle Team

## ⚠️ PROBLEMA CRÍTICO RESUELTO

**Fecha de resolución:** 17 de octubre de 2025  
**Gravedad:** CRÍTICA ⛔  
**Estado:** SOLUCIONADO ✅

### Vulnerabilidad Original
Todos los endpoints de la API (`/api/*`) estaban **expuestos públicamente sin autenticación**, permitiendo que cualquier persona accediera a información sensible de usuarios, eventos y demás datos del sistema simplemente escribiendo la URL.

---

## 🛡️ SOLUCIÓN IMPLEMENTADA

### 1. Middleware Global de Protección de API (`middleware.ts`)

Se implementó un **middleware de seguridad en capas** que intercepta TODAS las peticiones a `/api/*`:

#### ✅ Características:
- **Protección por defecto**: Todos los endpoints requieren autenticación EXCEPTO rutas públicas explícitamente definidas
- **Lista blanca de rutas públicas**: Solo rutas esenciales como login, registro y webhooks son públicas
- **Validación de tokens JWT**: Verifica formato, expiración y firma
- **Control de acceso basado en roles**: Rutas admin requieren permisos específicos
- **Headers de seguridad**: X-User-Id y X-User-Role para uso en endpoints

#### 📋 Rutas Públicas Permitidas (Lista Blanca):
```typescript
const PUBLIC_API_ROUTES = [
  '/api/health',
  '/api/webhooks',
  '/api/captcha',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-email',
  '/api/auth/reset-password',
  '/api/auth/refresh-token',
  '/api/weather/current',
];
```

#### 📋 Rutas que Requieren Admin:
```typescript
const ADMIN_API_ROUTES = [
  '/api/admin',
  '/api/users/stats',
  '/api/notifications/admin',
  '/api/pqrsdf/estadisticas',
];
```

### 2. Sistema de Autenticación Robusto (`lib/api-auth-middleware.ts`)

Se creó un **sistema de autenticación modular y reutilizable** con las siguientes funciones:

#### 🔐 Funciones Principales:

```typescript
// Autenticación básica (cualquier usuario autenticado)
const authContext = await requireAuth(request);

// Requiere rol de administrador
const authContext = await requireAdmin(request);

// Requiere rol de super administrador
const authContext = await requireSuperAdmin(request);

// Requiere rol de líder
const authContext = await requireLeader(request);

// Autenticación personalizada con opciones
const authContext = await authenticateApiRequest(request, {
  requiredRole: UserRole.ADMIN,
  checkSession: true,
  allowSelf: true
});
```

#### 🎯 Características del Sistema:

1. **Validación de JWT con verificación de firma**
2. **Verificación de sesiones activas en base de datos**
3. **Control de acceso basado en roles jerárquicos**
4. **Verificación de cuentas activas**
5. **Auditoría de accesos autorizados y no autorizados**
6. **Helper para verificar acceso a recursos propios**

#### 🏷️ Jerarquía de Roles:

```typescript
SUPER_ADMIN (5) > ADMIN (4) > LEADER (3) > VOLUNTEER (2) > USER (1)
```

---

## 📝 GUÍA DE USO PARA DEVELOPERS

### ✅ Paso 1: Importar el Middleware de Autenticación

```typescript
import { 
  requireAuth,
  requireAdmin,
  requireLeader,
  createAuthErrorResponse,
  canAccessUserResource
} from '@/lib/api-auth-middleware';
```

### ✅ Paso 2: Proteger Endpoints

#### Ejemplo 1: Endpoint que requiere solo autenticación

```typescript
/**
 * GET /api/my-profile
 * 🔒 REQUIERE: Autenticación
 */
export async function GET(request: NextRequest) {
  // Verificar autenticación
  const authContext = await requireAuth(request);
  if (!authContext.isAuthenticated) {
    return createAuthErrorResponse(authContext);
  }

  // Usuario autenticado - proceder con la lógica
  const userId = authContext.user!.id;
  const user = await User.findById(userId);
  
  return NextResponse.json({ success: true, data: user });
}
```

#### Ejemplo 2: Endpoint que requiere rol de Admin

```typescript
/**
 * GET /api/admin/users
 * 🔒 REQUIERE: Autenticación + Rol de ADMIN
 */
export async function GET(request: NextRequest) {
  const authContext = await requireAdmin(request);
  if (!authContext.isAuthenticated) {
    return createAuthErrorResponse(authContext);
  }

  // Admin autenticado - proceder
  const users = await User.find({});
  return NextResponse.json({ success: true, data: users });
}
```

#### Ejemplo 3: Endpoint que permite acceso propio o admin

```typescript
/**
 * GET /api/users/[id]
 * 🔒 REQUIERE: Autenticación + (ser el mismo usuario O ser admin)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authContext = await requireAuth(request);
  if (!authContext.isAuthenticated) {
    return createAuthErrorResponse(authContext);
  }

  const { id } = await params;

  // Verificar permisos: el usuario puede ver su propio perfil O es admin
  if (!canAccessUserResource(authContext, id, true)) {
    return createErrorResponse(
      'No tienes permiso para acceder a esta información',
      HTTP_STATUS.FORBIDDEN
    );
  }

  // Proceder con la lógica
  const user = await User.findById(id);
  return NextResponse.json({ success: true, data: user });
}
```

---

## 🚨 CHECKLIST DE SEGURIDAD PARA NUEVOS ENDPOINTS

Antes de crear o modificar un endpoint, verifica:

- [ ] **¿El endpoint maneja datos sensibles?** → Agregar autenticación
- [ ] **¿Requiere permisos especiales?** → Usar `requireAdmin` o `requireLeader`
- [ ] **¿Permite acceso a recursos de usuarios?** → Usar `canAccessUserResource`
- [ ] **¿Es un endpoint público?** → Agregarlo a `PUBLIC_API_ROUTES` en `middleware.ts`
- [ ] **¿Requiere protección CSRF?** → Llamar `requireCSRFToken(request)`
- [ ] **¿Tiene rate limiting?** → Implementar `checkRateLimit`
- [ ] **¿Registra actividad?** → Usar `logActivity` para auditoría

---

## 📊 ENDPOINTS ACTUALIZADOS

### ✅ Ya Protegidos:

1. **`/api/users`** (GET) - Requiere ADMIN
2. **`/api/users`** (POST) - Público con protecciones (CSRF, reCAPTCHA, rate limit)
3. **`/api/users/[id]`** (GET) - Requiere autenticación + acceso propio o admin
4. **`/api/events`** (GET) - Requiere autenticación
5. **`/api/events`** (POST) - Requiere ADMIN

### ⚠️ Pendientes de Revisar (330 endpoints totales):

Los siguientes endpoints **deben ser revisados y protegidos**:

- `/api/users/stats`
- `/api/users/weekly-activity`
- `/api/users/achievements`
- `/api/users/points`
- `/api/users/profile`
- `/api/users/membership`
- `/api/users/leaderboard`
- `/api/users/history`
- `/api/notifications`
- `/api/membership/*`
- `/api/products/[id]`
- `/api/pqrsdf/*`
- Y muchos más...

---

## 🔍 AUDITORÍA DE SEGURIDAD

### Sistema de Logging Implementado

Todos los intentos de acceso no autorizados se registran automáticamente con:

- Endpoint solicitado
- Método HTTP
- Razón del rechazo
- IP del cliente
- User-Agent
- Timestamp
- Usuario (si está disponible)

### Consultar Logs de Accesos No Autorizados:

```typescript
// En la base de datos, buscar:
db.activitylogs.find({ type: 'unauthorized_api_access' })
  .sort({ createdAt: -1 })
  .limit(100);
```

---

## 🎯 PRÓXIMOS PASOS

### 1. **Proteger Endpoints Restantes** (URGENTE)
   - Revisar los 330+ endpoints de la API
   - Aplicar autenticación según el nivel de sensibilidad
   - Prioridad: `/api/users/*`, `/api/admin/*`, `/api/membership/*`

### 2. **Implementar Rate Limiting Específico**
   - Límites más estrictos para endpoints sensibles
   - Límites diferenciados por rol (users vs admins)

### 3. **Mejorar Auditoría**
   - Dashboard de seguridad en el panel de admin
   - Alertas automáticas por intentos sospechosos
   - Reporte semanal de intentos de acceso no autorizados

### 4. **Testing de Seguridad**
   - Pruebas de penetración automatizadas
   - Verificar que endpoints no autorizados devuelvan 401
   - Validar que tokens expirados sean rechazados

---

## 📖 REFERENCIAS

- **Middleware Principal**: `d:\LandingPage\middleware.ts`
- **Sistema de Autenticación**: `d:\LandingPage\lib\api-auth-middleware.ts`
- **Utilidades de Auth**: `d:\LandingPage\lib\auth-utils.ts`
- **Tipos de Respuesta**: `d:\LandingPage\lib\api-utils.ts`

---

## 👥 SOPORTE

Para dudas sobre la implementación de seguridad, contactar al equipo de seguridad.

**Última actualización:** 17 de octubre de 2025  
**Versión:** 2.0.0  
**Autor:** GitHub Copilot & BSK Security Team
