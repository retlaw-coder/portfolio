import { useEffect, useRef } from 'react';

export default function useSwipe(onSwipeLeft, onSwipeRight) {
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        const threshold = 50; // minimum swipe distance

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swiped left
                onSwipeLeft?.();
            } else {
                // Swiped right
                onSwipeRight?.();
            }
        }
    };

    return {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd
    };
}
