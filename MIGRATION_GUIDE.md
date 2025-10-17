# Script para Proteger Rutas API con BFF

Este script te ayudará a migrar tus rutas API existentes al nuevo sistema BFF.

## 🎯 Pasos de Migración

### 1. Genera las API Keys

```bash
node -e "const crypto = require('crypto'); console.log('BFF_API_KEY_SECRET=' + crypto.randomBytes(32).toString('hex')); console.log('BFF_FRONTEND_API_KEY=' + crypto.randomBytes(32).toString('hex')); console.log('BFF_ADMIN_API_KEY=' + crypto.randomBytes(32).toString('hex'));"
```

### 2. Agrega las variables al archivo `.env`

```env
# Copia las keys generadas arriba
BFF_API_KEY_SECRET=tu_secret_aqui
BFF_FRONTEND_API_KEY=tu_frontend_key_aqui
BFF_ADMIN_API_KEY=tu_admin_key_aqui

# Para el cliente (debe ser igual a BFF_FRONTEND_API_KEY)
NEXT_PUBLIC_BFF_FRONTEND_API_KEY=tu_frontend_key_aqui
```

### 3. Identifica qué rutas necesitan protección

Ejecuta este comando para ver todas tus rutas API:

```bash
# Windows PowerShell
Get-ChildItem -Path ".\app\api" -Recurse -Filter "route.ts" | Select-Object FullName
```

### 4. Para cada ruta, determina su nivel de protección:

#### ❌ Sin Protección (Públicas)
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/verify-email`
- `/api/auth/reset-password`
- `/api/health`

#### 🔐 Protección Normal (Usuarios Autenticados)
- `/api/profile`
- `/api/events` (ver eventos)
- `/api/membership/status` (propio estado)

#### 🔒 Protección Admin (Solo Administradores)
- `/api/users` ✅ YA PROTEGIDA
- `/api/admin/*`
- `/api/membership/admin/*`
- `/api/comunidad/reportes`

### 5. Actualiza cada ruta según su tipo

#### Para rutas que requieren autenticación:

```typescript
// ANTES
export async function GET(request: NextRequest) {
  const data = await getData();
  return NextResponse.json(data);
}

// DESPUÉS
import { withApiProtection, ApiAuthContext } from '@/lib/api-auth-middleware';
import { createSuccessResponse } from '@/lib/api-utils';

export const GET = withApiProtection(
  async (request: NextRequest, context: ApiAuthContext) => {
    const data = await getData();
    return createSuccessResponse({ data });
  }
);
```

#### Para rutas admin only:

```typescript
// ANTES
export async function GET(request: NextRequest) {
  const users = await User.find({});
  return NextResponse.json({ users });
}

// DESPUÉS
import { withAdminProtection, ApiAuthContext } from '@/lib/api-auth-middleware';
import { requireResourcePermission } from '@/lib/authorization';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';

export const GET = withAdminProtection(
  async (request: NextRequest, context: ApiAuthContext) => {
    // Verificar permiso específico
    if (!requireResourcePermission(context.user, 'users', 'read')) {
      return createErrorResponse('Sin permisos para ver usuarios', 403);
    }
    
    const users = await User.find({});
    return createSuccessResponse({ users });
  }
);
```

### 6. Actualiza el frontend para usar `useSecureApi`

```typescript
// ANTES
const response = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const data = await response.json();

// DESPUÉS
import { useSecureApi } from '@/hooks/useSecureApi';

function MyComponent() {
  const api = useSecureApi();
  
  const fetchUsers = async () => {
    const result = await api.get('/api/users');
    
    if (result.success) {
      console.log('Usuarios:', result.data);
    } else {
      console.error('Error:', result.error);
    }
  };
}
```

### 7. Prueba cada ruta migrada

```bash
# Test 1: Sin API Key (debe fallar)
curl http://localhost:3000/api/users

# Test 2: Con API Key pero sin JWT (debe fallar)
curl -H "x-api-key: TU_API_KEY" http://localhost:3000/api/users

# Test 3: Con API Key y JWT de usuario regular en ruta admin (debe fallar)
curl -H "x-api-key: TU_API_KEY" \
     -H "Authorization: Bearer TOKEN_REGULAR" \
     http://localhost:3000/api/users

# Test 4: Con API Key y JWT de admin (debe funcionar)
curl -H "x-api-key: TU_API_KEY" \
     -H "Authorization: Bearer TOKEN_ADMIN" \
     http://localhost:3000/api/users
```

## 📋 Checklist de Rutas a Proteger

Usa esta lista para trackear tu progreso:

### Rutas de Usuarios
- [x] `/api/users` - **YA PROTEGIDA**
- [ ] `/api/users/[id]`
- [ ] `/api/users/[id]/profile`
- [ ] `/api/users/stats`
- [ ] `/api/users/history`

### Rutas de Eventos
- [ ] `/api/events` (GET - público, POST - admin)
- [ ] `/api/events/[id]` (GET - público, PUT/DELETE - admin)
- [ ] `/api/events/[id]/register` (POST - autenticado)
- [ ] `/api/events/[id]/attendees` (GET - admin)

### Rutas de Membresías
- [ ] `/api/memberships` (GET - autenticado, POST - admin)
- [ ] `/api/membership/status` (GET - autenticado)
- [ ] `/api/membership/request-upgrade` (POST - autenticado)
- [ ] `/api/membership/admin/*` (todo - admin)

### Rutas de Comunidad
- [ ] `/api/comunidad/publicaciones` (GET - público, POST - autenticado)
- [ ] `/api/comunidad/reportes` (todo - admin)
- [ ] `/api/comunidad/usuarios-en-linea` (GET - autenticado)

### Rutas de Leadership
- [ ] `/api/leadership/voting` (GET - autenticado, POST - admin)
- [ ] `/api/leadership/dashboard` (GET - admin)

### Rutas de Admin
- [ ] `/api/admin/*` (todo - admin)

## 🚀 Comando Rápido para Ver Rutas Sin Proteger

```bash
# Buscar archivos route.ts que NO tienen import de api-auth-middleware
Get-ChildItem -Path ".\app\api" -Recurse -Filter "route.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -notmatch "api-auth-middleware") {
        Write-Host $_.FullName -ForegroundColor Yellow
    }
}
```

## ⚠️ Notas Importantes

1. **Rutas de webhooks**: No proteger con BFF, tienen su propia validación
2. **Rutas de health check**: Dejar públicas para monitoring
3. **Rutas de autenticación**: Ya están en PUBLIC_ROUTES, no necesitan cambios

## 📞 Si algo sale mal

1. Verifica que las variables de entorno estén configuradas:
   ```bash
   echo $env:BFF_API_KEY_SECRET
   echo $env:BFF_FRONTEND_API_KEY
   ```

2. Verifica que el servidor se reinició después de agregar las variables

3. Revisa los logs del servidor para ver errores específicos

4. Consulta `docs/BFF_IMPLEMENTATION.md` para más detalles

## 🎉 Una vez completado

Tu API estará completamente protegida y solo usuarios autorizados podrán acceder a los datos.

**Recuerda**: En producción, NUNCA compartas las API Keys ni las subas al repositorio.
