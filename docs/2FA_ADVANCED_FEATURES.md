# 🚀 Sistema 2FA Mejorado - Características Avanzadas

## Nuevas Funcionalidades Implementadas

### 1. ⏰ Detección Automática de Expiración

El sistema detecta automáticamente cuando un código ha expirado:

- **Frontend**: Contador en tiempo real que muestra segundos restantes
- **Backend**: Validación de expiración antes de verificar
- **UX**: Mensaje claro cuando el código expira con opción de solicitar uno nuevo

```typescript
// El código expira en 5 minutos desde su generación
if (twoFactorCode.isExpired()) {
  return { error: 'CODE_EXPIRED', message: 'El código ha expirado' };
}
```

---

### 2. 🔢 Contador de Intentos con Límites

**WhatsApp**: 3 intentos máximo
**Email (respaldo)**: 5 intentos máximo

Cada intento incorrecto:
- Se registra en la base de datos
- Se muestra al usuario cuántos intentos le quedan
- Al agotar intentos, se activa el sistema de respaldo

```typescript
// Ejemplo de respuesta con intentos restantes
{
  "success": false,
  "message": "Código incorrecto",
  "remainingAttempts": 2  // Le quedan 2 intentos
}
```

---

### 3. 📧 Sistema de Respaldo por Email

Cuando se exceden los 3 intentos por WhatsApp:

1. Se muestra una advertencia visual
2. Se ofrece botón para "Recibir código por email"
3. Se genera un nuevo código OTP
4. Se envía por correo electrónico con diseño profesional
5. Se permiten 5 intentos adicionales

#### Flujo de Respaldo:

```
Usuario excede 3 intentos por WhatsApp
    ↓
Se muestra alerta amarilla
    ↓
Usuario hace click en "Recibir código por email"
    ↓
POST /api/auth/2fa/send-email-backup
    ↓
Se genera nuevo código
    ↓
Se envía email HTML profesional
    ↓
Usuario ingresa código del email
    ↓
5 intentos disponibles
```

#### Email Template:
- ✅ Diseño HTML responsive
- ✅ Código destacado visualmente
- ✅ Información de expiración clara
- ✅ Advertencias de seguridad
- ✅ Instrucciones si no solicitó el código

---

### 4. ⏳ Backoff Exponencial para Reenvíos

Cada vez que se reenvía un código, el tiempo de espera se duplica:

| Reenvío | Tiempo de Espera |
|---------|------------------|
| 1º | 30 segundos |
| 2º | 60 segundos (1 min) |
| 3º | 120 segundos (2 min) |
| 4º | 240 segundos (4 min) |
| 5º+ | 300 segundos (5 min - máximo) |

**Propósito**: Prevenir abuso y ataques de fuerza bruta

```typescript
// Cálculo del backoff exponencial
const cooldownTime = Math.min(30 * Math.pow(2, resendCount - 1), 300);
```

**Visualización en UI**:
- Botón deshabilitado durante cooldown
- Contador regresivo visible
- Mensaje claro del tiempo restante

---

### 5. 🎯 Validación en Tiempo Real

#### Frontend:
- ✅ 6 inputs individuales para mejor UX
- ✅ Auto-focus y navegación con teclado
- ✅ Soporte para pegar código completo
- ✅ Validación de formato (solo alfanuméricos)
- ✅ Auto-submit al completar 6 dígitos
- ✅ Limpieza automática en error

#### Backend:
- ✅ Validación de formato del código
- ✅ Verificación case-insensitive
- ✅ Rate limiting por IP
- ✅ Validación de expiración
- ✅ Validación de intentos
- ✅ Validación de código ya usado

---

## Flujo Completo del Sistema Mejorado

