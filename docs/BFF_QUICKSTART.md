# 🚀 Configuración Rápida del Sistema BFF

## ⚠️ ACCIÓN INMEDIATA REQUERIDA

Tu API está ahora protegida con el sistema BFF. Para que funcione correctamente, **DEBES** configurar las variables de entorno.

## 📝 Paso 1: Generar API Keys

Ejecuta este comando en la terminal (PowerShell):

```powershell
node -e "const crypto = require('crypto'); console.log('# Copia estas lineas a tu archivo .env'); console.log('BFF_API_KEY_SECRET=' + crypto.randomBytes(32).toString('hex')); console.log('BFF_FRONTEND_API_KEY=' + crypto.randomBytes(32).toString('hex')); console.log('BFF_ADMIN_API_KEY=' + crypto.randomBytes(32).toString('hex')); const frontendKey = crypto.randomBytes(32).toString('hex'); console.log('\n# Variables del servidor:'); console.log('BFF_FRONTEND_API_KEY=' + frontendKey); console.log('\n# Variable publica (cliente):'); console.log('NEXT_PUBLIC_BFF_FRONTEND_API_KEY=' + frontendKey);"
```

## 📝 Paso 2: Agregar al archivo `.env.local`

Crea o edita el archivo `.env.local` en la raíz del proyecto y agrega las variables generadas:

```env
# ============================================================================
# SISTEMA BFF - VARIABLES DE SEGURIDAD
# ============================================================================

# Secret para firmas HMAC
BFF_API_KEY_SECRET=tu_secret_generado_aqui

# API Key del frontend (servidor)
BFF_FRONTEND_API_KEY=tu_frontend_key_aqui

# API Key del admin
BFF_ADMIN_API_KEY=tu_admin_key_aqui

# API Key pública (cliente) - DEBE SER IGUAL A BFF_FRONTEND_API_KEY
NEXT_PUBLIC_BFF_FRONTEND_API_KEY=tu_frontend_key_aqui
```

## 📝 Paso 3: Verificar Configuración

```bash
# Windows PowerShell
echo $env:BFF_API_KEY_SECRET
echo $env:BFF_FRONTEND_API_KEY
echo $env:NEXT_PUBLIC_BFF_FRONTEND_API_KEY
```

Si ves "null" o vacío, las variables NO están cargadas.

## 📝 Paso 4: Reiniciar el Servidor

```bash
# Detener servidor (Ctrl+C)
# Iniciar de nuevo
npm run dev
```

## 📝 Paso 5: Verificar en el Navegador

Abre la consola del navegador (F12) y busca:

```
✅ [BFF Provider] Sistema BFF inicializado correctamente
```

Si ves este mensaje, ¡todo está funcionando!

Si ves:
```
❌ [BFF Provider] NEXT_PUBLIC_BFF_FRONTEND_API_KEY no está configurada!
```

Repite los pasos 2-4.

## 🔧 Para Producción (Vercel/Netlify/etc)

Agrega las variables de entorno en el panel de tu hosting:

### Vercel:
1. Ve a Project Settings > Environment Variables
2. Agrega cada variable:
   - `BFF_API_KEY_SECRET` = (tu secret)
   - `BFF_FRONTEND_API_KEY` = (tu key)
   - `BFF_ADMIN_API_KEY` = (tu admin key)
   - `NEXT_PUBLIC_BFF_FRONTEND_API_KEY` = (misma que BFF_FRONTEND_API_KEY)

3. Redeploy la aplicación

## 🧪 Probar que Funciona

### Test 1: Sin API Key (debe fallar)
```javascript
// En la consola del navegador
fetch('/api/users').then(r => r.json()).then(console.log)

// Resultado esperado:
// { success: false, error: "Acceso denegado: credenciales inválidas", code: "INVALID_API_KEY" }
```

### Test 2: Con el interceptor (debe funcionar para admin)
```javascript
// El interceptor automáticamente agrega API Key
// Si eres admin, esto debería funcionar:
fetch('/api/users').then(r => r.json()).then(console.log)

// Resultado esperado (si eres admin):
// { success: true, data: { users: [...] } }
```

## ❓ Solución de Problemas

### Problema: "API Key inválida"
- ✅ Verifica que NEXT_PUBLIC_BFF_FRONTEND_API_KEY esté en .env.local
- ✅ Reinicia el servidor completamente
- ✅ Limpia cache: `rm -rf .next`

### Problema: "Sesión inválida o expirada"
- ✅ Verifica que estés logueado
- ✅ Verifica que la cookie bsk-access-token existe
- ✅ El token JWT debe ser válido

### Problema: "Permisos insuficientes"
- ✅ Solo administradores pueden acceder a /api/users
- ✅ Verifica tu rol en el JWT token
- ✅ Decodifica el token en https://jwt.io

## 📚 Documentación Completa

Para más detalles, consulta:
- `docs/BFF_IMPLEMENTATION.md` - Documentación completa
- `MIGRATION_GUIDE.md` - Guía de migración
- `.env.bff.example` - Ejemplo de configuración

## 🎯 Próximos Pasos

Una vez configurado:
1. ✅ Las variables de entorno están configuradas
2. ✅ El servidor se reinició
3. ✅ El interceptor está activo
4. ✅ Las llamadas a API funcionan

Ahora puedes:
- Migrar otras rutas API para protegerlas
- Configurar las mismas variables en producción
- Revisar logs de seguridad en SecurityMonitor

---

**¿Necesitas ayuda?** Revisa los logs del navegador (F12) y del servidor para más detalles.
