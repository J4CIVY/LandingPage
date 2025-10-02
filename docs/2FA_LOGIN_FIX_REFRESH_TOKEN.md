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
   # Verificar que el dashboard muestra el contenido inmediatamente (sin mensaje "Acceso Requerido")
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

## Fix Adicional: Dashboard muestra "Acceso Requerido" después de login exitoso

### Problema Adicional Detectado

Después de aplicar el fix principal, se detectó otro problema:

**Síntoma**: Después de iniciar sesión exitosamente con 2FA, el usuario es redirigido a `/dashboard` pero ve el mensaje "Acceso Requerido - Debes iniciar sesión para acceder al dashboard". Al recargar la página manualmente, el dashboard se muestra correctamente.

**Causa**: El `AuthProvider` no actualiza su estado inmediatamente después del login con 2FA. Aunque las cookies se establecen correctamente en el navegador:
1. Usuario verifica código 2FA → cookies se establecen
2. `router.push('/dashboard')` redirige a dashboard
3. Componente Dashboard renderiza y verifica `isAuthenticated` del `AuthProvider`
4. ❌ `AuthProvider` aún tiene `isAuthenticated: false` porque su estado no se actualizó
5. Dashboard muestra "Acceso Requerido"
6. Al recargar manualmente, el `useEffect` inicial de `AuthProvider` ejecuta `checkAuth()` y obtiene el estado correcto

### Solución

**Archivo**: `/hooks/useAuth.tsx`

**Cambios**:

1. Exponer la función `checkAuth` en el contexto para que pueda ser llamada manualmente:

```typescript
interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean, redirectUrl?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>; // ✅ Añadido
  isInitialized: boolean;
  setRedirectUrl: (url: string) => void;
  getRedirectUrl: () => string | null;
  clearRedirectUrl: () => void;
}

// En el contextValue
const contextValue: AuthContextType = {
  ...authState,
  login,
  logout,
  refreshAuth,
  checkAuth, // ✅ Añadido
  isInitialized,
  setRedirectUrl,
  getRedirectUrl,
  clearRedirectUrl
};
```

**Archivo**: `/app/login/page.tsx`

**Cambios**:

```typescript
// Obtener checkAuth del hook
const { getRedirectUrl, clearRedirectUrl, checkAuth } = useAuth();

// En handle2FAVerified
const handle2FAVerified = async () => {
  console.log('2FA verificado! Actualizando estado de autenticación...');
  
  try {
    // Esperar para asegurar que las cookies estén disponibles
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // ✅ Actualizar el estado del AuthProvider verificando las cookies
    const authSuccess = await checkAuth();
    
    if (authSuccess) {
      clearRedirectUrl();
      console.log('Login exitoso con 2FA! Redirigiendo a:', returnUrl);
      
      // Redirigir - ahora AuthProvider tiene el estado correcto
      router.push(returnUrl);
    } else {
      setLoginError('Error al completar la autenticación. Por favor intenta nuevamente.');
      setShow2FA(false);
      setTwoFactorData(null);
    }
  } catch (error) {
    console.error('Error en handle2FAVerified:', error);
    setLoginError('Error de conexión. Por favor intenta nuevamente.');
    setShow2FA(false);
    setTwoFactorData(null);
  }
};
```

**Resultado**: Ahora el `AuthProvider` actualiza su estado inmediatamente después de la verificación 2FA, antes de redirigir al dashboard. El dashboard renderiza correctamente desde el primer momento sin necesidad de recargar.

## Archivos Modificados

1. `/app/api/auth/2fa/verify/route.ts` - Corrección en generación y almacenamiento de tokens
2. `/app/api/auth/login/route.ts` - Corrección en generación y almacenamiento de tokens
3. `/app/login/page.tsx` - Simplificación del flujo post-2FA y actualización del estado del AuthProvider
4. `/hooks/useAuth.tsx` - Exposición de la función `checkAuth` en el contexto

## Fecha

Octubre 1, 2025
