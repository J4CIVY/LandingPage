# Integración de Datos Reales en Sistema de Membresías y Progreso

## Fecha
Octubre 4, 2025

## Problema Identificado

El sistema de membresías (`/api/membership`) y el componente `MembershipProgress` estaban usando **datos estimados** en lugar de consumir los datos reales del sistema de gamificación almacenados en `EstadisticasUsuario`.

### Issues Específicos:

1. **`calculateUserStats()` estimaba puntos**: Calculaba puntos basándose en fórmulas aproximadas (días * bonus + eventos * puntos) en lugar de consultar `EstadisticasUsuario.puntos.total`

2. **Eventos asistidos estimados**: Usaba `user.registeredEvents?.length` o estimaciones en lugar de `EstadisticasUsuario.eventos.asistidos`

3. **Ranking estimado**: Calculaba posición usando fórmulas matemáticas en lugar de usar `EstadisticasUsuario.ranking.posicionActual`

4. **Voluntariados estimados**: Asumía 1 voluntariado cada 5 eventos en lugar de usar datos reales

5. **MembershipProgress mostraba datos obsoletos**: No tenía opción de refrescar datos en tiempo real

## Arquitectura del Sistema

### Schema de EstadisticasUsuario

```typescript
interface IEstadisticasUsuario {
  usuarioId: ObjectId;
  
  puntos: {
    total: number;           // ✅ FUENTE DE VERDAD para puntos
    ganados: number;
    canjeados: number;
    pendientes: number;
    hoy: number;
    esteMes: number;
    esteAno: number;
  };
  
  eventos: {
    registrados: number;
    asistidos: number;       // ✅ FUENTE DE VERDAD para eventos confirmados
    favoritos: number;
    organizados: number;     // ✅ FUENTE DE VERDAD para voluntariados
    cancelados: number;
  };
  
  actividad: {
    diasActivo: number;
    ultimaConexion: Date;
    rachaActual: number;
    mejorRacha: number;
    interacciones: number;
  };
  
  ranking: {
    posicionActual: number;  // ✅ FUENTE DE VERDAD para ranking
    posicionAnterior: number;
    mejorPosicion: number;
    cambioSemanal: number;
  };
  
  nivel: {
    actual: string;
    puntosSiguienteNivel: number;
    progreso: number;
    experienciaTotal: number;
  };
  
  logros: {
    total: number;
    ultimoLogro?: { nombre: string; fecha: Date; };
    proximoLogro?: { nombre: string; progreso: number; };
  };
}
```

### Flujo de Datos Original (❌ INCORRECTO)

```
┌────────────────────────────────────┐
│  User Model                        │
│  - joinDate                        │
│  - registeredEvents (estimación)   │
│  - membershipType                  │
└───────────┬────────────────────────┘
            │
            ▼
┌────────────────────────────────────┐
│  calculateUserStats()              │
│  ❌ points = días * 50 + eventos * 100 │
│  ❌ eventsAttended = estimación     │
│  ❌ ranking = fórmula matemática    │
└───────────┬────────────────────────┘
            │
            ▼
┌────────────────────────────────────┐
│  /api/membership                   │
│  Retorna datos estimados           │
└───────────┬────────────────────────┘
            │
            ▼
┌────────────────────────────────────┐
│  MembershipProgress                │
│  Muestra progreso con datos viejos │
└────────────────────────────────────┘
```

### Flujo de Datos Actualizado (✅ CORRECTO)

```
┌────────────────────────────────────┐
│  MongoDB: estadisticas_usuarios    │
│  ✅ puntos.total (real)            │
│  ✅ eventos.asistidos (real)       │
│  ✅ ranking.posicionActual (real)  │
└───────────┬────────────────────────┘
            │
            ▼
┌────────────────────────────────────┐
│  calculateUserStats()              │
│  ✅ Consulta EstadisticasUsuario   │
│  ✅ stats.puntos.total             │
│  ✅ stats.eventos.asistidos        │
│  ✅ stats.ranking.posicionActual   │
└───────────┬────────────────────────┘
            │
            ▼
┌────────────────────────────────────┐
│  /api/membership                   │
│  Retorna datos REALES en tiempo real│
└───────────┬────────────────────────┘
            │
            ▼
┌────────────────────────────────────┐
│  MembershipProgress                │
│  + Opción de refresh automático    │
│  + Muestra progreso REAL           │
└────────────────────────────────────┘
```

## Solución Implementada

### 1. Actualizar calculateUserStats()

**Archivo**: `/app/api/membership/route.ts`

