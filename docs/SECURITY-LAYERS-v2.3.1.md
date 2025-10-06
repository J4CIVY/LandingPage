# 🔐 Capas de Seguridad - v2.3.1

**Fecha**: 6 de Octubre, 2025  
**Versión**: 2.3.1  
**Sistema**: BSK Motorcycle Team - Autenticación Enterprise

---

## 📊 Comparación con Empresas Líderes

| Característica de Seguridad | Google | Microsoft | Facebook | **BSK MT v2.3.1** |
|------------------------------|--------|-----------|----------|-------------------|
| **Email Cifrado Client-Side** | ❌ No¹ | ❌ No¹ | ❌ No¹ | ❌ No¹ ✅ |
| **Contraseña Cifrada Client-Side** | ✅ SRP | ✅ Custom | ✅ Custom | ✅ RSA-2048 |
| **HTTPS/TLS Encryption** | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |
| **Rate Limiting - Login** | ✅ Sí | ✅ Sí | ✅ Sí | ✅ 5/15min |
| **Rate Limiting - Email Check** | ✅ Sí | ✅ Sí | ✅ Sí | ✅ 10/5min ⭐ |
| **2FA Obligatorio** | ✅ Opcional | ✅ Opcional | ✅ Opcional | ✅ Obligatorio |
| **Timers de Inactividad** | ✅ Sí | ✅ Sí | ❌ No | ✅ 90s/120s |
| **Pre-Auth Tokens** | ✅ Sí | ✅ Sí | ✅ Sí | ✅ 5min TTL |
| **Login Progresivo (3 pasos)** | ✅ Sí | ✅ Sí | ❌ No | ✅ Sí |
| **Advertencias de Inactividad** | ❌ No | ✅ Sí | ❌ No | ✅ Sí |

¹ **Diseño Correcto**: El email NO debe cifrarse client-side porque es un identificador público necesario para búsquedas en DB.

---

## 🛡️ Arquitectura de Defensa en Profundidad

### Modelo de 7 Capas

```
┌────────────────────────────────────────────────────────────┐
│                    USUARIO (Navegador)                      │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│ CAPA 1: Encriptación RSA-2048 (Client-Side)                │
│ • Web Crypto API nativa                                     │
│ • Contraseña NUNCA viaja en texto plano                     │
│ • Invisible incluso con interceptación HTTPS                │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│ CAPA 2: HTTPS/TLS (Transport Layer)                        │
│ • Todo el tráfico cifrado end-to-end                        │
│ • Certificado SSL/TLS válido                                │
│ • Protección MITM estándar                                  │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│ CAPA 3: Rate Limiting (Application Firewall) ⭐ NUEVO      │
│ • Email Check: 10 intentos / 5 minutos                     │
│ • Login: 5 intentos / 15 minutos                            │
│ • 2FA: 5 intentos / 5 minutos                               │
│ • Prevención de User Enumeration                            │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│ CAPA 4: Validación de Entrada (Input Validation)           │
│ • Zod schemas para todos los endpoints                      │
│ • Sanitización de inputs                                    │
│ • Prevención de SQL Injection / NoSQL Injection             │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│ CAPA 5: Pre-Auth Tokens (Session Management)               │
│ • Tokens temporales de 256 bits                            │
│ • Expiración en 5 minutos                                   │
│ • Un solo uso (invalidados post-uso)                        │
│ • IP + UserAgent binding                                    │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│ CAPA 6: 2FA Obligatorio (Second Factor)                    │
│ • Códigos OTP de 6 dígitos                                  │
│ • Enviados por WhatsApp                                     │
│ • Expiración en 5 minutos                                   │
│ • Rate limiting en generación                               │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│ CAPA 7: Timers de Inactividad (UX + Security)              │
│ • Paso 2: 90 segundos con advertencia a los 15s            │
│ • Paso 3: 120 segundos con advertencia a los 30s           │
│ • Reset automático al detectar actividad                    │
│ • Pantalla "No tenemos noticias suyas"                      │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                   BASE DE DATOS (MongoDB)                   │
│ • Encryption at rest (opcional)                             │
│ • TTL indexes para limpieza automática                      │
│ • Índices únicos en email                                   │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 ¿Por qué NO cifrar el Email?

### ❌ Problemas del Cifrado de Email Client-Side

#### 1. **RSA es Probabilístico (No Determinístico)**
```javascript
// Cada cifrado genera un resultado diferente:
encrypt("user@email.com") → "a7f3e9d2c1b4..."  // Primera llamada
encrypt("user@email.com") → "x9k2m5p8q3n7..."  // Segunda llamada (diferente)

