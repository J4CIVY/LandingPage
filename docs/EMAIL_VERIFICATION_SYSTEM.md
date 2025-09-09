# Sistema de Verificación de Correo Electrónico

Este documento describe la implementación del sistema de verificación de correo electrónico para BSK Motorcycle Team.

## Funcionalidad

### Flujo de Registro
1. **Usuario se registra**: Completa el formulario de registro
2. **Cuenta creada pero inactiva**: La cuenta se crea con `isActive: false` e `isEmailVerified: false`
3. **Email de verificación enviado**: Se envía automáticamente un correo con enlace de verificación
4. **Usuario no puede hacer login**: Hasta que verifique su email

### Flujo de Verificación
1. **Usuario recibe email**: Con enlace de verificación único
2. **Hace clic en el enlace**: Redirige a `/verify-email?token=...`
3. **Cuenta activada**: Se establece `isEmailVerified: true` e `isActive: true`
4. **Usuario puede hacer login**: Ya puede acceder a su cuenta

## Archivos Modificados/Creados

### APIs
- `/app/api/auth/verify-email/route.ts` - Verifica el token de email
- `/app/api/auth/resend-verification/route.ts` - Reenvía email de verificación
- `/app/api/auth/login/route.ts` - Modificado para verificar email antes del login
- `/app/api/users/route.ts` - Modificado para enviar email de verificación en registro

### Páginas
- `/app/verify-email/page.tsx` - Página de verificación de email
- `/app/registration-success/page.tsx` - Modificada para informar sobre verificación
- `/app/login/page.tsx` - Modificada para mostrar errores de verificación
- `/app/dashboard/page.tsx` - Modificada para mostrar banner de verificación

### Servicios
- `/lib/email-service.ts` - Agregado método `sendEmailVerification()`

### Modelo de Usuario
- Ya incluía los campos necesarios:
  - `isEmailVerified: boolean`
  - `emailVerificationToken: string`

## Estados de Usuario

### Antes de Verificar Email
- `isActive: false`
- `isEmailVerified: false`
- `emailVerificationToken: "token_único"`
- No puede hacer login
- Aparece banner en dashboard si accede de alguna manera

### Después de Verificar Email
- `isActive: true`
- `isEmailVerified: true`
- `emailVerificationToken: undefined`
- Puede hacer login normalmente
- No aparece banner de verificación

## Características de Seguridad

### Rate Limiting
- **Login**: 5 intentos por IP cada 15 minutos
- **Reenvío de verificación**: 3 intentos por IP cada 5 minutos

### Validación de Tokens
- Tokens únicos de 32 bytes
- Se invalidan después del uso
- Solo funcionan para usuarios no verificados

### Mensajes de Error
- No se revela si un email existe en el sistema
- Mensajes genéricos para seguridad

## Configuración Requerida

### Variables de Entorno
```env
# URL base de la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Configuración de email (Zoho Mail)
ZOHO_FROM_EMAIL=noreply@bskmotorcycleteam.com
EMAIL_ADMIN_ADDRESS=admin@bskmotorcycleteam.com
EMAIL_SUPPORT_ADDRESS=support@bskmotorcycleteam.com

# JWT
JWT_SECRET=your-super-secure-jwt-secret
```

### Configuración de Email
El sistema utiliza Zoho Mail para envío de emails. Asegúrate de tener configurado:
- Credenciales de Zoho Mail
- Dominio verificado
- Límites de envío apropiados

## Testing

### Casos de Prueba
1. **Registro nuevo usuario**
   - Verificar que se crea con `isEmailVerified: false`
   - Verificar que se envía email de verificación
   - Verificar redirección a página de éxito

2. **Intento de login sin verificar**
   - Verificar mensaje de error específico
   - Verificar enlace a página de verificación

3. **Verificación de email**
   - Probar con token válido
   - Probar con token inválido
   - Probar con token ya usado

4. **Reenvío de verificación**
   - Probar rate limiting
   - Verificar generación de nuevo token
   - Verificar envío de email

### URLs de Testing
- **Registro**: `/register`
- **Login**: `/login`
- **Verificación**: `/verify-email?token=TOKEN`
- **Reenvío**: `/verify-email` (formulario de reenvío)
- **Dashboard**: `/dashboard` (banner de verificación)

## Solución de Problemas

### Email no llega
1. Verificar configuración de Zoho Mail
2. Revisar carpeta de spam
3. Usar formulario de reenvío
4. Verificar logs del servidor

### Token inválido
1. Verificar que el token no haya expirado (no implementado todavía)
2. Verificar que no haya sido usado ya
3. Solicitar nuevo token

### Usuario no puede hacer login
1. Verificar estado de `isEmailVerified`
2. Verificar estado de `isActive`
3. Usar panel de admin para verificar manualmente si es necesario

## Próximas Mejoras

### Funcionalidades Pendientes
- [ ] Expiración de tokens (24 horas)
- [ ] Logs de verificación de email
- [ ] Panel de admin para gestión de verificaciones
- [ ] Notificaciones push cuando se verifica email
- [ ] Personalización de templates de email

### Optimizaciones
- [ ] Cache de rate limiting con Redis
- [ ] Queue de emails para mejor rendimiento
- [ ] Métricas de verificación de emails
- [ ] A/B testing de templates de email
