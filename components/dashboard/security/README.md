# Página de Seguridad y Configuración - Dashboard BSKMT

## 🔐 Descripción General

Esta es una página completa de "Seguridad y Configuración" desarrollada para el Dashboard de Miembros de BSK Motorcycle Team. La página está construida con **Next.js 15**, **TypeScript**, **Tailwind CSS** y **react-icons**.

## ✨ Características Implementadas

### 🛡️ Secciones Principales

1. **Cambio de Contraseña**
   - Formulario con validación de contraseña actual, nueva y confirmación
   - Barra de progreso de fortaleza (rojo → amarillo → verde)
   - Validación en tiempo real de requisitos de seguridad
   - Modal de confirmación antes de guardar
   - Sistema de toasts para feedback

2. **Autenticación de Dos Factores (2FA)**
   - Toggle para activar/desactivar 2FA
   - QR Code simulado para configuración
   - Input para verificación de código de 6 dígitos
   - Estado visual: ✅ Activo | ❌ Inactivo
   - Generación y descarga de códigos de respaldo (.txt)
   - Flujo completo de configuración en 3 pasos

3. **Gestión de Sesiones Activas**
   - Lista de sesiones con información detallada:
     - Dispositivo y tipo (desktop, móvil, tablet)
     - Navegador y versión
     - Ubicación e IP
     - Última actividad
   - Botón "Cerrar sesión en este dispositivo"
   - Botón "Cerrar todas las sesiones"
   - Indicación visual de sesión actual

4. **Notificaciones y Preferencias**
   - Switches para:
     - 📧 Notificaciones por correo
     - 📱 Notificaciones push
     - 🛑 Recordatorios de eventos
   - Selector de idioma (Español, English, Português, Français)
   - Selector de zona horaria (Colombia, América Latina, España, etc.)
   - Mostrar hora actual según zona seleccionada

5. **Privacidad y Control de Datos**
   - Checkboxes para controlar visibilidad en la comunidad:
     - Mostrar nombre completo
     - Mostrar foto de perfil
     - Mostrar puntos acumulados
     - Mostrar actividad reciente
   - Botón para descargar datos personales (JSON)
   - Botón "Eliminar cuenta" con confirmación de seguridad
   - Información sobre protección de datos

6. **Configuraciones Avanzadas**
   - Vinculación de redes sociales (Google, Facebook, Apple ID)
   - Switch para alertas de seguridad en login desde nuevos dispositivos
   - Selector de tema: Claro, Oscuro, Seguir sistema
   - Estados visuales de conexión/desconexión

### 🎨 Características de Diseño

- **Responsive Design**: Funciona perfectamente en desktop y móvil
- **Dark Mode**: Soporte completo para modo oscuro
- **Navegación por Tabs**: Organización clara en 6 secciones
- **Sistema de Toasts**: Notificaciones elegantes para feedback
- **Modales de Confirmación**: Para acciones críticas
- **Iconografía Consistente**: Usando react-icons/fa
- **Colores de Advertencia**: Para acciones peligrosas (eliminar cuenta)

### 🛠️ Tecnologías Utilizadas

- **Next.js 15** con App Router
- **TypeScript** para tipado estático
- **Tailwind CSS** para estilos
- **react-icons** para iconografía
- **React Hooks** para gestión de estado

## 📁 Estructura de Archivos

```
app/dashboard/security/
└── page.tsx                               # Página principal con navegación por tabs

components/dashboard/security/
├── PasswordChangeSection.tsx              # Componente de cambio de contraseña
├── TwoFactorAuthSection.tsx               # Componente de 2FA
├── SessionManagementSection.tsx           # Componente de gestión de sesiones
├── NotificationPreferencesSection.tsx     # Componente de notificaciones
├── PrivacyControlSection.tsx              # Componente de privacidad
└── AdvancedSettingsSection.tsx            # Componente de configuraciones avanzadas
```

## 🚀 Funcionalidades Destacadas

### Sistema de Validación de Contraseñas
- Verificación de 8+ caracteres
- Verificación de mayúsculas, minúsculas, números y símbolos especiales
- Barra de progreso visual con colores
- Feedback en tiempo real

### Autenticación 2FA Completa
- QR Code simulado para apps de autenticación
- Códigos de respaldo descargables
- Flujo de configuración paso a paso
- Estados de activación/desactivación

### Gestión Inteligente de Sesiones
- Información detallada de cada sesión
- Diferentes tipos de dispositivos con iconos apropiados
- Formateo inteligente de tiempo ("Hace 2 horas", "Hace 3 días")
- Protección de sesión actual

### Sistema de Notificaciones
- Toasts elegantes con colores según tipo (éxito, error, advertencia)
- Auto-dismiss después de 4 segundos
- Iconos apropiados para cada tipo de mensaje
- Posicionamiento fijo en esquina superior derecha

## 🎯 Casos de Uso

1. **Miembro Regular**: Puede cambiar contraseña, configurar 2FA, gestionar notificaciones
2. **Usuario de Seguridad**: Puede revisar sesiones activas, configurar alertas
3. **Usuario de Privacidad**: Puede controlar visibilidad y descargar datos
4. **Administrador**: Acceso completo a todas las configuraciones

## 🔒 Consideraciones de Seguridad

- Validación robusta de contraseñas
- Confirmación modal para acciones críticas
- Gestión segura de sesiones
- Descarga encriptada de datos personales
- Proceso de eliminación de cuenta con período de gracia

## 💡 Funcionalidades Simuladas

Para efectos de demostración, las siguientes funcionalidades están simuladas:

- **API calls**: Simulados con `setTimeout` para mostrar estados de carga
- **QR Code**: Imagen SVG placeholder
- **Códigos 2FA**: Código de prueba "123456"
- **Descarga de archivos**: Generación real de archivos .txt y .json
- **Sesiones**: Datos de ejemplo realistas
- **Zonas horarias**: Funcional con fechas reales

## 🎨 Personalización

El código está estructurado de manera modular, permitiendo fácil:

- Cambio de colores y temas
- Adición de nuevas secciones
- Modificación de validaciones
- Integración con APIs reales
- Personalización de iconos y textos

## 📱 Responsive Breakpoints

- **Mobile**: Tabs apilados, iconos prominentes
- **Tablet**: Navegación híbrida
- **Desktop**: Navegación completa horizontal

## 🌟 Extras Implementados

- Información contextual y consejos de seguridad
- Enlaces a políticas de privacidad
- Indicadores visuales de estado
- Feedback inmediato en todas las acciones
- Accesibilidad mejorada con labels y ARIA
- Compatibilidad con lectores de pantalla

---

**Desarrollado para BSK Motorcycle Team** 🏍️  
*Dashboard de Miembros - Sección Seguridad y Configuración*