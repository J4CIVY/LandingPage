# Manejo de Fechas y Zona Horaria - Formulario de Eventos

## Problema Identificado

El formulario de eventos estaba cambiando las horas cuando se guardaban debido a conversiones automáticas de zona horaria. Colombia está en UTC-5, y al convertir fechas locales a ISO string, se aplicaba esta diferencia automáticamente.

### Ejemplo del Problema
- **Usuario ingresa**: 21 de diciembre de 2025 a las 16:00 (4:00 PM)
- **Se guardaba como**: 21 de diciembre de 2025 a las 21:00 (9:00 PM) UTC
- **Al mostrar nuevamente**: Podía aparecer como 16:00 o 21:00 dependiendo del contexto

## Solución Implementada

### 1. Función `formatDateForInput()`
Convierte fechas ISO de la base de datos a formato `datetime-local` manteniendo la hora colombiana:

```typescript
const formatDateForInput = (isoDate: string): string => {
  if (!isoDate) return '';
  
  const date = new Date(isoDate);
  
  // Ajustar a zona horaria colombiana (UTC-5)
  const colombianOffset = -5 * 60;
  const localOffset = date.getTimezoneOffset();
  const colombianTime = new Date(date.getTime() + (localOffset - colombianOffset) * 60000);
  
  // Formatear como datetime-local (YYYY-MM-DDTHH:mm)
  const year = colombianTime.getFullYear();
  const month = String(colombianTime.getMonth() + 1).padStart(2, '0');
  const day = String(colombianTime.getDate()).padStart(2, '0');
  const hours = String(colombianTime.getHours()).padStart(2, '0');
  const minutes = String(colombianTime.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
```

### 2. Función `processDate()`
Convierte fechas del formulario a formato ISO manteniendo la hora colombiana:

```typescript
const processDate = (dateString: string) => {
  if (!dateString) return dateString;
  
  try {
    if (dateString.includes('T')) {
      // Si tiene formato datetime-local (YYYY-MM-DDTHH:mm)
      if (dateString.length === 16) {
        // Agregar segundos y zona horaria colombiana
        return dateString + ':00.000-05:00';
      }
      // Si no tiene zona horaria, agregar la colombiana
      if (!dateString.includes('+') && !dateString.includes('-') && !dateString.endsWith('Z')) {
        return dateString + '-05:00';
      }
    }
    
    return dateString;
  } catch (error) {
    console.error('Error processing date:', error);
    return dateString;
  }
};
```

## Flujo de Datos

### Creación de Evento
1. **Usuario ingresa**: `2025-12-21T16:00` (4:00 PM)
2. **processDate() convierte**: `2025-12-21T16:00:00.000-05:00`
3. **Se guarda en DB**: Fecha con zona horaria colombiana explícita
4. **Resultado**: La hora se mantiene como 4:00 PM

### Edición de Evento
1. **DB devuelve**: `2025-12-21T21:00:00.000Z` (UTC)
2. **formatDateForInput() convierte**: `2025-12-21T16:00` (hora colombiana)
3. **Usuario ve**: 4:00 PM (hora original)
4. **Al guardar**: Se mantiene como 4:00 PM

## Formatos Manejados

### Input (datetime-local)
- **Formato**: `YYYY-MM-DDTHH:mm`
- **Ejemplo**: `2025-12-21T16:00`

### Output (ISO con zona horaria)
- **Formato**: `YYYY-MM-DDTHH:mm:ss.sss-05:00`
- **Ejemplo**: `2025-12-21T16:00:00.000-05:00`

### Base de Datos
- **Formato**: ISO string (puede ser UTC o con zona horaria)
- **Ejemplo**: `2025-12-21T21:00:00.000Z` o `2025-12-21T16:00:00.000-05:00`

## Debugging

Se agregaron logs detallados para monitorear las conversiones:

```typescript
console.log('🕐 Fechas procesadas:', {
  original: {
    startDate: formData.startDate,
    endDate: formData.endDate,
    registrationDeadline: formData.registrationDeadline
  },
  processed: {
    startDate: cleanedData.startDate,
    endDate: cleanedData.endDate,
    registrationDeadline: cleanedData.registrationDeadline
  }
});
```

## Beneficios

✅ **Hora Consistente**: Las horas se mantienen tal como las ingresa el usuario
✅ **Zona Horaria Explícita**: Se especifica UTC-5 para Colombia
✅ **Compatible con DB**: Funciona con diferentes formatos de fecha en la base de datos
✅ **Debugging**: Logs claros para troubleshooting
✅ **Robusto**: Maneja casos edge y errores

## Casos de Uso

### ✅ Crear Evento Nuevo
- Usuario ingresa: "21 dic 2025, 4:00 PM"
- Se guarda como: "21 dic 2025, 4:00 PM Colombia"

### ✅ Editar Evento Existente
- BD tiene: "21 dic 2025, 9:00 PM UTC"
- Usuario ve: "21 dic 2025, 4:00 PM"
- Al guardar: "21 dic 2025, 4:00 PM Colombia"

### ✅ Diferentes Zonas Horarias
- Funciona correctamente sin importar la zona horaria del navegador del usuario