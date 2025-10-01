# Fix: Error 401 en `/api/auth/refresh` después de Login con 2FA

## Problema

Al intentar iniciar sesión después de ingresar el código 2FA, se producía el siguiente error:

```
Error al completar la autenticación. Por favor intenta nuevamente.
POST https://bskmt.com/api/auth/refresh 401 (Unauthorized)
```

## Causa Raíz

Había una **inconsistencia en el manejo de tokens** entre los endpoints de autenticación:

### Problema 1: Inconsistencia en el tipo de Refresh Token

1. **En `/api/auth/2fa/verify` y `/api/auth/login`**: Se generaban dos tipos de tokens:
   - `sessionToken`: Token aleatorio generado con `generateSecureToken()` (hex random)
   - `refreshTokenValue`: Token aleatorio generado con `generateSecureToken()` (hex random)
   - `refreshToken` (JWT): Token JWT generado con `generateRefreshToken()` con payload userId y sessionId

2. **En la base de datos (modelo Session)**: Se guardaba el token aleatorio (`refreshTokenValue`) en lugar del JWT.

3. **En las cookies del cliente**: Se enviaba el JWT (`refreshToken`) como cookie `bsk-refresh-token`.

4. **En `/api/auth/refresh`**: Se esperaba recibir el JWT en la cookie, lo verificaba con `verifyRefreshToken()`, extraía el `sessionId`, buscaba la sesión en la base de datos y comparaba el token recibido con el token guardado en la BD.

**El problema**: La comparación fallaba porque:
- Cookie contenía: JWT firmado (ej: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
- Base de datos contenía: Token aleatorio hex (ej: `a1b2c3d4e5f6...`)

### Problema 2: Flujo de verificación después de 2FA

En el componente de login (`app/login/page.tsx`), después de verificar el código 2FA exitosamente:

1. Se llamaba a `refreshAuth()` que a su vez llamaba a `/api/auth/refresh`
2. Las cookies acababan de ser establecidas por `/api/auth/2fa/verify`
3. La llamada a `/api/auth/refresh` era **innecesaria** porque ya teníamos tokens frescos
4. Además, podía haber un race condition donde las cookies no estuvieran disponibles inmediatamente

## Solución

### 1. Corregir el almacenamiento de Refresh Tokens

**Archivo**: `/app/api/auth/2fa/verify/route.ts` y `/app/api/auth/login/route.ts`

**Cambios**:

```typescript
// ANTES (INCORRECTO)
const sessionToken = generateSecureToken();
const refreshTokenValue = generateSecureToken(); // Token aleatorio

const session = new Session({
  userId: user._id,
  sessionToken,
  refreshToken: refreshTokenValue, // ❌ Token aleatorio en BD
  deviceInfo,
  expiresAt: getSessionExpirationDate()
});

await session.save();

// JWT generado después
const refreshToken = generateRefreshToken({
  userId: user._id.toString(),
  sessionId: session._id.toString()
}); // ✅ JWT enviado en cookie

// DESPUÉS (CORRECTO)
// Generar JWT tokens primero con sessionId temporal
const tempRefreshToken = generateRefreshToken({
  userId: user._id.toString(),
  sessionId: '' // Temporal
});

// Crear sesión con el JWT
const session = new Session({
  userId: user._id,
  sessionToken: generateSecureToken(),
  refreshToken: tempRefreshToken, // ✅ JWT en BD (temporal)
  deviceInfo,
  expiresAt: getSessionExpirationDate()
});

await session.save();

// Regenerar con sessionId correcto
const finalRefreshToken = generateRefreshToken({
  userId: user._id.toString(),
  sessionId: session._id.toString()
});

// Actualizar la sesión con el refresh token final
session.refreshToken = finalRefreshToken; // ✅ JWT final en BD
await session.save();
```

**Resultado**: Ahora tanto la cookie como la base de datos contienen el mismo JWT.

### 2. Simplificar el flujo post-2FA

**Archivo**: `/app/login/page.tsx`

**Cambios**:

```typescript
// ANTES (INCORRECTO)
const handle2FAVerified = async () => {
  const authSuccess = await refreshAuth(); // ❌ Llamada innecesaria a /refresh
  
  if (authSuccess) {
    router.push(returnUrl);
  }
};

// DESPUÉS (CORRECTO)
const handle2FAVerified = async () => {
  // Esperar para asegurar que las cookies estén disponibles
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Verificar directamente con /api/auth/me
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include'
  });

  if (response.ok) {
    const result = await response.json();
    
    if (result.success && result.data?.user) {
      router.push(returnUrl);
      router.refresh();
    }
  }
};
```

**Resultado**: Ya no se llama a `/api/auth/refresh` innecesariamente después de 2FA.

## Flujo Correcto Actualizado

### Login con 2FA

```
1. Usuario → Email/Password → /api/auth/2fa/generate
   ↓
2. Sistema envía código por WhatsApp
   ↓
3. Usuario → Ingresa código → /api/auth/2fa/verify
   ↓
4. Backend:
   - Verifica código
   - Genera JWT accessToken y refreshToken (con sessionId)
   - Crea Session en BD con refreshToken JWT
   - Establece cookies: bsk-access-token, bsk-refresh-token
   - Responde con datos del usuario
   ↓
5. Frontend:
   - Espera 100ms para asegurar cookies
   - Llama a /api/auth/me para verificar sesión
   - Redirige al dashboard
```

### Refresh Token

```
1. Access token expira (15 minutos)
   ↓
2. Cliente → Cookie bsk-refresh-token (JWT) → /api/auth/refresh
   ↓
3. Backend:
   - Verifica JWT refresh token
   - Extrae userId y sessionId del payload
   - Busca Session en BD
   - Compara JWT recibido con JWT guardado en session.refreshToken
   - ✅ Ahora coinciden porque ambos son JWT
   - Genera nuevo access token
   - Actualiza lastUsed en sesión
   - Responde con nuevo access token y datos usuario
```

## Verificación

Para verificar que el fix funciona correctamente:

1. **Iniciar sesión**:
   ```bash
   # Iniciar sesión con email/password
   # Ingresar código 2FA
   # Verificar que se redirige correctamente al dashboard
   ```

2. **Verificar cookies** (DevTools → Application → Cookies):
   - `bsk-access-token`: Debe contener un JWT
   - `bsk-refresh-token`: Debe contener un JWT

3. **Verificar en MongoDB**:
   ```javascript
   // En la colección 'sessions'
   db.sessions.findOne({ userId: ObjectId("...") })
   
   // El campo 'refreshToken' debe contener un JWT que coincida
   // con la cookie 'bsk-refresh-token'
   ```

4. **Probar refresh automático**:
   - Esperar 15 minutos (o manipular el tiempo de expiración)
   - El sistema debe renovar el access token automáticamente sin errores

## Archivos Modificados

1. `/app/api/auth/2fa/verify/route.ts` - Corrección en generación y almacenamiento de tokens
2. `/app/api/auth/login/route.ts` - Corrección en generación y almacenamiento de tokens
3. `/app/login/page.tsx` - Simplificación del flujo post-2FA

## Fecha

Octubre 1, 2025
