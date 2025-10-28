# Next.js 16 Caching APIs - Guía de Uso

## 📋 Resumen de Cambios

### ✅ **Nuevas APIs en Next.js 16:**

1. **`revalidateTag(tag, cacheLife)`** - Ahora acepta un segundo parámetro `cacheLife`
2. **`updateTag(tag)`** - Nueva API para actualizaciones inmediatas (Server Actions only)
3. **`refresh()`** - Refresca el router del cliente desde Server Actions
4. **`cacheLife` y `cacheTag`** - Ya no requieren el prefijo `unstable_`

---

## 🎯 ¿Cuándo usar cada API?

### **1. `revalidateTag(tag, cacheLife)` - Soft Revalidation**

**Cuándo usar:**
- ✅ Contenido donde una ligera demora es aceptable
- ✅ Blogs, catálogos de productos, documentación
- ✅ Listas de eventos, noticias, artículos
- ✅ Datos que cambian con poca frecuencia

**Comportamiento:**
- Los usuarios ven datos antiguos/stale mientras se revalida en segundo plano
- No bloquea la UI
- Mejor performance percibida

**Ejemplo:**
```typescript
'use server'

import { revalidateTag } from 'next/cache'

export async function updateArticle(articleId: string) {
  await db.articles.update(articleId, data)
  
  // Usuarios ven datos antiguos mientras actualiza
  revalidateTag(`article-${articleId}`, 'max')
}
```

**Profiles de `cacheLife`:**
- `'max'` - Máxima tolerancia a stale data (recomendado)
- `'default'` - Balance entre freshness y performance
- `'min'` - Mínima tolerancia, revalida más agresivamente

---

### **2. `updateTag(tag)` - Immediate Update**

**Cuándo usar:**
- ✅ Formularios donde el usuario espera ver cambios inmediatos
- ✅ Configuración de usuario, perfil, ajustes
- ✅ Acciones interactivas (like, favorite, follow)
- ✅ Datos críticos (emergencias, alertas)

**Comportamiento:**
- Expira el cache Y refresca inmediatamente en la misma request
- El usuario ve sus cambios al instante
- Read-your-writes semantics

**Ejemplo:**
```typescript
'use server'

import { updateTag } from 'next/cache'

export async function updateUserProfile(userId: string, profile: Profile) {
  await db.users.update(userId, profile)
  
  // Usuario ve sus cambios INMEDIATAMENTE
  updateTag(`user-${userId}`)
}
```

---

### **3. `refresh()` - Client Router Refresh**

**Cuándo usar:**
- ✅ Actualizar contadores/badges en header/nav
- ✅ Refrescar UI después de acciones globales
- ✅ Sincronizar estado del cliente con servidor

**Comportamiento:**
- Refresca el router del cliente
- Actualiza Server Components
- No revalida cache de fetch

**Ejemplo:**
```typescript
'use server'

import { refresh } from 'next/cache'

export async function markNotificationAsRead(notificationId: string) {
  await db.notifications.markAsRead(notificationId)
  
  // Refresca contador de notificaciones en header
  refresh()
}
```

---

## 📊 Matriz de Decisión

| Tipo de Contenido | API Recomendada | Profile | Razón |
|-------------------|-----------------|---------|-------|
| Blog posts | `revalidateTag` | `max` | Ligera demora OK |
| Catálogo productos | `revalidateTag` | `max` | Inventario no crítico |
| Perfil usuario | `updateTag` | - | Usuario espera ver cambios |
| Configuración | `updateTag` | - | Feedback inmediato |
| Like/Favorite | `updateTag` | - | Acción interactiva |
| Emergencias | `updateTag` | - | Información crítica |
| Notificaciones | `refresh` | - | Actualizar contador UI |
| Lista eventos | `revalidateTag` | `max` | No requiere inmediatez |
| Documentación | `revalidateTag` | `max` | Contenido estático |

---

## 🔧 Implementación en el Proyecto

### **Archivo: `lib/cache-utils.ts`**

```typescript
// Soft revalidation (para contenido general)
export async function invalidateCacheTags(
  tags: string[], 
  cacheLife: 'default' | 'max' | 'min' = 'default'
): Promise<void> {
  const { revalidateTag } = await import('next/cache');
  tags.forEach(tag => revalidateTag(tag, cacheLife));
}

// Immediate update (para acciones de usuario)
export async function updateCacheTags(tags: string[]): Promise<void> {
  const { updateTag } = await import('next/cache');
  tags.forEach(tag => updateTag(tag));
}
```

### **Archivo: `app/actions/cache-actions.ts`**

Server Actions listas para usar en tu proyecto:

