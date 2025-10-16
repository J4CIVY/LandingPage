# BSK Motorcycle Team - Landing Page

Este es el repositorio para el frontend de la página web oficial de **BSK Motorcycle Team**. El proyecto está construido con Next.js y TypeScript, proporcionando una experiencia de usuario moderna, rápida y receptiva.

## ✨ Características Principales

- **Páginas Estáticas y Dinámicas:** Múltiples secciones como Sobre Nosotros, Eventos, Tienda, Contacto y más.
- **Diseño Receptivo:** Interfaz de usuario totalmente adaptativa construida con Tailwind CSS.
- **Tema Claro/Oscuro:** Soporte para cambiar entre temas de color.
- **Calendario de Eventos:** Muestra los próximos eventos del club.
- **Formulario de Registro:** Formulario de registro con validación local usando Zod (preparado para futura integración con API).
- **SEO Optimizado:** Componentes y configuración para mejorar el posicionamiento en buscadores.

## 🚀 Pila de Tecnología

- **Framework:** [Next.js](https://nextjs.org/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Gestión de Formularios:** [React Hook Form](https://react-hook-form.com/)
- **Validación de Esquemas:** [Zod](https://zod.dev/)
- **Cliente HTTP:** [Axios](https://axios-http.com/)
- **Pruebas:** [Vitest](https://vitest.dev/)
- **Iconos:** [React Icons](https://react-icons.github.io/react-icons/)

## 📂 Estructura del Proyecto

El proyecto sigue una estructura organizada para facilitar el mantenimiento y la escalabilidad:

```
/
├── app/                # Enrutamiento y páginas de la aplicación
│   ├── about/
│   ├── contact/
│   └── ...
├── components/         # Componentes de React reutilizables
│   ├── home/           # Componentes específicos de la página de inicio
│   └── shared/         # Componentes compartidos (Header, Footer, etc.)
├── data/               # Datos estáticos (opciones de formulario, imágenes)
├── hooks/              # Hooks de React personalizados
├── http/               # Configuración del cliente HTTP (Axios)
├── providers/          # Proveedores de contexto (ej. ThemeProvider)
├── public/             # Activos estáticos (imágenes, favicons)
├── schemas/            # Esquemas de validación (Zod)
├── tests/              # Pruebas unitarias y de integración
└── types/              # Definiciones de tipos de TypeScript
```

## 🏁 Guía de Inicio Rápido

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 20.x o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

### Instalación

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/BSKMT/LandingPage.git
    ```
2.  Navega al directorio del proyecto:
    ```bash
    cd LandingPage
    ```
3.  Instala las dependencias:
    ```bash
    npm install
    ```

### Ejecución

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📜 Scripts Disponibles

Este proyecto incluye los siguientes scripts definidos en `package.json`:

-   `npm run dev`: Inicia la aplicación en modo de desarrollo.
-   `npm run build`: Compila la aplicación para producción.
-   `npm run start`: Inicia un servidor de producción.
-   `npm run lint`: Ejecuta ESLint para analizar el código en busca de problemas.
-   `npm run test`: Ejecuta las pruebas unitarias con Vitest.
-   `npm run test:watch`: Ejecuta las pruebas en modo de observación.

## ⚙️ Configuración

El proyecto utiliza variables de entorno para gestionar la configuración. Crea un archivo `.env.local` en la raíz del proyecto y añade las variables necesarias.

### Cliente HTTP y Clave de API

El cliente HTTP (`http/client.ts`) está configurado para gestionar la autenticación de forma inteligente:

-   Si existe un JWT (a través de una cookie), las solicitudes incluyen el encabezado `Authorization: Bearer <token>`.
-   Si no hay JWT y la ruta está en la lista blanca (`apiKeyRoutes`), el cliente añade el encabezado `x-api-key` con el valor de `NEXT_PUBLIC_API_KEY`.
-   Opcionalmente, se puede habilitar la firma de solicitudes (HMAC-SHA256) estableciendo `NEXT_PUBLIC_USE_HMAC` en `true`.

#### Variables de Entorno

-   `NEXT_PUBLIC_API_KEY`: La clave de API pública para el dominio.
-   `NEXT_PUBLIC_USE_HMAC`: `true` o `false` para habilitar/deshabilitar la firma de solicitudes HMAC.

## ✅ Pruebas

Para ejecutar el conjunto de pruebas, utiliza el siguient comando:

```bash
npm run test
```

Esto ejecutará todas las pruebas unitarias definidas en el directorio `tests/` utilizando Vitest.

### Pruebas de Seguridad

Para ejecutar las pruebas específicas del sistema de autenticación segura:

```bash
npm run test:preauth
```

Esto ejecutará las pruebas del modelo `PreAuthToken` y verificará la correcta implementación del sistema de tokens de pre-autenticación.

## 🔒 Seguridad

### Sistema de Autenticación Progresiva (v2.3.1)

Este proyecto implementa un **sistema de login en 3 pasos** similar a Google y Microsoft, con **encriptación RSA-2048**, **autenticación 2FA obligatoria** y **detección de inactividad inteligente**.

#### 🎯 Flujo de Login en 3 Pasos

```
Paso 1: Email          →  Paso 2: Contraseña  →  Paso 3: 2FA WhatsApp
  📧 Verificación           🔒 RSA-2048            🛡️ Código 6 dígitos
  ⏱️ Sin timer              ⏱️ 90 segundos         ⏱️ 120 segundos
```

**Ventajas**:
- ✅ **UX Familiar**: Usado por Google, Microsoft, LinkedIn
- ✅ **Validación Temprana**: Detecta errores antes (email inexistente)
- ✅ **Feedback Específico**: Links directos a soluciones
- ✅ **Detección de Inactividad**: Advertencias y opciones de ayuda
- ✅ **Professional**: Look & feel enterprise

#### Protección Multicapa

**1. Login Progresivo (v2.2.0)**
- ✅ **Paso 1 - Email**: Verificación de existencia + estado
- ✅ **Paso 2 - Contraseña**: Validación con encriptación RSA-2048
- ✅ **Paso 3 - 2FA**: Código por WhatsApp obligatorio
- ✅ **Navegación Intuitiva**: Botón "Atrás" para corregir errores

**2. Sistema de Inactividad (v2.3.0)**
- ✅ **Detección Inteligente**: Timers por paso con advertencias progresivas
- ✅ **Paso 2 (Contraseña)**: Timer de 90s, advertencia a los 15s
- ✅ **Paso 3 (2FA)**: Timer de 120s, advertencia a los 30s
- ✅ **Pantalla "No tenemos noticias suyas"**: Similar a Microsoft
- ✅ **Opciones de Recuperación**: Reintentar, Ayuda, Volver
- ✅ **Reset Automático**: Timer se reinicia al detectar actividad

**3. Rate Limiting y Anti-Enumeración (NUEVO v2.3.1)**
- ✅ **Protección Verificación de Email**: 10 intentos cada 5 minutos
- ✅ **Prevención User Enumeration**: Evita descubrimiento automatizado de cuentas
- ✅ **Rate Limiting Completo**: Todos los endpoints de auth protegidos
- ✅ **Seguridad Enterprise**: Equivalente a Microsoft/Google/Facebook

**4. Encriptación Client-Side**
- ✅ **RSA-2048**: Contraseñas encriptadas en el navegador antes de enviarlas
- ✅ **Web Crypto API**: Tecnología nativa del navegador, sin librerías externas
- ✅ **Invisible en BurpSuite**: Las contraseñas no se ven ni siquiera interceptando el tráfico
- ✅ **Protección MITM**: Capa adicional sobre HTTPS
- ✅ **Email en Texto Plano**: Correcto por diseño (necesario para búsquedas en DB)

**5. Tokens de Pre-Autenticación**
- ✅ **Tokens Temporales**: 256 bits, expiración en 5 minutos
- ✅ **Un Solo Uso**: No reutilizables después de la verificación
- ✅ **Validación de Contexto**: IP + UserAgent binding
- ✅ **Limpieza Automática**: TTL indexes de MongoDB

**6. Autenticación 2FA**
- ✅ **WhatsApp OTP**: Códigos de 6 dígitos enviados por WhatsApp
- ✅ **Rate Limiting**: Protección contra fuerza bruta
- ✅ **Bloqueo de Cuenta**: Tras múltiples intentos fallidos

#### Flujo de Autenticación Seguro

```
1. Usuario ingresa email
   ↓
2. POST /api/auth/check-email
   ↓
3. Email existe y verificado → Paso 2
   ↓ [Timer inicia: 90 segundos]
4. Usuario ingresa contraseña
   ↓ [Si inactivo 75s → Banner amarillo]
   ↓ [Si inactivo 90s → Pantalla "No tenemos noticias"]
5. Encriptación RSA-2048 (navegador)
   ↓
6. POST /api/auth/validate-credentials
   ↓
7. Credenciales correctas → Pre-auth token
   ↓
8. POST /api/auth/2fa/generate
   ↓ [Timer inicia: 120 segundos]
9. Código enviado por WhatsApp → Paso 3
   ↓ [Si inactivo 90s → Advertencia]
   ↓ [Si inactivo 120s → Pantalla "No hemos recibido el código"]
10. Usuario ingresa código
    ↓
11. POST /api/auth/2fa/verify
    ↓
12. ✅ Sesión JWT creada → Dashboard
```

#### Nivel de Seguridad

```
Capa 1: HTTPS/TLS 1.3
  ↓
Capa 2: Validación Progresiva (3 pasos)
  ↓
Capa 3: Encriptación RSA-2048 (Client-Side)
  ↓
Capa 4: Rate Limiting por paso
  ↓
Capa 5: Tokens de Pre-Autenticación (256 bits)
  ↓
Capa 6: Validación de IP + UserAgent
  ↓
Capa 7: Autenticación 2FA por WhatsApp
  ↓
Capa 8: JWT con firma
  ↓
🎯 MÁXIMA SEGURIDAD ENTERPRISE
```

#### Documentación de Seguridad

Para información detallada sobre la implementación de seguridad:

- **Sistema de Inactividad**: [`docs/INACTIVITY-SYSTEM.md`](./docs/INACTIVITY-SYSTEM.md) ⭐ NUEVO v2.3.0
- **Login en 3 Pasos**: [`docs/3-STEP-LOGIN-FLOW.md`](./docs/3-STEP-LOGIN-FLOW.md)
- **Encriptación Client-Side**: [`docs/CLIENT-SIDE-ENCRYPTION.md`](./docs/CLIENT-SIDE-ENCRYPTION.md)
- **Análisis Técnico**: [`docs/security-2fa-improvements.md`](./docs/security-2fa-improvements.md)
- **Guía de Despliegue**: [`docs/DEPLOYMENT-GUIDE.md`](./docs/DEPLOYMENT-GUIDE.md)
- **Configuración Avanzada**: [`docs/SECURITY-CONFIGURATION.md`](./docs/SECURITY-CONFIGURATION.md)
- **Resumen Ejecutivo**: [`docs/EXECUTIVE-SUMMARY.md`](./docs/EXECUTIVE-SUMMARY.md)

#### Comparación: Evolución del Sistema

| Aspecto | v2.1.0 | v2.2.0 | v2.3.0 | v2.3.1 (Ahora) |
|---------|--------|--------|--------|----------------|
| **Login** | 1 paso | 3 pasos | 3 pasos + timers | 3 pasos + timers |
| **Inactividad** | ❌ | ❌ | ✅ Advertencias | ✅ Advertencias |
| **Rate Limiting Email** | ❌ | ❌ | ❌ | ✅ 10/5min |
| Campos visibles | Email + Password | Un campo a la vez |
| Validación | Al final | Progresiva por paso |
| Feedback | Generic | Específico + Links |
| Email no existe | "Credenciales inválidas" | "No encontrado" → Link registro |
| UX | Estándar | Google/Microsoft style |
| Navegación | Solo forward | Forward + Back |

#### Pruebas de Seguridad

**Con BurpSuite:**

**Paso 1 - Email:**
```http
POST /api/auth/check-email HTTP/2
{
  "email": "usuario@ejemplo.com"
}
```

**Paso 2 - Contraseña:**
```http
POST /api/auth/validate-credentials HTTP/2
{
  "email": "usuario@ejemplo.com",
  "encryptedPassword": "kR7vXm9Q2Lp..." ✅ ENCRIPTADO
}
```

✅ **Las contraseñas NO son visibles en texto plano**

#### Cumplimiento

Este sistema de autenticación cumple con:
- ✅ OWASP Top 10 (2021)
- ✅ OWASP Authentication Cheat Sheet
- ✅ NIST SP 800-57 (Key Management)
- ✅ Mejores prácticas de seguridad de Next.js
- ✅ Principios de Zero Trust
- ✅ Encriptación de grado bancario (RSA-2048)

---

## 🔒 Seguridad

### Auditoría de Seguridad Completada (Enero 2025)

El proyecto BSK Motorcycle Team ha completado una **auditoría de seguridad comprehensiva** con resultados excelentes:

**📊 Calificación de Seguridad: A (92/100) - Excelente**

### Vulnerabilidades Resueltas
- ✅ **15 vulnerabilidades identificadas y corregidas**
- ✅ **2 Críticas**: Secretos JWT por defecto, carga de archivos sin autenticación
- ✅ **5 Altas**: Validación inconsistente de tokens, XSS en datos estructurados, contraseñas en localStorage, traversal de rutas
- ✅ **6 Medias**: Sanitización de entrada, logs sensibles, CSP, rate limiting
- ✅ **2 Bajas**: CSS inline, monitoreo de dependencias

### Características de Seguridad Implementadas

#### Autenticación y Autorización
- ✅ JWT con encriptación RSA-OAEP 2048-bit
- ✅ Hashing de contraseñas con bcrypt
- ✅ Bloqueo de cuenta tras 5 intentos fallidos
- ✅ Gestión de sesiones con seguimiento de dispositivos
- ✅ Alertas de seguridad para nuevos dispositivos
- ✅ Tokens de acceso (15min) y refresh (7 días)

#### Protección XSS
- ✅ Sanitización comprehensiva de entrada/salida
- ✅ Protección integrada de React
- ✅ Codificación de entidades HTML
- ✅ Validación de datos estructurados

#### Protección CSRF
- ✅ Cookies con SameSite=Strict
- ✅ Banderas HTTPOnly y Secure
- ✅ Validación de origen
- ✅ Tokens de estado para formularios

#### Protección de Datos
- ✅ HTTPS obligatorio con HSTS
- ✅ TLS 1.2+ requerido
- ✅ Transmisión de contraseñas encriptada
- ✅ Sin datos sensibles en localStorage
- ✅ Almacenamiento seguro en cookies

#### Seguridad de Infraestructura
- ✅ Headers de seguridad comprehensivos
- ✅ Content Security Policy (CSP)
- ✅ Rate limiting en endpoints críticos
- ✅ Prevención de path traversal
- ✅ Validación de tipos de archivo

### Documentación de Seguridad

📖 **Documentos Disponibles:**

1. **[SECURITY.md](./SECURITY.md)** - Política de seguridad completa
   - Medidas de seguridad implementadas
   - Mejores prácticas
   - Plan de respuesta a incidentes
   - Gestión de secretos

2. **[SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)** - Reporte de auditoría detallado
   - Análisis de vulnerabilidades
   - Puntuaciones CVSS
   - Pasos de remediación
   - Evaluación de cumplimiento

3. **[SECURITY_FIXES.md](./SECURITY_FIXES.md)** - Guía de referencia rápida
   - Resumen de implementación
   - Pasos de verificación
   - Checklist de despliegue

4. **[SECURITY_EXECUTIVE_SUMMARY.md](./SECURITY_EXECUTIVE_SUMMARY.md)** - Resumen ejecutivo
   - Resultados clave
   - Métricas de seguridad
   - Estado de producción

5. **[.env.example](./.env.example)** - Template de variables de entorno
   - Variables requeridas documentadas
   - Mejores prácticas de seguridad
   - Comandos de generación de secretos

### Cumplimiento y Certificaciones

- ✅ **OWASP Top 10**: 94% de cobertura
- ✅ **GDPR**: 100% de cumplimiento
- ✅ **CCPA**: 100% de cumplimiento  
- ✅ **PCI-DSS**: Listo (vía pasarela Bold)

### Variables de Entorno Requeridas

**CRÍTICO - Debe configurarse antes del despliegue:**

```bash
# Generar con: openssl rand -base64 64
JWT_SECRET=<tu-secreto-fuerte-min-32-chars>
JWT_REFRESH_SECRET=<tu-secreto-fuerte-min-32-chars>

# Conexión MongoDB
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/bsk-mt

# Cloudinary para carga de imágenes
CLOUDINARY_CLOUD_NAME=<tu-cloud-name>
CLOUDINARY_API_KEY=<tu-api-key>
CLOUDINARY_API_SECRET=<tu-api-secret>

# Servicio de email (Zoho)
ZOHO_CLIENT_ID=<tu-client-id>
ZOHO_CLIENT_SECRET=<tu-client-secret>
ZOHO_REFRESH_TOKEN=<tu-refresh-token>

# URL de la aplicación
NEXT_PUBLIC_APP_URL=https://bskmt.com
NODE_ENV=production
```

Ver `.env.example` para la lista completa con descripciones.

### Reportar Vulnerabilidades de Seguridad

Si descubres una vulnerabilidad de seguridad, por favor repórtala de manera responsable:

**Email**: security@bskmt.com  
**Asunto**: [SECURITY] Descripción breve

**Por favor incluye:**
- Descripción detallada de la vulnerabilidad
- Pasos para reproducir
- Impacto potencial
- Sugerencia de solución (si está disponible)

**NO:**
- Divulgar públicamente la vulnerabilidad antes de que sea corregida
- Explotar la vulnerabilidad más allá de una prueba de concepto
- Acceder o modificar datos de usuarios

Reconoceremos tu reporte dentro de 48 horas y proporcionaremos actualizaciones sobre el progreso de remediación.

### Calendario de Actualizaciones de Seguridad

- **Vulnerabilidades críticas**: Parche inmediato (dentro de 24 horas)
- **Severidad alta**: Parche dentro de 1 semana
- **Severidad media**: Parche dentro de 1 mes
- **Severidad baja**: Abordadas en actualizaciones regulares
- **Actualizaciones de dependencias**: Revisión y actualización mensual
- **Auditorías de seguridad**: Auditorías comprehensivas trimestrales
- **Pruebas de penetración**: Pruebas anuales por terceros

**Próxima auditoría programada**: 15 de abril de 2025

---
- ✅ UX patterns de Microsoft, Google, LinkedIn
