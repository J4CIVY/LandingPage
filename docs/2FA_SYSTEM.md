# Sistema de Autenticación 2FA con WhatsApp

## Descripción General

Este sistema implementa autenticación de dos factores (2FA) utilizando códigos OTP enviados vía WhatsApp a través de la plataforma MessageBird.

## Flujo de Autenticación

### 1. Login Inicial
- Usuario ingresa email y contraseña
- Sistema valida credenciales
- Si son correctas, se genera un código OTP

### 2. Generación de OTP
- Se genera un código alfanumérico de 6 dígitos (A-Z, 2-9, excluyendo caracteres ambiguos)
- El código expira en 5 minutos
- Se permite máximo 3 intentos de verificación

### 3. Envío vía MessageBird
El sistema envía el código al webhook de MessageBird con el siguiente payload:

```json
{
  "otp": "ABC123",
  "phoneNumber": "+573001234567",
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "timestamp": "2025-10-01T12:00:00Z"
}
```

### 4. Verificación
- Usuario ingresa el código de 6 dígitos
- Sistema valida el código
- Si es correcto, se crea la sesión y se generan los tokens JWT

## Configuración de MessageBird

### Configuración del Flow en MessageBird

#### Step 1: Webhook Trigger
- **URL**: `https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/0403d97b-fa60-48b7-a45f-8a45b78d0a04`
- **Method**: POST
- **Content-Type**: application/json

#### Step 2: Send Template Message
- **Channel**: WhatsApp
- **Template**: OTP Message
- **Language**: Spanish (Colombia)
- **Variables**:
  - `otp`: `{{trigger.body.otp}}`
- **Receiver**: `{{trigger.body.phoneNumber}}`

#### Ejemplo de Template en MessageBird Studio:
```
Hola {{1}}!

Tu código de verificación BSK es: *{{2}}*

Este código expira en 5 minutos.

Si no solicitaste este código, ignora este mensaje.

- BSK Motorcycle Team
```

Variables del template:
1. `{{trigger.body.name}}` - Nombre del usuario
2. `{{trigger.body.otp}}` - Código OTP

## Estructura de Base de Datos

### Modelo TwoFactorCode

```typescript
{
  userId: ObjectId,           // Referencia al usuario
  code: String,               // Código OTP (6 caracteres)
  phoneNumber: String,        // Número de WhatsApp
  expiresAt: Date,           // Fecha de expiración (5 minutos)
  verified: Boolean,         // Si ya fue verificado
  attempts: Number,          // Intentos de verificación
  maxAttempts: Number,       // Máximo 3 intentos
  verifiedAt: Date,         // Fecha de verificación
  sessionInfo: {
    ip: String,
    userAgent: String,
    device: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Endpoints de API

### POST /api/auth/2fa/generate
Genera y envía un código OTP.

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Código de verificación enviado a tu WhatsApp",
  "data": {
    "twoFactorId": "507f1f77bcf86cd799439011",
    "expiresIn": 300,
    "phoneNumber": "+57 300 123 4567"
  }
}
```

**Errores Posibles:**
- `400`: Credenciales faltantes
- `401`: Credenciales inválidas
- `403`: Email no verificado
- `423`: Cuenta bloqueada
- `429`: Demasiados intentos

### POST /api/auth/2fa/verify
Verifica un código OTP e inicia sesión.

**Request:**
```json
{
  "twoFactorId": "507f1f77bcf86cd799439011",
  "code": "ABC123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Autenticación exitosa",
  "data": {
    "user": { /* datos del usuario */ },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 900
  }
}
```

**Errores Posibles:**
- `400`: Código inválido, expirado o ya usado
- `401`: Código incorrecto
- `404`: Código no encontrado
- `429`: Demasiados intentos

### POST /api/webhooks/messagebird
Webhook para recibir confirmaciones de MessageBird (opcional).

## Componentes de Frontend

### TwoFactorVerification
Componente React para la interfaz de verificación 2FA.

**Props:**
```typescript
{
  twoFactorId: string;        // ID del código 2FA
  phoneNumber: string;        // Número de WhatsApp
  expiresIn: number;         // Segundos hasta expiración
  onVerified: () => void;    // Callback de éxito
  onCancel: () => void;      // Callback de cancelación
  onResend: () => Promise<void>; // Callback para reenviar
}
```

