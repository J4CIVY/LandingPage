# API de BSK Motorcycle Team

Esta es la documentación completa de la API REST para la plataforma de BSK Motorcycle Team.

## 🏁 Inicio Rápido

La API está disponible en: `https://tu-dominio.com/api`

Todas las respuestas siguen el formato estándar:
```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "timestamp": string
}
```

## 🔐 Autenticación

La API utiliza varios métodos de autenticación:
- **API Key**: Para endpoints públicos
- **JWT**: Para endpoints de usuario autenticado
- **Rate Limiting**: 100 solicitudes por minuto por IP

## 📋 Endpoints Principales

### 👥 Usuarios

#### `GET /api/users`
Obtiene todos los usuarios registrados.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "total": 150
  }
}
```

#### `POST /api/users`
Registra un nuevo usuario.

**Body:**
```json
{
  "documentType": "CC",
  "documentNumber": "12345678",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@email.com",
  "phone": "3001234567",
  // ... más campos según compatibleUserSchema
}
```

#### `GET /api/users/{id}`
Obtiene un usuario específico.

#### `PUT /api/users/{id}`
Actualiza un usuario específico.

#### `DELETE /api/users/{id}`
Desactiva un usuario (soft delete).

---

### 🛍️ Productos

#### `GET /api/products`
Obtiene productos con filtros y paginación.

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 100)
- `category`: Filtrar por categoría
- `availability`: `in-stock`, `out-of-stock`, `all` (default: all)
- `search`: Búsqueda en nombre y descripción
- `minPrice`: Precio mínimo
- `maxPrice`: Precio máximo
- `newOnly`: Solo productos nuevos

**Ejemplo:**
```
GET /api/products?page=1&limit=10&category=Cascos&availability=in-stock
```

#### `POST /api/products`
Crea un nuevo producto.

#### `GET /api/products/{id}`
Obtiene un producto específico.

#### `PUT /api/products/{id}`
Actualiza un producto.

#### `DELETE /api/products/{id}`
Elimina un producto.

#### `GET /api/products/featured`
Obtiene productos destacados para la página principal.

**Query Parameters:**
- `limit`: Número de productos (default: 6)

---

### 📅 Eventos

#### `GET /api/events`
Obtiene eventos con filtros y paginación.

**Query Parameters:**
- `page`: Número de página
- `limit`: Elementos por página
- `eventType`: Filtrar por tipo de evento
- `upcoming`: `true` para solo próximos eventos (default: true)
- `search`: Búsqueda en nombre y descripción

#### `POST /api/events`
Crea un nuevo evento.

**Body:**
```json
{
  "name": "Ruta Laguna de Guatavita",
  "startDate": "2025-09-15T08:00:00Z",
  "description": "Ruta panorámica...",
  "mainImage": "https://example.com/image.jpg",
  "eventType": "Ruta",
  "departureLocation": {
    "address": "Estación Terpel Calle 85",
    "city": "Bogotá",
    "country": "Colombia"
  }
}
```

#### `GET /api/events/{id}`
Obtiene un evento específico.

#### `PUT /api/events/{id}`
Actualiza un evento.

#### `DELETE /api/events/{id}`
Elimina un evento (solo si no ha comenzado).

#### `GET /api/events/upcoming`
Obtiene próximos eventos.

---

### 🚨 Emergencias

#### `GET /api/emergencies`
Obtiene emergencias con filtros.

**Query Parameters:**
- `status`: `pending`, `in-progress`, `resolved`, `cancelled`, `all`
- `priority`: `low`, `medium`, `high`, `critical`, `all`
- `emergencyType`: `mechanical`, `medical`, `accident`, `breakdown`, `other`, `all`

#### `POST /api/emergencies`
Reporta una nueva emergencia.

**Body:**
```json
{
  "name": "Juan Pérez",
  "memberId": "BSK123456",
  "emergencyType": "mechanical",
  "description": "Se dañó la cadena de la moto",
  "location": "Autopista Norte Km 15",
  "contactPhone": "3001234567",
  "coordinates": {
    "lat": 4.6243,
    "lng": -74.0636
  },
  "priority": "medium"
}
```

#### `GET /api/emergencies/{id}`
Obtiene una emergencia específica.

#### `PUT /api/emergencies/{id}`
Actualiza el estado de una emergencia.

**Body:**
```json
{
  "status": "in-progress",
  "assignedTo": "Técnico Juan",
  "resolution": "Problema resuelto"
}
```

#### `DELETE /api/emergencies/{id}`
Cancela una emergencia.

#### `GET /api/emergencies/pending`
Obtiene emergencias pendientes ordenadas por prioridad.

---

### 🎫 Membresías

#### `GET /api/memberships`
Obtiene aplicaciones de membresía.

**Query Parameters:**
- `status`: `pending`, `approved`, `rejected`
- `membershipType`: `friend`, `rider`, `rider-duo`, `pro`, `pro-duo`

#### `POST /api/memberships`
Solicita una nueva membresía.

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "phone": "3001234567",
  "membershipType": "rider",
  "message": "Mensaje opcional"
}
```

