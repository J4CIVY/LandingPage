# Integración Bird CRM - Notificaciones de WhatsApp

## 📋 Descripción General

Esta integración automatiza el envío de notificaciones de WhatsApp a los miembros cuando se registran exitosamente en un evento con pago confirmado, utilizando Bird CRM (MessageBird) como plataforma de mensajería.

## 🔄 Flujo de la Automatización

### Flujo para Eventos de Pago

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario se registra en evento y realiza el pago             │
│    └─> Bold Payment Gateway procesa el pago                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Bold confirma el pago y envía webhook                       │
│    └─> POST a /api/bold/webhook                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Webhook actualiza transacción y registra al usuario         │
│    └─> BoldTransaction.status = APPROVED                        │
│    └─> Event.participants += userId                             │
│    └─> User.eventsRegistered += eventId                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Sistema envía email de confirmación                         │
│    └─> Via Zoho Mail / Gmail                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Sistema envía datos a Bird CRM                              │
│    └─> POST a Bird Webhook con variables del evento             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Bird CRM procesa y envía mensaje de WhatsApp                │
│    └─> Usa plantilla configurada en Bird                        │
│    └─> Envía a número de teléfono del usuario                   │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo para Eventos Gratuitos

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario se registra en evento gratuito                      │
│    └─> POST a /api/events/[id]/register                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Sistema valida y registra al usuario                        │
│    └─> Event.participants += userId                             │
│    └─> User.events += eventId                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Sistema envía datos a Bird CRM                              │
│    └─> POST a Bird Webhook con variables del evento             │
│    └─> valorPagado = "Evento Gratuito"                          │
│    └─> urlFactura = Link a detalles del evento                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Bird CRM procesa y envía mensaje de WhatsApp                │
│    └─> Usa plantilla configurada en Bird                        │
│    └─> Envía a número de teléfono del usuario                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Configuración

### Variables de Entorno

```env
# URL base de la aplicación (para generar URLs de facturas)
NEXT_PUBLIC_BASE_URL=https://bskmt.com
```

### Bird CRM Webhook URL

```
https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/54e5187d-ba66-415e-b022-de57b76e50a5
```

## 📤 Datos Enviados a Bird CRM

### Formato JSON

```json
{
  "nombreMiembro": "Juan Pérez",
  "nombreEvento": "Rally Nacional 2024",
  "fechaEvento": "sábado, 15 de marzo de 2025, 08:00",
  "lugarEvento": "Ibagué, Tolima",
  "valorPagado": "$150.000 COP",
  "urlFactura": "https://bskmt.com/api/bold/transactions/65abc123def456/invoice",
  "telefonoMiembro": "+573001234567",
  "timestamp": "2024-03-10T14:30:00.000Z"
}
```

### Mapeo de Variables

| Variable API | Variable Plantilla WhatsApp | Descripción |
|--------------|----------------------------|-------------|
| `nombreMiembro` | `[Nombre del miembro]` | Nombre completo del usuario |
| `nombreEvento` | `[Nombre del evento]` | Nombre del evento |
| `fechaEvento` | `[Fecha del evento]` | Fecha formateada del evento |
| `lugarEvento` | `[Lugar del evento]` | Ubicación del evento |
| `valorPagado` | `[Valor pagado]` | Monto con formato de moneda |
| `urlFactura` | `[URL de la factura]` | Link directo a la factura |
| `telefonoMiembro` | - | Número de destino (no en plantilla) |

## 📱 Plantilla de WhatsApp

```
Hola [Nombre del miembro],

✅ Hemos registrado tu inscripción al evento:
📌 [Nombre del evento]
📅 Fecha: [Fecha del evento]
📍 Lugar: [Lugar del evento]
💲 Valor de inscripción: [Valor pagado]
🔗 Estado de pago: Confirmado

📄 Adjunto encontrarás tu factura correspondiente a esta inscripción [URL de la factura].

👉 Además, en nuestra página oficial podrás consultar toda la información detallada sobre este y otros eventos, recomendaciones e instrucciones para tu participación:
🌐 www.bskmt.com/dashboard

Gracias por ser parte de la familia BSKMT.
¡Nos vemos en la pista! 🏁
```

## 🗂️ Archivos Creados/Modificados

### Nuevos Archivos

1. **`/lib/bird-crm.ts`**
   - Servicio de integración con Bird CRM
   - Funciones para enviar notificaciones
   - Formateo de datos para WhatsApp

2. **`/app/api/bold/transactions/[orderId]/resend-notification/route.ts`**
   - Endpoint para reenviar notificaciones manualmente
   - Útil para testing y recuperación de fallos

3. **`/docs/BIRD_CRM_INTEGRATION.md`**
   - Este documento de documentación

