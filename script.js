import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/DRACOLoader.js";
import Lenis from "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/+esm";

const ASSETS_PATH = "assets/";
const DATA_URL = "data.json";

// --- LOADER ---
const loaderElement = document.getElementById("loader");
const progressText = document.querySelector(".loader-progress");
const overlay = document.querySelector('.page-transition-overlay');

if (loaderElement) {
    let loadProgress = 0;
    const fakeLoad = setInterval(() => {
        loadProgress += Math.floor(Math.random() * 10) + 5;
        if (loadProgress > 100) loadProgress = 100;
        if (progressText) progressText.innerText = loadProgress + "%";
        if (loadProgress === 100) {
            clearInterval(fakeLoad);
            loaderElement.classList.add('loader-hidden');
        }
    }, 30);
}

window.addEventListener('load', () => { if (overlay) overlay.classList.remove('active'); });
window.addEventListener('pageshow', () => { if (overlay) overlay.classList.remove('active'); });

function bindLinks() {
    document.querySelectorAll('.link-transition').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('href');
            if (target && target !== '#' && !target.startsWith('mailto')) {
                e.preventDefault();
                if (overlay) overlay.classList.add('active');
                setTimeout(() => { window.location.href = target; }, 600);
            }
        });
    });
}
bindLinks();

// --- LENIS SCROLL ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);


// ==========================================
// NUEVO SISTEMA DE CURSOR FANTASMA (NEÓN)
// ==========================================

// Configuración
const TRAIL_LENGTH = 12; // Cantidad de fantasmas
const HEAD_LERP = 0.15;  // Velocidad del cursor principal (0.1 = lento, 1 = instantaneo)
const TAIL_LERP = 0.25;  // Qué tan rápido la cola alcanza a la cabeza

// Variables de estado
let mouseX = 0, mouseY = 0;
let cursorElements = []; // Array para guardar los divs

// Solo activar en Desktop
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    initGhostCursor();
}

function initGhostCursor() {
    // 1. Crear Cursor Principal (Cabeza)
    const head = document.createElement('div');
    head.className = 'cursor-head';
    document.body.appendChild(head);
    
    // Guardamos la cabeza en el array (índice 0)
    cursorElements.push({
        el: head,
        x: 0,
        y: 0
    });

    // 2. Crear Fantasmas (Cola)
    for (let i = 0; i < TRAIL_LENGTH; i++) {
        const ghost = document.createElement('div');
        ghost.className = 'cursor-ghost';
        document.body.appendChild(ghost);

        // Opacidad decreciente (el último es casi invisible)
        // Calcula opacidad: empieza en 0.5 y baja hasta 0
        const opacity = 0.6 * (1 - (i / TRAIL_LENGTH));
        ghost.style.opacity = opacity;
        
        // Escala decreciente (opcional, para efecto cometa)
        const scale = 1 - (i / TRAIL_LENGTH) * 0.5;
        ghost.style.transform = `translate(-50%, -50%) scale(${scale})`;

        cursorElements.push({
            el: ghost,
            x: 0,
            y: 0
        });
    }

    // 3. Listener de movimiento real
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Detectar Hover para agrandar la cabeza
        const target = e.target;
        if (target.tagName === 'A' || target.tagName === 'BUTTON' || 
            target.closest('.interactive-card') || target.closest('.interactive-btn')) {
            head.classList.add('hovered');
        } else {
            head.classList.remove('hovered');
        }
    });

    // 4. Loop de Animación (Física)
    animateCursor();
}

function animateCursor() {
    // A. Mover la cabeza hacia el mouse
    // Usamos interpolación lineal (Lerp) para suavidad
    const head = cursorElements[0];
    head.x += (mouseX - head.x) * HEAD_LERP;
    head.y += (mouseY - head.y) * HEAD_LERP;
    head.el.style.left = `${head.x}px`;
    head.el.style.top = `${head.y}px`;

    // B. Mover cada fantasma hacia el elemento ANTERIOR
    // Esto crea el efecto de cadena o serpiente
    for (let i = 1; i < cursorElements.length; i++) {
        const current = cursorElements[i];
        const prev = cursorElements[i - 1]; // El elemento al que persigue

        // Lerp hacia el anterior
        current.x += (prev.x - current.x) * TAIL_LERP;
        current.y += (prev.y - current.y) * TAIL_LERP;

        current.el.style.left = `${current.x}px`;
        current.el.style.top = `${current.y}px`;
    }

    requestAnimationFrame(animateCursor);
}


// --- EFECTO ONDA EXPANSIVA (MOBILE) ---
document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    createRipple(touch.clientX, touch.clientY);
}, { passive: true });

function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'mobile-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);
    setTimeout(() => { ripple.remove(); }, 600);
}


// --- RESTO DE TU APP (DATA, RENDER, ETC) ---

async function initApp() {
    try {
        const response = await fetch(DATA_URL);
        const projectsData = await response.json();

        if (document.body.classList.contains('home-page')) {
            renderHome(projectsData);
            initThreeJS();
        } else if (document.body.classList.contains('project-page')) {
            renderProjectDetail(projectsData);
        }
    } catch (error) {
        console.error("Error System:", error);
    }
}
initApp();