#### `GET /api/memberships/{id}`
Obtiene una aplicación específica.

#### `PUT /api/memberships/{id}`
Actualiza el estado de una aplicación.

**Body:**
```json
{
  "status": "approved"
}
```

#### `DELETE /api/memberships/{id}`
Rechaza una aplicación.

---

### 📞 Contacto

#### `GET /api/contact`
Obtiene mensajes de contacto.

**Query Parameters:**
- `status`: `new`, `in-progress`, `resolved`, `closed`
- `type`: `general`, `membership`, `technical`, `complaint`, `suggestion`

#### `POST /api/contact`
Envía un mensaje de contacto.

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "phone": "3001234567",
  "subject": "Consulta sobre membresías",
  "message": "Quisiera información sobre...",
  "type": "membership"
}
```

#### `GET /api/contact/{id}`
Obtiene un mensaje específico.

#### `PUT /api/contact/{id}`
Actualiza el estado de un mensaje.

#### `DELETE /api/contact/{id}`
Cierra un mensaje.

---

### 📊 Sistema

#### `GET /api/stats`
Obtiene estadísticas generales del sistema.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "active": 140,
      "byMembership": {...}
    },
    "products": {
      "total": 50,
      "inStock": 45,
      "byCategory": {...}
    },
    "events": {...},
    "emergencies": {...},
    "memberships": {...},
    "contact": {...}
  }
}
```

#### `GET /api/health`
Verifica el estado de salud de la API.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": 3600,
    "database": {
      "status": "connected"
    }
  }
}
```

## 📝 Códigos de Estado HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `405` - Method Not Allowed
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

## 🔄 Paginación

Todas las respuestas paginadas incluyen:

```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## 🛡️ Seguridad

La API implementa múltiples medidas de seguridad:

- **Rate Limiting**: 100 requests/min por IP
- **Input Validation**: Validación estricta con Zod
- **SQL Injection Prevention**: Sanitización de inputs
- **XSS Protection**: Headers de seguridad
- **CORS**: Configuración específica por dominio

## 🐛 Manejo de Errores

Todos los errores siguen el formato:

```json
{
  "success": false,
  "error": "Mensaje de error",
  "timestamp": "2025-08-30T12:00:00Z",
  "details": [...] // Para errores de validación
}
```

## 🔧 Variables de Entorno

```env
# API Configuration
NEXT_PUBLIC_API_KEY=tu-api-key
NEXT_PUBLIC_USE_HMAC=false

# Database (cuando migres a una DB real)
DATABASE_URL=postgresql://...

# Email (para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_USER=noreply@bskmt.com
SMTP_PASS=tu-password
```

## 🚀 Próximas Funcionalidades

- [ ] Autenticación JWT completa
- [ ] Integración con base de datos PostgreSQL
- [ ] Sistema de notificaciones por email
- [ ] Upload de imágenes
- [ ] API de pagos para membresías
- [ ] WebSockets para emergencias en tiempo real
- [ ] Métricas y monitoring avanzado
