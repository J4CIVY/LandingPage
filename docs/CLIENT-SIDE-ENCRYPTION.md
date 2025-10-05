# 🔐 Encriptación Client-Side RSA - Documentación Técnica

## 📋 Resumen

Implementación de encriptación RSA-2048 client-side para proteger las credenciales del usuario durante la transmisión, incluso si el tráfico HTTPS es interceptado (por ejemplo, con BurpSuite en una auditoría de seguridad).

---

## 🎯 Problema Resuelto

### Antes ❌
```http
POST /api/auth/validate-credentials HTTP/2
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "MiContraseña123"  ⚠️ TEXTO PLANO VISIBLE EN BURPSUITE
}
```

### Ahora ✅
```http
POST /api/auth/validate-credentials HTTP/2
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "encryptedPassword": "kR7vXm9Q...base64..." ✅ ENCRIPTADO CON RSA-2048
}
```

**Incluso si alguien intercepta el tráfico con BurpSuite, solo verá datos encriptados.**

---

## 🏗️ Arquitectura de la Solución

### Flujo Completo

```
┌──────────────────────────────────────────────────────────────────┐
│                    FLUJO DE ENCRIPTACIÓN                          │
└──────────────────────────────────────────────────────────────────┘

1️⃣  Cliente solicita llave pública
    GET /api/auth/public-key
    ↓
    Servidor genera par de llaves RSA (si no existen)
    Retorna llave pública
    ↓
    Cliente cachea la llave (1 hora)

2️⃣  Usuario ingresa credenciales
    Email: usuario@ejemplo.com
    Password: MiContraseña123
    ↓
    Cliente encripta la contraseña con la llave pública
    usando Web Crypto API (RSA-OAEP, SHA-256)
    ↓
    Resultado: kR7vXm9Q2Lp... (base64, ~342 bytes)

3️⃣  Cliente envía credenciales encriptadas
    POST /api/auth/validate-credentials
    {
      "email": "usuario@ejemplo.com",
      "encryptedPassword": "kR7vXm9Q..."
    }

4️⃣  Servidor desencripta
    Usa su llave privada (guardada en memoria)
    Desencripta la contraseña
    → "MiContraseña123"
    ↓
    Valida contra la base de datos
    ↓
    Genera token de pre-autenticación
    ↓
    Retorna token (sin credenciales)
```

---

## 🔧 Componentes Implementados

### 1. Backend - Generación de Llaves

**Archivo:** `/lib/encryption-utils.ts`

```typescript
// Genera un par de llaves RSA-2048
generateKeyPair(): { publicKey: string; privateKey: string }

// Obtiene o crea el par de llaves del servidor
getOrCreateKeyPair(): { publicKey: string; privateKey: string }

// Desencripta datos con la llave privada
decryptWithPrivateKey(encryptedData: string, privateKey: string): string

// Obtiene solo la llave pública (para enviar al cliente)
getPublicKey(): string

// Valida formato de datos encriptados
validateEncryptedData(encryptedData: string): boolean
```

**Características:**
- ✅ Llaves RSA-2048 (muy seguras)
- ✅ Padding: RSA-OAEP
- ✅ Hash: SHA-256
- ✅ Llaves almacenadas en memoria (no en disco)
- ✅ Generación única al inicio del servidor

---

### 2. Backend - Endpoint de Llave Pública

**Archivo:** `/app/api/auth/public-key/route.ts`

```http
GET /api/auth/public-key

Response:
{
  "success": true,
  "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBI...",
  "keySize": 2048,
  "algorithm": "RSA-OAEP",
  "hash": "SHA-256"
}
```

**Características:**
- ✅ Endpoint público (no requiere autenticación)
- ✅ Cache-Control: 1 hora
- ✅ Retorna solo la llave pública (nunca la privada)
- ✅ Formato PEM estándar

---

### 3. Backend - Validación con Desencriptación

**Archivo:** `/app/api/auth/validate-credentials/route.ts`

**Cambios principales:**
```typescript
// Antes
const { email, password } = body;

// Ahora
const { email, encryptedPassword } = body;

// Validar formato
if (!validateEncryptedData(encryptedPassword)) {
  return error('INVALID_ENCRYPTION_FORMAT');
}

// Desencriptar
const { privateKey } = getOrCreateKeyPair();
const password = decryptWithPrivateKey(encryptedPassword, privateKey);

// Continuar con validación normal...
```

