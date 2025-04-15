import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import '../style.css';
import { Link } from 'react-router-dom';

const CollectionList = ({
  calculatedHeight,
  collections,
  finalImages,
  dataFetched,
}) => {
  // State to control content visibility after data is fetched
  const [showContent, setShowContent] = useState(false);

  // Refs for carousel containers
  const clientCarouselRef = useRef(null);
  const signatureCarouselRef = useRef(null);

  // Drag state refs
  const isDragging = useRef(false);
  const dragStartX = useRef(0);

  // Velocity ref for momentum scrolling
  const velocityRef = useRef(0);

  // Store animation frame id for scroll updates
  const animationFrameIdRef = useRef(null);

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

  // Common pointer event handler factory for carousels
  const setupPointerHandlers = useCallback((ref) => {
    if (!ref.current) return;

    const slider = ref.current;

    let startX = 0;
    let scrollLeft = 0;
    let lastX = 0;
    let lastTime = 0;
    let currentWalk = 0;
    let isPointerDown = false;

    const updateScroll = () => {
      slider.scrollLeft = scrollLeft - currentWalk;
      animationFrameIdRef.current = null;
    };

    const onPointerDown = (e) => {
      isPointerDown = true;
      dragStartX.current = e.pageX;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      lastX = e.pageX;
      lastTime = Date.now();
      velocityRef.current = 0;
      slider.setPointerCapture(e.pointerId);
      isDragging.current = true;
    };

    const onPointerMove = (e) => {
      if (!isPointerDown) return;
      e.preventDefault();

      const x = e.pageX - slider.offsetLeft;
      currentWalk = (x - startX) * 2; // Scroll speed multiplier

      if (!animationFrameIdRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(updateScroll);
      }

      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocityRef.current = (e.pageX - lastX) / dt;
      }
      lastX = e.pageX;
      lastTime = now;
    };

    const onPointerUpOrCancel = (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      isDragging.current = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      slider.releasePointerCapture(e.pointerId);

      // Momentum scrolling with bounds check
      let velocity = velocityRef.current;
      if (Math.abs(velocity) > 0.1) {
        const momentumScroll = () => {
          if (Math.abs(velocity) < 0.05) return;

          slider.scrollLeft = Math.max(
            0,
            Math.min(
              slider.scrollWidth - slider.clientWidth,
              slider.scrollLeft - velocity * 10
            )
          );
          velocity *= 0.95; // friction
          requestAnimationFrame(momentumScroll);
        };
        requestAnimationFrame(momentumScroll);
      }
    };

    slider.addEventListener('pointerdown', onPointerDown);
    slider.addEventListener('pointermove', onPointerMove, { passive: false });
    slider.addEventListener('pointerup', onPointerUpOrCancel);
    slider.addEventListener('pointercancel', onPointerUpOrCancel);

    // Cleanup function to remove listeners
    return () => {
      slider.removeEventListener('pointerdown', onPointerDown);
      slider.removeEventListener('pointermove', onPointerMove);
      slider.removeEventListener('pointerup', onPointerUpOrCancel);
      slider.removeEventListener('pointercancel', onPointerUpOrCancel);
    };
  }, []);

  // Setup pointer handlers for both carousels
  useEffect(() => {
    if (!showContent) return;

    const cleanupClient = setupPointerHandlers(clientCarouselRef);
    const cleanupSignature = setupPointerHandlers(signatureCarouselRef);

    return () => {
      if (cleanupClient) cleanupClient();
      if (cleanupSignature) cleanupSignature();
    };
  }, [showContent, setupPointerHandlers]);

  // Prevent link navigation if dragging occurred
  const handleLinkClick = useCallback((e) => {
    if (Math.abs(e.pageX - dragStartX.current) > 0) {
      e.preventDefault();
    }
  }, []);

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

  // Return null if required data is missing
  if (!collections || !finalImages) return null;

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
              // Removed onMouseDown, pointer events handled in effect
            >
              <div className="carousel-track">
                {clientImages.map((image, index) => (
                  <Link
                    key={index}
                    to={`/collection/${image.collectionId}/projects/${image.projectId}`}
                    className="carousel-item"
                    onClick={handleLinkClick}
                  >
                    <div className="featured-image-wrapper">
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
          </section>

          {/* Signature Work */}
          <section className="featured-section carousel-section">
            <h2 className="featured-title">Signature Direction</h2>
            <div
              className="carousel-container fade-sides"
              ref={signatureCarouselRef}
              // Removed onMouseDown, pointer events handled in effect
            >
              <div className="carousel-track">
                {signatureImages.map((image, index) => (
                  <Link
                    key={index}
                    to={`/collection/${image.collectionId}/projects/${image.projectId}`}
                    className="carousel-item"
                    onClick={handleLinkClick}
                  >
                    <div className="featured-image-wrapper">
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
          </section>
        </div>
      </div>
    </>
  );
};

export default CollectionList;
