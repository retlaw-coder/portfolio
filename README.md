# Portfolio - Walter Custodio

Portfolio personal desarrollado con React + Vite, Three.js y animaciones modernas.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 📁 Estructura del Proyecto

```
portfolio-main/
├── public/
│   └── assets/          # Imágenes, videos y modelo 3D
├── src/
│   ├── components/      # Componentes React
│   ├── data/           # Datos de proyectos
│   ├── utils/          # Utilidades
│   └── main.jsx        # Punto de entrada
├── index.html
├── package.json
└── vite.config.js
```

## 🎨 Características

- ✨ Animaciones suaves con Lenis
- 🎯 Cursor personalizado
- 🌐 Modelo 3D interactivo (Three.js)
- 📱 Diseño responsive
- 🚀 Optimizado para rendimiento
- 🌍 Multiidioma (ES/EN)

## 🛠️ Tecnologías

- React 18
- Vite
- Three.js
- Lenis (smooth scroll)
- WebP (imágenes optimizadas)

## 📦 Deployment

El proyecto está configurado para GitHub Pages con base path `/portfolio/`.

```bash
npm run build
```

Los archivos de producción se generan en la carpeta `dist/`.

## 🎯 Configuración del Modelo 3D

Para ajustar la posición, escala o rotación del modelo 3D, edita:

**Archivo:** `src/components/Hero.jsx` (líneas 51-59)

```javascript
// Posición (X, Y, Z)
model.position.set(3, -2, 0);

// Escala
model.scale.set(0.065, 0.065, 0.065);

// Rotación
model.rotation.y = -5;
```

## 📄 Licencia

© 2026 Walter Custodio. Todos los derechos reservados.
