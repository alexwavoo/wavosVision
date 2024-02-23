import React, { useState, useEffect } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const CollectionList = ({ calculatedHeight, collections, setCollections }) => {
    const [subtitlePositions, setSubtitlePositions] = useState({});
    const [loading, setLoading] = useState(true);
    const [intro, setIntro] = useState(true);
    const [afterTransition, setAfterTransition] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [counter , setCounter] = useState(0);
    
    const nav = useNavigate();
    
    useEffect(() => {
        // Set body and id='app' to overflow hidden
        document.body.style.overflow = 'hidden';
        document.getElementById('app').style.overflow = 'hidden';

        // Cleanup function to reset styles when component unmounts
        return () => {
            document.body.style.overflow = 'unset';
            const appElement = document.getElementById('app');
            if (appElement) {
                appElement.style.overflow = 'unset';
            }
        };
    }, []);

    const updateSubtitlePositions = () => {
        if (collections) {
            const positions = {};
            collections.forEach((collection) => {
                const element = document.getElementById(`collection-item-${collection.sys.id}`);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    positions[collection.sys.id] = { x: centerX, y: centerY };
                }
            });
            setSubtitlePositions(positions);
        }
    };

    useEffect(() => {
        updateSubtitlePositions();
        window.addEventListener('resize', updateSubtitlePositions);
        return () => {
            window.removeEventListener('resize', updateSubtitlePositions);
        };
    }, [collections, loading, intro, afterTransition, subtitlePositions]);

    useEffect(() => {
        if (collections && !loading && !intro) {
            setTimeout(() => {
                setAfterTransition(true);
            }, 2350);
        }
    }, [collections]);

    useEffect(() => {
        function preloadImages() {
            return new Promise((resolve) => {
                const images = [];
                collections.forEach((collection) => {
                    const image = new Image();
                    image.src = `${collection.thumbnail.url}?h=500`;
                    image.onload = () => {
                        images.push(image);
                        if (images.length === collections.length) {
                            resolve();
                        }
                    };
                });
            });
        }

        if (collections) {
            preloadImages().then(() => setImagesLoaded(true));
        }

        if (imagesLoaded) {
            setTimeout(() => {
                setIntro(false);
            }, 3500);
        }
    }, [collections, imagesLoaded, loading, intro, afterTransition]);

    useEffect(() => {
        if (collections) {
            const sortedCollections = collections.slice().sort((b, a) => {
                return a.title.localeCompare(b.title);
            });
            setCollections(sortedCollections);
        }
    }, [collections]);

    useEffect(() => {
        // Create Ripple effect for each collection item
        if (collections) {
            collections.forEach((collection) => {
                const element = document.getElementById(`collection-item-${collection.sys.id}`);
                if (counter === 0 && element) {
                      new RippleEffect({
                        parent: element,
                        texture: `${collection.thumbnail.url}?h=500`,
                        intensity: 1,
                        strength: 1,
                        area: 1,
                        waveSpeed: 0.008,
                        speedIn: 0.75,
                        speedOut: 1,
                        easing: 'Expo.easeInOut',
                        hover: true,
                    });
                    setCounter(1);
                }
            });
        }
    }, [collections, loading, intro, afterTransition, imagesLoaded, subtitlePositions, setSubtitlePositions]);

    if (!collections) {
        return '';
    }

    if (intro) {
        return (
            <div className="home" style={{ height: `${calculatedHeight}px` }}>
                <div className="title">WAVO'S VISION</div>
            </div>
        );
    } else {
        return (
            <div className={`collection-wrapper ${loading ? 'invisible' : ''}`}>
                <div className='menu-wrapper' style={{ height: `${calculatedHeight - 60}px` }}>
                    <div className="menu">
                        {collections.map((collection) => (
                            <Link
                            key={collection.sys.id}
                            to={`/collection/${collection.sys.id}/projects`}
                            className="collection-item"
                            id={`collection-item-${collection.sys.id}`}
                            onClick={(e) => {
                                e.preventDefault(); // Prevent default link behavior
                                setTimeout(() => {
                                    nav(`/collection/${collection.sys.id}/projects`);// Redirect after 1 second delay
                                }, 1000);
                            }}
                        >
                            {subtitlePositions[collection.sys.id] && (
                                <p
                                    style={{
                                        position: 'absolute',
                                        top: `${subtitlePositions[collection.sys.id].y}px`,
                                        left: `${subtitlePositions[collection.sys.id].x}px`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                >
                                    {collection.title}
                                </p>
                            )}
                        </Link>
                        ))}
                    </div>
                </div>
                <Link to="/">
                    <img className={`logo ${afterTransition ? 'loaded' : ''}`} src="/stars.png" alt="" style={{ display: 'none' }} />
                </Link>
            </div>
        );
    }
};

export default CollectionList;
