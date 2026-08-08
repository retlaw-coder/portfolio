import { useState, useEffect, useRef } from 'react';
import useSwipe from '../hooks/useSwipe';

const ASSETS_PATH = import.meta.env.BASE_URL + 'assets/';

export default function ProjectViewer({
    project,
    categoryProjects,
    projectIndex,
    assetIndex,
    onProjectSelect,
    nextCategoryName,
    nextCategoryFirstProject,
    onPrev,
    onNext,
    currentLang,
    dir
}) {
    const [currentAssetIndex, setCurrentAssetIndex] = useState(assetIndex || 0);
    const [assets, setAssets] = useState([]);
    const [allCategoryAssets, setAllCategoryAssets] = useState([]);
    const displayRef = useRef(null);
    const trackRef = useRef(null);

    // Load assets from project data
    useEffect(() => {
        if (project.assets && project.assets.length > 0) {
            const loadedAssets = project.assets.map(asset => ({
                type: asset.type,
                src: `${ASSETS_PATH}${asset.src}`,
                isVertical: asset.vertical || false
            }));
            setAssets(loadedAssets);

            // Set to end if coming from backward navigation
            if (dir === 'prev') {
                setCurrentAssetIndex(loadedAssets.length - 1);
            } else {
                setCurrentAssetIndex(assetIndex < loadedAssets.length ? assetIndex : 0);
            }
        }
    }, [project, dir, assetIndex]);

    // Build flattened list of all assets in category
    useEffect(() => {
        const flattened = [];
        categoryProjects.forEach((proj, pIdx) => {
            if (proj.assets && proj.assets.length > 0) {
                proj.assets.forEach((asset, aIdx) => {
                    flattened.push({
                        type: asset.type,
                        src: `${ASSETS_PATH}${asset.src}`,
                        pIdx,
                        aIdx,
                        projTitle: currentLang === 'es' ? proj.title : (proj.title_en || proj.title)
                    });
                });
            }
        });
        setAllCategoryAssets(flattened);
    }, [categoryProjects, currentLang]);

    // Auto-scroll thumbnails track so active item stays in ~3rd position
    useEffect(() => {
        if (trackRef.current) {
            const activeItem = trackRef.current.querySelector('.thumb-item.active');
            if (activeItem) {
                // 3rd place means offset by 2 items (approx 150px each)
                const itemWidth = activeItem.offsetWidth;
                const gap = 10;
                const offset = (itemWidth + gap) * 2;
                const targetScroll = activeItem.offsetLeft - offset;
                
                trackRef.current.scrollTo({
                    left: Math.max(0, targetScroll),
                    behavior: 'smooth'
                });
            }
        }
    }, [currentAssetIndex, projectIndex, allCategoryAssets]);

    // Swipe gestures
    const swipeHandlers = useSwipe(
        () => handleNext(), // swipe left = next
        () => handlePrev()  // swipe right = prev
    );

    const handlePrev = () => {
        if (currentAssetIndex > 0) {
            setCurrentAssetIndex(prev => prev - 1);
        } else {
            // Let parent handle navigation to previous project
            onPrev();
        }
    };

    const handleNext = () => {
        if (currentAssetIndex < assets.length - 1) {
            setCurrentAssetIndex(prev => prev + 1);
        } else {
            // Let parent handle navigation to next project
            onNext();
        }
    };

    const currentAsset = assets[currentAssetIndex];

    return (
        <div className="gallery-wrapper" {...swipeHandlers}>
            {/* Main Display Container with Navigation Buttons Inside */}
            <div className="main-display-container" ref={displayRef} style={{ position: 'relative' }}>
                {/* Prev Button */}
                <button
                    className="nav-sidebar-btn prev-btn"
                    onClick={handlePrev}
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
                            style={{ animation: 'fadeIn 0.3s ease-out' }}
                        />
                    ) : (
                        <img
                            key={currentAsset.src}
                            className="main-display-media"
                            src={currentAsset.src}
                            alt={`${project.title} - Asset ${currentAssetIndex + 1}`}
                            style={{ animation: 'fadeIn 0.3s ease-out' }}
                        />
                    )
                )}

                {/* Next Button */}
                <button
                    className="nav-sidebar-btn next-btn"
                    onClick={handleNext}
                    aria-label="Next"
                >
                    <span className="arrow-icon" style={{ fontSize: '1.5rem', color: '#fff' }}>&gt;</span>
                </button>
            </div>

            {/* Thumbnails Track (Assets Navigation) */}
            <div className="thumbnails-track" ref={trackRef} style={{ display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', padding: '10px 0', scrollBehavior: 'smooth' }}>
                {allCategoryAssets.map((item) => {
                    const isActive = item.pIdx === projectIndex && item.aIdx === currentAssetIndex;
                    return (
                        <div
                            key={`${item.pIdx}-${item.aIdx}`}
                            className={`thumb-item ${isActive ? 'active' : ''}`}
                            onClick={() => {
                                if (item.pIdx === projectIndex) {
                                    setCurrentAssetIndex(item.aIdx);
                                } else {
                                    onProjectSelect(item.pIdx, item.aIdx);
                                }
                            }}
                            style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                            title={item.projTitle}
                        >
                            {item.type === 'video' ? (
                                <video src={`${item.src}#t=0.1`} muted />
                            ) : (
                                <img src={item.src} alt={item.projTitle} />
                            )}
                        </div>
                    );
                })}
                
                {nextCategoryFirstProject && nextCategoryFirstProject.assets && (
                    <>
                        <div className="thumb-separator-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 10px', opacity: 0.6 }}>
                            <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-color)', whiteSpace: 'nowrap', marginBottom: '5px' }}>
                                NEXT CATEGORY: <br/>{nextCategoryName}
                            </span>
                            <div className="thumb-separator" style={{ width: '2px', height: '30px', backgroundColor: '#444', borderRadius: '2px' }}></div>
                        </div>
                        
                        {nextCategoryFirstProject.assets.map((asset, idx) => (
                            <div
                                key={`next-${idx}`}
                                className="thumb-item next-project-thumb"
                                style={{ opacity: 0.4, cursor: 'pointer', border: '1px dashed #444' }}
                                onClick={() => onNext()}
                                title={`Go to ${nextCategoryName}`}
                            >
                                {asset.type === 'video' ? (
                                    <video src={`${ASSETS_PATH}${asset.src}#t=0.1`} muted />
                                ) : (
                                    <img src={`${ASSETS_PATH}${asset.src}`} alt={`Next Category`} />
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
