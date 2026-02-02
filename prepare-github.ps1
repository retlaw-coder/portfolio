# Script para preparar el proyecto para GitHub
# Ejecutar: .\prepare-github.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Preparando proyecto para GitHub" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Git está instalado
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitInstalled) {
    Write-Host "❌ Git no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "1. Instalar Git desde: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "2. O usar GitHub Desktop: https://desktop.github.com/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Después de instalar, ejecuta este script nuevamente." -ForegroundColor Yellow
    exit
}

Write-Host "✅ Git está instalado" -ForegroundColor Green
Write-Host ""

# Verificar si ya es un repositorio Git
if (Test-Path ".git") {
    Write-Host "⚠️  Este directorio ya es un repositorio Git" -ForegroundColor Yellow
    $response = Read-Host "¿Deseas reinicializarlo? (s/n)"
    if ($response -eq "s") {
        Remove-Item -Recurse -Force ".git"
        git init
        Write-Host "✅ Repositorio reinicializado" -ForegroundColor Green
    }
} else {
    git init
    Write-Host "✅ Repositorio Git inicializado" -ForegroundColor Green
}

Write-Host ""
Write-Host "Archivos a commitear:" -ForegroundColor Cyan
git status --short

Write-Host ""
$response = Read-Host "¿Deseas hacer el primer commit? (s/n)"

if ($response -eq "s") {
    git add .
    git commit -m "Initial commit: Portfolio React migration complete"
    Write-Host "✅ Primer commit creado" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "  Próximos pasos:" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Crea un repositorio en GitHub:" -ForegroundColor Yellow
    Write-Host "   https://github.com/new" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Conecta tu repositorio local:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/TU_USERNAME/portfolio-react.git" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Sube tu código:" -ForegroundColor Yellow
    Write-Host "   git branch -M main" -ForegroundColor White
    Write-Host "   git push -u origin main" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Deploy automático con Vercel:" -ForegroundColor Yellow
    Write-Host "   https://vercel.com/new" -ForegroundColor White
    Write-Host ""
    Write-Host "Lee DEPLOYMENT_GUIDE.md para más detalles" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Para hacer el commit manualmente:" -ForegroundColor Yellow
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m 'Initial commit'" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ ¡Listo!" -ForegroundColor Green
