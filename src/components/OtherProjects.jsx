const ASSETS_PATH = '/assets/';

export default function OtherProjects({
    categoryProjects,
    currentProjectIndex,
    category,
    categoryTitle,
    onProjectSelect,
    currentLang
}) {
    const otherProjects = categoryProjects.filter((_, idx) => idx !== currentProjectIndex);

    if (otherProjects.length === 0) return null;

    return (
        <div className="other-projects-section">
            <div className="other-projects-separator">
                <span className="separator-line"></span>
                <span className="separator-text">
                    {currentLang === 'es' ? 'OTROS PROYECTOS EN' : 'OTHER PROJECTS IN'} {categoryTitle.toUpperCase()}
                </span>
                <span className="separator-line"></span>
            </div>

            <div className="other-projects-grid">
                {otherProjects.map((project) => {
                    const actualIndex = categoryProjects.findIndex(p => p.id === project.id);
                    const firstAsset = project.assets && project.assets[0]
                        ? `${ASSETS_PATH}${project.assets[0].src}`
                        : `${ASSETS_PATH}p${project.id}_0.webp`;

                    const assetCount = project.assets ? project.assets.length : '?';
                    const projectTitle = currentLang === 'es'
                        ? project.title
                        : (project.title_en || project.title);

                    return (
                        <div
                            key={project.id}
                            className="other-project-card interactive-card"
                            onClick={() => onProjectSelect(actualIndex)}
                        >
                            <div className="other-project-thumb">
                                <img src={firstAsset} alt={projectTitle} loading="lazy" />
                            </div>
                            <div className="other-project-info">
                                <h4>{projectTitle}</h4>
                                <span className="other-project-count">{assetCount} assets</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