function renderHome(data) {
    const container = document.getElementById('dynamic-projects-list');
    if (!container) return;

    container.innerHTML = data.map((p, index) => {
        const thumbImg = `${ASSETS_PATH}p${p.id}_0.png`;
        const hoverVid = `${ASSETS_PATH}p${p.id}_v.mp4`;
        const num = (index + 1).toString().padStart(2, '0');

        return `
        <a href="project.html?id=${p.id}" class="project-item interactive-card link-transition">
            <div class="corner-accent top-left"></div><div class="corner-accent top-right"></div>
            <div class="corner-accent bottom-left"></div><div class="corner-accent bottom-right"></div>
            <span class="project-number">${num}</span>
            <div class="project-media">
                <img src="${thumbImg}" alt="${p.title}" loading="lazy" />
                <video src="${hoverVid}" loop muted playsinline></video>
            </div>
            <div class="project-info">
                <h3>${p.title}</h3>
                <p>${p.subtitle}</p>
            </div>
        </a>
        `;
    }).join('');

    bindLinks();
    
    document.querySelectorAll(".project-item").forEach((item) => {
        const video = item.querySelector("video");
        if(video) {
            video.addEventListener("error", () => { video.style.display = 'none'; });
            item.addEventListener("mouseenter", () => { video.currentTime = 0; video.play().catch(()=>{}); });
            item.addEventListener("mouseleave", () => { video.pause(); });
        }
    });

    const stickyNav = document.querySelector(".sticky-nav");
    lenis.on("scroll", (e) => {
        if (e.scroll > window.innerHeight * 0.5) stickyNav.classList.add("visible");
        else stickyNav.classList.remove("visible");
    });
}

async function renderProjectDetail(allProjects) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const project = allProjects.find(p => p.id === id);

    if (!project) { window.location.href = 'index.html'; return; }

    const sidebar = document.querySelector('.detail-sidebar');
    
    sidebar.innerHTML = `
        <div class="detail-header-block">
            <span class="detail-meta-label">PROJECT_ID: ${project.id.padStart(3, '0')}</span>
            <h1>${project.title}</h1>
            <span class="detail-meta-label" style="margin-top:10px; color:var(--accent-color)">// ${project.subtitle}</span>
        </div>
        <div class="detail-body-block">
            <span class="detail-meta-label">SYSTEM_DESC:</span>
            <p class="detail-desc-text">${project.desc}</p>
            
            <span class="detail-meta-label">TOOLS_USED:</span>
            <div class="tech-tags-container" style="margin-bottom: 20px;">
                ${project.stack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
             <span class="detail-meta-label">STATUS:</span>
             <p style="font-family: var(--font-mono); font-size: 0.8rem; color: #fff;">COMPLETED_RENDER</p>
        </div>
    `;

    const grid = document.querySelector(".detail-media-grid");
    
    const heroVidPath = `${ASSETS_PATH}p${id}_v.mp4`;
    const vidContainer = document.createElement('div');
    vidContainer.className = 'detail-item full-width';
    
    const vidCaption = project.captions && project.captions["video"] ? 
        `<p class="project-caption">// ${project.captions["video"]}</p>` : '';
        
    vidContainer.innerHTML = `
        <video src="${heroVidPath}" controls autoplay muted loop playsinline></video>
        ${vidCaption}
    `;
    grid.appendChild(vidContainer);

    let index = 0; 
    let keepLoading = true;

    while (keepLoading && index < 25) { 
        const imgPath = `${ASSETS_PATH}p${id}_${index}.png`;
        try {
            const response = await fetch(imgPath, { method: 'HEAD' });
            if (response.ok) {
                const el = document.createElement('div');
                el.className = 'detail-item';
                el.innerHTML = `<img src="${imgPath}" loading="lazy">`;
                grid.appendChild(el);

                if (project.captions && project.captions[index.toString()]) {
                    const cap = document.createElement('p');
                    cap.className = 'project-caption';
                    cap.innerText = `// ${project.captions[index.toString()]}`;
                    grid.appendChild(cap);
                }
                index++;
            } else {
                keepLoading = false;
            }
        } catch (e) { keepLoading = false; }
    }
    
    setTimeout(() => lenis.resize(), 500);
}

const modal = document.getElementById("contact-modal");
if(modal) {
    document.querySelectorAll(".open-contact-trigger").forEach(btn => 
        btn.addEventListener("click", () => {
            modal.classList.add("active");
            lenis.stop();
        })
    );
    document.getElementById("close-modal-btn")?.addEventListener("click", () => {
        modal.classList.remove("active");
        lenis.start();
    });
}

let currentLang = "es";
document.querySelectorAll('#lang-switch-nav, #lang-switch-hero').forEach(btn => 
    btn.addEventListener("click", () => {
        currentLang = currentLang === "es" ? "en" : "es";
        document.querySelectorAll("[data-es]").forEach(el => {
            el.innerText = el.getAttribute(`data-${currentLang}`);
        });
        const span = btn.querySelector('.lang-text');
        if(span) span.innerText = currentLang.toUpperCase();
        else btn.innerText = currentLang.toUpperCase();
    })
);

function initThreeJS() {
    const canvas = document.querySelector("#hero-canvas");
    if(!canvas) return;

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