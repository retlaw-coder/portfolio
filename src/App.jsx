import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import Loader from './components/Loader';
import Header from './components/Header';
import Hero from './components/Hero';
import ContactModal from './components/ContactModal';
import CategoryView from './components/CategoryView';
import CustomCursor from './components/CustomCursor';
import useSmoothScroll from './hooks/useSmoothScroll';
import useScrollReveal from './hooks/useScrollReveal';
import { CATEGORIES_ORDER, CATEGORIES_CONFIG } from './utils/categories';
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

    return (
        <>
            <Hero currentLang={currentLang} />

            <section className="projects-container" id="projects-start">
                <div className="projects-layout">
                    <div className="projects-sidebar">
                        <h3 className="section-title heavy-title sticky-title">
                            {currentLang === 'es' ? 'ÁREAS DE TRABAJO' : 'WORK AREAS'}
                        </h3>
                    </div>
                    <div className="projects-list" id="dynamic-categories-list">
                        {CATEGORIES_ORDER.map(key => {
                            const data = CATEGORIES_CONFIG[key];
                            return (
                                <Link
                                    to={`/category/${key}?p=0`}
                                    key={key}
                                    className="project-item interactive-card link-transition"
                                >
                                    <div className="project-media">
                                        <img src={data.img} alt={data.title} loading="lazy" />
                                    </div>
                                    <div className="project-info">
                                        <h3>{data.title}</h3>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="cv-section">
                <div className="cv-header">
                    <h2>// PERFIL_DATA</h2>
                    <span className="cv-id">ID:2026 v3.1</span>
                </div>
                <div className="cv-grid">
                    <div className="cv-col">
                        <h4 className="cv-label">STACK_TOOLS</h4>
                        <ul className="tech-list">
                            <li><span>BLENDER</span> <span className="level">//// ADV</span></li>
                            <li><span>PHOTOSHOP</span> <span className="level">//// EXP</span></li>
                            <li><span>PREMIERE</span> <span className="level">/// ADV</span></li>
                            <li><span>AFTER EFFECTS</span> <span className="level">/// INT</span></li>
                            <li><span>JAVA, HTML, CSS</span> <span className="level">/// ADV</span></li>
                            <li><span>FIGMA</span> <span className="level">/// ADV</span></li>
                        </ul>
                    </div>

                    <div className="cv-col">
                        <h4 className="cv-label">HISTORIAL_LOG</h4>
                        <div className="cv-entry">
                            <span className="year">/// 2023 - PRES.</span>
                            <p>Artista 3D Freelance</p>
                            <small>Global Remote</small>
                        </div>
                        <div className="cv-entry">
                            <span className="year">/// 2020 - PRES.</span>
                            <p>Licenciatura en Diseño Multimedia</p>
                            <small>Universidad Nacional de La Plata</small>
                        </div>
                    </div>

                    <div className="cv-col action-col">
                        <h4 className="cv-label">INITIATE_CONTACT</h4>
                        <p className="contact-text">
                            {currentLang === 'es' ? 'Disponible para nuevos desafíos.' : 'Available for new challenges.'}
                        </p>
                        <button
                            className="contact-btn-red interactive-btn open-contact-trigger"
                            aria-label="Iniciar nuevo proyecto"
                            onClick={onContactClick}
                        >
                            {currentLang === 'es' ? 'INICIAR PROYECTO ->' : 'START PROJECT ->'}
                        </button>
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
