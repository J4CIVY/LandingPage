# 🔐 Guía de Implementación: Autenticación Segura con Pre-Auth Tokens

## 📦 Cambios Implementados

### Archivos Nuevos
- ✅ `/lib/models/PreAuthToken.ts` - Modelo de token de pre-autenticación
- ✅ `/app/api/auth/validate-credentials/route.ts` - Endpoint para validar credenciales
- ✅ `/scripts/test-preauth-token.ts` - Script de pruebas del modelo
- ✅ `/docs/security-2fa-improvements.md` - Documentación de seguridad completa

### Archivos Modificados
- ✅ `/app/api/auth/2fa/generate/route.ts` - Ahora usa preAuthToken en lugar de credenciales
- ✅ `/app/api/auth/2fa/verify/route.ts` - Marca tokens como usados
- ✅ `/app/login/page.tsx` - Implementa nuevo flujo con tokens
- ✅ `/components/auth/TwoFactorVerification.tsx` - Envía preAuthToken en verificación

## 🚀 Pasos para Desplegar

### 1. Instalar Dependencias (si es necesario)
```bash
npm install
```

### 2. Verificar Variables de Entorno
Asegúrate de tener estas variables en tu `.env.local`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
MESSAGEBIRD_API_KEY=your_messagebird_key
NODE_ENV=production
```

### 3. Construir el Proyecto
```bash
npm run build
```

### 4. Ejecutar Migraciones (si las tienes)
No se requieren migraciones, MongoDB creará la colección automáticamente.

### 5. Reiniciar la Aplicación
```bash
npm run start
# o en desarrollo
npm run dev
```

## 🧪 Pruebas de Seguridad

### Prueba 1: Flujo Normal de Login
```bash
# 1. Validar credenciales
curl -X POST https://bskmt.com/api/auth/validate-credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Respuesta esperada:
{
  "success": true,
  "data": {
    "preAuthToken": "a7f3c9e1b2d4f6a8...",
    "expiresIn": 300,
    "userId": "...",
    "email": "user@example.com",
    "requiresTwoFactor": true
  }
}

# 2. Generar código 2FA
curl -X POST https://bskmt.com/api/auth/2fa/generate \
  -H "Content-Type: application/json" \
  -d '{"preAuthToken":"a7f3c9e1b2d4f6a8..."}'

# 3. Verificar código
curl -X POST https://bskmt.com/api/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "twoFactorId":"...",
    "code":"ABC123",
    "preAuthToken":"a7f3c9e1b2d4f6a8..."
  }'
```

### Prueba 2: Token Expirado
```bash
# Esperar 6 minutos y luego intentar usar el token
curl -X POST https://bskmt.com/api/auth/2fa/generate \
  -H "Content-Type: application/json" \
  -d '{"preAuthToken":"expired_token"}'

# Respuesta esperada:
{
  "success": false,
  "error": "PRE_AUTH_TOKEN_EXPIRED",
  "message": "Token expirado. Por favor inicia sesión nuevamente."
}
```

### Prueba 3: Reutilización de Token
```bash
# Usar el mismo token después de verificación exitosa
curl -X POST https://bskmt.com/api/auth/2fa/generate \
  -H "Content-Type: application/json" \
  -d '{"preAuthToken":"used_token"}'

# Respuesta esperada:
{
  "success": false,
  "error": "INVALID_PRE_AUTH_TOKEN",
  "message": "Token inválido o expirado"
}
```

### Prueba 4: IP Mismatch
```bash
# Intentar usar el token desde una IP diferente
# (Usar un proxy o VPN)
curl -X POST https://bskmt.com/api/auth/2fa/generate \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 10.0.0.1" \
  -d '{"preAuthToken":"valid_token_from_different_ip"}'

# Respuesta esperada:
{
  "success": false,
  "error": "IP_MISMATCH",
  "message": "Sesión inválida. Por favor inicia sesión nuevamente."
}
```

### Prueba 5: Rate Limiting
```bash
# Hacer 6 intentos rápidos
for i in {1..6}; do
  curl -X POST https://bskmt.com/api/auth/validate-credentials \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# El 6to intento debe retornar:
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Demasiados intentos. Por favor espera 15 minutos."
}
```

## 🔍 Verificación con BurpSuite

### Antes (VULNERABLE):
```http
POST /api/auth/2fa/generate HTTP/2
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "miContraseña123"  ⚠️ CREDENCIALES EXPUESTAS
}
```

### Ahora (SEGURO):
```http
POST /api/auth/2fa/generate HTTP/2
Content-Type: application/json

