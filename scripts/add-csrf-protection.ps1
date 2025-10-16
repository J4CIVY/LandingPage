# PowerShell Script to Add CSRF Protection to All API Endpoints
# This script adds the required import and CSRF validation to all POST/PUT/DELETE/PATCH handlers

$files = @(
    # Users
    "app\api\users\points\route.ts",
    "app\api\users\achievements\route.ts",
    "app\api\users\gamification\route.ts",
    "app\api\users\change-password\route.ts",
    "app\api\users\[id]\route.ts",
    "app\api\users\[id]\profile\route.ts",
    
    # Events
    "app\api\events\route.ts",
    "app\api\events\[id]\route.ts",
    "app\api\events\[id]\register\route.ts",
    "app\api\events\[id]\favorite\route.ts",
    
    # Membership
    "app\api\membership\renew\route.ts",
    "app\api\membership\cancel\route.ts",
    "app\api\membership\request-upgrade\route.ts",
    "app\api\membership\request-endorsement\route.ts",
    "app\api\membership\volunteer-toggle\route.ts",
    "app\api\membership\volunteer-application\route.ts",
    "app\api\membership\apply-leader\route.ts",
    "app\api\membership\leader-application\submit\route.ts",
    "app\api\membership\leader-application\draft\route.ts",
    "app\api\membership\status\route.ts",
    "app\api\membership\history\route.ts",
    
    # Memberships CRUD
    "app\api\memberships\route.ts",
    "app\api\memberships\[id]\route.ts",
    
    # Community
    "app\api\comunidad\publicaciones\route.ts",
    "app\api\comunidad\publicaciones\[id]\route.ts",
    "app\api\comunidad\publicaciones\[id]\reacciones\route.ts",
    "app\api\comunidad\chat\route.ts",
    "app\api\comunidad\chat\[id]\route.ts",
    "app\api\comunidad\grupos\route.ts",
    "app\api\comunidad\grupos\[id]\route.ts",
    "app\api\comunidad\grupos\[id]\miembros\route.ts",
    "app\api\comunidad\comentarios\route.ts",
    "app\api\comunidad\reportes\route.ts",
    "app\api\comunidad\reportes\[id]\route.ts",
    "app\api\comunidad\usuarios-en-linea\route.ts",
    
    # Notifications
    "app\api\notifications\route.ts",
    "app\api\notifications\generate\route.ts",
    "app\api\notifications\admin\generate\route.ts",
    "app\api\notifications\admin\create\route.ts",
    "app\api\notifications\admin\templates\route.ts",
    
    # Leadership
    "app\api\leadership\voting\route.ts",
    "app\api\leadership\voting\[id]\vote\route.ts",
    "app\api\leadership\voting\[id]\control\route.ts",
    "app\api\leadership\decisions\[id]\route.ts",
    "app\api\leadership\announcements\route.ts",
    
    # Emergency
    "app\api\emergencies\route.ts",
    "app\api\emergencies\[id]\route.ts",
    "app\api\pqrsdf\route.ts",
    "app\api\pqrsdf\[id]\route.ts",
    
    # Products
    "app\api\products\route.ts",
    "app\api\products\[id]\route.ts",
    "app\api\benefits\route.ts",
    "app\api\benefits\[id]\route.ts",
    
    # Rewards
    "app\api\rewards\redeem\route.ts",
    
    # Uploads
    "app\api\upload-image\route.ts",
    "app\api\upload-pdf\route.ts",
    
    # Contact
    "app\api\contact\route.ts",
    "app\api\contact\[id]\route.ts",
    "app\api\captcha\challenge\route.ts",
    
    # Admin
    "app\api\admin\users\route.ts",
    "app\api\admin\users\[id]\toggle-status\route.ts",
    "app\api\admin\events\route.ts",
    "app\api\admin\events\[id]\route.ts",
    "app\api\admin\events\[id]\toggle-status\route.ts",
    "app\api\admin\events\[id]\attendance\route.ts",
    "app\api\admin\products\route.ts",
    "app\api\admin\products\[id]\route.ts",
    "app\api\admin\products\[id]\toggle-status\route.ts",
    "app\api\admin\emergencies\route.ts",
    "app\api\admin\emergencies\[id]\route.ts",
    "app\api\admin\membership-plans\route.ts",
    "app\api\admin\membership-plans\[id]\route.ts",
    "app\api\admin\gamification\assign-points\route.ts",
    "app\api\admin\gamification\rewards\route.ts",
    "app\api\admin\security-events\route.ts",
    "app\api\admin\achievements\init\route.ts",
    "app\api\admin\seed-gamification\route.ts"
)

$importLine = "import { requireCSRFToken } from '@/lib/csrf-protection';"
$csrfCheck = @"
    // 0. CSRF Protection (Security Audit Phase 3)
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

"@

$totalFiles = 0
$modifiedFiles = 0
$skippedFiles = 0
$errors = 0

Write-Host "Starting CSRF Protection Implementation..." -ForegroundColor Cyan
Write-Host "Total files to process: $($files.Count)" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $files) {
    $fullPath = "d:\LandingPage\$file"
    $totalFiles++
    
    Write-Host "[$totalFiles/$($files.Count)] Processing: $file" -ForegroundColor White
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "  ❌ File not found, skipping..." -ForegroundColor Red
        $skippedFiles++
        continue
    }
    
    try {
        $content = Get-Content $fullPath -Raw
        $modified = $false
        
        # 1. Check if import already exists
        if ($content -notmatch "requireCSRFToken") {
            # Add import after last import statement
            $content = $content -replace "(import .+ from .+;)(\r?\n)(?!import)", "`$1`$2$importLine`$2"
            $modified = $true
            Write-Host "  ✅ Added import statement" -ForegroundColor Green
        } else {
            Write-Host "  ℹ️  Import already exists" -ForegroundColor Gray
        }
        
        # 2. Add CSRF check to POST/PUT/DELETE/PATCH functions
        # Pattern: export async function POST|PUT|DELETE|PATCH(request: NextRequest)
        $functions = @("POST", "PUT", "DELETE", "PATCH")
        
        foreach ($func in $functions) {
            $pattern = "(export async function $func\([^\)]+\)\s*\{\s*try\s*\{)(\r?\n)"
            
            if ($content -match $pattern) {
                # Check if CSRF validation already exists
                if ($content -notmatch "requireCSRFToken\(request\)") {
                    $content = $content -replace $pattern, "`$1`$2$csrfCheck"
                    $modified = $true
                    Write-Host "  ✅ Added CSRF validation to $func" -ForegroundColor Green
                } else {
                    Write-Host "  ℹ️  CSRF validation already exists for $func" -ForegroundColor Gray
                }
            }
        }
        
        if ($modified) {
            Set-Content -Path $fullPath -Value $content -NoNewline
            $modifiedFiles++
            Write-Host "  ✨ File updated successfully!" -ForegroundColor Cyan
        } else {
            Write-Host "  ⏭️  No changes needed" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
    
    Write-Host ""
}

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "CSRF Protection Implementation Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Total files processed:    $totalFiles" -ForegroundColor White
Write-Host "Files modified:           $modifiedFiles" -ForegroundColor Green
Write-Host "Files skipped:            $skippedFiles" -ForegroundColor Yellow
Write-Host "Errors encountered:       $errors" -ForegroundColor Red
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the changes in git diff" -ForegroundColor White
Write-Host "2. Test all modified endpoints" -ForegroundColor White
Write-Host "3. Update frontend components to use CSRF tokens" -ForegroundColor White
