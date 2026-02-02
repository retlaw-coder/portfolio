import { useEffect } from 'react';

export default function useScrollReveal() {
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    // Glitch text effect handling
                    if (entry.target.classList.contains('reveal-text')) {
                        // Optional: Add specific JS animation logic if CSS isn't enough
                    }
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.reveal-text, .project-item, .section-title, .cv-entry');
        elements.forEach(el => observer.observe(el));

        return () => {
            elements.forEach(el => observer.unobserve(el));
            observer.disconnect();
        };
    }); // Run on every render to catch new elements
}
