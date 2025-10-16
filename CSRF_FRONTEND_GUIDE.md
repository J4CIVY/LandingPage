# CSRF Frontend Implementation Guide

## 🚨 Problema Actual

**Error:** `{"success":false,"message":"CSRF token validation failed","error":"INVALID_CSRF_TOKEN"}`

**Causa:** El frontend NO está enviando el token CSRF en el header `x-csrf-token`.

## ✅ Solución

Agregar el token CSRF a **TODAS** las peticiones POST/PUT/PATCH/DELETE.

---

## 📝 Cómo Implementarlo

### Opción 1: Usando `getCSRFToken()` (Actual)

```typescript
import { getCSRFToken } from '@/lib/csrf-client';

const handleSubmit = async () => {
  const csrfToken = getCSRFToken();
  
  const response = await fetch('/api/events', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken || '',
    },
    body: JSON.stringify(data)
  });
};
```

### Opción 2: Usando `addCSRFHeaders()` (Más fácil)

```typescript
import { addCSRFHeaders } from '@/lib/csrf-client';

const handleSubmit = async () => {
  const response = await fetch('/api/events', {
    method: 'POST',
    credentials: 'include',
    headers: addCSRFHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(data)
  });
};
```

### Opción 3: Usando `csrfFetch()` (La más fácil)

```typescript
import { csrfFetch } from '@/lib/csrf-client';

const handleSubmit = async () => {
  const response = await csrfFetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
};
```

---

## 🔍 Archivos que Necesitan Actualización

### ✅ Ya Actualizado
- `app/dashboard/eventos/page.tsx`

### ⚠️ Pendientes (Prioridad Alta)

#### Eventos
- `app/dashboard/events/[id]/page.tsx`
- `app/events/[id]/page.tsx`
- `components/eventos/EventoModal.tsx`
- `components/eventos/EventoForm.tsx`

#### Usuarios y Perfil
- `app/profile/page.tsx`
- `app/dashboard/profile/page.tsx`
- `components/profile/*`

#### Membresías
- `app/memberships/*`
- `components/membership/*`

#### Comunidad
- `app/dashboard/comunidad/*`
- `components/comunidad/*`

#### Admin
- `app/admin/*`
- `components/admin/*`

#### Otros
- `app/dashboard/pqrsdf/*`
- `app/sos/*`
- Cualquier componente que haga POST/PUT/DELETE

---

## 🛠️ Patrón de Búsqueda

Para encontrar TODOS los fetch que necesitan CSRF:

```bash
# PowerShell
Get-ChildItem -Path "d:\LandingPage" -Recurse -Include *.tsx,*.ts -Exclude node_modules | Select-String -Pattern "method:\s*['\"](?:POST|PUT|PATCH|DELETE)['\"]" | Select-Object -Property Path,LineNumber,Line
```

---

## 📋 Checklist de Actualización

Para cada archivo con `fetch` POST/PUT/DELETE:

1. [ ] Agregar import: `import { getCSRFToken } from '@/lib/csrf-client';`
2. [ ] Obtener token: `const csrfToken = getCSRFToken();`
3. [ ] Agregar header:
   ```typescript
   headers: {
     'x-csrf-token': csrfToken || '',
     ...otherHeaders
   }
   ```
4. [ ] Probar que funcione

---

## 🎯 Ejemplo Completo: Registro a Evento

### ❌ ANTES (No funciona)

```typescript
const handleRegister = async (eventId: string) => {
  const response = await fetch(`/api/events/${eventId}/register`, {
    method: 'POST',
    credentials: 'include'
  });
  
  if (response.ok) {
    alert('Registrado!');
  }
};
```

### ✅ DESPUÉS (Funciona)

```typescript
import { getCSRFToken } from '@/lib/csrf-client';

const handleRegister = async (eventId: string) => {
  const csrfToken = getCSRFToken();
  
  const response = await fetch(`/api/events/${eventId}/register`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'x-csrf-token': csrfToken || '',
    }
  });
  
  if (response.ok) {
    alert('Registrado!');
  } else {
    const error = await response.json();
    console.error('Error:', error);
  }
};
```

---

## 🐛 Debugging

Si sigues teniendo errores:

### 1. Verificar que el token existe en las cookies

```javascript
// En la consola del navegador:
document.cookie.split(';').find(c => c.includes('bsk-csrf-token'))
```

Deberías ver:
```
" bsk-csrf-token=abc123..."
" bsk-csrf-token-readable=abc123..."
```

### 2. Verificar que se está enviando en el header

En DevTools → Network → Headers → Request Headers:
```
x-csrf-token: c47c463910c1da8b2e1eb84fb64a377c4f7f6718e52525e5e63459c1417c3483
```

### 3. Verificar que el token coincide

```javascript
// En la consola:
import { getCSRFToken } from '@/lib/csrf-client';
console.log('Token:', getCSRFToken());
```

---

## 🔧 Script de Actualización Rápida

Para actualizar múltiples archivos rápidamente:

```typescript
// add-csrf-to-fetch.ts
// Usar este patrón en cada archivo

// 1. Import
import { getCSRFToken } from '@/lib/csrf-client';

// 2. En cada función con fetch POST/PUT/DELETE
const myFunction = async () => {
  const csrfToken = getCSRFToken();
  
  const response = await fetch('/api/...', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'x-csrf-token': csrfToken || '',
      // ...otros headers
    },
    body: JSON.stringify(data)
  });
};
```

---

## 📊 Progreso

- [x] Crear helper `getCSRFToken()`
- [x] Crear helper `addCSRFHeaders()`
- [x] Crear helper `csrfFetch()`
- [x] Actualizar `app/dashboard/eventos/page.tsx`
- [ ] Actualizar resto de archivos (ver lista arriba)

---

## 💡 Tip Pro

Crea un hook personalizado para simplificar:

```typescript
// hooks/useFetchWithCSRF.ts
import { useCallback } from 'react';
import { getCSRFToken } from '@/lib/csrf-client';

export function useFetchWithCSRF() {
  return useCallback(async (url: string, options: RequestInit = {}) => {
    const csrfToken = getCSRFToken();
    
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        'x-csrf-token': csrfToken || '',
      },
    });
  }, []);
}

// Uso:
const fetchWithCSRF = useFetchWithCSRF();
const response = await fetchWithCSRF('/api/events', { method: 'POST' });
```

---

## ⚠️ Importante

**NO necesitas CSRF para:**
- GET requests
- Endpoints públicos sin autenticación
- Webhooks externos
- `/api/auth/login` (ya está excluido)
- `/api/auth/2fa/*` (ya está excluido)

**SÍ necesitas CSRF para:**
- POST/PUT/PATCH/DELETE con autenticación
- Cualquier operación que cambie estado
- Operaciones dentro del dashboard
- Operaciones de usuario autenticado
