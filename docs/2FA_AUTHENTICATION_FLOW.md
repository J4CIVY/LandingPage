# 🔄 Flujo Completo de Autenticación 2FA

## Problema Resuelto

**Problema Original**: Después de verificar el código 2FA correctamente, el usuario era redirigido a una página que mostraba "Acceso Requerido - Debes iniciar sesión", aunque las credenciales eran correctas.

**Causa**: El API `/api/auth/2fa/verify` configuraba correctamente las cookies JWT, pero el contexto de autenticación de React (`useAuth`) no se actualizaba con el estado del usuario.

**Solución**: Después de verificar el código 2FA exitosamente, llamar a `refreshAuth()` para actualizar el estado de autenticación antes de redirigir.

---

## 🔄 Flujo Completo Paso a Paso

### 1️⃣ Usuario Ingresa Credenciales

```
Usuario en /login
   ↓
Ingresa email y contraseña
   ↓
Click en "Iniciar Sesión"
   ↓
onSubmit() se ejecuta
```

**Código**:
```typescript
const onSubmit = async (data) => {
  // Llamar a /api/auth/2fa/generate
  const response = await fetch('/api/auth/2fa/generate', {
    body: JSON.stringify({
      email: data.email,
      password: data.password
    })
  });
  
  // Si es exitoso, mostrar pantalla 2FA
  if (result.success) {
    setShow2FA(true);
    setTwoFactorData({
      twoFactorId: result.data.twoFactorId,
      phoneNumber: result.data.phoneNumber,
      expiresIn: result.data.expiresIn
    });
  }
};
```

---

### 2️⃣ Backend Valida y Genera Código

```
API: /api/auth/2fa/generate
   ↓
1. Validar email y contraseña
2. Verificar cuenta activa
3. Verificar email verificado
4. Generar código OTP (6 dígitos)
5. Guardar en DB (modelo TwoFactorCode)
6. Enviar a MessageBird webhook
   ↓
MessageBird envía por WhatsApp
```

**Código**:
```typescript
// POST /api/auth/2fa/generate
const otpCode = generateOTPCode(); // "ABC123"
const twoFactorCode = new TwoFactorCode({
  userId: user._id,
  code: otpCode,
  phoneNumber: whatsappNumber,
  expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
  attempts: 0,
  maxAttempts: 3
});

await twoFactorCode.save();

// Enviar a MessageBird
await sendOTPToMessageBird(otpCode, whatsappNumber, ...);
```

---

### 3️⃣ Usuario Ingresa Código OTP

```
Pantalla TwoFactorVerification
   ↓
Usuario ingresa 6 dígitos
   ↓
Auto-submit cuando completa
   ↓
handleVerify() se ejecuta
```

**Código**:
```typescript
const handleVerify = async (codeToVerify: string) => {
  const response = await fetch('/api/auth/2fa/verify', {
    body: JSON.stringify({
      twoFactorId,
      code: codeToVerify
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    onVerified(); // ✅ Callback al componente padre
  } else {
    setError(data.message);
  }
};
```

---

### 4️⃣ Backend Verifica Código

```
API: /api/auth/2fa/verify
   ↓
1. Buscar código en DB por twoFactorId
2. Verificar que no expiró (< 5 min)
3. Verificar que no fue usado (verified = false)
4. Verificar intentos (< 3)
5. Comparar código ingresado
   ↓
Si es correcto:
   ↓
6. Marcar código como verified
7. Crear sesión en DB
8. Generar JWT tokens (access + refresh)
9. Configurar cookies HTTP-only
10. Actualizar lastLogin del usuario
11. Retornar datos del usuario
```

**Código**:
```typescript
// POST /api/auth/2fa/verify
const isCodeValid = twoFactorCode.code.toUpperCase() === code.toUpperCase();

if (isCodeValid) {
  await twoFactorCode.markAsVerified();
  
  // Crear sesión
  const session = new Session({
    userId: user._id,
    sessionToken: generateSecureToken(),
    refreshToken: generateSecureToken(),
    deviceInfo: extractDeviceInfo(request),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  await session.save();
  
  // Generar JWT
  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    email: user.email,
    membershipType: user.membershipType,
    role: user.role,
    sessionId: session._id.toString()
  });
  
  // Configurar cookies
  response.cookies.set('bsk-access-token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 // 15 minutos
  });
  
  return NextResponse.json({
    success: true,
    data: {
      user: user.getPublicProfile(),
      accessToken,
      refreshToken
    }
  });
}
```

---

### 5️⃣ Frontend Actualiza Estado de Autenticación ✅ **[CLAVE]**

```
TwoFactorVerification llama onVerified()
   ↓
LoginPage.handle2FAVerified() se ejecuta
   ↓
🔑 Llamar refreshAuth() para actualizar contexto
   ↓
refreshAuth() hace fetch a /api/auth/me
   ↓
/api/auth/me lee las cookies JWT
   ↓
Retorna datos del usuario
   ↓
useAuth actualiza:
   - isAuthenticated = true
   - user = {...datos del usuario}
   ↓
Router.push('/dashboard')
   ↓
✅ Usuario ve el dashboard
```

**Código ANTES (❌ NO FUNCIONABA)**:
```typescript
const handle2FAVerified = () => {
  clearRedirectUrl();
  router.push(returnUrl); // ❌ No actualiza estado auth
};
```

**Código DESPUÉS (✅ FUNCIONA)**:
```typescript
const handle2FAVerified = async () => {
  console.log('2FA verificado! Actualizando estado...');
  
  // 🔑 Actualizar estado de autenticación
  const authSuccess = await refreshAuth();
  
  if (authSuccess) {
    clearRedirectUrl();
    console.log('Login exitoso! Redirigiendo...');
    
    setTimeout(() => {
      router.push(returnUrl);
      router.refresh();
    }, 100);
  } else {
    setLoginError('Error al completar autenticación');
    setShow2FA(false);
  }
};
```

