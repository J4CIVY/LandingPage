# Guía de Sanitización de Inputs - BSK Motorcycle Team

## 🔒 CRÍTICO: Aplicar en TODAS las APIs

### Patrón de Uso en APIs

**ANTES (Vulnerable):**
```typescript
async function handler(request: NextRequest) {
  const body = await request.json();
  const { title, description, email } = body; // ❌ Sin sanitización
  
  // Guardar directo en BD - PELIGROSO
  await Model.create({ title, description, email });
}
```

**DESPUÉS (Seguro):**
```typescript
import { sanitizeApiInput, CommonSanitizationRules } from '@/lib/api-sanitization';

async function handler(request: NextRequest) {
  const rawBody = await request.json();
  
  // ✅ Sanitizar ANTES de usar
  const body = sanitizeApiInput(rawBody, {
    title: 'text',        // Elimina HTML/scripts
    description: 'html',  // Limpia HTML peligroso
    email: 'email',       // Valida formato
  });
  
  // Ahora es seguro guardar
  await Model.create(body);
}
```

## 📋 APIs que DEBES Actualizar

### ✅ COMPLETADO - Prioridad CRÍTICA (Datos de usuarios/admin):

1. **`/api/admin/memberships/[id]/communication`** - ✅ CORREGIDO
2. **`/api/admin/emergencies/route.ts`** - ✅ CORREGIDO
3. **`/api/admin/events/route.ts`** - ✅ CORREGIDO
4. **`/api/admin/users/route.ts`** - ✅ CORREGIDO (Creación de usuarios)
5. **`/api/auth/login/route.ts`** - ✅ CORREGIDO
6. **`/api/users/profile/route.ts`** - ✅ CORREGIDO (Actualizar perfil)

### ✅ COMPLETADO - Prioridad ALTA (Contenido público):

7. **`/api/contact/route.ts`** - ✅ CORREGIDO
8. **`/api/memberships/route.ts`** - ✅ CORREGIDO (Solicitud de membresía)

### 📝 Estado de Implementación:

- **8 de 8 APIs prioritarias completadas** ✅
- **100% de cobertura en endpoints críticos**
- **XSS protection implementado en todas las APIs de usuario**

## 🎯 Reglas de Sanitización por Tipo de Campo

```typescript
const rules = {
  // Texto simple (nombres, títulos)
  title: 'text',
  firstName: 'text',
  lastName: 'text',
  
  // HTML (descripciones, contenido rico)
  description: 'html',
  content: 'html',
  bio: 'html',
  
  // Contacto
  email: 'email',
  phone: 'phone',
  website: 'url',
  
  // Sin sanitización (números, booleanos, IDs)
  age: 'none',
  active: 'none',
  userId: 'none',
  
  // Objetos anidados
  motorcycleInfo: {
    brand: 'text',
    model: 'text',
    year: 'text',
  },
};
```

## 🛡️ Reglas Predefinidas

Ya están creadas en `CommonSanitizationRules`:

```typescript
import { CommonSanitizationRules } from '@/lib/api-sanitization';

// Para comunicaciones/mensajes
CommonSanitizationRules.communication

// Para perfiles de usuario
CommonSanitizationRules.userProfile

// Para eventos/posts
CommonSanitizationRules.content

// Para aplicaciones de membresía
CommonSanitizationRules.membershipApplication
```

## 📝 Ejemplo Completo: Emergencias API

```typescript
// app/api/admin/emergencies/route.ts

import { sanitizeApiInput } from '@/lib/api-sanitization';

export async function POST(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return createErrorResponse(authResult.error!, authResult.status!);
  }

  try {
    const rawBody = await request.json();
    
    // ✅ SANITIZAR INPUT
    const emergencyData = sanitizeApiInput(rawBody, {
      title: 'text',
      description: 'html',
      severity: 'text',
      location: 'text',
      contactInfo: {
        name: 'text',
        phone: 'phone',
        email: 'email',
      },
      instructions: 'html',
    });
    
    // Validar campos requeridos
    if (!emergencyData.title || !emergencyData.severity) {
      return createErrorResponse('Campos requeridos faltantes', 400);
    }
    
    // Ahora es seguro guardar
    const emergency = await Emergency.create(emergencyData);
    
    return createSuccessResponse({ emergency });
    
  } catch (error) {
    console.error('Error creating emergency:', error);
    return createErrorResponse('Error interno', 500);
  }
}
```

## 🚨 Detección de Ataques

La sanitización automáticamente detecta intentos de inyección:

```typescript
// Si el input original era:
{
  "message": "<script>alert('XSS')</script>Normal message"
}

// Después de sanitización:
{
  "message": "Normal message"  // Script removido
}

// ⚠️ Se genera un warning en consola:
// [Security Alert] Suspicious activity detected
// - originalLength: 48
// - sanitizedLength: 14
// - removed: 34 chars (70%)
```

## ✅ Checklist de Implementación

Para cada API route:

- [ ] Importar `sanitizeApiInput`
- [ ] Renombrar `body` a `rawBody` 
- [ ] Aplicar `sanitizeApiInput(rawBody, rules)`
- [ ] Usar reglas predefinidas si existen
- [ ] Testear con payloads maliciosos (ver sección siguiente)

## 🧪 Testing de Seguridad

Prueba tus APIs con estos payloads:

```bash
# XSS básico
curl -X POST https://bskmt.com/api/admin/events \
  -d '{"title":"<script>alert(1)</script>Test"}'

# XSS con event handler
curl -X POST https://bskmt.com/api/contact \
  -d '{"message":"<img src=x onerror=alert(1)>"}'

# SQL Injection attempt (aunque uses MongoDB)
curl -X POST https://bskmt.com/api/auth/login \
  -d '{"email":"admin@test.com","password":"' OR '1'='1"}'
```

**Resultado esperado:** Todos deben ser sanitizados sin causar ejecución de código.

## 📊 Monitoreo

Los intentos de inyección se loguean automáticamente:

```typescript
// Revisar logs para:
[Security Alert] Suspicious activity detected

// Considerar integrar con:
// - Sentry (alerts en tiempo real)
// - LogRocket (grabación de sesiones)
// - CloudFlare WAF (bloqueo de IPs)
```

## 🎓 Recursos Adicionales

- **OWASP XSS Prevention**: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- **OWASP Input Validation**: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html

## 💡 Resumen

1. ✅ **ServiceWorkerManager** - Corregido (usa DOM methods en lugar de innerHTML)
2. ✅ **API Communication** - Corregido (ejemplo implementado)
3. ⚠️ **Resto de APIs** - DEBES aplicar el mismo patrón
4. ✅ **Librería de sanitización** - Mejorada (limpia HTML peligroso)
5. ✅ **Middleware creado** - `api-sanitization.ts` listo para usar

**ACCIÓN REQUERIDA:** Revisar y actualizar las APIs listadas arriba siguiendo el patrón mostrado.
