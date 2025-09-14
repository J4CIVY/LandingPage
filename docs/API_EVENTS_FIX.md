# Fix para Error 400 en API de Eventos

## Problema Identificado

El error `400 Bad Request` con el mensaje "Título y fecha de inicio son requeridos" se debía a una inconsistencia entre:

- **Formulario y Modelo**: Usan el campo `name` para el nombre del evento
- **API**: Validaba por el campo `title` (incorrecto)

## Cambios Realizados

### 1. API - `/app/api/events/route.ts`

#### Corrección de Validación Principal
```typescript
// ANTES (incorrecto)
if (!eventData.title || !eventData.startDate) {
  return createErrorResponse('Título y fecha de inicio son requeridos', HTTP_STATUS.BAD_REQUEST);
}

// DESPUÉS (correcto)
if (!eventData.name || !eventData.startDate) {
  return createErrorResponse('Nombre y fecha de inicio son requeridos', HTTP_STATUS.BAD_REQUEST);
}
```

#### Validaciones Mejoradas de Fechas
- Validación de formato de fecha con `isNaN(date.getTime())`
- Margen de 1 hora para evitar problemas de zona horaria
- Validación robusta de fecha de fin

#### Validaciones Adicionales
- Descripción requerida
- Imagen principal requerida
- Tipo de evento requerido
- Información completa del organizador
- Ubicación de salida completa

#### Logging Mejorado
- Logs detallados para debugging
- JSON pretty-print del payload recibido

### 2. Formulario - `/components/eventos/EventoForm.tsx`

#### Procesamiento de Fechas
- Función `processDate()` para normalizar fechas a formato ISO
- Conversión automática a UTC para evitar problemas de zona horaria

#### Validaciones Cliente
- Mantiene las validaciones existentes
- Logging adicional para debugging

## Campos Validados en la API

### Campos Requeridos
- ✅ `name` (nombre del evento)
- ✅ `startDate` (fecha de inicio)
- ✅ `description` (descripción)
- ✅ `mainImage` (imagen principal)
- ✅ `eventType` (tipo de evento)

### Objeto Organizador Requerido
- ✅ `organizer.name`
- ✅ `organizer.phone`
- ✅ `organizer.email`

### Objeto Ubicación de Salida Requerido
- ✅ `departureLocation.address`
- ✅ `departureLocation.city`
- ✅ `departureLocation.country`

### Campos Opcionales con Validación
- `endDate` (debe ser posterior a startDate)
- `registrationDeadline`
- `arrivalLocation`
- `maxParticipants`
- `price`
- `gallery[]`
- `includedServices[]`
- `requirements[]`
- `tags[]`

## Resultado Esperado

Después de estos cambios, el formulario de eventos debería:

1. ✅ Enviar correctamente los datos con el campo `name`
2. ✅ Pasar todas las validaciones de la API
3. ✅ Crear eventos exitosamente
4. ✅ Manejar fechas correctamente
5. ✅ Proporcionar mejor feedback de errores

## Próximos Pasos

1. Probar el formulario creando un nuevo evento
2. Verificar que las imágenes se suban correctamente
3. Confirmar que no hay errores de validación
4. Monitorear logs de la API para cualquier problema adicional

## Archivos Modificados

- ✅ `/app/api/events/route.ts` - Corrección de validaciones
- ✅ `/components/eventos/EventoForm.tsx` - Procesamiento de fechas mejorado