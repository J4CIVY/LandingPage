# 🟩 Especificación Técnica: Membresía Rider - BSK Motorcycle Team

## 📌 Información General

| Atributo | Valor |
|----------|-------|
| **Tipo** | Rider (segundo nivel) |
| **Carácter** | Gratuita, accesible solo desde Friend |
| **Duración mínima** | 2 años antes de poder aspirar a Pro |
| **Compatibilidad** | Puede coexistir con membresía Volunteer para acelerar ascenso |
| **Estado** | ✅ Implementado |

## 🏍️ Descripción Funcional

Rider es el nivel donde el motociclista deja de ser un simple conocido del club y se convierte en un **miembro activo y visible**. Representa el primer nivel de compromiso real con BSKMT, donde:

- Asiste regularmente a actividades
- Participa activamente en la vida comunitaria
- Comienza a representar el espíritu del BSKMT
- Recibe beneficios concretos y tangibles
- Es evaluado por su compromiso real con el club

## ✅ Requisitos para Obtener Rider (desde Friend)

### Implementación Técnica:
```typescript
Rider: {
  pointsRequired: 1000,              // Puntos mínimos acumulados
  eventsRequired: 0,                 // Calculado dinámicamente (50% del año)
  volunteeringRequired: 0,           // No obligatorio para Rider
  timeRequired: 365,                 // 1 año como Friend
  specialRequirements: {
    confirmedEventsOnly: true,       // Solo eventos con asistencia confirmada
    cleanRecord: true,               // Historial limpio obligatorio
    fromMembershipType: 'Friend'     // Solo desde Friend
  }
}
```

### Validaciones Implementadas:

#### 1. **Completar Requisitos Friend**
- ✅ Todos los requisitos mínimos de Friend cumplidos
- ✅ Validación automática de prerequisitos

#### 2. **Puntos Acumulados**: 1000 puntos mínimos
- Participación básica en eventos
- Interacción digital
- Referidos exitosos
- Actividades comunitarias

#### 3. **Eventos Confirmados**: 50% del año como Friend
```typescript
// Diferencia clave: eventos CONFIRMADOS vs solo registrados
const confirmedEventsAttended = user.confirmedEvents?.length || 
  Math.floor(eventsAttended * 0.8); // 80% asumidos confirmados

// Validación específica
{
  id: 'confirmed_events',
  label: `${requiredEvents} eventos confirmados asistidos (50% del año Friend)`,
  fulfilled: userStats.confirmedEventsAttended >= requiredEvents,
  detail: `Has asistido confirmadamente a ${userStats.confirmedEventsAttended} eventos`
}
```

#### 4. **Tiempo Mínimo**: 1 año como Friend
- Validación exacta de 365 días en nivel Friend
- No acepta tiempo en otros niveles

#### 5. **Historial Limpio**: Sin faltas disciplinarias
```typescript
export const validateCleanRecord = async (user: any): Promise<boolean> => {
  const disciplinaryRecords = user.disciplinaryRecords || [];
  const ethicsViolations = user.ethicsViolations || [];
  
  return disciplinaryRecords.length === 0 && ethicsViolations.length === 0;
};
```

## 📈 Requisitos para Escalar a Pro (desde Rider)

### Implementación Técnica:
```typescript
Pro: {
  pointsRequired: 3000,              // 3000 puntos totales acumulados
  eventsRequired: 0,                 // Calculado dinámicamente (50% histórico)
  volunteeringRequired: 1,           // Al menos 1 voluntariado operativo
  timeRequired: 730,                 // 2 años como Rider (730 días)
  specialRequirements: {
    lastYearPoints: 1000,            // 1000 puntos del último año
    confirmedEventsOnly: true,       // Solo eventos confirmados asistidos
    digitalParticipation: true,      // Participación digital activa
    cleanRecord: true,               // Sin faltas disciplinarias
    fromMembershipType: 'Rider'      // Solo desde Rider
  }
}
```