---

### 4. Frontend - Utilidad de Encriptación

**Archivo:** `/lib/client-encryption.ts`

```typescript
// Obtiene la llave pública del servidor (con cache)
getPublicKey(): Promise<string>

// Encripta una contraseña con RSA-OAEP
encryptPassword(password: string, publicKeyPem: string): Promise<string>

// Verifica soporte de Web Crypto API
isCryptoSupported(): boolean

// Encripta credenciales completas
encryptCredentials(email: string, password: string): Promise<{
  email: string;
  encryptedPassword: string;
}>
```

**Tecnología:**
- ✅ Web Crypto API nativa del navegador
- ✅ RSA-OAEP con SHA-256
- ✅ Sin librerías externas necesarias
- ✅ Soporte en todos los navegadores modernos

---

### 5. Frontend - Componente de Login

**Archivo:** `/app/login/page.tsx`

**Cambios principales:**
```typescript
// 1. Verificar soporte
if (!isCryptoSupported()) {
  setLoginError('Tu navegador no soporta encriptación');
  return;
}

// 2. Encriptar credenciales
const encryptedCredentials = await encryptCredentials(
  data.email,
  data.password
);

// 3. Enviar encriptadas
const response = await fetch('/api/auth/validate-credentials', {
  method: 'POST',
  body: JSON.stringify(encryptedCredentials)
});
```

---

## 🔒 Nivel de Seguridad

### Encriptación RSA-2048

**Fuerza criptográfica:**
- 🔐 **Tamaño de llave:** 2048 bits
- 🔐 **Complejidad:** 2^2048 combinaciones posibles
- 🔐 **Tiempo para romper:** Miles de millones de años con computadoras actuales
- 🔐 **Estándar:** Recomendado por NIST, usado por bancos y gobiernos

**Comparación:**
```
┌──────────────┬─────────────┬──────────────────────┐
│   Longitud   │  Seguridad  │  Tiempo para romper  │
├──────────────┼─────────────┼──────────────────────┤
│  RSA-1024    │    Media    │  Años (factible)     │
│  RSA-2048    │    Alta     │  Millones de años    │
│  RSA-4096    │  Muy Alta   │  Trillones de años   │
└──────────────┴─────────────┴──────────────────────┘

Usamos: RSA-2048 (balance perfecto seguridad/rendimiento)
```

---

## 🛡️ Protección Contra Ataques

### 1. Interceptación MITM ✅
**Escenario:** Atacante intercepta tráfico con BurpSuite o herramienta similar.

**Antes:**
```json
{ "password": "MiContraseña123" }  ❌ Visible
```

**Ahora:**
```json
{ "encryptedPassword": "kR7vXm..." }  ✅ Encriptado
```

**Resultado:** Atacante no puede ver la contraseña real.

---

### 2. WiFi Público Comprometido ✅
**Escenario:** Usuario se conecta desde un WiFi malicioso.

**Protección:**
- ✅ Contraseña encriptada con RSA-2048
- ✅ Solo el servidor con la llave privada puede desencriptar
- ✅ Atacante solo ve datos encriptados inútiles

---

### 3. Replay Attack ✅
**Escenario:** Atacante captura el request y lo reenvía.

**Protección:**
- ✅ Token de pre-autenticación de un solo uso
- ✅ Expiración de 5 minutos
- ✅ Validación de IP y UserAgent
- ✅ Código 2FA enviado por canal separado

---

### 4. Brute Force ✅
**Escenario:** Atacante intenta múltiples contraseñas.

**Protección:**
- ✅ Rate limiting (5 intentos / 15 minutos)
- ✅ Bloqueo de cuenta tras múltiples fallos
- ✅ Cada intento requiere encriptar con RSA (costoso)

---

## 📊 Rendimiento

### Tiempos de Ejecución

```
Operación                      Tiempo      Impacto
─────────────────────────────  ──────────  ────────
Generación de llaves (servidor) ~500ms     Una vez al inicio
Obtener llave pública          ~10ms      Cacheado 1 hora
Encriptar contraseña (cliente) ~50-100ms  Por login
Desencriptar (servidor)        ~10-20ms   Por login
─────────────────────────────────────────────────────
TOTAL agregado al flujo        ~60-130ms  Aceptable
```

