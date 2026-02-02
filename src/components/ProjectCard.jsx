import { useNavigate } from 'react-router-dom';

export default function ProjectCard({ project, currentLang }) {
    const navigate = useNavigate();

    const title = currentLang === 'es' ? project.title : (project.title_en || project.title);
    const subtitle = currentLang === 'es' ? project.subtitle : (project.subtitle_en || project.subtitle);
    const desc = currentLang === 'es' ? project.desc : (project.desc_en || project.desc);

    const firstAsset = project.assets && project.assets[0]
        ? `/assets/${project.assets[0].src}`
        : `/assets/p${project.id}_0.png`;

    const isVideo = project.assets && project.assets[0]?.type === 'video';

    const handleClick = () => {
        navigate(`/category/${project.category}?p=0`);
    };

    return (
        <div className="project-item" onClick={handleClick}>
            <div className="project-media">
                {isVideo ? (
                    <video src={firstAsset} muted loop autoPlay playsInline></video>
                ) : (
                    <img src={firstAsset} alt={title} loading="lazy" />
                )}
            </div>
            <div className="project-info">
                <h3>{title}</h3>
                <span className="project-category">// {subtitle}</span>
                <p className="project-desc">{desc}</p>
                <div className="tech-tags-container">
                    {project.stack?.map((tech, index) => (
                        <span key={index} className="tech-tag">{tech}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
