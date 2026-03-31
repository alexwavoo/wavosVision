import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../style.css';
import FadeUp from '../components/FadeUp';
import Modal from '../components/Modal';

const SPACE_ID = process.env.REACT_APP_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN;
const GRAPHQL_BASE = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}/environments/master`;

function ProjectDetail({ calculatedHeight, projectsData, dataFetched }) {
  const { projectId, collectionId } = useParams();

  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    images: [],
  });
  const [transition, setTransition] = useState(false);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [localDataFetched, setLocalDataFetched] = useState(false);

  const extractTextFromJson = (json) => {
    try {
      const content = json.content || [];
      return content
        .map((paragraph) => paragraph.content.map((text) => text.value).join(''))
        .join('\n');
    } catch (error) {
      console.error('Error extracting text from JSON:', error);
      return '';
    }
  };

  const applyProject = (project) => {
    setProjectData({
      title: project.title || '',
      description: project.description
        ? extractTextFromJson(project.description.json || project.description)
        : '',
      images: project.imagesCollection?.items.map((img) => img.url) || [],
    });
  };

  // Try to find the project from props or sessionStorage, fall back to API
  useEffect(() => {
    if (!dataFetched) return;

    // 1. Check projectsData prop first
    if (projectsData) {
      for (const projects of Object.values(projectsData)) {
        const project = projects.find((p) => p.id === projectId);
        if (project) {
          applyProject(project);
          setLocalDataFetched(true);
          return;
        }
      }
    }

    // 2. Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key.startsWith('projects_')) {
        const projects = JSON.parse(sessionStorage.getItem(key));
        if (Array.isArray(projects)) {
          const project = projects.find((p) => p.id === projectId);
          if (project) {
            applyProject(project);
            setLocalDataFetched(true);
            return;
          }
        }
      }
    }

    // 3. Fallback: fetch from API directly
    fetch(GRAPHQL_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        query: `
          query {
            project(id: "${projectId}") {
              sys { id }
              title
              description { json }
              thumbnail { url }
              imagesCollection {
                items {
                  sys { id }
                  url
                }
                total
              }
            }
          }
        `,
      }),
    })
      .then((res) => res.json())
      .then(({ data, errors }) => {
        if (errors) {
          console.error(errors);
          setLocalDataFetched(true);
          return;
        }
        const project = data?.project;
        if (project) {
          setProjectData({
            title: project.title || '',
            description: project.description
              ? extractTextFromJson(project.description.json)
              : '',
            images: project.imagesCollection?.items.map((img) => img.url) || [],
          });
        }
        setLocalDataFetched(true);
      })
      .catch((err) => {
        console.error('Error fetching project:', err);
        setLocalDataFetched(true);
      });
  }, [dataFetched, projectId, projectsData]);

  useEffect(() => {
    if (!localDataFetched) return;

    document.body.style.overflow = 'hidden';

    const timeout = setTimeout(() => {
      setTransition(true);
      const readyTimeout = setTimeout(() => {
        setReady(true);
        document.body.style.overflow = 'auto';
      }, 600);

      return () => clearTimeout(readyTimeout);
    }, 1700);

    return () => clearTimeout(timeout);
  }, [localDataFetched]);

  if (!localDataFetched) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}></div>;
  }

  if (!projectData.title) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Project not found.</div>;
  }

  const openModal = (imageUrl) => {
    if (!modal) {
      setModalImage(imageUrl);
      setModal(true);
      document.body.style.overflow = 'hidden';
      document.body.style.setProperty('--modal-text-height', '0px');
    }
  };

  const closeModal = () => {
    setModal(false);
    document.body.style.overflow = 'auto';
  };

  const midpoint = Math.ceil(projectData.images.length / 2);
  const leftImages = projectData.images.slice(0, midpoint);
  const rightImages = projectData.images.slice(midpoint);

  return (
    <>
      <div
        className="page-cover"
        style={{
          opacity: transition ? 0 : 1,
          zIndex: ready ? 0 : undefined,
        }}
      >
        <div
          className="header"
          style={{
            transform: transition ? 'translateY(-500px)' : 'translateY(0)',
          }}
        >
          {projectData.title}
        </div>
        <div
          className="description"
          style={{
            transform: transition ? 'translateY(-500px)' : 'translateY(0)',
          }}
        >
          {projectData.description}
        </div>
      </div>

      <div className="wrapper">
        <div className="header">{projectData.title}</div>
        <div
          className="description"
          style={{
            transform: transition ? 'translateY(0)' : 'translateY(-500px)',
            display: projectData.description.length === 0 ? 'none' : 'block',
          }}
        >
          {projectData.description}
        </div>

        <div className="flex-container">
          <div className="column-left">
            {leftImages.map((imageUrl, index) => (
              <div
                key={index}
                className="grid-item"
                style={{ marginBottom: '0.3rem' }}
                onClick={() => openModal(imageUrl)}
              >
                <FadeUp>
                  <img
                    src={`${imageUrl}?w=565`}
                    alt={`Image ${index + 1}`}
                    style={{ cursor: 'crosshair' }}
                  />
                </FadeUp>
              </div>
            ))}
          </div>

          {rightImages.length > 0 && (
            <div className="column-right">
              {rightImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="grid-item"
                  style={{ marginBottom: '0.3rem' }}
                  onClick={() => openModal(imageUrl)}
                >
                  <FadeUp>
                    <img
                      src={`${imageUrl}?w=565`}
                      alt={`Image ${index + 1}`}
                      style={{ cursor: 'crosshair' }}
                    />
                  </FadeUp>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modal}
        imageUrl={modalImage}
        calculatedHeight={calculatedHeight}
        onClose={closeModal}
      />
    </>
  );
}

export default ProjectDetail;
