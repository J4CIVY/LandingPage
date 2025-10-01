# Implementación de Privacidad y Seguridad - Dashboard

## 📋 Descripción General

Implementación completa y funcional del sistema de **Privacidad y Control de Datos** en `/dashboard/security`, que permite a los usuarios gestionar sus preferencias de privacidad, descargar sus datos personales y eliminar su cuenta (con cancelación automática de membresía).

## ✅ Funcionalidades Implementadas

### 1. Preferencias de Privacidad (Persistentes en BD)

#### Características:
- ✅ **Visibilidad en la comunidad**:
  - Mostrar/ocultar nombre completo
  - Mostrar/ocultar foto de perfil
  - Mostrar/ocultar puntos acumulados
  - Mostrar/ocultar actividad reciente

- ✅ **Persistencia en MongoDB**:
  - Las preferencias se guardan en la base de datos
  - Se cargan automáticamente al acceder a la página
  - Persisten entre sesiones y recargas

#### Archivos Modificados:
- **Modelo**: `/lib/models/ExtendedUser.ts`
  ```typescript
  privacySettings: {
    showName: { type: Boolean, default: true },
    showPhoto: { type: Boolean, default: true },
    showPoints: { type: Boolean, default: false },
    showActivity: { type: Boolean, default: true }
  }
  ```

- **API**: `/app/api/user/privacy/route.ts`
  - `GET /api/user/privacy` - Obtiene preferencias actuales
  - `PATCH /api/user/privacy` - Actualiza preferencias

#### Uso del API:
```typescript
// Obtener preferencias
const response = await fetch('/api/user/privacy');
const { privacySettings } = await response.json();

// Actualizar preferencias
await fetch('/api/user/privacy', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ showName: false })
});
```

---

### 2. Descargar Datos Personales (GDPR Compliant)

#### Características:
- ✅ Extrae **TODOS** los datos reales del usuario desde MongoDB
- ✅ Genera archivo JSON estructurado con:
  - Información personal y de contacto
  - Datos de salud y contacto de emergencia
  - Información de motocicleta y licencias
  - Historial completo de eventos
  - Notificaciones (últimas 100)
  - Documentos subidos
  - Preferencias y configuraciones
  - Actividades registradas

#### Archivo Creado:
- **API**: `/app/api/user/download-data/route.ts`
  - `GET /api/user/download-data` - Genera y descarga archivo JSON

#### Estructura del Archivo Generado:
```json
{
  "metadata": {
    "exportDate": "2025-10-01T...",
    "exportedBy": "userId",
    "dataProtectionNote": "..."
  },
  "personalInformation": {
    "basicInfo": { ... },
    "contactInfo": { ... },
    "accountInfo": { ... }
  },
  "healthInformation": { ... },
  "emergencyContact": { ... },
  "motorcycleInformation": { ... },
  "preferences": { ... },
  "activityHistory": {
    "events": [...],
    "notifications": [...]
  },
  "documents": [...],
  "termsAndConditions": { ... }
}
```

#### Uso del API:
```typescript
const response = await fetch('/api/user/download-data');
const blob = await response.blob();
// Descarga automática del archivo
```

---

### 3. Eliminación de Cuenta (Con Cancelación de Membresía)

#### Características:
- ✅ **Validación doble**:
  - Verificación de contraseña del usuario
  - Confirmación escribiendo "eliminar-cuenta"

- ✅ **Cancelación automática de membresía**:
  - Cancela TODAS las membresías activas
  - Registra motivo de cancelación
  - Mantiene historial en `MembershipHistory`

- ✅ **Periodo de gracia de 30 días**:
  - Cuenta marcada como `scheduled_deletion`
  - Usuario puede cancelar la eliminación durante 30 días
  - Desactivación inmediata de la cuenta

- ✅ **Registro de actividad**:
  - Todas las acciones se registran en el historial
  - Timestamps y detalles completos

#### Archivos Modificados:
- **Modelo**: `/lib/models/ExtendedUser.ts`
  ```typescript
  accountStatus: 'active' | 'suspended' | 'inactive' | 
                'pending_approval' | 'scheduled_deletion' | 'pending_deletion'
  scheduledDeletionDate?: Date
  deletionRequestDate?: Date
  deletionReason?: string
  ```

- **API**: `/app/api/user/delete-account/route.ts`
  - `POST /api/user/delete-account` - Solicita eliminación
  - `DELETE /api/user/delete-account` - Cancela eliminación

#### Flujo de Eliminación:
1. Usuario hace clic en "Eliminar mi cuenta"
2. Modal solicita:
   - Escribir "eliminar-cuenta" exactamente
   - Ingresar contraseña actual
3. Sistema valida ambos datos
4. **Cancela todas las membresías activas automáticamente**
5. Programa eliminación para 30 días después
6. Marca cuenta como `scheduled_deletion`
7. Usuario recibe notificación con fecha de eliminación
8. Redirige al login
9. Usuario puede cancelar iniciando sesión antes de 30 días

#### Uso del API:
```typescript
// Solicitar eliminación
await fetch('/api/user/delete-account', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    password: 'userPassword',
    confirmText: 'eliminar-cuenta'
  })
});

// Cancelar eliminación
await fetch('/api/user/delete-account', {
  method: 'DELETE'
});
```

---

## 🎨 Componente UI Actualizado

### Archivo: `/components/dashboard/security/PrivacyControlSection.tsx`

