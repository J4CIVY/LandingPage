# Sistema de Solicitud de Voluntariado BSK

## 📋 Descripción General

Sistema completo para gestionar solicitudes de voluntariado en BSK Motorcycle Team, con proceso de revisión y aprobación por parte de la directiva del club.

## 🎯 Características Principales

### 1. **Proceso de Solicitud**
- Modal interactivo con información pre-cargada del usuario
- Sistema de lectura obligatoria de documentos legales
- Detección de scroll hasta el final antes de poder aceptar
- Barra de progreso visual (4 documentos)
- Validación de aceptación de todos los documentos

### 2. **Documentos Legales Obligatorios**

#### 📄 Términos y Condiciones
- Definición de voluntario
- Compromisos y responsabilidades
- Derechos y beneficios
- Duración y terminación
- Naturaleza del voluntariado

#### 🛡️ Código de Ética
- Valores fundamentales (respeto, integridad, solidaridad)
- Conducta esperada
- Prohibiciones claras
- Conflicto de intereses
- Uso de redes sociales
- Sanciones por incumplimiento

#### 🔒 Tratamiento de Datos Personales
- Cumplimiento Ley 1581 de 2012 (Colombia)
- Finalidad del tratamiento
- Datos recopilados
- Derechos del titular
- Seguridad de la información
- Uso de imágenes en eventos

#### 🤝 Acuerdo de Voluntariado
- Actividades específicas del voluntario
- Requisitos de participación
- Beneficios y reconocimientos detallados
- Sistema de evaluación semestral
- Capacitación inicial obligatoria
- Requisito para liderazgo

### 3. **Estados de Solicitud**

| Estado | Descripción | UI |
|--------|-------------|---|
| `none` | Sin solicitud | Botón "Solicitar Ser Voluntario" |
| `pending` | En revisión | Icono reloj + mensaje de espera |
| `approved` | Aprobado | Icono check + beneficios activos |
| `rejected` | Rechazado | Icono X + motivo de rechazo |
| `cancelled` | Cancelado por usuario | - |

### 4. **Componente DocumentReader**

Modal especializado para lectura de documentos con:
- **Scroll obligatorio**: Detecta cuando el usuario llega al final
- **Indicador visual**: Flecha animada mientras no haya leído completo
- **Botón deshabilitado**: Se activa solo al completar lectura
- **Gradiente de scroll**: Efecto visual que indica contenido no leído
- **Confirmación de lectura**: Timestamp guardado en DB

## 📁 Estructura de Archivos

```
/lib/models/
  VolunteerApplication.ts         # Modelo MongoDB para solicitudes

/components/membership/
  VolunteerToggle.tsx              # Componente principal (actualizado)
  VolunteerApplicationModal.tsx    # Modal de solicitud
  DocumentReader.tsx               # Lector de documentos con scroll
  VolunteerDocuments.tsx           # Contenido de los 4 documentos

/app/api/membership/
  volunteer-application/
    route.ts                       # POST - Crear solicitud
    status/
      route.ts                     # GET - Consultar estado
```

## 🔧 Uso del Componente

### Antes (Switch Simple)
```tsx
<VolunteerToggle
  isVolunteer={user.isVolunteer}
  onToggle={(newState) => console.log(newState)}
/>
```

### Ahora (Sistema de Solicitud)
```tsx
<VolunteerToggle
  isVolunteer={user.isVolunteer}
  userData={{
    fullName: user.fullName,
    email: user.email,
    membershipNumber: user.membershipNumber,
    phone: user.phone
  }}
  onToggle={(newState) => refreshUserData()}
/>
```

## 🗄️ Modelo de Datos

