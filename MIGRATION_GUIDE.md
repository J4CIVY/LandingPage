# 🔄 Guía de Migración del Frontend a NestJS Backend

## 📋 Resumen

El backend ha sido migrado de Next.js API Routes a NestJS. Esta guía explica cómo actualizar el Frontend para consumir la nueva API.

---

## ✅ Cambios Completados

### 1. **API Client Centralizado** ✅
- **Archivo:** `Frontend/lib/api-client.ts`
- **Funcionalidad:**
  - Cliente HTTP centralizado para todas las llamadas a la API
  - Manejo automático de autenticación (Bearer tokens)
  - Refresh automático de tokens cuando expiran
  - Manejo de errores estandarizado
  - Soporte para uploads de archivos

### 2. **Hook de Autenticación Actualizado** ✅
- **Archivo:** `Frontend/hooks/useAuth-nestjs.tsx`
- **Funcionalidad:**
  - Adaptado a los endpoints de NestJS
  - Usa el nuevo API client
  - Almacena tokens en localStorage
  - Manejo automático de refresh tokens

### 3. **Variables de Entorno** ✅
- **Archivo:** `Frontend/.env.local`
- **Variable agregada:** `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1`

---

## 🔧 Cambios en los Endpoints

### Autenticación

| Endpoint Anterior | Endpoint Nuevo NestJS | Método | Notas |
|-------------------|----------------------|--------|-------|
| `/api/auth/login` | `/auth/login` | POST | Retorna `{ accessToken, refreshToken, user }` |
| `/api/auth/register` | `/auth/register` | POST | Mismo formato |
| `/api/auth/logout` | `/auth/logout` | POST | Requiere Authorization header |
| `/api/auth/me` | `/auth/me` | GET | Retorna usuario actual |
| `/api/auth/refresh` | `/auth/refresh` | POST | Body: `{ refreshToken }` |
| `/api/auth/verify-email` | `/auth/verify-email/:token` | GET | Token en URL |
| `/api/auth/forgot-password` | `/auth/forgot-password` | POST | Body: `{ email }` |
| `/api/auth/reset-password` | `/auth/reset-password` | POST | Body: `{ token, newPassword }` |

### Usuarios

| Endpoint Anterior | Endpoint Nuevo NestJS | Método |
|-------------------|----------------------|--------|
| `/api/users/profile` | `/users/me` | GET |
| `/api/users/profile` | `/users/me` | PUT |
| `/api/users/stats` | `/users/:id/stats` | GET |
| `/api/users/:id/profile` | `/users/:id` | GET |
| `/api/users/search` | `/users/search?q=term` | GET |

### Eventos

| Endpoint Anterior | Endpoint Nuevo NestJS | Método |
|-------------------|----------------------|--------|
| `/api/events` | `/events` | GET |
| `/api/events/:id` | `/events/:id` | GET |
| `/api/events/:id/register` | `/events/:id/register` | POST |
| `/api/events` | `/events` | POST |
| `/api/events/:id` | `/events/:id` | PUT |
| `/api/events/:id` | `/events/:id` | DELETE |

### Membresías

| Endpoint Anterior | Endpoint Nuevo NestJS | Método |
|-------------------|----------------------|--------|
| `/api/membership` | `/memberships` | GET |
| `/api/membership/renew` | `/memberships/:id` | PUT |
| `/api/users/membership` | `/users/me` | GET |

### Uploads

| Endpoint Anterior | Endpoint Nuevo NestJS | Método |
|-------------------|----------------------|--------|
| `/api/upload-image` | `/uploads/image` | POST |
| `/api/users/upload-avatar` | `/uploads/profile-image` | POST |
| `/api/upload-pdf` | `/uploads/pdf` | POST |

---

## 🚀 Pasos de Migración

### Paso 1: Usar el Nuevo API Client

**Antes:**
```typescript
const response = await fetch('/api/users/profile', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

**Después:**
```typescript
import apiClient from '@/lib/api-client';

const data = await apiClient.get('/users/me');
```

### Paso 2: Actualizar Autenticación

**Reemplazar en `app/layout.tsx` o `_app.tsx`:**
```typescript
// Antes
import { AuthProvider } from '@/hooks/useAuth';

// Después
import { AuthProvider } from '@/hooks/useAuth-nestjs';
```

### Paso 3: Actualizar Llamadas POST

**Antes:**
```typescript
const response = await fetch('/api/events', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(eventData)
});
```

**Después:**
```typescript
import apiClient from '@/lib/api-client';

const response = await apiClient.post('/events', eventData);
```

### Paso 4: Actualizar Uploads

**Antes:**
```typescript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload-image', {
  method: 'POST',
  body: formData
});
```

**Después:**
```typescript
import apiClient from '@/lib/api-client';

const formData = new FormData();
formData.append('file', file);

