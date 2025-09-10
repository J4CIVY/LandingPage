# WhatsApp Notification Service

Este documento describe la implementación del servicio de notificaciones de WhatsApp para BSK Motorcycle Team.

## Funcionalidad

El sistema envía automáticamente una notificación de bienvenida por WhatsApp cuando un usuario verifica su correo electrónico y su cuenta se activa.

## Flujo de Activación

1. **Usuario se registra** → Se crea la cuenta pero está inactiva
2. **Usuario verifica email** → Se activa la cuenta
3. **Sistema envía email de bienvenida** → Email automático
4. **Sistema envía notificación WhatsApp** → **NUEVA FUNCIONALIDAD** ✨

## Implementación Técnica

### Archivos Modificados/Creados

- `lib/whatsapp-service.ts` - Servicio para enviar notificaciones
- `app/api/auth/verify-email/route.ts` - Agregado envío de WhatsApp
- `app/api/test/whatsapp/route.ts` - Endpoint de prueba

### Webhook Externo

**URL:** `https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/a071d5c3-9566-471d-8cb0-057c6e222da3`

**Método:** POST

**Datos enviados:**
```json
{
  "documentNumber": "12345678",
  "firstName": "Juan Pérez",
  "whatsapp": "+573001234567",
  "membershipType": "friend"
}
```

## Pruebas

### Endpoint de Prueba

Para probar la integración sin hacer un registro completo:

**URL:** `POST /api/test/whatsapp`

**Ejemplo de solicitud:**
```bash
curl -X POST http://localhost:3000/api/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "documentNumber": "12345678",
    "firstName": "Juan Pérez",
    "whatsapp": "+573001234567",
    "membershipType": "friend"
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Notificación de WhatsApp enviada exitosamente",
  "data": {
    "documentNumber": "12345678",
    "firstName": "Juan Pérez",
    "whatsapp": "+573001234567",
    "membershipType": "friend",
    "timestamp": "2025-09-10T15:30:00Z"
  }
}
```

### Información del Endpoint

Para ver información sobre cómo usar el endpoint:

**URL:** `GET /api/test/whatsapp`

## Características de Seguridad

1. **Validación de datos** - Todos los campos son validados antes del envío
2. **Manejo de errores** - Los errores de WhatsApp no afectan la verificación de email
3. **Logs detallados** - Se registran todos los intentos de envío
4. **Modo seguro** - Función `sendWelcomeNotificationSafe` que no lanza errores

## Tipos de Membresía Soportados

- `friend` - Amigo del club
- `member` - Miembro activo
- `premium` - Miembro premium

## Condicionales

- Solo se envía WhatsApp si el usuario tiene número de WhatsApp registrado
- Si no hay WhatsApp, se registra en logs pero no falla el proceso
- Si falla el envío de WhatsApp, se registra el error pero no afecta la activación de cuenta

## Logs

El sistema genera logs detallados:

```
📱 Enviando notificación de WhatsApp: { documentNumber, firstName, whatsapp, membershipType }
✅ Notificación de WhatsApp enviada exitosamente
⚠️ No se pudo enviar la notificación de WhatsApp para: [nombre]
❌ Error enviando notificación de WhatsApp: [error]
📱 Usuario sin WhatsApp, omitiendo notificación: [nombre]
```

## Mantenimiento

- El webhook URL se puede cambiar en `lib/whatsapp-service.ts`
- Los tipos de datos se validan con Zod
- El servicio es modular y reutilizable
