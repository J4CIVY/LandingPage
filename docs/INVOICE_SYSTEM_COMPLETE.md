# Sistema de Facturación Completo - BSK Motorcycle Team

## 📋 Resumen

Sistema de facturación automática integrado con WhatsApp para eventos pagados y gratuitos del club BSK Motorcycle Team.

## 🏢 Datos del Club

### Información Oficial
- **Nombre Comercial:** BSK Motorcycle Team
- **Razón Social:** Organización Motear SAS
- **NIT:** 901444877-6
- **Dirección:** Carrera 5 A No. 36 A Sur 28, 110431 Ayacucho, San Cristóbal, Bogotá D.C., Colombia
- **Teléfono:** 3004902449
- **Email:** contacto@bskmt.com

## 🎯 Características Implementadas

### ✅ Eventos Gratuitos

**Modelo:** `EventRegistration`
- Campo `registrationNumber`: Número único REG-{timestamp}-{random}
- Campo `accessToken`: Token de 64 caracteres para acceso público
- Estado: 'active' | 'cancelled'

**Endpoint de Factura:**
```
GET /api/events/registrations/{registrationId}/invoice?token={accessToken}
```

**Datos Incluidos:**
- ✅ Información completa del club (nombre, razón social, NIT, dirección)
- ✅ Factura ID (MongoDB _id)
- ✅ Fecha de registro
- ✅ Nombre completo del participante
- ✅ Tipo y número de documento
- ✅ **Código interno del miembro** (membershipNumber)
- ✅ Email del participante
- ✅ Teléfono del participante
- ✅ Información del evento (nombre, fecha, ubicación)
- ✅ Badge "EVENTO GRATUITO"
- ✅ Tabla de conceptos con $0 COP
- ✅ Total: $0 COP

**Notificación WhatsApp:**
```javascript
{
  nombreMiembro: "Juan Pérez",
  nombreEvento: "Rodada Nacional",
  fechaEvento: "sábado, 15 de marzo de 2025",
  lugarEvento: "Bogotá, Cundinamarca",
  valorPagado: "Evento Gratuito",
  urlFactura: "https://bskmt.com/api/events/registrations/123/invoice?token=abc...",
  telefonoMiembro: "3001234567"
}
```

### ✅ Eventos Pagados

**Modelo:** `BoldTransaction`
- Campo `orderId`: ID único de la orden
- Campo `accessToken`: Token de 64 caracteres para acceso público
- Estado: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FAILED'

**Endpoint de Factura:**
```
GET /api/bold/transactions/{orderId}/invoice?token={accessToken}
```

**Datos Incluidos:**
- ✅ Información completa del club (nombre, razón social, NIT, dirección)
- ✅ Factura ID (MongoDB _id)
- ✅ Fecha de pago
- ✅ Nombre completo del cliente
- ✅ Tipo y número de documento
- ✅ **Código interno del miembro** (membershipNumber)
- ✅ Email del cliente
- ✅ Teléfono del cliente
- ✅ ID de transacción Bold
- ✅ Método de pago
- ✅ Información del evento (nombre, fecha, ubicación)
- ✅ Badge "PAGADO"
- ✅ Tabla de conceptos con monto real
- ✅ Subtotal e IVA
- ✅ Total en COP

**Notificación WhatsApp:**
```javascript
{
  nombreMiembro: "María González",
  nombreEvento: "Tour Costa Caribe",
  fechaEvento: "domingo, 20 de abril de 2025",
  lugarEvento: "Santa Marta, Magdalena",
  valorPagado: "$250,000 COP",
  urlFactura: "https://bskmt.com/api/bold/transactions/456/invoice?token=xyz...",
  telefonoMiembro: "3007654321"
}
```

## 🔐 Sistema de Seguridad

### Acceso Dual

**1. Acceso Público (con token):**
- Usado desde WhatsApp, emails, enlaces compartidos
- No requiere login
- Token único de 64 caracteres (imposible de adivinar)
- URL: `/invoice?token=abc123...`

**2. Acceso Autenticado (sin token):**
- Usado desde el dashboard del usuario
- Requiere sesión activa (cookies)
- URL: `/invoice`

### Protecciones Implementadas
- ✅ Token único por registro/transacción
- ✅ Campo `select: false` (no aparece en queries normales)
- ✅ Solo lectura (no permite modificaciones)
- ✅ Validación estricta de coincidencia de token
- ✅ Solo facturas de registros/pagos confirmados

## 🔄 Flujo Completo

### Eventos Gratuitos

1. Usuario se registra en evento gratuito
2. Sistema crea `EventRegistration` con:
   - `registrationNumber`: REG-1709654321-1234
   - `accessToken`: 64 caracteres hex aleatorios
3. Sistema envía notificación WhatsApp via Bird CRM con URL + token
4. Usuario hace click desde WhatsApp
5. Se abre factura sin necesidad de login
6. Usuario puede imprimir/guardar comprobante