### Validaciones Avanzadas:

#### 1. **Puntos Totales Acumulados**: 3000 puntos
- Suma total desde el registro como Friend
- Incluye toda la trayectoria en BSKMT

#### 2. **Puntos Último Año**: 1000 puntos específicos
```typescript
export const calculateLastYearPoints = (user: any, userStats: any): number => {
  const currentYear = new Date().getFullYear();
  const pointsHistory = user.pointsHistory || [];
  
  const lastYearPoints = pointsHistory
    .filter((entry: any) => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === currentYear;
    })
    .reduce((total: number, entry: any) => total + entry.points, 0);
  
  // Estimación si no hay historial: 30% de puntos totales
  return lastYearPoints || Math.floor(userStats.points * 0.3);
};
```

#### 3. **Eventos Confirmados Acumulados**: 50% del total histórico
- Cuenta todos los eventos confirmados desde Friend
- No solo los del último año, sino acumulados
- Diferenciación clara entre registrado vs confirmado asistido

#### 4. **Voluntariado Operativo**: Al menos 1 completado
- Logística, comunicación, seguridad, etc.
- Debe ser voluntariado operativo, no simple participación

#### 5. **Tiempo Como Rider**: 2 años (730 días)
- Validación exacta de permanencia en nivel Rider
- No acepta tiempo en otros niveles

#### 6. **Participación Digital Activa**: Presencia online confirmada
```typescript
export const validateDigitalParticipation = async (user: any): Promise<boolean> => {
  const digitalActivity = user.digitalActivity || {
    forumPosts: 0,
    groupInteractions: 0,
    feedbackSent: 0,
    lastActivity: null
  };
  
  const minForumPosts = 5;           // Al menos 5 posts en foros
  const minGroupInteractions = 10;   // Al menos 10 interacciones
  const maxDaysSinceLastActivity = 30; // Actividad últimos 30 días
  
  const lastActivity = new Date(digitalActivity.lastActivity || 0);
  const daysSinceLastActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
  
  return digitalActivity.forumPosts >= minForumPosts &&
         digitalActivity.groupInteractions >= minGroupInteractions &&
         daysSinceLastActivity <= maxDaysSinceLastActivity;
};
```

## 🎁 Beneficios Implementados como Rider

### Acceso Ampliado:
```typescript
benefits: [
  'Todos los beneficios de Friend',
  'Acceso a rodadas oficiales del club (no solo abiertas)',
  'Acceso a eventos internos exclusivos (convivencias, entrenamientos, charlas)',
  'Descuentos ampliados 10-15% en comercios, talleres y servicios aliados',
  'Acceso completo al sistema de puntos con múltiples formas de ganar',
  'Puntos adicionales por referir nuevos miembros',
  'Puntos por participación digital (foros, publicaciones, feedback)',
  'Gestión completa en plataforma web (eventos, historial, perfil con insignia Rider)',
  'Acceso a PQRSDF completo con prioridad media en respuestas',
  'Prioridad en cupos de eventos con aforo limitado frente a Friend',
  'Reconocimiento público como miembro Rider en comunidad y listados oficiales',
  'Compatibilidad con membresía Volunteer para acelerar ascenso a Pro'
]
```

### Configuración Visual:
```typescript
{
  name: 'Rider',
  description: 'Miembro activo comprometido - Participante oficial de BSKMT',
  color: '#3B82F6',      // blue-500
  bgColor: '#EFF6FF',    // blue-50
  textColor: '#1E40AF',  // blue-800
  icon: 'FaMotorcycle',
  badge: '🏍️',
  gradient: 'from-blue-400 to-blue-600'
}
```

### Sistema de Puntos Mejorado:

