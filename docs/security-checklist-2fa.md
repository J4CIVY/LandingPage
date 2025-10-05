# ✅ Checklist de Verificación de Seguridad - Sistema 2FA

## 🔒 Antes de Desplegar a Producción

### Variables de Entorno
- [ ] `MONGODB_URI` configurada correctamente
- [ ] `JWT_SECRET` configurado (mínimo 32 caracteres)
- [ ] `NODE_ENV=production` en producción
- [ ] Certificados SSL/TLS configurados (HTTPS)

### Base de Datos
- [ ] Índices creados en MongoDB:
  - [ ] `PreAuthToken.token` (unique)
  - [ ] `PreAuthToken.expiresAt` (TTL index)
  - [ ] `PreAuthToken.userId` (regular index)
  - [ ] `TwoFactorCode.userId` (regular index)
  - [ ] `Session.userId` (regular index)

### Rate Limiting
- [ ] Redis configurado para rate limiting (recomendado en producción)
- [ ] Límites ajustados según tráfico esperado:
  - [ ] `/validate-credentials`: 5 intentos / 15 min
  - [ ] `/2fa/generate`: 5 intentos / 5 min
  - [ ] `/2fa/verify`: 10 intentos / 5 min

## 🧪 Tests de Seguridad con BurpSuite

### Test 1: Validación de Credenciales
```bash
# ✅ Debe responder con preAuthToken, NO con credenciales
POST /api/auth/validate-credentials
{
  "email": "test@example.com",
  "password": "test123"
}

# Respuesta esperada:
{
  "success": true,
  "data": {
    "preAuthToken": "a7f3c9e...",
    "expiresIn": 300,
    "requiresTwoFactor": true
  }
}
```

### Test 2: Generación de Código 2FA
```bash
# ✅ Ya NO debe aceptar credenciales
POST /api/auth/2fa/generate
{
  "email": "test@example.com",
  "password": "test123"
}
# Resultado esperado: ❌ 400 Bad Request

# ✅ Debe aceptar solo preAuthToken
POST /api/auth/2fa/generate
{
  "preAuthToken": "a7f3c9e..."
}
# Resultado esperado: ✅ 200 OK
```

### Test 3: Reutilización de Token
```bash
# 1. Obtener token
POST /api/auth/validate-credentials
# Guardar preAuthToken

# 2. Generar código 2FA
POST /api/auth/2fa/generate
{ "preAuthToken": "..." }

# 3. Verificar código
POST /api/auth/2fa/verify
{ "twoFactorId": "...", "code": "123456", "preAuthToken": "..." }

# 4. ❌ Intentar reutilizar el mismo token
POST /api/auth/2fa/generate
{ "preAuthToken": "..." }
# Resultado esperado: ❌ 401 Token usado o expirado
```

### Test 4: IP Mismatch
```bash
# 1. Obtener token desde IP A (192.168.1.1)
POST /api/auth/validate-credentials

# 2. ❌ Intentar usar desde IP B (192.168.1.2)
POST /api/auth/2fa/generate
{ "preAuthToken": "..." }
# Resultado esperado: ❌ 401 IP Mismatch
```

### Test 5: Token Expirado
```bash
# 1. Obtener token
POST /api/auth/validate-credentials

# 2. Esperar 6 minutos (más de 5 min de expiración)

# 3. ❌ Intentar usar token expirado
POST /api/auth/2fa/generate
{ "preAuthToken": "..." }
# Resultado esperado: ❌ 401 Token expirado
```

### Test 6: Rate Limiting
```bash
# Enviar 6 solicitudes rápidas a /validate-credentials
for i in {1..6}; do
  curl -X POST /api/auth/validate-credentials \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# Resultado esperado:
# Primeras 5: ✅ 401 Credenciales inválidas
# Sexta: ❌ 429 Rate Limit Exceeded
```

## 🔍 Verificación de Logs

### Qué NO debe aparecer en logs:
- [ ] ❌ Contraseñas en texto plano
- [ ] ❌ Tokens JWT completos (solo primeros/últimos caracteres)
- [ ] ❌ Códigos 2FA completos

