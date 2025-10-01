#!/bin/bash

# Script para verificar que los archivos de privacidad estén listos para deployment

echo "🔍 Verificando archivos de APIs de Privacidad..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 existe"
        return 0
    else
        echo -e "${RED}❌${NC} $1 NO existe"
        return 1
    fi
}

# Verificar archivos API
echo "📁 Verificando archivos API..."
check_file "app/api/user/privacy/route.ts"
check_file "app/api/user/download-data/route.ts"
check_file "app/api/user/delete-account/route.ts"
echo ""

# Verificar modelo
echo "📁 Verificando modelos..."
check_file "lib/models/ExtendedUser.ts"
echo ""

# Verificar componente
echo "📁 Verificando componentes..."
check_file "components/dashboard/security/PrivacyControlSection.tsx"
echo ""

# Verificar que no haya errores de TypeScript
echo "🔧 Verificando errores de TypeScript..."
if npm run type-check 2>&1 | grep -q "error TS"; then
    echo -e "${RED}❌${NC} Hay errores de TypeScript"
    echo "Por favor, ejecuta 'npm run type-check' para ver los detalles"
else
    echo -e "${GREEN}✅${NC} Sin errores de TypeScript"
fi
echo ""

# Intentar build
echo "🏗️  Intentando build de producción..."
if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✅${NC} Build exitoso"
    
    # Verificar archivos compilados
    echo ""
    echo "📦 Verificando archivos compilados..."
    if [ -f ".next/server/app/api/user/privacy/route.js" ]; then
        echo -e "${GREEN}✅${NC} privacy/route.js compilado"
    else
        echo -e "${RED}❌${NC} privacy/route.js NO encontrado en build"
    fi
    
    if [ -f ".next/server/app/api/user/download-data/route.js" ]; then
        echo -e "${GREEN}✅${NC} download-data/route.js compilado"
    else
        echo -e "${RED}❌${NC} download-data/route.js NO encontrado en build"
    fi
    
    if [ -f ".next/server/app/api/user/delete-account/route.js" ]; then
        echo -e "${GREEN}✅${NC} delete-account/route.js compilado"
    else
        echo -e "${RED}❌${NC} delete-account/route.js NO encontrado en build"
    fi
else
    echo -e "${RED}❌${NC} Build falló"
    echo "Ver detalles en /tmp/build.log"
    tail -20 /tmp/build.log
fi
echo ""

# Verificar git status
echo "📝 Estado de Git..."
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️${NC}  No hay cambios para commitear"
    echo "Si ya commiteaste, verifica que hayas hecho push"
else
    echo -e "${YELLOW}⚠️${NC}  Hay cambios sin commitear"
    echo "Archivos modificados:"
    git status --short | head -10
    echo ""
    echo "Para commitear y pushear:"
    echo "  git add ."
    echo "  git commit -m 'feat: implementar sistema de privacidad completo'"
    echo "  git push origin main"
fi
echo ""

# Resumen
echo "============================================"
echo "📋 RESUMEN"
echo "============================================"
echo ""
echo "Para desplegar a producción:"
echo "1. Commitear cambios (si no lo has hecho)"
echo "2. Push a repositorio"
echo "3. Triggear deploy en tu plataforma (Vercel/Netlify/etc)"
echo ""
echo "O si usas deployment manual:"
echo "  npm run build"
echo "  [subir archivos a servidor]"
echo "  [reiniciar servicio Next.js]"
echo ""
echo "Después del deploy, verificar en:"
echo "  https://bskmt.com/api/user/privacy"
echo "  https://bskmt.com/dashboard/security"
echo ""
