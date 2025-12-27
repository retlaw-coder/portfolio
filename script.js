import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/DRACOLoader.js";
import Lenis from "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/+esm";

// --- LOADER (Solo carga inicial home) ---
const loaderElement = document.getElementById("loader");
const progressText = document.querySelector(".loader-progress");

let progress = 0;
const fakeLoad = setInterval(() => {
  progress += Math.floor(Math.random() * 10) + 5;
  if (progress > 100) progress = 100;
  if(progressText) progressText.innerText = progress + "%";

  if (progress === 100) {
    clearInterval(fakeLoad);
    if(loaderElement) loaderElement.classList.add('loader-hidden');
  }
}, 50);

// --- TRANSICIÓN FADE ENTRE PÁGINAS ---
const overlay = document.querySelector('.page-transition-overlay');
// Al cargar la página, quitamos el negro
window.addEventListener('load', () => { if(overlay) overlay.classList.remove('active'); });

// Al hacer clic en un link, ponemos el negro
document.querySelectorAll('.link-transition').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        if(overlay) overlay.classList.add('active');
        setTimeout(() => { window.location.href = target; }, 600); // Espera la transición CSS
    });
});

// --- LENIS SCROLL ---
const lenis = new Lenis({ duration: 1.2, smooth: true });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// =================================================================
// LÓGICA DE LA PÁGINA PRINCIPAL (HOME)
// =================================================================
if (document.body.classList.contains('home-page')) {
    
    // Sticky Nav (Aparece al scrollear)
    const stickyNav = document.querySelector(".sticky-nav");
    lenis.on("scroll", (e) => {
        if (e.scroll > window.innerHeight * 0.5) stickyNav.classList.add("visible");
        else stickyNav.classList.remove("visible");
    });

    // Lógica de Preview de Video (Desktop Hover + Mobile Touch)
    document.querySelectorAll(".project-item").forEach((item) => {
      const video = item.querySelector("video");
      item.addEventListener("mouseenter", () => {
        if (video) { video.currentTime = 0; video.play().catch(() => {}); }
      });
      item.addEventListener("mouseleave", () => {
        if (video) video.pause();
      });
      // Soporte táctil
      item.addEventListener("touchstart", () => {
          if (video) video.play().catch(() => {});
      }, {passive: true});
    });

    // Escena 3D (Solo se carga en la Home)
    initThreeJS();
}

// =================================================================
// LÓGICA DE LA PÁGINA DE PROYECTO (DETALLE)
// =================================================================
if (document.body.classList.contains('project-page')) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    // --- BASE DE DATOS DE PROYECTOS ---
    const projectData = {
        1: { 
            title: "Departamento", 
            desc: "Renderizado realista de interiores buscando una iluminación cálida y texturas fotorrealistas.", 
            stack: ["Blender", "Cycles", "Archviz"], 
            imgs: ["assets/proyecto1.png"], 
            vids: ["assets/proyecto1.mp4"] 
        },
        2: { 
            title: "Tren Montañas", 
            desc: "Animación de entorno natural con énfasis en la escala y la atmósfera.", 
            stack: ["Blender", "Animation", "Environment"], 
            imgs: ["assets/proyecto2.png"], 
            vids: ["assets/proyecto2.mp4"] 
        },
        3: { 
            title: "Voronoi Flux", 
            desc: "Exploración de caos organizado. Motion graphics abstractos generados mediante teselación Voronoi y manipulación temporal.", 
            stack: ["After Effects", "Simulation", "Noise"], 
            imgs: ["assets/proyecto3.png"], 
            vids: ["assets/proyecto3.mp4"] 
        },
        4: { 
            title: "Visual Experiments", 
            desc: "Colección de experimentos visuales y pruebas de renderizado.", 
            stack: ["Blender", "Cycles"], 
            imgs: ["assets/proyecto4.png"], 
            vids: ["assets/proyecto4.mp4"] 
        },
        5: { 
            title: "100 Felines", 
            desc: "Estudio de carácter y movimiento a través de la ilustración. Una colección de bocetos rápidos capturando la esencia felina.", 
            stack: ["Photoshop", "2D Illustration", "Sketching"], 
            // PROYECTO 5: SOLO IMÁGENES (0 al 3)
            imgs: [
                "assets/proyecto5_0.png", 
                "assets/proyecto5_1.png", 
                "assets/proyecto5_2.png", 
                "assets/proyecto5_3.png"
            ], 
            vids: [] // Array vacío, no mostrará reproductor
        },
        6: { 
            title: "Procedural Span", 
            desc: "Arquitectura generativa. Puente animado creado íntegramente con Geometry Nodes, permitiendo variaciones infinitas.", 
            stack: ["Blender", "Geometry Nodes", "Procedural"], 
            // PROYECTO 6: CORREGIDO
            imgs: ["assets/proyecto6.png"], 
            vids: ["assets/proyecto6.mp4"] 
        },
    };

    // Inyectar contenido si existe el ID
    if (id && projectData[id]) {
        const data = projectData[id];
        
        // Textos
        document.getElementById("detail-title").innerText = data.title;
        document.getElementById("detail-desc").innerText = data.desc;
        
        // Lista de tecnologías
        const ul = document.getElementById("detail-stack-list");
        if(ul) ul.innerHTML = data.stack.map(t => `<li>${t}</li>`).join('');
        
        const grid = document.querySelector(".detail-media-grid");
        
        // 1. CARGAR VIDEO (Solo si el array tiene elementos)
        if(data.vids && data.vids.length > 0) {
            data.vids.forEach(vidSrc => {
                const v = document.createElement('div'); 
                v.className = 'detail-item full-width'; // Video ocupa ancho completo
                v.innerHTML = `<video src="${vidSrc}" controls autoplay muted loop playsinline></video>`;
                grid.appendChild(v);
            });
        }

        // 2. CARGAR IMÁGENES
        if(data.imgs && data.imgs.length > 0) {
            data.imgs.forEach(src => {
                const i = document.createElement('div'); 
                i.className = 'detail-item';
                i.innerHTML = `<img src="${src}" alt="${data.title}">`;
                grid.appendChild(i);
            });
        }
    }
}

