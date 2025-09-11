# Dashboard de Miembros - BSK Motorcycle Team

## Descripción

Dashboard rediseñado con enfoque mobile-first y modular, implementado según los requisitos especificados. El dashboard proporciona una interfaz completa para que los miembros del motoclub gestionen su información, eventos y actividades.

## Estructura del Dashboard

### Componentes Principales

#### 1. **WelcomeHeader** (`/components/dashboard/sections/WelcomeHeader.tsx`)
- Saludo personalizado con nombre del miembro
- Avatar/foto de perfil circular
- Tipo de membresía
- Dropdown de notificaciones integrado

#### 2. **MembershipStatus** (`/components/dashboard/sections/MembershipStatus.tsx`)
- Tipo de membresía (friend, Rider, Pro, etc.)
- Días como miembro
- Estado de la membresía (activa/inactiva) con indicadores visuales
- Botón para ver más detalles

#### 3. **UpcomingEvents** (`/components/dashboard/sections/UpcomingEvents.tsx`)
- Lista de próximos eventos en formato tarjetas
- Información de cada evento: título, fecha, ubicación, participantes
- Estados de inscripción y botones de acción
- Integración con sistema de favoritos
- Enlace "Ver todos los eventos"

#### 4. **ActiveBenefits** (`/components/dashboard/sections/ActiveBenefits.tsx`)
- Grid de beneficios activos (descuentos, convenios, cupones)
- Cada tarjeta muestra tipo, descripción y valor del beneficio
- Botón "Ver beneficio" para acceder a detalles

#### 5. **RecentActivities** (`/components/dashboard/sections/RecentActivities.tsx`)
- Lista cronológica de actividades recientes
- Tipos: eventos inscritos, eventos asistidos, compras, PQRSDF
- Fechas y estados de cada actividad
- Enlace al historial completo

#### 6. **QuickActions** (`/components/dashboard/sections/QuickActions.tsx`)
- Grid de atajos rápidos a funcionalidades principales
- Incluye: Actualizar perfil, Ver eventos, PQRSDF, Beneficios, SOS, Clima, Cursos
- Iconos y colores diferenciados por categoría

#### 7. **GamificationPanel** (`/components/dashboard/sections/GamificationPanel.tsx`)
- Barra de progreso de participación
- Sistema de niveles y puntos
- Ranking del miembro
- Logros y estadísticas de participación

## Características del Diseño

### Responsive Design
- **Mobile First**: Optimizado para dispositivos móviles
- **Desktop Adaptado**: Layout en grid para pantallas grandes
- **Breakpoints**: Utiliza Tailwind CSS para responsive design

### Estilo Visual
- **Colores**: Paleta del club (slate, green, red, combinaciones con blanco y gris)
- **Cards**: Tarjetas con sombras suaves y bordes redondeados
- **Layout**: Grid en desktop, stack en móvil
- **Iconos**: React Icons para consistencia visual

### Funcionalidades

#### Sistema de Notificaciones
- Integrado en el header mediante `NotificationDropdown`
- Indica cantidad de notificaciones no leídas
- Tipos: eventos, membresía, anuncios del sistema

#### Gestión de Eventos
- Registro/cancelación de inscripciones
- Sistema de favoritos
- Indicadores de estado (lleno, registrado, etc.)
- Información detallada de cada evento

#### Beneficios y Convenios
- Visualización de beneficios activos
- Categorización por tipo (descuento, convenio, cupón)
- Enlaces directos a detalles de beneficios

#### Sistema de Gamificación
- Puntos por participación
- Niveles de membresía
- Progreso visual mediante barras de progreso
- Logros y reconocimientos

## Layout del Dashboard

```
┌─────────────────────────────────────────┐
│            WelcomeHeader                │
├─────────────────────┬───────────────────┤
│                     │                   │
│   UpcomingEvents    │  MembershipStatus │
│                     │                   │
├─────────────────────┤                   │
│                     │ GamificationPanel │
│   ActiveBenefits    │                   │
│                     ├───────────────────┤
├─────────────────────┤                   │
│                     │ RecentActivities  │
│   QuickActions      │                   │
│                     │                   │
└─────────────────────┴───────────────────┘
```

## Integración con APIs

### Endpoints Utilizados
- `/api/users/profile` - Información del perfil del usuario
- `/api/users/stats` - Estadísticas del usuario
- `/api/events?upcoming=true` - Eventos próximos
- `/api/users/events/registrations` - Eventos registrados
- `/api/users/events/favorites` - Eventos favoritos
- `/api/users/activity` - Actividades recientes
- `/api/notifications` - Sistema de notificaciones

### Estados de Carga
- Spinners de carga individuales por componente
- Estados de error con botones de reintento
- Fallbacks para datos no disponibles

## Tecnologías Utilizadas

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Icons**: React Icons (FA)
- **TypeScript**: Tipado completo
- **State Management**: React hooks (useState, useEffect)
- **Authentication**: Hook personalizado `useAuth`

## Futuras Mejoras

1. **Animaciones**: Implementar micro-animaciones para mejor UX
2. **PWA**: Notificaciones push para eventos
3. **Offline Support**: Caché de datos críticos
4. **Personalización**: Temas y layouts personalizables
5. **Analytics**: Tracking de interacciones del usuario
6. **Real-time**: Actualizaciones en tiempo real para eventos

## Mantenimiento

### Añadir Nuevos Componentes
1. Crear componente en `/components/dashboard/sections/`
2. Importar en `/app/dashboard/page.tsx`
3. Añadir al layout correspondiente

### Modificar Estilos
- Utilizar clases de Tailwind CSS
- Mantener consistencia con el sistema de diseño
- Probar en diferentes resoluciones

### Testing
- Verificar responsividad en dispositivos móviles
- Probar funcionalidades con datos reales
- Validar estados de carga y error