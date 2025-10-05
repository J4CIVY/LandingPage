# Sistema de Detección de Inactividad

## 📋 Resumen

Implementación de un sistema de detección de inactividad similar al de **Microsoft** y **Google**, que muestra advertencias cuando el usuario permanece inactivo durante el proceso de login.

**Versión**: 2.3.0  
**Fecha**: Octubre 5, 2025  
**Inspirado en**: Microsoft Azure AD, Google Accounts

---

## 🎯 Objetivos

### Experiencia de Usuario
- ✅ Guiar al usuario cuando está inactivo
- ✅ Dar opciones claras de qué hacer
- ✅ Evitar frustración por sesiones expiradas sin aviso
- ✅ Proporcionar ayuda contextual

### Seguridad
- 🔒 Reducir ventana de ataque por sesiones abandonadas
- 🔒 Limpiar tokens no utilizados automáticamente
- 🔒 Prevenir ataques de timing

---

## 🏗️ Arquitectura

### Componentes Principales

```
┌─────────────────────────────────────────────────┐
│           useInactivityTimer (Hook)             │
│  - Gestión de timers                            │
│  - Detección de eventos                         │
│  - Callbacks configurables                      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│      Step2Password / TwoFactorWithTimer         │
│  - Integración del timer                        │
│  - Reset automático en actividad                │
│  - Pausa durante operaciones                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│         InactivityWarning (Componente)          │
│  - Pantalla de advertencia                      │
│  - Opciones de recuperación                     │
│  - Countdown visible                            │
└─────────────────────────────────────────────────┘
```

---

## 📦 Componentes

### 1. Hook: `useInactivityTimer`

**Ubicación**: `/hooks/useInactivityTimer.ts`

**Propósito**: Gestionar timers de inactividad con advertencias progresivas.

#### Parámetros

```typescript
interface UseInactivityTimerOptions {
  timeout: number;        // Tiempo total en ms (ej: 90000 = 90s)
  onTimeout: () => void;  // Callback al expirar
  warningTime?: number;   // Tiempo antes para advertir (ej: 15000 = 15s)
}
```

#### Retorna

```typescript
interface UseInactivityTimerReturn {
  timeRemaining: number;  // Tiempo restante en ms
  showWarning: boolean;   // Si debe mostrar advertencia
  resetTimer: () => void; // Resetear el timer
  pauseTimer: () => void; // Pausar el timer
  resumeTimer: () => void; // Reanudar el timer
}
```

#### Ejemplo de Uso

```typescript
const { timeRemaining, showWarning, resetTimer } = useInactivityTimer({
  timeout: 90000,        // 90 segundos
  warningTime: 15000,    // Advertir a los 15s restantes
  onTimeout: () => {
    setShowInactivityWarning(true);
  }
});

// Resetear cuando el usuario escribe
useEffect(() => {
  if (password.length > 0) {
    resetTimer();
  }
}, [password, resetTimer]);
```

---

### 2. Componente: `InactivityWarning`

**Ubicación**: `/components/auth/InactivityWarning.tsx`

**Propósito**: Mostrar pantalla de advertencia de inactividad con opciones de recuperación.

#### Props

```typescript
interface InactivityWarningProps {
  email?: string;                    // Email del usuario
  step: 'password' | '2fa';         // Paso actual
  timeRemaining: number;             // Tiempo antes de expirar (ms)
  onRetry: () => void;              // Botón "Reintentar"
  onCancel: () => void;             // Botón "Cancelar"
  retryText?: string;               // Texto personalizado botón
  cancelText?: string;              // Texto personalizado cancelar
  alternativeOptions?: ReactNode;   // Opciones adicionales
}
```

#### Diseño

El componente adapta su mensaje según el paso:

**Paso 2 (Contraseña)**:
- Título: "No hemos recibido tu contraseña"
- Descripción: "Has estado inactivo por un tiempo..."
- Icono: ⚠️ (Amarillo)
- Opciones: Reintentar, Recuperar contraseña, Volver

**Paso 3 (2FA)**:
- Título: "No hemos recibido el código"
- Descripción: "Hemos enviado un código, pero no lo hemos recibido a tiempo..."
- Icono: ⏰ (Naranja)
- Opciones: Reenviar código, Ayuda por WhatsApp, Continuar esperando

---

### 3. Componente: `Step2Password` (Actualizado)

**Ubicación**: `/components/auth/Step2Password.tsx`

**Cambios**:
- ✅ Integra `useInactivityTimer`
- ✅ Timer de 90 segundos
- ✅ Advertencia a los 15 segundos restantes
- ✅ Banner amarillo antes de expirar
- ✅ Reset automático al escribir
- ✅ Pausa durante validación

#### Flujo Visual

```
Usuario ingresa → Timer inicia (90s)
Usuario escribe → Timer se resetea
↓
75 segundos inactivo
↓
[Banner Amarillo] "Ingresa tu contraseña pronto. Tiempo restante: 15s"
↓
90 segundos inactivo
↓
[Pantalla Completa] "No hemos recibido tu contraseña"
```

---

### 4. Componente: `TwoFactorVerificationWithTimer`

