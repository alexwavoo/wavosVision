import React, { useRef, useEffect, useState, forwardRef } from 'react';
import '../styles/masonry.css';

const createBatchCoordinator = () => {
  let pendingItems = [];
  let batchTimeout = null;
  const BATCH_DELAY = 50;
  const STAGGER_INCREMENT = 50;

  const processBatch = () => {
    if (pendingItems.length === 0) return;

    const itemsWithPositions = pendingItems.map((item) => {
      const rect = item.element.getBoundingClientRect();
      return { ...item, top: rect.top, left: rect.left };
    });

    itemsWithPositions.sort((a, b) => {
      const topDiff = a.top - b.top;
      if (Math.abs(topDiff) < 5) return a.left - b.left;
      return topDiff;
    });

    itemsWithPositions.forEach((item, index) => {
      setTimeout(() => item.callback(), index * STAGGER_INCREMENT);
    });

    pendingItems = [];
    batchTimeout = null;
  };

  const addToBatch = (element, callback) => {
    pendingItems.push({ element, callback });
    if (batchTimeout) clearTimeout(batchTimeout);
    batchTimeout = setTimeout(processBatch, BATCH_DELAY);
  };

  return { addToBatch };
};

const batchCoordinator = createBatchCoordinator();

const MasonryFadeItem = forwardRef(({
  src,
  width,
  height,
  alt,
  projectTitle,
  onImageLoad,
}, forwardedRef) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const internalRef = useRef(null);
  const hasTriggered = useRef(false);
  const imageRef = useRef(null);

  const aspectRatio = width && height ? width / height : 1;

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (onImageLoad) onImageLoad();
  };

  useEffect(() => {
    if (imageLoaded && isInViewport && !hasTriggered.current) {
      hasTriggered.current = true;
      batchCoordinator.addToBatch(internalRef.current, () => {
        setIsVisible(true);
      });
    }
  }, [imageLoaded, isInViewport]);

  useEffect(() => {
    const element = internalRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInViewport(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px', threshold: 0.01 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const setRef = (el) => {
    if (forwardedRef) {
      if (typeof forwardedRef === 'function') forwardedRef(el);
      else forwardedRef.current = el;
    }
    internalRef.current = el;
  };

  return (
    <div
      ref={setRef}
      className={`masonry-fade-item ${isVisible ? 'visible' : ''}`}
    >
      <div className="masonry-item" style={{ display: 'block' }}>
        <div className="masonry-image-wrapper">
          <div
            className={`masonry-skeleton ${imageLoaded ? 'hidden' : ''}`}
            style={{ aspectRatio }}
          />
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`masonry-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={handleImageLoad}
          />
          <div className="masonry-subtitle-overlay">
            {projectTitle}
          </div>
        </div>
      </div>
    </div>
  );
});

MasonryFadeItem.displayName = 'MasonryFadeItem';

export default MasonryFadeItem;
