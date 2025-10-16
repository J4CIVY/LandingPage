# 🛡️ Guía de Uso: CSRF Protection

## Resumen
El sistema de protección CSRF está **100% automático** del lado del servidor. Solo necesitas configurar el cliente (frontend) para incluir el token en las peticiones.

## ⚡ Configuración (Ya está lista - NO requiere .env)

### Backend ✅ COMPLETO
- ✅ Generación automática de tokens
- ✅ Validación en 120 endpoints
- ✅ Token se genera al hacer login
- ✅ Token almacenado en cookies seguras

### Frontend ⚠️ REQUIERE CONFIGURACIÓN

## 📱 Uso en el Frontend

### Opción 1: Usar `csrfFetch` (Recomendado)

```typescript
import { csrfFetch } from '@/lib/csrf-client';

// POST Request
const response = await csrfFetch('/api/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(eventData)
});
```

### Opción 2: Usar `addCSRFHeaders`

```typescript
import { addCSRFHeaders } from '@/lib/csrf-client';

const response = await fetch('/api/events', {
  method: 'POST',
  headers: addCSRFHeaders({
    'Content-Type': 'application/json',
  }),
  body: JSON.stringify(eventData)
});
```

### Opción 3: Manual

```typescript
import { getCSRFToken } from '@/lib/csrf-client';

const token = getCSRFToken();

const response = await fetch('/api/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': token || '',
  },
  body: JSON.stringify(eventData)
});
```

## 🔄 Flujo Completo

### 1. Login
```typescript
// Usuario hace login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password })
});

// ✅ Backend genera automáticamente:
// - Cookie: bsk-csrf-token (httpOnly, usado para validación)
// - Cookie: bsk-csrf-token-readable (legible por JS, usado para envío)
```

### 2. Peticiones Protegidas
```typescript
import { csrfFetch } from '@/lib/csrf-client';

// El helper automáticamente lee el token de la cookie y lo incluye
const response = await csrfFetch('/api/events', {
  method: 'POST',
  body: JSON.stringify(eventData)
});

// ✅ Backend valida automáticamente:
// - Lee token del header 'x-csrf-token'
// - Compara con cookie 'bsk-csrf-token'
// - Si coinciden → ✅ Continúa
// - Si no coinciden → ❌ 403 Forbidden
```

## 🎯 Métodos que Requieren CSRF Token

El token es **OBLIGATORIO** para:
- ✅ POST
- ✅ PUT
- ✅ PATCH
- ✅ DELETE

**NO es necesario** para:
- ❌ GET
- ❌ OPTIONS
- ❌ HEAD

## 🚨 Manejo de Errores

```typescript
import { csrfFetch, hasCSRFToken } from '@/lib/csrf-client';

// Verificar si hay token antes de hacer la petición
if (!hasCSRFToken()) {
  console.error('No hay token CSRF. Usuario no autenticado.');
  // Redirigir a login
  window.location.href = '/login';
  return;
}

try {
  const response = await csrfFetch('/api/events', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    
    if (error.error === 'INVALID_CSRF_TOKEN') {
      // Token inválido o expirado
      console.error('Token CSRF inválido. Redirigiendo a login...');
      window.location.href = '/login';
    }
  }
} catch (error) {
  console.error('Error en la petición:', error);
}
```

## 🔐 Seguridad

### Cookies Generadas (Automáticamente)

1. **bsk-csrf-token** (HttpOnly)
   - No accesible desde JavaScript
   - Usado por el servidor para validación
   - Protegido contra XSS

2. **bsk-csrf-token-readable**
   - Accesible desde JavaScript
   - Usado para incluir en headers
   - Necesario para enviar el token

### Configuración de Cookies (Automática)

```typescript
{
  httpOnly: true/false, // Según el tipo
  secure: true,          // Solo HTTPS en producción
  sameSite: 'strict',    // Previene CSRF
  path: '/',
  maxAge: 7200           // 2 horas
}
```

## 📝 Ejemplos Prácticos

### Crear Evento
```typescript
import { csrfFetch } from '@/lib/csrf-client';

async function createEvent(eventData) {
  try {
    const response = await csrfFetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creando evento:', error);
    throw error;
  }
}
```

### Actualizar Perfil
```typescript
import { csrfFetch } from '@/lib/csrf-client';

async function updateProfile(userId, profileData) {
  const response = await csrfFetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData)
  });
  
  return response.json();
}
```

### Eliminar Publicación
```typescript
import { csrfFetch } from '@/lib/csrf-client';

async function deletePost(postId) {
  const response = await csrfFetch(`/api/comunidad/publicaciones/${postId}`, {
    method: 'DELETE'
  });
  
  return response.json();
}
```

## 🔄 Renovación del Token

El token se renueva automáticamente:
- ✅ Al hacer login
- ✅ Al refrescar el access token
- ✅ Cada vez que se genera una nueva sesión

**Duración:** 2 horas

Si el token expira:
1. Usuario debe hacer login nuevamente
2. Se genera un nuevo token
3. Continúa usando la aplicación

## 🧪 Testing

### Verificar Token en Consola
```javascript
// En DevTools Console
document.cookie.split(';').find(c => c.includes('csrf'))
```

### Verificar Headers en Network Tab
1. Abrir DevTools → Network
2. Hacer una petición POST/PUT/DELETE
3. Ver Request Headers
4. Debe incluir: `x-csrf-token: [token]`

### Simular Error CSRF
```typescript
// Enviar petición sin token
const response = await fetch('/api/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
  // ❌ Sin 'x-csrf-token'
});

// Respuesta esperada: 403 Forbidden
// { error: 'INVALID_CSRF_TOKEN' }
```

## ✅ Checklist de Implementación

### Backend (Ya está completo)
- [x] Token se genera en login
- [x] Token se guarda en cookies
- [x] Validación en 120 endpoints
- [x] Manejo de errores

### Frontend (Por implementar)
- [ ] Importar `csrfFetch` en componentes
- [ ] Reemplazar `fetch` por `csrfFetch` en mutaciones
- [ ] Agregar manejo de errores CSRF
- [ ] Testing en desarrollo

## 📚 Referencias

- **Archivo de protección:** `lib/csrf-protection.ts`
- **Cliente helper:** `lib/csrf-client.ts`
- **Documentación completa:** `CSRF_IMPLEMENTATION_COMPLETE.md`
- **Progreso:** `CSRF_PHASE3_PROGRESS.md`

## 🆘 Troubleshooting

### "CSRF token validation failed"
**Causa:** Token no incluido o inválido
**Solución:** Usar `csrfFetch` o `addCSRFHeaders`

### "No CSRF token found in cookies"
**Causa:** Usuario no ha hecho login o cookies bloqueadas
**Solución:** Verificar login y configuración de cookies

### Token no se lee
**Causa:** Cookie httpOnly o nombre incorrecto
**Solución:** Leer de `bsk-csrf-token-readable` (sin httpOnly)

---

**¿Preguntas? Revisa `CSRF_IMPLEMENTATION_COMPLETE.md` para más detalles.**
