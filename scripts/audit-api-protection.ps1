# Script de Auditoría de Protección de Rutas API
# Este script escanea todas las rutas API y muestra cuáles están protegidas

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  Auditoría de Protección BFF - Rutas API" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# Rutas que deben ser públicas (sin protección)
$publicRoutes = @(
    "*\auth\login\route.ts",
    "*\auth\register\route.ts",
    "*\auth\verify-email\route.ts",
    "*\auth\reset-password\route.ts",
    "*\auth\forgot-password\route.ts",
    "*\health\route.ts",
    "*\webhooks\*\route.ts"
)

# Contadores
$totalRoutes = 0
$protectedRoutes = 0
$unprotectedRoutes = 0
$publicRouteCount = 0

# Arrays para almacenar rutas
$unprotectedList = @()
$protectedList = @()
$publicList = @()

Write-Host "Escaneando rutas API..." -ForegroundColor Yellow
Write-Host ""

# Obtener todas las rutas
$routes = Get-ChildItem -Path ".\app\api" -Recurse -Filter "route.ts"

foreach ($route in $routes) {
    $totalRoutes++
    $relativePath = $route.FullName.Replace((Get-Location).Path, "").TrimStart('\')
    $content = Get-Content $route.FullName -Raw
    
    # Verificar si es ruta pública
    $isPublicRoute = $false
    foreach ($pattern in $publicRoutes) {
        if ($relativePath -like $pattern) {
            $isPublicRoute = $true
            $publicRouteCount++
            $publicList += $relativePath
            break
        }
    }
    
    if ($isPublicRoute) {
        continue
    }
    
    # Verificar si está protegida
    $hasProtection = $content -match "withApiProtection|withAdminProtection"
    
    if ($hasProtection) {
        $protectedRoutes++
        $protectedList += $relativePath
    } else {
        $unprotectedRoutes++
        $unprotectedList += $relativePath
    }
}

# Mostrar resultados
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  RESUMEN" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total de rutas API encontradas: $totalRoutes" -ForegroundColor White
Write-Host "Rutas públicas (sin protección): $publicRouteCount" -ForegroundColor Blue
Write-Host "Rutas protegidas: $protectedRoutes" -ForegroundColor Green
Write-Host "Rutas SIN proteger: $unprotectedRoutes" -ForegroundColor Red
Write-Host ""

# Calcular porcentaje (excluyendo rutas públicas)
$routesQueDebenProtegerse = $totalRoutes - $publicRouteCount
if ($routesQueDebenProtegerse -gt 0) {
    $percentage = [math]::Round(($protectedRoutes / $routesQueDebenProtegerse) * 100, 2)
    Write-Host "Progreso de protección: $percentage%" -ForegroundColor Yellow
    
    # Barra de progreso visual
    $barLength = 50
    $filledLength = [math]::Floor($barLength * $percentage / 100)
    $bar = "█" * $filledLength + "░" * ($barLength - $filledLength)
    Write-Host "[$bar] $percentage%" -ForegroundColor Yellow
}
Write-Host ""

# Mostrar rutas públicas
if ($publicList.Count -gt 0) {
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host "  RUTAS PÚBLICAS (OK - Sin protección)" -ForegroundColor Blue
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host ""
    foreach ($route in $publicList) {
        Write-Host "  ✓ $route" -ForegroundColor Blue
    }
    Write-Host ""
}

# Mostrar rutas protegidas
if ($protectedList.Count -gt 0) {
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host "  RUTAS PROTEGIDAS (OK)" -ForegroundColor Green
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host ""
    foreach ($route in $protectedList) {
        Write-Host "  ✓ $route" -ForegroundColor Green
    }
    Write-Host ""
}

# Mostrar rutas sin protección
if ($unprotectedList.Count -gt 0) {
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host "  RUTAS SIN PROTECCION (REQUIEREN ATENCION)" -ForegroundColor Red
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host ""
    foreach ($route in $unprotectedList) {
        Write-Host "  ✗ $route" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Estas rutas necesitan ser protegidas con:" -ForegroundColor Yellow
    Write-Host "  - withApiProtection() para rutas que requieren autenticación" -ForegroundColor Yellow
    Write-Host "  - withAdminProtection() para rutas solo de administrador" -ForegroundColor Yellow
    Write-Host ""
}

# Recomendaciones
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  PRÓXIMOS PASOS" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

if ($unprotectedRoutes -gt 0) {
    Write-Host "1. Revisa las rutas sin protección listadas arriba" -ForegroundColor Yellow
    Write-Host "2. Para cada ruta, determina si es pública o requiere protección" -ForegroundColor Yellow
    Write-Host "3. Si es pública, agrégala a la lista \$publicRoutes en este script" -ForegroundColor Yellow
    Write-Host "4. Si requiere protección, usa el wrapper apropiado:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Para usuarios autenticados:" -ForegroundColor White
    Write-Host "   export const GET = withApiProtection(async (req, ctx) => { ... });" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Para solo administradores:" -ForegroundColor White
    Write-Host "   export const GET = withAdminProtection(async (req, ctx) => { ... });" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. Ejecuta este script nuevamente para verificar el progreso" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ ¡Excelente! Todas las rutas están correctamente protegidas." -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Yellow
    Write-Host "1. Verifica que las variables de entorno BFF estén configuradas" -ForegroundColor White
    Write-Host "2. Prueba cada ruta para asegurar que la protección funciona" -ForegroundColor White
    Write-Host "3. Actualiza el frontend para usar useSecureApi()" -ForegroundColor White
    Write-Host ""
}

Write-Host "Para más información, consulta: docs/BFF_IMPLEMENTATION.md" -ForegroundColor Cyan
Write-Host ""