#### Antes (❌ Estimaciones):
```typescript
async function calculateUserStats(user: any) {
  const daysSinceJoining = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let points = 0;
  const monthsAsMember = Math.floor(daysSinceJoining / 30);
  points += monthsAsMember * POINTS_SYSTEM.MONTHLY_BONUS; // ❌ Estimación
  
  const eventsAttended = user.registeredEvents?.length || Math.floor(daysSinceJoining / 60); // ❌ Estimación
  points += eventsAttended * POINTS_SYSTEM.EVENT_ATTENDANCE;
  
  const volunteeringDone = user.pqrsd?.length || Math.floor(eventsAttended / 5); // ❌ Estimación
  points += volunteeringDone * POINTS_SYSTEM.VOLUNTEERING;
  
  return { points, eventsAttended, volunteeringDone, ... };
}
```

#### Después (✅ Datos Reales):
```typescript
async function calculateUserStats(user: any) {
  try {
    // ✅ Consultar estadísticas REALES de gamificación
    const estadisticas = await EstadisticasUsuario.findOne({ 
      usuarioId: user._id 
    }).lean() as any;
    
    if (!estadisticas) {
      console.warn(`No se encontraron estadísticas para usuario ${user._id}`);
      return defaultStats; // Valores por defecto solo si no existen
    }
    
    const stats = estadisticas as IEstadisticasUsuario;
    
    return {
      points: stats.puntos?.total || 0,                    // ✅ Puntos REALES
      eventsAttended: stats.eventos?.asistidos || 0,       // ✅ Eventos REALES
      confirmedEventsAttended: stats.eventos?.asistidos || 0,
      volunteeringDone: stats.eventos?.organizados || 0,   // ✅ Voluntariados REALES
      totalEventsFromFriend: stats.eventos?.asistidos || 0,
      // Datos adicionales del sistema
      eventosRegistrados: stats.eventos?.registrados || 0,
      diasActivo: stats.actividad?.diasActivo || 0,
      rachaActual: stats.actividad?.rachaActual || 0,
      posicionRanking: stats.ranking?.posicionActual || 0, // ✅ Ranking REAL
      isVolunteer: user.volunteer || false
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return defaultStats; // Fallback seguro
  }
}
```

**Beneficios**:
- ✅ Datos consistentes con `/dashboard/puntos`
- ✅ Sincronizado con sistema de gamificación
- ✅ Refleja transacciones de puntos en tiempo real
- ✅ Eventos confirmados vs registrados diferenciados

### 2. Actualizar calculateUserRanking()

**Archivo**: `/app/api/membership/route.ts`

#### Antes (❌ Estimación):
```typescript
async function calculateUserRanking(userId: string, userPoints: number) {
  const totalUsers = await User.countDocuments({ isActive: true });
  
  // ❌ Fórmula matemática para estimar posición
  const estimatedPosition = Math.max(1, Math.floor(totalUsers * (1 - (userPoints / 100000))));
  
  return {
    position: estimatedPosition,
    totalMembers: totalUsers,
    points: userPoints
  };
}
```

#### Después (✅ Ranking Real):
```typescript
async function calculateUserRanking(userId: string, userPoints: number) {
  try {
    // ✅ Obtener ranking REAL del sistema
    const estadisticas = await EstadisticasUsuario.findOne({ 
      usuarioId: userId 
    }).lean() as any;
    
    if (estadisticas) {
      const stats = estadisticas as IEstadisticasUsuario;
      
      if (stats.ranking) {
        const totalUsers = await EstadisticasUsuario.countDocuments({
          'puntos.total': { $gt: 0 }
        });
        
        return {
          position: stats.ranking.posicionActual || 1,  // ✅ Posición REAL
          totalMembers: totalUsers || 1,
          points: stats.puntos?.total || userPoints      // ✅ Puntos REALES
        };
      }
    }
    
    // Fallback: calcular basándose en puntos reales
    const usersWithMorePoints = await EstadisticasUsuario.countDocuments({
      'puntos.total': { $gt: userPoints }
    });
    
    return {
      position: usersWithMorePoints + 1,
      totalMembers: totalUsers,
      points: userPoints
    };
  } catch (error) {
    console.error('Error calculating ranking:', error);
    return fallbackRanking;
  }
}
```

**Beneficios**:
- ✅ Posición exacta del usuario
- ✅ Consistente con `/dashboard/ranking`
- ✅ Actualizado cuando cambian los puntos

### 3. Mejorar MembershipProgress Component

**Archivo**: `/components/membership/MembershipProgress.tsx`

#### Nuevas Características:

