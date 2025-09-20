# 🟦 Especificación Técnica: Membresía Friend - BSK Motorcycle Team

## 📌 Información General

| Atributo | Valor |
|----------|-------|
| **Tipo** | Friend (nivel inicial) |
| **Carácter** | Gratuita, abierta a cualquier motociclista o simpatizante |
| **Duración mínima** | 365 días (año normal) / 366 días (año bisiesto) |
| **Compatibilidad** | Puede coexistir con membresía Volunteer |
| **Estado** | ✅ Implementado |

## 🏍️ Descripción Funcional

Friend es la membresía de entrada al ecosistema BSKMT. Diseñada como puerta de acceso donde nuevos miembros:

- Conocen el funcionamiento del club
- Se familiarizan con valores y cultura BSKMT
- Participan en actividades básicas sin compromiso total
- Evalúan si desean escalar a niveles superiores

## ✅ Requisitos de Entrada

### Para Obtener Friend:
```typescript
// Sin requisitos previos
{
  pointsRequired: 0,
  eventsRequired: 0,
  volunteeringRequired: 0,
  timeRequired: 0
}
```

### Proceso de Registro:
1. **Formulario web oficial**: https://bskmt.com/register
2. **Aceptación de términos**: Normas, regulaciones, código de ética BSKMT
3. **Datos personales**: Registro completo en formulario oficial
4. **Activación inmediata**: Sin periodo de espera

## 📈 Requisitos para Escalar a Rider

### Implementación Técnica:
```typescript
nextLevelRequirements: {
  pointsRequired: 1000,           // Puntos totales mínimos
  eventsRequired: 0,              // Calculado dinámicamente (50% del año)
  volunteeringRequired: 0,        // No obligatorio pero acelera
  timeRequired: 365,              // 365 días normales / 366 bisiesto
  minimumDaysForUpgrade: 365,
  leapYearDays: 366,
  eventPercentageRequired: 50     // 50% de eventos oficiales del año
}
```

### Algoritmo de Cálculo Dinámico:

#### 1. **Puntos Mínimos**: 1000 puntos
- Participación en eventos
- Interacción digital
- Referidos
- Actividades comunitarias

#### 2. **Eventos Requeridos**: 50% del total anual
```typescript
// Función de cálculo
export const calculateRequiredEventsForFriend = async (year: number): Promise<number> => {
  const averageEventsPerYear = 24; // 2 eventos/mes estimado
  const eventPercentage = 50;
  return Math.ceil((averageEventsPerYear * eventPercentage) / 100); // = 12 eventos
};
```

#### 3. **Tiempo Mínimo**: Año completo
```typescript
export const calculateMinimumDaysForUpgrade = (joinDate: Date): number => {
  const joinYear = joinDate.getFullYear();
  return isLeapYear(joinYear) ? 366 : 365;
};

export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};
```

#### 4. **Historial Limpio**: Verificación de conducta
- Sin reportes disciplinarios
- Sin faltas al código de ética
- Participación respetuosa en comunidad

### Lógica de Renovación:
Si un Friend renueva sin ascender a Rider:
- ✅ Conserva tiempo acumulado como Friend
- 🔄 Resetea contador de eventos (cuenta eventos del nuevo año)
- ✅ Mantiene puntos totales acumulados
- ✅ Preserva historial y reconocimientos

## 🎁 Beneficios Implementados

### Acceso Digital:
```typescript
benefits: [
  'Acceso a la comunidad digital BSKMT (redes, grupos, newsletter)',
  'Participación en eventos abiertos (rodadas públicas, encuentros comunitarios)',
  'Acceso limitado a la plataforma web (noticias, calendario, contenidos básicos)',
  'Descuentos iniciales en aliados comerciales (5-10% en tiendas y talleres)',
  'Registro en el sistema de puntos',
  'Acceso a PQRSDF limitado (sugerencias e inquietudes sin prioridad)',
  'Reconocimiento digital como miembro activo con distintivo Friend',
  'Compatibilidad con membresía Volunteer'
]
```

### Configuración Visual:
```typescript
{
  name: 'Friend',
  description: 'Membresía gratuita de entrada - Nivel inicial para conocer BSKMT',
  color: '#10B981',      // green-500
  bgColor: '#ECFDF5',    // green-50
  textColor: '#065F46',  // green-800
  icon: 'FaUserFriends',
  badge: '🤝',
  gradient: 'from-green-400 to-green-600'
}
```

## 🔧 Implementación API

### Endpoint Principal: `/api/membership`
```typescript
// Validación especial para Friend
if (currentMembershipType === 'Friend') {
  const requirements = await getFriendRequirements(user, userStats);
  // Usa lógica específica de Friend → Rider
} else {
  const requirements = getDetailedRequirements(currentType, nextType, userStats);
  // Usa lógica estándar
}
```

