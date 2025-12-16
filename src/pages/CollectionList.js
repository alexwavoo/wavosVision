import React, { useEffect, useState } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';

const CollectionList = ({ calculatedHeight, collections, clientImages, signatureImages, dataFetched }) => {
  // State to control content visibility after data is fetched
  const [showContent, setShowContent] = useState(false);

  // Show content with delay after data is fetched
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dataFetched) {
        setShowContent(true);
      }
    }, 850);

    return () => {
      clearTimeout(timer);
    };
  }, [dataFetched]);

  // Return null if required data is missing
  if (!collections || !clientImages || !signatureImages) return null;

  // Combine client and signature images into single array
  const allImages = [...clientImages, ...signatureImages];

  return (
    <>
      {/* Loading / Title Screen */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: !showContent ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'var(--background)',
          zIndex: 9999,
          height: calculatedHeight
          ? `${calculatedHeight}px`
          : `${window.innerHeight}px`,
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
              className="masonry-item"
            >
              <div className="masonry-image-wrapper">
                <img
                  src={`${image.imageUrl}?w=800`}
                  alt={image.projectTitle || image.imageId}
                  className="masonry-image"
                  loading="lazy"
                />
                <div className="masonry-subtitle-overlay">
                  {image.projectTitle}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default CollectionList;