// --- MODAL DE CONTACTO (GLOBAL) ---
const modal = document.getElementById("contact-modal");
if(modal) {
    const openBtns = document.querySelectorAll(".open-contact-trigger");
    const closeBtn = document.getElementById("close-modal-btn");
    
    // Abrir Modal
    openBtns.forEach(btn => btn.addEventListener("click", () => {
        modal.classList.add("active");
        lenis.stop();
        document.body.classList.add("no-scroll");
    }));
    
    // Cerrar Modal
    const closeModal = () => {
        modal.classList.remove("active");
        lenis.start();
        document.body.classList.remove("no-scroll");
    };
    
    if(closeBtn) closeBtn.addEventListener("click", closeModal);
    // Cerrar al hacer clic fuera del contenido
    modal.addEventListener("click", (e) => { if(e.target === modal) closeModal(); });
}

// --- CAMBIO DE IDIOMA ---
let currentLang = "es";
const langBtns = document.querySelectorAll('#lang-switch-nav, #lang-switch-hero');

langBtns.forEach(btn => btn.addEventListener("click", () => {
    currentLang = currentLang === "es" ? "en" : "es";
    
    // Cambiar textos data-es / data-en
    document.querySelectorAll("[data-es]").forEach(el => {
        el.innerText = el.getAttribute(`data-${currentLang}`);
    });

    // Actualizar texto del botón
    langBtns.forEach(b => {
        const span = b.querySelector('.lang-text');
        if(span) span.innerText = currentLang.toUpperCase();
        else b.innerText = currentLang.toUpperCase();
    });
}));

// --- ESCENA 3D (THREE.JS) ---
function initThreeJS() {
    const canvas = document.querySelector("#hero-canvas");
    if(!canvas) return; // Si no hay canvas (ej: en project.html), no ejecutar

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 5);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    let model;
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    // Usamos el decoder de Google estático
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
    loader.setDRACOLoader(dracoLoader);

    loader.load("assets/mis-edificios.glb", (gltf) => {
        model = gltf.scene;
        model.position.set(5, -2, 0); 
        model.scale.set(0.07, 0.07, 0.07);
        model.rotation.y = -0.5; // Posición inicial
        scene.add(model);
    });

    let mouseX = 0, mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    
    document.addEventListener("mousemove", (event) => {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    });

    const animate = () => {
        requestAnimationFrame(animate);
        if (model) {
            // DETECCIÓN MOBILE: Si el ancho es menor a 768px, rota solo
            if(window.innerWidth < 768) {
                model.rotation.y += 0.002; // Velocidad de rotación automática
            } else {
                // DESKTOP: Interacción con el mouse (Lerp suave)
                model.rotation.y += 0.05 * ((mouseX * 0.0005 - 0.5) - model.rotation.y);
                model.rotation.x += 0.05 * (mouseY * 0.0005 - model.rotation.x);
            }
        }
        renderer.render(scene, camera);
    };
    animate();
    
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