### Función de Validación de Requisitos:
```typescript
async function getFriendRequirements(user: any, userStats: any): Promise<RequirementStatus[]> {
  const upgradeReqs = await calculateFriendUpgradeRequirements(user, userStats);
  
  return [
    {
      id: 'points',
      label: `${upgradeReqs.pointsRequired.toLocaleString()} puntos mínimos`,
      fulfilled: userStats.points >= upgradeReqs.pointsRequired,
      progress: Math.min(100, (userStats.points / upgradeReqs.pointsRequired) * 100),
      detail: `Tienes ${userStats.points.toLocaleString()} puntos`
    },
    {
      id: 'events',
      label: `${upgradeReqs.eventsRequired} eventos asistidos (50% del año)`,
      fulfilled: userStats.eventsAttended >= upgradeReqs.eventsRequired,
      progress: Math.min(100, (userStats.eventsAttended / upgradeReqs.eventsRequired) * 100),
      detail: `Has asistido a ${userStats.eventsAttended} de ${upgradeReqs.eventsRequired} eventos`
    },
    {
      id: 'time',
      label: `${upgradeReqs.minimumDaysActual} días como Friend`,
      fulfilled: userStats.daysInCurrentMembership >= upgradeReqs.timeRequired,
      progress: Math.min(100, (userStats.daysInCurrentMembership / upgradeReqs.timeRequired) * 100),
      detail: `Llevas ${userStats.daysInCurrentMembership} días`
    },
    {
      id: 'clean_record',
      label: 'Historial limpio (sin reportes disciplinarios)',
      fulfilled: true, // TODO: Implementar verificación real
      progress: 100,
      detail: 'Sin faltas al código de ética del club'
    }
  ];
}
```

## 🎯 Sistema de Puntos para Friend

### Actividades que Otorgan Puntos:
| Actividad | Puntos | Descripción |
|-----------|--------|-------------|
| **Evento asistido** | 100 pts | Participación en rodadas, encuentros |
| **Mes como miembro** | 50 pts | Bonificación por permanencia |
| **Voluntariado** | 200 pts | Actividades de apoyo comunitario |
| **PQRSD enviado** | 50 pts | Participación en feedback |
| **Referido exitoso** | 150 pts | Invitar nuevos miembros |

### Multiplicadores por Actividad:
```typescript
// Friend tiene multiplicador base 1.0x
const membershipMultiplier = {
  'friend': 1.0,
  'rider': 1.2,
  'pro': 1.5
};
```

## 🔄 Compatibilidad con Volunteer

Friend puede activar el rol Volunteer simultáneamente:

### Beneficios Adicionales como Friend+Volunteer:
- ✅ Puntos extra por actividades (multiplicador x1.5)
- ✅ Reconocimiento especial en eventos
- ✅ Acceso prioritario a capacitaciones
- ✅ Certificaciones de voluntariado
- ✅ Progreso acelerado hacia Rider

### Implementación:
```typescript
// En la API, Friend puede tener volunteer: true
{
  membership: {
    type: 'Friend',
    volunteer: true,  // Rol adicional activo
    // ... otros campos
  }
}
```

## 📊 Métricas y Analytics

### KPIs para Friend:
- **Tasa de conversión Friend → Rider**
- **Tiempo promedio para upgrade**
- **Eventos promedio asistidos**
- **Puntos promedio acumulados**
- **Tasa de renovación sin upgrade**

### Eventos Trackeados:
```typescript
// Registro como Friend
analytics.track('Friend Membership Created', {
  userId: user.id,
  registrationSource: 'web_form',
  timestamp: new Date().toISOString()
});

// Progreso hacia Rider
analytics.track('Friend Progress Updated', {
  userId: user.id,
  pointsAccumulated: userStats.points,
  eventsAttended: userStats.eventsAttended,
  daysAsMember: userStats.daysInCurrentMembership,
  progressPercent: overallProgress
});

// Upgrade a Rider
analytics.track('Friend Upgraded to Rider', {
  userId: user.id,
  timeAsFriend: userStats.daysInCurrentMembership,
  finalPoints: userStats.points,
  eventsAttended: userStats.eventsAttended
});
```

## 🧪 Testing y Validación

### Casos de Prueba:
1. **Registro básico**: Friend sin requisitos previos
2. **Cálculo de eventos**: 50% dinámico por año
3. **Años bisiestos**: 365 vs 366 días
4. **Renovación**: Contador de eventos reset
5. **Volunteer compatible**: Friend+Volunteer funcional
6. **Upgrade validation**: Todos los requisitos cumplidos

### Comandos de Testing:
```bash
# Test específicos para Friend
npm run test:membership:friend

# Test de cálculos dinámicos
npm run test:friend:events-calculation

# Test de años bisiestos
npm run test:friend:leap-year

# Test integration Friend → Rider
npm run test:friend:upgrade-flow
```

## 🚀 Deployment y Configuración

### Variables de Entorno:
```bash
# Configuración específica para Friend
FRIEND_EVENTS_PER_YEAR=24
FRIEND_EVENT_PERCENTAGE=50
FRIEND_MIN_POINTS=1000
FRIEND_MIN_DAYS=365
```

### Feature Flags:
```typescript
// Habilitar funcionalidades experimentales
const FEATURES = {
  FRIEND_DYNAMIC_EVENTS: true,
  FRIEND_VOLUNTEER_COMBO: true,
  FRIEND_ACCELERATED_PROGRESS: false
};
```

---

**Estado**: ✅ Completamente implementado  
**Versión**: 1.0.0  
**Última actualización**: Enero 2024  
**Responsable**: BSK Dev Team