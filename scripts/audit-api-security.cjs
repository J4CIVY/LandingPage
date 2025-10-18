#!/usr/bin/env node
/**
 * Script de Auditoría de Seguridad para Endpoints de API
 * 
 * Escanea todos los endpoints de /app/api y verifica si tienen
 * protección de autenticación implementada.
 * 
 * Uso: node scripts/audit-api-security.js
 */

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '..', 'app', 'api');

// Patrones que indican protección
const PROTECTED_PATTERNS = [
  'requireAuth',
  'requireAdmin',
  'requireSuperAdmin',
  'requireLeader',
  'authenticateApiRequest',
  'withAuth',
  'createAuthErrorResponse'
];

// Rutas públicas conocidas (no necesitan protección)
const PUBLIC_ROUTES = [
  '/api/health',
  '/api/webhooks',
  '/api/captcha',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-email',
  '/api/auth/reset-password',
  '/api/auth/refresh-token',
  '/api/weather/current'
];

const results = {
  total: 0,
  protected: 0,
  unprotected: 0,
  public: 0,
  files: []
};

/**
 * Verifica si un archivo tiene protección de autenticación
 */
function hasAuthProtection(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si importa el middleware de auth
    const hasAuthImport = content.includes('@/lib/api-auth-middleware');
    
    // Verificar si usa alguno de los patrones de protección
    const usesAuthPattern = PROTECTED_PATTERNS.some(pattern => 
      content.includes(pattern)
    );
    
    return hasAuthImport && usesAuthPattern;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Verifica si la ruta es pública
 */
function isPublicRoute(routePath) {
  return PUBLIC_ROUTES.some(publicRoute => 
    routePath.includes(publicRoute.replace('/api/', ''))
  );
}

/**
 * Escanea recursivamente el directorio de API
 */
function scanDirectory(dir, baseRoute = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const routePath = path.join(baseRoute, entry.name);
    
    if (entry.isDirectory()) {
      // Directorio dinámico [id], [slug], etc.
      const dirName = entry.name.startsWith('[') && entry.name.endsWith(']')
        ? entry.name.slice(1, -1)
        : entry.name;
      
      scanDirectory(fullPath, path.join(baseRoute, dirName));
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      results.total++;
      
      const apiRoute = '/api/' + baseRoute.replace(/\\/g, '/');
      const isPublic = isPublicRoute(apiRoute);
      const isProtected = hasAuthProtection(fullPath);
      
      const fileInfo = {
        path: fullPath,
        route: apiRoute,
        isPublic,
        isProtected,
        status: isPublic ? 'PUBLIC' : (isProtected ? 'PROTECTED' : 'UNPROTECTED')
      };
      
      results.files.push(fileInfo);
      
      if (isPublic) {
        results.public++;
      } else if (isProtected) {
        results.protected++;
      } else {
        results.unprotected++;
      }
    }
  }
}

/**
 * Genera el reporte
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('🔒 REPORTE DE AUDITORÍA DE SEGURIDAD DE APIs');
  console.log('='.repeat(80));
  console.log(`\n📊 RESUMEN:`);
  console.log(`   Total de endpoints:     ${results.total}`);
  console.log(`   ✅ Protegidos:          ${results.protected} (${((results.protected/results.total)*100).toFixed(1)}%)`);
  console.log(`   🌐 Públicos:            ${results.public} (${((results.public/results.total)*100).toFixed(1)}%)`);
  console.log(`   ⚠️  SIN PROTECCIÓN:     ${results.unprotected} (${((results.unprotected/results.total)*100).toFixed(1)}%)`);
  
  if (results.unprotected > 0) {
    console.log(`\n⚠️  ENDPOINTS SIN PROTECCIÓN (CRÍTICO):\n`);
    
    const unprotectedFiles = results.files.filter(f => f.status === 'UNPROTECTED');
    unprotectedFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.route}`);
      console.log(`      → ${file.path.replace(process.cwd(), '.')}`);
    });
  }
  
  console.log(`\n✅ ENDPOINTS PROTEGIDOS:\n`);
  const protectedFiles = results.files.filter(f => f.status === 'PROTECTED');
  protectedFiles.slice(0, 10).forEach((file, index) => {
    console.log(`   ${index + 1}. ${file.route}`);
  });
  
  if (protectedFiles.length > 10) {
    console.log(`   ... y ${protectedFiles.length - 10} más`);
  }
  
  console.log(`\n🌐 ENDPOINTS PÚBLICOS (Permitidos):\n`);
  const publicFiles = results.files.filter(f => f.status === 'PUBLIC');
  publicFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file.route}`);
  });
  
  console.log('\n' + '='.repeat(80));
  
  // Guardar reporte en archivo JSON
  const reportPath = path.join(__dirname, '..', 'api-security-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Reporte completo guardado en: ${reportPath}`);
  console.log('='.repeat(80) + '\n');
  
  // Código de salida
  if (results.unprotected > 0) {
    console.error('❌ ALERTA: Se encontraron endpoints sin protección!');
    process.exit(1);
  } else {
    console.log('✅ Todos los endpoints están protegidos correctamente.');
    process.exit(0);
  }
}

// Ejecutar auditoría
console.log('🔍 Iniciando auditoría de seguridad de APIs...\n');

if (!fs.existsSync(API_DIR)) {
  console.error(`❌ Error: No se encontró el directorio de API en ${API_DIR}`);
  process.exit(1);
}

scanDirectory(API_DIR);
generateReport();
