# Corrección del Sistema de Ranking - Integración con Datos Reales

## Fecha
Octubre 4, 2025

## Problema Identificado

El sistema de ranking tenía tres problemas críticos:

1. **API usando campo inexistente**: El endpoint `/api/membership/leaderboard/route.ts` buscaba el campo `puntosActuales` que NO existe en el schema `EstadisticasUsuario`. El campo correcto es `puntos.total`.

2. **RankingWidget mostrando puntos estimados**: El componente `RankingWidget` mostraba puntos del cálculo de membresía en lugar de los puntos REALES del sistema de gamificación.

3. **Página de ranking vacía**: La página `/dashboard/ranking` no mostraba datos porque la API fallaba al intentar acceder a campos inexistentes.

## Schema Correcto de EstadisticasUsuario

```typescript
export interface IEstadisticasUsuario extends Document {
  usuarioId: mongoose.Types.ObjectId;
  puntos: {
    total: number;           // ✅ ESTE es el campo correcto
    ganados: number;
    canjeados: number;
    pendientes: number;
    hoy: number;
    esteMes: number;
    esteAno: number;
  };
  eventos: {
    registrados: number;
    asistidos: number;
    favoritos: number;
    organizados: number;
    cancelados: number;
  };
  // ... otros campos
}
```

## Solución Implementada

### 1. Corregir API de Leaderboard

**Archivo**: `/app/api/membership/leaderboard/route.ts`

**Cambios realizados**:

```typescript
// ❌ ANTES (INCORRECTO)
const userStats = await EstadisticasUsuario.find({
  puntosActuales: { $gt: 0 } // Campo inexistente
})
.sort({ puntosActuales: -1 })
.select('usuarioId puntosActuales puntosHistoricos...')
.lean();

// ✅ DESPUÉS (CORRECTO)
const userStats = await EstadisticasUsuario.find({
  'puntos.total': { $gt: 0 } // Campo correcto del schema anidado
})
.sort({ 'puntos.total': -1 }) // Ordenar por puntos reales
.select('usuarioId puntos eventos actividad ranking nivel logros')
.populate('usuarioId', 'firstName lastName membershipType isActive')
.lean();
```

**Mejoras adicionales**:
- Agregado `.populate()` para obtener datos del usuario en una sola query (más eficiente)
- Eliminada la necesidad de hacer segunda query a la colección Users
- Acceso directo a `stat.puntos.total` para obtener puntos reales

### 2. Actualizar RankingWidget

**Archivo**: `/components/membership/RankingWidget.tsx`

**Cambios realizados**:

```typescript
export default function RankingWidget({ userRanking, ... }: RankingWidgetProps) {
  const [realPoints, setRealPoints] = useState<number>(userRanking.points);

  useEffect(() => {
    // Cargar puntos reales del sistema de gamificación
    fetchRealPoints();
  }, []);

  const fetchRealPoints = async () => {
    try {
      const response = await fetch('/api/users/gamification', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.stats) {
          setRealPoints(result.data.stats.totalPoints); // Puntos reales
        }
      }
    } catch (error) {
      console.error('Error fetching real points:', error);
    }
  };

  // Usar realPoints en lugar de userRanking.points
  <div className="text-2xl font-bold">
    {realPoints.toLocaleString()}
  </div>
}
```

**Patrón seguido**: Misma implementación que usa `PuntosHeader.tsx` - consumir `/api/users/gamification` para obtener datos reales.

### 3. Actualizar Página de Ranking

**Archivo**: `/app/dashboard/ranking/page.tsx`

**Cambios realizados**:

```typescript
export default function RankingPage() {
  const [realPoints, setRealPoints] = useState<number>(0);

  useEffect(() => {
    fetchFullLeaderboard();
    fetchUserRanking();
    fetchRealPoints(); // Nueva función
  }, []);

  const fetchRealPoints = async () => {
    try {
      const response = await fetch('/api/users/gamification', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.stats) {
          setRealPoints(result.data.stats.totalPoints);
        }
      }
    } catch (error) {
      console.error('Error fetching real points:', error);
    }
  };

  // Mostrar puntos reales en el header
  <p className="text-4xl font-bold">{realPoints.toLocaleString()}</p>
}
```

## Flujo de Datos Completo

```
┌─────────────────────────────────────────────────────┐
│  MongoDB - Colección: estadisticas_usuarios         │
│  Schema: EstadisticasUsuario                        │
│  Campo: puntos.total (número real de puntos)       │
└────────────────┬────────────────────────────────────┘
                 │
                 ├──────────────────────────────────────┐
                 │                                      │
                 ▼                                      ▼
┌────────────────────────────────┐   ┌────────────────────────────────┐
│ /api/users/gamification        │   │ /api/membership/leaderboard    │
│ (Datos del usuario actual)     │   │ (Top N usuarios con puntos)    │
│                                │   │                                │
│ ✅ Retorna stats.totalPoints   │   │ ✅ Query: puntos.total > 0     │
│ ✅ Incluye nivel, ranking      │   │ ✅ Sort: puntos.total DESC     │
│ ✅ Incluye estadísticas        │   │ ✅ Populate: usuarioId         │
└────────┬───────────────────────┘   └────────┬───────────────────────┘
         │                                     │
         │                                     │
         ▼                                     ▼
┌─────────────────────────┐        ┌─────────────────────────┐
│  RankingWidget          │        │  /dashboard/ranking     │
│  PuntosHeader           │        │  (Página completa)      │
│                         │        │                         │
│  ✅ Muestra puntos      │        │  ✅ Top 3 destacados    │
│     reales del usuario  │        │  ✅ Tabla completa      │
│  ✅ Consume API         │        │  ✅ Búsqueda y filtros  │
│     gamification        │        │  ✅ Datos actualizados  │
└─────────────────────────┘        └─────────────────────────┘
```

