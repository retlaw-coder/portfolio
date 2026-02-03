# 🚀 Script de Deployment para GitHub Pages
# Este script automatiza el proceso de build y deploy

Write-Host "🚀 Iniciando proceso de deployment..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que estamos en la carpeta correcta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json" -ForegroundColor Red
    Write-Host "   Asegúrate de ejecutar este script desde la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Carpeta del proyecto verificada" -ForegroundColor Green

# 2. Verificar que el modelo 3D existe
if (-not (Test-Path "public\assets\final-city.glb")) {
    Write-Host "❌ Error: No se encontró el modelo 3D en public\assets\final-city.glb" -ForegroundColor Red
    exit 1
}

$modelSize = [math]::Round((Get-Item "public\assets\final-city.glb").Length/1MB, 2)
Write-Host "✅ Modelo 3D encontrado ($modelSize MB)" -ForegroundColor Green

# 3. Limpiar build anterior
Write-Host ""
Write-Host "🧹 Limpiando build anterior..." -ForegroundColor Cyan
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Carpeta dist eliminada" -ForegroundColor Green
}

# 4. Instalar dependencias (si es necesario)
Write-Host ""
Write-Host "📦 Verificando dependencias..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "⏳ Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Dependencias verificadas" -ForegroundColor Green

# 5. Build
Write-Host ""
Write-Host "🔨 Construyendo proyecto..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build completado exitosamente" -ForegroundColor Green

# 6. Verificar que el modelo se copió
if (-not (Test-Path "dist\assets\final-city.glb")) {
    Write-Host "❌ Error: El modelo 3D no se copió a dist\assets\" -ForegroundColor Red
    exit 1
}

$distModelSize = [math]::Round((Get-Item "dist\assets\final-city.glb").Length/1MB, 2)
Write-Host "✅ Modelo 3D copiado a dist ($distModelSize MB)" -ForegroundColor Green

# 7. Preguntar método de deployment
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📤 Selecciona el método de deployment:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. GitHub Actions (Recomendado)" -ForegroundColor White
Write-Host "     → Push a GitHub y deployment automático" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. gh-pages (Manual)" -ForegroundColor White
Write-Host "     → Deploy directo con npm run deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Solo preview local" -ForegroundColor White
Write-Host "     → Ver el sitio localmente antes de deployar" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Cancelar" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$choice = Read-Host "Ingresa tu opción (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔄 Preparando para GitHub Actions..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 Pasos siguientes:" -ForegroundColor Yellow
        Write-Host "  1. Configura GitHub Pages:" -ForegroundColor White
        Write-Host "     → Ve a: Settings → Pages" -ForegroundColor Gray
        Write-Host "     → Source: 'GitHub Actions'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  2. Haz commit y push:" -ForegroundColor White
        Write-Host "     → git add ." -ForegroundColor Gray
        Write-Host "     → git commit -m 'fix: resolve GitHub Pages issues'" -ForegroundColor Gray
        Write-Host "     → git push origin main" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  3. Verifica el deployment:" -ForegroundColor White
        Write-Host "     → Ve a la pestaña 'Actions' en GitHub" -ForegroundColor Gray
        Write-Host "     → Espera a que termine el workflow" -ForegroundColor Gray
        Write-Host ""
        Write-Host "✅ Build listo para GitHub Actions" -ForegroundColor Green
    }
    
    "2" {
        Write-Host ""
        Write-Host "📤 Desplegando con gh-pages..." -ForegroundColor Cyan
        npm run deploy
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Deploy completado" -ForegroundColor Green
            Write-Host ""
            Write-Host "📋 Pasos siguientes:" -ForegroundColor Yellow
            Write-Host "  1. Ve a: Settings → Pages" -ForegroundColor White
            Write-Host "  2. Source: 'gh-pages branch'" -ForegroundColor White
            Write-Host "  3. Espera unos minutos" -ForegroundColor White
            Write-Host "  4. Tu sitio estará en: https://TU_USERNAME.github.io/portfolio/" -ForegroundColor White
        } else {
            Write-Host ""
            Write-Host "❌ Error en el deploy" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "👀 Iniciando preview local..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🌐 El sitio se abrirá en: http://localhost:4173/portfolio/" -ForegroundColor Yellow
        Write-Host "   Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
        Write-Host ""
        npm run preview
    }
    
    "4" {
        Write-Host ""
        Write-Host "❌ Deployment cancelado" -ForegroundColor Yellow
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Opción inválida" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 ¡Proceso completado!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
