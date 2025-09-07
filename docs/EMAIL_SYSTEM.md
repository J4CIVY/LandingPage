# Sistema de Correo Electrónico - BSK Motorcycle Team

Este sistema implementa el envío de correos electrónicos usando la API de Zoho Mail con autenticación OAuth 2.0.

## Funcionalidades

- ✅ Envío de correos de contacto desde formularios web
- ✅ Notificaciones automáticas (bienvenida, eventos, membresías)
- ✅ Correos de restablecimiento de contraseña
- ✅ Sistema de plantillas HTML responsivas
- ✅ Panel de administración para configuración
- ✅ Rate limiting para prevenir spam
- ✅ Validación y sanitización de datos
- ✅ Manejo de errores y reintentos

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
# Zoho Mail Configuration
ZOHO_CLIENT_ID=1000.XXXXXXXXXX
ZOHO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxx
ZOHO_ACCOUNT_ID=123456789
ZOHO_REFRESH_TOKEN=1000.xxxxxxxxxxxxxxxxxxxxx
ZOHO_ACCESS_TOKEN=1000.xxxxxxxxxxxxxxxxxxxxx
ZOHO_API_DOMAIN=https://www.zohoapis.com
ZOHO_FROM_EMAIL=noreply@bskmotorcycleteam.com

# OAuth URLs
ZOHO_AUTH_URL=https://accounts.zoho.com/oauth/v2/auth
ZOHO_TOKEN_URL=https://accounts.zoho.com/oauth/v2/token
ZOHO_MAIL_API_URL=https://mail.zoho.com/api

# Email Configuration
EMAIL_NOTIFICATION_ENABLED=true
EMAIL_ADMIN_ADDRESS=admin@bskmotorcycleteam.com
EMAIL_SUPPORT_ADDRESS=support@bskmotorcycleteam.com

# Next.js
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```

### 2. Configuración OAuth en Zoho

#### Paso 1: Crear aplicación en Zoho Developer Console

1. Ve a https://accounts.zoho.com/developerconsole
2. Haz clic en "GET STARTED"
3. Selecciona "Server-Based Applications"
4. Proporciona la información requerida:
   - **Client Name**: BSK Motorcycle Team Email System
   - **Homepage URL**: https://tu-dominio.com
   - **Authorized Redirect URIs**: https://tu-dominio.com/admin/email-config/callback

#### Paso 2: Obtener credenciales

Después del registro obtendrás:
- **Client ID**: `1000.XXXXXXXXXX`
- **Client Secret**: `xxxxxxxxxxxxxxxxxxxxx`

#### Paso 3: Obtener autorización

1. Ve al panel de administración: `/admin/email-config`
2. Haz clic en "Autorizar con Zoho"
3. Autoriza la aplicación en Zoho
4. Copia el código de autorización de la URL de callback

#### Paso 4: Intercambiar código por tokens

Usa este endpoint para obtener los tokens:

```bash
curl -X POST "https://accounts.zoho.com/oauth/v2/token" \
  -d "code=CODIGO_DE_AUTORIZACION" \
  -d "grant_type=authorization_code" \
  -d "client_id=1000.XXXXXXXXXX" \
  -d "client_secret=xxxxxxxxxxxxxxxxxxxxx" \
  -d "redirect_uri=https://tu-dominio.com/admin/email-config/callback" \
  -d "scope=ZohoMail.messages.ALL,ZohoMail.accounts.READ"
```

#### Paso 5: Obtener Account ID

```bash
curl "https://mail.zoho.com/api/accounts" \
  -H "Authorization: Zoho-oauthtoken ACCESS_TOKEN"
```

### 3. Scopes OAuth Requeridos

- `ZohoMail.messages.ALL`: Para enviar correos
- `ZohoMail.accounts.READ`: Para leer información de cuentas

## Uso

### Formulario de Contacto

```tsx
import ContactForm from '@/components/shared/ContactForm';

export default function ContactPage() {
  return (
    <div>
      <h1>Contáctanos</h1>
      <ContactForm 
        defaultCategory="general"
        onSuccess={() => console.log('Mensaje enviado')}
      />
    </div>
  );
}
```

### Hook useEmail

```tsx
import { useEmail } from '@/hooks/useEmail';

export default function MyComponent() {
  const { sendContactEmail, isLoading, isSuccess, error } = useEmail();

  const handleSend = async () => {
    const result = await sendContactEmail({
      name: 'Juan Pérez',
      email: 'juan@ejemplo.com',
      subject: 'Consulta',
      message: 'Hola, tengo una pregunta...',
      category: 'general',
      priority: 'medium'
    });

    if (result.success) {
      console.log('Correo enviado');
    }
  };

  return (
    <button onClick={handleSend} disabled={isLoading}>
      {isLoading ? 'Enviando...' : 'Enviar correo'}
    </button>
  );
}
```

### Envío de Notificaciones (Admin)

```tsx
import { useEmail } from '@/hooks/useEmail';