```
┌─────────────────────────────────────────────────────────┐
│  INICIO: Usuario ingresa email y contraseña            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Validación de credenciales                             │
│  - Email verificado                                     │
│  - Contraseña correcta                                  │
│  - Cuenta no bloqueada                                  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  POST /api/auth/2fa/generate                            │
│  - Generar código OTP (6 dígitos)                       │
│  - Guardar en DB con expiración (5 min)                 │
│  - Enviar a webhook de MessageBird                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  MessageBird envía por WhatsApp                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  UI: Pantalla de Verificación                           │
│  - 6 inputs para código                                 │
│  - Contador de expiración                               │
│  - Botón de reenvío (con cooldown)                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Usuario ingresa código                                 │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  POST /api/auth/2fa/verify                              │
│  - Validar formato                                      │
│  - Verificar expiración                                 │
│  - Verificar intentos                                   │
│  - Comparar código                                      │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
  ┌──────────┐      ┌──────────────┐
  │ CORRECTO │      │  INCORRECTO  │
  └────┬─────┘      └───────┬──────┘
       │                    │
       ▼                    ▼
┌─────────────┐    ┌────────────────────┐
│ Crear       │    │ Incrementar        │
│ sesión      │    │ intentos           │
│ y tokens    │    │                    │
│             │    │ ¿Intentos <= 3?    │
│ ✅ LOGIN    │    └────────┬───────────┘
└─────────────┘             │
                  ┌─────────┴─────────┐
                  │ SÍ                │ NO
                  ▼                   ▼
         ┌────────────────┐  ┌──────────────────┐
         │ Mostrar error  │  │ Ofrecer respaldo │
         │ con intentos   │  │ por EMAIL        │
         │ restantes      │  │                  │
         │                │  │ Usuario acepta   │
         │ Limpiar inputs │  └────────┬─────────┘
         │ Permitir retry │           │
         └────────────────┘           ▼
                           ┌────────────────────┐
                           │ POST /api/auth/    │
                           │ 2fa/send-email-    │
                           │ backup             │
                           │                    │
                           │ - Nuevo código OTP │
                           │ - Enviar por email │
                           │ - 5 intentos       │
                           └─────────┬──────────┘
                                     │
                                     ▼
                           ┌────────────────────┐
                           │ Usuario ingresa    │
                           │ código del email   │
                           │                    │
                           │ POST /api/auth/    │
                           │ 2fa/verify         │
                           └─────────┬──────────┘
                                     │
                           ┌─────────┴─────────┐
                           │                   │
                           ▼                   ▼
                     ┌──────────┐      ┌──────────────┐
                     │ CORRECTO │      │  INCORRECTO  │
                     │          │      │  (hasta 5    │
                     │ ✅ LOGIN │      │   intentos)  │
                     └──────────┘      └──────────────┘
```

---

## Endpoints de la API

### POST /api/auth/2fa/generate
**Descripción**: Genera y envía código OTP inicial por WhatsApp

**Request**:
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response**:
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

---

### POST /api/auth/2fa/verify
**Descripción**: Verifica el código OTP ingresado

**Request**:
```json
{
  "twoFactorId": "507f1f77bcf86cd799439011",
  "code": "ABC123"
}
```

**Response Exitosa**:
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

**Response con Error (intentos restantes)**:
```json
{
  "success": false,
  "message": "Código incorrecto. Te quedan 2 intentos",
  "error": "INVALID_CODE",
  "remainingAttempts": 2
}
```

**Response (sin intentos - activar email)**:
```json
{
  "success": false,
  "message": "Código incorrecto. Te quedan 0 intentos",
  "error": "INVALID_CODE",
  "remainingAttempts": 0
}
```

---

### POST /api/auth/2fa/send-email-backup
**Descripción**: Envía código OTP por email como respaldo

**Request**:
```json
{
  "twoFactorId": "507f1f77bcf86cd799439011"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Código enviado a tu correo electrónico",
  "data": {
    "twoFactorId": "507f1f77bcf86cd799439022",
    "expiresIn": 300,
    "method": "email",
    "email": "us***@ejemplo.com"
  }
}
```

---

## Experiencia de Usuario (UX)

### Pantalla de Verificación

#### Estados Visuales:

1. **Normal** (antes de ingresar código):
   - 6 inputs vacíos
   - Contador de expiración activo
   - Botón de reenvío deshabilitado (cooldown)

2. **Ingresando código**:
   - Inputs se llenan uno a uno
   - Auto-focus en siguiente input
   - Auto-submit al completar

3. **Verificando**:
   - Spinner de carga
   - Mensaje "Verificando..."
   - Inputs deshabilitados

4. **Error** (código incorrecto):
   - Borde rojo en inputs
   - Mensaje de error claro
   - Intentos restantes visibles
   - Inputs se limpian automáticamente
   - Focus en primer input