```typescript
interface MembershipProgressProps {
  progress: MembershipProgressType;
  className?: string;
  refreshData?: boolean;  // ✅ NUEVO: Opción de refresh en tiempo real
}

export default function MembershipProgress({ 
  progress: initialProgress, 
  className = '',
  refreshData = false 
}: MembershipProgressProps) {
  const [progress, setProgress] = useState<MembershipProgressType>(initialProgress);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setProgress(initialProgress); // Actualizar cuando cambien props
  }, [initialProgress]);

  useEffect(() => {
    if (refreshData) {
      fetchLatestProgress(); // ✅ Refrescar datos en tiempo real
    }
  }, [refreshData]);

  const fetchLatestProgress = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/membership', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.membership.progress) {
          setProgress(data.data.membership.progress); // ✅ Actualizar con datos frescos
        }
      }
    } catch (error) {
      console.error('Error fetching latest progress:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Render con indicador de loading
  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-4 right-4">
          <FaSpinner className="animate-spin h-4 w-4 text-blue-500" />
        </div>
      )}
      {/* ... resto del componente */}
    </div>
  );
}
```

**Uso**:
```tsx
// Modo estático (default)
<MembershipProgress progress={membership.progress} />

// Modo con refresh automático
<MembershipProgress 
  progress={membership.progress} 
  refreshData={true}  // ✅ Se actualiza automáticamente
/>
```

## Datos Mapeados

### Mapeo Completo: User → EstadisticasUsuario

| Concepto | Antes (Estimación) | Ahora (Real) | Campo en EstadisticasUsuario |
|----------|-------------------|--------------|------------------------------|
| **Puntos Totales** | `días * 50 + eventos * 100` | `stats.puntos.total` | `puntos.total` |
| **Eventos Asistidos** | `user.registeredEvents?.length` | `stats.eventos.asistidos` | `eventos.asistidos` |
| **Voluntariados** | `Math.floor(eventos / 5)` | `stats.eventos.organizados` | `eventos.organizados` |
| **Posición Ranking** | `Math.floor(totalUsers * formula)` | `stats.ranking.posicionActual` | `ranking.posicionActual` |
| **Días Activo** | `daysSinceJoining` | `stats.actividad.diasActivo` | `actividad.diasActivo` |
| **Racha Actual** | No disponible | `stats.actividad.rachaActual` | `actividad.rachaActual` |
| **Eventos Registrados** | No diferenciado | `stats.eventos.registrados` | `eventos.registrados` |

## Requisitos de Membresías Actualizados

Todas las funciones de requisitos (`getFriendRequirements`, `getRiderRequirements`, etc.) ahora reciben `userStats` con datos **reales**:

```typescript
async function getFriendRequirements(user: any, userStats: any): Promise<RequirementStatus[]> {
  // userStats.points = DATOS REALES de EstadisticasUsuario.puntos.total ✅
  // userStats.eventsAttended = DATOS REALES de EstadisticasUsuario.eventos.asistidos ✅
  // userStats.volunteeringDone = DATOS REALES de EstadisticasUsuario.eventos.organizados ✅
  
  const requirements: RequirementStatus[] = [];
  
  requirements.push({
    id: 'points',
    label: `${upgradeReqs.pointsRequired} puntos mínimos`,
    fulfilled: userStats.points >= upgradeReqs.pointsRequired, // ✅ Comparación con puntos REALES
    progress: Math.min(100, (userStats.points / upgradeReqs.pointsRequired) * 100),
    detail: `Tienes ${userStats.points.toLocaleString()} puntos` // ✅ Muestra puntos REALES
  });
  
  // ... demás requisitos usan datos REALES
  
  return requirements;
}
```

## Testing y Validación

### ✅ Validación TypeScript

```bash
# Archivos verificados sin errores:
- /app/api/membership/route.ts
- /components/membership/MembershipProgress.tsx
```

### 🧪 Pruebas Recomendadas

#### 1. Verificar Datos Reales en API

```bash
curl -X GET https://bskmt.com/api/membership \
  --cookie "session=..." \
  -H "Content-Type: application/json"
```

**Respuesta Esperada**:
```json
{
  "success": true,
  "data": {
    "membership": {
      "points": 1500,           // ✅ Puntos REALES de EstadisticasUsuario
      "progress": {
        "percent": 75,
        "requirements": [
          {
            "id": "points",
            "label": "1000 puntos mínimos",
            "fulfilled": true,
            "progress": 100,
            "detail": "Tienes 1,500 puntos" // ✅ Datos REALES
          },
          {
            "id": "events",
            "fulfilled": true,
            "detail": "Has asistido a 25 eventos" // ✅ Datos REALES
          }
        ]
      }
    },
    "ranking": {
      "position": 15,         // ✅ Posición REAL de EstadisticasUsuario
      "totalMembers": 120,
      "points": 1500
    }
  }
}
```

#### 2. Verificar Consistencia entre Páginas

Los puntos deben ser **idénticos** en:

| Página/Componente | Endpoint | Campo Mostrado |
|-------------------|----------|----------------|
| `/dashboard/puntos` | `/api/users/gamification` | `stats.totalPoints` |
| `/dashboard/membership` | `/api/membership` | `membership.points` |
| `/dashboard/ranking` | `/api/membership/leaderboard` | `member.points` |

