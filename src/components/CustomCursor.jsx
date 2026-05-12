import { useEffect, useRef } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
    const cursorRef = useRef(null);
    const ghostsRef = useRef([]);
    const requestRef = useRef();

    useEffect(() => {
        // Only on desktop — mobile/tablet uses WaterRipple
        const isTouchDevice = window.matchMedia("(hover: none)").matches;
        if (isTouchDevice) return;

        const cursor = cursorRef.current;
        const trailLength = 12;

        const mouse = { x: 0, y: 0 };
        const cursorState = { x: 0, y: 0 };
        const ghosts = [];

        // Precompute scales to avoid doing it in the animation loop
        const ghostScales = [];
        for (let i = 0; i < trailLength; i++) {
            ghosts.push({ x: 0, y: 0 });
            ghostScales.push(1 - (i / trailLength) * 0.5);
        }

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseOver = (e) => {
            const target = e.target;
            if (!target || target.nodeType !== Node.ELEMENT_NODE) return;
            
            // Remove the extremely slow window.getComputedStyle check
            const isClickable =
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button') ||
                target.closest('.interactive-card') ||
                target.closest('.project-item') ||
                target.closest('.interactive-btn') ||
                target.closest('.open-contact-trigger');

            if (isClickable) {
                cursor.classList.add('hover');
            } else {
                cursor.classList.remove('hover');
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mouseover', handleMouseOver, { passive: true });

        const animate = () => {
            // Head interpolation
            const headLerp = 0.35;
            cursorState.x += (mouse.x - cursorState.x) * headLerp;
            cursorState.y += (mouse.y - cursorState.y) * headLerp;

            if (cursor) {
                // Use hardware-accelerated translate3d instead of left/top
                cursor.style.transform = `translate3d(${cursorState.x}px, ${cursorState.y}px, 0) translate(-50%, -50%)`;
            }

            // Tail interpolation
            const tailLerp = 0.35;
            let prevX = cursorState.x;
            let prevY = cursorState.y;

            ghosts.forEach((ghost, i) => {
                const el = ghostsRef.current[i];
                if (el) {
                    ghost.x += (prevX - ghost.x) * tailLerp;
                    ghost.y += (prevY - ghost.y) * tailLerp;

                    // Use hardware-accelerated translate3d for ghosts too
                    el.style.transform = `translate3d(${ghost.x}px, ${ghost.y}px, 0) translate(-50%, -50%) scale(${ghostScales[i]})`;

                    prevX = ghost.x;
                    prevY = ghost.y;
                }
            });

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // Render ghosts
    const trailLength = 12;
    const ghostElements = Array.from({ length: trailLength }).map((_, i) => {
        const opacity = 1 - (i / trailLength) * 0.8;
        return (
            <div
                key={i}
                ref={el => ghostsRef.current[i] = el}
                className="cursor-ghost"
                style={{
                    // Initial position offscreen or at 0,0 until JS takes over
                    transform: `translate(-50%, -50%) scale(${1 - (i / trailLength) * 0.5})`,
                    opacity: opacity,
                    willChange: 'transform' // Hint to browser for GPU optimization
                }}
            />
        );
    });

    return (
        <>
            <div 
                ref={cursorRef} 
                className="custom-cursor" 
                style={{ willChange: 'transform' }} 
            />
            {ghostElements}
        </>
    );
}