const response = await apiClient.upload('/uploads/image', formData);
```

---

## 📝 Checklist de Archivos a Actualizar

### Hooks (Priority: HIGH)
- [ ] `hooks/useAuth.tsx` → Reemplazar con `useAuth-nestjs.tsx`
- [ ] `hooks/useProfile.tsx` → Actualizar endpoints
- [ ] `hooks/useEvents.ts` → Actualizar endpoints
- [ ] `hooks/useMembership.ts` → Actualizar endpoints
- [ ] `hooks/useImageUpload.ts` → Actualizar a `/uploads/image`
- [ ] `hooks/usePdfUpload.ts` → Actualizar a `/uploads/pdf`
- [ ] `hooks/useEmail.tsx` → Actualizar endpoints
- [ ] `hooks/useNotifications.ts` → Actualizar endpoints

### Pages - Auth (Priority: HIGH)
- [ ] `app/login/page.tsx`
- [ ] `app/register/page.tsx`
- [ ] `app/verify-email/page.tsx`
- [ ] `app/reset-password/page.tsx`

### Pages - Dashboard (Priority: MEDIUM)
- [ ] `app/dashboard/page.tsx`
- [ ] `app/dashboard/events/page.tsx`
- [ ] `app/dashboard/events/[id]/page.tsx`
- [ ] `app/dashboard/membership/page.tsx`
- [ ] `app/dashboard/profile/page.tsx`
- [ ] `app/dashboard/ranking/page.tsx`
- [ ] `app/dashboard/historial/page.tsx`
- [ ] `app/dashboard/puntos/page.tsx`
- [ ] `app/dashboard/comunidad/page.tsx`

### Pages - Public (Priority: LOW)
- [ ] `app/events/[id]/payment-result/page.tsx`
- [ ] `app/profile/page.tsx`
- [ ] `app/store/page.tsx`

---

## 🔐 Autenticación - Cambios Importantes

### Almacenamiento de Tokens

**Antes:** Cookies (httpOnly)
```typescript
// Tokens manejados por el servidor
```

**Después:** localStorage con refresh automático
```typescript
import { setAuthToken, setRefreshToken } from '@/lib/api-client';

// En login
const response = await apiClient.post('/auth/login', { email, password });
setAuthToken(response.accessToken);
setRefreshToken(response.refreshToken);
```

### Refresh Automático de Tokens

El API client ahora maneja automáticamente el refresh de tokens cuando recibe un 401:

```typescript
// No necesitas hacer nada, el cliente lo maneja automáticamente
const data = await apiClient.get('/users/me');
// Si el token expiró, el cliente lo renovará automáticamente
```

---

## 🧪 Testing

### Probar Endpoints Manualmente

```bash
# Health Check
curl http://localhost:4000/api/v1/health

# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get User (con token)
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Swagger Documentation

Abre en tu navegador: `http://localhost:4000/api/docs`

Aquí puedes ver y probar todos los endpoints disponibles.

---

## ⚠️ Problemas Comunes y Soluciones

### Error: "Network Error" o CORS

**Problema:** El frontend no puede conectarse al backend
**Solución:** Verifica que el backend esté corriendo en `http://localhost:4000`

```bash
cd Backend
npm run start:dev
```

### Error: "401 Unauthorized"

**Problema:** Token no válido o expirado
**Solución:** El cliente intentará renovar automáticamente. Si falla, el usuario será redirigido a login.

### Error: "404 Not Found"

**Problema:** Endpoint no existe en NestJS
**Solución:** Verifica la tabla de endpoints en esta guía y actualiza la URL.

---

## 📊 Progreso de Migración

- ✅ Backend NestJS funcionando
- ✅ API Client creado
- ✅ Hook de autenticación actualizado
- ✅ Variables de entorno configuradas
- ⏳ Actualizar hooks restantes
- ⏳ Actualizar páginas de auth
- ⏳ Actualizar dashboard
- ⏳ Testing completo

---

## 🎯 Próximos Pasos

1. **Actualizar hook principal de autenticación**
   - Renombrar o reemplazar `useAuth.tsx` con `useAuth-nestjs.tsx`

2. **Actualizar páginas críticas primero**
   - Login
   - Register
   - Dashboard principal

3. **Actualizar hooks uno por uno**
   - Probar cada hook después de actualizarlo

4. **Testing completo**
   - Probar flujo de registro
   - Probar flujo de login
   - Probar flujo de eventos
   - Probar uploads

5. **Deployment**
   - Actualizar `NEXT_PUBLIC_API_URL` con URL de producción
   - Configurar CORS en backend para dominio de producción

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa la documentación de Swagger: `http://localhost:4000/api/docs`
2. Verifica los logs del backend en la terminal
3. Usa las DevTools del navegador para ver los errores de red
4. Consulta esta guía para el mapeo correcto de endpoints

