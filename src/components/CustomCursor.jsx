import { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
    const cursorRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false); // Initially hidden to avoid jumping

    useEffect(() => {
        // Only on desktop devices
        const isTouchDevice = window.matchMedia("(hover: none)").matches;
        if (isTouchDevice) return;

        setIsVisible(true);

        const onMouseMove = (e) => {
            setTargetPosition({ x: e.clientX, y: e.clientY });

            // Check for hover targets
            const target = e.target;
            const isClickable =
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button') ||
                target.classList.contains('interactive-card') ||
                target.classList.contains('project-item') ||
                target.closest('.project-item');

            setIsHovering(!!isClickable);
        };

        window.addEventListener('mousemove', onMouseMove);

        // Animation loop for smooth follow
        let rafId;
        const animateCursor = () => {
            setPosition(prev => {
                const dx = targetPosition.x - prev.x;
                const dy = targetPosition.y - prev.y;

                // Lerp factor (0.1 for smooth delay)
                return {
                    x: prev.x + dx * 0.15,
                    y: prev.y + dy * 0.15
                };
            });
            rafId = requestAnimationFrame(animateCursor);
        };
        rafId = requestAnimationFrame(animateCursor);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(rafId);
        };
    }, [targetPosition]); // Dependency on targetPosition ensures loop updates with fresh target

    // We actually need a ref for the values inside the loop if we want to avoid re-renders per frame for the loop itself,
    // but React state is fine for simple cursor if optimized properly. 
    // However, for pure performance, direct DOM manipulation is often better for cursors.
    // Let's refactor to direct DOM for 60fps smoothness without React render overhead.

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        // Only on desktop
        const isTouchDevice = window.matchMedia("(hover: none)").matches;
        if (isTouchDevice) {
            cursor.style.display = 'none';
            return;
        }

        let currentX = 0;
        let currentY = 0;
        let targetX = 0;
        let targetY = 0;

        const onMouseMove = (e) => {
            targetX = e.clientX;
            targetY = e.clientY;

            // Check hover
            const target = e.target;
            const isClickable =
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button') ||
                target.classList.contains('interactive-card') ||
                target.classList.contains('project-item') ||
                target.closest('.project-item');

            if (isClickable) {
                cursor.classList.add('hover');
            } else {
                cursor.classList.remove('hover');
            }
        };

        window.addEventListener('mousemove', onMouseMove);

        let rafId;
        const animate = () => {
            const dx = targetX - currentX;
            const dy = targetY - currentY;

            currentX += dx * 0.15;
            currentY += dy * 0.15;

            cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            rafId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return <div ref={cursorRef} className="custom-cursor"></div>;
}