5. **Error** (sin intentos):
   - Alerta amarilla destacada
   - Botón "Recibir código por email"
   - Icono de advertencia
   - Explicación clara

6. **Email activado**:
   - Icono cambia de WhatsApp a Email
   - Mensaje "Revisa tu bandeja de entrada"
   - Badge azul "Código enviado por email"

7. **Código expirado**:
   - Mensaje de expiración claro
   - Botón "Solicitar nuevo código"
   - Timer muestra 0:00

---

## Seguridad Implementada

### Rate Limiting

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| generate | 3 intentos | 5 minutos |
| verify | 10 intentos | 5 minutos |
| send-email-backup | 2 intentos | 15 minutos |

### Validaciones

1. **Email verificado**: Usuario debe tener email confirmado
2. **Cuenta activa**: Usuario no debe estar bloqueado
3. **Formato de código**: Solo 6 caracteres alfanuméricos
4. **Expiración**: Códigos expiran en 5 minutos
5. **Uso único**: Código no puede reutilizarse
6. **Intentos limitados**: 3 para WhatsApp, 5 para email
7. **Case insensitive**: ABC123 = abc123 = AbC123

### Protección contra Abuso

1. **Backoff exponencial**: Incrementa tiempo entre reenvíos
2. **Invalidación automática**: Códigos anteriores se invalidan
3. **Limpieza periódica**: Códigos antiguos se eliminan
4. **Logs de seguridad**: Todos los intentos se registran
5. **IP tracking**: Se registra IP de cada intento

---

## Monitoreo y Logs

### Logs Generados:

```bash
# Generación de código
"Enviando OTP a MessageBird: { phoneNumber, code: 'AB****' }"
"OTP enviado exitosamente a MessageBird"

# Verificación
"Verificando código 2FA para usuario: user@ejemplo.com"
"Código verificado exitosamente"
"Código incorrecto - Intentos restantes: 2"

# Email backup
"Código OTP enviado por email como respaldo para usuario: user@ejemplo.com"

# Errores
"Error al enviar OTP a MessageBird: [error]"
"Error verificando código 2FA: [error]"
```

### Métricas Recomendadas:

- Tasa de éxito de verificación
- Tiempo promedio hasta verificación
- Intentos promedio por usuario
- Tasa de uso de email backup
- Códigos expirados vs usados
- Reenvíos por sesión

---

## Testing

### Test del Flujo Completo:

```bash
# 1. Generar código
curl -X POST http://localhost:3000/api/auth/2fa/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com","password":"pass123"}'

# 2. Verificar código incorrecto (3 veces)
for i in {1..3}; do
  curl -X POST http://localhost:3000/api/auth/2fa/verify \
    -H "Content-Type: application/json" \
    -d '{"twoFactorId":"ID","code":"WRONG1"}'
done

# 3. Activar email backup
curl -X POST http://localhost:3000/api/auth/2fa/send-email-backup \
  -H "Content-Type: application/json" \
  -d '{"twoFactorId":"ID"}'

# 4. Verificar código correcto del email
curl -X POST http://localhost:3000/api/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{"twoFactorId":"NEW_ID","code":"ABC123"}'
```

---

## Troubleshooting

### Usuario no recibe código por WhatsApp

**Solución**: Automáticamente ofrece email después de 3 intentos fallidos

### Usuario no recibe email

1. Revisar carpeta de spam
2. Verificar email en perfil de usuario
3. Contactar soporte (rate limit de 2 por 15 min)

### Código expira muy rápido

- Tiempo fijo: 5 minutos
- Usuario puede solicitar nuevo código
- Backoff exponencial previene abuso

### Demasiados reenvíos

- Backoff exponencial aumenta tiempo de espera
- Máximo 5 minutos entre reenvíos
- Revisar logs para detectar abuso

---

## Mejoras Futuras Sugeridas

1. **SMS como tercer canal** de respaldo
2. **Códigos QR** como opción adicional
3. **"Confiar en este dispositivo"** para 30 días
4. **Notificación push** cuando se genere código
5. **Dashboard de actividad 2FA** para usuarios
6. **Alertas automáticas** de intentos sospechosos
7. **Exportar métricas** a sistema de analytics

---

**Sistema completamente funcional y listo para producción** ✅
