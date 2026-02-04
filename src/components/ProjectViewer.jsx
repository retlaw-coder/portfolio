import { useState, useEffect, useRef } from 'react';
import useSwipe from '../hooks/useSwipe';

const ASSETS_PATH = import.meta.env.BASE_URL + 'assets/';

export default function ProjectViewer({ project, projectIndex, totalProjects, onPrev, onNext, currentLang }) {
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
            setCurrentAssetIndex(0);
        }
    }, [project]);

    // Swipe gestures
    const swipeHandlers = useSwipe(
        () => onNext(), // swipe left = next project
        () => onPrev()  // swipe right = prev project
    );

    const handleThumbnailClick = (index) => {
        setCurrentAssetIndex(index);
    };

    const currentAsset = assets[currentAssetIndex];

    return (
        <div className="gallery-wrapper" {...swipeHandlers}>
            {/* Main Display Container with Navigation Buttons */}
            <div className="main-display-wrapper">
                {/* Prev Button - Only covers main display */}
                <button
                    className={`nav-sidebar-btn prev-btn ${projectIndex === 0 ? 'disabled' : ''}`}
                    onClick={onPrev}
                    disabled={projectIndex === 0}
                    aria-label="Proyecto anterior"
                >
                    <span className="arrow-icon">&lt;</span>
                    <span className="nav-hint">PREV</span>
                </button>

                {/* Main Display */}
                <div className="main-display-container" ref={displayRef}>
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
                </div>

                {/* Next Button - Only covers main display */}
                <button
                    className={`nav-sidebar-btn next-btn ${projectIndex === totalProjects - 1 ? 'disabled' : ''}`}
                    onClick={onNext}
                    disabled={projectIndex === totalProjects - 1}
                    aria-label="Proyecto siguiente"
                >
                    <span className="arrow-icon">&gt;</span>
                    <span className="nav-hint">NEXT</span>
                </button>
            </div>

            {/* Thumbnails Track - Outside of navigation buttons */}
            <div className="thumbnails-track">
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
            </div>
        </div>
    );
}
