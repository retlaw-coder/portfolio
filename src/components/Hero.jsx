import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export default function Hero({ currentLang }) {
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const modelRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    // Runic Number Map - Procedural Generation
    const toRunic = (num) => {
        // Use the number as a seed for a deterministic but chaotic sequence
        let seed = Math.floor(Math.abs(num) * 123456) + 789;
        const runes = "ᚠᚢᚦᚨᚱᚲᚺᚾᛁᛃᛈᛉᛏᛒᛖᛗᛞᛟᛝᚩᚳᚷᛠ";
        let str = "";

        // Exactly 4 characters
        for (let i = 0; i < 4; i++) {
            // Simple Linear Congruential Generator for randomness
            seed = (seed * 16807) % 2147483647;
            str += runes[seed % runes.length];
        }
        return str;
    };

    // 🎮 CONTROL PANEL STATE
    const DEFAULT_POSITION = { x: 10.00, y: -3.70, z: -20.00 };
    const DEFAULT_ROTATION = { x: -0.08, y: 0.93, z: 0.02 };
    const DEFAULT_SCALE = 0.0985; // Corresponds to 0.50 slider value

    const [showControls, setShowControls] = useState(false);
    const [showControlsButton, setShowControlsButton] = useState(false);
    const [position, setPosition] = useState(DEFAULT_POSITION);
    const [rotation, setRotation] = useState(DEFAULT_ROTATION);
    const [scale, setScale] = useState(DEFAULT_SCALE);
    const [enableAnimation, setEnableAnimation] = useState(true);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [showRetlaw, setShowRetlaw] = useState(false);

    // Refs for animation loop
    const showControlsRef = useRef(false);
    const targetRef = useRef({
        position: DEFAULT_POSITION,
        rotation: DEFAULT_ROTATION,
        scale: DEFAULT_SCALE
    });
    const timerRef = useRef(null);

    // Sync Ref with State for the animation loop
    useEffect(() => {
        targetRef.current = { position, rotation, scale };
    }, [position, rotation, scale]);

    useEffect(() => {
        let isMounted = true;

        // --- THREE.JS SETUP ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 1, 5);

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true,
            antialias: false, // Turned off for performance
            powerPreference: "high-performance",
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        // Limit pixel ratio to 1 for much better performance, especially on mobile/high-DPI screens
        renderer.setPixelRatio(window.innerWidth < 768 ? 1 : Math.min(window.devicePixelRatio, 1.5));

        // Setup Intersection Observer to pause rendering when off-screen
        let isVisible = true;
        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
        });
        if (canvasRef.current) {
            observer.observe(canvasRef.current);
        }

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        sceneRef.current = { scene, camera, renderer };

        // --- MODEL LOADING ---
        const loader = new GLTFLoader();
        const draco = new DRACOLoader();
        draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
        loader.setDRACOLoader(draco);

        const modelPath = import.meta.env.BASE_URL + 'assets/final-city.glb';
        console.log('Loading model from:', modelPath);

        loader.load(
            modelPath,
            (gltf) => {
                if (!isMounted) return;

                const model = gltf.scene;
                // Initial setup
                model.position.set(position.x, position.y, position.z);
                model.scale.set(scale, scale, scale);
                model.rotation.set(rotation.x, rotation.y, rotation.z);

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
            undefined,
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
        let reqId;
        const animate = () => {
            reqId = requestAnimationFrame(animate);

            // Skip rendering completely if off-screen to save performance
            if (!isVisible) return;

            if (modelRef.current) {
                const target = targetRef.current;

                // IF CONTROLS ARE OPEN:
                // Smoothly interpolate (Lerp) towards the target values set by sliders
                if (showControlsRef.current) {
                    // Position Lerp
                    modelRef.current.position.x += (target.position.x - modelRef.current.position.x) * 0.1;
                    modelRef.current.position.y += (target.position.y - modelRef.current.position.y) * 0.1;
                    modelRef.current.position.z += (target.position.z - modelRef.current.position.z) * 0.1;

                    // Rotation Lerp
                    modelRef.current.rotation.x += (target.rotation.x - modelRef.current.rotation.x) * 0.1;
                    modelRef.current.rotation.y += (target.rotation.y - modelRef.current.rotation.y) * 0.1;
                    modelRef.current.rotation.z += (target.rotation.z - modelRef.current.rotation.z) * 0.1;

                    // Scale Lerp
                    const currentScale = modelRef.current.scale.x;
                    const newScale = currentScale + (target.scale - currentScale) * 0.1;
                    modelRef.current.scale.set(newScale, newScale, newScale);
                }
                // IF CONTROLS ARE CLOSED:
                // Run automatic idle animation (rotation + float)
                else {
                    // Constant rotation
                    modelRef.current.rotation.y += 0.003;

                    // Float effect
                    const time = Date.now() * 0.001;
                    const floatOffset = Math.sin(time * 0.5) * 0.3;

                    // Smoothly return to "Base Position + Float"
                    // We use target.position as the base
                    modelRef.current.position.x += (target.position.x - modelRef.current.position.x) * 0.05;
                    modelRef.current.position.y += ((target.position.y + floatOffset) - modelRef.current.position.y) * 0.05;
                    modelRef.current.position.z += (target.position.z - modelRef.current.position.z) * 0.05;

                    // Smoothly return to "Base Rotation" (except Y which spins)
                    modelRef.current.rotation.x += (target.rotation.x - modelRef.current.rotation.x) * 0.05;
                    modelRef.current.rotation.z += (target.rotation.z - modelRef.current.rotation.z) * 0.05;
                    // We DO NOT lerp Rotation Y because it's spinning freely

                    // Smoothly return to Base Scale
                    const currentScale = modelRef.current.scale.x;
                    const newScale = currentScale + (target.scale - currentScale) * 0.05;
                    modelRef.current.scale.set(newScale, newScale, newScale);
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
            isMounted = false;
            cancelAnimationFrame(reqId);
            document.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
            if (canvasRef.current) observer.unobserve(canvasRef.current);
            observer.disconnect();
            // Dispose logic
            renderer.dispose();
            draco.dispose();
            if (modelRef.current) {
                scene.remove(modelRef.current);
                modelRef.current = null;
            }
        };
    }, []); // Empty dependency array = Runs once on mount!

    // 🎮 TOGGLE ANIMATION
    useEffect(() => {
        showControlsRef.current = showControls;
    }, [showControls]);

    // 🎮 UPDATE MODEL IN REAL-TIME FROM SLIDERS
    // REMOVED: This logic is now handled in the animation loop for smoothness!

    const handleReset = () => {
        setPosition(DEFAULT_POSITION);
        setRotation(DEFAULT_ROTATION);
        setScale(DEFAULT_SCALE);
    };

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
                            display: 'grid',
                            placeItems: 'center start',
                            position: 'relative',
                            cursor: 'pointer',
                            minHeight: '200px',
                            textAlign: 'left',
                        }}
                        onMouseEnter={() => setShowControlsButton(true)}
                        onTouchStart={() => setShowControlsButton(true)}
                    >
                        <span style={{
                            gridArea: '1/1',
                            color: '#fff',
                            opacity: showRetlaw ? 0 : 1,
                            transform: showRetlaw ? 'scale(0.9) translateY(20px)' : 'scale(1) translateY(0)',
                            filter: showRetlaw ? 'blur(10px)' : 'blur(0)',
                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            pointerEvents: showRetlaw ? 'none' : 'auto',
                            whiteSpace: 'pre-line',
                        }}>
                            WALTER{'\n'}CUSTODIO
                        </span>

                        <span style={{
                            gridArea: '1/1',
                            color: '#ff3333',
                            opacity: showRetlaw ? 1 : 0,
                            transform: showRetlaw ? 'scale(1) translateY(0)' : 'scale(1.1) translateY(-20px)',
                            filter: showRetlaw ? 'blur(0)' : 'blur(10px)',
                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            pointerEvents: showRetlaw ? 'auto' : 'none',
                        }}>
                            @Retlaw
                        </span>
                    </h1>
                    <p className="hero-subtitle reveal-text" style={{ transitionDelay: '0.2s' }}>
                        PORTFOLIO <span className="glitch">2026</span>
                    </p>
                    <p className="hero-role reveal-text" style={{ transitionDelay: '0.3s' }}>
                        {currentLang === 'es' ? 'DISEÑADOR & DESARROLLADOR MULTIMEDIA' : 'MULTIMEDIA DESIGNER & DEVELOPER'}
                    </p>
                    <div className="location reveal-text" style={{ transitionDelay: '0.5s' }}>
                        BASED IN ARGENTINA
                    </div>
                </div>
                <div className="scroll-indicator">
                    SCROLL
                    <span className="scroll-arrow">&#8964;</span>
                </div>
            </section>

            {/* 🎮 CONTROL PANEL BUTTON - Shows on hover or when panel is open */}
            {(showControlsButton || showControls) && (
                <button
                    onClick={() => {
                        if (showControls) {
                            // Closing controls
                            setShowControls(false);
                            setShowRetlaw(false);
                            setShowControlsButton(false);
                        } else {
                            // Opening controls - CAPTURE CURRENT MODEL STATE INSTANTLY
                            if (modelRef.current) {
                                const m = modelRef.current;
                                setPosition({
                                    x: parseFloat(m.position.x.toFixed(2)),
                                    y: parseFloat(m.position.y.toFixed(2)),
                                    z: parseFloat(m.position.z.toFixed(2))
                                });
                                // Capture rotation as is
                                setRotation({
                                    x: parseFloat(m.rotation.x.toFixed(2)),
                                    y: parseFloat(m.rotation.y.toFixed(2)),
                                    z: parseFloat(m.rotation.z.toFixed(2))
                                });
                                setScale(parseFloat(m.scale.x.toFixed(3)));
                            }
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
                    {showControls ? '✕ CLOSE' : 'CONTROLS'}
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
                    <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, color: '#ff3333', fontSize: '16px', fontWeight: '700' }}>
                            3D MODEL CONTROLS
                        </h3>
                    </div>

                    {/* ANIMATION TOGGLE REMOVED */}

                    {/* POSITION */}
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: '#ff3333', margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700' }}>POSITION</h4>

                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            X: <span style={{ fontFamily: '"Noto Sans Runic", sans-serif', letterSpacing: '2px', fontSize: '1.2em' }}>{toRunic(position.x)}</span>
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
                            Y: <span style={{ fontFamily: '"Noto Sans Runic", sans-serif', letterSpacing: '2px', fontSize: '1.2em' }}>{toRunic(position.y)}</span>
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
                            Z: <span style={{ fontFamily: '"Noto Sans Runic", sans-serif', letterSpacing: '2px', fontSize: '1.2em' }}>{toRunic(position.z)}</span>
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
                        <h4 style={{ color: '#ff3333', margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700' }}>ROTATION</h4>

                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            X: <span style={{ fontFamily: '"Noto Sans Runic", sans-serif', letterSpacing: '2px', fontSize: '1.2em' }}>{toRunic(rotation.x)} <span style={{ fontSize: '0.6em', opacity: 0.7, fontFamily: 'monospace' }}>RAD</span></span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={rotation.x}
                                onChange={(e) => setRotation({ ...rotation, x: parseFloat(e.target.value) })}
                                style={{ width: '100%', display: 'block' }}
                            />
                        </label>

                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            Y: <span style={{ fontFamily: '"Noto Sans Runic", sans-serif', letterSpacing: '2px', fontSize: '1.2em' }}>{toRunic(rotation.y)} <span style={{ fontSize: '0.6em', opacity: 0.7, fontFamily: 'monospace' }}>RAD</span></span>
                            <input
                                type="range"
                                min="-3.14"
                                max="3.14"
                                step="0.01"
                                value={rotation.y}
                                onChange={(e) => setRotation({ ...rotation, y: parseFloat(e.target.value) })}
                                style={{ width: '100%', display: 'block' }}
                            />
                        </label>

                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            Z: <span style={{ fontFamily: '"Noto Sans Runic", sans-serif', letterSpacing: '2px', fontSize: '1.2em' }}>{toRunic(rotation.z)} <span style={{ fontSize: '0.6em', opacity: 0.7, fontFamily: 'monospace' }}>RAD</span></span>
                            <input
                                type="range"
                                min="0.02"
                                max="0.8"
                                step="0.01"
                                value={rotation.z}
                                onChange={(e) => setRotation({ ...rotation, z: parseFloat(e.target.value) })}
                                style={{ width: '100%', display: 'block' }}
                            />
                        </label>
                    </div>

                    {/* SCALE */}
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: '#ff3333', margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700' }}>SCALE</h4>

                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            Size: <span style={{ fontFamily: '"Noto Sans Runic", sans-serif', letterSpacing: '2px', fontSize: '1.2em' }}>{toRunic((scale - 0.075) / (0.122 - 0.075))}</span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={(scale - 0.075) / (0.122 - 0.075)}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    const minScale = 0.075;
                                    const maxScale = 0.122;
                                    const newScale = minScale + (val * (maxScale - minScale));
                                    setScale(newScale);
                                }}
                                style={{ width: '100%', display: 'block' }}
                            />
                        </label>
                    </div>

                    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '15px' }}>
                        <button
                            onClick={handleReset}
                            style={{
                                width: '100%',
                                background: 'rgba(255, 51, 51, 0.1)',
                                border: '1px solid #ff3333',
                                color: '#ff3333',
                                padding: '10px 0',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-mono)',
                                transition: 'all 0.2s ease',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#ff3333';
                                e.target.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 51, 51, 0.1)';
                                e.target.style.color = '#ff3333';
                            }}
                        >
                            RESET TO DEFAULT
                        </button>
                    </div>

                </div>
            )}
        </>
    );
}
