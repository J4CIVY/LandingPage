# CSRF Frontend Implementation - Applied Changes

## ✅ ARCHIVOS ACTUALIZADOS CON CSRF (Completados)

### 1. Profile & Dashboard Core
- ✅ `app/profile/page.tsx` - 2 funciones (handleSave, handleAvatarChange)
- ✅ `app/dashboard/page.tsx` - Import agregado
- ✅ `app/dashboard/eventos/page.tsx` - 3 funciones (handleDeleteEvent, handleRegisterToEvent, handleUnregisterFromEvent)

### 2. Events Detail Pages
- ✅ `app/events/[id]/page.tsx` - 2 funciones (handleEventRegistration, handleFavoriteToggle)
- ✅ `app/dashboard/events/[id]/page.tsx` - 2 funciones (handleEventRegistration, handleFavoriteToggle)

### 3. Admin Users
- ✅ `app/admin/users/page.tsx` - 5 funciones (handleToggleUserStatus, handleChangeUserRole, handleDeleteUser, handleBulkAction)

### 4. Admin Events
- ✅ `app/admin/events/page.tsx` - 2 funciones (handleToggleEventStatus, handleDeleteEvent)

---

## 🔄 ARCHIVOS PENDIENTES POR ACTUALIZAR

### Priority 1: Admin Operations (Críticos)

#### Admin Products
- `app/admin/products/page.tsx`
  - handleToggleProductStatus (PATCH)
  - handleDeleteProduct (DELETE)
  - handleDuplicateProduct (POST)

- `app/admin/products/[id]/page.tsx`
  - handleSubmit (POST/PUT)

- `app/admin/products/new/page.tsx`
  - handleSubmit (POST)

#### Admin Emergencies
- `app/admin/emergencies/page.tsx`
  - handleResolveEmergency (PATCH)
  - handleDeleteEmergency (DELETE)

- `app/admin/emergencies/new/page.tsx`
  - handleSubmit (POST)

- `app/admin/emergencies/view/[id]/page.tsx`
  - handleUpdateEmergency (PUT)

- `app/admin/emergencies/[id]/page.tsx`
  - handleUpdateEmergency (PUT)

#### Admin Memberships
- `app/admin/memberships/page.tsx`
  - handleApproveApplication (POST)
  - handleRejectApplication (POST)
  - handleBulkAction (POST/PATCH)

- `app/admin/memberships/[id]/page.tsx`
  - handleSubmit (PUT)
  - handleApprove (POST)
  - handleReject (POST)

- `app/admin/memberships/new/page.tsx`
  - handleSubmit (POST)

- `app/admin/memberships/view/[id]/page.tsx`
  - handleApprove (POST)

#### Admin Notifications
- `app/admin/notifications/page.tsx`
  - handleGenerateNotification (POST)
  - handleSendNotification (POST)

#### Admin Membership Plans
- `app/admin/membership-plans/page.tsx`
  - handleSubmit (POST)
  - handleUpdate (PUT)

- `app/admin/membership-plans/new/page.tsx`
  - handleSubmit (POST)

#### Admin Events (Detalles)
- `app/admin/events/[id]/page.tsx`
  - handleSubmit (POST/PUT)

- `app/admin/events/new/page.tsx`
  - handleSubmit (POST)

- `app/admin/events/edit/[id]/page.tsx`
  - handleSubmit (PUT)

- `app/admin/events/view/[id]/page.tsx`
  - handleToggleStatus (PATCH)
  - handleDelete (DELETE)
  - handleMarkAttendance (POST)

- `app/admin/events/attendance/[id]/page.tsx`
  - handleMarkAttendance (POST)
  - handleBulkAttendance (POST)

### Priority 2: Membership Operations

#### Membership Core
- `app/dashboard/membership/page.tsx`
  - handleRenewMembership (POST)
  - handleCancelMembership (POST)

