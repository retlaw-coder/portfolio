import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export default function Hero({ currentLang }) {
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const modelRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    // 🎮 CONTROL PANEL STATE
    const [showControls, setShowControls] = useState(false);
    const [showControlsButton, setShowControlsButton] = useState(false);
    const [position, setPosition] = useState({ x: 10.00, y: -5.40, z: -20.00 });
    const [rotation, setRotation] = useState({ x: -0.08, y: -0.48, z: 0.02 });
    const [scale, setScale] = useState(0.096);
    const [enableAnimation, setEnableAnimation] = useState(true); // Enable by default for subtle animation
    const [modelLoaded, setModelLoaded] = useState(false);
    const [showRetlaw, setShowRetlaw] = useState(false);
    const timerRef = useRef(null);

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

        // --- MODEL LOADING (Start immediately, not after delay) ---
        const loader = new GLTFLoader();
        const draco = new DRACOLoader();
        draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
        loader.setDRACOLoader(draco);

        // Use proper path for GitHub Pages - the public folder is served at the root
        const modelPath = import.meta.env.BASE_URL + 'assets/final-city.glb';
        console.log('Loading model from:', modelPath);

        loader.load(
            modelPath,
            (gltf) => {
                console.log('Model loaded successfully!');
                const model = gltf.scene;

                // 🎯 Use state values for initial position
                model.position.set(position.x, position.y, position.z);
                model.scale.set(scale, scale, scale);
                model.rotation.set(rotation.x, rotation.y, rotation.z);

                // Make model visible immediately (no fade)
                model.traverse((c) => {
                    if (c.isMesh) {
                        c.material.transparent = false;
                        c.material.opacity = 1;
                    }
                });

                scene.add(model);
                modelRef.current = model;
                setModelLoaded(true);
            },
            (xhr) => {
                // Progress callback
                const percentComplete = (xhr.loaded / xhr.total) * 100;
                console.log(`Model loading: ${percentComplete.toFixed(2)}%`);
            },
            (error) => console.error("Error loading 3D model:", error)
        );

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
            if (modelRef.current && enableAnimation) {
                // Subtle rotation on Y axis (spinning)
                modelRef.current.rotation.y += 0.003;

                // Subtle floating effect on Y position (up and down)
                const time = Date.now() * 0.001; // Convert to seconds
                const floatAmount = Math.sin(time * 0.5) * 0.3; // Oscillate between -0.3 and 0.3
                modelRef.current.position.y = position.y + floatAmount;
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
    }, [enableAnimation]);

    // 🎮 UPDATE MODEL IN REAL-TIME
    useEffect(() => {
        if (modelRef.current) {
            modelRef.current.position.set(position.x, position.y, position.z);
            modelRef.current.scale.set(scale, scale, scale);
            modelRef.current.rotation.set(rotation.x, rotation.y, rotation.z);
        }
    }, [position, rotation, scale]);

    // 🎮 CAPTURE CURRENT VALUES WHEN CONTROLS OPEN & STOP ANIMATION
    useEffect(() => {
        if (showControls && modelRef.current) {
            // Stop animation when controls open
            setEnableAnimation(false);

            // Capture current model values
            setPosition({
                x: parseFloat(modelRef.current.position.x.toFixed(2)),
                y: parseFloat(modelRef.current.position.y.toFixed(2)),
                z: parseFloat(modelRef.current.position.z.toFixed(2))
            });
            setRotation({
                x: parseFloat(modelRef.current.rotation.x.toFixed(2)),
                y: parseFloat(modelRef.current.rotation.y.toFixed(2)),
                z: parseFloat(modelRef.current.rotation.z.toFixed(2))
            });
            setScale(parseFloat(modelRef.current.scale.x.toFixed(3)));
        }
    }, [showControls]);

    // 🎮 HANDLE NAME TOGGLE TIMER & SCROLL
    useEffect(() => {
        // Clear any existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // If controls are open, keep @Retlaw visible
        if (showControls) {
            setShowRetlaw(true);
            setShowControlsButton(true);
            return;
        }

        // If controls just closed, reset everything
        if (!showControls && !showControlsButton) {
            setShowRetlaw(false);
            return;
        }

        // If button is shown (hover) but controls not open, start 10 second timer
        if (showControlsButton && !showControls) {
            setShowRetlaw(true);

            timerRef.current = setTimeout(() => {
                setShowRetlaw(false);
                setShowControlsButton(false);
            }, 10000);
        }

        // Cleanup timer on unmount
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [showControlsButton, showControls]);

    // 🎮 HANDLE SCROLL - Reset name when scrolling
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                if (showControls) {
                    setShowControls(false);
                }
                setShowRetlaw(false);
                setShowControlsButton(false);
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showControls]);

    return (
        <>
            <div className="canvas-container">
                <canvas ref={canvasRef} id="hero-canvas"></canvas>
            </div>

            <section className="hero">
                <div className="hero-content">
                    <h1
                        className="hero-title reveal-text"
                        style={{
                            whiteSpace: 'pre-line',
                            position: 'relative',
                            cursor: 'pointer',
                            minHeight: '200px',
                        }}
                        onMouseEnter={() => setShowControlsButton(true)}
                        onTouchStart={() => setShowControlsButton(true)}
                    >
                        <span style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            color: '#fff',
                            opacity: showRetlaw ? 0 : 1,
                            transition: 'opacity 0.3s ease',
                            pointerEvents: showRetlaw ? 'none' : 'auto',
                        }}>
                            WALTER{'\n'}CUSTODIO
                        </span>

                        <span style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            color: '#ff3333',
                            opacity: showRetlaw ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                            pointerEvents: showRetlaw ? 'auto' : 'none',
                        }}>
                            @Retlaw
                        </span>
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

            {/* 🎮 CONTROL PANEL BUTTON - Shows on hover or when panel is open */}
            {(showControlsButton || showControls) && (
                <button
                    onClick={() => {
                        if (showControls) {
                            // Closing controls - reset name
                            setShowControls(false);
                            setShowRetlaw(false);
                            setShowControlsButton(false);
                        } else {
                            // Opening controls
                            setShowControls(true);
                        }
                    }}
                    onMouseEnter={() => setShowControlsButton(true)}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 10000,
                        background: showControls ? 'rgba(255, 51, 51, 0.9)' : 'rgba(5, 5, 5, 0.9)',
                        color: showControls ? '#fff' : '#ff3333',
                        border: '1px solid #ff3333',
                        padding: '12px 24px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        animation: 'fadeIn 0.3s ease',
                        transition: 'all 0.3s ease',
                    }}
                >
                    {showControls ? '✕ CLOSE' : '🎮 CONTROLS'}
                </button>
            )}

            {showControls && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 9999,
                    background: 'rgba(5, 5, 5, 0.95)',
                    color: '#e0e0e0',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    minWidth: '300px',
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#ff3333', fontSize: '16px', fontWeight: '700' }}>
                        🎮 3D MODEL CONTROLS
                    </h3>

                    {/* ANIMATION TOGGLE */}
                    <div style={{
                        marginBottom: '20px',
                        padding: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '5px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={enableAnimation}
                                onChange={(e) => setEnableAnimation(e.target.checked)}
                                style={{ marginRight: '10px', cursor: 'pointer' }}
                            />
                            <span style={{ color: enableAnimation ? '#ff3333' : '#b0b0b0' }}>
                                {enableAnimation ? '✅ Auto-Rotation ON' : '❌ Auto-Rotation OFF'}
                            </span>
                        </label>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#888' }}>
                            {enableAnimation
                                ? 'Rotación suave en Y + efecto flotante'
                                : 'Modelo estático - usa los sliders'}
                        </p>
                    </div>

                    {/* POSITION */}
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: '#ff3333', margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700' }}>📍 POSITION</h4>

                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            X: {position.x.toFixed(2)}
                            <input
                                type="range"
                                min="5"
                                max="15"
                                step="0.1"
                                value={position.x}
                                onChange={(e) => setPosition({ ...position, x: parseFloat(e.target.value) })}
                                style={{ width: '100%', display: 'block' }}
                            />
                        </label>

                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            Y: {position.y.toFixed(2)}
                            <input
                                type="range"
                                min="-10"
                                max="0"
                                step="0.1"
                                value={position.y}
                                onChange={(e) => setPosition({ ...position, y: parseFloat(e.target.value) })}
                                style={{ width: '100%', display: 'block' }}
                            />
                        </label>

                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            Z: {position.z.toFixed(2)}
                            <input
                                type="range"
                                min="-25"
                                max="-15"
                                step="0.1"
                                value={position.z}
                                onChange={(e) => setPosition({ ...position, z: parseFloat(e.target.value) })}
                                style={{ width: '100%', display: 'block' }}
                            />
                        </label>
                    </div>

                    {/* ROTATION */}
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: '#ff3333', margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700' }}>🔄 ROTATION</h4>

                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            X: {rotation.x.toFixed(2)} rad
                            <input
                                type="range"
                                min="-1"
                                max="1"
                                step="0.01"
                                value={rotation.x}
                                onChange={(e) => setRotation({ ...rotation, x: parseFloat(e.target.value) })}
                                style={{ width: '100%', display: 'block' }}
                            />
                        </label>

                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            Y: {rotation.y.toFixed(2)} rad
                            <input
                                type="range"
                                min="-1.5"
                                max="0.5"
                                step="0.01"
                                value={rotation.y}
                                onChange={(e) => setRotation({ ...rotation, y: parseFloat(e.target.value) })}
                                style={{ width: '100%', display: 'block' }}
                            />
                        </label>

                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            Z: {rotation.z.toFixed(2)} rad
                            <input
                                type="range"
                                min="-1"
                                max="1"
                                step="0.01"
                                value={rotation.z}
                                onChange={(e) => setRotation({ ...rotation, z: parseFloat(e.target.value) })}
                                style={{ width: '100%', display: 'block' }}
                            />
                        </label>
                    </div>

                    {/* SCALE */}
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: '#ff3333', margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700' }}>📏 SCALE</h4>

                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            Size: {scale.toFixed(3)}
                            <input
                                type="range"
                                min="0.05"
                                max="0.15"
                                step="0.001"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                style={{ width: '100%', display: 'block' }}
                            />
                        </label>
                    </div>

                    {/* COPY VALUES */}
                    <button
                        onClick={() => {
                            const code = `model.position.set(${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)});
model.scale.set(${scale.toFixed(3)}, ${scale.toFixed(3)}, ${scale.toFixed(3)});
model.rotation.set(${rotation.x.toFixed(2)}, ${rotation.y.toFixed(2)}, ${rotation.z.toFixed(2)});`;
                            navigator.clipboard.writeText(code);
                            alert('✅ Código copiado al portapapeles!');
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 'bold',
                            marginBottom: '10px',
                            transition: '0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                    >
                        📋 COPY VALUES
                    </button>

                    {/* RESET */}
                    <button
                        onClick={() => {
                            setPosition({ x: 10.00, y: -5.40, z: -20.00 });
                            setRotation({ x: -0.08, y: -0.48, z: 0.02 });
                            setScale(0.096);
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(255, 51, 51, 0.2)',
                            color: '#ff3333',
                            border: '1px solid #ff3333',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 'bold',
                            transition: '0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(255, 51, 51, 0.4)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(255, 51, 51, 0.2)'}
                    >
                        🔄 RESET INICIAL
                    </button>

                    <p style={{ marginTop: '15px', fontSize: '10px', color: '#888', textAlign: 'center' }}>
                        Mueve los sliders para ajustar en tiempo real
                    </p>
                </div>
            )}
        </>
    );
}
