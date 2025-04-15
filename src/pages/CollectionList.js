import React, { useEffect, useState, useMemo, useRef } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';

const CollectionList = ({ calculatedHeight, collections, finalImages, dataFetched }) => {
  // State to control content visibility after data is fetched
  const [showContent, setShowContent] = useState(false);

  // Refs for carousel containers and drag state
  const clientCarouselRef = useRef(null);
  const signatureCarouselRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);

  // Refs for carousel items to observe
  const clientItemsRef = useRef([]);
  const signatureItemsRef = useRef([]);

  // Show content with delay after data is fetched and add body class
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dataFetched) {
        setShowContent(true);
        document.body.classList.add('collection-page');
      }
    }, 850);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove('collection-page');
    };
  }, [dataFetched]);

  // Split finalImages into client and signature halves
  const clientImages = useMemo(() => {
    if (!finalImages) return [];
    return finalImages.filter((image) => image.tags.includes('client'));
  }, [finalImages]);

  const signatureImages = useMemo(() => {
    if (!finalImages) return [];
    return finalImages.filter((image) => image.tags.includes('signature'));
  }, [finalImages]);

  // Enhanced mouse drag scrolling handler with momentum
  const handleMouseDown = (ref) => (e) => {
    if (!ref.current) return;

    const slider = ref.current;
    isDragging.current = true;
    dragStartX.current = e.pageX;

    const startX = e.pageX - slider.offsetLeft;
    const scrollLeft = slider.scrollLeft;

    let lastX = e.pageX;
    let lastTime = Date.now();
    let velocity = 0;

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();

      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      slider.scrollLeft = scrollLeft - walk;

      // Calculate velocity for momentum scrolling
      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocity = (e.pageX - lastX) / dt;
      }
      lastX = e.pageX;
      lastTime = now;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Apply momentum scrolling if velocity is significant
      if (Math.abs(velocity) > 0.1) {
        const momentumScroll = () => {
          if (Math.abs(velocity) < 0.05) return;

          slider.scrollLeft -= velocity * 10;
          velocity *= 0.95; // Friction factor
          requestAnimationFrame(momentumScroll);
        };
        requestAnimationFrame(momentumScroll);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Prevent link navigation if dragging occurred
  const handleLinkClick = (e) => {
    if (Math.abs(e.pageX - dragStartX.current) > 0) {
      e.preventDefault();
    }
  };

  // Dynamically calculate and set CSS variables for menu and featured wrapper heights
  useEffect(() => {
    if (!showContent) return;

    const menuElement = document.querySelector('.menu-wrapper');
    if (!menuElement) return;

    const menuHeight = menuElement.offsetHeight;
    document.documentElement.style.setProperty(
      '--collection-menu-height',
      `${menuHeight}px`
    );

    const setFeaturedWrapperHeight = () => {
      const featuredWrapper = document.querySelector('.featured-wrapper');
      if (featuredWrapper) {
        const dynamicHeight = window.innerHeight - menuHeight - 8; // 8px = 0.5rem approx
        featuredWrapper.style.height = `${dynamicHeight}px`;
      }
      document.documentElement.style.setProperty(
        '--window-height',
        `${window.innerHeight}px`
      );
    };

    setFeaturedWrapperHeight();
    window.addEventListener('resize', setFeaturedWrapperHeight);

    return () => {
      window.removeEventListener('resize', setFeaturedWrapperHeight);
    };
  }, [showContent]);

  // Intersection Observer to toggle 'in-view' class on carousel items
  useEffect(() => {
    if (!showContent) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1, // 10% visible triggers in-view
    };

    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.target.classList) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            entry.target.classList.remove('in-view');
          }
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);

    // Observe client carousel items
    clientItemsRef.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    // Observe signature carousel items
    signatureItemsRef.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => {
      observer.disconnect();
    };
  }, [showContent, clientImages, signatureImages]);

  // Clear refs on each render to avoid stale refs
  clientItemsRef.current = [];
  signatureItemsRef.current = [];

  // Return null if required data is missing
  if (!collections || !finalImages) return null;

  const imageWidth = window.innerWidth <= 768 ? 170 : 270;

  return (
    <>
      {/* Loading / Title Screen */}
      <div
        style={{
          display: !showContent ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          height: calculatedHeight
            ? `${calculatedHeight}px`
            : `${window.innerHeight}px`,
        }}
      >
        <div className="title">WAVO'S VISION</div>
      </div>

      {/* Main Content */}
      <div
        className="collection-wrapper"
        style={{ display: showContent ? 'block' : 'none' }}
      >
        {/* Menu */}
        <div className="menu-wrapper">
          <div className="collections">
            <p>FEATURED WORK</p>
            {collections.map(({ sys, title }) => (
              <Link
                key={sys.id}
                to={`/collection/${sys.id}/projects`}
                className="collection"
                id={`collection-item-${sys.id}`}
              >
                <p>{title}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Sections */}
        <div className="featured-wrapper prevent-select">
          {/* Client Work */}
          <section className="featured-section carousel-section">
            <h2 className="featured-title">Client Facing</h2>
            <div
              className="carousel-container fade-sides"
              ref={clientCarouselRef}
              onMouseDown={handleMouseDown(clientCarouselRef)}
            >
              <div className="carousel-track">
                {clientImages.map((image, index) => (
                  <Link
                    key={index}
                    to={`/collection/${image.collectionId}/projects/${image.projectId}`}
                    className="carousel-item"
                    onClick={handleLinkClick}
                    ref={(el) => (clientItemsRef.current[index] = el)}
                  >
                    <div className="featured-image-wrapper">
                      <img
                        src={`${image.imageUrl}?w=${imageWidth}`}
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
          </section>

          {/* Signature Work */}
          <section className="featured-section carousel-section">
            <h2 className="featured-title">Signature Direction</h2>
            <div
              className="carousel-container fade-sides"
              ref={signatureCarouselRef}
              onMouseDown={handleMouseDown(signatureCarouselRef)}
            >
              <div className="carousel-track">
                {signatureImages.map((image, index) => (
                  <Link
                    key={index}
                    to={`/collection/${image.collectionId}/projects/${image.projectId}`}
                    className="carousel-item"
                    onClick={handleLinkClick}
                    ref={(el) => (signatureItemsRef.current[index] = el)}
                  >
                    <div className="featured-image-wrapper">
                      <img
                        src={`${image.imageUrl}?w=${imageWidth}`}
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
          </section>
        </div>
      </div>
    </>
  );
};

export default CollectionList;
