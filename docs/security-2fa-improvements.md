# Mejoras de Seguridad en el Flujo de Autenticación 2FA

## 📋 Resumen del Problema Detectado

Durante una auditoría de seguridad con BurpSuite se identificó que las credenciales del usuario (email y contraseña) se estaban enviando en texto plano en cada solicitud a `/api/auth/2fa/generate`, incluyendo en los reenvíos de código.

### Request Original (VULNERABLE):
```http
POST /api/auth/2fa/generate HTTP/2
Host: bskmt.com
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Riesgos identificados:**
1. ✅ Aunque se usa HTTPS, las credenciales viajan múltiples veces
2. ❌ Las credenciales se guardan en el estado del frontend para reenvíos
3. ❌ Mayor exposición de credenciales en logs, caché, y herramientas de desarrollo
4. ❌ Si un atacante intercepta el tráfico (MITM), obtiene las credenciales directamente

## 🛡️ Solución Implementada: Token de Pre-Autenticación

### Arquitectura del Nuevo Flujo

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ 1. POST /api/auth/validate-credentials
       │    { email, password }
       ├──────────────────────────────────────────►
       │                                           
       │ ◄─────────────────────────────────────────
       │ 2. { preAuthToken, expiresIn: 300 }
       │
       │ 3. POST /api/auth/2fa/generate
       │    { preAuthToken }
       ├──────────────────────────────────────────►
       │
       │ ◄─────────────────────────────────────────
       │ 4. { twoFactorId, phoneNumber }
       │
       │ 5. Usuario recibe código por WhatsApp
       │
       │ 6. POST /api/auth/2fa/verify
       │    { twoFactorId, code, preAuthToken }
       ├──────────────────────────────────────────►
       │
       │ ◄─────────────────────────────────────────
       │ 7. { accessToken, refreshToken }
       │    + Cookies seguras
       │
```

### Componentes Nuevos

#### 1. **Modelo PreAuthToken** (`/lib/models/PreAuthToken.ts`)

```typescript
interface IPreAuthToken {
  userId: ObjectId;
  token: string;           // Token aleatorio de 32 bytes
  sessionInfo: {
    ip: string;
    userAgent: string;
    device: string;
  };
  expiresAt: Date;        // 5 minutos de vida
  used: boolean;          // Se marca como usado tras verificación exitosa
}
```

**Características de seguridad:**
- ✅ Token generado con `crypto.randomBytes(32)` (256 bits de entropía)
- ✅ Vida útil corta: 5 minutos
- ✅ Un solo uso (se marca como `used` tras verificación)
- ✅ Vinculado a la IP y UserAgent de la sesión
- ✅ Limpieza automática con TTL index de MongoDB
- ✅ No almacena credenciales

#### 2. **Endpoint de Validación** (`/api/auth/validate-credentials/route.ts`)

**Responsabilidades:**
1. Valida credenciales UNA SOLA VEZ
2. Verifica email confirmado
3. Verifica cuenta no bloqueada
4. Genera token de pre-autenticación
5. Retorna token temporal

**Rate Limiting:**
- 5 intentos cada 15 minutos por IP

#### 3. **Endpoint Actualizado** (`/api/auth/2fa/generate/route.ts`)

**Cambios principales:**
- ❌ Ya NO acepta `email` y `password`
- ✅ Ahora requiere `preAuthToken`
- ✅ Valida que el token exista, no esté usado y no haya expirado
- ✅ Verifica que la IP coincida con la IP que generó el token
- ✅ Genera y envía código OTP

**Rate Limiting actualizado:**
- 5 intentos cada 5 minutos (aumentado para permitir reenvíos)

#### 4. **Endpoint Actualizado** (`/api/auth/2fa/verify/route.ts`)

**Cambios principales:**
- ✅ Acepta `preAuthToken` opcional
- ✅ Marca el token como usado tras verificación exitosa
- ✅ Invalida el token para prevenir reutilización

### Flujo de Autenticación Mejorado

#### **Paso 1: Validación Inicial**
```typescript
// Cliente (login/page.tsx)
const validateResponse = await fetch('/api/auth/validate-credentials', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// Servidor valida y genera token
const preAuthToken = crypto.randomBytes(32).toString('hex');
```

#### **Paso 2: Generación de 2FA**
```typescript
// Cliente (login/page.tsx)
const response = await fetch('/api/auth/2fa/generate', {
  method: 'POST',
  body: JSON.stringify({ preAuthToken })  // ✅ SIN credenciales
});
```

#### **Paso 3: Reenvío de Código (si necesario)**
```typescript
// Cliente (login/page.tsx)
const response = await fetch('/api/auth/2fa/generate', {
  method: 'POST',
  body: JSON.stringify({ preAuthToken })  // ✅ Mismo token, SIN credenciales
});
```

