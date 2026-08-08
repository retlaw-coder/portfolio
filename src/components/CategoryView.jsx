import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import ProjectViewer from './ProjectViewer';
import projectsData from '../data/projects.json';
import { CATEGORIES_ORDER, CATEGORIES_CONFIG } from '../utils/categories';

export default function CategoryView({ currentLang }) {
    const { category } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const projectIndex = parseInt(searchParams.get('p') || '0');
    const assetIndex = parseInt(searchParams.get('a') || '0');

    // Normalize category for comparison
    const currentCategoryKey = category.toLowerCase();
    const currentCategoryIndex = CATEGORIES_ORDER.indexOf(currentCategoryKey);
    const categoryConfig = CATEGORIES_CONFIG[currentCategoryKey] || {};

    const categoryProjects = projectsData.filter(
        p => p.category.toLowerCase() === currentCategoryKey
    );

    const currentProject = categoryProjects[projectIndex];

    let nextCategoryName = null;
    let nextCategoryFirstProject = null;

    let searchIdx = currentCategoryIndex + 1;
    let foundNextCat = false;
    while (searchIdx < CATEGORIES_ORDER.length) {
        const key = CATEGORIES_ORDER[searchIdx];
        const projs = projectsData.filter(p => p.category.toLowerCase() === key);
        if (projs.length > 0) {
            nextCategoryName = currentLang === 'es' ? CATEGORIES_CONFIG[key].title : (CATEGORIES_CONFIG[key].title_en || CATEGORIES_CONFIG[key].title);
            nextCategoryFirstProject = projs[0];
            foundNextCat = true;
            break;
        }
        searchIdx++;
    }
    if (!foundNextCat) {
        let firstIdx = 0;
        while (firstIdx < CATEGORIES_ORDER.length) {
            const key = CATEGORIES_ORDER[firstIdx];
            const projs = projectsData.filter(p => p.category.toLowerCase() === key);
            if (projs.length > 0) {
                nextCategoryName = currentLang === 'es' ? CATEGORIES_CONFIG[key].title : (CATEGORIES_CONFIG[key].title_en || CATEGORIES_CONFIG[key].title);
                nextCategoryFirstProject = projs[0];
                break;
            }
            firstIdx++;
        }
    }

    const handleProjectChange = (newIndex, newAssetIndex = 0) => {
        setSearchParams({ p: newIndex, a: newAssetIndex });
    };

    const handlePrev = () => {
        if (projectIndex > 0) {
            setSearchParams({ p: projectIndex - 1, dir: 'prev' });
        } else {
            let prevCatIdx = currentCategoryIndex - 1;
            let found = false;
            while (prevCatIdx >= 0) {
                const prevKey = CATEGORIES_ORDER[prevCatIdx];
                const prevProjects = projectsData.filter(p => p.category.toLowerCase() === prevKey);
                if (prevProjects.length > 0) {
                    navigate(`/category/${prevKey}?p=${prevProjects.length - 1}&dir=prev`);
                    found = true;
                    break;
                }
                prevCatIdx--;
            }
            if (!found) {
                let lastCatIdx = CATEGORIES_ORDER.length - 1;
                while (lastCatIdx >= 0) {
                    const lastKey = CATEGORIES_ORDER[lastCatIdx];
                    const lastProjects = projectsData.filter(p => p.category.toLowerCase() === lastKey);
                    if (lastProjects.length > 0) {
                        navigate(`/category/${lastKey}?p=${lastProjects.length - 1}&dir=prev`);
                        break;
                    }
                    lastCatIdx--;
                }
            }
        }
    };

    const handleNext = () => {
        if (projectIndex < categoryProjects.length - 1) {
            handleProjectChange(projectIndex + 1);
        } else {
            let nextCatIdx = currentCategoryIndex + 1;
            let found = false;
            while (nextCatIdx < CATEGORIES_ORDER.length) {
                const nextKey = CATEGORIES_ORDER[nextCatIdx];
                const nextProjects = projectsData.filter(p => p.category.toLowerCase() === nextKey);
                if (nextProjects.length > 0) {
                    navigate(`/category/${nextKey}?p=0`);
                    found = true;
                    break;
                }
                nextCatIdx++;
            }
            if (!found) {
                let firstCatIdx = 0;
                while (firstCatIdx < CATEGORIES_ORDER.length) {
                    const firstKey = CATEGORIES_ORDER[firstCatIdx];
                    const firstProjects = projectsData.filter(p => p.category.toLowerCase() === firstKey);
                    if (firstProjects.length > 0) {
                        navigate(`/category/${firstKey}?p=0`);
                        break;
                    }
                    firstCatIdx++;
                }
            }
        }
    };

    const categoryTitle = currentLang === 'es'
        ? (categoryConfig.title || currentCategoryKey)
        : (categoryConfig.title_en || categoryConfig.title || currentCategoryKey);

    const categoryNav = (
        <div className="category-top-nav" style={{ padding: '20px 25px', borderBottom: '1px solid #333', margin: 0, gap: '8px' }}>
            {CATEGORIES_ORDER.map(cat => (
                <Link
                    key={cat}
                    to={`/category/${cat}?p=0`}
                    className={`cat-nav-link ${cat === currentCategoryKey ? 'active' : ''}`}
                >
                    {currentLang === 'es'
                        ? CATEGORIES_CONFIG[cat].title
                        : (CATEGORIES_CONFIG[cat].title_en || CATEGORIES_CONFIG[cat].title)}
                </Link>
            ))}
        </div>
    );

    return (
        <div className="category-page" key={category} style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div className="detail-container-grid">

                {!currentProject ? (
                    <>
                        <div className="left-column-wrapper">
                            <aside className="detail-sidebar">
                                {categoryNav}
                                <div className="detail-header-block">
                                    <h1 id="dyn-title">{categoryTitle}</h1>
                                    <span className="detail-meta-label" style={{ marginTop: '10px', color: 'var(--accent-color)' }} id="dyn-subtitle">
                                        // {currentLang === 'es' ? 'PRÓXIMAMENTE' : 'COMING SOON'}
                                    </span>
                                </div>
                                <div className="detail-body-block">
                                    <p className="detail-desc-text" id="dyn-desc">
                                        {currentLang === 'es'
                                            ? 'Sección en actualización. Próximamente se incorporarán 3 nuevos videos cortos producidos recientemente.'
                                            : 'Section under update. 3 new video projects produced recently will be added soon.'}
                                    </p>
                                </div>
                            </aside>
                        </div>
                        <div className="detail-media-grid empty-category-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '12px', padding: '40px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                            <span style={{ fontSize: '2.5rem', marginBottom: '16px', opacity: 0.7 }}>🎬</span>
                            <h3 style={{ fontFamily: 'Orbitron, sans-serif', color: 'var(--accent-color)', marginBottom: '12px', letterSpacing: '1px' }}>
                                {currentLang === 'es' ? 'SECCIÓN EN ACTUALIZACIÓN' : 'SECTION UNDER UPDATE'}
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '400px', fontSize: '0.95rem' }}>
                                {currentLang === 'es'
                                    ? 'Próximamente se incorporarán 3 nuevos videos de edición y trabajo audiovisual.'
                                    : '3 new video editing & filmmaking projects coming soon.'}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Left Column Wrapper */}
                        <div className="left-column-wrapper">
                            {/* Sidebar */}
                            <aside className="detail-sidebar">
                                {categoryNav}
                                <div className="detail-header-block">
                                    <h1 id="dyn-title">
                                        {currentLang === 'es' ? currentProject.title : (currentProject.title_en || currentProject.title)}
                                    </h1>
                                    <span className="detail-meta-label" style={{ marginTop: '10px', color: 'var(--accent-color)' }} id="dyn-subtitle">
                                        // {currentLang === 'es' ? currentProject.subtitle : (currentProject.subtitle_en || currentProject.subtitle)}
                                    </span>
                                </div>
                                <div className="detail-body-block">
                                    <p className="detail-desc-text" id="dyn-desc">
                                        {currentLang === 'es' ? categoryConfig.desc : (categoryConfig.desc_en || categoryConfig.desc)}
                                    </p>
                                    <div className="tech-tags-container" style={{ marginBottom: '20px' }}>
                                        {currentProject.stack?.map((tech, index) => (
                                            <span key={index} className="tech-tag">{tech}</span>
                                        ))}
                                    </div>
                                    {currentProject.external_link && (
                                        <a href={currentProject.external_link} target="_blank" rel="noopener noreferrer" className="external-link">
                                            {currentLang === 'es' ? 'Ver proyecto →' : 'View project →'}
                                        </a>
                                    )}
                                </div>
                            </aside>

                        </div>

                        {/* Media Grid */}
                        <div className="detail-media-grid">
                            {/* Project Viewer */}
                            <ProjectViewer
                                project={currentProject}
                                categoryProjects={categoryProjects}
                                projectIndex={projectIndex}
                                assetIndex={assetIndex}
                                onProjectSelect={handleProjectChange}
                                nextCategoryName={nextCategoryName}
                                nextCategoryFirstProject={nextCategoryFirstProject}
                                onPrev={handlePrev}
                                onNext={handleNext}
                                currentLang={currentLang}
                                dir={searchParams.get('dir')}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

