# ✅ Checklist de Deployment - GitHub Pages

## 📋 Antes de Deployar

### Verificaciones Locales

- [ ] **Build funciona correctamente**
  ```bash
  npm run build
  ```
  ✅ Debe completarse sin errores

- [ ] **Preview funciona localmente**
  ```bash
  npm run preview
  ```
  ✅ El sitio debe verse correctamente en http://localhost:4173/portfolio/

- [ ] **El modelo 3D aparece**
  ✅ Debes ver la ciudad 3D en la sección Hero

- [ ] **Navegación funciona**
  ✅ Todos los links deben funcionar

- [ ] **Responsive funciona**
  ✅ Prueba en diferentes tamaños de pantalla (F12 → Device Toolbar)

---

## 🔧 Archivos Críticos

Verifica que estos archivos existan y estén correctos:

### Configuración

- [ ] **`vite.config.js`**
  ```javascript
  base: "/portfolio/",  // ← Debe coincidir con el nombre de tu repo
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  ```

- [ ] **`package.json`**
  ```json
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
  ```

### Assets

- [ ] **`public/assets/final-city.glb`** existe (4.32 MB)
- [ ] **`public/404.html`** existe (para rutas SPA)

### GitHub Actions

- [ ] **`.github/workflows/deploy.yml`** existe

---

## 🚀 Proceso de Deployment

### Método 1: GitHub Actions (Recomendado)

#### Paso 1: Configurar GitHub Pages
- [ ] Ve a: `https://github.com/TU_USERNAME/portfolio/settings/pages`
- [ ] En "Source", selecciona: **"GitHub Actions"**
- [ ] Click en "Save"

#### Paso 2: Commit y Push
```bash
git add .
git commit -m "fix: resolve GitHub Pages deployment issues"
git push origin main
```

- [ ] Commit realizado
- [ ] Push completado

#### Paso 3: Verificar Deployment
- [ ] Ve a: `https://github.com/TU_USERNAME/portfolio/actions`
- [ ] Verifica que el workflow "Deploy to GitHub Pages" esté corriendo
- [ ] Espera a que termine (✅ verde)
- [ ] Tiempo estimado: 2-5 minutos

#### Paso 4: Verificar el Sitio
- [ ] Abre: `https://TU_USERNAME.github.io/portfolio/`
- [ ] El sitio carga correctamente
- [ ] El modelo 3D aparece
- [ ] No hay errores en la consola (F12)

---

### Método 2: gh-pages (Manual)

#### Paso 1: Deploy
```bash
npm run deploy
```

- [ ] Deploy completado sin errores

#### Paso 2: Configurar GitHub Pages
- [ ] Ve a: `https://github.com/TU_USERNAME/portfolio/settings/pages`
- [ ] En "Source", selecciona: **"gh-pages branch"**
- [ ] Click en "Save"

#### Paso 3: Esperar
- [ ] Espera 2-3 minutos
- [ ] GitHub Pages procesará el deployment

#### Paso 4: Verificar
- [ ] Abre: `https://TU_USERNAME.github.io/portfolio/`
- [ ] El sitio funciona correctamente

---

## 🔍 Verificación Post-Deployment

### Consola del Navegador

Abre la consola (F12) y verifica:

#### ✅ Mensajes Esperados (BUENOS)
```
✅ Loading model from: /portfolio/assets/final-city.glb
✅ Model loaded successfully!
```

#### ⚠️ Mensajes que PUEDES IGNORAR
```
❌ A listener indicated an asynchronous response...
```
→ Estos son de extensiones del navegador (Grammarly, etc.)

#### ❌ Mensajes que INDICAN PROBLEMAS
```
❌ SyntaxError: Unexpected token 'v', "version ht"... is not valid JSON
❌ 404 (Not Found) - final-city.glb
```
→ Si ves estos, consulta `GITHUB_PAGES_FIX.md`

---

### Pruebas Funcionales

- [ ] **Hero Section**
  - [ ] El modelo 3D aparece
  - [ ] El modelo responde al mouse (desktop)
  - [ ] El modelo rota automáticamente (mobile)

- [ ] **Navegación**
  - [ ] Todos los links funcionan
  - [ ] El scroll es suave
  - [ ] Las animaciones funcionan

- [ ] **Proyectos**
  - [ ] Las imágenes cargan
  - [ ] Los videos funcionan
  - [ ] Los modales se abren correctamente

- [ ] **Responsive**
  - [ ] Desktop (>1024px) ✅
  - [ ] Tablet (768px-1024px) ✅
  - [ ] Mobile (<768px) ✅

- [ ] **Performance**
  - [ ] El sitio carga en menos de 3 segundos
  - [ ] No hay lag al hacer scroll
  - [ ] Las animaciones son fluidas

---

## 🐛 Troubleshooting

### El modelo 3D no aparece

**Verificar en la consola:**
```javascript
// Deberías ver:
Loading model from: /portfolio/assets/final-city.glb
Model loaded successfully!
```

**Si ves error 404:**
1. [ ] Verifica que `public/assets/final-city.glb` existe
2. [ ] Verifica que `base: "/portfolio/"` en `vite.config.js` es correcto
3. [ ] Rebuild: `npm run build`
4. [ ] Redeploy

**Si ves error de JSON:**
1. [ ] Verifica que `vite.config.js` tiene `assetsInclude: ['**/*.glb']`
2. [ ] Rebuild y redeploy

---

### Errores 404 en rutas

**Ejemplo:** `https://tu-sitio.com/portfolio/about` da 404

**Solución:**
1. [ ] Verifica que `public/404.html` existe
2. [ ] Verifica que `index.html` tiene el script de redirección
3. [ ] Limpia el caché: `Ctrl + Shift + R`

---

### El sitio no se actualiza

**Posibles causas:**
1. [ ] **Caché del navegador** → `Ctrl + Shift + R`
2. [ ] **GitHub Pages no actualizado** → Espera 5 minutos
3. [ ] **Deployment falló** → Revisa Actions en GitHub

---

## 📊 Métricas de Éxito

Tu deployment es exitoso si:

- ✅ El sitio carga en `https://TU_USERNAME.github.io/portfolio/`
- ✅ El modelo 3D aparece sin errores
- ✅ Todas las secciones funcionan
- ✅ La navegación es fluida
- ✅ No hay errores críticos en la consola
- ✅ El sitio es responsive

---

## 🎯 Comandos Rápidos

```bash
# Ver preview local
npm run preview

# Rebuild
npm run build

# Deploy manual
npm run deploy

# Script automático (Windows)
.\deploy.ps1

# Ver estado de git
git status

# Ver logs de deployment
git log --oneline -5
```

---

## 📚 Recursos Adicionales

- 📘 **[RESUMEN_CORRECCIONES.md](RESUMEN_CORRECCIONES.md)** - Qué se corrigió y por qué
- 📗 **[GITHUB_PAGES_FIX.md](GITHUB_PAGES_FIX.md)** - Guía completa de troubleshooting
- 📕 **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Guía general de deployment

---

## ✅ Deployment Completado

Si marcaste todas las casillas, ¡tu portfolio está listo! 🎉

**URL de tu sitio:** `https://TU_USERNAME.github.io/portfolio/`

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. **Revisa la consola del navegador** (F12)
2. **Consulta `GITHUB_PAGES_FIX.md`** para soluciones detalladas
3. **Verifica los logs de GitHub Actions** si usaste ese método
4. **Prueba localmente primero** con `npm run preview`

**Recuerda:** Los errores de "message channel" son normales y vienen de extensiones del navegador. Puedes ignorarlos.