export default function AdminPanel() {
  const { sendNotification } = useEmail();

  const sendWelcomeEmail = async () => {
    await sendNotification({
      type: 'welcome',
      recipientEmail: 'usuario@ejemplo.com',
      recipientName: 'Juan Pérez'
    });
  };

  const sendEventReminder = async () => {
    await sendNotification({
      type: 'event_reminder',
      recipientEmail: 'usuario@ejemplo.com',
      recipientName: 'Juan Pérez',
      templateData: {
        eventData: {
          title: 'Ruta del Fin de Semana',
          date: '2024-01-15',
          location: 'Parque Nacional',
          description: 'Ruta escénica por la montaña'
        }
      }
    });
  };

  return (
    <div>
      <button onClick={sendWelcomeEmail}>Enviar bienvenida</button>
      <button onClick={sendEventReminder}>Enviar recordatorio</button>
    </div>
  );
}
```

## APIs Disponibles

### POST /api/email/contact
Envía correos desde el formulario de contacto.

**Rate limit**: 5 correos por hora por IP

**Body**:
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "subject": "Consulta general",
  "message": "Hola, me gustaría información...",
  "category": "general",
  "priority": "medium",
  "phone": "+1234567890",
  "company": "Mi Empresa"
}
```

### POST /api/email/notifications
Envía notificaciones (solo administradores).

**Body**:
```json
{
  "type": "welcome",
  "recipientEmail": "usuario@ejemplo.com",
  "recipientName": "Juan Pérez",
  "templateData": {},
  "priority": "medium"
}
```

### GET /api/email/config
Obtiene estado de configuración (solo administradores).

**Query params**:
- `action=status`: Obtiene estado actual

### POST /api/email/test
Envía correos de prueba (solo administradores).

**Body**:
```json
{
  "testEmail": "test@ejemplo.com",
  "testType": "basic"
}
```

## Tipos de Correo

### 1. Correo de Contacto
- Enviado cuando alguien usa el formulario de contacto
- Incluye información del remitente y categorización
- Se envía al email de soporte configurado

### 2. Correo de Bienvenida
- Enviado a nuevos usuarios registrados
- Incluye enlaces útiles y información del club

### 3. Restablecimiento de Contraseña
- Enviado cuando un usuario solicita restablecer su contraseña
- Incluye enlace seguro con token temporal

### 4. Notificación de Evento
- Recordatorios de eventos próximos
- Información detallada del evento

### 5. Notificación de Membresía
- Actualizaciones sobre estado de membresía
- Aprobaciones, rechazos, vencimientos

## Seguridad

- **Rate Limiting**: Previene spam con límites por IP
- **Validación**: Todos los datos se validan con Zod schemas
- **Sanitización**: Contenido HTML sanitizado para prevenir XSS
- **OAuth 2.0**: Autenticación segura con Zoho
- **HTTPS**: Todas las comunicaciones encriptadas

## Monitoreo

### Panel de Administración
Accede a `/admin/email-config` para:
- Ver estado de configuración
- Probar conectividad
- Enviar correos de prueba
- Monitorear errores

### Logs
Los errores se registran en la consola del servidor:
```bash
npm run dev
# o en producción
npm start
```

## Troubleshooting

### Token Expirado
Si los tokens OAuth expiran:
1. El sistema intentará renovar automáticamente usando el refresh token
2. Si falla, necesitarás reautorizar en el panel de admin

### Correos no se envían
1. Verifica configuración en `/admin/email-config`
2. Revisa los logs del servidor
3. Confirma que las variables de entorno están correctas
4. Prueba conectividad con el endpoint de prueba

### Rate Limit Alcanzado
Si se alcanza el límite de rate limiting:
- Espera una hora antes de intentar nuevamente
- O aumenta el límite en `app/api/email/contact/route.ts`

## Desarrollo

### Estructura de Archivos
```
lib/
├── zoho-mail.ts           # Cliente OAuth para Zoho Mail
├── email-service.ts       # Servicio de alto nivel
└── email-templates.ts     # Plantillas HTML

schemas/
└── emailSchemas.ts        # Validación con Zod

hooks/
└── useEmail.tsx           # Hook de React

components/
├── shared/
│   └── ContactForm.tsx    # Formulario de contacto
└── admin/
    └── EmailConfigPanel.tsx # Panel de configuración

app/api/email/
├── contact/route.ts       # API de contacto
├── notifications/route.ts # API de notificaciones
├── config/route.ts        # API de configuración
└── test/route.ts         # API de pruebas
```

### Agregar Nuevo Tipo de Correo

1. **Actualizar tipos**:
```typescript
// types/email.ts
export type EmailType = 'welcome' | 'password_reset' | 'new_type';
```

2. **Crear plantilla**:
```typescript
// lib/email-service.ts
async sendNewTypeEmail(email: string, data: any) {
  // Implementar lógica
}
```

3. **Actualizar esquemas**:
```typescript
// schemas/emailSchemas.ts
type: z.enum(['welcome', 'password_reset', 'new_type'])
```

## Producción

### Checklist de Deployment

- [ ] Variables de entorno configuradas
- [ ] Tokens OAuth válidos
- [ ] Dominio verificado en Zoho
- [ ] HTTPS habilitado
- [ ] Rate limits configurados apropiadamente
- [ ] Logs de monitoreo configurados
- [ ] Backup de configuración OAuth

### Consideraciones de Rendimiento

- Los correos se envían de forma asíncrona
- Rate limiting previene abuso
- Tokens se renuevan automáticamente
- Manejo de errores con reintentos

## Soporte

Para problemas con la implementación:
1. Revisa los logs del servidor
2. Verifica configuración OAuth
3. Consulta documentación oficial de Zoho Mail API
4. Contacta al equipo de desarrollo
