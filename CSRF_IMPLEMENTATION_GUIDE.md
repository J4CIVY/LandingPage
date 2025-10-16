# 🛡️ CSRF Protection - Guía de Implementación

**Estado Actual:** ⚠️ **NO IMPLEMENTADO**  
**Prioridad:** 🟡 **MEDIA** (Recomendado para próxima iteración)  
**Esfuerzo:** 2-3 horas de desarrollo + testing

---

## 📊 Estado Actual vs. Deseado

### ✅ Protección CSRF Actual (Parcial)
El proyecto YA tiene protección básica de CSRF mediante:
- **SameSite=Strict cookies** en todas las rutas de autenticación
- Cookies HttpOnly que no pueden ser leídas por JavaScript malicioso

**Esto es SUFICIENTE para la mayoría de navegadores modernos.**

### 🎯 Con la Implementación Completa (Defense-in-Depth)
Agregaríamos:
- **Tokens CSRF explícitos** en cada operación que cambia estado
- **Validación adicional** en el servidor
- **Protección adicional** para navegadores antiguos o apps móviles

---

## 🚦 ¿Debo Implementarlo Ahora?

### ✅ NO es urgente SI:
- Tus usuarios usan navegadores modernos (Chrome, Firefox, Safari, Edge actualizados)
- No tienes aplicaciones móviles nativas
- No has tenido incidentes de seguridad CSRF
- Ya tienes `sameSite: 'strict'` en todas las cookies (✅ ya lo tienes)

### ⚠️ Deberías implementarlo SI:
- Planeas lanzar una app móvil
- Tienes usuarios con navegadores antiguos
- Operas bajo normativas estrictas (banca, salud, gobierno)
- Quieres certificación de seguridad adicional
- Tienes endpoints críticos (pagos, transferencias, eliminaciones masivas)

---

## 📋 Plan de Implementación Gradual

### Fase 1: Endpoints Críticos (1-2 horas)
Implementar CSRF solo en operaciones de alto riesgo:
- Cambio de contraseña
- Eliminación de cuenta
- Procesamiento de pagos
- Operaciones administrativas

### Fase 2: Todos los Endpoints de Autenticación (2-3 horas)
- Login
- Registro
- Logout
- Recuperación de contraseña
- Verificación 2FA

### Fase 3: Todas las Operaciones POST/PUT/DELETE (4-6 horas)
- Creación de eventos
- Actualización de perfil
- Subida de archivos
- Operaciones de membresía

---

## 🔧 Ejemplos de Implementación

### Ejemplo 1: Endpoint Crítico (Cambio de Contraseña)

#### Backend: `app/api/auth/change-password/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireCSRFToken } from '@/lib/csrf-protection';
import { verifyAuth } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  // 1. CSRF Protection
  const csrfError = requireCSRFToken(request);
  if (csrfError) return csrfError;
  
  // 2. Authentication
  const auth = await verifyAuth(request);
  if (!auth.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 3. Process password change
  const { currentPassword, newPassword } = await request.json();
  
  // ... lógica de cambio de contraseña
  
  return NextResponse.json({ success: true });
}
```

#### Frontend: `app/profile/change-password/page.tsx`

```typescript
'use client';

import { addCSRFTokenToHeaders } from '@/lib/csrf-protection';

