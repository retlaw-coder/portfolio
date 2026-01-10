import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/DRACOLoader.js";
import Lenis from "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/+esm";

// --- CONFIGURACIÓN GLOBAL ---
const ASSETS_PATH = "assets/";
const DATA_URL = "data.json";
let currentLang = "es"; // Estado global del idioma
let currentProjectData = null; // Para guardar datos del proyecto actual y traducir

// --- 1. LOADER & TRANSICIONES ---
const loaderElement = document.getElementById("loader");
const progressText = document.querySelector(".loader-progress");
const overlay = document.querySelector(".page-transition-overlay");

if (loaderElement) {
  let loadProgress = 0;
  const fakeLoad = setInterval(() => {
    loadProgress += Math.floor(Math.random() * 10) + 5;
    if (loadProgress > 100) loadProgress = 100;
    if (progressText) progressText.innerText = loadProgress + "%";
    if (loadProgress === 100) {
      clearInterval(fakeLoad);
      loaderElement.classList.add("loader-hidden");
    }
  }, 30);
}

window.addEventListener("load", () => {
  if (overlay) overlay.classList.remove("active");
});
window.addEventListener("pageshow", () => {
  if (overlay) overlay.classList.remove("active");
});

function bindLinks() {
  document.querySelectorAll(".link-transition").forEach((link) => {
    if (link.dataset.bound) return;
    link.addEventListener("click", (e) => {
      const target = link.getAttribute("href");
      if (target && target !== "#" && !target.startsWith("mailto")) {
        e.preventDefault();
        if (overlay) overlay.classList.add("active");
        setTimeout(() => {
          window.location.href = target;
        }, 600);
      }
    });
    link.dataset.bound = true;
  });
}
bindLinks();

// --- 2. LENIS SCROLL ---
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- 3. VISUAL FX ---

// A. GHOST CURSOR
const TRAIL_LENGTH = 12;
const HEAD_LERP = 0.15;
const TAIL_LERP = 0.25;
let mouseX = 0,
  mouseY = 0;
let cursorElements = [];

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  initGhostCursor();
}

function initGhostCursor() {
  const head = document.createElement("div");
  head.className = "cursor-head";
  document.body.appendChild(head);
  cursorElements.push({ el: head, x: 0, y: 0 });

  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const ghost = document.createElement("div");
    ghost.className = "cursor-ghost";
    document.body.appendChild(ghost);
    const opacity = 0.6 * (1 - i / TRAIL_LENGTH);
    ghost.style.opacity = opacity;
    const scale = 1 - (i / TRAIL_LENGTH) * 0.5;
    ghost.style.transform = `translate(-50%, -50%) scale(${scale})`;
    cursorElements.push({ el: ghost, x: 0, y: 0 });
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    const target = e.target;
    if (
      target.tagName === "A" ||
      target.tagName === "BUTTON" ||
      target.closest(".interactive-card") ||
      target.closest(".interactive-btn") ||
      target.closest(".nav-sidebar-btn") ||
      target.closest(".video-wrapper")
    ) {
      head.classList.add("hovered");
    } else {
      head.classList.remove("hovered");
    }
  });
  animateCursor();
}

function animateCursor() {
  const head = cursorElements[0];
  head.x += (mouseX - head.x) * HEAD_LERP;
  head.y += (mouseY - head.y) * HEAD_LERP;
  head.el.style.left = `${head.x}px`;
  head.el.style.top = `${head.y}px`;

  for (let i = 1; i < cursorElements.length; i++) {
    const current = cursorElements[i];
    const prev = cursorElements[i - 1];
    current.x += (prev.x - current.x) * TAIL_LERP;
    current.y += (prev.y - current.y) * TAIL_LERP;
    current.el.style.left = `${current.x}px`;
    current.el.style.top = `${current.y}px`;
  }
  requestAnimationFrame(animateCursor);
}

// B. RIPPLE
document.addEventListener(
  "touchstart",
  (e) => {
    const touch = e.touches[0];
    createRipple(touch.clientX, touch.clientY);
  },
  { passive: true }
);

