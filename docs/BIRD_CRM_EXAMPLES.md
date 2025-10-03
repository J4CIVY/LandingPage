# Ejemplo de Payload para Bird CRM

## 📤 Datos de Ejemplo Completos

Este es un ejemplo del JSON que se envía al webhook de Bird CRM cuando un usuario se registra exitosamente en un evento.

### Ejemplo 1: Evento de Rally

```json
{
  "nombreMiembro": "Juan Carlos Pérez Rodríguez",
  "nombreEvento": "Rally Nacional Magdalena 2024",
  "fechaEvento": "sábado, 15 de marzo de 2025, 08:00",
  "lugarEvento": "Ibagué, Tolima",
  "valorPagado": "$150.000 COP",
  "urlFactura": "https://bskmt.com/api/bold/transactions/65f1a2b3c4d5e6f7g8h9i0j1/invoice",
  "telefonoMiembro": "+573001234567",
  "timestamp": "2024-03-10T14:30:00.000Z"
}
```

### Ejemplo 2: Evento de Capacitación

```json
{
  "nombreMiembro": "María Fernanda Gómez López",
  "nombreEvento": "Capacitación en Primeros Auxilios Nivel 1",
  "fechaEvento": "domingo, 20 de abril de 2025, 09:00",
  "lugarEvento": "Sede BSK MT, Ibagué",
  "valorPagado": "$80.000 COP",
  "urlFactura": "https://bskmt.com/api/bold/transactions/65f2b3c4d5e6f7g8h9i0j1k2/invoice",
  "telefonoMiembro": "+573112345678",
  "timestamp": "2024-04-01T10:15:00.000Z"
}
```

### Ejemplo 3: Evento Gratuito

```json
{
  "nombreMiembro": "Carlos Alberto Ruiz Gómez",
  "nombreEvento": "Charla Informativa - Seguridad Vial",
  "fechaEvento": "jueves, 25 de abril de 2025, 18:00",
  "lugarEvento": "Auditorio BSK MT, Ibagué",
  "valorPagado": "Evento Gratuito",
  "urlFactura": "https://bskmt.com/dashboard/events/65f3c4d5e6f7g8h9i0j1k2l3",
  "telefonoMiembro": "+573156789012",
  "timestamp": "2024-04-15T12:00:00.000Z"
}
```

### Ejemplo 4: Evento Sin Ubicación Confirmada

```json
{
  "nombreMiembro": "Pedro Antonio Martínez Silva",
  "nombreEvento": "Salida Técnica - Ruta Montañosa",
  "fechaEvento": "viernes, 10 de mayo de 2025, 06:00",
  "lugarEvento": "Por confirmar",
  "valorPagado": "$200.000 COP",
  "urlFactura": "https://bskmt.com/api/bold/transactions/65f3c4d5e6f7g8h9i0j1k2l3/invoice",
  "telefonoMiembro": "+573209876543",
  "timestamp": "2024-04-25T16:45:00.000Z"
}
```

## 🧪 Testing con cURL

### Simular envío directo al webhook de Bird CRM

```bash
curl -X POST \
  'https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/54e5187d-ba66-415e-b022-de57b76e50a5' \
  -H 'Content-Type: application/json' \
  -d '{
    "nombreMiembro": "Usuario de Prueba",
    "nombreEvento": "Evento de Prueba",
    "fechaEvento": "lunes, 01 de enero de 2025, 10:00",
    "lugarEvento": "Ibagué, Tolima",
    "valorPagado": "$50.000 COP",
    "urlFactura": "https://bskmt.com/test",
    "telefonoMiembro": "+573001234567",
    "timestamp": "2024-12-01T12:00:00.000Z"
  }'
```

### Reenviar notificación desde la API

```bash
# Reemplazar TRANSACTION_ID y ACCESS_TOKEN con valores reales
curl -X POST \
  'https://bskmt.com/api/bold/transactions/TRANSACTION_ID/resend-notification' \
  -H 'Cookie: bsk-access-token=ACCESS_TOKEN' \
  -H 'Content-Type: application/json'
```

## 📋 Casos de Uso

### Caso 1: Registro en Evento Gratuito

**Escenario:** Usuario se registra en un evento sin costo

**Flujo:**
1. Usuario va a `/dashboard/events/[id]`
2. Click en "Registrarse" (sin proceso de pago)
3. Sistema registra inmediatamente
4. Envía notificación WhatsApp automáticamente

**Datos enviados:**
- ✅ Nombre completo del usuario
- ✅ Nombre del evento
- ✅ Fecha con formato largo
- ✅ Ubicación del evento
- ✅ valorPagado: "Evento Gratuito"
- ✅ urlFactura: Link a detalles del evento en dashboard

### Caso 2: Registro con Pago

**Escenario:** Usuario se registra en evento y paga inmediatamente

**Flujo:**
1. Usuario completa registro en `/dashboard/events/[id]`
2. Realiza pago a través de Bold
3. Bold confirma pago y envía webhook
4. Sistema automáticamente envía notificación WhatsApp

**Datos enviados:**
- ✅ Nombre completo del usuario
- ✅ Nombre del evento
- ✅ Fecha con formato largo
- ✅ Ubicación del evento
- ✅ Monto pagado con formato
- ✅ URL directa a factura PDF

### Caso 3: Pago Antiguo (Reenvío Manual)

**Escenario:** Necesitas reenviar notificación de un pago antiguo

