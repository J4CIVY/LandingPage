# Sistema de Facturación y Pagos - Dashboard

## 📋 Descripción General

Se ha implementado un sistema completo de facturación y pagos en el dashboard de usuarios, que permite a los miembros visualizar su historial de transacciones, filtrar pagos y generar facturas en formato HTML/PDF.

## ✨ Características Implementadas

### 1. **Página Principal de Facturación** (`/dashboard/billing`)
- Vista completa del historial de pagos del usuario
- Estadísticas en tiempo real:
  - Total de pagos realizados
  - Pagos aprobados
  - Pagos pendientes
  - Pagos rechazados
  - Monto total pagado

### 2. **Sistema de Filtros Avanzados**
- **Búsqueda por texto**: Buscar por nombre de evento o ID de orden
- **Filtro por estado**: 
  - Todos
  - Aprobados
  - Pendientes
  - Rechazados
  - Error
  - Cancelados
- **Rango de fechas**: Filtrar desde/hasta una fecha específica
- Opción de limpiar todos los filtros

### 3. **Tabla de Transacciones**
Muestra información detallada de cada pago:
- Fecha de la transacción
- Nombre del evento
- ID de orden (formato Bold)
- Monto y moneda
- Estado visual con badges coloreados
- Acciones disponibles

### 4. **Modal de Detalles**
Vista completa de información de cada transacción:
- ID de Orden
- Evento asociado
- Monto total
- Estado del pago
- Método de pago utilizado
- ID de transacción de Bold
- Fecha de creación
- Botón de descarga de factura (solo para pagos aprobados)

### 5. **Generación de Facturas**
Sistema profesional de generación de facturas:
- Formato HTML completamente estilizado
- Información completa del cliente
- Detalles del evento
- Información de pago y transacción
- Totales y subtotales
- Logo y branding de BSK MT
- Opción de impresión directa
- Diseño responsive y profesional

### 6. **Acceso Rápido**
- Nuevo botón de acceso rápido en el dashboard principal
- Icono: `FaFileInvoiceDollar`
- Color: Morado (`purple-600`)
- Descripción: "Historial de pagos y facturas"

## 🗂️ Estructura de Archivos

```
/workspaces/LandingPage/
├── app/
│   ├── dashboard/
│   │   └── billing/
│   │       └── page.tsx                    # Página principal de facturación
│   └── api/
│       └── bold/
│           └── transactions/
│               ├── user/
│               │   └── route.ts            # API: Obtener transacciones del usuario
│               └── [id]/
│                   └── invoice/
│                       └── route.ts        # API: Generar factura HTML
└── components/
    └── dashboard/
        └── sections/
            └── QuickActions.tsx            # Actualizado con nuevo botón
```

## 🔌 Endpoints de API

### 1. **GET `/api/bold/transactions/user`**
Obtiene todas las transacciones del usuario autenticado.

**Autenticación**: Requerida (JWT Token)

**Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "_id": "65abc123...",
        "userId": "65xyz789...",
        "eventId": "65evt456...",
        "eventName": "Nombre del Evento",
        "orderId": "ORD-20240115-123456",
        "amount": 50000,
        "currency": "COP",
        "status": "APPROVED",
        "paymentMethod": "CARD",
        "transactionId": "TRX-BOLD-789...",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:30Z"
      }
    ]
  }
}
```

**Errores**:
- `401`: No autenticado
- `500`: Error del servidor

### 2. **GET `/api/bold/transactions/[orderId]/invoice`**
Genera una factura en formato HTML para una transacción específica.

**Autenticación**: Requerida (JWT Token)

**Parámetros**:
- `orderId`: ID de la transacción de MongoDB (en la URL) - A pesar del nombre del parámetro, este debe ser el `_id` de MongoDB de la transacción

**Validaciones**:
- La transacción debe existir
- La transacción debe pertenecer al usuario autenticado
- La transacción debe tener estado `APPROVED`

**Respuesta exitosa** (200):
Retorna HTML completo de la factura con estilos CSS inline.

**Headers**:
```
Content-Type: text/html; charset=utf-8
Content-Disposition: inline; filename="factura-{orderId}.html"
```

**Errores**:
- `400`: Solo se pueden generar facturas de pagos aprobados
- `401`: No autenticado
- `403`: No autorizado (transacción no pertenece al usuario)
- `404`: Transacción o usuario no encontrado
- `500`: Error del servidor

## 💾 Modelos de Datos

### BoldTransaction
```typescript
{
  _id: ObjectId,
  userId: ObjectId,           // Referencia a User
  eventId?: ObjectId,         // Referencia a Event (opcional)
  orderId: string,            // ID único de orden
  amount: number,             // Monto en centavos
  currency: string,           // "COP", "USD", etc.
  status: TransactionStatus,  // PENDING, APPROVED, DECLINED, ERROR, CANCELLED
  paymentMethod?: string,     // Método de pago utilizado
  transactionId?: string,     // ID de transacción de Bold
  createdAt: Date,
  updatedAt: Date
}
```

### Event
```typescript
{
  _id: ObjectId,
  nombre: string,
  descripcion: string,
  fecha: Date,
  ubicacion: string,
  precio: number,
  // ... otros campos
}
```

## 🎨 Componentes UI

### Estados de Pago (Badges)
```typescript
const statusBadges = {
  APPROVED: {
    icon: <FaCheckCircle />,
    text: 'Aprobado',
    color: 'green'
  },
  PENDING: {
    icon: <FaClock />,
    text: 'Pendiente',
    color: 'yellow'
  },
  DECLINED: {
    icon: <FaTimesCircle />,
    text: 'Rechazado',
    color: 'red'
  },
  ERROR: {
    icon: <FaExclamationTriangle />,
    text: 'Error',
    color: 'red'
  },
  CANCELLED: {
    icon: <FaTimesCircle />,
    text: 'Cancelado',
    color: 'gray'
  }
};
```

### Estadísticas del Dashboard
Cinco tarjetas principales que muestran:
1. **Total Pagos**: Cuenta total de transacciones
2. **Aprobados**: Transacciones con estado APPROVED
3. **Pendientes**: Transacciones con estado PENDING
4. **Rechazados**: Transacciones DECLINED o ERROR
5. **Monto Total**: Suma de todos los pagos aprobados

## 🔒 Seguridad

### Autenticación
- Todos los endpoints requieren autenticación vía JWT
- Se valida el token en cada request
- Las transacciones solo pueden ser accedidas por su propietario

### Autorización
- Verificación de ownership de transacciones
- Solo el usuario propietario puede ver sus pagos
- Solo se generan facturas de pagos aprobados

### Validación de Datos
- Validación de IDs de transacción
- Verificación de estados de pago
- Validación de fechas en filtros

## 🎯 Flujo de Usuario

1. **Acceso al Sistema**
   ```
   Dashboard → Click "Facturación y Pagos" → Página de Billing
   ```

2. **Visualización de Historial**
   - El sistema carga automáticamente todas las transacciones
   - Se muestran estadísticas agregadas
   - Tabla ordenada por fecha descendente

3. **Filtrado de Transacciones**
   - Usuario aplica filtros deseados
   - Sistema actualiza la vista en tiempo real
   - Opción de limpiar todos los filtros

4. **Ver Detalles**
   - Click en icono de ojo (👁️)
   - Se abre modal con información completa
   - Opción de descargar factura desde el modal

5. **Descargar Factura**
   - Click en icono de descarga (📥)
   - Sistema genera HTML de factura
   - Abre en nueva pestaña o descarga
   - Usuario puede imprimir desde el navegador

## 📱 Responsive Design

- **Desktop**: Vista de tabla completa con todas las columnas
- **Tablet**: Columnas se ajustan automáticamente
- **Mobile**: Diseño adaptativo con scroll horizontal si es necesario
- **Factura**: Se adapta a cualquier tamaño de pantalla e impresión

## 🚀 Mejoras Futuras Sugeridas

### Corto Plazo
- [ ] Generación real de PDF usando `puppeteer` o `jsPDF`
- [ ] Descarga automática de PDF en lugar de HTML
- [ ] Envío de factura por email
- [ ] Paginación para historial extenso

### Mediano Plazo
- [ ] Exportar historial a Excel/CSV
- [ ] Gráficos de gastos por mes/año
- [ ] Comparativas de gastos
- [ ] Notificaciones de nuevas transacciones

### Largo Plazo
- [ ] Sistema de facturación electrónica (DIAN)
- [ ] Integración con software contable
- [ ] Reportes fiscales automáticos
- [ ] Suscripciones y pagos recurrentes

## 🧪 Testing

### Casos de Prueba
1. Usuario autenticado puede ver sus transacciones
2. Usuario no puede ver transacciones de otros
3. Filtros funcionan correctamente
4. Solo pagos aprobados generan facturas
5. Factura incluye toda la información requerida
6. Sistema maneja errores gracefully

### Endpoints a Probar
```bash
# Obtener transacciones del usuario
curl -X GET https://bskmt.com/api/bold/transactions/user \
  -H "Cookie: bsk-access-token=YOUR_TOKEN"

# Generar factura
curl -X GET https://bskmt.com/api/bold/transactions/TRANSACTION_ID/invoice \
  -H "Cookie: bsk-access-token=YOUR_TOKEN"
```

## 📝 Notas Técnicas

### Dependencias Utilizadas
- **React Icons**: `FaFileInvoiceDollar`, `FaCheckCircle`, `FaClock`, etc.
- **Next.js App Router**: Para rutas y API routes
- **MongoDB + Mongoose**: Base de datos y modelos
- **Tailwind CSS**: Estilos y dark mode

### Consideraciones de Rendimiento
- Las transacciones se cargan una sola vez al montar el componente
- Filtros se aplican en el cliente para respuesta instantánea
- Uso de `.lean()` en queries de Mongoose para mejor performance
- Paginación futura recomendada para usuarios con muchas transacciones

### Dark Mode
- Todos los componentes soportan modo oscuro
- Clases de Tailwind: `dark:bg-slate-900`, `dark:text-slate-100`, etc.
- Factura HTML no incluye dark mode (diseñada para impresión)

## 🤝 Integración con Bold

El sistema se integra completamente con el gateway de pagos Bold:
- Lee transacciones de la colección `BoldTransaction`
- Mantiene sincronización con estados de pago
- Utiliza `orderId` y `transactionId` de Bold
- Soporta múltiples métodos de pago

## 📞 Soporte

Para cualquier problema o consulta sobre el sistema de facturación:
- Email: dev@bskmt.com
- Documentación técnica: Este archivo
- Logs del sistema: `/var/log/bskmt/billing.log`

---

**Última actualización**: 2024
**Versión**: 1.0.0
**Autor**: Equipo de Desarrollo BSK MT
