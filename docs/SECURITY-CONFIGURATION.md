# Configuración de Seguridad Avanzada

## Variables de Entorno Recomendadas

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secure-random-string-min-256-bits
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Pre-Auth Tokens
PRE_AUTH_TOKEN_EXPIRATION=300000  # 5 minutos en ms
PRE_AUTH_TOKEN_BYTES=32           # 256 bits de entropía

# Rate Limiting
RATE_LIMIT_VALIDATE_CREDENTIALS=5  # Intentos
RATE_LIMIT_VALIDATE_WINDOW=900000  # 15 minutos en ms
RATE_LIMIT_2FA_GENERATE=5          # Intentos
RATE_LIMIT_2FA_WINDOW=300000       # 5 minutos en ms
RATE_LIMIT_2FA_VERIFY=10           # Intentos
RATE_LIMIT_2FA_VERIFY_WINDOW=300000 # 5 minutos en ms

# MessageBird (2FA)
MESSAGEBIRD_API_KEY=your_messagebird_api_key
MESSAGEBIRD_ORIGINATOR=BSK MT

# Seguridad
NODE_ENV=production
ENABLE_SECURITY_LOGS=true
ENABLE_IP_VALIDATION=true
ENABLE_DEVICE_FINGERPRINT=true

# Monitoreo
SENTRY_DSN=your_sentry_dsn  # Opcional
LOG_LEVEL=info
```

## Headers de Seguridad HTTP

Agregar en `next.config.mjs`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://api.bskmt.com;
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim()
  }
];

export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

## Configuración de MongoDB para Seguridad

### 1. Índices de Rendimiento
```javascript
// PreAuthTokens
db.preauthtokens.createIndex({ "token": 1 }, { unique: true });
db.preauthtokens.createIndex({ "userId": 1 });
db.preauthtokens.createIndex({ "used": 1 });
db.preauthtokens.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
db.preauthtokens.createIndex({ "sessionInfo.ip": 1 });

// TwoFactorCodes
db.twofactorcodes.createIndex({ "userId": 1 });
db.twofactorcodes.createIndex({ "verified": 1 });
db.twofactorcodes.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

// Sessions
db.sessions.createIndex({ "userId": 1 });
db.sessions.createIndex({ "sessionToken": 1 }, { unique: true });
db.sessions.createIndex({ "refreshToken": 1 }, { unique: true });
db.sessions.createIndex({ "isActive": 1 });
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
```

### 2. Roles y Permisos
```javascript
// Crear usuario de solo lectura para monitoreo
db.createUser({
  user: "monitor",
  pwd: "secure_password",
  roles: [
    { role: "read", db: "your_database" }
  ]
});

// Crear usuario de aplicación con permisos limitados
db.createUser({
  user: "app_user",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "your_database" }
  ]
});
```

## Configuración de Firewall (iptables)

```bash
# Permitir solo conexiones HTTPS
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Bloquear IPs sospechosas (ejemplo)
sudo iptables -A INPUT -s 192.168.1.100 -j DROP

# Limitar conexiones por IP
sudo iptables -A INPUT -p tcp --dport 443 -m connlimit --connlimit-above 20 -j DROP

# Guardar reglas
sudo iptables-save > /etc/iptables/rules.v4
```

## Configuración de Nginx (si aplica)

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;

server {
    listen 443 ssl http2;
    server_name bskmt.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/bskmt.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bskmt.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting for auth endpoints
    location ~ ^/api/auth/(validate-credentials|login|2fa) {
        limit_req zone=auth burst=3 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Rate limiting for general API
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name bskmt.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoreo y Alertas

### CloudWatch / DataDog / New Relic

```javascript
// lib/monitoring.ts
import { PreAuthToken } from './models/PreAuthToken';

export async function monitorSecurityMetrics() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Tokens creados en la última hora
  const tokensCreated = await PreAuthToken.countDocuments({
    createdAt: { $gte: oneHourAgo }
  });

  // Tokens expirados sin usar (sesiones abandonadas)
  const tokensExpiredUnused = await PreAuthToken.countDocuments({
    used: false,
    expiresAt: { $lt: now }
  });

  // Tokens usados (autenticaciones exitosas)
  const tokensUsed = await PreAuthToken.countDocuments({
    used: true,
    updatedAt: { $gte: oneHourAgo }
  });

  // IPs con múltiples intentos
  const suspiciousIPs = await PreAuthToken.aggregate([
    { $match: { createdAt: { $gte: oneHourAgo } } },
    { $group: { _id: "$sessionInfo.ip", count: { $sum: 1 } } },
    { $match: { count: { $gt: 10 } } },
    { $sort: { count: -1 } }
  ]);

  return {
    tokensCreated,
    tokensExpiredUnused,
    tokensUsed,
    successRate: tokensCreated > 0 ? (tokensUsed / tokensCreated * 100).toFixed(2) : 0,
    suspiciousIPs
  };
}
```

### Cron Job para Limpieza
```javascript
// lib/cron-cleanup.ts
import cron from 'node-cron';
import { PreAuthToken } from './models/PreAuthToken';
import { TwoFactorCode } from './models/TwoFactorCode';

// Ejecutar cada hora
cron.schedule('0 * * * *', async () => {
  console.log('🧹 Iniciando limpieza de tokens expirados...');
  
  try {
    const preAuthResult = await PreAuthToken.cleanupExpiredTokens();
    console.log(`✅ Eliminados ${preAuthResult.deletedCount} pre-auth tokens`);
    
    const twoFactorResult = await TwoFactorCode.cleanupExpiredCodes();
    console.log(`✅ Eliminados ${twoFactorResult.deletedCount} códigos 2FA`);
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
  }
});
```

## Pruebas de Penetración

### Checklist
- [ ] Intentar reutilizar tokens usados
- [ ] Intentar usar tokens expirados
- [ ] SQL/NoSQL injection en campos de token
- [ ] XSS en campos de token
- [ ] CSRF en endpoints de autenticación
- [ ] Brute force de tokens (verificar longitud y aleatoriedad)
- [ ] Session fixation
- [ ] Man-in-the-middle (verificar HTTPS estricto)
- [ ] Rate limiting bypass
- [ ] IP spoofing

### Herramientas Recomendadas
- BurpSuite Pro
- OWASP ZAP
- Postman/Insomnia (pruebas de API)
- SQLMap (inyección)
- Nmap (escaneo de puertos)

## Cumplimiento y Auditoría

### GDPR
- ✅ Los tokens no contienen información personal identificable
- ✅ Los datos de sesión se eliminan automáticamente
- ✅ Los usuarios pueden ver sus sesiones activas

### PCI DSS (si aplica)
- ✅ Las credenciales no se almacenan en logs
- ✅ Encriptación en tránsito (HTTPS)
- ✅ Tokens de un solo uso
- ✅ Auditoría de accesos

### SOC 2
- ✅ Monitoreo de eventos de seguridad
- ✅ Logs de auditoría
- ✅ Control de acceso basado en roles
- ✅ Cifrado de datos sensibles

---

**Actualizado:** Octubre 5, 2025  
**Responsable:** Equipo de Seguridad
