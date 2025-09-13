# Sistema de Perfil - BSK Motorcycle Team

## 📋 Descripción

Sistema completo de gestión de perfil de usuario desarrollado en **Next.js (App Router)** con **TypeScript** y **Tailwind CSS** para el dashboard de miembros del motoclub BSK Motorcycle Team.

## 🏗️ Arquitectura

### Componentes Modulares

```
components/dashboard/profile/
├── index.ts                  # Barrel exports
├── ProfileHeader.tsx         # Cabecera con avatar y estado
├── PersonalInfo.tsx         # Información personal completa
├── EmergencyContact.tsx     # Contacto de emergencia
├── MedicalData.tsx          # Datos médicos privados
├── MotorcycleInfo.tsx       # Información de motocicletas
├── Documents.tsx            # Gestión de documentos
├── AccountSettings.tsx      # Configuración de cuenta
├── UserActivity.tsx         # Historial de actividad
└── AdminOptions.tsx         # Panel administrativo
```

### Esquemas de Base de Datos

```
lib/models/
├── User.ts                  # Modelo original de usuario
└── ExtendedUser.ts          # Modelo extendido con nuevos datos
```

### Página Principal

```
app/dashboard/profile/
└── page.tsx                 # Página principal con navegación por tabs
```

## 🎨 Características

### ✅ **Diseño y UX**
- **Responsive Design**: Mobile-first con Tailwind CSS
- **Dark Mode**: Soporte completo para tema oscuro/claro
- **Navegación por Tabs**: Sidebar con indicador de progreso
- **Estados Visuales**: Indicadores de estado y completitud
- **Animaciones**: Transiciones suaves y feedback visual

### ✅ **Funcionalidades**
- **Gestión de Avatar**: Upload de imagen de perfil
- **Formularios Validados**: Validación en tiempo real
- **Modo de Edición**: Control unificado de edición/guardado
- **Protección de Datos**: Controles de privacidad para datos médicos
- **Sistema de Documentos**: Upload, categorización y estados de aprobación
- **Panel Administrativo**: Solo visible para roles admin/super-admin
- **Historial de Actividad**: Logging completo de acciones del usuario
- **Gestión de Sesiones**: Control de dispositivos activos

### ✅ **Seguridad y Privacidad**
- **Roles y Permisos**: Control de acceso basado en roles
- **Datos Médicos Protegidos**: Controles especiales de privacidad
- **Validación de Cambios**: Prevención de pérdida de datos no guardados
- **Auditoría**: Registro de todas las acciones administrativas
- **Autenticación 2FA**: Soporte para autenticación de dos factores

## 🔧 Tecnologías

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Icons**: React Icons (Font Awesome)
- **Database**: MongoDB con Mongoose
- **Validation**: Esquemas TypeScript + validación client-side
- **Upload**: Preparado para integración con Cloudinary
- **State Management**: React useState/useEffect

## 📚 Uso

### Importación de Componentes

```typescript
// Importación individual
import ProfileHeader from '@/components/dashboard/profile/ProfileHeader';

// Importación múltiple desde barrel
import { 
  ProfileHeader, 
  PersonalInfo, 
  EmergencyContact 
} from '@/components/dashboard/profile';
```

### Uso de la Página Principal

```typescript
// Navegar a la página de perfil
/dashboard/profile

// Las siguientes props son requeridas:
- user: Objeto de usuario (IUser o compatible)
- currentUserRole: 'user' | 'admin' | 'super-admin'
- Callbacks para actualizaciones (onUserUpdate, onStatusChange, etc.)
```

### Configuración de Props

```typescript
// Props comunes para todos los componentes
const commonProps = {
  user,                    // Datos del usuario
  isEditMode,             // Modo de edición activo
  onEdit: () => void,     // Activar modo edición
  onSave: (data) => void, // Guardar cambios
  onCancel: () => void,   // Cancelar edición
  onChange: () => void    // Notificar cambios
};
```

## 🔄 Estados del Sistema

### Estados de Documentos
- `pending`: Pendiente de aprobación
- `approved`: Aprobado por administrador
- `rejected`: Rechazado con notas
- `expired`: Documento vencido

### Estados de Usuario
- `active`: Usuario activo
- `suspended`: Usuario suspendido temporalmente
- `inactive`: Usuario inactivo
- `pending_approval`: Pendiente de aprobación

### Roles de Usuario
- `user`: Usuario regular
- `admin`: Administrador
- `super-admin`: Super administrador

## 📊 Completitud del Perfil

El sistema calcula automáticamente el porcentaje de completitud basado en:

- **40%**: Campos básicos (nombre, email, teléfono, fecha nacimiento)
- **15%**: Información adicional (documento, profesión, estado civil)
- **15%**: Contacto de emergencia
- **10%**: Dirección completa
- **10%**: Información de motocicleta
- **10%**: Documentos requeridos aprobados

## 🚀 Integración

### 1. Configurar Base de Datos

```typescript
// Usar el modelo ExtendedUser para nuevas instalaciones
import { ExtendedUser } from '@/lib/models/ExtendedUser';

// O migrar datos existentes desde User a ExtendedUser
```

### 2. Configurar Autenticación

```typescript
// Obtener usuario actual y rol
const { user, role } = useAuth();

// Pasar a los componentes
<ProfilePage user={user} currentUserRole={role} />
```

### 3. Configurar Upload de Archivos

```typescript
// Implementar handlers para Cloudinary u otro servicio
const handleAvatarUpload = async (file: File) => {
  const url = await uploadToCloudinary(file);
  await updateUser({ profilePicture: url });
};
```

### 4. Configurar APIs

```typescript
// Implementar endpoints para:
- PUT /api/users/[id] - Actualizar usuario
- POST /api/users/[id]/documents - Subir documentos
- PUT /api/admin/users/[id]/status - Cambiar estado (admin)
- GET /api/users/[id]/activity - Obtener actividad
```

## 🧪 Testing

### Componentes a Testear
- [ ] Formularios de validación
- [ ] Upload de archivos
- [ ] Cambios de estado de usuario
- [ ] Permisos basados en roles
- [ ] Flujo de aprobación de documentos

### Casos de Prueba
- [ ] Usuario regular no puede ver opciones admin
- [ ] Validación de campos requeridos
- [ ] Protección de datos médicos
- [ ] Prevención de pérdida de datos

## 📝 TODO

### Próximas Mejoras
- [ ] Tests unitarios e integración
- [ ] Integración con API real
- [ ] Notificaciones push
- [ ] Exportación de datos (GDPR)
- [ ] Modo offline con sincronización
- [ ] Historial de cambios detallado

## 🤝 Contribución

1. Mantener la estructura modular
2. Seguir las convenciones de TypeScript
3. Documentar interfaces y props
4. Mantener consistencia visual con Tailwind
5. Probar en modo oscuro y claro
6. Validar responsividad mobile

## 📄 Licencia

Desarrollado para BSK Motorcycle Team © 2024