# Sistema de Restablecimiento de Contraseña - BSK Motorcycle Team

## 📋 Flujo Completo

### 1. **Usuario olvida su contraseña**
- Va a `/login`
- Hace clic en "¿Olvidaste tu contraseña?"
- Es redirigido a `/auth/forgot-password`

### 2. **Solicitud de restablecimiento**
- Usuario ingresa su email en `/auth/forgot-password`
- El sistema valida el email y envía una solicitud a `/api/auth/forgot-password`
- Se genera un token único y se guarda en la BD con expiración de 1 hora
- Se envía un email con el enlace de restablecimiento

### 3. **Email de restablecimiento**
- El usuario recibe un email con un enlace como: `https://tu-dominio.com/reset-password?token=ABC123...`
- El enlace es válido por 1 hora

### 4. **Restablecimiento de contraseña**
- Usuario hace clic en el enlace del email
- Es redirigido a `/reset-password?token=ABC123...`
- El sistema valida el token llamando a `/api/auth/validate-reset-token`
- Si es válido, muestra el formulario para nueva contraseña
- Usuario ingresa nueva contraseña (con validaciones de seguridad)
- Se envía a `/api/auth/reset-password` para actualizar la contraseña

### 5. **Confirmación**
- La contraseña se actualiza en la BD
- Se limpia el token de reset
- Se muestran mensajes de éxito
- Usuario es redirigido al login

## 🔐 Características de Seguridad

### **Rate Limiting**
- Máximo 3 intentos de reset por IP cada 15 minutos
- Previene ataques de fuerza bruta

### **Validación de Token**
- Tokens únicos generados criptográficamente
- Expiración automática en 1 hora
- Validación en servidor antes de mostrar formulario

### **Validación de Contraseña**
- Mínimo 8 caracteres
- Al menos 1 letra minúscula
- Al menos 1 letra mayúscula  
- Al menos 1 número
- Al menos 1 carácter especial
- Indicador visual de requisitos en tiempo real

### **Privacidad**
- No se revela si un email existe en el sistema
- Siempre se muestra mensaje de "éxito" aunque el email no exista
- Previene enumeración de usuarios

## 🛠️ Archivos Creados/Modificados

### **Páginas Frontend**
- `/app/auth/forgot-password/page.tsx` - Formulario para solicitar reset
- `/app/reset-password/page.tsx` - Formulario para nueva contraseña

### **API Endpoints**
- `/app/api/auth/forgot-password/route.ts` - Procesa solicitud de reset
- `/app/api/auth/validate-reset-token/route.ts` - Valida tokens
- `/app/api/auth/reset-password/route.ts` - Actualiza contraseña

### **Existing Infrastructure Used**
- `/app/api/email/notifications/route.ts` - Envía emails (ya existía)
- `/lib/email-service.ts` - Servicio de email (ya existía)
- `/lib/models/User.ts` - Modelo con campos de reset (ya existía)
- `/schemas/authSchemas.ts` - Schemas de validación (ya existía)

## 🚀 Cómo Usar

### **Para usuarios**
1. Ir a `/login`
2. Hacer clic en "¿Olvidaste tu contraseña?"
3. Ingresar email y hacer clic en "Enviar Instrucciones"
4. Revisar email (incluir spam)
5. Hacer clic en el enlace del email
6. Ingresar nueva contraseña
7. Confirmar y hacer clic en "Restablecer Contraseña"

### **Para desarrolladores**
```bash
# El sistema ya está integrado, solo asegúrate de que:

# 1. Las variables de entorno estén configuradas
MONGODB_URI=...
JWT_SECRET=...
NEXT_PUBLIC_BASE_URL=...

# 2. El servicio de email esté configurado (Zoho)
ZOHO_ACCESS_TOKEN=...
ZOHO_REFRESH_TOKEN=...

# 3. Ejecutar el servidor
npm run dev
```

## 🔗 URLs del Sistema

- **Login**: `/login`
- **Forgot Password**: `/auth/forgot-password`
- **Reset Password**: `/reset-password?token=ABC123...`

## 📧 Configuración de Email

El sistema utiliza el servicio de email existente que ya está configurado con Zoho Mail. Los emails de restablecimiento se envían automáticamente usando el template definido en `email-service.ts`.

## ⚠️ Notas Importantes

- Los tokens expiran en 1 hora por seguridad
- El rate limiting previene abuso del sistema
- Los passwords se hashean con bcrypt (12 rounds)
- El sistema es compatible con modo oscuro/claro
- Responsive design para móviles y desktop

## 🐛 Troubleshooting

### **Error 404 en forgot-password**
✅ **SOLUCIONADO** - Se creó `/app/auth/forgot-password/page.tsx`

### **Email no se envía**
- Verificar configuración de Zoho Mail
- Revisar logs del servidor
- Confirmar variables de entorno

### **Token inválido**
- Verificar que no haya expirado (1 hora)
- Confirmar que el enlace esté completo
- Solicitar nuevo enlace si es necesario