### Archivos Modificados

1. **`/app/api/bold/webhook/route.ts`**
   - Agregado envío de notificación WhatsApp en `handleApprovedPayment()`
   - Import del servicio Bird CRM
   - Se ejecuta cuando Bold confirma un pago

2. **`/app/api/events/[id]/register/route.ts`**
   - Agregado envío de notificación WhatsApp para eventos gratuitos
   - Se ejecuta después del registro exitoso
   - Solo para eventos con price === 0 o sin price

## 🔌 API Endpoints

### 1. Webhook de Bold (Automático)

**Ruta:** `POST /api/bold/webhook`

**Descripción:** Recibe notificaciones de Bold cuando cambia el estado de un pago.

**Flujo con Bird CRM:**
- Cuando `payment_status === 'APPROVED'`
- Después de registrar al usuario en el evento
- Después de enviar email de confirmación
- Envía datos a Bird CRM webhook

### 2. Reenviar Notificación (Manual)

**Ruta:** `POST /api/bold/transactions/[orderId]/resend-notification`

**Autenticación:** Requerida (JWT)

**Descripción:** Permite reenviar manualmente la notificación de WhatsApp para un pago específico.

**Validaciones:**
- Usuario debe ser el propietario de la transacción o admin
- Transacción debe tener estado `APPROVED`
- Usuario debe tener teléfono registrado

**Ejemplo de uso:**

```bash
curl -X POST https://bskmt.com/api/bold/transactions/65abc123def456/resend-notification \
  -H "Cookie: bsk-access-token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Notificación enviada exitosamente",
  "data": {
    "phone": "+573001234567",
    "event": "Rally Nacional 2024",
    "transaction": "ORD-20240310-123456"
  }
}
```

## 🧪 Testing

### Probar Integración Completa

1. **Crear un pago de prueba:**
   ```bash
   # Registrarse en un evento que requiere pago
   # El sistema creará una transacción en estado PENDING
   ```

2. **Simular webhook de Bold:**
   ```bash
   curl -X POST https://bskmt.com/api/bold/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "reference_id": "ORD-20240310-123456",
       "transaction_id": "TRX-BOLD-789",
       "payment_status": "APPROVED",
       "payment_method": "CARD",
       "total": 150000,
       "payer_email": "usuario@example.com"
     }'
   ```

3. **Verificar en logs:**
   ```bash
   # Buscar en logs del servidor
   grep "Enviando notificación a Bird CRM" /var/log/nextjs/app.log
   grep "Notificación enviada exitosamente" /var/log/nextjs/app.log
   ```

4. **Verificar en Bird CRM:**
   - Ir a Bird CRM Dashboard
   - Verificar que llegó el webhook
   - Revisar si se envió el mensaje de WhatsApp

### Reenviar Notificación Manualmente

```bash
# Obtener el ID de la transacción desde MongoDB o dashboard
# Luego hacer POST al endpoint de reenvío

curl -X POST https://bskmt.com/api/bold/transactions/TRANSACTION_ID/resend-notification \
  -H "Cookie: bsk-access-token=YOUR_TOKEN"
```

## 🔍 Logs y Monitoreo

### Logs Importantes

```javascript
// Cuando se envía notificación
📱 Enviando notificación de WhatsApp a Bird CRM...

// Éxito
✅ Notificación de WhatsApp enviada a: +573001234567

// Error
❌ Error al enviar notificación de WhatsApp: Error message

// Usuario sin teléfono
⚠️ Usuario no tiene número de teléfono registrado, no se envió notificación de WhatsApp
```

### Verificar en Base de Datos

```javascript
// Ver transacciones aprobadas sin notificación enviada
db.boldtransactions.find({
  status: "APPROVED",
  whatsappNotificationSent: { $ne: true }
})

// Ver eventos con pagos confirmados
db.boldtransactions.aggregate([
  { $match: { status: "APPROVED" } },
  { $lookup: {
      from: "events",
      localField: "eventId",
      foreignField: "_id",
      as: "event"
  }},
  { $project: {
      orderId: 1,
      amount: 1,
      "event.name": 1,
      createdAt: 1
  }}
])
```

## ⚠️ Consideraciones Importantes

### Campos Requeridos del Usuario

Para que funcione la notificación, el usuario DEBE tener:
- ✅ `phone` o `telefono`: Número de teléfono con código de país
- ✅ `firstName` / `nombre`: Nombre del usuario
- ✅ `lastName` / `apellido`: Apellido del usuario

### Formato de Teléfono

El número debe incluir código de país:
- ✅ Correcto: `+573001234567`
- ✅ Correcto: `573001234567`
- ❌ Incorrecto: `3001234567` (sin código de país)

### Ubicación del Evento