function createRipple(x, y) {
  const ripple = document.createElement("div");
  ripple.className = "mobile-ripple";
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  document.body.appendChild(ripple);
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// --- 4. APP LOGIC ---

async function initApp() {
  try {
    const response = await fetch(DATA_URL);
    const projectsData = await response.json();

    if (document.body.classList.contains("home-page")) {
      renderHome(projectsData);
      initThreeJS();
    } else if (document.body.classList.contains("project-page")) {
      renderProjectDetail(projectsData);
    }

    setupLanguageSwitcher(); // Iniciar lógica de idioma
  } catch (error) {
    console.error("Error System:", error);
  }
}
initApp();

// --- RENDER HOME ---
function renderHome(data) {
  const container = document.getElementById("dynamic-projects-list");
  if (!container) return;

  container.innerHTML = data
    .map((p, index) => {
      const thumbImg = `${ASSETS_PATH}p${p.id}_0.png`;
      const hoverVid = `${ASSETS_PATH}p${p.id}_v0.mp4`;
      const num = (index + 1).toString().padStart(2, "0");

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
    })
    .join("");

  bindLinks();

  document.querySelectorAll(".project-item").forEach((item) => {
    const video = item.querySelector("video");
    if (video) {
      video.addEventListener("error", () => {
        video.style.display = "none";
      });
      item.addEventListener("mouseenter", () => {
        video.currentTime = 0;
        video.play().catch(() => {});
      });
      item.addEventListener("mouseleave", () => {
        video.pause();
      });
    }
  });

  const stickyNav = document.querySelector(".sticky-nav");
  lenis.on("scroll", (e) => {
    if (e.scroll > window.innerHeight * 0.5) stickyNav.classList.add("visible");
    else stickyNav.classList.remove("visible");
  });
}

// --- RENDER PROJECT DETAIL (MODO GALERÍA) ---
async function renderProjectDetail(allProjects) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const currentIndex = allProjects.findIndex((p) => p.id === id);
  const project = allProjects[currentIndex];

  if (!project) {
    window.location.href = "index.html";
    return;
  }

  currentProjectData = project;

  // A. Sidebar Nav Loop
  const total = allProjects.length;
  const nextIndex = (currentIndex + 1) % total;
  const prevIndex = (currentIndex - 1 + total) % total;
  const nextId = allProjects[nextIndex].id;
  const prevId = allProjects[prevIndex].id;

  const prevBtn = document.getElementById("prev-project-btn");
  const nextBtn = document.getElementById("next-project-btn");
  if (prevBtn) prevBtn.setAttribute("href", `project.html?id=${prevId}`);
  if (nextBtn) nextBtn.setAttribute("href", `project.html?id=${nextId}`);
  bindLinks();

  // B. Sidebar Info
  const sidebar = document.querySelector(".detail-sidebar");
  sidebar.innerHTML = `
        <div class="detail-header-block">
            <span class="detail-meta-label">PROJECT_ID: ${project.id.padStart(
              3,
              "0"
            )}</span>
            <h1 id="dyn-title">${project.title}</h1>
            <span class="detail-meta-label" style="margin-top:10px; color:var(--accent-color)" id="dyn-subtitle">// ${
              project.subtitle
            }</span>
        </div>
        <div class="detail-body-block">
            <span class="detail-meta-label" data-es="DESCRIPCIÓN_SISTEMA:" data-en="SYSTEM_DESC:">DESCRIPCIÓN_SISTEMA:</span>
            <p class="detail-desc-text" id="dyn-desc">${project.desc}</p>
            <span class="detail-meta-label" data-es="HERRAMIENTAS:" data-en="TOOLS_USED:">HERRAMIENTAS:</span>
            <div class="tech-tags-container" style="margin-bottom: 20px;">
                ${project.stack
                  .map((tech) => `<span class="tech-tag">${tech}</span>`)
                  .join("")}
            </div>
             <span class="detail-meta-label">STATUS:</span>
             <p style="font-family: var(--font-mono); font-size: 0.8rem; color: #fff;">COMPLETED_RENDER</p>
        </div>
    `;

  // C. Recolectar Assets (Videos e Imágenes unificados)
  // Intentamos detectar qué archivos existen (v0, 0.png, v1, 1.png, etc.)
  const assets = [];

  // 1. Chequear Video Hero (v0)
  const v0Path = `${ASSETS_PATH}p${id}_v0.mp4`;
  try {
    const res = await fetch(v0Path, { method: "HEAD" });
    if (res.ok) {
      assets.push({
        type: "video",
        src: v0Path,
        caption: project.captions?.v0 || "Main Sequence",
      });
    }
  } catch (e) {}

  // 2. Loop de detección mixta (Imágenes y Videos extra)
  let index = 0;
  let keepLoading = true;
  let consecutiveErrors = 0;

  while (keepLoading && index < 20) {
    let foundSomething = false;

    // Chequear Imagen
    const imgPath = `${ASSETS_PATH}p${id}_${index}.png`;
    try {
      const res = await fetch(imgPath, { method: "HEAD" });
      if (res.ok) {
        assets.push({
          type: "image",
          src: imgPath,
          caption:
            project.captions?.[index.toString()] || `Render View ${index}`,
        });
        foundSomething = true;
      }
    } catch (e) {}

    // Chequear Video Extra (v1, v2...) - Omitimos v0 porque ya lo cargamos
    if (index > 0) {
      const vidPath = `${ASSETS_PATH}p${id}_v${index}.mp4`;
      try {
        const res = await fetch(vidPath, { method: "HEAD" });
        if (res.ok) {
          assets.push({
            type: "video",
            src: vidPath,
            caption: project.captions?.[`v${index}`] || `Sequence ${index}`,
          });
          foundSomething = true;
        }
      } catch (e) {}
    }

    if (foundSomething) consecutiveErrors = 0;
    else consecutiveErrors++;

    // Si fallamos 3 veces seguidas, asumimos que no hay más
    if (consecutiveErrors > 2) keepLoading = false;
    index++;
  }

  // D. Renderizar Estructura de Galería
  const mainGrid = document.querySelector(".detail-media-grid");
  mainGrid.innerHTML = ""; // Limpiar

  if (assets.length === 0) {
    mainGrid.innerHTML =
      '<p style="color:#666; font-family:monospace;">// NO_MEDIA_FOUND</p>';
    return;
  }

  // Contenedor General
  const galleryContainer = document.createElement("div");
  galleryContainer.className = "gallery-container";

  // 1. Display Principal (Inicia con el primer asset)
  const initialAsset = assets[0];
  const displayDiv = document.createElement("div");
  displayDiv.className = "gallery-display";
  displayDiv.innerHTML = generateDisplayHTML(initialAsset);
  galleryContainer.appendChild(displayDiv);

  // 2. Miniaturas
  const thumbsContainer = document.createElement("div");
  thumbsContainer.className = "gallery-thumbs";

  assets.forEach((asset, idx) => {
    const thumb = document.createElement("div");
    thumb.className = `thumb-item ${idx === 0 ? "active" : ""}`;

    // Contenido del thumb (Video tag si es video, Img si es imagen)
    let innerHTML = "";
    if (asset.type === "video") {
      innerHTML = `
            <video src="${asset.src}#t=0.1" preload="metadata" muted playsinline></video>
            <span class="thumb-type-icon">VID</span>
          `;
    } else {
      innerHTML = `<img src="${asset.src}" loading="lazy">`;
    }
    thumb.innerHTML = innerHTML;

    // --- EVENTO CLICK ---
    thumb.addEventListener("click", () => {
      // Remover clase active de todos
      document
        .querySelectorAll(".thumb-item")
        .forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");

      if (window.innerWidth > 900) {
        // DESKTOP: Cambiar Display Principal
        displayDiv.innerHTML = generateDisplayHTML(asset);
        // Si es video, reproducir automáticamente
        const vid = displayDiv.querySelector("video");
        if (vid) vid.play().catch(() => {});
      } else {
        // MOBILE: Abrir Lightbox (Primer Plano)
        openLightbox(asset);
      }
    });

    thumbsContainer.appendChild(thumb);
  });

  galleryContainer.appendChild(thumbsContainer);
  mainGrid.appendChild(galleryContainer);

  updatePageLanguage();
  setTimeout(() => lenis.resize(), 500);
}

