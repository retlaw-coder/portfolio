import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import ProjectViewer from './ProjectViewer';
import OtherProjects from './OtherProjects';
import projectsData from '../data/projects.json';
import { CATEGORIES_ORDER, CATEGORIES_CONFIG } from '../utils/categories';

export default function CategoryView({ currentLang }) {
    const { category } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const projectIndex = parseInt(searchParams.get('p') || '0');

    // Normalize category for comparison
    const currentCategoryKey = category.toLowerCase();
    const currentCategoryIndex = CATEGORIES_ORDER.indexOf(currentCategoryKey);

    const categoryProjects = projectsData.filter(
        p => p.category.toLowerCase() === currentCategoryKey
    );

    const currentProject = categoryProjects[projectIndex];

    let nextProject = null;
    if (projectIndex < categoryProjects.length - 1) {
        nextProject = categoryProjects[projectIndex + 1];
    } else if (currentCategoryIndex < CATEGORIES_ORDER.length - 1) {
        const nextCategoryKey = CATEGORIES_ORDER[currentCategoryIndex + 1];
        nextProject = projectsData.filter(p => p.category.toLowerCase() === nextCategoryKey)[0];
    }

    const handleProjectChange = (newIndex) => {
        setSearchParams({ p: newIndex });
    };

    const handlePrev = () => {
        if (projectIndex > 0) {
            handleProjectChange(projectIndex - 1);
        } else if (currentCategoryIndex > 0) {
            // Go to previous category (last project)
            const prevCategoryKey = CATEGORIES_ORDER[currentCategoryIndex - 1];
            const prevCategoryProjects = projectsData.filter(
                p => p.category.toLowerCase() === prevCategoryKey
            );
            // Navigate to last project of previous category
            navigate(`/category/${prevCategoryKey}?p=${prevCategoryProjects.length - 1}`);
        }
    };

    const handleNext = () => {
        if (projectIndex < categoryProjects.length - 1) {
            handleProjectChange(projectIndex + 1);
        } else if (currentCategoryIndex < CATEGORIES_ORDER.length - 1) {
            // Go to next category (first project)
            const nextCategoryKey = CATEGORIES_ORDER[currentCategoryIndex + 1];
            navigate(`/category/${nextCategoryKey}?p=0`);
        }
    };

    if (!currentProject) {
        return <div>Project not found</div>;
    }

    return (
        <div className="category-page">
            <div className="detail-container-grid">
                {/* Category Navigation - Top Row */}
                <div className="category-top-nav">
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

                {/* Left Column Wrapper */}
                <div className="left-column-wrapper">
                    {/* Sidebar */}
                    <aside className="detail-sidebar">
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
                                {currentLang === 'es' ? currentProject.desc : (currentProject.desc_en || currentProject.desc)}
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

                    {/* Other Projects - Now Below Sidebar */}
                    <OtherProjects
                        categoryProjects={categoryProjects}
                        currentProjectIndex={projectIndex}
                        category={currentCategoryKey}
                        categoryTitle={CATEGORIES_CONFIG[currentCategoryKey]?.title || currentCategoryKey}
                        onProjectSelect={handleProjectChange}
                        currentLang={currentLang}
                    />
                </div>

                {/* Media Grid */}
                <div className="detail-media-grid">
                    {/* Project Viewer */}
                    <ProjectViewer
                        project={currentProject}
                        nextProject={nextProject}
                        projectIndex={projectIndex}
                        totalProjects={categoryProjects.length}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        currentLang={currentLang}
                        isFirstGlobal={currentCategoryIndex === 0 && projectIndex === 0}
                        isLastGlobal={currentCategoryIndex === CATEGORIES_ORDER.length - 1 && projectIndex === categoryProjects.length - 1}
                    />
                </div>
            </div>
        </div>
    );
}