#### **Paso 4: Verificación**
```typescript
// Cliente (TwoFactorVerification.tsx)
const response = await fetch('/api/auth/2fa/verify', {
  method: 'POST',
  body: JSON.stringify({ 
    twoFactorId, 
    code,
    preAuthToken  // ✅ Marca el token como usado
  })
});
```

## 🔒 Mejoras de Seguridad Implementadas

### 1. **Reducción de Exposición de Credenciales**
- **Antes:** Credenciales enviadas en cada solicitud (inicial + reenvíos)
- **Ahora:** Credenciales enviadas SOLO UNA VEZ

### 2. **Sin Almacenamiento de Credenciales en Cliente**
- **Antes:** `useState` guardaba `{ email, password }` en memoria del navegador
- **Ahora:** Solo se guarda el token temporal (no reversible a credenciales)

### 3. **Tokens de Corta Vida**
- **Duración:** 5 minutos
- **Auto-expiración:** TTL index en MongoDB
- **Un solo uso:** Campo `used` previene reutilización

### 4. **Validación de Contexto de Sesión**
- **IP binding:** El token solo es válido desde la misma IP
- **UserAgent tracking:** Información de dispositivo registrada
- **Device fingerprinting:** Platform del cliente almacenada

### 5. **Rate Limiting Mejorado**

| Endpoint | Límite | Ventana | Propósito |
|----------|--------|---------|-----------|
| `/validate-credentials` | 5 intentos | 15 min | Prevenir fuerza bruta en login |
| `/2fa/generate` | 5 intentos | 5 min | Permitir reenvíos razonables |
| `/2fa/verify` | 10 intentos | 5 min | Permitir errores de tipeo |

### 6. **Prevención de Ataques**

#### **Replay Attack**
- ✅ Token marcado como `used` tras verificación exitosa
- ✅ No puede reutilizarse el mismo token

#### **Man-in-the-Middle (MITM)**
- ✅ Token inútil sin el código 2FA (enviado por canal separado)
- ✅ Vida útil corta limita ventana de ataque
- ✅ IP binding previene uso desde otra ubicación

#### **Session Hijacking**
- ✅ Tokens de pre-auth no son cookies (no enviados automáticamente)
- ✅ Cada fase requiere información diferente

#### **Credential Stuffing**
- ✅ Rate limiting agresivo en validación
- ✅ Bloqueo de cuenta tras múltiples intentos fallidos

## 📊 Comparativa de Seguridad

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Veces que viajan credenciales** | 1-5+ veces | 1 vez |
| **Almacenamiento en cliente** | Credenciales completas | Token temporal |
| **Validez del token** | N/A | 5 minutos |
| **Reutilización posible** | Sí | No (un solo uso) |
| **Validación de contexto** | No | Sí (IP + UserAgent) |
| **Exposición en logs** | Alta (credenciales) | Baja (token hash) |
| **Trazabilidad de sesión** | Limitada | Completa |

## 🔍 Verificación de Seguridad

### Request POST a `/api/auth/2fa/generate` (NUEVO)
```http
POST /api/auth/2fa/generate HTTP/2
Host: bskmt.com
Content-Type: application/json

{
  "preAuthToken": "a7f3c9e1b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6"
}
```

✅ **Ya NO contiene credenciales**
✅ **Token es inútil sin el código 2FA**
✅ **Token expira en 5 minutos**
✅ **Token solo válido desde la misma IP**

## 📝 Consideraciones Adicionales

### Monitoreo Recomendado
1. **Logs de tokens expirados:** Detectar posibles ataques de replay
2. **IP mismatches:** Alertar cuando IPs no coinciden
3. **Tasa de reenvíos:** Usuarios que reenvían códigos excesivamente
4. **Tokens no utilizados:** Inicios de sesión abandonados

### Pruebas de Seguridad Sugeridas
- [ ] Intentar reutilizar un `preAuthToken` usado
- [ ] Intentar usar un token desde otra IP
- [ ] Intentar usar un token expirado
- [ ] Verificar que las credenciales no aparecen en logs
- [ ] Probar rate limiting en cada endpoint
- [ ] Verificar limpieza automática de tokens expirados

## 🚀 Próximos Pasos de Hardening

1. **CAPTCHA en validación de credenciales** (prevenir bots)
2. **Device fingerprinting avanzado** (Canvas, WebGL, Audio)
3. **Geolocalización de sesiones** (alertas de login desde nuevas ubicaciones)
4. **Alertas de seguridad por email** (login desde nuevo dispositivo)
5. **Análisis de comportamiento** (detección de patrones anómalos)

## ✅ Conclusión

El nuevo flujo de autenticación reduce significativamente la superficie de ataque al:
- Minimizar exposición de credenciales
- Implementar tokens de corta vida y un solo uso
- Añadir validación de contexto de sesión
- Mejorar trazabilidad y auditoría

Esta implementación sigue las mejores prácticas de OWASP y cumple con estándares de seguridad modernos para aplicaciones web.
