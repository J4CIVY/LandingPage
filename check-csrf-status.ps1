# Script para verificar archivos que necesitan CSRF en frontend

Write-Host "Buscando archivos frontend que necesitan CSRF..." -ForegroundColor Cyan
Write-Host ""

# Buscar archivos con fetch POST/PUT/PATCH/DELETE pero SIN getCSRFToken
$archivosConMutaciones = Get-ChildItem -Path "d:\LandingPage\app","d:\LandingPage\components" -Recurse -Include *.tsx,*.ts -Exclude *node_modules* | ForEach-Object {
    $contenido = Get-Content $_.FullName -Raw
    
    # Verificar si tiene mutaciones (POST/PUT/PATCH/DELETE)
    $tieneMutaciones = $contenido -match "method:\s*['`"](?:POST|PUT|PATCH|DELETE)['`"]"
    
    # Verificar si ya tiene getCSRFToken importado
    $tieneCSRF = $contenido -match 'getCSRFToken'
    
    if ($tieneMutaciones -and -not $tieneCSRF) {
        [PSCustomObject]@{
            Archivo = $_.FullName.Replace("d:\LandingPage\", "")
            TieneMutaciones = "SI"
            TieneCSRF = "NO"
        }
    }
}

Write-Host "ARCHIVOS QUE NECESITAN ACTUALIZACION:" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""

$archivosConMutaciones | ForEach-Object {
    Write-Host "PENDIENTE: $($_.Archivo)" -ForegroundColor Red
}

Write-Host ""
Write-Host "TOTAL: $($archivosConMutaciones.Count) archivos necesitan CSRF" -ForegroundColor Yellow
Write-Host ""

# Listar archivos YA actualizados con CSRF
Write-Host "ARCHIVOS YA ACTUALIZADOS CON CSRF:" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""

$archivosConCSRF = Get-ChildItem -Path "d:\LandingPage\app","d:\LandingPage\components" -Recurse -Include *.tsx,*.ts -Exclude *node_modules* | ForEach-Object {
    $contenido = Get-Content $_.FullName -Raw
    
    $tieneMutaciones = $contenido -match "method:\s*['`"](?:POST|PUT|PATCH|DELETE)['`"]"
    $tieneCSRF = $contenido -match 'getCSRFToken'
    
    if ($tieneMutaciones -and $tieneCSRF) {
        [PSCustomObject]@{
            Archivo = $_.FullName.Replace("d:\LandingPage\", "")
        }
    }
}

$archivosConCSRF | ForEach-Object {
    Write-Host "COMPLETO: $($_.Archivo)" -ForegroundColor Green
}

Write-Host ""
Write-Host "TOTAL: $($archivosConCSRF.Count) archivos YA tienen CSRF" -ForegroundColor Green
Write-Host ""

# Resumen
Write-Host "RESUMEN GENERAL:" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host "Actualizados: $($archivosConCSRF.Count) archivos" -ForegroundColor Green
Write-Host "Pendientes: $($archivosConMutaciones.Count) archivos" -ForegroundColor Red
$total = $archivosConCSRF.Count + $archivosConMutaciones.Count
if ($total -gt 0) {
    $porcentaje = [math]::Round(($archivosConCSRF.Count / $total) * 100, 1)
    Write-Host "Progreso: $porcentaje%" -ForegroundColor Yellow
}
Write-Host ""

# Guardar listado en archivo
$archivosConMutaciones | Export-Csv -Path "d:\LandingPage\CSRF_PENDING_FILES.csv" -NoTypeInformation -Encoding UTF8
Write-Host "Lista guardada en: CSRF_PENDING_FILES.csv" -ForegroundColor Cyan
