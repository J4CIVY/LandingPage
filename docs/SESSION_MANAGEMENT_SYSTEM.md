# Sistema de Gestión de Sesiones Activas

## Descripción General

Se ha implementado un sistema completo de gestión de sesiones activas que permite a los usuarios ver y controlar todas las sesiones activas en diferentes dispositivos desde el dashboard de seguridad.

## Componentes Implementados

### 1. APIs Backend

#### `/api/user/sessions` (GET, DELETE)
- **GET**: Obtiene todas las sesiones activas del usuario autenticado
  - Consulta la colección `Session` en MongoDB
  - Filtra sesiones activas y no expiradas
  - Obtiene geolocalización por IP
  - Identifica el tipo de dispositivo (móvil, tablet, desktop)
  - Marca la sesión actual del usuario

- **DELETE**: Cierra una sesión específica por ID
  - Valida que el usuario no pueda cerrar su sesión actual
  - Desactiva la sesión en la base de datos
  - Retorna confirmación de éxito

#### `/api/user/sessions/terminate-all` (POST)
- Cierra todas las sesiones excepto la actual
- Usa operación bulk de MongoDB para eficiencia
- Retorna el número de sesiones cerradas

### 2. Servicio de Geolocalización

**Archivo**: `/lib/services/geolocation.ts`

- Utiliza el API gratuito de `ip-api.com`
- Maneja IPs locales con ubicación por defecto
- Timeout de 5 segundos para evitar bloqueos
- Manejo de errores robusto con fallback a ubicación por defecto

### 3. Componente Frontend

**Archivo**: `/components/dashboard/security/SessionManagementSection.tsx`

Características:
- Carga automática de sesiones desde la API
- Indicador de carga mientras se obtienen datos
- Visualización de información detallada por sesión:
  - Tipo y nombre del dispositivo
  - Navegador y sistema operativo
  - Ubicación geográfica
  - Dirección IP
  - Última actividad
  - Indicador de sesión actual

- Acciones disponibles:
  - Cerrar sesión individual (con confirmación)
  - Cerrar todas las demás sesiones (con confirmación)
  - Toast notifications para feedback

- Diseño responsive con iconos apropiados por tipo de dispositivo
- Dark mode compatible

### 4. Actualización del Sistema de Autenticación

**Archivo**: `/lib/auth-utils.ts`

Se actualizó la interfaz `AuthResult` para incluir:
```typescript
interface AuthResult {
  success: boolean;
  isValid: boolean;
  session?: {
    userId: string;
    sessionId: string;
  };
  user?: {
    id: string;
    email: string;
    membershipType: string;
    role: string;
  };
  error?: string;
}
```

Esto permite que las APIs accedan a la información de sesión necesaria para las operaciones.

## Modelo de Datos

### Colección `Session`

```typescript
interface ISession {
  userId: ObjectId;           // Referencia al usuario
  sessionToken: string;       // Token único de sesión
  refreshToken: string;       // Token de refresco
  deviceInfo: {
    userAgent?: string;       // User agent del navegador
    ip?: string;              // Dirección IP
    device?: string;          // Nombre del dispositivo
    browser?: string;         // Navegador
    os?: string;              // Sistema operativo
  };
  isActive: boolean;          // Estado de la sesión
  expiresAt: Date;           // Fecha de expiración
  lastUsed: Date;            // Última actividad
  createdAt: Date;           // Fecha de creación
  updatedAt: Date;           // Última actualización
}
```

## Flujo de Funcionamiento

### Carga de Sesiones

1. El componente se monta y llama a `/api/user/sessions`
2. La API verifica la autenticación del usuario
3. Consulta todas las sesiones activas del usuario en MongoDB
4. Para cada sesión:
   - Determina el tipo de dispositivo
   - Obtiene geolocalización por IP
   - Formatea la información
5. Retorna array de sesiones con toda la información
6. El componente muestra las sesiones ordenadas por última actividad

### Cerrar Sesión Individual

