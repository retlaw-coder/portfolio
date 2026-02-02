import { useEffect, useRef } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
    const cursorRef = useRef(null);
    const ghostsRef = useRef([]);
    const requestRef = useRef();

    useEffect(() => {
        // Only on desktop
        const isTouchDevice = window.matchMedia("(hover: none)").matches;
        if (isTouchDevice) return;

        const cursor = cursorRef.current;
        const trailLength = 12;

        // Initialize ghosts
        // We render them via JS to append to body or keep them in component? 
        // For performance and structure matching original, let's create them dynamically or render them in JSX.
        // Rendering in JSX is more React-friendly.

        const mouse = { x: 0, y: 0 };
        const cursorState = { x: 0, y: 0 };
        const ghosts = [];

        // Initialize ghost states
        for (let i = 0; i < trailLength; i++) {
            ghosts.push({ x: 0, y: 0 });
        }

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;

            // Hover check
            const target = e.target;
            const isClickable =
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button') ||
                target.classList.contains('interactive-card') ||
                target.classList.contains('project-item') ||
                target.closest('.project-item') ||
                window.getComputedStyle(target).cursor === 'pointer';

            if (isClickable) {
                cursor.classList.add('hover');
            } else {
                cursor.classList.remove('hover');
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            // Head interpolation
            const headLerp = 0.35;
            cursorState.x += (mouse.x - cursorState.x) * headLerp;
            cursorState.y += (mouse.y - cursorState.y) * headLerp;

            if (cursor) {
                cursor.style.left = `${cursorState.x}px`;
                cursor.style.top = `${cursorState.y}px`;
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

                    el.style.left = `${ghost.x}px`;
                    el.style.top = `${ghost.y}px`;

                    prevX = ghost.x;
                    prevY = ghost.y;
                }
            });

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // Render ghosts
    const trailLength = 12;
    const ghostElements = Array.from({ length: trailLength }).map((_, i) => {
        const scale = 1 - (i / trailLength) * 0.5;
        const opacity = 1 - (i / trailLength) * 0.8;
        return (
            <div
                key={i}
                ref={el => ghostsRef.current[i] = el}
                className="cursor-ghost"
                style={{
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    opacity: opacity
                }}
            />
        );
    });

    return (
        <>
            <div ref={cursorRef} className="custom-cursor" />
            {ghostElements}
        </>
    );
}