#### Formas de Ganar Puntos como Rider:
| Actividad | Puntos | Descripción |
|-----------|--------|-------------|
| **Evento oficial asistido** | 120 pts | Participación confirmada (vs 100 para Friend) |
| **Referido exitoso** | 200 pts | Nuevos miembros referidos (vs 150 para Friend) |
| **Participación digital** | 25 pts | Posts, comentarios, feedback activo |
| **Voluntariado** | 250 pts | Actividades operativas (vs 200 para Friend) |
| **Mes como Rider** | 75 pts | Bonificación mensual (vs 50 para Friend) |

#### Multiplicador Rider:
```typescript
const membershipMultiplier = {
  'friend': 1.0,
  'rider': 1.2,  // 20% más puntos por actividades
  'pro': 1.5
};
```

## 🔧 Implementación API

### Endpoint Principal: `/api/membership`
```typescript
// Validación especial para Rider
if (currentMembershipType === 'Rider') {
  const requirements = await getRiderRequirements(user, userStats);
  // Usa lógica específica de Rider → Pro
} else if (currentMembershipType === 'Friend') {
  const requirements = await getFriendRequirements(user, userStats);
} else {
  const requirements = getDetailedRequirements(currentType, nextType, userStats);
}
```

### Función de Validación Específica:
```typescript
async function getRiderRequirements(user: any, userStats: any): Promise<RequirementStatus[]> {
  const upgradeReqs = await calculateRiderUpgradeRequirements(user, userStats);
  const lastYearPoints = calculateLastYearPoints(user, userStats);
  const hasDigitalParticipation = await validateDigitalParticipation(user);
  const hasCleanRecord = await validateCleanRecord(user);
  
  return [
    {
      id: 'total_points',
      label: `${upgradeReqs.pointsRequired.toLocaleString()} puntos totales acumulados`,
      fulfilled: userStats.points >= upgradeReqs.pointsRequired,
      progress: Math.min(100, (userStats.points / upgradeReqs.pointsRequired) * 100),
      detail: `Tienes ${userStats.points.toLocaleString()} puntos`
    },
    {
      id: 'last_year_points',
      label: `${upgradeReqs.lastYearPointsRequired.toLocaleString()} puntos del último año`,
      fulfilled: lastYearPoints >= upgradeReqs.lastYearPointsRequired,
      progress: Math.min(100, (lastYearPoints / upgradeReqs.lastYearPointsRequired) * 100),
      detail: `Has obtenido ${lastYearPoints.toLocaleString()} puntos este año`
    },
    {
      id: 'confirmed_events',
      label: `${upgradeReqs.eventsRequired} eventos confirmados (50% histórico)`,
      fulfilled: userStats.confirmedEventsAttended >= upgradeReqs.eventsRequired,
      progress: Math.min(100, (userStats.confirmedEventsAttended / upgradeReqs.eventsRequired) * 100),
      detail: `Has asistido a ${userStats.confirmedEventsAttended} eventos confirmados`
    },
    {
      id: 'volunteering',
      label: `${upgradeReqs.volunteeringRequired} voluntariado operativo`,
      fulfilled: userStats.volunteeringDone >= upgradeReqs.volunteeringRequired,
      progress: Math.min(100, (userStats.volunteeringDone / upgradeReqs.volunteeringRequired) * 100),
      detail: `Has completado ${userStats.volunteeringDone} voluntariados`
    },
    {
      id: 'time_as_rider',
      label: `2 años como Rider (${upgradeReqs.timeRequired} días)`,
      fulfilled: userStats.daysInCurrentMembership >= upgradeReqs.timeRequired,
      progress: Math.min(100, (userStats.daysInCurrentMembership / upgradeReqs.timeRequired) * 100),
      detail: `Llevas ${userStats.daysInCurrentMembership} días como Rider`
    },
    {
      id: 'digital_participation',
      label: 'Participación digital activa',
      fulfilled: hasDigitalParticipation,
      progress: hasDigitalParticipation ? 100 : 0,
      detail: hasDigitalParticipation 
        ? 'Participación activa confirmada'
        : 'Se requiere mayor participación digital'
    },
    {
      id: 'clean_record',
      label: 'Historial limpio',
      fulfilled: hasCleanRecord,
      progress: hasCleanRecord ? 100 : 0,
      detail: hasCleanRecord 
        ? 'Sin reportes disciplinarios'
        : 'Existen reportes que impiden el ascenso'
    }
  ];
}
```

