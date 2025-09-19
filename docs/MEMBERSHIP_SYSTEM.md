# Sistema de Membresías BSK Motorcycle Team

Documentación completa del nuevo sistema de membresías implementado para la plataforma web de BSK Motorcycle Team.

## 📋 Índice

- [Características Principales](#características-principales)
- [Tipos de Membresía](#tipos-de-membresía)
- [Arquitectura](#arquitectura)
- [API Reference](#api-reference)
- [Componentes UI](#componentes-ui)
- [Instalación y Configuración](#instalación-y-configuración)
- [Migración de Datos](#migración-de-datos)
- [Guía de Desarrollo](#guía-de-desarrollo)

## 🚀 Características Principales

### Sistema de Puntos y Progresión
- **Acumulación de puntos** por participación en eventos, voluntariados y actividades
- **Progresión automática** entre niveles de membresía basada en puntos y requisitos
- **Sistema de logros** para reconocer actividades especiales
- **Ranking comunitario** para fomentar la participación

### Tipos de Membresía Avanzados
- **7 niveles** con beneficios incrementales: Friend, Rider, Pro, Legend, Master, Volunteer, Leader
- **Roles especiales** (Volunteer, Leader) con requisitos y responsabilidades específicas
- **Beneficios personalizados** según el nivel de membresía

### Experiencia de Usuario
- **Dashboard interactivo** con progreso visual y estadísticas
- **Modales de actualización** para cambios de membresía
- **Historial completo** de actividades y cambios
- **Tema oscuro/claro** con diseño responsivo

## 🎯 Tipos de Membresía

### Membresías Estándar

| Tipo | Puntos Requeridos | Beneficios | Descripción |
|------|------------------|------------|-------------|
| **Friend** | 0 | Acceso básico, eventos gratuitos limitados | Nivel de entrada para nuevos miembros |
| **Rider** | 500 | Descuentos en eventos, acceso a talleres | Miembro activo con participación regular |
| **Pro** | 1500 | Equipamiento gratuito, eventos exclusivos | Miembro experimentado con alta participación |
| **Legend** | 3000 | Mentoría, eventos VIP, reconocimiento especial | Miembro veterano con contribuciones significativas |
| **Master** | 5000 | Todos los beneficios, acceso completo | Nivel máximo de membresía estándar |

### Roles Especiales

#### Volunteer
- **Requisitos**: Cualquier nivel de membresía + aplicación voluntaria
- **Beneficios**: Puntos extra por actividades, reconocimiento especial
- **Responsabilidades**: Apoyo en eventos, mentoría a nuevos miembros

#### Leader
- **Requisitos**: Nivel Master + status Volunteer + aplicación aprobada
- **Beneficios**: Acceso administrativo, liderazgo de proyectos
- **Responsabilidades**: Organización de eventos, toma de decisiones

## 🏗️ Arquitectura

### Stack Tecnológico
- **Frontend**: Next.js 15+ con App Router
- **UI**: React 18+ con TypeScript
- **Styling**: Tailwind CSS con tema oscuro/claro
- **Icons**: React Icons
- **Backend**: API Routes de Next.js
- **Base de Datos**: MongoDB Atlas
- **Autenticación**: Sistema existente de BSK

### Estructura de Archivos

```
/dashboard/membership/
├── page.tsx                     # Página principal del dashboard
├── /types/
│   └── membership.ts           # Definiciones TypeScript
├── /data/
│   └── membershipConfig.ts     # Configuración y reglas de negocio
├── /components/membership/
│   ├── MembershipCard.tsx      # Tarjeta de información de membresía
│   ├── MembershipProgress.tsx  # Barra de progreso visual
│   ├── UpgradeFlowModal.tsx    # Modal para actualizaciones
│   ├── VolunteerToggle.tsx     # Control de estatus voluntario
│   ├── LeaderApplication.tsx   # Formulario de aplicación líder
│   ├── AchievementsList.tsx    # Lista de logros obtenidos
│   ├── RankingWidget.tsx       # Widget de ranking comunitario
│   ├── HistoryTable.tsx        # Tabla de historial
│   └── RequirementItem.tsx     # Item individual de requisito
├── /api/membership/
│   ├── route.ts                # GET: Datos de membresía
│   ├── renew/route.ts          # POST: Renovar membresía
│   ├── cancel/route.ts         # POST: Cancelar membresía
│   ├── request-upgrade/route.ts # POST: Solicitar upgrade
│   ├── volunteer-toggle/route.ts # POST: Toggle voluntario
│   ├── apply-leader/route.ts   # POST: Aplicar líder
│   ├── requirements/route.ts   # GET: Requisitos por nivel
│   └── leaderboard/route.ts    # GET: Ranking de miembros
└── /scripts/
    ├── migrate-membership.js   # Script de migración
    └── README.md              # Documentación de migración
```

## 📡 API Reference

### Base URL
```
https://bskmt.com/api/membership
```

### Autenticación
Todos los endpoints requieren autenticación. El token se obtiene del sistema de autenticación existente de BSK.

### Endpoints

#### `GET /api/membership`
Obtiene la información completa de membresía del usuario autenticado.

**Response:**
```typescript
{
  membership: {
    type: MembershipType;
    startDate: string;
    expiryDate: string;
    status: 'active' | 'expired' | 'cancelled';
    points: number;
    benefits: string[];
    progress: {
      nextType: MembershipType | null;
      percent: number;
      requirements: Requirement[];
    };
    history: MembershipHistoryEntry[];
    volunteer: boolean;
    leaderApplication: {
      status: 'none' | 'pending' | 'approved' | 'rejected';
      appliedAt: string | null;
      note: string | null;
    };
  };
  userStats: {
    totalEvents: number;
    totalVolunteerHours: number;
    monthsAsMember: number;
    totalPQRSD: number;
  };
  achievements: Achievement[];
  ranking: {
    position: number;
    total: number;
    percentile: number;
  };
}
```

#### `POST /api/membership/renew`
Renueva la membresía actual del usuario.

**Body:**
```typescript
{
  duration: 6 | 12; // meses
}
```

#### `POST /api/membership/cancel`
Cancela la membresía del usuario.

**Body:**
```typescript
{
  reason: string;
  immediate: boolean;
}
```

#### `POST /api/membership/request-upgrade`
Solicita actualización a un nivel superior.

**Body:**
```typescript
{
  targetType: MembershipType;
  note?: string;
}
```

#### `POST /api/membership/volunteer-toggle`
Cambia el estatus de voluntario del usuario.

**Body:**
```typescript
{
  volunteer: boolean;
  note?: string;
}
```

#### `POST /api/membership/apply-leader`
Envía aplicación para rol de líder.

**Body:**
```typescript
{
  motivation: string;
  experience: string;
  availability: string;
}
```

#### `GET /api/membership/requirements`
Obtiene los requisitos para todos los niveles de membresía.

**Response:**
```typescript
{
  [key in MembershipType]: {
    minPoints: number;
    minMonths: number;
    requirements: Requirement[];
  }
}
```

#### `GET /api/membership/leaderboard`
Obtiene el ranking de miembros por puntos.

**Query Parameters:**
- `limit`: number (default: 50)
- `page`: number (default: 1)

**Response:**
```typescript
{
  members: Array<{
    name: string;
    membershipType: MembershipType;
    points: number;
    position: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

## 🧩 Componentes UI

### MembershipCard
Componente principal que muestra la información de membresía actual.

```tsx
<MembershipCard
  membership={membershipData}
  onUpgrade={() => setShowUpgradeModal(true)}
  onRenew={() => handleRenew()}
/>
```

### MembershipProgress
Barra de progreso visual hacia el siguiente nivel.

```tsx
<MembershipProgress
  currentType="Rider"
  nextType="Pro"
  progress={65}
  currentPoints={825}
  requiredPoints={1500}
/>
```

### UpgradeFlowModal
Modal completo para el proceso de actualización de membresía.

```tsx
<UpgradeFlowModal
  isOpen={showUpgradeModal}
  onClose={() => setShowUpgradeModal(false)}
  currentMembership={membershipData}
  onUpgrade={handleUpgrade}
/>
```

### VolunteerToggle
Control para activar/desactivar estatus de voluntario.

```tsx
<VolunteerToggle
  isVolunteer={membership.volunteer}
  onToggle={handleVolunteerToggle}
  disabled={loading}
/>
```

### LeaderApplication
Formulario de aplicación para rol de líder.

```tsx
<LeaderApplication
  application={membership.leaderApplication}
  onSubmit={handleLeaderApplication}
  canApply={canApplyForLeader}
/>
```

### AchievementsList
Lista de logros obtenidos por el usuario.

```tsx
<AchievementsList
  achievements={achievements}
  showProgress={true}
/>
```

### RankingWidget
Widget que muestra la posición del usuario en el ranking.

```tsx
<RankingWidget
  ranking={ranking}
  onViewFull={() => setShowLeaderboard(true)}
/>
```

### HistoryTable
Tabla con el historial de actividades de membresía.

```tsx
<HistoryTable
  history={membership.history}
  showPagination={true}
  itemsPerPage={10}
/>
```

## ⚙️ Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- MongoDB Atlas
- Variables de entorno configuradas

### Variables de Entorno
```bash
# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/
MONGODB_DB=bsk-membership

# Autenticación (sistema existente)
NEXTAUTH_SECRET=tu-secret-aqui
NEXTAUTH_URL=https://bskmt.com

# Servicios externos (opcionales)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
WHATSAPP_API_KEY=tu-api-key
```

### Instalación
```bash
# Clonar e instalar dependencias
git clone https://github.com/bsk-motorcycle-team/landing-page.git
cd landing-page
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Ejecutar migraciones (primera vez)
node scripts/migrate-membership.js --dry-run
node scripts/migrate-membership.js --execute

# Iniciar desarrollo
npm run dev
```

### Estructura de Base de Datos

#### Extensión del Schema User
```javascript
{
  // Campos existentes preservados
  email: String,
  name: String,
  membershipType: String, // Legacy, mantenido para compatibilidad
  membershipExpiry: Date,
  membershipBenefits: [String],
  registeredEvents: [ObjectId],
  
  // Nuevos campos del sistema de membresías
  membership: {
    type: String, // 'Friend' | 'Rider' | 'Pro' | 'Legend' | 'Master'
    startDate: Date,
    expiryDate: Date,
    status: String, // 'active' | 'expired' | 'cancelled'
    points: Number,
    benefits: [String],
    progress: {
      nextType: String,
      percent: Number,
      requirements: [Object]
    },
    history: [{
      date: Date,
      action: String,
      by: String
    }],
    volunteer: Boolean,
    leaderApplication: {
      status: String, // 'none' | 'pending' | 'approved' | 'rejected'
      appliedAt: Date,
      note: String
    }
  },
  points: Number, // Duplicado para queries rápidas
  
  // Metadatos de migración
  migratedAt: Date,
  migrationVersion: String
}
```

## 🔄 Migración de Datos

### Proceso de Migración

1. **Backup de Seguridad**
   ```bash
   mongodump --uri="$MONGODB_URI" --db=bsk-membership --out=backup/$(date +%Y%m%d_%H%M%S)
   ```

2. **Simulación (Dry Run)**
   ```bash
   node scripts/migrate-membership.js --dry-run
   ```

3. **Migración Real**
   ```bash
   node scripts/migrate-membership.js --execute
   ```

4. **Validación**
   ```bash
   node scripts/migrate-membership.js --validate
   ```

### Mapeo de Datos Legacy

| Campo Legacy | Campo Nuevo | Transformación |
|--------------|-------------|----------------|
| `membershipType` | `membership.type` | Mapeo directo con normalización |
| `membershipExpiry` | `membership.expiryDate` | Preservado tal como está |
| `membershipBenefits` | `membership.benefits` | Preservado tal como está |
| `registeredEvents` | Preservado + usado para calcular puntos | Array preservado |
| N/A | `membership.points` | Calculado basándose en actividad histórica |
| N/A | `membership.history` | Generado basándose en fechas existentes |

### Cálculo de Puntos Históricos

```javascript
// Algoritmo de cálculo de puntos
const calculatePoints = (user) => {
  let points = 0;
  
  // Tiempo como miembro (50 puntos/mes)
  const monthsAsMember = getMonthsFromJoinDate(user.joinDate);
  points += monthsAsMember * 50;
  
  // Eventos registrados (100 puntos/evento)
  points += (user.registeredEvents?.length || 0) * 100;
  
  // PQRSDs enviados (50 puntos/PQRSD)
  points += (user.pqrsd?.length || 0) * 50;
  
  // Multiplicador por tipo de membresía
  const multiplier = getMembershipMultiplier(user.membershipType);
  points *= multiplier;
  
  return Math.max(0, points);
};
```

## 🛠️ Guía de Desarrollo

### Estructura de Componentes

```
components/membership/
├── index.ts              # Exportaciones centralizadas
├── MembershipCard/
│   ├── index.tsx
│   ├── types.ts
│   └── styles.module.css
├── MembershipProgress/
│   ├── index.tsx
│   ├── ProgressBar.tsx
│   └── types.ts
└── ...
```

### Patrones de Código

#### Estado de Loading
```tsx
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await apiCall();
    // Actualizar estado
  } catch (error) {
    // Manejar error
  } finally {
    setLoading(false);
  }
};
```

#### Manejo de Errores
```tsx
const [error, setError] = useState<string | null>(null);

const handleApiCall = async () => {
  try {
    setError(null);
    const result = await fetch('/api/membership');
    if (!result.ok) throw new Error('Error en la API');
    // Procesar resultado
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error desconocido');
  }
};
```

#### Optimistic Updates
```tsx
const [membership, setMembership] = useState(initialMembership);

const handleUpgrade = async (targetType: MembershipType) => {
  // Actualización optimista
  const previousMembership = membership;
  setMembership(prev => ({ ...prev, type: targetType }));
  
  try {
    await fetch('/api/membership/request-upgrade', {
      method: 'POST',
      body: JSON.stringify({ targetType })
    });
  } catch (error) {
    // Revertir en caso de error
    setMembership(previousMembership);
    throw error;
  }
};
```

### Extensión del Sistema

#### Agregar Nuevo Tipo de Membresía
1. Actualizar `MembershipType` en `/types/membership.ts`
2. Agregar configuración en `/data/membershipConfig.ts`
3. Actualizar lógica de validación en APIs
4. Agregar tests correspondientes

#### Agregar Nuevo Beneficio
1. Extender `Benefit` type
2. Actualizar configuración de membresías
3. Modificar UI de beneficios
4. Actualizar documentación

#### Integrar Nueva Fuente de Puntos
1. Identificar actividad que otorga puntos
2. Agregar hook o listener para capturar actividad
3. Implementar endpoint para actualizar puntos
4. Actualizar cálculo de progreso

### Testing

#### Tests Unitarios
```bash
# Ejecutar tests de componentes
npm run test:components

# Tests de API
npm run test:api

# Coverage
npm run test:coverage
```

#### Tests de Integración
```bash
# Test completo del flujo de membresía
npm run test:integration:membership

# Test de migración
npm run test:migration
```

#### Tests E2E
```bash
# Cypress tests
npm run test:e2e

# Playwright tests
npm run test:playwright
```

### Performance

#### Optimizaciones Implementadas
- **Lazy loading** de componentes pesados
- **Memoización** de cálculos complejos
- **Debounce** en inputs de búsqueda
- **Pagination** en listas largas
- **Image optimization** con Next.js

#### Métricas de Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Monitoreo y Analytics

#### Eventos Trackeados
```javascript
// Ejemplo de evento de upgrade
analytics.track('Membership Upgrade Requested', {
  userId: user.id,
  fromType: currentMembership.type,
  toType: targetType,
  userPoints: currentMembership.points,
  timestamp: new Date().toISOString()
});
```

#### Métricas de Negocio
- Tasa de conversión por tipo de membresía
- Tiempo promedio hasta upgrade
- Abandono en flujo de upgrade
- Uso de beneficios por nivel

## 📚 Recursos Adicionales

### Enlaces Útiles
- [Documentación de Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [React Icons](https://react-icons.github.io/react-icons/)

### Contribución
1. Fork del repositorio
2. Crear branch feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Soporte
- **Email**: tech@bskmt.com
- **Discord**: #dev-support
- **Issues**: GitHub Issues

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2024  
**Mantenido por**: BSK Dev Team