```typescript
'use server'

import { revalidateTag, updateTag, refresh } from 'next/cache'

// Eventos - Soft revalidation
export async function updateEvent(eventId: string, data: any) {
  await db.events.update(eventId, data)
  revalidateTag(`event-${eventId}`, 'max')
  revalidateTag('events-list', 'max')
}

// Perfil - Immediate update
export async function updateUserProfile(userId: string, profile: any) {
  await db.users.update(userId, profile)
  updateTag(`user-${userId}`)
}

// Notificaciones - Refresh router
export async function markNotificationAsRead(notificationId: string) {
  await db.notifications.markAsRead(notificationId)
  refresh()
}
```

---

## 💡 Ejemplos de Uso en Componentes

### **Client Component con Server Action:**

```tsx
'use client'

import { updateUserProfile } from '@/app/actions/cache-actions'
import { useState } from 'react'

export function ProfileForm({ userId, initialData }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    
    const profile = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
    }
    
    const result = await updateUserProfile(userId, profile)
    
    if (result.success) {
      // Usuario ve sus cambios INMEDIATAMENTE
      alert('Perfil actualizado')
    }
    
    setLoading(false)
  }

  return (
    <form action={handleSubmit}>
      <input name="firstName" defaultValue={initialData.firstName} />
      <input name="lastName" defaultValue={initialData.lastName} />
      <button disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
```

### **Botón de Acción Simple:**

```tsx
'use client'

import { markNotificationAsRead } from '@/app/actions/cache-actions'

export function NotificationItem({ notification }) {
  const handleMarkRead = async () => {
    await markNotificationAsRead(notification.id)
    // El contador en el header se actualiza automáticamente
  }

  return (
    <div>
      <p>{notification.message}</p>
      <button onClick={handleMarkRead}>Marcar como leída</button>
    </div>
  )
}
```

---

## 🚀 Migración de Código Existente

### **Antes (Next.js 15):**

```typescript
import { revalidateTag } from 'next/cache'

export async function updateArticle(id: string) {
  await db.articles.update(id, data)
  revalidateTag(`article-${id}`) // ❌ Solo 1 argumento
}
```

### **Después (Next.js 16):**

```typescript
import { revalidateTag } from 'next/cache'

export async function updateArticle(id: string) {
  await db.articles.update(id, data)
  revalidateTag(`article-${id}`, 'max') // ✅ Requiere 2 argumentos
}
```

### **Migración de `unstable_` APIs:**

```typescript
// ❌ Antes
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from 'next/cache'

// ✅ Después
import { cacheLife, cacheTag } from 'next/cache'
```

---

## 📝 Mejores Prácticas

### ✅ **DO:**

1. **Usa `updateTag` para acciones de usuario:**
   - Formularios, configuración, perfil
   - El usuario espera ver cambios inmediatos

2. **Usa `revalidateTag` con `'max'` para contenido general:**
   - Blogs, productos, eventos
   - La ligera demora no afecta UX

3. **Usa `refresh` para actualizar UI global:**
   - Contadores, badges, notificaciones
   - No requiere revalidar cache de datos

4. **Combina APIs cuando sea necesario:**
   ```typescript
   updateTag(`user-${userId}`)  // Datos del usuario
   refresh()                     // UI global (header/nav)
   ```

### ❌ **DON'T:**

1. **No uses `updateTag` para todo:**
   - Es más costoso que `revalidateTag`
   - Úsalo solo cuando la inmediatez sea crítica

2. **No uses `revalidateTag` sin `cacheLife`:**
   ```typescript
   // ❌ Incorrecto (requiere 2 argumentos)
   revalidateTag('events')
   
   // ✅ Correcto
   revalidateTag('events', 'max')
   ```

3. **No uses `refresh()` si solo necesitas revalidar datos:**
   - `refresh()` es para actualizar router/UI
   - Para datos, usa `revalidateTag` o `updateTag`

---

## 🔍 Debugging

### **Ver qué se está revalidando:**

```typescript
'use server'

import { revalidateTag } from 'next/cache'

export async function updateEvent(eventId: string) {
  console.log(`Revalidating cache for event-${eventId}`)
  revalidateTag(`event-${eventId}`, 'max')
}
```

### **Verificar comportamiento en desarrollo:**

```bash
npm run dev
```

En desarrollo, el cache se comporta diferente. Prueba en producción:

```bash
npm run build
npm start
```

---

## 📚 Recursos

- [Next.js 16 Cache APIs](https://nextjs.org/docs/app/building-your-application/caching)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Revalidating Data](https://nextjs.org/docs/app/building-your-application/caching#revalidating)

---

## ✅ Estado del Proyecto

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `lib/cache-utils.ts` | ✅ Actualizado | Funciones helper con nuevas APIs |
| `app/actions/cache-actions.ts` | ✅ Creado | Server Actions de ejemplo |
| APIs implementadas | ✅ Completo | revalidateTag, updateTag, refresh |

**Última actualización:** 28 de octubre de 2025  
**Next.js:** 16.0.0
