# 🎯 CONFIGURACIÓN FINAL - MessageBird Flow

## URL del Webhook que recibes de MessageBird
```
https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/0403d97b-fa60-48b7-a45f-8a45b78d0a04
```

## Configuración del Flow en MessageBird (Paso a Paso)

### 📥 STEP 1: Webhook Trigger
```
Type: Webhook
Method: POST
Content-Type: application/json
```

**Este webhook RECIBE los siguientes datos de tu aplicación:**
```json
{
  "otp": "ABC123",
  "phoneNumber": "+573001234567",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "timestamp": "2025-10-01T12:00:00Z"
}
```

---

### 📤 STEP 2: Send Template Message to Channel

#### Configuración General:
- **Action**: Send template message to channel
- **Channel**: WhatsApp (seleccionar tu canal configurado)

#### Receiver Configuration:
- **Receiver**: By Identifier
- **Identifier Value**: `{{trigger.body.phoneNumber}}`
- **Identifier Key**: (dejar vacío para que se infiera automáticamente)

#### Template Configuration:
- **Studio template**: OTP Message
- **Language**: Spanish (Colombia)

#### Variables del Template:
En MessageBird Studio, tu template debe tener esta estructura:

```
Hola {{1}}!

Tu código de verificación BSK es: *{{2}}*

Este código expira en 5 minutos.

Si no solicitaste este código, ignora este mensaje.

- BSK Motorcycle Team
```

**Mapeo de variables en el Flow:**

| Variable | Valor en el Flow |
|----------|------------------|
| {{1}} (nombre) | `{{trigger.body.name}}` |
| {{2}} (código) | `{{trigger.body.otp}}` |

En la interfaz de MessageBird se verá así:
```
Variable 1 (otp): {{trigger.body.name}}
Variable 2 (otp): {{trigger.body.otp}}
```

#### Additional Settings:
- **Use Case**: Marketing (o Authentication si está disponible)
- **UTM**: enabled
- **Tags**: (opcional) agregar tags como "2fa", "authentication"

---

### ✅ STEP 3: Response (Opcional pero recomendado)

Añade un paso de respuesta HTTP para confirmar:

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "timestamp": "{{$now}}",
  "phoneNumber": "{{trigger.body.phoneNumber}}"
}
```

---

## 📝 Template de WhatsApp a crear en Studio

### Información del Template:
- **Nombre**: `otp_message` o `verification_code`
- **Categoría**: AUTHENTICATION (preferido) o UTILITY
- **Idioma**: Spanish (Colombia) - es_CO

### Contenido del Template:

**Header**: (ninguno)

**Body**:
```
Hola {{1}}!

Tu código de verificación BSK es: *{{2}}*

Este código expira en 5 minutos.

Si no solicitaste este código, ignora este mensaje.

- BSK Motorcycle Team
```

**Footer**: (opcional)
```
BSK Motorcycle Team
```

**Buttons**: (ninguno para OTP)

### Variables:
1. **{{1}}** - TEXT - Nombre del usuario
2. **{{2}}** - TEXT - Código OTP

### Ejemplo para Aprobación:
Cuando envíes para aprobación, usa estos valores de ejemplo:
- {{1}}: Juan Pérez
- {{2}}: ABC123

---

## 🧪 Testing del Flow

### Test 1: Desde MessageBird

1. Ve a tu Flow en MessageBird
2. Click en el webhook trigger
3. Click "Update test data"
4. Pega este JSON:

```json
{
  "otp": "TEST12",
  "phoneNumber": "+573001234567",
  "email": "test@ejemplo.com",
  "name": "Usuario de Prueba",
  "timestamp": "2025-10-01T12:00:00Z"
}
```

5. Click "Send"
6. Verifica que el mensaje llegue a WhatsApp

### Test 2: Desde tu Aplicación

```bash
curl -X POST https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/0403d97b-fa60-48b7-a45f-8a45b78d0a04 \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "ABC123",
    "phoneNumber": "+573001234567",
    "email": "test@ejemplo.com",
    "name": "Test User",
    "timestamp": "2025-10-01T12:00:00Z"
  }'
```

---

## ⚠️ Checklist de Verificación

Antes de ir a producción, verifica:

- [ ] Template creado en MessageBird Studio
- [ ] Template enviado para aprobación de WhatsApp
- [ ] Template APROBADO por WhatsApp (puede tardar 24-48h)
- [ ] Flow creado con los 3 pasos (Webhook, Send Message, Response)
- [ ] Variables del template correctamente mapeadas
- [ ] Test del flow exitoso desde MessageBird
- [ ] Test desde aplicación exitoso
- [ ] Número de WhatsApp Business configurado y verificado
- [ ] Límites de mensajes conocidos (Tier de WhatsApp)

---

## 🚨 Errores Comunes y Soluciones

### Error: "Template not found"
- ✅ Asegúrate de que el template esté APROBADO
- ✅ Verifica el nombre exacto del template
- ✅ Verifica el idioma (es_CO)

### Error: "Invalid phone number"
- ✅ Formato debe ser +57XXXXXXXXXX
- ✅ Incluir código de país (+57)
- ✅ No incluir espacios ni guiones

### Error: "Variables mismatch"
- ✅ Verifica que el número de variables coincida
- ✅ Verifica que uses `{{trigger.body.VARIABLE}}`
- ✅ El orden de las variables debe coincidir con el template

### Mensaje no llega
- ✅ Verifica que el número tenga WhatsApp activo
- ✅ Revisa los logs del flow en MessageBird
- ✅ Verifica que no estés en los límites de mensajes
- ✅ Confirma que el número no está bloqueado

---

## 📊 Monitoreo

### En MessageBird Dashboard:

Ve a **Flows** → Tu Flow → **Runs**

Aquí verás:
- ✅ Mensajes enviados exitosamente
- ❌ Mensajes fallidos
- ⏱️ Tiempo de ejecución
- 📝 Logs detallados de cada ejecución

### En tu Aplicación:

Revisa los logs del servidor:
```bash
# Ver logs en tiempo real
npm run dev

# Logs incluirán:
# - "Enviando OTP a MessageBird"
# - "OTP enviado exitosamente"
# - "Error al enviar OTP" (si falla)
```

---

## 🎯 Próximos Pasos Después de Configurar

1. ✅ Esperar aprobación del template (24-48h)
2. ✅ Hacer test completo con usuario real
3. ✅ Monitorear primeros envíos
4. ✅ Ajustar template si es necesario
5. ✅ Configurar alertas para errores

---

## 📞 Soporte

### MessageBird:
- Dashboard: https://dashboard.messagebird.com
- Docs: https://developers.messagebird.com
- Support: support@messagebird.com

### WhatsApp Business:
- Policy: https://www.whatsapp.com/legal/business-policy
- Guías: https://business.whatsapp.com

---

**¡Todo listo!** Una vez que el template sea aprobado, el sistema funcionará automáticamente. 🎉
