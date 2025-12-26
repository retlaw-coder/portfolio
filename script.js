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

// --- TRANSICIÓN FADE ---
const overlay = document.querySelector('.page-transition-overlay');
window.addEventListener('load', () => { if(overlay) overlay.classList.remove('active'); });

document.querySelectorAll('.link-transition').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        if(overlay) overlay.classList.add('active');
        setTimeout(() => { window.location.href = target; }, 600);
    });
});

// --- LENIS SCROLL (Solo si NO es mobile para evitar conflictos, o config simple) ---
const lenis = new Lenis({ duration: 1.2, smooth: true });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// --- HOME LOGIC ---
if (document.body.classList.contains('home-page')) {
    
    const stickyNav = document.querySelector(".sticky-nav");
    lenis.on("scroll", (e) => {
        if (e.scroll > window.innerHeight * 0.5) stickyNav.classList.add("visible");
        else stickyNav.classList.remove("visible");
    });

    // Video Preview Logic
    document.querySelectorAll(".project-item").forEach((item) => {
      const video = item.querySelector("video");
      item.addEventListener("mouseenter", () => {
        if (video) { video.currentTime = 0; video.play().catch(() => {}); }
      });
      item.addEventListener("mouseleave", () => {
        if (video) video.pause();
      });
      item.addEventListener("touchstart", () => {
          if (video) video.play().catch(() => {});
      }, {passive: true});
    });

    // 3D Scene
    const canvas = document.querySelector("#hero-canvas");
    if(canvas) {
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
        dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
        loader.setDRACOLoader(dracoLoader);

        loader.load("assets/mis-edificios.glb", (gltf) => {
            model = gltf.scene;
            model.position.set(5, -2, 0); 
            model.scale.set(0.07, 0.07, 0.07);
            model.rotation.y = -0.5;
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
                if(window.innerWidth < 768) model.rotation.y += 0.002;
                else {
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
}

// --- PROJECT DETAIL LOGIC ---
if (document.body.classList.contains('project-page')) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    // DATA REAL
    const projectData = {
        1: { 
            title: "Departamento", desc: "Renderizado realista de interiores.", stack: ["Blender", "Cycles"], 
            imgs: ["assets/proyecto1.png"], 
            vids: ["assets/proyecto1.mp4"] 
        },
        2: { 
            title: "Tren Montañas", desc: "Animación de entorno natural.", stack: ["Blender", "Animation"], 
            imgs: ["assets/proyecto2.png"], 
            vids: ["assets/proyecto2.mp4"] 
        },
        3: { 
            title: "Nike Lab", desc: "Motion graphics y simulación de producto.", stack: ["Simulation", "Motion"], 
            imgs: ["assets/proyecto3.png"], 
            vids: ["assets/proyecto3.mp4"] 
        },
        4: { 
            title: "Proyecto 4", desc: "Descripción Proyecto 4", stack: ["Blender", "Cycles"], 
            imgs: ["assets/proyecto4.png"], 
            vids: ["assets/proyecto4.mp4"] 
        },
        5: { 
            title: "Proyecto 5", desc: "Descripción Proyecto 5", stack: ["Blender", "Cycles"], 
            // 4 IMÁGENES, SIN VIDEO
            imgs: ["assets/proyecto5_0.png", "assets/proyecto5_1.png", "assets/proyecto5_0.png", "assets/proyecto5_1.png"], 
            vids: [] 
        },
        6: { 
            title: "Proyecto 6", desc: "Descripción Proyecto 6", stack: ["Blender", "Cycles"], 
            imgs: ["assets/proyecto7.png"], 
            vids: ["assets/proyecto7.mp4"] 
        },
    };

    if (id && projectData[id]) {
        const data = projectData[id];
        document.getElementById("detail-title").innerText = data.title;
        document.getElementById("detail-desc").innerText = data.desc;
        const ul = document.getElementById("detail-stack-list");
        if(ul) ul.innerHTML = data.stack.map(t => `<li>${t}</li>`).join('');
        
        const grid = document.querySelector(".detail-media-grid");
        
        // 1. CARGAR VIDEO (SOLO SI EXISTE)
        if(data.vids && data.vids.length > 0) {
            data.vids.forEach(vidSrc => {
                const v = document.createElement('div'); v.className = 'detail-item full-width';
                v.innerHTML = `<video src="${vidSrc}" controls autoplay muted loop playsinline></video>`;
                grid.appendChild(v);
            });
        }

        // 2. CARGAR IMÁGENES
        if(data.imgs) {
            data.imgs.forEach(src => {
                const i = document.createElement('div'); i.className = 'detail-item';
                i.innerHTML = `<img src="${src}">`;
                grid.appendChild(i);
            });
        }
    }
}

// --- MODAL CONTACTO ---
const modal = document.getElementById("contact-modal");
if(modal) {
    const openBtns = document.querySelectorAll(".open-contact-trigger");
    const closeBtn = document.getElementById("close-modal-btn");
    
    openBtns.forEach(btn => btn.addEventListener("click", () => {
        modal.classList.add("active");
        lenis.stop();
        document.body.classList.add("no-scroll");
    }));
    
    const closeModal = () => {
        modal.classList.remove("active");
        lenis.start();
        document.body.classList.remove("no-scroll");
    };
    
    if(closeBtn) closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if(e.target === modal) closeModal(); });
}

// Language Toggle
const langBtns = document.querySelectorAll('#lang-switch-nav, #lang-switch-hero');
let currentLang = "es";
langBtns.forEach(btn => btn.addEventListener("click", () => {
    currentLang = currentLang === "es" ? "en" : "es";
    document.querySelectorAll("[data-es]").forEach(el => {
        el.innerText = el.getAttribute(`data-${currentLang}`);
    });
    // Update button text
    langBtns.forEach(b => b.querySelector('.lang-text') ? b.querySelector('.lang-text').innerText = currentLang.toUpperCase() : b.innerText = currentLang.toUpperCase());
}));
