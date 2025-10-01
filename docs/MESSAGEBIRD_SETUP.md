# Guía de Configuración de MessageBird para 2FA

## Paso 1: Configurar el Template de WhatsApp

1. Ve a **MessageBird Studio** → **Templates**
2. Crea un nuevo template llamado **"OTP Message"**
3. Selecciona **WhatsApp** como canal
4. Selecciona **Spanish (Colombia)** como idioma
5. Categoría: **Authentication** (o **Transactional**)

### Template Sugerido:

```
Hola {{1}}!

Tu código de verificación BSK es: *{{2}}*

Este código expira en 5 minutos.

Si no solicitaste este código, ignora este mensaje.

- BSK Motorcycle Team
```

**Variables:**
- `{{1}}` = Nombre del usuario
- `{{2}}` = Código OTP

6. Envía el template para aprobación de WhatsApp (puede tardar 24-48 horas)

---

## Paso 2: Crear el Flow

### 2.1 Webhook Trigger (Entrada)

1. Crea un nuevo Flow
2. Añade un **Webhook** como trigger
3. La URL será generada automáticamente:
   ```
   https://capture.us-west-1.nest.messagebird.com/webhooks/YOUR-WORKSPACE-ID/YOUR-FLOW-ID
   ```
4. Método: **POST**
5. Content-Type: **application/json**

**Payload esperado:**
```json
{
  "otp": "ABC123",
  "phoneNumber": "+573001234567",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "timestamp": "2025-10-01T12:00:00Z"
}
```

### 2.2 Send Template Message (Envío)

1. Añade una acción **"Send template message to channel"**
2. Configuración:
   - **Channel**: WhatsApp
   - **Receiver Type**: By Identifier
   - **Identifier Value**: `{{trigger.body.phoneNumber}}`
   - **Template**: OTP Message
   - **Language**: Spanish (Colombia)

3. Variables del template:
   - Variable 1 (nombre): `{{trigger.body.name}}`
   - Variable 2 (OTP): `{{trigger.body.otp}}`

4. **Use Case**: Authentication o Marketing
5. **UTM**: enabled (opcional)

### 2.3 Response (Opcional)

Añade un **HTTP Response** para confirmar recepción:

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "timestamp": "{{$now}}"
}
```

---

## Paso 3: Configurar Variables en tu Aplicación

1. Copia la URL del webhook generada en el Paso 2.1
2. Actualiza el archivo `/lib/2fa-utils.ts`:

```typescript
const webhookUrl = 'https://capture.us-west-1.nest.messagebird.com/webhooks/YOUR-WORKSPACE-ID/YOUR-FLOW-ID';
```

O usa variables de entorno:

```bash
# .env.local
MESSAGEBIRD_WEBHOOK_URL=https://capture.us-west-1.nest.messagebird.com/webhooks/YOUR-WORKSPACE-ID/YOUR-FLOW-ID
```

Y actualiza `2fa-utils.ts`:

```typescript
const webhookUrl = process.env.MESSAGEBIRD_WEBHOOK_URL || '';
```

---

## Paso 4: Testing

### 4.1 Test del Template (en MessageBird)

1. Ve a tu Flow
2. Click en **"Test"** en el step del Webhook
3. Click **"Update test data"**
4. Envía este payload de prueba:

```json
{
  "otp": "TEST12",
  "phoneNumber": "+573001234567",
  "email": "test@ejemplo.com",
  "name": "Test User",
  "timestamp": "2025-10-01T12:00:00Z"
}
```

5. Verifica que el mensaje llegue a WhatsApp

### 4.2 Test desde tu Aplicación

```bash
# Usando el script de prueba
cd /workspaces/LandingPage
./scripts/test-2fa.sh
```

O manualmente:

```bash
curl -X POST http://localhost:3000/api/auth/2fa/generate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu-email@ejemplo.com",
    "password": "tu-contraseña"
  }'
```

---

## Paso 5: Configuración Avanzada (Opcional)

### 5.1 Await Webhook (Para confirmación)

Si quieres confirmar que el usuario recibió el código:

1. Añade **"Await webhook"** después del Send Template
2. Configuración:
   - **Resume Key**: `enteredPin`
   - **Fail After**: 5 minutos

3. Crea un endpoint en tu app que llame:
```
POST https://api.bird.com/workspaces/YOUR-WORKSPACE/flows/YOUR-FLOW/runs
```

Con:
```json
{
  "resumeKey": "enteredPin",
  "data": {
    "pin": "ABC123"
  }
}
```

### 5.2 Conditional (Verificación en MessageBird)

Añade una condición para verificar si el PIN es correcto:

**Branch A - Success:**
- Condition: `{{trigger.body.otp}}` equals `{{await.data.pin}}`
- Action: Return success response

**Branch B - Failure:**
- Condition: `{{trigger.body.otp}}` not equals `{{await.data.pin}}`
- Action: Return error response

---

## Troubleshooting

### El template no se aprueba

- Asegúrate de que no incluye URLs o enlaces
- Evita usar palabras como "verificar cuenta" o "confirmar"
- El formato debe ser claro y conciso
- El código debe estar claramente identificado

### El mensaje no llega

1. Verifica que el número de WhatsApp es válido
2. Asegúrate de que el formato es internacional (+57...)
3. Verifica que el template fue aprobado
4. Revisa los logs del Flow en MessageBird
5. Verifica que el número tiene WhatsApp activo

### Errores en el Flow

- Verifica que todas las variables están correctamente mapeadas
- Usa `{{trigger.body.VARIABLE}}` para acceder a datos del webhook
- Revisa los logs de ejecución en MessageBird
- Verifica que el payload JSON es válido

### Límites de Rate

WhatsApp Business tiene límites de mensajes:
- Tier 1: 1,000 conversaciones únicas/24h
- Tier 2: 10,000 conversaciones únicas/24h
- Tier 3: 100,000 conversaciones únicas/24h

---

## Checklist de Configuración

- [ ] Cuenta de MessageBird creada
- [ ] Canal de WhatsApp configurado
- [ ] Template "OTP Message" creado y aprobado
- [ ] Flow creado con Webhook trigger
- [ ] Send Template Message configurado
- [ ] URL del webhook copiada a la aplicación
- [ ] Test del template exitoso
- [ ] Test desde la aplicación exitoso
- [ ] Monitoreo configurado (opcional)

---

## Recursos Adicionales

- [Documentación de MessageBird](https://developers.messagebird.com/)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)
- [MessageBird Studio Docs](https://developers.messagebird.com/docs/studio)

---

## Soporte

Para problemas técnicos:
- Email: support@messagebird.com
- Chat: En el dashboard de MessageBird
- Documentación: https://support.messagebird.com/