// --- HELPER: Generar HTML para el Display ---
function generateDisplayHTML(asset) {
  if (asset.type === "video") {
    return `
            <video src="${asset.src}" controls autoplay loop muted playsinline style="width:100%; height:100%; object-fit:contain;"></video>
            <div class="display-caption">// ${asset.caption}</div>
        `;
  } else {
    return `
            <img src="${asset.src}" alt="Project Image">
            <div class="display-caption">// ${asset.caption}</div>
        `;
  }
}

// --- HELPER: Lightbox para Móvil ---
function openLightbox(asset) {
  // Buscar si ya existe el lightbox, si no crearlo
  let lightbox = document.querySelector(".lightbox-overlay");
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.className = "lightbox-overlay";
    lightbox.innerHTML = `
            <button class="lightbox-close">×</button>
            <div class="lightbox-content"></div>
        `;
    document.body.appendChild(lightbox);

    // Cerrar eventos
    lightbox.querySelector(".lightbox-close").addEventListener("click", () => {
      lightbox.classList.remove("active");
      lightbox.querySelector(".lightbox-content").innerHTML = ""; // Limpiar para detener videos
    });
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove("active");
        lightbox.querySelector(".lightbox-content").innerHTML = "";
      }
    });
  }

  const contentDiv = lightbox.querySelector(".lightbox-content");
  // Usamos el mismo generador, pero aseguramos controles en video
  if (asset.type === "video") {
    contentDiv.innerHTML = `<video src="${asset.src}" controls autoplay loop playsinline></video>`;
  } else {
    contentDiv.innerHTML = `<img src="${asset.src}">`;
  }

  lightbox.classList.add("active");
}