### Eventos Pagados

1. Usuario inicia proceso de pago con Bold
2. Bold procesa pago y envía webhook
3. Sistema crea/actualiza `BoldTransaction` con:
   - `orderId`: ID único de orden
   - `accessToken`: 64 caracteres hex aleatorios
4. Sistema marca pago como APPROVED
5. Sistema registra usuario en evento
6. Sistema envía notificación WhatsApp via Bird CRM con URL + token
7. Usuario hace click desde WhatsApp
8. Se abre factura sin necesidad de login
9. Usuario puede imprimir/guardar factura

## 📱 Integración Bird CRM

**Webhook URL:**
```
https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/54e5187d-ba66-415e-b022-de57b76e50a5
```

**Datos Enviados:**
```json
{
  "nombreMiembro": "string",
  "nombreEvento": "string",
  "fechaEvento": "string (formato largo en español)",
  "lugarEvento": "string",
  "valorPagado": "string (monto o 'Evento Gratuito')",
  "urlFactura": "string (URL con token)",
  "telefonoMiembro": "string"
}
```

## 📄 Archivos Modificados

### Modelos
- `/lib/models/EventRegistration.ts` - Modelo de registros gratuitos
- `/lib/models/BoldTransaction.ts` - Modelo de transacciones pagadas

### Endpoints
- `/app/api/events/[id]/register/route.ts` - Registro en eventos
- `/app/api/events/registrations/[registrationId]/invoice/route.ts` - Factura gratuita
- `/app/api/bold/webhook/route.ts` - Webhook de Bold
- `/app/api/bold/transactions/[orderId]/invoice/route.ts` - Factura pagada

### Servicios
- `/lib/bird-crm.ts` - Integración con Bird CRM

## ✅ Ventajas del Sistema

1. **Accesibilidad Universal:** Facturas accesibles desde cualquier dispositivo sin login
2. **Seguridad:** Tokens únicos e imposibles de adivinar
3. **Automatización:** Envío automático via WhatsApp
4. **Cumplimiento:** Todas las transacciones generan factura
5. **Profesionalismo:** Facturas con datos oficiales del club
6. **Trazabilidad:** Código interno del miembro en cada factura
7. **UX Mejorada:** Un click desde WhatsApp para ver factura

## 🎨 Diseño de Facturas

### Eventos Gratuitos (Verde)
- Color primario: `#10b981` (verde)
- Badge: "✨ EVENTO GRATUITO"
- Aviso amarillo explicativo
- Montos: $0 COP

### Eventos Pagados (Azul)
- Color primario: `#2563eb` (azul)
- Badge: "✓ PAGADO"
- Método de pago visible
- Montos reales en COP

## 📊 Datos Incluidos en Facturas

### Encabezado del Club
```
BSK Motorcycle Team
Organización Motear SAS
NIT: 901444877-6
Carrera 5 A No. 36 A Sur 28
110431 Ayacucho, San Cristóbal
Bogotá D.C., Colombia
Tel: 3004902449
Email: contacto@bskmt.com
```

### Datos del Participante/Cliente
- Nombre completo
- Tipo y número de documento
- **Código interno del miembro** ⭐
- Email
- Teléfono

### Información del Evento
- Nombre del evento
- Fecha y hora
- Ubicación
- Descripción (primeros 200 caracteres)

### Detalles de Transacción
- Factura ID (MongoDB ObjectId)
- Fecha de registro/pago
- Concepto
- Cantidad
- Precio unitario
- Total

## 🚀 Estado Actual

✅ **Sistema Completo y Funcional**
- Build exitoso sin errores
- Facturas con datos reales del club
- Código interno del miembro incluido
- Acceso público con tokens
- Integración WhatsApp activa

## 📝 Notas Técnicas

### Generación de Tokens
```typescript
const crypto = require('crypto');
const accessToken = crypto.randomBytes(32).toString('hex');
// Resultado: 64 caracteres hexadecimales
```

### Validación de Token
```typescript
const { searchParams } = new URL(request.url);
const accessToken = searchParams.get('token');

const doc = await Model.findById(id).select('+accessToken').lean();

if (doc.accessToken !== accessToken) {
  return error(403, 'Token inválido');
}
```

### Formato de URL
```
https://bskmt.com/api/events/registrations/{id}/invoice?token={token}
https://bskmt.com/api/bold/transactions/{id}/invoice?token={token}
```

## 🔜 Posibles Mejoras Futuras

- [ ] Dashboard de facturación unificado (pagadas + gratuitas)
- [ ] Exportación a PDF
- [ ] Envío por email automático
- [ ] Búsqueda de facturas por código de miembro
- [ ] Estadísticas de facturación
- [ ] Notificaciones recordatorio

---

**Documentación creada:** 3 de octubre de 2025
**Autor:** GitHub Copilot
**Versión:** 1.0.0
