# Sistema de Puntos y Recompensas BSK MT

## 📋 Resumen

El sistema de gamificación permite a los miembros del BSK Motorcycle Team ganar puntos por diferentes actividades y canjearlos por recompensas exclusivas.

## 🏗️ Arquitectura

### Modelos de Datos

- **EstadisticasUsuario**: Estadísticas completas de cada usuario
- **TransaccionPuntos**: Historial de todas las transacciones de puntos
- **Recompensa**: Catálogo de recompensas disponibles
- **CanjeRecompensa**: Registro de canjes realizados

### Servicios

- **GamificationService**: Lógica principal del sistema de puntos
- **APIs**: Endpoints para consultar y actualizar datos

## 🎯 Funcionalidades

### Para Usuarios

1. **Ganar Puntos**:
   - Registro en eventos: 10 puntos
   - Asistencia a eventos: 25 puntos
   - Publicaciones en comunidad: 5 puntos
   - Comentarios: 2 puntos
   - Reacciones recibidas: 1 punto

2. **Sistema de Niveles**:
   - Novato (0 puntos)
   - Principiante (100 puntos)
   - Motociclista (300 puntos)
   - Aventurero (600 puntos)
   - Explorador (1000 puntos)
   - Veterano (1500 puntos)
   - Experto (2500 puntos)
   - Maestro (4000 puntos)
   - Leyenda (6000 puntos)
   - Mito BSK (10000 puntos)

3. **Recompensas Disponibles**:
   - Merchandising oficial
   - Descuentos en servicios
   - Acceso a eventos especiales
   - Contenido digital exclusivo
   - Experiencias únicas

### Para Administradores

1. **Gestión de Puntos**:
   - Otorgar puntos manuales
   - Ver historial de transacciones
   - Monitorear estadísticas del sistema

2. **Gestión de Recompensas**:
   - Crear nuevas recompensas
   - Gestionar inventario
   - Procesar canjes

## 🚀 APIs Disponibles

### Endpoints de Usuario

```http
GET /api/users/gamification
```
Obtiene datos completos de gamificación del usuario autenticado.

```http
GET /api/users/stats
```
Obtiene estadísticas extendidas del usuario.

```http
GET /api/users/points?page=1&limit=10
```
Obtiene resumen de puntos e historial de transacciones.

```http
GET /api/users/leaderboard?limit=20&includeUser=true
```
Obtiene la tabla de clasificación.

```http
POST /api/users/gamification
```
Otorga puntos por una acción específica.

### Endpoints de Administración

```http
POST /api/admin/seed-gamification
```
Pobla datos de ejemplo (solo admin).

```http
POST /api/users/points
```
Otorga puntos manualmente (solo admin).

## 📊 Uso en Componentes

### Dashboard Principal

El `GamificationPanel` se conecta automáticamente a `/api/users/gamification` y muestra:
- Nivel actual y progreso
- Puntos totales y del día/mes
- Ranking y cambios
- Estadísticas de eventos

### Sistema de Puntos Completo

Los componentes en `/components/puntos/` consumen datos reales:
- `EstadisticasRapidas`: Resumen diario y mensual
- `Leaderboard`: Tabla de clasificación
- `HistorialPuntos`: Transacciones del usuario
- `ProgresoNivel`: Progreso hacia el siguiente nivel

## 🛠️ Configuración Inicial

### 1. Migración de Usuarios Existentes

```bash
node scripts/migrate-gamification.mjs
```

Este script:
- Crea estadísticas iniciales para usuarios existentes
- Otorga puntos de bienvenida basados en antigüedad
- Crea recompensas básicas del sistema

### 2. Datos de Ejemplo (Desarrollo)

```bash
curl -X POST http://localhost:3000/api/admin/seed-gamification \
  -H "Content-Type: application/json" \
  -H "Cookie: bsk-access-token=TU_TOKEN_ADMIN"
```

### 3. Variables de Entorno

```env
MONGODB_URI=mongodb://localhost:27017/bsk-landing
JWT_SECRET=tu-secret-key
```

## 📈 Cómo Otorgar Puntos

### Automático (Recomendado)

En el código donde ocurre una acción:

```typescript
import { GamificationService } from '@/lib/services/GamificationService';

// Después de que un usuario se registre a un evento
await GamificationService.otorgarPuntos(
  userId, 
  'registro_evento',
  { eventoId: eventId }
);

// Después de confirmar asistencia
await GamificationService.otorgarPuntos(
  userId,
  'asistencia_evento',
  { eventoId: eventId }
);
```

### Manual (Administradores)

```bash
curl -X POST http://localhost:3000/api/users/points \
  -H "Content-Type: application/json" \
  -H "Cookie: bsk-access-token=TOKEN_ADMIN" \
  -d '{
    "targetUserId": "USER_ID",
    "points": 100,
    "reason": "Bonus especial",
    "action": "bonificacion"
  }'
```

## 🔍 Monitoreo y Estadísticas

### Estadísticas del Sistema

```http
GET /api/admin/seed-gamification
```

Devuelve:
- Total de recompensas disponibles
- Número de usuarios activos
- Top 5 del leaderboard

### Logs y Errores

El sistema registra todas las transacciones y errores en:
- Console logs (desarrollo)
- Base de datos (transacciones)
- API responses (errores)

## 🧪 Testing

### Verificar Funcionalidad

1. **Login como usuario normal**
2. **Ir a Dashboard** → Ver Panel de Estadísticas
3. **Ir a /dashboard/puntos** → Ver sistema completo
4. **Verificar datos reales** vs datos mock

### Verificar APIs

```bash
# Como usuario autenticado
curl -H "Cookie: bsk-access-token=TOKEN" \
  http://localhost:3000/api/users/gamification

# Verificar respuesta con datos reales
```

## 🎨 Personalización

### Agregar Nuevas Acciones de Puntos

En `/lib/services/GamificationService.ts`:

```typescript
export const ACCIONES_PUNTOS: Record<string, AccionPuntos> = {
  // ... acciones existentes
  nueva_accion: {
    tipo: 'nueva_accion',
    puntos: 15,
    descripcion: 'Descripción de la nueva acción'
  }
};
```

### Agregar Nuevos Niveles

```typescript
export const NIVELES = [
  // ... niveles existentes
  { nombre: 'Nuevo Nivel', puntos: 15000, icono: '🌟', color: '#FF6B6B' }
];
```

### Personalizar Componentes

Los componentes son totalmente customizables. Modifica:
- Estilos CSS/Tailwind
- Iconos y colores
- Textos y mensajes
- Layout y estructura

## 📋 TODO / Mejoras Futuras

- [ ] Notificaciones push para nuevos logros
- [ ] Sistema de logros/badges más complejo
- [ ] Integración con redes sociales
- [ ] Eventos especiales con multiplicadores de puntos
- [ ] Sistema de referidos
- [ ] Dashboard de analytics para admins
- [ ] Cache para mejorar performance
- [ ] Tests automatizados

## 🐛 Solución de Problemas

### Error: "No se pudieron cargar las estadísticas"

1. Verificar conexión a MongoDB
2. Verificar token de autenticación
3. Ejecutar migración de usuarios
4. Verificar logs del servidor

### Los puntos no se actualizan

1. Verificar que `GamificationService.actualizarEstadisticasUsuario()` se ejecute
2. Verificar transacciones en la base de datos
3. Limpiar cache del navegador

### Componentes muestran datos mock

1. Verificar que las APIs respondan correctamente
2. Verificar autenticación del usuario
3. Verificar logs de errores en el navegador

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contacta al equipo de desarrollo o crea un issue en el repositorio del proyecto.