# 🔐 Sistema de Autenticación 2FA con WhatsApp

## 📋 Resumen

Sistema de autenticación de dos factores (2FA) implementado para BSK Motorcycle Team que utiliza códigos OTP de 6 dígitos enviados vía WhatsApp a través de MessageBird.

## ✨ Características

- ✅ Códigos OTP alfanuméricos de 6 dígitos
- ✅ Envío automático vía WhatsApp
- ✅ Expiración de 5 minutos
- ✅ Máximo 3 intentos de verificación
- ✅ Rate limiting para prevenir abuso
- ✅ Interfaz de usuario intuitiva
- ✅ Auto-submit al completar código
- ✅ Soporte para pegar código completo
- ✅ Contador de expiración en tiempo real
- ✅ Opción de reenviar código

## 🚀 Inicio Rápido

### 1. Instalación

Los archivos ya están creados en tu proyecto. Solo necesitas:

```bash
# Instalar dependencias (si es necesario)
npm install
```

### 2. Configuración de MessageBird

Sigue la guía detallada en [`docs/MESSAGEBIRD_SETUP.md`](./docs/MESSAGEBIRD_SETUP.md)

**TL;DR:**
1. Crea un template en MessageBird Studio
2. Configura un Flow con webhook trigger
3. Copia la URL del webhook a tu código

### 3. Variables de Entorno

Actualiza `lib/2fa-utils.ts` línea 61 con tu URL de webhook:

```typescript
const webhookUrl = 'https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/0403d97b-fa60-48b7-a45f-8a45b78d0a04';
```

### 4. Probar el Sistema

```bash
# Iniciar el servidor
npm run dev

# En otra terminal, ejecutar test
./scripts/test-2fa.sh
```

O prueba manualmente:
1. Ve a http://localhost:3000/login
2. Ingresa tus credenciales
3. Revisa tu WhatsApp para el código
4. Ingresa el código de 6 dígitos

## 📁 Archivos Creados

### Modelos
- `lib/models/TwoFactorCode.ts` - Modelo de base de datos para códigos OTP

### Utilidades
- `lib/2fa-utils.ts` - Funciones para generar y enviar códigos OTP

### APIs
- `app/api/auth/2fa/generate/route.ts` - Genera y envía código OTP
- `app/api/auth/2fa/verify/route.ts` - Verifica código OTP
- `app/api/webhooks/messagebird/route.ts` - Webhook para confirmaciones

### Componentes
- `components/auth/TwoFactorVerification.tsx` - UI para ingresar código

### Páginas Modificadas
- `app/login/page.tsx` - Integra el flujo 2FA en login

### Documentación
- `docs/2FA_SYSTEM.md` - Documentación técnica completa
- `docs/MESSAGEBIRD_SETUP.md` - Guía de configuración de MessageBird
- `docs/2FA_QUICK_START.md` - Esta guía

### Scripts
- `scripts/test-2fa.sh` - Script de prueba automatizada

## 🔄 Flujo de Autenticación

```
┌─────────────┐
│ Usuario     │
│ ingresa     │
│ credenciales│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Validar     │
│ email &     │
│ password    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Generar     │
│ código OTP  │
│ (6 dígitos) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Enviar a    │
│ MessageBird │
│ Webhook     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ MessageBird │
│ envía por   │
│ WhatsApp    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Usuario     │
│ ingresa     │
│ código      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Verificar   │
│ código      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Crear       │
│ sesión &    │
│ tokens JWT  │
└─────────────┘
```

## 🔒 Seguridad

### Rate Limiting
- **Generación**: 3 intentos / 5 minutos por IP
- **Verificación**: 10 intentos / 5 minutos por IP
- **Por código**: 3 intentos máximo

### Validación
- Códigos sin caracteres ambiguos (0, O, I, 1, l)
- Verificación case-insensitive
- Formato: 6 caracteres alfanuméricos

### Expiración
- Códigos expiran en 5 minutos
- Limpieza automática de códigos antiguos
- Invalidación de códigos previos al generar uno nuevo

## 📊 Datos del Payload a MessageBird

```json
{
  "otp": "ABC123",
  "phoneNumber": "+573001234567",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "timestamp": "2025-10-01T12:00:00Z"
}
```

## 🎨 Template de WhatsApp

```
Hola {{1}}!

Tu código de verificación BSK es: *{{2}}*

Este código expira en 5 minutos.

Si no solicitaste este código, ignora este mensaje.

- BSK Motorcycle Team
```

Variables:
- `{{1}}` = `{{trigger.body.name}}`
- `{{2}}` = `{{trigger.body.otp}}`

## 🧪 Testing

### Test Automático
```bash
./scripts/test-2fa.sh
```

### Test Manual - Generar Código
```bash
curl -X POST http://localhost:3000/api/auth/2fa/generate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu@email.com",
    "password": "tucontraseña"
  }'
```

### Test Manual - Verificar Código
```bash
curl -X POST http://localhost:3000/api/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "twoFactorId": "ID_DEL_CODIGO",
    "code": "ABC123"
  }'
```

### Test del Webhook de MessageBird
```bash
curl -X POST https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/0403d97b-fa60-48b7-a45f-8a45b78d0a04 \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "TEST12",
    "phoneNumber": "+573001234567",
    "email": "test@ejemplo.com",
    "name": "Test User",
    "timestamp": "2025-10-01T12:00:00Z"
  }'
```

## ❗ Requisitos del Usuario

Para usar 2FA, el usuario necesita:
1. ✅ Email verificado
2. ✅ Número de WhatsApp configurado en el perfil
3. ✅ Acceso a WhatsApp en el número registrado

## 🐛 Troubleshooting

### Código no llega por WhatsApp
1. Verificar formato del número (+57...)
2. Confirmar que el template está aprobado
3. Revisar logs del servidor
4. Verificar Flow en MessageBird

### Código expirado
- Solicitar nuevo código con botón "Reenviar"
- Los códigos expiran en 5 minutos

### Demasiados intentos
- Después de 3 intentos, solicitar nuevo código
- Esperar si hay rate limiting activo

### Error de conexión
- Verificar URL del webhook
- Verificar conectividad
- Revisar logs del servidor

## 📚 Documentación Completa

- 📖 [Documentación Técnica](./docs/2FA_SYSTEM.md)
- ⚙️ [Configuración de MessageBird](./docs/MESSAGEBIRD_SETUP.md)

## 🎯 Próximos Pasos

1. ✅ Crear template en MessageBird (esperar aprobación)
2. ✅ Configurar Flow en MessageBird
3. ✅ Actualizar URL del webhook en el código
4. ✅ Probar con usuario de prueba
5. ✅ Monitorear logs
6. ✅ Ajustar template según necesidad

## 💡 Tips

- El template de WhatsApp puede tardar 24-48h en ser aprobado
- Usa el test del webhook en MessageBird para verificar configuración
- Los logs del servidor muestran intentos de envío y errores
- Guarda la URL del webhook de forma segura

## 🆘 Soporte

Para problemas o preguntas:
1. Revisa la documentación en `docs/`
2. Verifica logs del servidor
3. Contacta soporte técnico con logs relevantes

---

**¡El sistema está listo para usar!** 🎉

Solo falta configurar MessageBird siguiendo la guía en [`docs/MESSAGEBIRD_SETUP.md`](./docs/MESSAGEBIRD_SETUP.md)
