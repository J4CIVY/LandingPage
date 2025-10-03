# Sistema de Facturas Públicas con Tokens de Acceso

## 📋 Resumen

Sistema implementado para permitir que las facturas/comprobantes sean accesibles desde enlaces públicos (como WhatsApp) sin requerir autenticación del usuario, pero manteniendo la seguridad mediante tokens únicos de acceso.

## 🎯 Problema Resuelto

**Antes:** 
- Las facturas requerían autenticación (cookies)
- Los enlaces desde WhatsApp abren en ventanas emergentes sin cookies
- Los usuarios veían error "No autenticado" y debían copiar manualmente la URL

**Ahora:**
- Las facturas son accesibles mediante URL + token
- Funciona desde cualquier navegador/dispositivo sin login
- Mantiene la seguridad con tokens únicos de 64 caracteres

## 🔐 Seguridad

### Generación de Tokens
```typescript
const crypto = require('crypto');
const accessToken = crypto.randomBytes(32).toString('hex'); // 64 caracteres hexadecimales
```

### Características de Seguridad
- **Único:** Cada registro/transacción tiene su propio token
- **No predecible:** Generado con crypto random
- **No indexado:** Campo `select: false` en Mongoose (no aparece en queries por defecto)
- **Validación estricta:** Token debe coincidir exactamente
- **Solo lectura:** El token solo permite VER la factura, no modificarla

## 📊 Modelos Actualizados

### EventRegistration (Eventos Gratuitos)
```typescript
interface IEventRegistration {
  userId: ObjectId;
  eventId: ObjectId;
  registrationDate: Date;
  status: 'active' | 'cancelled';
  registrationNumber: string; // REG-timestamp-random
  accessToken: string; // Token de acceso público (64 chars hex)
  createdAt: Date;
  updatedAt: Date;
}
```

### BoldTransaction (Eventos Pagados)
```typescript
interface IBoldTransaction {
  // ... campos existentes ...
  accessToken?: string; // Token de acceso público (64 chars hex)
  // ... más campos ...
}
```

## 🔄 Flujo de Implementación

### Para Eventos Gratuitos

1. **Registro del usuario** (`/api/events/[id]/register`)
   ```typescript
   const accessToken = EventRegistration.generateAccessToken();
   const registration = await EventRegistration.create({
     userId, eventId, registrationNumber,
     accessToken // Token generado
   });
   ```

2. **Envío de WhatsApp** (Bird CRM)
   ```typescript
   const urlFactura = `${baseUrl}/api/events/registrations/${registrationId}/invoice?token=${accessToken}`;
   await sendEventRegistrationNotification({ urlFactura, ... });
   ```

3. **Acceso a factura** (`/api/events/registrations/[registrationId]/invoice`)
   ```typescript
   const token = searchParams.get('token');
   const registration = await EventRegistration.findById(id).select('+accessToken');
   
   if (registration.accessToken !== token) {
     return 403 Forbidden;
   }
   // Generar y retornar HTML de factura
   ```

### Para Eventos Pagados

1. **Aprobación de pago** (`/api/bold/webhook`)
   ```typescript
   if (!transaction.accessToken) {
     transaction.accessToken = crypto.randomBytes(32).toString('hex');
   }
   await transaction.markAsApproved(webhookData);
   ```

2. **Envío de WhatsApp** (Bold Webhook → Bird CRM)
   ```typescript
   const urlFactura = `${baseUrl}/api/bold/transactions/${transactionId}/invoice?token=${transaction.accessToken}`;
   await sendEventRegistrationNotification({ urlFactura, ... });
   ```

3. **Acceso a factura** (`/api/bold/transactions/[orderId]/invoice`)
   ```typescript
   const token = searchParams.get('token');
   
   if (token) {
     // Modo público con token
     const transaction = await BoldTransaction.findById(id).select('+accessToken');
     if (transaction.accessToken !== token) return 403;
   } else {
     // Modo autenticado (desde dashboard)
     const auth = await verifyAuth(request);
     if (!auth.isValid) return 401;
   }
   // Generar y retornar HTML de factura
   ```

## 🌐 URLs Generadas

### Eventos Gratuitos
```
https://bskmt.com/api/events/registrations/67abc123def456/invoice?token=a1b2c3d4e5f6...64chars
```

### Eventos Pagados
```
https://bskmt.com/api/bold/transactions/67xyz789ghi012/invoice?token=9z8y7x6w5v4u...64chars
```

## 📱 Integración con WhatsApp (Bird CRM)

### Datos Enviados al Webhook
```typescript
{
  nombreMiembro: "Juan Pérez",
  nombreEvento: "Taller de Primeros Auxilios",
  fechaEvento: "sábado, 15 de marzo de 2025, 09:00",
  lugarEvento: "Ibagué, Tolima",
  valorPagado: "Evento Gratuito" | "$50,000 COP",
  urlFactura: "https://bskmt.com/api/.../invoice?token=...",
  telefonoMiembro: "+573001234567"
}
```