```typescript
interface IVolunteerApplication {
  userId: ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  
  // Aceptación de documentos
  acceptedTerms: boolean;
  acceptedEthicsCode: boolean;
  acceptedDataProcessing: boolean;
  acceptedVolunteerAgreement: boolean;
  
  // Timestamps de lectura
  termsReadAt?: Date;
  ethicsCodeReadAt?: Date;
  dataProcessingReadAt?: Date;
  volunteerAgreementReadAt?: Date;
  
  // Revisión por admin
  reviewedBy?: ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  rejectionReason?: string;
  
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔌 API Endpoints

### POST `/api/membership/volunteer-application`
Crea una nueva solicitud de voluntariado.

**Request Body:**
```json
{
  "acceptedTerms": true,
  "acceptedEthicsCode": true,
  "acceptedDataProcessing": true,
  "acceptedVolunteerAgreement": true
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Solicitud enviada exitosamente",
  "data": {
    "applicationId": "...",
    "status": "pending",
    "submittedAt": "2025-10-04T..."
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "Ya tienes una solicitud pendiente de aprobación"
}
```

### GET `/api/membership/volunteer-application/status`
Consulta el estado de la solicitud del usuario autenticado.

**Response 200 (Con solicitud):**
```json
{
  "success": true,
  "data": {
    "status": "pending",
    "submittedAt": "2025-10-04T...",
    "reviewedAt": null,
    "reviewNotes": null
  }
}
```

**Response 200 (Sin solicitud):**
```json
{
  "success": true,
  "data": {
    "status": "none"
  }
}
```

## 🎨 UI/UX Features

### 1. **Modal de Solicitud**
- Header gradiente cyan-to-blue
- Grid responsivo 2 columnas (desktop) / 1 columna (móvil)
- Información del usuario pre-cargada
- Tarjetas de documentos con iconos coloreados
- Barra de progreso animada
- Botones de acción con estados disabled/loading

### 2. **Lector de Documentos**
- Full-screen modal con overlay oscuro
- Scroll obligatorio con detección precisa
- Indicador de "Desplázate hasta el final" con animación bounce
- Gradiente semi-transparente al final del contenido
- Badge de confirmación al completar lectura
- Diseño responsive con max-w-3xl

### 3. **Estados Visuales**
- **Ninguna solicitud**: Card gris + botón azul "Solicitar"
- **Pendiente**: Card amarillo + icono reloj + info de fecha
- **Aprobado**: Card verde + icono check + beneficios
- **Rechazado**: Card rojo + motivo + opción de re-aplicar

## ✅ Beneficios del Sistema

### Para el Usuario
- ✅ Proceso claro y profesional
- ✅ Información completa sobre compromisos
- ✅ Transparencia en términos legales
- ✅ Visibilidad del estado de solicitud
- ✅ Expectativas claras de tiempo de respuesta

### Para el Club
- ✅ Registro formal de solicitudes
- ✅ Evidencia de lectura de documentos
- ✅ Proceso de aprobación controlado
- ✅ Trazabilidad completa
- ✅ Cumplimiento legal (RGPD/LOPD Colombia)
- ✅ Base de datos de voluntarios estructurada

## 🔐 Seguridad y Cumplimiento

- ✅ Autenticación obligatoria (getUserFromRequest)
- ✅ Validación de todos los documentos aceptados
- ✅ Timestamps de lectura para evidencia legal
- ✅ Prevención de solicitudes duplicadas (pending)
- ✅ Cumplimiento Ley 1581 de 2012 (Colombia)
- ✅ Consentimiento informado y documentado

## 🚀 Próximos Pasos (Admin Panel)

1. **Panel de Administración de Solicitudes**
   - Lista de solicitudes pendientes
   - Vista detallada de cada aplicación
   - Botones de aprobar/rechazar
   - Campo de notas de revisión
   - Filtros por estado y fecha

2. **Notificaciones por Email**
   - Confirmación de recepción de solicitud
   - Notificación de aprobación
   - Notificación de rechazo (con motivo)
   - Recordatorio a admins de solicitudes pendientes

3. **Reportes y Estadísticas**
   - Total de solicitudes por mes
   - Tiempo promedio de aprobación
   - Tasa de aprobación/rechazo
   - Voluntarios activos por período

4. **Certificaciones**
   - Generación automática de certificados
   - Contador de horas de voluntariado
   - Badges digitales por logros
   - Export PDF de certificación

## 📝 Notas de Implementación

- Los datos del usuario se extraen automáticamente de la sesión
- No se requiere llenar formularios adicionales
- El scroll detection tiene margen de 50px para UX
- Los documentos usan prose class (Tailwind Typography)
- El sistema es compatible con dark mode completo
- Responsive design para móviles y tablets

## 🎓 Consideraciones Legales

Este sistema implementa las mejores prácticas de:
- ✅ Consentimiento informado
- ✅ Lectura obligatoria verificable
- ✅ Evidencia timestamped
- ✅ Transparencia en uso de datos
- ✅ Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)
- ✅ Protección de datos personales

---

**Fecha de Implementación**: Octubre 2025  
**Versión**: 1.0.0  
**Desarrollado para**: BSK Motorcycle Team
