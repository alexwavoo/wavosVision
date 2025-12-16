import React, { useRef, useEffect, useState, forwardRef } from 'react';

// Shared coordinator for batching items that enter viewport together
const createBatchCoordinator = () => {
  let pendingItems = [];
  let batchTimeout = null;
  const BATCH_DELAY = 50; // ms to wait before processing batch
  const STAGGER_INCREMENT = 50; // ms between each item in batch

  const processBatch = () => {
    if (pendingItems.length === 0) return;

    // Get positions for all pending items
    const itemsWithPositions = pendingItems.map((item) => {
      const rect = item.element.getBoundingClientRect();
      return {
        ...item,
        top: rect.top,
        left: rect.left,
      };
    });

    // Sort by top position, then left
    itemsWithPositions.sort((a, b) => {
      const topDiff = a.top - b.top;
      if (Math.abs(topDiff) < 5) {
        // Within 5px, sort by left
        return a.left - b.left;
      }
      return topDiff;
    });

    // Trigger each item with staggered delay
    itemsWithPositions.forEach((item, index) => {
      const delay = index * STAGGER_INCREMENT;
      setTimeout(() => {
        item.callback();
      }, delay);
    });

    // Clear the batch
    pendingItems = [];
    batchTimeout = null;
  };

  const addToBatch = (element, callback) => {
    pendingItems.push({ element, callback });

    // Reset the batch timer
    if (batchTimeout) {
      clearTimeout(batchTimeout);
    }
    batchTimeout = setTimeout(processBatch, BATCH_DELAY);
  };

  return { addToBatch };
};

// Single shared instance
const batchCoordinator = createBatchCoordinator();

const MasonryFadeItem = forwardRef(({ 
  children, 
  src, 
  width, 
  height,
  alt,
  projectTitle,
  onImageLoad 
}, forwardedRef) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const internalRef = useRef(null);
  const hasTriggered = useRef(false);
  const imageRef = useRef(null);

  // Calculate aspect ratio for skeleton
  const aspectRatio = width && height ? width / height : 1;

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
    if (onImageLoad) onImageLoad();
  };

  // Check if we should trigger the fade animation
  useEffect(() => {
    if (imageLoaded && isInViewport && !hasTriggered.current) {
      hasTriggered.current = true;
      
      // Add to batch coordinator for staggered reveal
      batchCoordinator.addToBatch(internalRef.current, () => {
        setIsVisible(true);
      });
    }
  }, [imageLoaded, isInViewport]);

  // Intersection Observer to detect when item enters viewport
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
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const setRef = (el) => {
    // Handle forwarded ref
    if (forwardedRef) {
      if (typeof forwardedRef === 'function') {
        forwardedRef(el);
      } else {
        forwardedRef.current = el;
      }
    }
    internalRef.current = el;
  };

  return (
    <div
      ref={setRef}
      className={`masonry-fade-item ${isVisible ? 'visible' : ''}`}
    >
      <div 
        className="masonry-item"
        style={{ display: 'block' }}
      >
        <div className="masonry-image-wrapper">
          {/* Skeleton placeholder reserves space with aspect ratio */}
          <div 
            className={`masonry-skeleton ${imageLoaded ? 'hidden' : ''}`}
            style={{ aspectRatio: aspectRatio }}
          />
          
          {/* Actual image positioned over skeleton */}
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