### Qué DEBE aparecer en logs:
- [ ] ✅ IPs de solicitudes
- [ ] ✅ UserAgents
- [ ] ✅ Timestamps de operaciones
- [ ] ✅ Errores de validación (sin detalles sensibles)
- [ ] ✅ Intentos fallidos de login
- [ ] ✅ Tokens expirados/usados

## 🛡️ Headers de Seguridad

Verificar que los siguientes headers estén presentes:

```bash
curl -I https://bskmt.com/api/auth/validate-credentials
```

- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Content-Security-Policy: ...`

## 🍪 Cookies Seguras

Verificar configuración de cookies:

```javascript
// En /api/auth/2fa/verify
response.cookies.set('bsk-access-token', token, {
  httpOnly: true,        // ✅ No accesible desde JavaScript
  secure: true,          // ✅ Solo HTTPS
  sameSite: 'strict',    // ✅ CSRF protection
  path: '/',
  maxAge: 2 * 60 * 60   // ✅ 2 horas
});
```

- [ ] `httpOnly=true`
- [ ] `secure=true` (en producción)
- [ ] `sameSite=strict`

## 📊 Monitoreo

### Métricas a observar:
- [ ] Tasa de tokens generados vs. usados (detectar abandono)
- [ ] Tokens expirados por día (detectar UX problems)
- [ ] Rate limits alcanzados (detectar ataques)
- [ ] IP mismatches (detectar session hijacking)
- [ ] Intentos fallidos consecutivos (detectar brute force)

### Alertas a configurar:
- [ ] > 10 rate limits por hora desde misma IP
- [ ] > 50 tokens expirados sin uso por hora
- [ ] > 5 IP mismatches por minuto
- [ ] > 100 intentos fallidos de login por hora

## 🔐 Auditoría de Código

### Archivos críticos a revisar:
- [ ] `/lib/models/PreAuthToken.ts` - Modelo de token
- [ ] `/app/api/auth/validate-credentials/route.ts` - Validación inicial
- [ ] `/app/api/auth/2fa/generate/route.ts` - Generación código
- [ ] `/app/api/auth/2fa/verify/route.ts` - Verificación código
- [ ] `/app/login/page.tsx` - Frontend de login
- [ ] `/lib/auth-utils.ts` - Utilidades de autenticación

### Puntos a verificar:
- [ ] No hay console.log con datos sensibles
- [ ] Errores genéricos en respuestas (no revelar detalles)
- [ ] Validación de entrada en todos los endpoints
- [ ] Rate limiting aplicado
- [ ] Tokens generados con crypto.randomBytes
- [ ] Comparaciones de strings con timing-safe

## 📝 Documentación

- [ ] README actualizado con nuevo flujo
- [ ] Diagrama de secuencia del proceso
- [ ] Procedimiento de rollback documentado
- [ ] Runbook de incidentes de seguridad
- [ ] Plan de respuesta a brechas

## 🚀 Deploy

### Pre-deployment:
- [ ] Backup de base de datos
- [ ] Feature flag para rollback rápido
- [ ] Tests de integración pasados
- [ ] Tests de carga completados
- [ ] Revisión de código por par

### Post-deployment:
- [ ] Verificar que no hay errores 500
- [ ] Monitorear logs por 24 horas
- [ ] Probar flujo completo en producción
- [ ] Verificar rate limiting funcionando
- [ ] Verificar limpieza automática de tokens

## 🆘 Rollback Plan

Si algo falla:

```bash
# 1. Revertir código
git revert <commit-hash>
git push

# 2. Ejecutar migración reversa (si aplica)
# En este caso no hay migración destructiva

# 3. Monitorear recuperación
# Verificar que usuarios puedan loguearse

# 4. Investigar causa raíz
# Revisar logs de error
```

## ✅ Sign-off

- [ ] DevOps: Infraestructura lista
- [ ] Security: Revisión de seguridad aprobada
- [ ] QA: Tests pasados
- [ ] Product: Flujo de usuario aprobado
- [ ] Dev Lead: Código revisado

---

**Fecha de revisión:** _________________

**Revisado por:** _________________

**Aprobado para producción:** ☐ SÍ ☐ NO

**Notas adicionales:**
_____________________________________________
_____________________________________________
_____________________________________________
