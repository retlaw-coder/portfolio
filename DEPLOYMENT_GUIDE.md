# 🚀 Guía de Deployment a GitHub

## Paso 1: Inicializar Git (si no está inicializado)

```bash
cd portfolio-react
git init
```

## Paso 2: Crear repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Nombre del repositorio: `portfolio-react` (o el que prefieras)
3. Descripción: "Portfolio personal - React + Vite + Three.js"
4. **NO** marques "Initialize with README" (ya tenemos uno)
5. Click en "Create repository"

## Paso 3: Conectar tu proyecto local con GitHub

GitHub te dará comandos como estos (cópialos de tu repo):

```bash
# Agregar remote
git remote add origin https://github.com/TU_USERNAME/portfolio-react.git

# O si usas SSH:
git remote add origin git@github.com:TU_USERNAME/portfolio-react.git
```

## Paso 4: Primer commit y push

```bash
# Ver archivos a commitear
git status

# Agregar todos los archivos
git add .

# Crear commit
git commit -m "Initial commit: Portfolio React migration complete"

# Subir a GitHub
git push -u origin main
```

Si te pide cambiar de `master` a `main`:

```bash
git branch -M main
git push -u origin main
```

---

## 🌐 Deployment Automático con Vercel

### Opción A: Desde GitHub (Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Vite
5. Click en "Deploy"
6. ¡Listo! Tu portfolio estará en `https://tu-proyecto.vercel.app`

**Ventaja:** Cada push a GitHub despliega automáticamente.

### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

---

## 🔧 Deployment con Netlify

### Desde la web

1. Ve a [netlify.com](https://netlify.com)
2. Click en "Add new site" → "Import an existing project"
3. Conecta con GitHub
4. Selecciona tu repositorio
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click en "Deploy"

### Desde CLI

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy a producción
netlify deploy --prod
```

---

## 📄 Deployment con GitHub Pages

### 1. Actualizar vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/portfolio-react/', // Nombre de tu repo
})
```

### 2. Instalar gh-pages

```bash
npm install --save-dev gh-pages
```

### 3. Agregar scripts a package.json

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### 4. Deploy

```bash
npm run deploy
```

### 5. Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: `gh-pages` branch
4. Save

Tu sitio estará en: `https://TU_USERNAME.github.io/portfolio-react/`

---

## 🔐 Variables de Entorno (Opcional)

Si necesitas API keys o secrets:

### 1. Crear archivo .env.local

```bash
VITE_API_KEY=tu_api_key
VITE_CONTACT_EMAIL=tu@email.com
```

### 2. Usar en código

```javascript
const apiKey = import.meta.env.VITE_API_KEY;
```

### 3. Configurar en Vercel/Netlify

- Vercel: Settings → Environment Variables
- Netlify: Site settings → Environment variables

**Importante:** `.env.local` está en `.gitignore`, nunca lo subas a GitHub.

---

## 📊 Monitoreo y Analytics (Opcional)

### Google Analytics

```bash
npm install react-ga4
```

```javascript
// src/main.jsx
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');
```

### Vercel Analytics

```bash
npm install @vercel/analytics
```

```javascript
// src/App.jsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      {/* Tu app */}
      <Analytics />
    </>
  );
}
```

---

## ✅ Checklist Pre-Deploy

- [ ] Todos los assets están en `public/`
- [ ] `data.json` tiene todos los proyectos
- [ ] No hay console.logs innecesarios
- [ ] Build funciona: `npm run build`
- [ ] Preview funciona: `npm run preview`
- [ ] README.md actualizado
- [ ] .gitignore configurado
- [ ] Git commit hecho

---

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Failed to resolve import"
- Verifica que las rutas de imports sean correctas
- Usa rutas relativas o absolutas consistentemente

### 404 en rutas de React Router (GitHub Pages)
- Agrega un archivo `404.html` que redirija a `index.html`
- O usa HashRouter en vez de BrowserRouter

### Build muy grande
```bash
# Analizar bundle
npm run build -- --mode analyze
```

---

## 📝 Comandos Útiles de Git

```bash
# Ver estado
git status

# Ver cambios
git diff

# Agregar archivos específicos
git add src/components/Header.jsx

# Commit con mensaje
git commit -m "feat: add new project"

# Push
git push

# Pull (traer cambios)
git pull

# Ver historial
git log --oneline

# Crear nueva rama
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main

# Merge rama
git merge feature/nueva-funcionalidad
```

---

## 🎉 ¡Listo!

Tu portfolio está listo para ser desplegado. Elige la plataforma que prefieras:

- **Vercel** → Más fácil, deploy automático
- **Netlify** → Similar a Vercel, buenas features
- **GitHub Pages** → Gratis, integrado con GitHub

**Recomendación:** Usa Vercel para la mejor experiencia.
