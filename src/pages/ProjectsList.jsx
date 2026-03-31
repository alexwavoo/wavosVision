import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FadeUp from '../components/FadeUp';
import Modal from '../components/Modal';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import { gridUrl } from '../utils/contentfulImage';
import '../styles/grid.css';

function ProjectsList({ collections, calculatedHeight, projectsData, projectsError, projectQueries }) {
  const { collectionId } = useParams();

  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(null);
  const [transition, setTransition] = useState(false);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [modalTitle, setModalTitle] = useState(null);
  const [modalSubtitle, setModalSubtitle] = useState(null);

  const projects = projectsData[collectionId] || [];
  useScrollRestoration(!loading);

  useEffect(() => {
    if (collections) {
      const found = collections.find((col) => col.sys.id === collectionId);
      setCollection(found);
    }
  }, [collections, collectionId]);

  useEffect(() => {
    setTransition(false);
    setReady(false);
    setLoading(true);

    const timeout = setTimeout(() => {
      setTransition(true);
      const readyTimeout = setTimeout(() => {
        setReady(true);
      }, 500);
      return () => clearTimeout(readyTimeout);
    }, 2200);

    return () => clearTimeout(timeout);
  }, [collectionId]);

  useEffect(() => {
    if (projectsData[collectionId]) {
      setLoading(false);
    }
  }, [collectionId, projectsData]);

  const openModal = (project) => {
    if (!modal) {
      setModalImage(project.thumbnail);
      setModalTitle(project.title);
      setModalSubtitle(project.description?.json?.content?.[0]?.content?.[0]?.value || '');
      setModal(true);
      document.body.style.overflow = 'hidden';
      document.body.style.setProperty('--modal-text-height', '92px');
    }
  };

  const closeModal = () => {
    setModal(false);
    document.body.style.overflow = 'auto';
  };

  if (loading && !projectsError) return null;

  if (projectsError) {
    const collectionQuery = projectQueries?.find(
      (_, i) => collections?.[i]?.sys?.id === collectionId
    );
    return (
      <div className="error-state">
        <p>Failed to load projects. Please try again.</p>
        <button onClick={() => collectionQuery?.refetch?.()}>Retry</button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <>
        <Helmet>
          <title>{collection?.title || 'Collection'} | WAVO'S VISION</title>
        </Helmet>
        <div
          className="page-cover"
          style={{
            opacity: transition ? 0 : 1,
            zIndex: ready ? 0 : undefined,
            transition: transition ? 'opacity 0.6s ease-in' : 'none',
          }}
        >
        <div className="subtitle" key={collectionId}>{collection?.title}</div>
      </div>
      <div className="wrapper">
          <div className="flex-container">
            <div className="column-left">
              <div className="grid-item" style={{ marginBottom: '0.5rem' }}>
                <div className="subtitle">No projects found</div>
              </div>
            </div>
          </div>
        </div>
        <Link to="/">
          <img
            className="logo"
            src="/stars.png"
            alt="Back to home"
            style={{ position: 'absolute', right: '0.5rem' }}
          />
        </Link>
      </>
    );
  }

  const midpoint = Math.ceil(projects.length / 2);
  const projectsLeft = projects.slice(0, midpoint);
  const projectsRight = projects.slice(midpoint);

  const renderProject = (project) => {
    if (project.imagesCollection.total > 1) {
      return (
        <Link
          key={`${collectionId}-${project.id}`}
          to={`/collection/${collectionId}/projects/${project.id}`}
        >
          <FadeUp>
            <div className="grid-item" style={{ marginBottom: '0.5rem' }}>
              <div className="grid-image-wrapper">
                <img
                  src={gridUrl(project.thumbnail)}
                  alt={project.title}
                  loading="lazy"
                />
                <div className="grid-subtitle-overlay">
                  {project.title}
                </div>
              </div>
            </div>
          </FadeUp>
        </Link>
      );
    }

    return (
      <FadeUp key={`${collectionId}-${project.id}`}>
        <div
          onClick={() => openModal(project)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openModal(project);
            }
          }}
          role="button"
          tabIndex={0}
          className="grid-item"
          style={{ marginBottom: '0.5rem', cursor: 'crosshair' }}
          aria-label={`View ${project.title}`}
        >
          <div className="grid-image-wrapper">
            <img
              src={gridUrl(project.thumbnail)}
              alt={project.title}
              loading="lazy"
            />
            <div className="grid-subtitle-overlay">
              {project.title}
            </div>
          </div>
        </div>
      </FadeUp>
    );
  };

  return (
    <>
      <Helmet>
        <title>{collection?.title || 'Collection'} | WAVO'S VISION</title>
      </Helmet>

      <div
        className="page-cover"
        style={{
          opacity: transition ? 0 : 1,
          zIndex: ready ? 0 : undefined,
          transition: transition ? 'opacity 0.6s ease-in' : 'none',
        }}
      >
        <p className="collection-title" key={collectionId}>{collection?.title}</p>
      </div>

      <div className="wrapper">
        <div className="flex-container">
          <div className="column-left" key={`left-${collectionId}`}>
            {projectsLeft.map(renderProject)}
          </div>

          {projectsRight.length > 0 && (
            <div className="column-right" key={`right-${collectionId}`}>
              {projectsRight.map(renderProject)}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modal}
        images={modalImage ? modalImage : ''}
        currentIndex={0}
        title={modalTitle}
        subtitle={modalSubtitle}
        calculatedHeight={calculatedHeight}
        onClose={closeModal}
      />
    </>
  );
}

export default ProjectsList;