export default function ChangePasswordPage() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: addCSRFTokenToHeaders({
        'Content-Type': 'application/json'
      }),
      credentials: 'include',
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
    
    if (response.ok) {
      alert('Contraseña cambiada exitosamente');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... campos del formulario */}
    </form>
  );
}
```

---

### Ejemplo 2: Endpoint de Pago (Crítico)

#### Backend: `app/api/payments/process/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireCSRFToken } from '@/lib/csrf-protection';
import { verifyAuth } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  // ⚠️ CRÍTICO: Validar CSRF en pagos
  const csrfError = requireCSRFToken(request);
  if (csrfError) {
    // Log security event
    console.error('[SECURITY] CSRF validation failed on payment endpoint');
    return csrfError;
  }
  
  const auth = await verifyAuth(request);
  if (!auth.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Process payment
  const { amount, membershipType } = await request.json();
  
  // ... lógica de procesamiento de pago con Bold
  
  return NextResponse.json({ success: true, transactionId });
}
```

---

### Ejemplo 3: Generación del Token (Endpoint Inicial)

Crear un endpoint para obtener el token CSRF:

#### `app/api/csrf-token/route.ts` (NUEVO)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { setCSRFToken } from '@/lib/csrf-protection';

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Generar y configurar el token CSRF
  const token = setCSRFToken(response);
  
  // Opcionalmente retornar el token en el body para SPA
  return NextResponse.json({ 
    success: true,
    csrfToken: token 
  });
}
```

#### Frontend: Hook personalizado

```typescript
// hooks/useCSRFToken.ts (NUEVO)
'use client';

import { useEffect, useState } from 'react';
import { getCSRFTokenFromCookie } from '@/lib/csrf-protection';

export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Intentar obtener token de cookie
    const cookieToken = getCSRFTokenFromCookie();
    
    if (cookieToken) {
      setToken(cookieToken);
    } else {
      // Si no existe, solicitarlo al servidor
      fetch('/api/csrf-token', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.csrfToken) {
            setToken(data.csrfToken);
          }
        });
    }
  }, []);
  
  return token;
}
```

Uso en componentes:

```typescript
'use client';

import { useCSRFToken } from '@/hooks/useCSRFToken';
import { addCSRFTokenToHeaders } from '@/lib/csrf-protection';

export default function MyForm() {
  const csrfToken = useCSRFToken();
  
  const handleSubmit = async () => {
    if (!csrfToken) {
      console.error('CSRF token not available');
      return;
    }
    
    const response = await fetch('/api/critical-operation', {
      method: 'POST',
      headers: addCSRFTokenToHeaders({
        'Content-Type': 'application/json'
      }),
      credentials: 'include',
      body: JSON.stringify(data)
    });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🗂️ Archivos que Necesitarían Modificación

### Endpoints de Alta Prioridad (Implementar primero)

1. **`app/api/auth/change-password/route.ts`** - Cambio de contraseña
2. **`app/api/payments/**/*.ts`** - Todos los endpoints de pago
3. **`app/api/admin/**/*.ts`** - Operaciones administrativas
4. **`app/api/auth/delete-account/route.ts`** - Eliminación de cuenta
5. **`app/api/memberships/upgrade/route.ts`** - Cambio de membresía

### Endpoints de Prioridad Media

6. **`app/api/auth/login/route.ts`** - Login
7. **`app/api/auth/register/route.ts`** - Registro
8. **`app/api/auth/2fa/verify/route.ts`** - Verificación 2FA
9. **`app/api/profile/update/route.ts`** - Actualización de perfil
10. **`app/api/events/register/route.ts`** - Registro a eventos

### Componentes Frontend

11. **`components/auth/*`** - Todos los componentes de autenticación
12. **`components/dashboard/*`** - Componentes con operaciones críticas
13. **`app/profile/**/*.tsx`** - Páginas de perfil
14. **`app/memberships/**/*.tsx`** - Páginas de membresía

---

## 📝 Checklist de Implementación

### Preparación
- [ ] Crear endpoint `/api/csrf-token` para generar tokens
- [ ] Crear hook `useCSRFToken()` para componentes cliente
- [ ] Documentar el proceso para el equipo

### Fase 1: Endpoints Críticos (🔴 Alta Prioridad)
- [ ] Implementar en cambio de contraseña
- [ ] Implementar en procesamiento de pagos
- [ ] Implementar en eliminación de cuenta
- [ ] Implementar en operaciones admin críticas
- [ ] Testing de endpoints críticos

### Fase 2: Autenticación (🟡 Prioridad Media)
- [ ] Implementar en login
- [ ] Implementar en registro
- [ ] Implementar en 2FA
- [ ] Implementar en logout
- [ ] Testing de flujos de autenticación

### Fase 3: Operaciones Generales (🟢 Baja Prioridad)
- [ ] Implementar en actualización de perfil
- [ ] Implementar en registro de eventos
- [ ] Implementar en subida de archivos
- [ ] Testing exhaustivo

### Testing
- [ ] Test unitarios para validación CSRF
- [ ] Test de integración en endpoints críticos
- [ ] Test E2E de flujos completos
- [ ] Verificar que no rompa funcionalidad existente

---

## ⚠️ Consideraciones Importantes

### 1. **No Romper Compatibilidad**
Durante la implementación gradual, algunos endpoints tendrán CSRF y otros no. Esto es NORMAL y SEGURO durante la transición.

### 2. **Testing Exhaustivo**
Cada endpoint modificado debe ser testeado para asegurar que:
- ✅ Funciona correctamente con token válido
- ✅ Rechaza requests sin token
- ✅ Rechaza requests con token inválido
- ✅ No afecta funcionalidad existente

### 3. **Documentación**
Documentar qué endpoints requieren CSRF token para que el equipo frontend sepa cuándo usar `addCSRFTokenToHeaders()`.

### 4. **Monitoreo**
Agregar logging para detectar intentos de CSRF:
```typescript
if (!validateCSRFToken(request)) {
  console.error('[SECURITY] CSRF validation failed', {
    endpoint: request.url,
    ip: request.headers.get('x-forwarded-for'),
    timestamp: new Date()
  });
  return NextResponse.json({ error: 'INVALID_CSRF_TOKEN' }, { status: 403 });
}
```

---

## 🧪 Ejemplo de Test

```typescript
// __tests__/api/auth/change-password.test.ts
import { POST } from '@/app/api/auth/change-password/route';

