# Sistema de Gamificación por Asistencia a Eventos

## Descripción
Sistema que otorga automáticamente puntos a los usuarios cuando se confirma su asistencia a eventos. Los puntos solo se otorgan si se confirma la asistencia y el evento tiene configurados puntos para otorgar.

## Funcionamiento

### 1. Otorgamiento de Puntos
- **Cuando**: Se ejecuta cuando un administrador marca a un participante como "presente" en un evento
- **Condición**: El evento debe tener `pointsAwarded` > 0
- **Prevención de duplicados**: Verifica que no se hayan otorgado puntos previamente por el mismo evento
- **Registro**: Crea una transacción de tipo "ganancia" en la tabla de gamificación

### 2. Revocación de Puntos
- **Cuando**: Se ejecuta cuando un administrador desmarca la asistencia de un participante
- **Acción**: Desactiva la transacción original y crea una transacción de "penalización"
- **Resultado**: Los puntos se restan del total del usuario

## Archivos Modificados

### `/lib/gamification-utils.ts` (NUEVO)
Funciones utilitarias para el manejo de puntos:
- `otorgarPuntosPorAsistencia()`: Otorga puntos por asistencia confirmada
- `revocarPuntosPorAsistencia()`: Revoca puntos por cancelación de asistencia
- `obtenerPuntosTotales()`: Calcula el total de puntos de un usuario

### `/app/api/admin/events/[id]/attendance/route.ts` (MODIFICADO)
- Integración de las funciones de gamificación en los endpoints de asistencia
- Otorgamiento automático de puntos al marcar asistencia
- Revocación automática de puntos al desmarcar asistencia

### `/lib/models/Event.ts` (MODIFICADO)
- Agregado campo `pointsAwarded?: number` al esquema de eventos

## Flujo de Trabajo

### Marcar Asistencia
1. Admin accede a la página de control de asistencia del evento
2. Admin marca a un participante como "presente"
3. Sistema actualiza `attendedParticipants` en el evento
4. Sistema actualiza `attendedEvents` en el usuario
5. **Sistema verifica si el evento otorga puntos**
6. **Sistema otorga puntos automáticamente si aplica**

### Desmarcar Asistencia
1. Admin desmarca la asistencia de un participante
2. Sistema remueve de `attendedParticipants` y `attendedEvents`
3. **Sistema revoca los puntos previamente otorgados**

## Estructura de Datos

### Transacción de Puntos por Asistencia
```typescript
{
  usuarioId: ObjectId,
  tipo: 'ganancia',
  cantidad: event.pointsAwarded,
  razon: 'Asistencia a evento',
  metadata: {
    eventoId: ObjectId,
    accionTipo: 'asistencia_evento',
    detalles: 'Asistencia confirmada al evento: [nombre del evento]'
  },
  fechaTransaccion: Date,
  activo: true
}
```

### Transacción de Penalización (al revocar)
```typescript
{
  usuarioId: ObjectId,
  tipo: 'penalizacion',
  cantidad: [cantidad original],
  razon: 'Cancelación de asistencia a evento',
  metadata: {
    eventoId: ObjectId,
    accionTipo: 'cancelacion_asistencia_evento',
    detalles: 'Cancelación de asistencia confirmada - reversión de puntos',
    transaccionOriginalId: ObjectId
  },
  fechaTransaccion: Date,
  activo: true
}
```

## Prevención de Duplicados

El sistema incluye múltiples capas de prevención de duplicados:

1. **Verificación por consulta**: Busca transacciones existentes antes de crear nuevas
2. **Filtros específicos**: Usa `usuarioId`, `eventoId`, `tipo`, y `razon` para identificar duplicados
3. **Estado activo**: Solo considera transacciones activas para evitar conflictos

## Manejo de Errores

- Los errores en el sistema de puntos no fallan la operación principal de asistencia
- Se registran logs detallados para debugging
- Las operaciones de asistencia continúan funcionando aunque falle el otorgamiento de puntos

## Configuración de Eventos

Para que un evento otorgue puntos:
1. Ir a la administración de eventos
2. Crear o editar un evento
3. Configurar el campo "Puntos que otorga" con un valor > 0
4. Guardar el evento

## Verificación del Sistema

El sistema incluye funciones de prueba en `/lib/test-gamification.ts` para verificar:
- Otorgamiento correcto de puntos
- Prevención de duplicados
- Revocación de puntos
- Cálculo de totales

## Páginas de Administración

### Control de Asistencia
- **URL**: `/admin/events/attendance/[id]`
- **Función**: Página dedicada para marcar/desmarcar asistencia masivamente
- **Puntos**: Se otorgan automáticamente al marcar presente

### Vista Detallada de Evento
- **URL**: `/admin/events/view/[id]`
- **Función**: Vista rápida con opción de marcar asistencia individual
- **Puntos**: Se otorgan automáticamente al marcar presente

## Log de Actividades

Todas las transacciones de puntos se registran con:
- Timestamp exacto
- Usuario que recibió/perdió puntos
- Evento asociado
- Cantidad de puntos
- Razón de la transacción
- Metadatos adicionales para auditoría

## Impacto en el Usuario

Los usuarios verán los puntos reflejados en:
- Su dashboard de puntos
- Historial de transacciones de gamificación
- Balance total de puntos disponibles para canje