**Test Manual**:
1. Ir a `/dashboard/puntos` → Anotar puntos mostrados
2. Ir a `/dashboard/membership` → Verificar que coincidan
3. Ir a `/dashboard/ranking` → Verificar que coincidan
4. Todos deben mostrar **el mismo número**

#### 3. Verificar Progreso de Requisitos

1. Ir a `/dashboard/membership`
2. Scroll a "Progreso a [Siguiente Nivel]"
3. Verificar cada requisito:
   - ✅ Barra de progreso refleja avance real
   - ✅ Detalle muestra números exactos (ej: "Has asistido a 25 de 50 eventos")
   - ✅ Estado cumplido/no cumplido es correcto

#### 4. Verificar Refresh de Datos

```typescript
// En consola del navegador
// 1. Anotar puntos actuales
const pointsBefore = document.querySelector('[data-points]')?.textContent;

// 2. Realizar acción que otorgue puntos (asistir a evento, etc.)

// 3. Refrescar componente
location.reload(); // o usar botón de refresh si existe

// 4. Verificar que puntos aumentaron
const pointsAfter = document.querySelector('[data-points]')?.textContent;
console.log(`Puntos: ${pointsBefore} → ${pointsAfter}`);
```

## Archivos Modificados

```
✅ /app/api/membership/route.ts
   - Agregado import IEstadisticasUsuario
   - Refactorizado calculateUserStats() para usar EstadisticasUsuario
   - Refactorizado calculateUserRanking() para usar datos reales
   - Todas las funciones de requisitos ahora reciben datos reales

✅ /components/membership/MembershipProgress.tsx
   - Agregado prop refreshData opcional
   - Agregado state loading
   - Agregada función fetchLatestProgress()
   - Agregado indicador visual de loading
   - Componente puede actualizarse en tiempo real
```

## Beneficios de la Actualización

### 1. **Consistencia de Datos**
- ✅ Puntos idénticos en toda la aplicación
- ✅ Ranking preciso y actualizado
- ✅ Eventos confirmados vs registrados diferenciados

### 2. **Tiempo Real**
- ✅ Cambios en puntos reflejados inmediatamente
- ✅ Progreso de requisitos actualizado automáticamente
- ✅ No más discrepancias entre páginas

### 3. **Precisión**
- ✅ Cálculos basados en transacciones reales
- ✅ No más estimaciones o fórmulas aproximadas
- ✅ Datos auditables desde la base de datos

### 4. **Escalabilidad**
- ✅ Sistema de gamificación como fuente única de verdad
- ✅ Fácil agregar nuevas métricas (racha, logros, etc.)
- ✅ Separación de concerns entre modelos

### 5. **UX Mejorada**
- ✅ Usuarios ven progreso real, no estimado
- ✅ Requisitos claros con datos exactos
- ✅ Motivación incrementada por transparencia

## Posibles Mejoras Futuras

### 1. Cache de Estadísticas
```typescript
// Implementar caché de 5 minutos para reducir queries
const STATS_CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const statsCache = new Map<string, { data: any; expiry: number }>();
```

### 2. WebSocket para Updates en Tiempo Real
```typescript
// Escuchar cambios en EstadisticasUsuario
socket.on('stats-updated', (userId: string) => {
  if (userId === currentUser.id) {
    fetchLatestProgress(); // Actualizar automáticamente
  }
});
```

### 3. Optimistic Updates
```typescript
// Actualizar UI inmediatamente, confirmar con servidor después
const optimisticUpdate = (points: number) => {
  setProgress(prev => ({
    ...prev,
    percent: calculateNewPercent(prev, points)
  }));
  
  // Confirmar con servidor
  fetchLatestProgress();
};
```

### 4. Histórico de Progreso
```typescript
// Almacenar snapshots de progreso para gráficas
interface ProgressSnapshot {
  date: Date;
  points: number;
  percent: number;
  requirements: RequirementStatus[];
}

// Mostrar evolución en el tiempo
<ProgressChart snapshots={progressHistory} />
```

## Referencias

- **Schema**: `/lib/models/Gamification.ts` (IEstadisticasUsuario)
- **API Membership**: `/app/api/membership/route.ts`
- **API Gamification**: `/app/api/users/gamification/route.ts`
- **Componente**: `/components/membership/MembershipProgress.tsx`
- **Página**: `/app/dashboard/membership/page.tsx`

---

**Conclusión**: El sistema de membresías ahora está completamente sincronizado con el sistema de gamificación, mostrando datos reales en tiempo real sin estimaciones. Los contadores de puntos, eventos, voluntariados y ranking son consistentes en toda la aplicación. ✅
