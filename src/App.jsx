import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Loader from './components/Loader';
import Header from './components/Header';
import Hero from './components/Hero';
import ProjectCard from './components/ProjectCard';
import ContactModal from './components/ContactModal';
import CategoryView from './components/CategoryView';
import CustomCursor from './components/CustomCursor';
import useSmoothScroll from './hooks/useSmoothScroll';
import useScrollReveal from './hooks/useScrollReveal';
import projectsData from './data/projects.json';
import './index.css';

// Scroll reset component
function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

// Wrapper to apply hooks that need routing context
function AppContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [currentLang, setCurrentLang] = useState('es');
    const [showContactModal, setShowContactModal] = useState(false);
    const location = useLocation();

    // Initialize global hooks
    useSmoothScroll();
    useScrollReveal();

    // Manage Body Classes and Nav Visibility
    useEffect(() => {
        const body = document.body;
        const isHome = location.pathname === '/';

        // Set classes
        if (isHome) {
            body.classList.add('home-page');
            body.classList.remove('category-page');
        } else {
            body.classList.add('category-page');
            body.classList.remove('home-page');
        }

        // Scroll handler for nav visibility on Home
        const handleScroll = () => {
            const nav = document.querySelector('.sticky-nav');
            if (!nav) return;

            if (isHome) {
                if (window.scrollY > 100) {
                    nav.classList.add('visible');
                } else {
                    nav.classList.remove('visible');
                }
            } else {
                nav.classList.add('visible');
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname, isLoading]); // Re-run on route change or when loading finishes

    const handleLoaderComplete = () => {
        setIsLoading(false);
    };

    const toggleLang = () => {
        setCurrentLang(prev => prev === 'es' ? 'en' : 'es');
    };

    return (
        <>
            <ScrollToTop />
            <CustomCursor />

            {isLoading && <Loader onComplete={handleLoaderComplete} />}

            {!isLoading && (
                <>
                    <Header
                        currentLang={currentLang}
                        onLangChange={toggleLang}
                        onContactClick={() => setShowContactModal(true)}
                    />

                    <Routes>
                        <Route
                            path="/"
                            element={
                                <HomePage
                                    currentLang={currentLang}
                                    onContactClick={() => setShowContactModal(true)}
                                />
                            }
                        />
                        <Route
                            path="/category/:category"
                            element={<CategoryView currentLang={currentLang} />}
                        />
                    </Routes>

                    {showContactModal && (
                        <ContactModal
                            currentLang={currentLang}
                            onClose={() => setShowContactModal(false)}
                        />
                    )}
                </>
            )}
        </>
    );
}

function HomePage({ currentLang, onContactClick }) {
    const projects = projectsData;

    return (
        <>
            <Hero currentLang={currentLang} />

            <section className="projects-container">
                <h2 className="section-title reveal-text" data-es="PROYECTOS" data-en="PROJECTS">
                    {currentLang === 'es' ? 'PROYECTOS' : 'PROJECTS'}
                </h2>
                <div className="projects-list">
                    {projects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            currentLang={currentLang}
                        />
                    ))}
                </div>
            </section>

            <section className="cv-section">
                <h2 className="section-title reveal-text" data-es="EXPERIENCIA" data-en="EXPERIENCE">
                    {currentLang === 'es' ? 'EXPERIENCIA' : 'EXPERIENCE'}
                </h2>
                <div className="cv-grid">
                    <div className="cv-column reveal-text" style={{ transitionDelay: '0.1s' }}>
                        <h3 data-es="Educación" data-en="Education">
                            {currentLang === 'es' ? 'Educación' : 'Education'}
                        </h3>
                        <div className="cv-entry">
                            <strong>Diseño Multimedial</strong>
                            <small>Universidad Nacional de La Plata</small>
                            <small>2019 - 2024</small>
                        </div>
                    </div>

                    <div className="cv-column reveal-text" style={{ transitionDelay: '0.2s' }}>
                        <h3 data-es="Habilidades" data-en="Skills">
                            {currentLang === 'es' ? 'Habilidades' : 'Skills'}
                        </h3>
                        <div className="cv-entry">
                            <strong>3D & Motion</strong>
                            <small>Blender, After Effects, Premiere</small>
                        </div>
                        <div className="cv-entry">
                            <strong>UI/UX Design</strong>
                            <small>Figma, Adobe XD</small>
                        </div>
                    </div>

                    <div className="cv-column reveal-text" style={{ transitionDelay: '0.3s' }}>
                        <h3 data-es="Contacto" data-en="Contact">
                            {currentLang === 'es' ? 'Contacto' : 'Contact'}
                        </h3>
                        <div className="cv-entry">
                            <small>Argentina</small>
                            <button className="cv-link" onClick={onContactClick}>
                                {currentLang === 'es' ? 'Enviar mensaje' : 'Send message'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;