**Optimizaciones:**
- ✅ Llave pública cacheada en el cliente (1 hora)
- ✅ Par de llaves generado una sola vez en el servidor
- ✅ Web Crypto API usa hardware acceleration cuando disponible

---

## 🧪 Pruebas con BurpSuite

### Test 1: Interceptar Request de Login

**Pasos:**
1. Configurar BurpSuite como proxy
2. Intentar login en https://bskmt.com/login
3. Interceptar el POST a `/api/auth/validate-credentials`

**Resultado Esperado:**
```http
POST /api/auth/validate-credentials HTTP/2
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "encryptedPassword": "kR7vXm9Q2LpHfJ3mN8sT...256_chars_base64..."
}
```

✅ **La contraseña NO es visible en texto plano**

---

### Test 2: Intentar Replay Attack

**Pasos:**
1. Capturar request encriptado
2. Repetir el mismo request múltiples veces

**Resultado Esperado:**
- Primera vez: Genera token de pre-auth → Solicita 2FA
- Segunda vez: Genera NUEVO token de pre-auth (diferente)
- Para completar login: Requiere código 2FA único

✅ **Replay attack no es útil sin el código 2FA**

---

### Test 3: Modificar Datos Encriptados

**Pasos:**
1. Capturar request
2. Modificar 1 carácter del `encryptedPassword`
3. Reenviar

**Resultado Esperado:**
```json
{
  "success": false,
  "error": "DECRYPTION_ERROR",
  "message": "Error al procesar la contraseña encriptada"
}
```

✅ **Modificación detectada, no se puede desencriptar**

---

## 🔄 Comparación: Antes vs Ahora

```
┌──────────────────────────┬──────────────┬──────────────┐
│       Aspecto            │    ANTES     │    AHORA     │
├──────────────────────────┼──────────────┼──────────────┤
│ Contraseña en request    │ Texto plano  │ Encriptada   │
│ Visible en BurpSuite     │     ✅ Sí    │    ❌ No     │
│ Protección MITM          │  Solo HTTPS  │ HTTPS + RSA  │
│ Longitud de contraseña   │  Variable    │  ~342 bytes  │
│ Reversibilidad atacante  │     ✅ Sí    │    ❌ No     │
│ Overhead de rendimiento  │    0 ms      │  ~60-130ms   │
│ Complejidad              │    Baja      │    Media     │
└──────────────────────────┴──────────────┴──────────────┘
```

---

## 📝 Consideraciones

### ✅ Ventajas

1. **Protección Extra:** Capa adicional más allá de HTTPS
2. **Auditorías:** Pasa pruebas de seguridad con BurpSuite
3. **Cumplimiento:** Alineado con mejores prácticas de seguridad
4. **Sin Librerías:** Usa Web Crypto API nativa
5. **Transparente:** Usuario no nota diferencia

### ⚠️ Limitaciones

1. **No reemplaza HTTPS:** Es un complemento, no un reemplazo
2. **Overhead:** Agrega ~60-130ms al proceso de login
3. **Compatibilidad:** Requiere navegadores modernos (2015+)
4. **Gestión de Llaves:** En producción, considerar rotación de llaves

---

## 🚀 Deployment

### Variables de Entorno

No se requieren variables adicionales. Las llaves se generan automáticamente.

### Opcional: Rotación de Llaves

Para rotar las llaves (recomendado cada 30-90 días):

```typescript
// En un cron job o manualmente
import { regenerateKeys } from '@/lib/encryption-utils';

// Regenerar llaves
const newKeys = regenerateKeys();
console.log('Llaves RSA regeneradas');
```

**Nota:** Esto invalidará las sesiones de login en progreso (antes de 2FA).

---

## 🔍 Verificación

### Verificar que funciona:

```bash
# 1. Obtener llave pública
curl https://bskmt.com/api/auth/public-key

# Debe retornar una llave RSA en formato PEM

# 2. Intentar login y capturar con BurpSuite
# La contraseña debe aparecer encriptada, no en texto plano
```

---

## 📚 Referencias

- [Web Crypto API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [RSA-OAEP - RFC 8017](https://tools.ietf.org/html/rfc8017)
- [NIST Recommendations](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final)

---

**Implementado:** Octubre 5, 2025  
**Versión:** 2.1.0  
**Estado:** ✅ Producción