---

## 🔐 Estado de las Cookies

### Después de `/api/auth/2fa/verify`:

```
Cookies configuradas:
✅ bsk-access-token  (JWT, 15 min, httpOnly, secure, sameSite: strict)
✅ bsk-refresh-token (JWT, 7 días, httpOnly, secure, sameSite: strict)
```

### Después de `refreshAuth()`:

```
Estado de useAuth actualizado:
✅ isAuthenticated = true
✅ user = {
    _id: "...",
    email: "...",
    firstName: "...",
    lastName: "...",
    membershipType: "...",
    role: "...",
    ...
  }
✅ isLoading = false
✅ error = null
```

---

## 📊 Comparación: Antes vs Después

| Aspecto | ❌ Antes | ✅ Después |
|---------|---------|-----------|
| **Cookies** | ✅ Configuradas correctamente | ✅ Configuradas correctamente |
| **Contexto Auth** | ❌ NO actualizado | ✅ Actualizado con `refreshAuth()` |
| **Estado isAuthenticated** | ❌ false | ✅ true |
| **Datos de usuario** | ❌ null | ✅ Objeto completo |
| **Redirección** | ❌ Middleware detecta no-auth | ✅ Acceso permitido |
| **Resultado** | ❌ "Acceso Requerido" | ✅ Dashboard visible |

---

## 🛡️ Middleware de Protección

El middleware verifica autenticación en cada request:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('bsk-access-token');
  
  if (protectedRoute && !token) {
    // ❌ Antes: Token existe pero contexto no actualizado
    // Usuario ve "Acceso Requerido"
    
    // ✅ Después: Token existe Y contexto actualizado
    // Usuario ve dashboard
    return NextResponse.redirect('/login?returnUrl=' + pathname);
  }
  
  return NextResponse.next();
}
```

---

## 🔄 refreshAuth() en Detalle

```typescript
const refreshAuth = async (): Promise<boolean> => {
  try {
    // Hacer request a /api/auth/me con las cookies
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // 🔑 Incluir cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      
      if (result.success && result.data?.user) {
        // 🔑 Actualizar estado de autenticación
        updateAuthState({
          isAuthenticated: true,
          user: result.data.user,
          error: null
        });
        return true; // ✅ Éxito
      }
    }

    return false; // ❌ Fallo
  } catch (error) {
    console.error('Error refreshing auth:', error);
    return false;
  }
};
```

---

## 🎯 Flujo Completo Resumido

```
1. Usuario ingresa email/contraseña
   ↓
2. Backend valida y genera código OTP
   ↓
3. MessageBird envía código por WhatsApp
   ↓
4. Usuario ingresa código de 6 dígitos
   ↓
5. Backend verifica código
   ↓
6. Backend crea sesión y configura cookies JWT ✅
   ↓
7. Frontend recibe respuesta exitosa
   ↓
8. Frontend llama refreshAuth() 🔑 [NUEVO]
   ↓
9. refreshAuth() actualiza contexto con datos de usuario ✅
   ↓
10. Redirección a /dashboard
   ↓
11. ✅ Usuario autenticado ve dashboard
```

---

## ✅ Checklist de Verificación

Cuando un usuario hace login con 2FA, verifica:

- [ ] Código OTP enviado por WhatsApp
- [ ] Código OTP guardado en base de datos
- [ ] Usuario ingresa código correcto
- [ ] API `/api/auth/2fa/verify` retorna success: true
- [ ] Cookies JWT configuradas (bsk-access-token, bsk-refresh-token)
- [ ] `refreshAuth()` llamado y retorna true
- [ ] `useAuth` state actualizado:
  - [ ] `isAuthenticated = true`
  - [ ] `user` tiene datos completos
  - [ ] `error = null`
- [ ] Redirección a dashboard ejecutada
- [ ] Usuario ve contenido de dashboard

---

## 🐛 Debugging

Si el usuario aún ve "Acceso Requerido":

### 1. Verificar Cookies
```javascript
// En DevTools Console:
document.cookie
// Debe mostrar: bsk-access-token=...; bsk-refresh-token=...
```

### 2. Verificar Estado de Auth
```typescript
// En LoginPage, agregar console.log:
const authSuccess = await refreshAuth();
console.log('Auth success:', authSuccess);
console.log('Current auth state:', useAuth());
```

### 3. Verificar API /api/auth/me
```bash
curl http://localhost:3000/api/auth/me \
  -H "Cookie: bsk-access-token=TU_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. Verificar Logs del Servidor
```bash
npm run dev | grep -i "2fa\|auth\|verify"
```

---

## 📝 Notas Importantes

1. **Las cookies son HTTP-only**: No se pueden leer desde JavaScript por seguridad
2. **refreshAuth() es esencial**: Sin él, el contexto de React no se actualiza
3. **El timing importa**: Esperar 100ms antes de redirigir asegura que el estado se propague
4. **Middleware y contexto**: Ambos deben estar sincronizados

---

## 🎉 Resultado Final

**Antes**: Usuario verificaba código 2FA → cookies configuradas → contexto NO actualizado → middleware bloqueaba → "Acceso Requerido"

**Ahora**: Usuario verifica código 2FA → cookies configuradas → `refreshAuth()` actualiza contexto → middleware permite → ✅ Dashboard visible

---

**Fecha de corrección**: 1 de Octubre, 2025  
**Estado**: ✅ Funcionando correctamente