#### Membership Components
- `components/membership/LeaderApplicationPlatform.tsx`
  - handleRequestEndorsement (POST)
  - handleSaveDraft (POST)
  - handleSubmitApplication (POST)

- `components/membership/LeaderApplication.tsx`
  - handleSubmit (POST)

- `components/membership/VolunteerApplicationModal.tsx`
  - handleSubmit (POST)

- `components/membership/VolunteerToggle.tsx`
  - handleToggle (POST)

- `components/membership/UpgradeFlowModal.tsx`
  - handleRequestUpgrade (POST)

### Priority 3: Puntos & Gamification

- `app/dashboard/puntos/page.tsx`
  - handleRedeemReward (POST)

- `components/puntos/AdminPanel.tsx`
  - handleCreateReward (POST)
  - handleAssignPoints (POST)

### Priority 4: Leadership & Voting

- `components/leadership/LeaderDashboard.tsx`
  - handleUpdateDecision (PUT)
  - handleCreateAnnouncement (POST)

- `components/leadership/CreateVotingModal.tsx`
  - handleCreateVoting (POST)

- `components/leadership/VotingSystem.tsx`
  - handleVote (POST)
  - handleControlAction (POST)

### Priority 5: Security Components

- `components/dashboard/security/SessionManagementSection.tsx`
  - handleDeleteSession (DELETE)
  - handleTerminateAllSessions (POST)

- `components/dashboard/security/PrivacyControlSection.tsx`
  - handleUpdatePrivacy (PUT)
  - handleDeleteAccount (DELETE)

- `components/dashboard/security/NotificationPreferencesSection.tsx`
  - handleSavePreferences (PUT)

- `components/dashboard/security/AdvancedSettingsSection.tsx`
  - handleUpdateSecuritySettings (PUT)

### Priority 6: Other Pages

- `app/register/page.tsx`
  - handleSubmit (POST) - ⚠️ **SKIP** - Es pre-autenticación

- `app/dashboard/pqrsdf/nueva/page.tsx`
  - handleSubmit (POST)

- `app/activity/page.tsx`
  - No mutations, solo GET

---

## 📋 PATTERN TO APPLY

### 1. Add import at top:
```typescript
import { getCSRFToken } from '@/lib/csrf-client';
```

### 2. For each POST/PUT/PATCH/DELETE fetch:
```typescript
// Before mutation, add:
const csrfToken = getCSRFToken();

// In fetch headers:
headers: {
  'Content-Type': 'application/json',  // Keep existing
  'x-csrf-token': csrfToken || '',      // Add this
}

// For FormData requests (no Content-Type):
headers: {
  'x-csrf-token': csrfToken || '',
}
```

---

## 🎯 NEXT STEPS

1. ✅ Continue with Admin Products (3 files)
2. ✅ Update Admin Emergencies (4 files)
3. ✅ Update Admin Memberships (4 files)
4. Continue with Membership Operations
5. Update Leadership & Voting components
6. Update Security components
7. Final testing

---

## 📊 PROGRESS TRACKER

**Completed:** 8 files  
**Remaining:** ~50+ files  
**Estimated Time:** 2-3 hours with manual updates

**Backend:** 104/104 endpoints protected ✅  
**Frontend:** 8/~58 files updated (14% complete) 🔄

---

## 🚀 AUTOMATION OPPORTUNITY

Consider creating a custom hook to reduce boilerplate:

```typescript
// hooks/useFetchWithCSRF.ts
import { getCSRFToken } from '@/lib/csrf-client';

export const useFetchWithCSRF = () => {
  const fetchWithCSRF = async (url: string, options: RequestInit = {}) => {
    const csrfToken = getCSRFToken();
    
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        'x-csrf-token': csrfToken || '',
      },
    });
  };

  return { fetchWithCSRF };
};
```

Usage:
```typescript
const { fetchWithCSRF } = useFetchWithCSRF();
const response = await fetchWithCSRF('/api/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

This would reduce remaining work significantly!
