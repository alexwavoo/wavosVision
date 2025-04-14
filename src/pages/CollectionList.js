import React, { useEffect, useState, useMemo, useRef } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';

const CollectionList = ({ calculatedHeight, collections, finalImages, dataFetched }) => {
  const [showContent, setShowContent] = useState(false);
  const commercialCarouselRef = useRef(null);
  const artisticCarouselRef = useRef(null);
  const [commercialScrollState, setCommercialScrollState] = useState({ atStart: true, atEnd: false });
  const [artisticScrollState, setArtisticScrollState] = useState({ atStart: true, atEnd: false });
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dataFetched) {
        setShowContent(true);
        // Add class to body when this component is active
        document.body.classList.add('collection-page');
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      // Remove class when component unmounts
      document.body.classList.remove('collection-page');
    };
  }, [dataFetched]);

  // Split the finalImages into two categories (commercial and artistic)
  const commercialImages = useMemo(() => {
    if (!finalImages) return [];
    return finalImages.slice(0, Math.ceil(finalImages.length / 2));
  }, [finalImages]);

  const artisticImages = useMemo(() => {
    if (!finalImages) return [];
    return finalImages.slice(Math.ceil(finalImages.length / 2));
  }, [finalImages]);

  // Function to handle mouse drag scrolling
  const handleMouseDown = (ref) => (e) => {
    if (!ref.current) return;
    
    const slider = ref.current;
    let isDown = true;
    const startX = e.pageX - slider.offsetLeft;
    const scrollLeft = slider.scrollLeft;
    
    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed
      slider.scrollLeft = scrollLeft - walk;
    };
    
    const handleMouseUp = () => {
      isDown = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Calculate menu height for CSS variable
  useEffect(() => {
    if (showContent) {
      const menuElement = document.querySelector('.menu-wrapper');
      if (menuElement) {
        const menuHeight = menuElement.offsetHeight;
        document.documentElement.style.setProperty('--collection-menu-height', `${menuHeight}px`);
      }
    }
  }, [showContent]);

  // Check scroll position to determine if arrows should be shown
  const checkScrollPosition = (ref, setScrollState) => {
    if (!ref.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    const atStart = scrollLeft <= 10;
    const atEnd = scrollLeft >= scrollWidth - clientWidth - 10;
    
    setScrollState({ atStart, atEnd });
  };

  // Add scroll event listeners to check arrow visibility
  useEffect(() => {
    const commercialCarousel = commercialCarouselRef.current;
    const artisticCarousel = artisticCarouselRef.current;
    
    if (commercialCarousel) {
      checkScrollPosition(commercialCarouselRef, setCommercialScrollState);
      commercialCarousel.addEventListener('scroll', () => 
        checkScrollPosition(commercialCarouselRef, setCommercialScrollState)
      );
    }
    
    if (artisticCarousel) {
      checkScrollPosition(artisticCarouselRef, setArtisticScrollState);
      artisticCarousel.addEventListener('scroll', () => 
        checkScrollPosition(artisticCarouselRef, setArtisticScrollState)
      );
    }
    
    return () => {
      if (commercialCarousel) {
        commercialCarousel.removeEventListener('scroll', () => 
          checkScrollPosition(commercialCarouselRef, setCommercialScrollState)
        );
      }
      if (artisticCarousel) {
        artisticCarousel.removeEventListener('scroll', () => 
          checkScrollPosition(artisticCarouselRef, setArtisticScrollState)
        );
      }
    };
  }, [showContent]);

  // Function to scroll the carousel
  const scrollCarousel = (ref, direction) => {
    if (!ref.current) return;
    
    const scrollAmount = 1000; // Adjust as needed
    const currentScroll = ref.current.scrollLeft;
    
    ref.current.scrollTo({
      left: currentScroll + (direction === 'right' ? scrollAmount : -scrollAmount),
      behavior: 'smooth'
    });
  };

  if (!collections || !finalImages) return null;

  return (
    <>
      <div style={{ display: !showContent ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center', height: calculatedHeight ? `${calculatedHeight}px` : `${window.innerHeight}px` }}>
        <div className="title">WAVO'S VISION</div>
      </div>
      <div className="collection-wrapper" style={{ display: showContent ? 'block' : 'none' }}>
        <div className='menu-wrapper'>
          <div className="collections">
            <p>COLLECTIONS:</p>
            {collections.map(({ sys, title }) => (
              <Link key={sys.id} to={`/collection/${sys.id}/projects`} className="collection" id={`collection-item-${sys.id}`}>
                <p>{title}</p>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="featured-wrapper prevent-select">
          {/* Commercial Work Section */}
          <div className='featured-section carousel-section'>
            <div className='featured-title'>Commercial Work</div>
            {!commercialScrollState.atStart && (
              <div 
                className="carousel-arrow carousel-arrow-left" 
                onClick={() => scrollCarousel(commercialCarouselRef, 'left')}
              >
                &#8592;
              </div>
            )}
            <div 
              className="carousel-container" 
              ref={commercialCarouselRef}
              onMouseDown={handleMouseDown(commercialCarouselRef)}
            >
              <div className="carousel-track">
                {commercialImages.map((image, index) => (
                    <Link to={`/collection/${image.collectionId}/projects/${image.projectId}`} className="carousel-item" key={index}>
                    <div className='featured-image-wrapper'>
                      <img 
                        src={`${image.imageUrl}?w=550`} 
                        alt={image.imageId}
                        className="featured-image" 
                      />
                    </div>
                      <div className="featured-image-subtitle">
                        {image.projectTitle}
                      </div>
                    </Link>
                ))}
              </div>
            </div>
            {!commercialScrollState.atEnd && (
              <div 
                className="carousel-arrow carousel-arrow-right" 
                onClick={() => scrollCarousel(commercialCarouselRef, 'right')}
              >
                &#8594;
              </div>
            )}
          </div>
          
          {/* Artistic Work Section */}
          <div className='featured-section carousel-section'>
            <div className='featured-title'>Artistic Work</div>
            {!artisticScrollState.atStart && (
              <div 
                className="carousel-arrow carousel-arrow-left" 
                onClick={() => scrollCarousel(artisticCarouselRef, 'left')}
              >
                &#8592;
              </div>
            )}
            <div 
              className="carousel-container" 
              ref={artisticCarouselRef}
              onMouseDown={handleMouseDown(artisticCarouselRef)}
            >
              <div className="carousel-track">
                {artisticImages.map((image, index) => (
                    <Link to={`/collection/${image.collectionId}/projects/${image.projectId}`} className="carousel-item" key={index}>
                    <div className='featured-image-wrapper'>
                      <img 
                        src={`${image.imageUrl}?w=550`} 
                        alt={image.imageId}
                        className="featured-image" 
                      />
                    </div>
                      <div className="featured-image-subtitle">
                        {image.projectTitle}
                      </div>
                    </Link>
                ))}
              </div>
            </div>
            {!artisticScrollState.atEnd && (
              <div 
                className="carousel-arrow carousel-arrow-right" 
                onClick={() => scrollCarousel(artisticCarouselRef, 'right')}
              >
                &#8594;
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionList;