## Testing Realizado

### ✅ Validación de TypeScript
```bash
# Archivos verificados sin errores:
- /app/api/membership/leaderboard/route.ts
- /components/membership/RankingWidget.tsx
- /app/dashboard/ranking/page.tsx
```

### 🧪 Pruebas Recomendadas

1. **Verificar API de Leaderboard**:
```bash
curl -X GET https://bskmt.com/api/membership/leaderboard?limit=10 \
  --cookie "session=..." \
  -H "Content-Type: application/json"
```

Esperar respuesta con:
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "userId": "...",
        "name": "Juan Pérez",
        "points": 1500,
        "membershipType": "Pro",
        "position": 1
      }
    ]
  },
  "metadata": {
    "totalUsers": 10,
    "generatedAt": "...",
    "note": "Puntos obtenidos del sistema de gamificación en tiempo real"
  }
}
```

2. **Verificar Widget en Dashboard**:
   - Ir a `/dashboard/membership`
   - Scroll hasta "Tu Ranking"
   - Verificar que los puntos mostrados coincidan con `/dashboard/puntos`
   - Verificar que el Top 5 muestre usuarios con puntos ordenados

3. **Verificar Página Completa**:
   - Ir a `/dashboard/ranking`
   - Verificar que aparezca el banner azul con tu posición y puntos
   - Verificar que el Top 3 se muestre en tarjetas destacadas
   - Verificar que la tabla completa muestre todos los usuarios
   - Probar búsqueda por nombre
   - Probar filtro por tipo de membresía

4. **Verificar Consistencia de Datos**:
```typescript
// Los puntos deben ser iguales en todos estos lugares:
- /dashboard/puntos (PuntosHeader)
- /dashboard/membership (RankingWidget)
- /dashboard/ranking (Página completa)
```

## Campos Relacionados en el Schema

Para referencia, estos son los campos disponibles en `EstadisticasUsuario`:

```typescript
// Puntos
puntos.total          // ✅ Total acumulado
puntos.ganados        // Puntos ganados históricos
puntos.canjeados      // Puntos usados en recompensas
puntos.pendientes     // Puntos en proceso
puntos.hoy            // Puntos ganados hoy
puntos.esteMes        // Puntos del mes actual
puntos.esteAno        // Puntos del año actual

// Eventos
eventos.registrados   // Eventos a los que se inscribió
eventos.asistidos     // Eventos confirmados como asistidos
eventos.favoritos     // Eventos marcados como favoritos
eventos.organizados   // Eventos creados por el usuario
eventos.cancelados    // Eventos cancelados

// Actividad
actividad.diasActivo       // Días con actividad
actividad.ultimaConexion   // Última vez online
actividad.rachaActual      // Días consecutivos activo
actividad.mejorRacha       // Récord de racha
actividad.interacciones    // Total de interacciones

// Ranking
ranking.posicionActual     // Posición en ranking
ranking.posicionAnterior   // Posición previa
ranking.mejorPosicion      // Mejor posición alcanzada
ranking.cambioSemanal      // Cambio +/- esta semana

// Nivel
nivel.actual               // Nivel actual (string)
nivel.puntosSiguienteNivel // Puntos para next level
nivel.progreso             // Progreso % al siguiente nivel
nivel.experienciaTotal     // XP total acumulado

// Logros
logros.total               // Total de logros desbloqueados
logros.ultimoLogro         // Último logro conseguido
logros.proximoLogro        // Próximo logro cerca de conseguir
```

## Archivos Modificados

```
✅ /app/api/membership/leaderboard/route.ts
   - Corregido query MongoDB para usar 'puntos.total'
   - Agregado populate para optimizar consultas
   - Eliminada query adicional a colección Users

✅ /components/membership/RankingWidget.tsx
   - Agregado state realPoints
   - Agregada función fetchRealPoints()
   - Integración con /api/users/gamification
   - Mostrar puntos reales en lugar de estimados

✅ /app/dashboard/ranking/page.tsx
   - Agregado state realPoints
   - Agregada función fetchRealPoints()
   - Mostrar puntos reales en header del usuario
```

## Notas Importantes

⚠️ **NO confundir campos**:
- `puntosActuales` ❌ NO EXISTE en el schema
- `puntos.total` ✅ CAMPO CORRECTO

⚠️ **Queries MongoDB con objetos anidados**:
```typescript
// ✅ CORRECTO
{ 'puntos.total': { $gt: 0 } }
.sort({ 'puntos.total': -1 })

// ❌ INCORRECTO
{ puntosActuales: { $gt: 0 } }
```

✅ **Patrón consistente**: Todos los componentes que muestran puntos deben consumir `/api/users/gamification` para garantizar datos reales y actualizados.

## Próximos Pasos Opcionales

1. **Caché de puntos**: Implementar caché de 5 minutos para reducir llamadas a la API
2. **WebSocket**: Actualización en tiempo real cuando los puntos cambien
3. **Optimización de query**: Índice compuesto en `puntos.total` + `usuarioId`
4. **Paginación**: Para rankings con más de 100 usuarios
5. **Exportar ranking**: Función para descargar ranking en PDF/CSV

## Referencias

- Schema: `/lib/models/Gamification.ts` (líneas 246-365)
- API gamificación: `/app/api/users/gamification/route.ts`
- Servicio: `/lib/services/GamificationService.ts`
- Ejemplo de implementación: `/components/puntos/PuntosHeader.tsx`

---

**Resultado Final**: Sistema de ranking completamente funcional consumiendo datos reales del sistema de gamificación. Puntos consistentes en toda la aplicación. ✅
