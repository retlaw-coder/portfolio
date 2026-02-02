import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export default function Hero({ currentLang }) {
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const modelRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // --- THREE.JS SETUP ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // Camera position from original script.js
        camera.position.set(0, 1, 5);

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        sceneRef.current = { scene, camera, renderer };

        // --- MODEL LOADING ---
        setTimeout(() => {
            const loader = new GLTFLoader();
            const draco = new DRACOLoader();
            draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
            loader.setDRACOLoader(draco);

            loader.load(
                "/assets/edificios.glb",
                (gltf) => {
                    const model = gltf.scene;

                    // EXACT ORIGINAL TRANSFORMS
                    model.position.set(10, -2, -8);
                    model.scale.set(0.065, 0.065, 0.065);
                    model.rotation.y = -5; // Initial rotation

                    model.traverse((c) => {
                        if (c.isMesh) {
                            c.material.transparent = true;
                            c.material.opacity = 0;
                        }
                    });
                    scene.add(model);
                    modelRef.current = model;

                    // Fade in animation
                    let start = null;
                    const fadeIn = (timestamp) => {
                        if (!start) start = timestamp;
                        const progress = Math.min((timestamp - start) / 1200, 1);
                        model.traverse((c) => {
                            if (c.isMesh) c.material.opacity = progress;
                        });
                        if (progress < 1) requestAnimationFrame(fadeIn);
                    };
                    requestAnimationFrame(fadeIn);
                },
                undefined,
                (error) => console.error("Error loading 3D model:", error)
            );
        }, 100);

        // --- INTERACTION ---
        const handleMouseMove = (e) => {
            const halfX = window.innerWidth / 2;
            const halfY = window.innerHeight / 2;
            mouseRef.current = {
                x: e.clientX - halfX,
                y: e.clientY - halfY
            };
        };
        document.addEventListener("mousemove", handleMouseMove);

        // --- ANIMATION LOOP ---
        const animate = () => {
            requestAnimationFrame(animate);
            if (modelRef.current) {
                if (window.innerWidth < 768) {
                    modelRef.current.rotation.y += 0.002;
                } else {
                    // Subtle parallax exact to original
                    modelRef.current.rotation.y += 0.05 * (mouseRef.current.x * 0.0005 - 0.5 - modelRef.current.rotation.y);
                    modelRef.current.rotation.x += 0.05 * (mouseRef.current.y * 0.0005 - modelRef.current.rotation.x);
                }
            }
            renderer.render(scene, camera);
        };
        animate();

        // --- RESIZE ---
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
        };
    }, []);

    return (
        <>
            <div className="canvas-container">
                <canvas ref={canvasRef} id="hero-canvas"></canvas>
            </div>

            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title reveal-text" style={{ whiteSpace: 'pre-line' }}>
                        WALTER{'\n'}CUSTODIO
                    </h1>
                    <p className="hero-subtitle reveal-text" style={{ transitionDelay: '0.2s' }}>
                        PORTFOLIO <span className="glitch">2026</span>
                    </p>
                    <div className="location reveal-text" style={{ transitionDelay: '0.4s' }}>
                        BASED IN ARGENTINA
                    </div>
                </div>
                <div className="scroll-indicator">SCROLL</div>
            </section>
        </>
    );
}
