# 🚨 Solución al Error 404 en APIs de Privacidad

## Problema Identificado

El error `404 (Not Found)` en las rutas:
- `/api/user/privacy`
- `/api/user/download-data`
- `/api/user/delete-account`

Se debe a que **la aplicación en producción está sirviendo una versión anterior** que no incluye estos nuevos endpoints.

## ✅ Verificación Local

Los archivos API están correctamente creados y compilados:
- ✅ `app/api/user/privacy/route.ts` existe
- ✅ `app/api/user/download-data/route.ts` existe
- ✅ `app/api/user/delete-account/route.ts` existe
- ✅ Build local exitoso
- ✅ Archivos compilados en `.next/server/app/api/user/`

## 🔧 Solución: Redespliegue Completo

### Opción 1: Redespliegue desde Git (Recomendado)

1. **Commitear y pushear los cambios**:
```bash
git add .
git commit -m "feat: implementar sistema de privacidad y control de datos

- Agregar preferencias de privacidad persistentes
- Agregar descarga de datos personales (GDPR)
- Agregar eliminación de cuenta con cancelación de membresía
- Actualizar modelo ExtendedUser con campos de privacidad
"
git push origin main
```

2. **Triggear el redespliegue en tu plataforma**:
   - **Vercel**: El push automáticamente triggerea un nuevo deploy
   - **Netlify**: Igual, deploy automático
   - **Railway/Render**: Verificar que el auto-deploy esté activo
   - **Manual**: Triggear deploy desde el dashboard de tu plataforma

### Opción 2: Build y Deploy Manual

Si usas un servidor propio o VPS:

```bash
# 1. Crear un nuevo build de producción
npm run build

# 2. Verificar que los archivos API estén en el build
find .next/server/app/api/user -name "*.js" | grep -E "(privacy|download|delete)"

# 3. Subir el build a producción
# (dependiendo de tu método de deployment)

# 4. Reiniciar el servidor Next.js
pm2 restart bskmt
# o
systemctl restart bskmt
# o el comando que uses para tu deployment
```

### Opción 3: Forzar Reconstrucción en Plataforma Cloud

#### Vercel:
```bash
vercel --prod --force
```

#### Netlify:
```bash
netlify deploy --prod --build
```

## 📋 Checklist Post-Despliegue

Después del redespliegue, verificar:

### 1. APIs Funcionando
```bash
# Desde la consola del navegador en https://bskmt.com
fetch('/api/user/privacy')
  .then(r => r.json())
  .then(console.log)
```

Debería retornar:
- **200 OK** si estás autenticado
- **401 Unauthorized** si no estás autenticado
- ❌ **NO** 404 Not Found

### 2. Componente de UI
1. Ir a https://bskmt.com/dashboard/security
2. Ir a la pestaña "Privacidad"
3. Verificar que:
   - ✅ NO aparece el mensaje "No se pudieron cargar las preferencias de privacidad"
   - ✅ Los switches cargan con valores por defecto
   - ✅ Al cambiar un switch, se guarda correctamente
   - ✅ Al recargar la página, las preferencias persisten

### 3. Descarga de Datos
1. Hacer clic en "Descargar datos personales"
2. Verificar que se descarga un archivo JSON
3. Abrir el JSON y verificar que contiene datos reales del usuario

### 4. Eliminación de Cuenta
1. Hacer clic en "Eliminar mi cuenta"
2. Verificar que el modal solicita:
   - Escribir "eliminar-cuenta"
   - Ingresar contraseña
3. **NO COMPLETAR** (a menos que sea cuenta de prueba)

## 🔍 Debugging Adicional

Si después del redespliegue siguen los errores:

### 1. Verificar que el build incluye los archivos:
```bash
# En el servidor de producción
ls -la .next/server/app/api/user/privacy/
ls -la .next/server/app/api/user/download-data/
ls -la .next/server/app/api/user/delete-account/
```

### 2. Verificar logs del servidor:
```bash
# Ver logs de Next.js en producción
pm2 logs bskmt
# o
journalctl -u bskmt -f
```

### 3. Limpiar caché de CDN (si aplica):
Si usas Cloudflare, Vercel Edge, o cualquier CDN:
- Purgar caché completo
- O específicamente las rutas `/api/user/*`

### 4. Verificar variables de entorno:
Asegurarse de que estas variables estén configuradas en producción:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
NEXTAUTH_SECRET=...
```

## 🐛 Si Persiste el Error

Si después de todo esto el error persiste:

1. **Verificar la ruta exacta del API**:
```bash
# En el proyecto
find app/api -name "route.ts" | grep privacy
```

2. **Verificar que no haya middleware bloqueando**:
```typescript
// En middleware.ts, agregar excepción si es necesario
if (pathname.startsWith('/api/user/privacy') || 
    pathname.startsWith('/api/user/download-data') ||
    pathname.startsWith('/api/user/delete-account')) {
  return NextResponse.next();
}
```

3. **Verificar Next.js config**:
```javascript
// next.config.mjs - asegurar que no haya rewrites bloqueando
// No debería haber nada que redirija /api/user/*
```

## 📝 Archivos Importantes

Los siguientes archivos fueron creados/modificados:

### Nuevos Archivos API:
- `app/api/user/privacy/route.ts`
- `app/api/user/download-data/route.ts`
- `app/api/user/delete-account/route.ts`

### Modelos Modificados:
- `lib/models/ExtendedUser.ts` (+campos de privacidad)

### Componentes Modificados:
- `components/dashboard/security/PrivacyControlSection.tsx`

### Documentación:
- `docs/PRIVACY_SECURITY_IMPLEMENTATION.md`

## 🎯 Resumen

**El problema es simple**: Los nuevos archivos API existen en el código pero no están en el build de producción.

**La solución es simple**: Hacer un nuevo build y redesplegar.

Una vez desplegado, todo debería funcionar correctamente. Los archivos están bien escritos y compilan sin errores.

---

**Nota**: Si usas un sistema de CI/CD, asegúrate de que el pipeline esté ejecutándose correctamente y que no haya errores en el build.