// --- 5. LANGUAGE SYSTEM ---
function setupLanguageSwitcher() {
  const langBtns = document.querySelectorAll(
    "#lang-switch-nav, #lang-switch-hero"
  );

  langBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentLang = currentLang === "es" ? "en" : "es";

      // Actualizar Botones
      langBtns.forEach((b) => {
        const span = b.querySelector(".lang-text");
        if (span) span.innerText = currentLang.toUpperCase();
        else b.innerText = currentLang.toUpperCase();
      });

      updatePageLanguage();
    });
  });
}

function updatePageLanguage() {
  // 1. Textos estáticos (data-es / data-en)
  document.querySelectorAll("[data-es]").forEach((el) => {
    const text = el.getAttribute(`data-${currentLang}`);
    if (text) el.innerText = text;
  });

  // 2. Textos dinámicos del proyecto (Si estamos en detalle)
  if (document.body.classList.contains("project-page") && currentProjectData) {
    const titleEl = document.getElementById("dyn-title");
    const subEl = document.getElementById("dyn-subtitle");
    const descEl = document.getElementById("dyn-desc");

    if (titleEl) titleEl.innerText = currentProjectData.title; // Título suele ser igual, pero se puede agregar title_en
    if (subEl)
      subEl.innerText = `// ${
        currentLang === "es"
          ? currentProjectData.subtitle
          : currentProjectData.subtitle_en || currentProjectData.subtitle
      }`;
    if (descEl)
      descEl.innerText =
        currentLang === "es"
          ? currentProjectData.desc
          : currentProjectData.desc_en || currentProjectData.desc;
  }
}

// --- 6. EXTRAS (Modal) ---
const modal = document.getElementById("contact-modal");
if (modal) {
  document.querySelectorAll(".open-contact-trigger").forEach((btn) =>
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

// --- 7. THREE.JS SCENE ---
function initThreeJS() {
  const canvas = document.querySelector("#hero-canvas");
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1, 5);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
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
  dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
  );
  loader.setDRACOLoader(dracoLoader);

  loader.load("assets/mis-edificios.glb", (gltf) => {
    model = gltf.scene;
    model.position.set(5, -2, 0);
    model.scale.set(0.07, 0.07, 0.07);
    model.rotation.y = -0.5;
    scene.add(model);
  });

  let mouseX = 0,
    mouseY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;
  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  });

  const animate = () => {
    requestAnimationFrame(animate);
    if (model) {
      if (window.innerWidth < 768) model.rotation.y += 0.002;
      else {
        model.rotation.y += 0.05 * (mouseX * 0.0005 - 0.5 - model.rotation.y);
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