1. Usuario hace clic en "Cerrar sesión" de una sesión específica
2. Aparece modal de confirmación
3. Al confirmar, se llama a DELETE `/api/user/sessions?sessionId=XXX`
4. La API valida que no sea la sesión actual
5. Desactiva la sesión en la base de datos
6. El componente recarga las sesiones
7. Muestra toast de confirmación

### Cerrar Todas las Sesiones

1. Usuario hace clic en "Cerrar todas las demás"
2. Aparece modal de confirmación mostrando cantidad a cerrar
3. Al confirmar, se llama a POST `/api/user/sessions/terminate-all`
4. La API desactiva todas las sesiones excepto la actual
5. Retorna el número de sesiones cerradas
6. El componente recarga las sesiones
7. Muestra toast con el número de sesiones cerradas

## Seguridad

### Validaciones Implementadas

1. **Autenticación requerida**: Todas las APIs verifican token JWT válido
2. **Protección de sesión actual**: No se permite cerrar la sesión activa
3. **Aislamiento de usuarios**: Solo se muestran sesiones del usuario autenticado
4. **Validación de permisos**: Solo el propietario puede cerrar sus sesiones

### Rate Limiting

El sistema de login ya tiene rate limiting implementado (5 intentos cada 15 minutos)

### Índices de Base de Datos

- `userId + isActive`: Para consultas rápidas de sesiones activas
- `expiresAt`: TTL index para auto-eliminación de sesiones expiradas
- `lastUsed`: Para ordenamiento eficiente

## Mejoras Futuras

### Sugerencias de Implementación

1. **Geolocalización mejorada**:
   - Cachear resultados de geolocalización por IP
   - Usar servicios más precisos (GeoIP2, MaxMind)
   - Guardar ubicación en la sesión al crearla

2. **Notificaciones**:
   - Email cuando se detecta login desde nuevo dispositivo
   - WhatsApp para actividad sospechosa
   - Alertas en tiempo real con WebSockets

3. **Análisis de seguridad**:
   - Detectar patrones sospechosos (múltiples IPs simultáneas)
   - Historial de sesiones cerradas
   - Alertas de cambios de ubicación rápidos

4. **UI/UX**:
   - Auto-refresh cada X segundos
   - Mapa con ubicaciones de sesiones
   - Timeline de actividad por sesión

5. **Optimizaciones**:
   - Cachear lista de sesiones en Redis
   - Paginación para usuarios con muchas sesiones
   - Batch processing para geolocalización

## Testing

### Casos de Prueba Recomendados

1. **Carga de sesiones**:
   - Usuario con múltiples sesiones activas
   - Usuario con solo sesión actual
   - Usuario sin sesiones (caso edge)

2. **Cerrar sesión**:
   - Cerrar sesión válida de otro dispositivo
   - Intentar cerrar sesión actual (debe fallar)
   - Intentar cerrar sesión de otro usuario (debe fallar)

3. **Cerrar todas**:
   - Con múltiples sesiones
   - Con solo sesión actual (no debe cerrar nada)

4. **Geolocalización**:
   - IPs públicas válidas
   - IPs locales (192.168.x.x, 127.0.0.1)
   - IPs inválidas o servicios caídos

5. **Detección de dispositivos**:
   - Desktop (Chrome, Firefox, Safari)
   - Mobile (iOS, Android)
   - Tablet (iPad, Android tablet)

## Integración con Login

El sistema de login existente (`/app/api/auth/login/route.ts`) ya crea sesiones correctamente con:
- Información del dispositivo extraída del user agent
- Token de sesión único
- Refresh token
- Fecha de expiración
- Límite de 5 sesiones activas por usuario

No se requieren cambios en el flujo de login.

## Conclusión

El sistema de gestión de sesiones activas está completamente funcional y alineado con la base de datos MongoDB. Los usuarios pueden ver todas sus sesiones activas con información detallada y controlarlas desde el dashboard de seguridad.