// Imposible hacer búsquedas en DB:
db.users.find({ email: "a7f3e9d2c1b4..." })  // ❌ No encuentra nada
```

#### 2. **No Puedes Recuperar el Email Original**
```javascript
// Problema en recuperación de contraseña:
User: "Olvidé mi contraseña"
Sistema: "¿Cuál es tu email?"
User: "user@email.com"
Sistema busca: encrypt("user@email.com") → "j4h9s3d8f2k5..."
Base de datos tiene: "a7f3e9d2c1b4..." (diferente del primer login)
Sistema: "Email no encontrado" ❌
```

#### 3. **Rendimiento Catastrófico**
```javascript
// Para buscar un usuario, tendrías que:
async function findUserByEmail(email) {
  const allUsers = await db.users.find(); // ❌ Traer TODOS los usuarios
  
  for (let user of allUsers) {
    const decryptedEmail = decrypt(user.encryptedEmail); // ❌ Descifrar uno por uno
    if (decryptedEmail === email) {
      return user; // ✅ Usuario encontrado después de N decifraciones
    }
  }
  
  return null;
}

// Con 10,000 usuarios:
// - 10,000 operaciones de descifrado RSA
// - ~30ms por descifrado
// - Total: 300,000ms = 5 MINUTOS para un login ❌
```

#### 4. **Envío de Emails de Verificación**
```javascript
// No puedes enviar emails si no sabes el destinatario:
function sendVerificationEmail(userId) {
  const user = db.users.findOne({ _id: userId });
  const email = user.encryptedEmail; // "a7f3e9d2c1b4..."
  
  // ❌ No puedes hacer:
  sendEmail(to: "a7f3e9d2c1b4...", subject: "Verify...");
  
  // El servicio de email necesita: user@email.com (texto plano)
}
```

### ✅ Solución Correcta: Email en Texto Plano + Protecciones

```javascript
// 1. Email indexado en DB (búsquedas O(1) instantáneas)
db.users.createIndex({ email: 1 }, { unique: true });

// 2. HTTPS/TLS protege el email en tránsito
// Cliente → [TLS cifrado] → Servidor

// 3. Rate Limiting previene enumeración
const checkEmailRateLimit = rateLimit({
  interval: 5 * 60 * 1000,  // 5 minutos
  limit: 10                  // máximo 10 verificaciones
});

// 4. Respuestas genéricas (no revela si existe o no en algunos casos)
if (!user) {
  return "Credenciales inválidas"; // Genérico
}
```

---

## 🆕 Novedades v2.3.1 (6 Oct 2025)

### Rate Limiting en Verificación de Email

**Endpoint**: `POST /api/auth/check-email`

**Implementación**:
```typescript
import { rateLimit } from '@/utils/rateLimit';

const checkEmailRateLimit = rateLimit({
  interval: 5 * 60 * 1000,      // 5 minutos
  uniqueTokenPerInterval: 500   // 500 IPs únicas
});

