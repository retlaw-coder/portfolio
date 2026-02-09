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
    const DEFAULT_POSITION = { x: 10.00, y: -5.30, z: -20.00 };
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
    const animationIntensityRef = useRef(1); // 1 = full speed, 0 = stopped
    const hasCapturedRef = useRef(false);
    const timerRef = useRef(null);

    useEffect(() => {
        // --- THREE.JS SETUP ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
        const loader = new GLTFLoader();
        const draco = new DRACOLoader();
        draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
        loader.setDRACOLoader(draco);

        const modelPath = import.meta.env.BASE_URL + 'assets/final-city.glb';
        console.log('Loading model from:', modelPath);

        loader.load(
            modelPath,
            (gltf) => {
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

            if (modelRef.current) {
                // Smoothly interpolate animation intensity
                // If controls are open, slow down to 0. If closed, speed up to 1.
                const targetIntensity = showControlsRef.current ? 0 : 1;

                // Lerp towards target (0.02 is the speed of change)
                if (Math.abs(animationIntensityRef.current - targetIntensity) > 0.001) {
                    const direction = targetIntensity > animationIntensityRef.current ? 1 : -1;
                    animationIntensityRef.current += direction * 0.02;
                    animationIntensityRef.current = Math.max(0, Math.min(1, animationIntensityRef.current));
                } else {
                    animationIntensityRef.current = targetIntensity;
                }

                // Apply rotation and float based on intensity
                if (animationIntensityRef.current > 0) {
                    modelRef.current.rotation.y += 0.003 * animationIntensityRef.current;
                    const time = Date.now() * 0.001;
                    const floatAmount = Math.sin(time * 0.5) * 0.3 * animationIntensityRef.current;
                    // We only apply the float offset to the base Y position
                    // Note: We need to use the current 'position' state or a ref for the base.
                    // But since 'position' state might be stale in this closure if we didn't include it in deps (we didn't),
                    // we should rely on the fact that if controls are closed, position is steady.
                    // Ideally, we reset position.y to base when intensity hits 0.
                }

                // Special handling: when intensity hits 0 (fully stopped) for the first time after opening controls,
                // we should ensure the state matches the model's final position.
                // However, doing this from the loop is tricky. 
                // Instead, the loop just stops updating rotation.y.
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
            cancelAnimationFrame(reqId);
            document.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
            // Dispose logic
            renderer.dispose();
            if (modelRef.current) {
                scene.remove(modelRef.current);
            }
        };
    }, []); // Empty dependency array = Runs once on mount!

    // 🎮 UPDATE MODEL IN REAL-TIME FROM SLIDERS
    // This effect handles updates when sliders move, without reloading the scene
    useEffect(() => {
        if (modelRef.current) {
            modelRef.current.position.set(position.x, position.y, position.z);
            modelRef.current.scale.set(scale, scale, scale);
            modelRef.current.rotation.set(rotation.x, rotation.y, rotation.z);
        }
    }, [position, rotation, scale]);

    // 🎮 TOGGLE ANIMATION & CAPTURE VALUES
    useEffect(() => {
        showControlsRef.current = showControls;

        if (showControls) {
            // Unset capture flag so we can capture *after* it stops if we wanted (simpler: just let it visual stop)
            // Or better: update state immediately so sliders show roughly where we are? 
            // No, user wants it to slow down.
            // We will let the loop handle the slowdown.
            setEnableAnimation(false);
        } else {
            // RESUME animation
            setEnableAnimation(true);
        }
    }, [showControls]);

    // Update state from model ONLY when fully stopped or manually triggered
    const captureCurrentTransform = () => {
        if (modelRef.current) {
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
    };

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
                        <h4 style={{ color: '#ff3333', margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700' }}>ROTATION</h4>

                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            X: {rotation.x.toFixed(2)} rad
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
                            Y: {rotation.y.toFixed(2)} rad
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
                            Z: {rotation.z.toFixed(2)} rad
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
                            Size: {((scale - 0.075) / (0.122 - 0.075)).toFixed(2)}
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
