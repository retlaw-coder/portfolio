import { useState, useEffect, useRef } from 'react';
import useSwipe from '../hooks/useSwipe';

const ASSETS_PATH = import.meta.env.BASE_URL + 'assets/';

export default function ProjectViewer({
    project,
    nextProject,
    projectIndex,
    totalProjects,
    onPrev,
    onNext,
    currentLang,
    isFirstGlobal,
    isLastGlobal
}) {
    const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
    const [assets, setAssets] = useState([]);
    const displayRef = useRef(null);

    // Load assets from project data
    useEffect(() => {
        if (project.assets && project.assets.length > 0) {
            const loadedAssets = project.assets.map(asset => ({
                type: asset.type,
                src: `${ASSETS_PATH}${asset.src}`,
                isVertical: asset.vertical || false
            }));
            setAssets(loadedAssets);

            // Default to start, but could support "start at end" via prop if needed later
            setCurrentAssetIndex(0);
        }
    }, [project]);

    // Swipe gestures
    const swipeHandlers = useSwipe(
        () => handleNext(), // swipe left = next
        () => handlePrev()  // swipe right = prev
    );

    const handleThumbnailClick = (index) => {
        setCurrentAssetIndex(index);
    };

    const handlePrev = () => {
        if (currentAssetIndex > 0) {
            setCurrentAssetIndex(prev => prev - 1);
        } else {
            // Let parent handle navigation (prev project or prev category)
            onPrev();
        }
    };

    const handleNext = () => {
        if (currentAssetIndex < assets.length - 1) {
            setCurrentAssetIndex(prev => prev + 1);
        } else {
            // Let parent handle navigation (next project or next category)
            onNext();
        }
    };

    // Disabled state is now controlled by global position, not just local project index
    // If props are missing (e.g. usage without CategoryView logic), fallback to local logic

    // First item globally? (First category, first project, first asset)
    const disablePrev = isFirstGlobal !== undefined
        ? (isFirstGlobal && currentAssetIndex === 0)
        : (projectIndex === 0 && currentAssetIndex === 0);

    // Last item globally? (Last category, last project, last asset)
    const disableNext = isLastGlobal !== undefined
        ? (isLastGlobal && currentAssetIndex === (assets.length - 1))
        : (projectIndex === totalProjects - 1 && currentAssetIndex === (assets.length - 1));

    const currentAsset = assets[currentAssetIndex];

    return (
        <div className="gallery-wrapper" {...swipeHandlers}>
            {/* Main Display Container with Navigation Buttons Inside */}
            <div className="main-display-container" ref={displayRef} style={{ position: 'relative' }}>
                {/* Prev Button */}
                <button
                    className={`nav-sidebar-btn prev-btn ${disablePrev ? 'disabled' : ''}`}
                    onClick={handlePrev}
                    disabled={disablePrev}
                    aria-label="Previous"
                >
                    <span className="arrow-icon" style={{ fontSize: '1.5rem', color: '#fff' }}>&lt;</span>
                </button>

                {currentAsset && (
                    currentAsset.type === 'video' ? (
                        <video
                            key={currentAsset.src}
                            className="main-display-media"
                            src={currentAsset.src}
                            controls
                            autoPlay
                            loop
                            muted
                        />
                    ) : (
                        <img
                            key={currentAsset.src}
                            className="main-display-media"
                            src={currentAsset.src}
                            alt={`${project.title} - Asset ${currentAssetIndex + 1}`}
                        />
                    )
                )}

                {/* Next Button */}
                <button
                    className={`nav-sidebar-btn next-btn ${disableNext ? 'disabled' : ''}`}
                    onClick={handleNext}
                    disabled={disableNext}
                    aria-label="Next"
                >
                    <span className="arrow-icon" style={{ fontSize: '1.5rem', color: '#fff' }}>&gt;</span>
                </button>
            </div>

            {/* Thumbnails Track */}
            <div className="thumbnails-track" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {assets.map((asset, index) => (
                    <div
                        key={index}
                        className={`thumb-item ${index === currentAssetIndex ? 'active' : ''}`}
                        onClick={() => handleThumbnailClick(index)}
                    >
                        {asset.type === 'video' ? (
                            <video src={`${asset.src}#t=0.1`} muted />
                        ) : (
                            <img src={asset.src} alt={`Thumbnail ${index + 1}`} />
                        )}
                    </div>
                ))}
                
                {nextProject && nextProject.assets && nextProject.assets.length > 0 && (
                    <>
                        <div className="thumb-separator" style={{ width: '2px', height: '40px', backgroundColor: '#333', borderRadius: '2px' }}></div>
                        {nextProject.assets.map((asset, index) => (
                            <div
                                key={`next-${index}`}
                                className="thumb-item next-project-thumb"
                                style={{ opacity: 0.3, cursor: 'pointer' }}
                                onClick={onNext}
                            >
                                {asset.type === 'video' ? (
                                    <video src={`${ASSETS_PATH}${asset.src}#t=0.1`} muted />
                                ) : (
                                    <img src={`${ASSETS_PATH}${asset.src}`} alt={`Next Project Thumbnail ${index + 1}`} />
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
