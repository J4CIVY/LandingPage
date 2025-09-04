# Sistema de Administración BSK Motorcycle Team

## 📋 Descripción

Sistema completo de administración para BSK Motorcycle Team que permite gestionar usuarios, eventos, productos, membresías y más funcionalidades administrativas.

## 🔐 Acceso y Permisos

### Roles de Usuario
- **user**: Usuario estándar (sin acceso al panel de administración)
- **admin**: Administrador con acceso completo al panel
- **super-admin**: Super administrador con permisos adicionales

### Acceso al Panel de Administración
1. Iniciar sesión con una cuenta que tenga rol `admin` o `super-admin`
2. Navegar a `/admin`
3. El sistema verificará automáticamente los permisos

## 🚀 Funcionalidades Principales

### 1. Dashboard Principal (`/admin`)
- **Vista general del sistema** con estadísticas en tiempo real
- **Tarjetas informativas** con métricas clave:
  - Total de usuarios activos
  - Eventos próximos
  - Membresías pendientes
  - Emergencias activas
- **Accesos rápidos** a todas las secciones
- **Alertas importantes** para situaciones que requieren atención

### 2. Gestión de Usuarios (`/admin/users`)
- **Listado completo** de usuarios registrados
- **Filtros avanzados** por rol, membresía, estado
- **Búsqueda** por nombre, email
- **Acciones individuales**:
  - Ver perfil completo
  - Editar información
  - Activar/desactivar cuenta
  - Cambiar rol (admin/super-admin)
- **Acciones masivas**:
  - Activar/desactivar múltiples usuarios
  - Exportar datos
- **Paginación** para manejar grandes volúmenes

### 3. Gestión de Eventos (`/admin/events`)
- **Crear nuevos eventos** con formulario completo
- **Editar eventos existentes**
- **Gestionar participantes** inscritos
- **Activar/desactivar eventos**
- **Filtros** por tipo, estado, fecha
- **Vista detallada** con información completa
- **Eliminar eventos** con confirmación

### 4. Gestión de Productos (`/admin/products`)
- **Inventario completo** con vista de tarjetas
- **Gestión de stock** y precios
- **Categorización** de productos
- **Imágenes** de productos
- **Estados**: activo/inactivo, destacado
- **Alertas de stock bajo**
- **Filtros** por categoría, estado, stock

### 5. Gestión de Membresías (`/admin/memberships`)
- **Revisar solicitudes** de membresía pendientes
- **Aprobar/rechazar** solicitudes individuales
- **Acciones masivas** para múltiples solicitudes
- **Vista detallada** de cada solicitud
- **Historial** de decisiones
- **Filtros** por estado, tipo de membresía

### 6. Panel de Emergencias (`/admin/emergencies`)
- **Monitor en tiempo real** de emergencias SOS
- **Alertas críticas** en dashboard principal
- **Gestión de estados** de emergencia
- **Información de contacto** de emergencia
- **Respuesta rápida** a situaciones críticas

## 🛠 Funcionalidades Técnicas

### Autenticación y Autorización
- **JWT tokens** para autenticación
- **Middleware de protección** en rutas admin
- **Verificación de roles** en APIs
- **Sesiones seguras** con cookies httpOnly

### APIs de Administración
- `GET /api/admin/stats` - Estadísticas del dashboard
- `GET /api/admin/users` - Listado de usuarios con filtros
- `PATCH /api/admin/users/[id]/role` - Cambiar rol de usuario
- `PATCH /api/admin/users/[id]/toggle-status` - Activar/desactivar usuario
- `PATCH /api/admin/users/bulk` - Acciones masivas en usuarios
- `GET /api/admin/events` - Listado de eventos
- `POST /api/admin/events` - Crear evento
- `PATCH /api/admin/events/[id]/toggle-status` - Activar/desactivar evento
- `GET /api/admin/products` - Listado de productos
- `GET /api/admin/memberships` - Solicitudes de membresía

### Seguridad
- **Verificación de permisos** en cada endpoint
- **Validación de datos** en formularios
- **Sanitización** de entradas
- **Headers de seguridad** en middleware
- **Rate limiting** para APIs

## 🎨 Interfaz de Usuario

### Diseño Responsivo
- **Mobile-first** design
- **Grid system** adaptativo
- **Componentes reutilizables**
- **Navegación intuitiva**

### Componentes Principales
- **AdminLayout**: Layout base con sidebar
- **AdminSidebar**: Navegación lateral
- **Estadísticas**: Tarjetas de métricas
- **Tablas**: Listados con paginación
- **Filtros**: Búsqueda y filtrado avanzado
- **Modales**: Confirmaciones y formularios

### Colores y Estados
- **Azul**: Información general
- **Verde**: Estados positivos, aprobaciones
- **Rojo**: Alertas, emergencias, rechazos
- **Amarillo**: Advertencias, pendientes
- **Gris**: Estados inactivos

## 📱 Navegación

### Sidebar de Administración
**Gestión Principal:**
- Dashboard Principal
- Usuarios
- Eventos  
- Productos
- Membresías
- Emergencias
- Analytics

**Herramientas:**
- Mensajes
- Notificaciones
- Configuración
- Logs

## 🔧 Configuración

### Variables de Entorno Requeridas
```env
JWT_SECRET=tu_jwt_secret_muy_seguro
MONGODB_URI=tu_conexion_mongodb
```

### Permisos de Roles
```typescript
// Super Admin: Todos los permisos
// Admin: Todos los permisos excepto crear otros super-admins
// User: Sin acceso al panel de administración
```

## 🚨 Alertas y Notificaciones

### Alertas Críticas
- **Emergencias activas**: Notificación prominente en dashboard
- **Solicitudes pendientes**: Cuando hay > 5 solicitudes
- **Stock bajo**: Productos con menos de 5 unidades

### Confirmaciones
- **Eliminaciones**: Siempre requieren confirmación
- **Acciones masivas**: Confirmación para cambios múltiples
- **Cambios de estado**: Confirmación para cambios críticos

## 📊 Reportes y Analytics

### Métricas Disponibles
- Total de usuarios y usuarios activos
- Eventos programados y participación
- Productos más vendidos
- Estados de membresías
- Actividad del sistema

### Exportación de Datos
- **CSV export** para todos los listados
- **Filtros aplicados** se mantienen en exportación
- **Datos completos** de usuarios seleccionados

## 🔄 Actualizaciones Futuras

### Funcionalidades Planificadas
- [ ] Dashboard de analytics avanzado
- [ ] Sistema de notificaciones push
- [ ] Backup automático de datos
- [ ] Logs de auditoría detallados
- [ ] Reportes personalizables
- [ ] Integración con sistemas externos

## 🆘 Soporte

Para soporte técnico o preguntas sobre el sistema de administración:
1. Revisar logs del sistema en `/admin/logs`
2. Verificar configuración de variables de entorno
3. Contactar al equipo de desarrollo

---

**Desarrollado para BSK Motorcycle Team** 🏍️
