# 🚀 Quick Start Guide

## Ver el Portfolio en Vivo

El servidor ya está corriendo en: **http://localhost:5173**

Solo abre tu navegador y ve a esa URL.

---

## 📦 Subir a GitHub

### Opción 1: Usar el Script Automático (Recomendado)

```powershell
# En PowerShell, dentro de portfolio-react/
.\prepare-github.ps1
```

Este script:
- ✅ Verifica que Git esté instalado
- ✅ Inicializa el repositorio
- ✅ Hace el primer commit
- ✅ Te da los próximos pasos

### Opción 2: Manual

Si Git no está instalado:
1. Descarga Git: https://git-scm.com/download/win
2. Instala con opciones por defecto
3. Reinicia tu terminal
4. Ejecuta el script o sigue los pasos manuales

### Pasos Manuales (si prefieres hacerlo tú)

```bash
# 1. Inicializar Git
git init

# 2. Agregar archivos
git add .

# 3. Primer commit
git commit -m "Initial commit: Portfolio React"

# 4. Crear repo en GitHub (ve a github.com/new)

# 5. Conectar con GitHub
git remote add origin https://github.com/TU_USERNAME/portfolio-react.git

# 6. Subir código
git branch -M main
git push -u origin main
```

---

## 🌐 Deploy a Producción

### Vercel (Más Fácil - Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Importa tu repo de GitHub
4. Click "Deploy"
5. ¡Listo! Tu portfolio estará en línea

**Deploy automático:** Cada push a GitHub actualiza tu sitio.

### Netlify (Alternativa)

1. Ve a [netlify.com](https://netlify.com)
2. "Add new site" → "Import from Git"
3. Selecciona tu repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Build
npm run build        # Construye para producción
npm run preview      # Preview del build

# Git
git status           # Ver cambios
git add .            # Agregar todos los archivos
git commit -m "msg"  # Crear commit
git push             # Subir a GitHub
```

---

## 📝 Agregar Nuevos Proyectos

1. Edita `src/data/projects.json`
2. Agrega tus imágenes/videos a `public/assets/`
3. Formato:

```json
{
  "id": "10",
  "category": "3d",
  "title": "Mi Proyecto",
  "title_en": "My Project",
  "subtitle": "3D / Animation",
  "subtitle_en": "3D / Animation",
  "desc": "Descripción",
  "desc_en": "Description",
  "stack": ["Blender", "After Effects"],
  "assets": [
    { "type": "image", "src": "p10_0.png", "vertical": false }
  ]
}
```

---

## 🐛 Problemas Comunes

### El servidor no inicia
```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
npm run dev
```

### Git no funciona
- Instala Git: https://git-scm.com/download/win
- O usa GitHub Desktop: https://desktop.github.com/

### Build falla
```bash
# Limpiar y rebuild
npm run build
```

---

## 📚 Documentación Completa

- **README.md** - Información general del proyecto
- **DEPLOYMENT_GUIDE.md** - Guía detallada de deployment
- **FINAL_SUMMARY.md** - Resumen de la migración
- **MIGRATION_GUIDE.md** - Detalles técnicos de la migración

---

## ✅ Checklist

- [x] Proyecto React funcionando
- [x] Servidor corriendo en localhost:5173
- [ ] Git instalado
- [ ] Repositorio en GitHub creado
- [ ] Código subido a GitHub
- [ ] Deploy en Vercel/Netlify

---

## 🎉 ¡Listo para Producción!

Tu portfolio está completo y listo para ser desplegado.

**Próximo paso:** Ejecuta `.\prepare-github.ps1` y sigue las instrucciones.