### Webhook de Bird CRM
```
https://capture.us-west-1.nest.messagebird.com/webhooks/
  a2dd52ff-b949-4135-9196-7050c12229f3/
  54e5187d-ba66-415e-b022-de57b76e50a5
```

## 🎨 Comprobantes Generados

### Eventos Gratuitos
- Badge verde: "✨ EVENTO GRATUITO"
- Aviso amarillo: "Este es un evento gratuito. No se requiere pago"
- Tabla mostrando $0 COP
- Descuento 100% aplicado
- Número de registro: REG-timestamp-random

### Eventos Pagados
- Badge azul: Estado del pago
- Información de transacción Bold
- Monto pagado con desglose (subtotal, IVA)
- Método de pago (PSE, tarjeta, etc.)
- ID de transacción Bold

## 🔧 Funciones Auxiliares

### Generación de Token
```typescript
// En EventRegistration
static generateAccessToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}
```

### Generación de Número de Registro
```typescript
// En EventRegistration
static generateRegistrationNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REG-${timestamp}-${random}`;
}
```

### Formateo de Fecha (Bird CRM)
```typescript
export function formatEventDate(date: Date | string): string {
  const eventDate = new Date(date);
  return eventDate.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
```

## 🧪 Testing

### Probar Evento Gratuito
1. Registrarse en un evento gratuito
2. Verificar que llega WhatsApp con el enlace
3. Abrir enlace desde WhatsApp (ventana emergente)
4. Verificar que se ve la factura sin login
5. Intentar acceder con token incorrecto → 403 Forbidden

### Probar Evento Pagado
1. Registrarse y pagar evento
2. Esperar aprobación de Bold (webhook)
3. Verificar WhatsApp con enlace
4. Abrir desde WhatsApp
5. Verificar factura con datos de pago

### Probar desde Dashboard
1. Login en la plataforma
2. Ir a "Facturación y Pagos"
3. Click en "Ver Factura" (sin token en URL)
4. Verificar autenticación con cookies funciona
5. Logout y probar mismo enlace sin token → 401 Unauthorized

## ✅ Ventajas del Sistema

1. **UX Mejorado:** Usuario hace click y ve su factura inmediatamente
2. **Multiplataforma:** Funciona en cualquier dispositivo/navegador
3. **Seguro:** Tokens únicos imposibles de adivinar
4. **Dual-mode:** Soporta acceso público (token) y autenticado (dashboard)
5. **Auditable:** Los tokens están en la base de datos para rastreo
6. **No expira:** El token es permanente mientras exista el registro

## 🔒 Consideraciones de Privacidad

- ✅ No se requiere login para ver tu propia factura
- ✅ El token es único y privado para cada usuario
- ✅ No se puede listar facturas sin conocer el ID + token
- ✅ Solo lectura - no permite modificaciones
- ⚠️ Quien tenga el enlace completo puede ver la factura
- 💡 Se puede agregar expiración de tokens si se requiere mayor seguridad

## 📝 Archivos Modificados

### Modelos
- `/lib/models/EventRegistration.ts` - Agregado campo `accessToken`
- `/lib/models/BoldTransaction.ts` - Agregado campo `accessToken`

### Endpoints de Factura
- `/app/api/events/registrations/[registrationId]/invoice/route.ts` - Soporte para token
- `/app/api/bold/transactions/[orderId]/invoice/route.ts` - Soporte para token

### Registro y Webhook
- `/app/api/events/[id]/register/route.ts` - Genera token para eventos gratuitos
- `/app/api/bold/webhook/route.ts` - Genera token al aprobar pago

### Integraciones
- `/lib/bird-crm.ts` - Funciones de Bird CRM (sin cambios)

## 🚀 Próximos Pasos (Opcional)

1. **Expiración de tokens:** Agregar campo `tokenExpiresAt` para mayor seguridad
2. **Límite de accesos:** Contador de veces que se accedió con el token
3. **Regenerar token:** Endpoint para regenerar token si se compromete
4. **Dashboard unificado:** Mostrar eventos gratuitos y pagados juntos
5. **Descarga PDF:** Convertir HTML a PDF para descarga
6. **Analytics:** Rastrear cuándo se accede a las facturas

## 📚 Referencias

- [Mongoose Select False](https://mongoosejs.com/docs/api/schematype.html#schematype_SchemaType-select)
- [Node.js Crypto RandomBytes](https://nodejs.org/api/crypto.html#cryptorandombytessize-callback)
- [Next.js 15 Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Bird CRM Webhooks](https://docs.messagebird.com/)

---

**Implementado:** 3 de octubre de 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Producción
