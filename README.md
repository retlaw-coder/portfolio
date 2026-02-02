# Portfolio - Walter Custodio

Portfolio personal de Walter Custodio - 3D Artist & Multimedia Designer.

![Portfolio Preview](./public/walter-cv.png)

## 🚀 Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool & dev server
- **React Router** - SPA routing
- **Three.js** - 3D graphics
- **CSS3** - Styling (no frameworks)

## ✨ Features

- 🎨 **Modern Design** - Tech/cyberpunk aesthetic
- 🌐 **Bilingual** - Spanish & English support
- 📱 **Fully Responsive** - Mobile, tablet, desktop optimized
- 🎭 **3D Hero** - Interactive Three.js scene (desktop only)
- ⚡ **Fast Loading** - Optimized assets & code splitting
- 🎯 **Smooth Animations** - Custom loader & transitions
- 👆 **Touch Gestures** - Swipe navigation on mobile
- ♿ **Accessible** - ARIA labels, keyboard navigation

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/portfolio-react.git
cd portfolio-react

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠️ Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
portfolio-react/
├── public/
│   ├── assets/          # Project images & videos
│   └── walter-cv.png    # CV image
├── src/
│   ├── components/      # React components
│   │   ├── Loader.jsx
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── CategoryView.jsx
│   │   ├── ProjectViewer.jsx
│   │   ├── OtherProjects.jsx
│   │   └── ContactModal.jsx
│   ├── hooks/
│   │   └── useSwipe.js  # Custom hooks
│   ├── data/
│   │   └── projects.json # Project data
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Adding New Projects

Edit `src/data/projects.json`:

```json
{
  "id": "10",
  "category": "3d",
  "title": "Nuevo Proyecto",
  "title_en": "New Project",
  "subtitle": "3D / Animation",
  "subtitle_en": "3D / Animation",
  "desc": "Descripción del proyecto",
  "desc_en": "Project description",
  "stack": ["Blender", "After Effects"],
  "link": "https://example.com",
  "assets": [
    { "type": "video", "src": "p10_v0.mp4", "vertical": false },
    { "type": "image", "src": "p10_0.png", "vertical": false }
  ]
}
```

Add your assets to `public/assets/`.

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

### GitHub Pages

Update `vite.config.js`:

```javascript
export default defineConfig({
  base: '/portfolio-react/',
  // ...
})
```

Then:

```bash
npm run build
# Deploy dist/ to gh-pages branch
```

## 📝 License

MIT License - feel free to use this template for your own portfolio!

## 👤 Author

**Walter Custodio**
- Portfolio: [waltercustodio.com](https://waltercustodio.com)
- Location: Argentina

## 🙏 Acknowledgments

- Three.js for 3D graphics
- Vite for blazing fast builds
- React team for the amazing framework
