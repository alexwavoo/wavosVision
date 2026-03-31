import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../style.css';
import FadeUp from '../components/FadeUp';
import Modal from '../components/Modal';

function ProjectsList({ collections, calculatedHeight, projectsData }) {
  const { collectionId } = useParams();

  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(null);
  const [transition, setTransition] = useState(false);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [modalTitle, setModalTitle] = useState(null);
  const [modalSubtitle, setModalSubtitle] = useState(null);

  useEffect(() => {
    if (collections) {
      const foundCollection = collections.find((col) => col.sys.id === collectionId);
      setCollection(foundCollection);
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
    }, 1700);

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

  if (loading) return null;

  const projects = projectsData[collectionId] || [];

  if (projects.length === 0) {
    return (
      <>
        <div
          className="page-cover"
          style={{
            opacity: transition ? 0 : 1,
            zIndex: ready ? 0 : undefined,
            transition: transition ? 'opacity 0.6s ease-in' : 'none',
          }}
        >
          <div className="subtitle">{collection?.title}</div>
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
            alt="Logo"
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
                  src={`${project.thumbnail}?w=565`}
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
          className="grid-item"
          style={{ marginBottom: '0.5rem', cursor: 'crosshair' }}
        >
          <div className="grid-image-wrapper">
            <img
              src={`${project.thumbnail}?w=565`}
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
      <div
        className="page-cover"
        style={{
          opacity: transition ? 0 : 1,
          zIndex: ready ? 0 : undefined,
          transition: transition ? 'opacity 0.6s ease-in' : 'none',
        }}
      >
        <p className="collection-title">{collection?.title}</p>
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
        imageUrl={modalImage}
        title={modalTitle}
        subtitle={modalSubtitle}
        calculatedHeight={calculatedHeight}
        onClose={closeModal}
      />
    </>
  );
}

export default ProjectsList;
