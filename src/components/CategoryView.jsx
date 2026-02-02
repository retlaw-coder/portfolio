import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProjectViewer from './ProjectViewer';
import OtherProjects from './OtherProjects';
import projectsData from '../data/projects.json';

const CATEGORIES_CONFIG = {
    '3d': { title: '3D', key: '3d' },
    'motion': { title: 'Motion Graphics', key: 'motion' },
    'ui': { title: 'UI/UX', key: 'ui' },
    'video': { title: 'Video Editing', key: 'video' }
};

const CATEGORIES_ORDER = ['3d', 'motion', 'ui', 'video'];

export default function CategoryView({ currentLang }) {
    const { category } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const projectIndex = parseInt(searchParams.get('p') || '0');

    const categoryProjects = projectsData.filter(
        p => p.category === category
    );

    const currentProject = categoryProjects[projectIndex];

    const handleProjectChange = (newIndex) => {
        setSearchParams({ p: newIndex });
    };

    const handlePrev = () => {
        if (projectIndex > 0) {
            handleProjectChange(projectIndex - 1);
        }
    };

    const handleNext = () => {
        if (projectIndex < categoryProjects.length - 1) {
            handleProjectChange(projectIndex + 1);
        }
    };

    if (!currentProject) {
        return <div>Project not found</div>;
    }

    return (
        <div className="category-page">
            <div className="detail-container-grid">
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
                        {currentProject.link && (
                            <a href={currentProject.link} target="_blank" rel="noopener noreferrer" className="external-link">
                                {currentLang === 'es' ? 'Ver proyecto →' : 'View project →'}
                            </a>
                        )}
                    </div>
                </aside>

                {/* Media Grid */}
                <div className="detail-media-grid">
                    {/* Category Navigation */}
                    <div className="category-top-nav">
                        {CATEGORIES_ORDER.map(cat => (
                            <a
                                key={cat}
                                href={`/category/${cat}?p=0`}
                                className={`cat-nav-link ${cat === category ? 'active' : ''}`}
                            >
                                {CATEGORIES_CONFIG[cat].title}
                            </a>
                        ))}
                    </div>

                    {/* Project Viewer */}
                    <ProjectViewer
                        project={currentProject}
                        projectIndex={projectIndex}
                        totalProjects={categoryProjects.length}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        currentLang={currentLang}
                    />

                    {/* Other Projects */}
                    <OtherProjects
                        categoryProjects={categoryProjects}
                        currentProjectIndex={projectIndex}
                        category={category}
                        categoryTitle={CATEGORIES_CONFIG[category].title}
                        onProjectSelect={handleProjectChange}
                        currentLang={currentLang}
                    />
                </div>
            </div>
        </div>
    );
}
