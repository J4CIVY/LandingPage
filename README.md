# BSK Motorcycle Team - Landing Page

Este es el repositorio para el frontend de la página web oficial de **BSK Motorcycle Team**. El proyecto está construido con Next.js y TypeScript, proporcionando una experiencia de usuario moderna, rápida y receptiva.

## ✨ Características Principales

- **Páginas Estáticas y Dinámicas:** Múltiples secciones como Sobre Nosotros, Eventos, Tienda, Contacto y más.
- **Diseño Receptivo:** Interfaz de usuario totalmente adaptativa construida con Tailwind CSS.
- **Tema Claro/Oscuro:** Soporte para cambiar entre temas de color.
- **Calendario de Eventos:** Muestra los próximos eventos del club.
- **Registro de Usuarios:** Formulario de registro con validación de esquema usando Zod.
- **Cliente HTTP Centralizado:** Un cliente Axios configurado para manejar las llamadas a la API, con soporte para claves de API en rutas públicas.
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

Para ejecutar el conjunto de pruebas, utiliza el siguiente comando:

```bash
npm run test
```

Esto ejecutará todas las pruebas unitarias definidas en el directorio `tests/` utilizando Vitest.
