import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../style.css';
import FadeUp from '../components/FadeUp';
import { debounce } from 'lodash';

function ProjectsList({ collections, calculatedHeight, projectsData, fetchProjects }) {
  const { collectionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(null);
  const [transition, setTransition] = useState(false);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [modalText, setModalText] = useState(null);
  const [modalLoaded, setModalLoaded] = useState(false);

  useEffect(() => {
    if (collections) {
      const foundCollection = collections.find((col) => col.sys.id === collectionId);
      setCollection(foundCollection);
    }
  }, [collections, collectionId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTransition(true);
      const readyTimeout = setTimeout(() => {
        setReady(true);
      }, 500);
      return () => clearTimeout(readyTimeout);
    }, 2500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!projectsData[collectionId]) {
      fetchProjects(collectionId);
    } else {
      setLoading(false);
    }
  }, [collectionId, projectsData, fetchProjects]);

  const openModal = (project) => {
    if (!modal) {
      setModalImage(project.thumbnail);
      setModal(true);
      setModalText([project.title, project.description.json.content[0].content[0].value]);
      document.body.style.overflow = 'hidden';
      document.body.style.setProperty('--modal-text-height', '92px');
    }
  };

  const closeModal = () => {
    if (modal) {
      setModal(false);
      document.body.style.overflow = 'auto';
      setModalLoaded(false);
    }
  };

  const handleImageLoaded = useMemo(() => debounce(() => {
    setModalLoaded(true);
  }, 500), []);

  if (loading) {
    return '';
  }

  const projects = projectsData[collectionId] || [];

  if (projects.length === 0) {
    return (
      <>
        <div className='page-cover' style={{
          opacity: transition ? 0 : 1,
          zIndex: ready ? 0 : undefined,
        }}>
          <div className='subtitle'>{collection?.title}</div>
        </div>
        <div className="wrapper">
          <div className="flex-container">
            <div className="column-left">
              <div className="grid-item" style={{ marginBottom: '1.5rem' }}>
                <div className="subtitle">No projects found</div>
              </div>
            </div>
          </div>
        </div>
        <Link to="/">
          <img className="logo" src="/stars.png" alt="" style={{ position: 'absolute', right: '0.5rem' }} />
        </Link>
      </>
    );
  }

  const midpoint = Math.ceil(projects.length / 2);
  const projectsLeft = projects.slice(0, midpoint);
  const projectsRight = projects.slice(midpoint);


  return (
    <>
      <div className='page-cover' style={{
        opacity: transition ? 0 : 1,
        zIndex: ready ? 0 : undefined,
      }}>
        <p className='collection-title'>{collection?.title}</p>
      </div>

      <div className="wrapper">
        <div className="menu-wrapper">
          <div className="collections">
            <p>COLLECTIONS:</p>
            {collections.map(({ sys, title }) => (
              sys.id === collectionId ? (
                <p key={sys.id} className="collection" id={`collection-item-${sys.id}`} style={{ textDecoration: 'underline' }}>
                  {title}
                </p>
              ) : (
                <a 
                  key={sys.id} 
                  href={`/collection/${sys.id}/projects`} 
                  className="collection" 
                  id={`collection-item-${sys.id}`}
                >
                  <p>{title}</p>
                </a>
              )
            ))}
          </div>
        </div>
        <div className="flex-container">
          <div className="column-left">
            {projectsLeft.map((project) => (
              project.imagesCollection.total > 1 ? (
                <Link key={project.id} to={`/collection/${collectionId}/projects/${project.id}`}>
                  <FadeUp>
                    <div className="grid-item" style={{ marginBottom: '1.5rem' }}>
                      <img src={`${project.thumbnail}?w=565`} alt={project.title} loading="lazy" />
                      <div className="subtitle">{project.title}</div>
                    </div>
                  </FadeUp>
                </Link>
              ) : (
                <FadeUp key={project.id}>
                  <div onClick={() => openModal(project)} className="grid-item" style={{ marginBottom: '1.5rem', cursor: 'crosshair' }}>
                    <img src={`${project.thumbnail}?w=565`} alt={project.title} loading="lazy" />
                    <div className="subtitle">{project.title}</div>
                  </div>
                </FadeUp>
              )
            ))}
          </div>
          {projectsRight.length > 0 && (
            <div className="column-right">
              {projectsRight.map((project) => (
                project.imagesCollection.total > 1 ? (
                  <Link key={project.id} to={`/collection/${collectionId}/projects/${project.id}`}>
                    <FadeUp>
                      <div className="grid-item" style={{ marginBottom: '1.5rem' }}>
                        <img src={`${project.thumbnail}?w=565`} alt={project.title} loading="lazy" />
                        <div className="subtitle">{project.title}</div>
                      </div>
                    </FadeUp>
                  </Link>
                ) : (
                  <FadeUp key={project.id}>
                    <div onClick={() => openModal(project)} className="grid-item" style={{ marginBottom: '1.5rem', cursor: 'crosshair' }}>
                      <img src={`${project.thumbnail}?w=565`} alt={project.title} loading="lazy" />
                      <div className="subtitle">{project.title}</div>
                    </div>
                  </FadeUp>
                )
              ))}
            </div>
          )}
        </div>
      </div>
      {modal && (
        <div onClick={closeModal} className='modal-wrapper' style={{ height: `${calculatedHeight}px` }}>
          {modalLoaded ? (
            <img src={`${modalImage}?w=2560`} width="80%" alt="" />
          ) : (
            <>
              <span className="loader"></span>
              <img onLoad={handleImageLoaded} src={`${modalImage}?w=2560`} style={{ display: 'none' }} alt="" />
            </>
          )}
          <div className='modal-text'>
            <div className='modal-title'>{modalText[0]}</div>
            <div className='modal-subtitle'>{modalText[1]}</div>
          </div>
        </div>
      )}
      <Link to="/">
        <img className="logo" src="/stars.png" alt="" />
      </Link>
    </>
  );
}

export default ProjectsList;