**Características:**
- 6 inputs individuales para el código
- Auto-focus y navegación con teclado
- Soporte para pegar código completo
- Contador de expiración
- Botón para reenviar código
- Manejo de errores y reintentos

## Seguridad

### Rate Limiting
- **Generación de OTP**: 3 intentos cada 5 minutos por IP
- **Verificación**: 10 intentos cada 5 minutos por IP
- **Por código**: Máximo 3 intentos de verificación

### Expiración
- Los códigos expiran en 5 minutos
- Los códigos antiguos se invalidan al generar uno nuevo
- Limpieza automática de códigos expirados (>24 horas)

### Validación
- Formato de código: 6 caracteres alfanuméricos
- Verificación case-insensitive
- Códigos sin caracteres ambiguos (0, O, I, 1, l)

## Requisitos del Usuario

Para usar 2FA, el usuario debe tener:
1. Email verificado
2. Número de WhatsApp configurado en su perfil
3. Acceso a WhatsApp en el número registrado

## Testing

### Test Manual del Flujo

1. **Generar código:**
```bash
curl -X POST http://localhost:3000/api/auth/2fa/generate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

2. **Verificar código:**
```bash
curl -X POST http://localhost:3000/api/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "twoFactorId": "ID_RECIBIDO",
    "code": "ABC123"
  }'
```

### Test de Webhook de MessageBird

```bash
curl -X POST https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/0403d97b-fa60-48b7-a45f-8a45b78d0a04 \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "TEST12",
    "phoneNumber": "+573001234567",
    "email": "test@example.com",
    "name": "Test User",
    "timestamp": "2025-10-01T12:00:00Z"
  }'
```

## Troubleshooting

### El código no llega por WhatsApp

1. Verificar que el número está en formato correcto (+57...)
2. Verificar que el usuario tiene WhatsApp activo
3. Revisar logs del servidor para errores de envío
4. Verificar configuración del flow en MessageBird
5. Verificar que el template esté aprobado por WhatsApp

### Código expirado

- Los códigos expiran en 5 minutos
- Usuario debe solicitar un nuevo código con el botón "Reenviar"

### Demasiados intentos

- Después de 3 intentos fallidos, se debe solicitar un nuevo código
- Rate limiting previene abuso

### Error de conexión con MessageBird

- Verificar que la URL del webhook es correcta
- Verificar conectividad de red
- Revisar logs del servidor

## Monitoreo y Métricas

### Logs Importantes

El sistema registra:
- Generación de códigos OTP
- Intentos de verificación (exitosos y fallidos)
- Errores de envío a MessageBird
- Webhooks recibidos de MessageBird

### Métricas Recomendadas

- Tasa de éxito de verificación 2FA
- Tiempo promedio de verificación
- Códigos expirados vs usados
- Errores de entrega de WhatsApp
- Intentos fallidos por usuario

## Mantenimiento

### Limpieza de Datos

El sistema automáticamente limpia:
- Códigos expirados (>24 horas)
- Códigos antiguos al generar nuevos

### Actualización de Templates

Para actualizar el mensaje de WhatsApp:
1. Ir a MessageBird Studio
2. Editar el template "OTP Message"
3. Esperar aprobación de WhatsApp (puede tardar 24-48h)
4. Actualizar referencias en el flow

## Próximos Pasos

### Mejoras Futuras

1. **Backup de canales**: SMS como respaldo si WhatsApp falla
2. **Códigos QR**: Opción de mostrar QR en lugar de enviar
3. **Remember Device**: Opción de confiar en dispositivos conocidos
4. **Analytics Dashboard**: Visualización de métricas 2FA
5. **Notificaciones**: Alertar sobre intentos sospechosos

### Configuración Opcional

1. **Deshabilitar 2FA para testing**:
   - Agregar variable de entorno `DISABLE_2FA=true`
   - Útil para desarrollo y testing automatizado

2. **Personalizar tiempo de expiración**:
   - Modificar `getOTPExpirationDate()` en `lib/2fa-utils.ts`

3. **Cambiar longitud del código**:
   - Modificar `generateOTPCode()` en `lib/2fa-utils.ts`

## Soporte

Para problemas con el sistema 2FA:
1. Revisar logs del servidor
2. Verificar configuración de MessageBird
3. Contactar soporte técnico con los logs relevantes
