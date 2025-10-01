#!/bin/bash
# Comandos Útiles para el Sistema 2FA

echo "==================================="
echo "  Comandos Útiles - Sistema 2FA"
echo "==================================="
echo ""

# Función para mostrar un comando
show_command() {
    echo ""
    echo "📋 $1"
    echo "-----------------------------------"
    echo "$2"
    echo ""
}

show_command "1. Iniciar servidor de desarrollo" \
"npm run dev"

show_command "2. Test completo del sistema 2FA" \
"./scripts/test-2fa.sh"

show_command "3. Generar código OTP (manual)" \
"curl -X POST http://localhost:3000/api/auth/2fa/generate \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"email\": \"usuario@ejemplo.com\",
    \"password\": \"contraseña123\"
  }'"

show_command "4. Verificar código OTP (manual)" \
"curl -X POST http://localhost:3000/api/auth/2fa/verify \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"twoFactorId\": \"ID_DEL_CODIGO\",
    \"code\": \"ABC123\"
  }'"

show_command "5. Test del webhook de MessageBird" \
"curl -X POST https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/0403d97b-fa60-48b7-a45f-8a45b78d0a04 \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"otp\": \"TEST12\",
    \"phoneNumber\": \"+573001234567\",
    \"email\": \"test@ejemplo.com\",
    \"name\": \"Test User\",
    \"timestamp\": \"2025-10-01T12:00:00Z\"
  }'"

show_command "6. Ver logs en tiempo real" \
"npm run dev | grep -i \"2fa\\|otp\""

show_command "7. Conectar a MongoDB y ver códigos 2FA" \
"mongosh
> use tu_database
> db.twofactorcodes.find().pretty()"

show_command "8. Limpiar códigos expirados manualmente" \
"mongosh
> use tu_database
> db.twofactorcodes.deleteMany({ expiresAt: { \$lt: new Date() } })"

show_command "9. Contar códigos activos" \
"mongosh
> use tu_database
> db.twofactorcodes.countDocuments({ verified: false, expiresAt: { \$gt: new Date() } })"

show_command "10. Ver últimos 5 códigos generados" \
"mongosh
> use tu_database
> db.twofactorcodes.find().sort({ createdAt: -1 }).limit(5).pretty()"

show_command "11. Build de producción" \
"npm run build
npm run start"

show_command "12. Verificar errores de TypeScript" \
"npm run type-check"

show_command "13. Ver documentación" \
"# Documentación principal:
cat docs/IMPLEMENTATION_SUMMARY.md

# Guía rápida:
cat docs/2FA_QUICK_START.md

# Configuración MessageBird:
cat docs/MESSAGEBIRD_FINAL_CONFIG.md"

echo ""
echo "==================================="
echo "  Variables de Entorno Útiles"
echo "==================================="
echo ""
echo "# Para deshabilitar 2FA en desarrollo:"
echo "export DISABLE_2FA=true"
echo ""
echo "# Para usar URL del webhook desde env:"
echo "export MESSAGEBIRD_WEBHOOK_URL=https://..."
echo ""

echo ""
echo "==================================="
echo "  Rutas de la Aplicación"
echo "==================================="
echo ""
echo "Login:           http://localhost:3000/login"
echo "Dashboard:       http://localhost:3000/dashboard"
echo "Perfil:          http://localhost:3000/profile"
echo ""
echo "API Generate:    POST http://localhost:3000/api/auth/2fa/generate"
echo "API Verify:      POST http://localhost:3000/api/auth/2fa/verify"
echo "API Webhook:     POST http://localhost:3000/api/webhooks/messagebird"
echo ""

echo ""
echo "==================================="
echo "  Archivos Importantes"
echo "==================================="
echo ""
echo "Modelo:          lib/models/TwoFactorCode.ts"
echo "Utilidades:      lib/2fa-utils.ts"
echo "API Generate:    app/api/auth/2fa/generate/route.ts"
echo "API Verify:      app/api/auth/2fa/verify/route.ts"
echo "Componente UI:   components/auth/TwoFactorVerification.tsx"
echo "Página Login:    app/login/page.tsx"
echo ""
echo "Docs:            docs/IMPLEMENTATION_SUMMARY.md"
echo "Quick Start:     docs/2FA_QUICK_START.md"
echo "MessageBird:     docs/MESSAGEBIRD_FINAL_CONFIG.md"
echo ""

echo "==================================="
echo "  ¡Sistema 2FA Listo!"
echo "==================================="
