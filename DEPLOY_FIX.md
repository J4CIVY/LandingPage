# 🚨 SOLUCIÓN RÁPIDA - Error 404 en /api/user/privacy

## El Problema

```
GET https://bskmt.com/api/user/privacy 404 (Not Found)
PATCH https://bskmt.com/api/user/privacy 404 (Not Found)
```

## La Causa

✅ Los archivos API existen en el código
✅ El build local es exitoso
✅ Los archivos compilados están en `.next/`

❌ **Producción está sirviendo una versión anterior del código**

## La Solución Simple

### 🔥 OPCIÓN 1: Forzar Redespliegue (MÁS RÁPIDO)

Si tu sitio está en **Vercel, Netlify, o similar**:

1. Ve al dashboard de tu plataforma
2. Busca el último deployment
3. Haz clic en **"Redeploy"** o **"Rebuild"**
4. Espera 2-5 minutos
5. ✅ Prueba de nuevo: https://bskmt.com/dashboard/security

### 🔧 OPCIÓN 2: Deployment desde Código

```bash
# 1. Agregar archivos de documentación (opcional)
git add docs/FIX_404_PRIVACY_APIS.md docs/PRIVACY_SECURITY_IMPLEMENTATION.md scripts/

# 2. Commit
git commit -m "docs: agregar documentación de sistema de privacidad"

# 3. Push
git push origin main

# 4. Esperar auto-deploy (2-5 minutos)
```

### 🖥️ OPCIÓN 3: Servidor Propio/VPS

Si tienes un servidor propio:

```bash
# Conectarse al servidor
ssh usuario@bskmt.com

# Ir al directorio del proyecto
cd /ruta/al/proyecto

# Pull cambios
git pull origin main

# Instalar dependencias (si cambió package.json)
npm install

# Build de producción
npm run build

# Reiniciar servicio
pm2 restart bskmt
# o
systemctl restart bskmt.service
# o el comando que uses
```

## Verificación Post-Despliegue

### 1️⃣ Verificar API desde Browser Console

```javascript
// Abrir https://bskmt.com
// Abrir DevTools (F12) > Console
// Ejecutar:

fetch('/api/user/privacy')
  .then(r => r.json())
  .then(d => console.log('✅ API funciona:', d))
  .catch(e => console.error('❌ Error:', e))
```

**Resultado esperado**:
- ✅ Status 200 o 401 (autenticación)
- ❌ NO Status 404

### 2️⃣ Probar en UI

1. Ir a: https://bskmt.com/dashboard/security
2. Click en tab "Privacidad"
3. Verificar:
   - ✅ NO aparece toast de error
   - ✅ Switches funcionan y se guardan
   - ✅ Al recargar, preferencias persisten

## Tiempo Estimado

- **Vercel/Netlify auto-deploy**: 2-5 minutos
- **Servidor propio**: 5-10 minutos
- **Manual upload**: 10-20 minutos

## Si Sigue Fallando

### Verificar que los cambios estén en el repo:

```bash
# Ver últimos commits
git log --oneline -5

# Verificar que estos archivos estén en el repo:
git ls-files | grep "api/user/privacy"
git ls-files | grep "api/user/download-data"
git ls-files | grep "api/user/delete-account"
```

### Limpiar Caché de CDN (si usas Cloudflare u otro CDN):

1. Ir al dashboard de tu CDN
2. Purgar caché completo
3. O purgar solo: `/api/user/*`

### Verificar Build en Plataforma:

1. Ir a los logs del último deployment
2. Buscar errores en el build
3. Verificar que el build se completó exitosamente

## Checklist Rápido

- [ ] Archivos API existen localmente ✅ (ya verificado)
- [ ] Build local exitoso ✅ (ya verificado)
- [ ] Cambios commiteados y pusheados
- [ ] Deployment triggereado en plataforma
- [ ] Esperar 2-5 minutos
- [ ] Verificar API desde console
- [ ] Verificar UI en /dashboard/security
- [ ] Limpiar caché del navegador si es necesario

## Contacto de Emergencia

Si después de redesplegar TODAVÍA no funciona:

1. Compartir:
   - URL del último deployment
   - Logs del build
   - Screenshot de error en console

2. Verificar:
   - ¿El deployment fue exitoso?
   - ¿Hubo errores en el build?
   - ¿La versión desplegada es la correcta?

---

**TL;DR**: Haz un **redeploy** de tu aplicación. Los archivos están bien, solo necesitan estar en producción.
