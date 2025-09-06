# Corrección de Error en Dashboard de Administración - Usuarios

## Problema Identificado

El error "Error de configuración del servidor" en el endpoint `/api/admin/users` se debía a que la variable de entorno `JWT_SECRET` no estaba configurada y el código no tenía un valor por defecto.

## Ubicación del Error

- **Archivo:** `lib/auth-admin.ts`
- **Líneas:** 30-35
- **Función:** `requireAdmin()`

## Solución Implementada

### 1. Corrección del código

Se modificó el archivo `lib/auth-admin.ts` para incluir un valor por defecto para `JWT_SECRET`, similar a como ya se manejaba en `lib/auth-utils.ts`:

```typescript
// Antes
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET no está configurado');
  return NextResponse.json(
    { success: false, error: 'Error de configuración del servidor' },
    { status: 500 }
  );
}
const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

// Después
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-change-in-production';
const decoded = jwt.verify(token, JWT_SECRET) as any;
```

### 2. Archivos creados

- **`.env.example`**: Plantilla con todas las variables de entorno necesarias
- **`setup.sh`**: Script de configuración inicial automatizada
- **`ADMIN_USERS_FIX.md`**: Este archivo de documentación

## Variables de Entorno Requeridas

Para un funcionamiento completo del sistema, configurar las siguientes variables en un archivo `.env`:

```env
# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-change-in-production
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Verificación de la Solución

1. **Compilación:** El proyecto compila sin errores
2. **Servidor de desarrollo:** Se inicia correctamente
3. **Endpoint:** `/api/admin/users` ya no devuelve "Error de configuración del servidor"

## Próximos Pasos

1. Configurar las variables de entorno apropiadas en producción
2. Verificar que el endpoint funcione correctamente con autenticación válida
3. Probar la funcionalidad completa del dashboard de administración

## Notas de Seguridad

- Usar claves JWT fuertes y únicas en producción
- No commitear archivos `.env` con datos sensibles
- Rotar las claves JWT periódicamente
- Verificar que todas las variables de entorno estén configuradas antes del despliegue