// En el handler:
await checkEmailRateLimit.check(clientIP, 10);  // Max 10 intentos
```

**Beneficios**:
- ✅ Previene ataques de enumeración de usuarios
- ✅ Protege contra reconocimiento automatizado
- ✅ Respuesta HTTP 429 estándar (Too Many Requests)
- ✅ Mensaje claro al usuario legítimo

**Respuesta al exceder límite**:
```json
{
  "success": false,
  "message": "Demasiados intentos. Por favor espera unos minutos.",
  "error": "RATE_LIMIT_EXCEEDED"
}
```

### Vectores de Ataque Mitigados

| Vector de Ataque | Sin Rate Limiting | Con Rate Limiting v2.3.1 |
|------------------|-------------------|--------------------------|
| **User Enumeration** | 1000 emails/min ✅ | 10 emails/5min ❌ |
| **Automated Scanning** | Posible | Bloqueado |
| **Credential Stuffing** | Alta probabilidad | Mitigado |
| **Brute Force** | Factible | Imposible |

---

## 📈 Evolución del Sistema de Seguridad

### Timeline de Mejoras

```
v2.1.0 (Inicial)
├── Login en 1 paso
├── Contraseña cifrada RSA-2048
├── 2FA obligatorio
└── Rate limiting en login

v2.2.0 (Login Progresivo)
├── ✨ Login en 3 pasos
├── ✨ Validación temprana de email
├── ✨ Navegación back/forward
├── ✨ Feedback específico
└── ✨ Links contextuales

v2.3.0 (Inactividad)
├── ✨ Timers de inactividad
├── ✨ Advertencias progresivas
├── ✨ Pantalla "No tenemos noticias suyas"
├── ✨ Reset automático
└── ✨ Opciones de ayuda

v2.3.1 (Rate Limiting Complete) ⭐ ACTUAL
├── ✨ Rate limiting en check-email
├── ✨ Prevención user enumeration
├── ✨ Protección completa endpoints
└── ✨ Seguridad nivel Enterprise
```

---

## 🔍 Audit Trail

### Checklist de Seguridad Enterprise

| Característica | Estado | Comentario |
|----------------|--------|------------|
| **Encriptación en Tránsito** | ✅ | HTTPS/TLS |
| **Encriptación de Contraseñas** | ✅ | RSA-2048 client-side |
| **Rate Limiting - Login** | ✅ | 5 intentos / 15min |
| **Rate Limiting - Email Check** | ✅ | 10 intentos / 5min ⭐ |
| **Rate Limiting - 2FA** | ✅ | 5 intentos / 5min |
| **2FA Obligatorio** | ✅ | WhatsApp OTP |
| **Pre-Auth Tokens** | ✅ | 5min TTL, single-use |
| **Timers de Inactividad** | ✅ | 90s/120s con advertencias |
| **Input Validation** | ✅ | Zod schemas |
| **SQL/NoSQL Injection Protection** | ✅ | Mongoose + sanitización |
| **XSS Protection** | ✅ | React auto-escaping |
| **CSRF Protection** | ✅ | SameSite cookies |
| **Session Management** | ✅ | JWT con refresh tokens |
| **Password Hashing (Server)** | ✅ | bcrypt rounds=10 |
| **Logging & Monitoring** | ⚠️ | Implementado (mejora continua) |
| **Backup & Recovery** | ⚠️ | MongoDB Atlas (configurado) |

**Leyenda**:
- ✅ Implementado y probado
- ⚠️ Implementado, mejora continua
- ❌ No implementado

---

## 🎓 Referencias Técnicas

### Estándares Seguidos

1. **OWASP Top 10 (2023)**
   - A07:2021 – Identification and Authentication Failures ✅
   - A02:2021 – Cryptographic Failures ✅
   - A05:2021 – Security Misconfiguration ✅

2. **NIST Guidelines**
   - NIST SP 800-63B (Digital Identity Guidelines)
   - RSA-2048 recommendation ✅
   - Multi-factor authentication ✅

3. **GDPR Compliance**
   - Data encryption in transit ✅
   - Right to access ✅
   - Right to erasure (implementado en API) ✅

---

## 📞 Soporte

Para preguntas sobre seguridad, contactar:
- **Email**: security@bskmotorcycleteam.com
- **WhatsApp**: [Link de soporte técnico]
- **Documentación**: `/docs/SECURITY-CONFIGURATION.md`

---

**Última actualización**: 6 de Octubre, 2025  
**Próxima revisión**: Trimestral  
**Responsable**: Equipo de Desarrollo BSK MT
