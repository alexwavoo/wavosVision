import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MasonryFadeItem from '../components/MasonryFadeItem';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import { thumbnailUrl } from '../utils/contentfulImage';
import '../styles/grid.css';
import '../styles/masonry.css';

const CollectionList = ({ collections, clientImages, signatureImages, dataFetched, error, onRetry }) => {
  const [animationDone, setAnimationDone] = useState(false);
  const [transition, setTransition] = useState(false);
  const [ready, setReady] = useState(false);

  const allImages = [...(clientImages || []), ...(signatureImages || [])];
  useScrollRestoration(dataFetched);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimationDone(true), 2200);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!animationDone || !dataFetched) return;

    setTransition(true);
    const readyTimeout = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(readyTimeout);
  }, [animationDone, dataFetched]);

  if (error) {
    return (
      <div className="error-state">
        <p>Failed to load content. Please try again.</p>
        <button onClick={onRetry}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>WAVO'S VISION | Photography &amp; Digital Art</title>
        <meta name="description" content="Photography and digital art portfolio by Alex Wavo." />
      </Helmet>

      <div
        className="page-cover"
        style={{
          opacity: transition ? 0 : 1,
          zIndex: ready ? 0 : undefined,
          transition: transition ? 'opacity 0.6s ease-in' : 'none',
        }}
      >
        <p className="main-title">WAVO'S VISION</p>
      </div>

      <div className="collection-wrapper">
        <div className="masonry-container">
          {allImages.map((image, index) => (
            <Link
              key={`${image.imageId}-${index}`}
              to={`/collection/${image.collectionId}/projects/${image.projectId}`}
              style={{ textDecoration: 'none' }}
            >
              <MasonryFadeItem
                src={thumbnailUrl(image.imageUrl)}
                width={image.imageWidth}
                height={image.imageHeight}
                alt={image.projectTitle || 'Featured work'}
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