describe('POST /api/auth/change-password', () => {
  it('should reject request without CSRF token', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: 'old', newPassword: 'new' })
    });
    
    const response = await POST(request);
    expect(response.status).toBe(403);
    
    const data = await response.json();
    expect(data.error).toBe('INVALID_CSRF_TOKEN');
  });
  
  it('should accept request with valid CSRF token', async () => {
    const token = 'valid-csrf-token-here';
    
    const request = new NextRequest('http://localhost:3000/api/auth/change-password', {
      method: 'POST',
      headers: {
        'x-csrf-token': token,
        'Cookie': `bsk-csrf-token=${token}`
      },
      body: JSON.stringify({ currentPassword: 'old', newPassword: 'new' })
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

---

## 🎯 Recomendación Final

### Para BSK Motorcycle Team:

**OPCIÓN A: No implementar aún** ✅ RECOMENDADO INICIALMENTE
- Ya tienes `sameSite: 'strict'` que protege contra CSRF en navegadores modernos
- Prioriza otras características del negocio
- Implementa solo cuando:
  - Tengas una app móvil
  - Tengas reportes de seguridad que lo requieran
  - Vayas a certificarte en seguridad

**OPCIÓN B: Implementación gradual** (Si decides hacerlo)
1. **Semana 1:** Endpoints de pago y cambio de contraseña (críticos)
2. **Semana 2:** Endpoints de autenticación
3. **Semana 3:** Resto de endpoints POST/PUT/DELETE
4. **Semana 4:** Testing exhaustivo y documentación

**OPCIÓN C: Implementación completa** ⚠️ Solo si es requisito de compliance
- 2-3 días de desarrollo
- 1-2 días de testing
- Requiere coordinación entre frontend y backend

---

## 📞 ¿Necesitas Ayuda?

Si decides implementarlo, puedo:
1. ✅ Crear los archivos faltantes (`/api/csrf-token`, `useCSRFToken`)
2. ✅ Modificar endpoints específicos que indiques
3. ✅ Crear tests unitarios y de integración
4. ✅ Documentar el proceso completo

**Pregúntame:** "¿Quieres que implemente CSRF en [nombre-del-endpoint]?"

---

*Estado: Utilidad preparada y lista para usar cuando sea necesario.*