{
  "preAuthToken": "a7f3c9e1b2d4f6a8c0e2b4d6f8a0c2e4..."  ✅ TOKEN TEMPORAL
}
```

**Verificaciones en BurpSuite:**
1. ✅ Las credenciales solo aparecen en `/validate-credentials`
2. ✅ El token es diferente en cada login
3. ✅ El token expira en 5 minutos
4. ✅ El token no puede reutilizarse
5. ✅ No se pueden ver credenciales en logs del navegador

## 📊 Monitoreo en Producción

### Queries de MongoDB para Auditoría

#### Ver tokens activos
```javascript
db.preauthtokens.find({ 
  used: false, 
  expiresAt: { $gt: new Date() } 
}).sort({ createdAt: -1 })
```

#### Ver intentos de reutilización (tokens usados)
```javascript
db.preauthtokens.find({ 
  used: true 
}).sort({ updatedAt: -1 }).limit(50)
```

#### Detectar posibles ataques (muchos tokens desde misma IP)
```javascript
db.preauthtokens.aggregate([
  {
    $match: {
      createdAt: { $gte: new Date(Date.now() - 60*60*1000) } // Última hora
    }
  },
  {
    $group: {
      _id: "$sessionInfo.ip",
      count: { $sum: 1 }
    }
  },
  {
    $match: { count: { $gt: 10 } } // Más de 10 intentos
  },
  {
    $sort: { count: -1 }
  }
])
```

#### Tokens expirados no utilizados (sesiones abandonadas)
```javascript
db.preauthtokens.find({
  used: false,
  expiresAt: { $lt: new Date() }
}).count()
```

### Alertas Recomendadas

1. **Alerta de Seguridad: IP Mismatch**
   - Trigger: Más de 3 intentos con IP diferentes
   - Acción: Enviar email al usuario

2. **Alerta de Seguridad: Token Expirado Frecuente**
   - Trigger: Usuario tiene más de 3 tokens expirados sin usar
   - Acción: Investigar posible problema de UX o ataque

3. **Alerta de Abuso: Rate Limiting**
   - Trigger: IP bloqueada por rate limiting
   - Acción: Revisar en sistema de seguridad

## 🐛 Debugging

### Ver logs en tiempo real
```bash
# En el servidor
tail -f logs/app.log | grep -E "PreAuthToken|validate-credentials|2fa"
```

### Verificar conexión a MongoDB
```bash
# Conectar a MongoDB
mongosh $MONGODB_URI

# Verificar colección
use your_database
db.preauthtokens.countDocuments()
db.preauthtokens.findOne()
```

### Verificar índices TTL
```javascript
db.preauthtokens.getIndexes()

// Debe incluir:
{
  "v": 2,
  "key": { "expiresAt": 1 },
  "name": "expiresAt_1",
  "expireAfterSeconds": 0
}
```

## 🔧 Rollback (si es necesario)

Si necesitas volver a la implementación anterior:

```bash
# 1. Revertir cambios en git
git revert HEAD

# 2. O restaurar archivos específicos
git checkout main -- app/api/auth/2fa/generate/route.ts
git checkout main -- app/login/page.tsx
git checkout main -- components/auth/TwoFactorVerification.tsx

# 3. Eliminar modelo nuevo
rm lib/models/PreAuthToken.ts
rm app/api/auth/validate-credentials/route.ts

# 4. Rebuild
npm run build

# 5. Restart
npm run start
```

## ✅ Checklist de Deployment

- [ ] Variables de entorno configuradas
- [ ] MongoDB accesible desde el servidor
- [ ] Índices TTL verificados en MongoDB
- [ ] Build exitoso sin errores
- [ ] Pruebas de flujo normal completadas
- [ ] Pruebas de seguridad completadas
- [ ] Rate limiting funcionando
- [ ] Logs configurados y accesibles
- [ ] Sistema de monitoreo activo
- [ ] Documentación actualizada
- [ ] Equipo notificado de los cambios

## 📚 Referencias

- [Documentación completa de seguridad](./docs/security-2fa-improvements.md)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [MongoDB TTL Indexes](https://www.mongodb.com/docs/manual/core/index-ttl/)

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs de la aplicación
2. Verifica la documentación en `/docs/security-2fa-improvements.md`
3. Ejecuta el script de pruebas: `npm run test:preauth`
4. Contacta al equipo de desarrollo

---

**Fecha de implementación:** Octubre 5, 2025  
**Versión:** 2.0.0  
**Auditor:** BurpSuite Security Scan
