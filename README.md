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

### Sistema de Autenticación con Encriptación RSA (v2.1.0)

Este proyecto implementa **encriptación client-side RSA-2048** para proteger las credenciales del usuario incluso durante la transmisión.

#### Protección Multicapa

**1. Encriptación Client-Side (NUEVA)**
- ✅ **RSA-2048**: Contraseñas encriptadas en el navegador antes de enviarlas
- ✅ **Web Crypto API**: Tecnología nativa del navegador, sin librerías externas
- ✅ **Invisible en BurpSuite**: Las contraseñas no se ven ni siquiera interceptando el tráfico
- ✅ **Protección MITM**: Capa adicional sobre HTTPS

**2. Tokens de Pre-Autenticación**
- ✅ **Tokens Temporales**: 256 bits, expiración en 5 minutos
- ✅ **Un Solo Uso**: No reutilizables después de la verificación
- ✅ **Validación de Contexto**: IP + UserAgent binding
- ✅ **Limpieza Automática**: TTL indexes de MongoDB

**3. Autenticación 2FA**
- ✅ **WhatsApp OTP**: Códigos de 6 dígitos enviados por WhatsApp
- ✅ **Rate Limiting**: Protección contra fuerza bruta
- ✅ **Bloqueo de Cuenta**: Tras múltiples intentos fallidos

#### Flujo de Autenticación Seguro

1. **Encriptación**: Usuario ingresa credenciales → Encriptación RSA-2048 en el navegador
2. **Validación**: Servidor desencripta y valida → Genera token de pre-autenticación
3. **2FA**: Código enviado por WhatsApp → Usuario ingresa código
4. **Verificación**: Token marcado como usado → Sesión JWT creada

#### Nivel de Seguridad

```
Capa 1: HTTPS/TLS 1.3
  ↓
Capa 2: Encriptación RSA-2048 (Client-Side)
  ↓
Capa 3: Rate Limiting
  ↓
Capa 4: Tokens de Pre-Autenticación (256 bits)
  ↓
Capa 5: Validación de IP + UserAgent
  ↓
Capa 6: Autenticación 2FA por WhatsApp
  ↓
Capa 7: JWT con firma
  ↓
🎯 MÁXIMA SEGURIDAD
```

#### Documentación de Seguridad

Para información detallada sobre la implementación de seguridad:

- **Encriptación Client-Side**: [`docs/CLIENT-SIDE-ENCRYPTION.md`](./docs/CLIENT-SIDE-ENCRYPTION.md) ⭐ NUEVO
- **Análisis Técnico**: [`docs/security-2fa-improvements.md`](./docs/security-2fa-improvements.md)
- **Guía de Despliegue**: [`docs/DEPLOYMENT-GUIDE.md`](./docs/DEPLOYMENT-GUIDE.md)
- **Configuración Avanzada**: [`docs/SECURITY-CONFIGURATION.md`](./docs/SECURITY-CONFIGURATION.md)
- **Resumen Ejecutivo**: [`docs/EXECUTIVE-SUMMARY.md`](./docs/EXECUTIVE-SUMMARY.md)

#### Pruebas de Seguridad

**Con BurpSuite:**
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
