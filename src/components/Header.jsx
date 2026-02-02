import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ currentLang, onLangChange, onContactClick }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogoClick = (e) => {
        e.preventDefault();
        if (location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/');
        }
    };

    return (
        <nav className="sticky-nav">
            <div className="nav-logo">
                <a href="/" onClick={handleLogoClick}>WALTER CUSTODIO</a>
            </div>

            <div className="nav-right">
                <button
                    className="nav-btn lang-switch"
                    onClick={onLangChange}
                    aria-label="Switch Language"
                >
                    {currentLang.toUpperCase()}
                </button>

                <button
                    className="nav-btn contact-nav-btn"
                    onClick={onContactClick}
                >
                    {currentLang === 'es' ? 'CONTACTAR' : 'CONTACT'}
                </button>
            </div>
        </nav>
    );
}
