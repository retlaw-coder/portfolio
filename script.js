import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/DRACOLoader.js";
import Lenis from "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/+esm";

// --- 1. LOADER & REVEAL ---
const loaderElement = document.getElementById("loader");
const progressText = document.querySelector(".loader-progress");
const heroSection = document.querySelector(".hero");

// Simulación de carga
let progress = 0;
const fakeLoad = setInterval(() => {
  progress += Math.floor(Math.random() * 10) + 5;
  if (progress > 100) progress = 100;
  progressText.innerText = progress + "%";

  if (progress === 100) {
    clearInterval(fakeLoad);
    runParticleTransition(true);
  }
}, 50);

// --- 2. LENIS SCROLL ---
const lenis = new Lenis({ duration: 1.2, smooth: true });
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- 3. STICKY NAV ---
const stickyNav = document.querySelector(".sticky-nav");
const floatingSwitch = document.querySelector(".lang-switch-floating");
const backToTopBtn = document.querySelector(".back-to-top-btn");

lenis.on("scroll", (e) => {
  if (e.scroll > window.innerHeight * 0.5) {
    stickyNav.classList.add("visible");
    floatingSwitch.classList.add("hidden");
  } else {
    stickyNav.classList.remove("visible");
    floatingSwitch.classList.remove("hidden");
  }
});

backToTopBtn.addEventListener("click", (e) => {
  e.preventDefault();
  lenis.scrollTo("#hero");
});

// --- 4. MODAL DE CONTACTO ---
const modal = document.getElementById("contact-modal");
const openBtns = document.querySelectorAll(
  "#open-contact-btn, .open-contact-trigger, .contact-nav-btn"
);
const closeBtn = document.getElementById("close-modal-btn");

openBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    if (btn.tagName === "A") e.preventDefault();
    modal.classList.add("active");
    lenis.stop();
  });
});

closeBtn.addEventListener("click", () => {
  modal.classList.remove("active");
  lenis.start();
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("active");
    lenis.start();
  }
});

// --- 5. VIDEO HOVER LOGIC ---
document.querySelectorAll(".project-item").forEach((item) => {
  const video = item.querySelector("video");
  item.addEventListener("mouseenter", () => {
    if (video) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          /* Auto-play prevented */
        });
      }
    }
  });
  item.addEventListener("mouseleave", () => {
    if (video) video.pause();
  });
});

// --- 6. SPA PROYECTOS ---
const projectTriggers = document.querySelectorAll(".project-trigger");
const homeView = document.getElementById("home-view");
const detailView = document.getElementById("project-detail-view");
const backBtn = document.getElementById("back-btn");
const detailContainer = document.querySelector(".detail-grid");
const detailTitle = document.getElementById("detail-title");

const projectData = {
  1: {
    title: "Daylight",
    imgs: ["assets/proyecto1.png", "assets/proyecto2.png"],
    vids: ["assets/proyecto1.mp4"],
  },
  2: {
    title: "KidSuper",
    imgs: ["assets/proyecto2.png", "assets/proyecto1.png"],
    vids: ["assets/proyecto2.mp4", "assets/proyecto1.mp4"],
  },
  3: {
    title: "Nike Lab",
    imgs: ["assets/proyecto1.png", "assets/proyecto2.png"],
    vids: ["assets/proyecto1.mp4"],
  },
};

projectTriggers.forEach((card) => {
  card.addEventListener("click", () => {
    const id = card.getAttribute("data-id");
    loadProject(id);

    lenis.stop();
    document.body.classList.add("no-scroll");

    setTimeout(() => {
      detailView.classList.add("active");
      detailView.scrollTop = 0;
    }, 100);
  });
});

function loadProject(id) {
  const data = projectData[id] || projectData[1];
  detailTitle.innerText = data.title;
  detailContainer.innerHTML = "";

  if (data.vids.length > 0) {
    const v1 = document.createElement("div");
    v1.className = "detail-item full-width";
    v1.innerHTML = `<video src="${data.vids[0]}" autoplay loop muted playsinline></video>`;
    detailContainer.appendChild(v1);
  }
  data.imgs.forEach((src) => {
    const d = document.createElement("div");
    d.className = "detail-item";
    d.innerHTML = `<img src="${src}">`;
    detailContainer.appendChild(d);
  });
}

backBtn.addEventListener("click", () => {
  detailView.classList.remove("active");
  runParticleTransition(false);
  setTimeout(() => {
    document.body.classList.remove("no-scroll");
    lenis.start();
  }, 800);
});

// --- 7. PARTÍCULAS ---
function runParticleTransition(isInitialLoad) {
  const overlay = document.getElementById("particle-overlay");
  overlay.innerHTML = "";
  const cols = 10,
    rows = 10;
  const width = window.innerWidth / cols;
  const height = window.innerHeight / rows;

  for (let i = 0; i < cols * rows; i++) {
    const cell = document.createElement("div");
    cell.className = "particle-cell";
    cell.style.width = width + "px";
    cell.style.height = height + "px";
    cell.style.position = "absolute";
    cell.style.left = (i % cols) * width + "px";
    cell.style.top = Math.floor(i / cols) * height + "px";
    cell.style.opacity = "1";
    cell.style.transform = "scale(1)";
    overlay.appendChild(cell);
  }

  if (isInitialLoad) loaderElement.classList.add("loader-hidden");

  const cells = document.querySelectorAll(".particle-cell");
  cells.forEach((cell) => {
    setTimeout(() => {
      cell.style.transform = "scale(0)";
      cell.style.opacity = "0";
    }, Math.random() * 600);
  });

  setTimeout(() => {
    overlay.innerHTML = "";
    if (isInitialLoad) heroSection.classList.add("hero-loaded");
  }, 800);
}

// --- 8. THREE.JS (LOCAL ASSETS) ---
const canvas = document.querySelector("#hero-canvas");
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
// Mantenemos Draco por si usaste compresión en gltf.report (muy recomendado)
dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
);
loader.setDRACOLoader(dracoLoader);

// CARGA LOCAL
loader.load(
  "assets/mis-edificios.glb",
  (gltf) => {
    model = gltf.scene;
    model.position.set(5, -2, 0);
    model.scale.set(0.07, 0.07, 0.07);
    scene.add(model);
  },
  undefined,
  (error) => {
    console.error("Error cargando modelo:", error);
  }
);

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
    model.rotation.y += 0.05 * (mouseX * 0.0005 - (model.rotation.y + 0.5));
    model.rotation.x += 0.05 * (mouseY * 0.0005 - model.rotation.x);
  }
  renderer.render(scene, camera);
};
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 9. IDIOMA ---
let currentLang = "es";
function toggleLanguage() {
  currentLang = currentLang === "es" ? "en" : "es";
  const navBtn = document.getElementById("lang-switch-nav");
  const floatText = document.querySelector(".lang-switch-floating .lang-text");
  const floatFlag = document.querySelector(".lang-switch-floating .flag");

  if (currentLang === "en") {
    navBtn.innerText = "EN";
    floatText.innerText = "EN";
    floatFlag.innerText = "🇺🇸";
  } else {
    navBtn.innerText = "ES";
    floatText.innerText = "ES";
    floatFlag.innerText = "🇦🇷";
  }
  document.querySelectorAll("[data-es]").forEach((el) => {
    el.innerText = el.getAttribute(`data-${currentLang}`);
  });
}
document
  .getElementById("lang-switch-nav")
  .addEventListener("click", toggleLanguage);
document
  .getElementById("lang-switch-hero")
  .addEventListener("click", toggleLanguage);
