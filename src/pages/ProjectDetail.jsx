import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FadeUp from '../components/FadeUp';
import Modal from '../components/Modal';
import { useProject } from '../hooks/useProject';
import { gridUrl } from '../utils/contentfulImage';
import '../styles/grid.css';
import '../styles/detail.css';

function ProjectDetail({ calculatedHeight }) {
  const { projectId, collectionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: project, isLoading, error, refetch } = useProject(projectId);

  const [transition, setTransition] = useState(false);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const extractTextFromJson = (json) => {
    try {
      const content = json.content || [];
      return content
        .map((paragraph) => paragraph.content.map((text) => text.value).join(''))
        .join('\n');
    } catch {
      return '';
    }
  };

  const title = project?.title || '';
  const description = project?.description
    ? extractTextFromJson(project.description.json || project.description)
    : '';
  const images = project?.imagesCollection?.items.map((img) => img.url) || [];

  useEffect(() => {
    if (!project) return;

    const imageParam = searchParams.get('image');
    if (imageParam !== null) {
      const idx = parseInt(imageParam, 10);
      if (!isNaN(idx) && idx >= 0 && idx < images.length) {
        setModalIndex(idx);
        setModal(true);
        document.body.style.overflow = 'hidden';
        document.body.style.setProperty('--modal-text-height', '0px');
      }
    }
  }, [project]);

  useEffect(() => {
    if (!project) return;

    document.body.style.overflow = 'hidden';
    const timeout = setTimeout(() => {
      setTransition(true);
      const readyTimeout = setTimeout(() => {
        setReady(true);
        document.body.style.overflow = 'auto';
      }, 600);
      return () => clearTimeout(readyTimeout);
    }, 2200);

    return () => clearTimeout(timeout);
  }, [project]);

  const openModal = useCallback((index) => {
    if (!modal) {
      setModalIndex(index);
      setModal(true);
      document.body.style.overflow = 'hidden';
      document.body.style.setProperty('--modal-text-height', '0px');
      setSearchParams({ image: String(index) }, { replace: true });
    }
  }, [modal, setSearchParams]);

  const closeModal = useCallback(() => {
    setModal(false);
    document.body.style.overflow = 'auto';
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const handleNavigate = useCallback((newIndex) => {
    setModalIndex(newIndex);
    setSearchParams({ image: String(newIndex) }, { replace: true });
  }, [setSearchParams]);

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}></div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Failed to load project. Please try again.</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  if (!title) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Project not found.</div>;
  }

  const midpoint = Math.ceil(images.length / 2);
  const leftImages = images.slice(0, midpoint);
  const rightImages = images.slice(midpoint);

  return (
    <>
      <Helmet>
        <title>{title} | WAVO'S VISION</title>
        <meta property="og:title" content={`${title} | WAVO'S VISION`} />
        {images[0] && <meta property="og:image" content={images[0]} />}
      </Helmet>

      <div
        className="page-cover"
        style={{
          opacity: transition ? 0 : 1,
          zIndex: ready ? 0 : undefined,
          transition: transition ? 'opacity 0.6s ease-in' : 'none',
        }}
      >
        <div className="header">{title}</div>
        <div className="description">{description}</div>
      </div>

      <div className="wrapper">
        <div className="header">{title}</div>
        <div
          className="description"
          style={{
            transform: transition ? 'translateY(0)' : 'translateY(-500px)',
            display: description.length === 0 ? 'none' : 'block',
          }}
        >
          {description}
        </div>

        <div className="flex-container">
          <div className="column-left">
            {leftImages.map((imageUrl, index) => (
              <div
                key={index}
                className="grid-item"
                style={{ marginBottom: '0.3rem' }}
                onClick={() => openModal(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(index);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View ${title} image ${index + 1}`}
              >
                <FadeUp>
                  <img
                    src={gridUrl(imageUrl)}
                    alt={`${title} - ${index + 1}`}
                    style={{ cursor: 'crosshair' }}
                  />
                </FadeUp>
              </div>
            ))}
          </div>

          {rightImages.length > 0 && (
            <div className="column-right">
              {rightImages.map((imageUrl, index) => {
                const realIndex = midpoint + index;
                return (
                  <div
                    key={realIndex}
                    className="grid-item"
                    style={{ marginBottom: '0.3rem' }}
                    onClick={() => openModal(realIndex)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openModal(realIndex);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${title} image ${realIndex + 1}`}
                  >
                    <FadeUp>
                      <img
                        src={gridUrl(imageUrl)}
                        alt={`${title} - ${realIndex + 1}`}
                        style={{ cursor: 'crosshair' }}
                      />
                    </FadeUp>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modal}
        images={images}
        currentIndex={modalIndex}
        calculatedHeight={calculatedHeight}
        onClose={closeModal}
        onNavigate={handleNavigate}
      />
    </>
  );
}

export default ProjectDetail;
