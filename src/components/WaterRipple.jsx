import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import './WaterRipple.css';

/*
  Approach: fullscreen quad with a fragment shader that draws
  concentric ring ripples at each touch point.
  No vertex displacement needed — everything in the fragment shader.
  This is more reliable and resolution-independent.
*/

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader: draws expanding concentric rings at each ripple point
const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uRipples[16];  // xy = screen position (0-1), z = startTime
  uniform int uRippleCount;
  uniform vec3 uAccentColor;

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    // Correct aspect ratio so circles aren't stretched
    float aspect = uResolution.x / uResolution.y;
    vec2 coord = vec2(uv.x * aspect, uv.y);

    float totalAlpha = 0.0;
    vec3 totalColor = vec3(0.0);

    for (int i = 0; i < 16; i++) {
      if (i >= uRippleCount) break;

      vec2 rippleUV = uRipples[i].xy;
      vec2 rippleCoord = vec2(rippleUV.x * aspect, rippleUV.y);
      float startTime = uRipples[i].z;
      float elapsed = uTime - startTime;

      if (elapsed < 0.0 || elapsed > 1.2) continue;

      float dist = distance(coord, rippleCoord);

      // Max radius the ripple can reach (in UV-aspect space)
      float maxRadius = 0.09;

      // Current expanding radius
      float speed = 0.09; // units per second
      float currentRadius = elapsed * speed;

      if (currentRadius > maxRadius) currentRadius = maxRadius;

      // Time fade
      float timeFade = 1.0 - smoothstep(0.0, 1.2, elapsed);
      timeFade = timeFade * timeFade;

      // --- Concentric rings ---
      // Ring wave frequency
      float ringFreq = 45.0;
      float ringWave = sin(dist * ringFreq - elapsed * 12.0);
      // Only show rings within the expanding front
      float inFront = smoothstep(currentRadius + 0.005, currentRadius - 0.02, dist);
      // Fade with distance from center
      float distFade = 1.0 - smoothstep(0.0, maxRadius, dist);

      // Ring line (thin concentric circles)
      float ringLine = smoothstep(0.3, 0.7, ringWave);

      // Combine 
      float ringAlpha = ringLine * inFront * distFade * timeFade * 0.3;

      // Central splash glow (bright dot at impact point)
      float centerGlow = exp(-dist * 40.0) * timeFade * 0.2;

      // Outer edge ring (the leading wave front)
      float edgeRing = exp(-pow((dist - currentRadius) * 80.0, 2.0)) * timeFade * 0.3;

      float alpha = ringAlpha + centerGlow + edgeRing;

      // Color: accent for rings, brighter at peaks
      vec3 ringColor = uAccentColor * (1.0 + ringWave * 0.3);
      vec3 edgeColor = mix(uAccentColor, vec3(1.0, 0.7, 0.6), 0.4);

      totalColor += ringColor * ringAlpha + uAccentColor * centerGlow + edgeColor * edgeRing;
      totalAlpha += alpha;
    }

    totalAlpha = clamp(totalAlpha, 0.0, 1.0);

    if (totalAlpha < 0.005) discard;

    gl_FragColor = vec4(totalColor, totalAlpha);
  }
`;

export default function WaterRipple() {
    const containerRef = useRef(null);
    const rendererRef = useRef(null);
    const materialRef = useRef(null);
    const ripplesRef = useRef([]);
    const frameRef = useRef(null);
    const clockRef = useRef(null);
    const initializedRef = useRef(false);

    const MAX_RIPPLES = 16;

    const addRipple = useCallback((x, y) => {
        if (!rendererRef.current || !clockRef.current) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        // Convert screen pixel coords to 0-1 UV range
        const uvX = x / w;
        const uvY = 1.0 - (y / h); // flip Y (GL convention)

        const time = clockRef.current.getElapsedTime();

        ripplesRef.current.push({
            x: uvX,
            y: uvY,
            startTime: time,
        });

        if (ripplesRef.current.length > MAX_RIPPLES) {
            ripplesRef.current = ripplesRef.current.slice(-MAX_RIPPLES);
        }
    }, []);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const container = containerRef.current;
        if (!container) return;

        // --- Three.js Setup ---
        const clock = new THREE.Clock();
        clockRef.current = clock;

        const scene = new THREE.Scene();

        // Simple ortho camera for fullscreen quad
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false, // Not needed for fullscreen shader
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        // Force pixel ratio to 1 for much better performance, water ripples don't need high-DPI
        renderer.setPixelRatio(1);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Fullscreen quad
        const geometry = new THREE.PlaneGeometry(2, 2);

        // Initialize ripple data
        const rippleData = [];
        for (let i = 0; i < MAX_RIPPLES; i++) {
            rippleData.push(new THREE.Vector3(0, 0, -999));
        }

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uRipples: { value: rippleData },
                uRippleCount: { value: 0 },
                uAccentColor: { value: new THREE.Color(0xff3333) },
            },
            transparent: true,
            depthWrite: false,
            depthTest: false,
        });
        materialRef.current = material;

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // --- Event Handlers ---
        const handleTouch = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                addRipple(touch.clientX, touch.clientY);
            }
        };

        const handlePointer = (e) => {
            if (e.pointerType === 'touch' || e.pointerType === 'pen') {
                addRipple(e.clientX, e.clientY);
            }
        };

        // Fallback for Chrome DevTools mobile emulation
        const handleClick = (e) => {
            const style = window.getComputedStyle(container);
            if (style.visibility !== 'hidden') {
                addRipple(e.clientX, e.clientY);
            }
        };

        window.addEventListener('touchstart', handleTouch, { passive: true });
        window.addEventListener('pointerdown', handlePointer, { passive: true });
        window.addEventListener('click', handleClick, { passive: true });

        // --- Resize ---
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            renderer.setSize(w, h);
            material.uniforms.uResolution.value.set(w, h);
        };
        window.addEventListener('resize', handleResize);

        // --- Animation Loop ---
        const animate = () => {
            const elapsed = clock.getElapsedTime();
            material.uniforms.uTime.value = elapsed;

            // Clean expired ripples
            ripplesRef.current = ripplesRef.current.filter(
                r => elapsed - r.startTime < 1.2
            );

            const ripples = ripplesRef.current;
            material.uniforms.uRippleCount.value = ripples.length;

            for (let i = 0; i < MAX_RIPPLES; i++) {
                if (i < ripples.length) {
                    rippleData[i].set(ripples[i].x, ripples[i].y, ripples[i].startTime);
                } else {
                    rippleData[i].set(0, 0, -999);
                }
            }

            // Only render if there are active ripples, or 1 extra frame to clear
            if (ripples.length > 0) {
                renderer.render(scene, camera);
                material.userData.needsClear = true;
            } else if (material.userData.needsClear) {
                renderer.clear();
                material.userData.needsClear = false;
            }

            frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = requestAnimationFrame(animate);

        // --- Cleanup ---
        return () => {
            window.removeEventListener('touchstart', handleTouch);
            window.removeEventListener('pointerdown', handlePointer);
            window.removeEventListener('click', handleClick);
            window.removeEventListener('resize', handleResize);
            if (frameRef.current) cancelAnimationFrame(frameRef.current);

            geometry.dispose();
            material.dispose();
            renderer.dispose();

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [addRipple]);

    return <div ref={containerRef} className="water-ripple-container" />;
}
