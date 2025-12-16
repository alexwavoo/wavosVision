import React, { useEffect, useState } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';
import MasonryFadeItem from '../components/MasonryFadeItem';

const CollectionList = ({ calculatedHeight, collections, clientImages, signatureImages, dataFetched }) => {
  // State to control content visibility after data is fetched
  const [showContent, setShowContent] = useState(false);
  // Track how many initial images have loaded
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Combine client and signature images into single array
  const allImages = [...(clientImages || []), ...(signatureImages || [])];
  
  // Number of images to preload before showing content (first batch above fold)
  const PRELOAD_COUNT = Math.min(12, allImages.length);

  // Preload initial images before showing content
  useEffect(() => {
    if (!dataFetched || allImages.length === 0) return;

    const imagesToPreload = allImages.slice(0, PRELOAD_COUNT);
    let loadedCount = 0;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= imagesToPreload.length) {
        setImagesPreloaded(true);
      }
    };

    // Preload images
    imagesToPreload.forEach((image) => {
      const img = new Image();
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded; // Count errors too so we don't hang
      img.src = `${image.imageUrl}?w=800`;
    });

    // Fallback timeout in case images take too long
    const fallbackTimeout = setTimeout(() => {
      if (!imagesPreloaded) {
        setImagesPreloaded(true);
      }
    }, 5000);

    return () => clearTimeout(fallbackTimeout);
  }, [dataFetched, allImages.length]);

  // Show content after images are preloaded
  useEffect(() => {
    if (imagesPreloaded) {
      // Small delay to ensure layout is stable
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [imagesPreloaded]);

  // Return null if required data is missing
  if (!collections || !clientImages || !signatureImages) return null;

  return (
    <>
      {/* Loading / Title Screen */}
      <div
        className="loading-screen"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: !showContent ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'var(--background)',
          zIndex: 9999,
          width: '100vw',
          height: '100vh',
        }}
      >
        <div className="title">WAVO'S VISION</div>
      </div>

      {/* Main Content */}
      <div
        className="collection-wrapper"
        style={{ display: showContent ? 'block' : 'none' }}
      >
        {/* Masonry Grid */}
        <div className="masonry-container">
          {allImages.map((image, index) => (
            <Link
              key={`${image.imageId}-${index}`}
              to={`/collection/${image.collectionId}/projects/${image.projectId}`}
              style={{ textDecoration: 'none' }}
            >
              <MasonryFadeItem
                src={`${image.imageUrl}?w=800`}
                width={image.imageWidth}
                height={image.imageHeight}
                alt={image.projectTitle || image.imageId}
                projectTitle={image.projectTitle}
              />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default CollectionList;