**Ubicación**: `/components/auth/TwoFactorVerificationWithTimer.tsx`

**Propósito**: Wrapper del componente `TwoFactorVerification` con timer de inactividad.

**Características**:
- ✅ Timer de 120 segundos (2 minutos)
- ✅ Se resetea al reenviar código
- ✅ Se pausa al verificar
- ✅ Muestra pantalla de "No hemos recibido el código"

#### Props Adicionales

```typescript
interface TwoFactorVerificationWithTimerProps extends TwoFactorVerificationProps {
  email?: string;  // Para mostrar en advertencia
}
```

---

## ⚙️ Configuración

### Tiempos por Paso

```typescript
// Paso 2: Contraseña
const PASSWORD_TIMEOUT = 90000;      // 90 segundos
const PASSWORD_WARNING = 15000;      // 15 segundos antes

// Paso 3: 2FA
const TWO_FA_TIMEOUT = 120000;       // 120 segundos (2 minutos)
const TWO_FA_WARNING = 30000;        // 30 segundos antes

// Pantalla de advertencia
const WARNING_SCREEN_TIMEOUT = 45000; // 45 segundos para decidir
```

### Personalización

Para ajustar los tiempos, modifica los valores en cada componente:

**Step2Password.tsx**:
```typescript
const { timeRemaining, showWarning, resetTimer } = useInactivityTimer({
  timeout: 90000,     // ← Cambiar aquí
  warningTime: 15000, // ← Cambiar aquí
  onTimeout: () => setShowInactivityWarning(true)
});
```

**TwoFactorVerificationWithTimer.tsx**:
```typescript
const { timeRemaining, resetTimer } = useInactivityTimer({
  timeout: 120000,    // ← Cambiar aquí
  warningTime: 30000, // ← Cambiar aquí
  onTimeout: () => setShowInactivityWarning(true)
});
```

---

## 🎨 Experiencia de Usuario

### Paso 2: Contraseña

#### Estado Normal (0-75s)
```
┌────────────────────────────────┐
│        Bienvenido              │
│    user@example.com ✓          │
│                                │
│  [Contraseña: _____]           │
│                                │
│  [Atrás] [Siguiente]           │
└────────────────────────────────┘
```

#### Advertencia (75-90s)
```
┌────────────────────────────────┐
│ ⚠️ Ingresa tu contraseña       │
│    pronto. Tiempo: 15s         │
│────────────────────────────────│
│  [Contraseña: _____]           │
│  [Atrás] [Siguiente]           │
└────────────────────────────────┘
```

#### Pantalla de Inactividad (>90s)
```
┌────────────────────────────────┐
│           BSK                  │
│    user@example.com            │
│                                │
│           ⚠️                   │
│                                │
│  No hemos recibido tu          │
│  contraseña                    │
│                                │
│  Has estado inactivo por un    │
│  tiempo. Por favor ingresa     │
│  tu contraseña para continuar. │
│                                │
│  ⏰ Esta sesión expirará en    │
│     45 segundos                │
│                                │
│  [Ingresar contraseña]         │
│  [¿Olvidaste tu contraseña?]   │
│  [Volver al inicio]            │
└────────────────────────────────┘
```

---

### Paso 3: Código 2FA

#### Estado Normal (0-90s)
```
┌────────────────────────────────┐
│    Verificación en 2 pasos     │
│                                │
│  Código enviado a              │
│  ****1234                      │
│                                │
│  [_] [_] [_] [_] [_] [_]      │
│                                │
│  ⏱️ Expira en: 4:23            │
│                                │
│  [Reenviar código]             │
└────────────────────────────────┘
```

#### Pantalla de Inactividad (>120s)
```
┌────────────────────────────────┐
│           BSK                  │
│    user@example.com            │
│                                │
│           ⏰                   │
│                                │
│  No hemos recibido el código   │
│                                │
│  Hemos enviado un código de    │
│  verificación, pero no lo      │
│  hemos recibido a tiempo.      │
│                                │
│  ⏰ Esta sesión expirará en    │
│     45 segundos                │
│                                │
│  [Enviar nuevo código]         │
│  [Obtener ayuda por WhatsApp]  │
│  [Continuar esperando]         │
│  [Volver al inicio]            │
└────────────────────────────────┘
```

---

## 🔄 Flujo de Estados

### Diagrama de Estados

```
┌─────────────┐
│   ACTIVO    │
│  (Escribiendo)
└─────┬───────┘
      │
      ↓ (Sin actividad)
┌─────────────┐
│   INACTIVO  │
│   (< 75s)   │
└─────┬───────┘
      │
      ↓ (75s sin actividad)
┌─────────────┐
│  ADVERTENCIA│ ← Banner amarillo
│  (75-90s)   │
└─────┬───────┘
      │
      ↓ (90s sin actividad)
┌─────────────┐
│   EXPIRADO  │ ← Pantalla completa
│   (>90s)    │
└─────┬───────┘
      │
      ├→ [Reintentar] → ACTIVO (reset timer)
      ├→ [Ayuda] → Link externo
      └→ [Cancelar] → Paso 1
```