**Comando:**
```bash
# 1. Obtener ID de transacción desde MongoDB
mongo
> use bskmt
> db.boldtransactions.find({ status: "APPROVED" }).limit(1)

# 2. Reenviar con el endpoint manual
curl -X POST \
  'https://bskmt.com/api/bold/transactions/TRANSACTION_ID/resend-notification' \
  -H 'Cookie: bsk-access-token=YOUR_TOKEN'
```

### Caso 3: Usuario Sin Teléfono

**Escenario:** Usuario no tiene teléfono registrado

**Resultado:**
- ⚠️ No se envía notificación de WhatsApp
- ✅ Email de confirmación SÍ se envía
- ✅ Registro del evento se completa normalmente

**Log esperado:**
```
⚠️ Usuario no tiene número de teléfono registrado, no se envió notificación de WhatsApp
```

**Solución:**
```javascript
// Actualizar teléfono del usuario en MongoDB
db.users.updateOne(
  { _id: ObjectId("USER_ID") },
  { $set: { phone: "+573001234567" } }
)

// Reenviar notificación
curl -X POST https://bskmt.com/api/bold/transactions/TRANSACTION_ID/resend-notification \
  -H "Cookie: bsk-access-token=TOKEN"
```

## 🔍 Verificación de Datos

### Checklist antes de enviar

- [ ] `nombreMiembro`: No vacío, contiene nombre y apellido
- [ ] `nombreEvento`: Nombre descriptivo del evento
- [ ] `fechaEvento`: Formato legible en español
- [ ] `lugarEvento`: Ciudad y departamento (o "Por confirmar")
- [ ] `valorPagado`: Formato $xxx.xxx COP
- [ ] `urlFactura`: URL válida que abre la factura
- [ ] `telefonoMiembro`: Formato +57xxxxxxxxxx

### Validación de URL de Factura

```bash
# La URL debe responder con HTML de la factura
curl -I https://bskmt.com/api/bold/transactions/TRANSACTION_ID/invoice

# Debe retornar:
# HTTP/1.1 200 OK
# Content-Type: text/html; charset=utf-8
```

## 📊 Plantilla de WhatsApp - Preview

```
Hola Juan Carlos Pérez Rodríguez,

✅ Hemos registrado tu inscripción al evento:
📌 Rally Nacional Magdalena 2024
📅 Fecha: sábado, 15 de marzo de 2025, 08:00
📍 Lugar: Ibagué, Tolima
💲 Valor de inscripción: $150.000 COP
🔗 Estado de pago: Confirmado

📄 Adjunto encontrarás tu factura correspondiente a esta inscripción https://bskmt.com/api/bold/transactions/65f1a2b3c4d5e6f7g8h9i0j1/invoice.

👉 Además, en nuestra página oficial podrás consultar toda la información detallada sobre este y otros eventos, recomendaciones e instrucciones para tu participación:
🌐 www.bskmt.com/dashboard

Gracias por ser parte de la familia BSKMT.
¡Nos vemos en la pista! 🏁
```

## 🔄 Variables Bird CRM

En Bird CRM, debes configurar las siguientes variables en tu plantilla:

| Variable en Bird | Valor del JSON | Ejemplo |
|-----------------|---------------|---------|
| `{{nombreMiembro}}` | `nombreMiembro` | Juan Carlos Pérez Rodríguez |
| `{{nombreEvento}}` | `nombreEvento` | Rally Nacional 2024 |
| `{{fechaEvento}}` | `fechaEvento` | sábado, 15 de marzo de 2025, 08:00 |
| `{{lugarEvento}}` | `lugarEvento` | Ibagué, Tolima |
| `{{valorPagado}}` | `valorPagado` | $150.000 COP |
| `{{urlFactura}}` | `urlFactura` | https://bskmt.com/api/bold/... |

## 🐛 Debug y Troubleshooting

### Problema: Datos vacíos o null

**Verificar en MongoDB:**
```javascript
// Ver datos del usuario
db.users.findOne({ _id: ObjectId("USER_ID") })

// Ver datos del evento
db.events.findOne({ _id: ObjectId("EVENT_ID") })

// Ver datos de la transacción
db.boldtransactions.findOne({ _id: ObjectId("TRANSACTION_ID") })
```

### Problema: Formato de fecha incorrecto

**Esperado:**
```
sábado, 15 de marzo de 2025, 08:00
```

**Si aparece diferente, verificar:**
```javascript
// Función de formateo
formatEventDate(event.startDate)

// Debe usar locale 'es-CO'
```

### Problema: URL de factura da 404

**Verificar:**
1. Transaction ID es correcto
2. Transacción existe en BD
3. Usuario tiene permisos para ver la factura

```bash
# Test directo
curl https://bskmt.com/api/bold/transactions/TRANSACTION_ID/invoice
```

## 📈 Monitoreo en Producción

### Query para ver envíos recientes

```javascript
// Ver últimas 10 transacciones aprobadas
db.boldtransactions.find({ 
  status: "APPROVED" 
}).sort({ 
  createdAt: -1 
}).limit(10).pretty()

// Ver usuarios que completaron pago hoy
db.boldtransactions.find({
  status: "APPROVED",
  createdAt: {
    $gte: new Date(new Date().setHours(0,0,0,0)),
    $lt: new Date(new Date().setHours(23,59,59,999))
  }
})
```

### Logs a monitorear

```bash
# Ver envíos de WhatsApp
tail -f /var/log/nextjs/app.log | grep "Bird CRM"

# Ver solo éxitos
tail -f /var/log/nextjs/app.log | grep "✅ Notificación de WhatsApp enviada"

# Ver solo errores
tail -f /var/log/nextjs/app.log | grep "❌ Error al enviar notificación"
```

---

**Última actualización:** 2024
**Versión:** 1.0.0
