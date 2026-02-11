import { useEffect } from 'react';

export default function useScrollReveal() {
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -60px 0px',  // Triggers slightly before element enters viewport
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all revealable elements
        const selectors = [
            '.reveal-text',
            '.reveal-item',
            '.project-item',
            '.section-title',
            '.cv-entry',
            '.cv-label',
            '.cv-header',
            '.contact-text',
            '.contact-btn-red',
            '.tech-list'
        ];

        const elements = document.querySelectorAll(selectors.join(', '));
        elements.forEach(el => observer.observe(el));

        return () => {
            elements.forEach(el => observer.unobserve(el));
            observer.disconnect();
        };
    }); // Run on every render to catch new elements
}