---

## 🧪 Testing

### Test Manual

#### Paso 2 (Contraseña)

1. **Inactividad Normal**:
   - Ir a login → Ingresar email → Llegar a Paso 2
   - NO escribir nada por 75 segundos
   - ✅ Debe aparecer banner amarillo
   - ✅ Countdown debe ser visible (15, 14, 13...)

2. **Reset Automático**:
   - Esperar banner amarillo
   - Escribir algo en el campo de contraseña
   - ✅ Banner debe desaparecer
   - ✅ Timer debe resetearse a 90s

3. **Pantalla Completa**:
   - NO escribir nada por 90 segundos
   - ✅ Debe mostrar pantalla "No hemos recibido tu contraseña"
   - ✅ Debe tener opciones: Reintentar, Recuperar, Volver

4. **Reintentar**:
   - En pantalla de inactividad, click "Ingresar contraseña"
   - ✅ Debe volver al formulario
   - ✅ Timer debe resetearse

#### Paso 3 (2FA)

1. **Inactividad Normal**:
   - Completar Paso 1 y 2 correctamente
   - Llegar a pantalla de código 2FA
   - NO ingresar código por 120 segundos
   - ✅ Debe mostrar pantalla "No hemos recibido el código"

2. **Reenviar Código**:
   - En pantalla de inactividad, click "Enviar nuevo código"
   - ✅ Debe reenviar código por WhatsApp
   - ✅ Debe volver a pantalla de código
   - ✅ Timer debe resetearse

3. **Ayuda WhatsApp**:
   - En pantalla de inactividad, click "Obtener ayuda por WhatsApp"
   - ✅ Debe abrir WhatsApp en nueva pestaña
   - ✅ Número pre-cargado

---

## 📊 Métricas

### Eventos a Trackear

```typescript
// Analytics events
analytics.track('login_inactivity_warning', {
  step: 'password' | '2fa',
  time_inactive: 75000,
  action: 'banner_shown'
});

analytics.track('login_inactivity_expired', {
  step: 'password' | '2fa',
  time_inactive: 90000,
  action: 'screen_shown'
});

analytics.track('login_inactivity_recovered', {
  step: 'password' | '2fa',
  recovery_method: 'retry' | 'help' | 'cancel',
  time_to_recover: 5000
});
```

### KPIs

- **Tasa de recuperación**: % de usuarios que retoman login después de inactividad
- **Tiempo promedio de inactividad**: Tiempo promedio antes de mostrar advertencia
- **Método de recuperación preferido**: Qué opción eligen más los usuarios
- **Tasa de abandono**: % de usuarios que cancelan después de advertencia

---

## 🔒 Seguridad

### Beneficios

1. **Reduce ventana de ataque**:
   - Tokens de pre-autenticación expirados automáticamente
   - Sesiones abandonadas limpiadas

2. **Previene timing attacks**:
   - Los timers varían ligeramente
   - No se pueden predecir con exactitud

3. **Mejora higiene de sesiones**:
   - Fuerza a usuarios a completar flujos
   - Limpia recursos no utilizados

### Consideraciones

- ⚠️ Los timers son **client-side**, no reemplazan validación server-side
- ⚠️ Los tokens en backend tienen su propio TTL (5 minutos)
- ⚠️ El timer se puede bypassear manipulando el cliente

---

## 🎨 Personalización de Estilos

### Variables CSS Sugeridas

```css
/* Colores de advertencia */
--warning-bg: #FEF3C7;        /* Amarillo claro */
--warning-border: #FCD34D;    /* Amarillo */
--warning-text: #92400E;      /* Café */

/* Colores de error/inactividad */
--error-bg: #FEE2E2;          /* Rojo claro */
--error-border: #FCA5A5;      /* Rojo */
--error-text: #991B1B;        /* Rojo oscuro */
```

### Animaciones

```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-in-out;
}
```

---

## 📚 Referencias

### Inspiración

- [Microsoft Azure AD Login](https://login.microsoftonline.com/)
- [Google Accounts](https://accounts.google.com/)
- [GitHub Sign In](https://github.com/login)

### Documentación Relacionada

- [Sistema de Login en 3 Pasos](./3-STEP-LOGIN-FLOW.md)
- [Encriptación Client-Side](./CLIENT-SIDE-ENCRYPTION.md)
- [Sistema de Pre-Auth Tokens](./security-2fa-improvements.md)

---

## 🚀 Roadmap

### v2.4.0 (Futuro)
- [ ] Persistir timer en localStorage (sobrevivir refresh)
- [ ] Notificaciones push cuando se acerca timeout
- [ ] Modo "Mantenerme activo" (extender timeout)
- [ ] Analytics dashboard de inactividad

### v2.5.0 (Futuro)
- [ ] Machine learning para predecir abandono
- [ ] Ajuste dinámico de timeouts según patrón de usuario
- [ ] A/B testing de diferentes tiempos

---

**Última actualización**: Octubre 5, 2025  
**Versión del documento**: 1.0  
**Autor**: BSK Motorcycle Team - Equipo de Desarrollo