El sistema intenta obtener la ubicación en este orden:
1. `event.departureLocation.city, state`
2. `event.location`
3. `event.ubicacion`
4. Por defecto: "Por confirmar"

### Manejo de Errores

- ❌ Si falla el envío a Bird CRM, NO se detiene el proceso de pago
- ✅ El pago se marca como APPROVED de todas formas
- ✅ El usuario se registra en el evento
- ✅ Se envía email de confirmación
- ⚠️ Solo falla silenciosamente la notificación de WhatsApp

## 🔐 Seguridad

### Endpoint de Reenvío

- ✅ Requiere autenticación JWT
- ✅ Valida que el usuario sea propietario o admin
- ✅ Solo permite reenviar notificaciones de pagos aprobados
- ✅ Valida existencia de teléfono antes de enviar

### Webhook de Bold

- ⚠️ No tiene autenticación (Bold no la requiere)
- ✅ Valida estructura de datos recibidos
- ✅ Valida existencia de transacción en BD
- ✅ Solo procesa estados conocidos

### Datos Sensibles

- ✅ No se envía información de tarjeta de crédito
- ✅ No se envía información bancaria
- ✅ Solo se envían datos del evento y confirmación

## 📊 Métricas y Reporting

### KPIs a Monitorear

1. **Tasa de éxito de envío:**
   ```
   Notificaciones enviadas / Pagos aprobados * 100
   ```

2. **Tiempo de envío:**
   ```
   Tiempo desde pago aprobado hasta envío de WhatsApp
   ```

3. **Usuarios sin teléfono:**
   ```
   Pagos aprobados sin teléfono / Total pagos aprobados * 100
   ```

### Query de Estadísticas

```javascript
// Estadísticas de notificaciones
db.boldtransactions.aggregate([
  {
    $match: {
      status: "APPROVED",
      createdAt: { $gte: new Date("2024-01-01") }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  },
  {
    $project: {
      hasPhone: {
        $cond: [
          { $or: [
            { $ne: ["$user.phone", null] },
            { $ne: ["$user.telefono", null] }
          ]},
          1,
          0
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      totalApproved: { $sum: 1 },
      withPhone: { $sum: "$hasPhone" },
      withoutPhone: { $sum: { $subtract: [1, "$hasPhone"] } }
    }
  }
])
```

## 🚀 Mejoras Futuras

### Corto Plazo
- [ ] Agregar campo `whatsappNotificationSent` al modelo BoldTransaction
- [ ] Registrar timestamp de envío de notificación
- [ ] Panel admin para ver estadísticas de envíos

### Mediano Plazo
- [ ] Reintentos automáticos si falla el envío
- [ ] Sistema de cola para envíos masivos
- [ ] Notificaciones de recordatorio 24h antes del evento

### Largo Plazo
- [ ] Integración con otros canales (SMS, Email personalizado)
- [ ] Plantillas dinámicas según tipo de evento
- [ ] Sistema de preferencias de notificaciones por usuario

## 🆘 Troubleshooting

### Problema: No se envían notificaciones

**Verificar:**
1. ✅ Usuario tiene teléfono registrado
2. ✅ Webhook URL de Bird CRM es correcto
3. ✅ Bird CRM está activo y configurado
4. ✅ Logs del servidor para errores

**Solución:**
```bash
# Ver logs del webhook
tail -f /var/log/nextjs/app.log | grep "Bird CRM"

# Reenviar manualmente
curl -X POST https://bskmt.com/api/bold/transactions/ID/resend-notification \
  -H "Cookie: bsk-access-token=TOKEN"
```

### Problema: Formato de teléfono incorrecto

**Síntomas:** Bird CRM rechaza el mensaje

**Solución:** Actualizar teléfono del usuario con código de país:
```javascript
db.users.updateOne(
  { _id: ObjectId("USER_ID") },
  { $set: { phone: "+573001234567" } }
)
```

### Problema: URL de factura no funciona

**Verificar:**
1. ✅ `NEXT_PUBLIC_BASE_URL` está configurado
2. ✅ Transacción existe en BD
3. ✅ ID de transacción es correcto

**Solución:**
```javascript
// Verificar transacción
db.boldtransactions.findOne({ _id: ObjectId("TRANSACTION_ID") })

// Probar URL manualmente
curl https://bskmt.com/api/bold/transactions/TRANSACTION_ID/invoice
```

## 📞 Soporte

Para problemas con:
- **Integración del webhook:** Revisar logs en `/var/log/nextjs/`
- **Bird CRM:** Contactar soporte de MessageBird
- **Formato de datos:** Revisar este documento y código fuente

---

**Última actualización:** 2024
**Versión:** 1.0.0
**Responsable:** Equipo de Desarrollo BSK MT
