# Funcionalidades de Eventos - Estadísticas y Filtros

## ✅ Estadísticas Implementadas

### 📊 Tarjetas de Estadísticas Funcionales

1. **🟢 Próximos Eventos** 
   - **Función**: Cuenta eventos en los próximos 90 días desde la fecha actual
   - **Lógica**: `startDate >= hoy && startDate <= hoy + 90 días`
   - **Color**: Verde (`text-green-600`)

2. **🔵 Registros En Curso**
   - **Función**: Cuenta eventos abiertos para registro
   - **Lógica**: 
     - Evento no ha empezado (`startDate > ahora`)
     - Registro aún abierto (`registrationDeadline > ahora`)
     - No está lleno (`currentParticipants < maxParticipants`)
   - **Color**: Azul (`text-blue-600`)

3. **🟣 Mis Registros**
   - **Función**: Cuenta eventos actuales donde el usuario está registrado
   - **Lógica**: 
     - Usuario está en `event.participants`
     - Evento no ha pasado (`startDate >= ahora`)
   - **Color**: Púrpura (`text-purple-600`)

4. **🟠 Eventos Asistidos**
   - **Función**: Total de eventos que el usuario ha asistido
   - **Lógica**: Usuario está en `event.attendedParticipants`
   - **Color**: Naranja (`text-orange-600`)

5. **⚫ Total de Eventos**
   - **Función**: Total de eventos organizados por el club
   - **Lógica**: `events.length`
   - **Color**: Gris (`text-gray-600`)

## 🔍 Filtros Funcionales

### Filtros Básicos

1. **🔤 Búsqueda por Nombre**
   - Campo de texto que busca en `event.name`
   - Búsqueda insensible a mayúsculas/minúsculas

2. **📋 Tipo de Evento**
   - Dropdown con todos los tipos: Rally, Taller, Charla, Rodada, etc.
   - Opción "Todos los tipos" para mostrar todos

3. **📊 Estado del Evento**
   - **Próximos**: Eventos que aún no han empezado
   - **En curso**: Eventos que están sucediendo ahora
   - **Finalizados**: Eventos que ya terminaron
   - **Todos**: Mostrar todos los estados

4. **📍 Ubicación**
   - Campo de texto que busca en `event.departureLocation.address`
   - Búsqueda insensible a mayúsculas/minúsculas

5. **👤 Mis Eventos**
   - Checkbox que filtra solo eventos donde el usuario está registrado
   - Usa `event.participants.includes(userId)`

### Filtros Avanzados

6. **📅 Fecha Desde/Hasta**
   - Campos de fecha para filtrar por rango de fechas
   - Compara con `event.startDate`

7. **🏔️ Dificultad**
   - Dropdown: Principiante, Intermedio, Avanzado, Experto
   - Filtra por `event.difficulty`

## 🔄 Flujo de Datos

### Cálculo de Estadísticas
```javascript
// Función en /app/dashboard/eventos/page.tsx
const calculateEventStats = () => {
  // Análisis de eventos con fechas y usuarios
  // Retorna objeto con todas las estadísticas
}

// Pasado al componente
<EventosHeader 
  stats={stats}
  loading={loading}
  // ... otros props
/>
```

### Aplicación de Filtros
```javascript
// Función en /app/dashboard/eventos/page.tsx
const filteredEvents = events.filter(event => {
  // Múltiples condiciones de filtrado
  // Cada filtro puede descartar el evento
  return true; // Si pasa todos los filtros
});
```

## 🎯 Estados de Eventos

### Determinación de Estado
```javascript
const getEventDisplayStatus = (event) => {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : startDate;
  
  if (endDate < now) return 'finished';     // Terminado
  if (startDate <= now && endDate >= now) return 'ongoing';  // En curso
  return 'upcoming';  // Próximo
};
```

## 📱 Responsividad

- **Móvil (2 columnas)**: Próximos, Registros | Mis Registros, Asistidos | Total
- **Tablet (5 columnas)**: Todas las estadísticas en una fila
- **Desktop (5 columnas)**: Layout completo optimizado

## 🔄 Actualizaciones Automáticas

- Las estadísticas se recalculan automáticamente cuando:
  - Se cargan los eventos (`useEvents` hook)
  - Cambia la autenticación del usuario
  - Se actualiza la lista de eventos (después de crear/editar/eliminar)

## 🛠️ Componentes Modificados

1. **`/app/dashboard/eventos/page.tsx`**
   - ✅ Función `calculateEventStats()`
   - ✅ Filtros mejorados con todos los criterios
   - ✅ Integración con EventosHeader

2. **`/components/eventos/EventosHeader.tsx`**
   - ✅ Interface actualizada para recibir estadísticas
   - ✅ 5 tarjetas con nombres y colores específicos
   - ✅ Loading states

3. **`/components/eventos/EventosFilter.tsx`**
   - ✅ Ya tenía todos los filtros implementados
   - ✅ Filtros avanzados funcionales

## 🎉 Estado Final

**✅ TODAS LAS FUNCIONALIDADES IMPLEMENTADAS:**

- 📊 Estadísticas funcionales y actualizadas en tiempo real
- 🔍 Filtros completamente operativos
- 📱 Diseño responsivo
- 🔄 Actualizaciones automáticas
- 🎨 UI/UX mejorada con colores específicos

El sistema de eventos ahora está completamente funcional con estadísticas precisas y filtros efectivos!