# Script de Migración Masiva - Componentes Restantes

## ⚠️ IMPORTANTE

Quedan aproximadamente **40 componentes** por migrar que aún usan `fetch('/api/...')`.

### Patrón de Migración

Para cada componente, aplicar:

1. **Agregar import**:
```typescript
import apiClient from '@/lib/api-client';
```

2. **Reemplazar fetch()**:

**ANTES:**
```typescript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
const result = await response.json();
```

**DESPUÉS:**
```typescript
// NestJS: POST /endpoint
const result = await apiClient.post<ResponseType>('/endpoint', data);
```

### Mapeo de Endpoints

| Old API Route | New NestJS Endpoint | Método |
|--------------|---------------------|--------|
| `/api/users/points` | `/users/gamification` | GET |
| `/api/users/leaderboard` | `/memberships/leaderboard` | GET |
| `/api/users/achievements` | `/users/gamification` | GET |
| `/api/users/history` | `/users/activity` | GET |
| `/api/users/activity` | `/users/activity` | GET |
| `/api/admin/gamification/stats` | `/admin/gamification/stats` | GET |
| `/api/rewards` | `/community/rewards` | GET |
| `/api/admin/gamification/rewards` | `/admin/rewards` | POST |
| `/api/admin/gamification/assign-points` | `/admin/assign-points` | POST |
| `/api/membership/*` | `/memberships/*` | * |
| `/api/comunidad/*` | `/community/*` | * |
| `/api/leadership/*` | `/leadership/*` | * |
| `/api/user/sessions` | `/users/sessions` | GET |
| `/api/user/preferences` | `/users/preferences` | GET/PUT |
| `/api/user/privacy` | `/users/privacy` | GET/PUT |
| `/api/auth/change-password` | `/auth/change-password` | POST |
| `/api/auth/2fa/*` | `/auth/2fa/*` | * |
| `/api/health/*` | `/health/*` | GET |
| `/api/events` | `/events` | GET/POST |

### Componentes Pendientes

#### Puntos (6 archivos) ❌
- [ ] `components/puntos/ResumenSemanal.tsx`
- [ ] `components/puntos/Leaderboard.tsx`
- [ ] `components/puntos/LogrosUsuario.tsx`
- [ ] `components/puntos/AdminPanel.tsx`
- [ ] `components/puntos/EstadisticasRapidas.tsx`

#### Membership (10 archivos) ❌
- [ ] `components/membership/LeaderApplication.tsx`
- [ ] `components/membership/LeaderRequirements.tsx`
- [ ] `components/membership/MembershipProgress.tsx`
- [ ] `components/membership/RankingWidget.tsx`
- [ ] `components/membership/UpgradeFlowModal.tsx`
- [ ] `components/membership/VolunteerApplicationModal.tsx`
- [ ] `components/membership/LeaderApplicationPlatform.tsx`
- [ ] `components/membership/VolunteerToggle.tsx`

#### Leadership (2 archivos) ❌
- [ ] `components/leadership/LeaderDashboard.tsx`
- [ ] `components/leadership/CreateVotingModal.tsx`

#### Comunidad (7 archivos) ❌
- [ ] `components/comunidad/Normas.tsx`
- [ ] `components/comunidad/PublicacionCard.tsx`
- [ ] `components/comunidad/Ranking.tsx`
- [ ] `components/comunidad/PublicacionForm.tsx`
- [ ] `components/comunidad/ComunidadHeader.tsx`
- [ ] `components/comunidad/Comentarios.tsx`
- [ ] `components/comunidad/ChatComunidad.tsx`

#### Dashboard/Security (8 archivos) ❌
- [ ] `components/dashboard/security/SessionManagementSection.tsx`
- [ ] `components/dashboard/security/PasswordChangeSection.tsx`
- [ ] `components/dashboard/security/PrivacyControlSection.tsx`
- [ ] `components/dashboard/security/NotificationPreferencesSection.tsx`
- [ ] `components/dashboard/security/AdvancedSettingsSection.tsx`
- [ ] `components/dashboard/sections/GamificationPanel.tsx`

#### Admin (3 archivos) ❌
- [ ] `components/admin/SystemHealthDashboard.tsx`
- [ ] `components/auth/TwoFactorVerification.tsx`

### Instrucciones Rápidas

Para migrar manualmente cada componente:

```bash
# 1. Abrir componente
# 2. Buscar: import { useState
# 3. Agregar después: import apiClient from '@/lib/api-client';
# 4. Buscar: fetch('/api/
# 5. Reemplazar por: apiClient.METHOD('/endpoint'
# 6. Ajustar manejo de respuesta (ya no necesita .json())
# 7. Guardar y verificar errores
```

### Comando para Verificar Progreso

```bash
cd Frontend
grep -r "fetch('/api/" components/ | wc -l
```

Si el resultado es 0, la migración está completa.

---

**Estado:** 22/62 componentes migrados (35%)
**Restantes:** 40 componentes
**Tiempo estimado:** ~2-3 horas trabajo manual