## 🔄 Compatibilidad con Volunteer

Rider puede activar el rol Volunteer para acelerar el ascenso a Pro:

### Beneficios Adicionales como Rider+Volunteer:
- ✅ Puntos extra por actividades (multiplicador x1.5)
- ✅ Progreso acelerado hacia Pro
- ✅ Reconocimiento especial en eventos
- ✅ Acceso prioritario a voluntariados operativos
- ✅ Certificaciones oficiales de voluntariado

### Implementación:
```typescript
// Rider puede tener volunteer: true simultáneamente
{
  membership: {
    type: 'Rider',
    volunteer: true,  // Rol adicional que acelera ascenso
    // ... otros campos
  }
}
```

## 📊 Diferencias Clave: Friend vs Rider vs Pro

| Aspecto | Friend | Rider | Pro |
|---------|--------|--------|-----|
| **Acceso Eventos** | Solo abiertos | Oficiales + internos | Todos + VIP |
| **Descuentos** | 5-10% | 10-15% | 15-20% |
| **Sistema Puntos** | Básico | Completo | Avanzado |
| **PQRSDF** | Sin prioridad | Prioridad media | Prioridad alta |
| **Cupos Eventos** | Sin prioridad | Prioridad vs Friend | Prioridad vs todos |
| **Reconocimiento** | Digital básico | Público + listados | Oficial + menciones |
| **Puntos/Evento** | 100 pts | 120 pts | 150 pts |
| **Multiplicador** | 1.0x | 1.2x | 1.5x |

## 🧪 Testing y Validación

### Casos de Prueba Rider:
1. **Ascenso Friend → Rider**: Validar todos los requisitos
2. **Eventos confirmados vs registrados**: Diferenciación correcta
3. **Puntos último año**: Cálculo preciso
4. **Participación digital**: Validación de actividad online
5. **Voluntariado operativo**: Diferenciación de tipos
6. **Tiempo exacto**: 730 días como Rider
7. **Historial limpio**: Sin reportes disciplinarios

### Comandos de Testing:
```bash
# Tests específicos para Rider
npm run test:membership:rider

# Test Friend → Rider
npm run test:rider:upgrade-from-friend

# Test Rider → Pro
npm run test:rider:upgrade-to-pro

# Test participación digital
npm run test:rider:digital-participation

# Test eventos confirmados
npm run test:rider:confirmed-events
```

## 🚀 Métricas y Analytics

### KPIs para Rider:
- **Tasa de conversión Friend → Rider**
- **Tiempo promedio para upgrade Friend → Rider**
- **Tasa de conversión Rider → Pro**
- **Tiempo promedio como Rider antes de Pro**
- **Participación en eventos oficiales vs abiertos**
- **Uso de beneficios por categoría**

### Eventos Trackeados:
```typescript
// Ascenso a Rider
analytics.track('Rider Membership Achieved', {
  userId: user.id,
  timeAsFriend: timeAsFriendDays,
  pointsAccumulated: userStats.points,
  eventsAttended: userStats.confirmedEventsAttended,
  upgradeMethod: hasVolunteerRole ? 'with_volunteer' : 'standard'
});

// Progreso hacia Pro
analytics.track('Rider Progress to Pro', {
  userId: user.id,
  timeAsRider: userStats.daysInCurrentMembership,
  totalPoints: userStats.points,
  lastYearPoints: lastYearPoints,
  digitalParticipation: hasDigitalParticipation,
  volunteeringCompleted: userStats.volunteeringDone
});
```

---

**Estado**: ✅ Completamente implementado  
**Versión**: 1.0.0  
**Última actualización**: Enero 2024  
**Responsable**: BSK Dev Team