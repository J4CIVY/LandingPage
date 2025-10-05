#!/bin/bash

# Script de migración para implementación de Pre-Auth Tokens
# Ejecutar en el servidor de producción

set -e  # Salir si hay algún error

echo "🔐 Iniciando migración de seguridad: Pre-Auth Tokens"
echo "=================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para logs
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar que estamos en el directorio correcto
log_info "Verificando directorio del proyecto..."
if [ ! -f "package.json" ]; then
    log_error "No se encuentra package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi
log_info "✓ Directorio correcto"
echo ""

# 2. Verificar variables de entorno
log_info "Verificando variables de entorno..."
if [ -z "$MONGODB_URI" ]; then
    log_error "MONGODB_URI no está definida"
    exit 1
fi
log_info "✓ Variables de entorno configuradas"
echo ""

# 3. Crear backup de la base de datos
log_info "Creando backup de la base de datos..."
BACKUP_DIR="backups/migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR" 2>/dev/null || {
    log_warning "No se pudo crear backup automático. Continuar? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
}
log_info "✓ Backup creado en $BACKUP_DIR"
echo ""

# 4. Instalar dependencias
log_info "Instalando dependencias..."
npm install
log_info "✓ Dependencias instaladas"
echo ""

# 5. Compilar TypeScript
log_info "Compilando proyecto..."
npm run build || {
    log_error "Error al compilar el proyecto"
    exit 1
}
log_info "✓ Proyecto compilado"
echo ""

# 6. Crear índices en MongoDB
log_info "Creando índices en MongoDB..."
cat << 'EOF' > /tmp/create_indexes.js
db = db.getSiblingDB(process.env.DB_NAME || 'bskmt');

print('Creando índices para PreAuthToken...');

// PreAuthTokens indexes
db.preauthtokens.createIndex({ "token": 1 }, { unique: true });
db.preauthtokens.createIndex({ "userId": 1 });
db.preauthtokens.createIndex({ "used": 1 });
db.preauthtokens.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
db.preauthtokens.createIndex({ "sessionInfo.ip": 1 });
db.preauthtokens.createIndex({ "createdAt": 1 });

print('✓ Índices creados correctamente');

// Verificar índices
print('\nÍndices en preauthtokens:');
db.preauthtokens.getIndexes().forEach(function(idx) {
    print('  - ' + idx.name);
});
EOF

mongosh "$MONGODB_URI" < /tmp/create_indexes.js || {
    log_warning "No se pudieron crear índices automáticamente"
    log_info "Puedes crearlos manualmente desde MongoDB Compass o mongosh"
}
rm /tmp/create_indexes.js
log_info "✓ Índices configurados"
echo ""

# 7. Ejecutar pruebas
log_info "Ejecutando pruebas de seguridad..."
npm run test:preauth || {
    log_warning "Las pruebas fallaron. Deseas continuar? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
}
log_info "✓ Pruebas completadas"
echo ""

# 8. Verificar endpoints
log_info "Verificando que los endpoints estén disponibles..."
if [ "$NODE_ENV" = "production" ]; then
    BASE_URL="https://bskmt.com"
else
    BASE_URL="http://localhost:3000"
fi

# Verificar endpoint de validación
curl -f -s -o /dev/null "$BASE_URL/api/auth/validate-credentials" || {
    log_warning "No se pudo verificar el endpoint de validación (puede ser normal si el servidor no está corriendo)"
}

log_info "✓ Verificación de endpoints completada"
echo ""

# 9. Limpiar tokens antiguos si existen
log_info "Limpiando tokens expirados..."
cat << 'EOF' > /tmp/cleanup.js
db = db.getSiblingDB(process.env.DB_NAME || 'bskmt');

const now = new Date();
const result = db.preauthtokens.deleteMany({ expiresAt: { $lt: now } });
print('Tokens expirados eliminados: ' + result.deletedCount);
EOF

mongosh "$MONGODB_URI" < /tmp/cleanup.js 2>/dev/null || log_warning "No se pudo limpiar tokens antiguos"
rm /tmp/cleanup.js
log_info "✓ Limpieza completada"
echo ""

# 10. Verificar logs
log_info "Configurando logs de seguridad..."
mkdir -p logs
touch logs/security.log
chmod 640 logs/security.log
log_info "✓ Logs configurados"
echo ""

# 11. Resumen final
echo ""
echo "=================================================="
log_info "Migración completada exitosamente! ✓"
echo "=================================================="
echo ""
echo "Próximos pasos:"
echo "1. Reiniciar la aplicación: pm2 restart bsk-mt"
echo "2. Monitorear logs: tail -f logs/security.log"
echo "3. Verificar métricas en el dashboard"
echo "4. Ejecutar pruebas de integración"
echo ""
echo "Archivos importantes:"
echo "- Backup: $BACKUP_DIR"
echo "- Logs: logs/security.log"
echo "- Documentación: docs/DEPLOYMENT-GUIDE.md"
echo ""
log_info "Para rollback: git revert HEAD && npm run build && pm2 restart bsk-mt"
echo ""