#### Mejoras Implementadas:
- ✅ Carga automática de preferencias al montar
- ✅ Actualización optimista de UI
- ✅ Indicador de carga durante operaciones
- ✅ Toasts informativos con soporte dark mode
- ✅ Manejo robusto de errores
- ✅ Validaciones en frontend
- ✅ Modal de confirmación mejorado para eliminación

#### Estados del Componente:
```typescript
const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
  showName: true,
  showPhoto: true,
  showPoints: false,
  showActivity: true
})
const [isLoading, setIsLoading] = useState(false)
const [isLoadingSettings, setIsLoadingSettings] = useState(true)
const [deleteConfirmText, setDeleteConfirmText] = useState('')
const [deletePassword, setDeletePassword] = useState('')
```

---

## 🔒 Seguridad

### Validaciones Implementadas:

1. **Autenticación**:
   - Todos los endpoints requieren sesión válida
   - Verificación con `verifyAuth()`

2. **Validación de Contraseña**:
   - Uso de `bcrypt.compare()` para verificar contraseña
   - No se expone información sensible en respuestas

3. **Validación de Input**:
   - Texto de confirmación exacto requerido
   - Validación de campos requeridos

4. **Protección de Datos**:
   - Campos sensibles excluidos de queries (password, tokens)
   - Sanitización de respuestas

---

## 📊 Base de Datos

### Campos Agregados a ExtendedUser:

```typescript
// Preferencias de privacidad para comunidad
privacySettings?: {
  showName: boolean;
  showPhoto: boolean;
  showPoints: boolean;
  showActivity: boolean;
}

// Estados de cuenta extendidos
accountStatus: 'active' | 'suspended' | 'inactive' | 
              'pending_approval' | 'scheduled_deletion' | 'pending_deletion'

// Campos para eliminación programada
scheduledDeletionDate?: Date
deletionRequestDate?: Date
deletionReason?: string
```

### Índices Existentes:
- Email (único)
- MembershipNumber (único, sparse)
- Role
- AccountStatus
- Timestamps automáticos

---

## 🧪 Testing

### Casos de Prueba Recomendados:

#### Preferencias de Privacidad:
- [ ] Cargar preferencias existentes
- [ ] Actualizar cada preferencia individualmente
- [ ] Verificar persistencia después de recargar
- [ ] Manejar error de red

#### Descarga de Datos:
- [ ] Descargar datos con cuenta completa
- [ ] Descargar datos con cuenta nueva (datos mínimos)
- [ ] Verificar estructura del JSON
- [ ] Validar que no incluya contraseñas/tokens

#### Eliminación de Cuenta:
- [ ] Validación de contraseña incorrecta
- [ ] Validación de texto de confirmación incorrecto
- [ ] Eliminación exitosa con cancelación de membresía
- [ ] Verificar periodo de gracia de 30 días
- [ ] Cancelar eliminación programada

---

## 📝 Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/user/privacy` | Obtiene preferencias de privacidad |
| PATCH | `/api/user/privacy` | Actualiza preferencias de privacidad |
| GET | `/api/user/download-data` | Descarga datos personales (JSON) |
| POST | `/api/user/delete-account` | Solicita eliminación de cuenta |
| DELETE | `/api/user/delete-account` | Cancela eliminación programada |

---

## 🚀 Próximas Mejoras (Opcional)

1. **Email Notifications**:
   - Confirmar cambios de preferencias por email
   - Notificar sobre descarga de datos
   - Alertar sobre eliminación programada

2. **Audit Log**:
   - Registro detallado de cambios de privacidad
   - Historial de descargas de datos
   - Log de intentos de eliminación

3. **Exportación en Múltiples Formatos**:
   - CSV para hojas de cálculo
   - PDF para impresión
   - XML para interoperabilidad

4. **Configuración Granular**:
   - Privacidad por secciones (eventos, comunidad, etc.)
   - Configuración de visibilidad por tipo de usuario

---

## ✨ Características Destacadas

- ✅ **100% Funcional** - Sin datos simulados
- ✅ **Persistencia Real** - MongoDB
- ✅ **GDPR Compliant** - Derecho al olvido y portabilidad de datos
- ✅ **Validación Robusta** - Frontend y Backend
- ✅ **Relación Membresía-Cuenta** - Eliminación sincronizada
- ✅ **UX Excelente** - Feedback claro y toasts informativos
- ✅ **Dark Mode Support** - Compatible con tema oscuro
- ✅ **Error Handling** - Manejo completo de errores
- ✅ **TypeScript** - Totalmente tipado

---

## 🔄 Flujo de Datos

```
Usuario → Componente UI → API Endpoint → MongoDB → Respuesta → UI Update
```

### Ejemplo: Actualizar Preferencia
```
1. Usuario hace toggle → showName: false
2. UI actualiza optimísticamente
3. POST /api/user/privacy { showName: false }
4. API valida sesión
5. API actualiza MongoDB
6. API responde con éxito
7. UI muestra toast de confirmación
8. En caso de error: revierte cambio y muestra error
```

---

## 📚 Documentación Relacionada

- [Modelo ExtendedUser](/lib/models/ExtendedUser.ts)
- [Modelo MembershipHistory](/lib/models/MembershipHistory.ts)
- [Auth Utils](/lib/auth-utils.ts)
- [MongoDB Connection](/lib/mongodb.ts)

---

## 👤 Autor

Implementado por: GitHub Copilot
Fecha: Octubre 1, 2025
Versión: 1.0.0

---

## 📄 Licencia

Este código es parte del proyecto BSK Motorcycle Team.
