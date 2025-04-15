import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../style.css';
import FadeUp from '../components/FadeUp';

function ProjectDetail({ calculatedHeight }) {
  const { projectId } = useParams();

  // State variables
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    images: [],
  });
  const [transition, setTransition] = useState(false);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [modalLoaded, setModalLoaded] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  // Extract plain text from Contentful rich text JSON
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

  // Fetch project data and cache in sessionStorage
  useEffect(() => {
    const fetchProjectData = async () => {
      const cachedData = sessionStorage.getItem(`project_${projectId}`);
      if (cachedData) {
        setProjectData(JSON.parse(cachedData));
        setDataFetched(true);
        return;
      }

      try {
        const response = await fetch(
          'https://graphql.contentful.com/content/v1/spaces/oen9jg6suzgv/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization:
                'Bearer DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo',
            },
            body: JSON.stringify({
              query: `
                query projectQuery {
                  project(id: "${projectId}") {
                    title
                    description {
                      json
                    }
                    imagesCollection {
                      items {
                        url
                      }
                    }
                  }
                }
              `,
            }),
          }
        );

        const { data, errors } = await response.json();

        if (errors) {
          console.error(errors);
          return;
        }

        const project = data.project;
        if (project) {
          const projectData = {
            title: project.title || '',
            description: project.description
              ? extractTextFromJson(project.description.json)
              : '',
            images:
              project.imagesCollection.items.map((image) => image?.url) || [],
          };
          setProjectData(projectData);
          sessionStorage.setItem(
            `project_${projectId}`,
            JSON.stringify(projectData)
          );
          setDataFetched(true);
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Handle page transition and body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    if (dataFetched) {
      const timeout = setTimeout(() => {
        setTransition(true);
        const readyTimeout = setTimeout(() => {
          setReady(true);
          document.body.style.overflow = 'auto';
        }, 600);

        return () => clearTimeout(readyTimeout);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [dataFetched]);

  // Open modal with selected image
  const openModal = (imageUrl) => {
    if (!modal) {
      setModalImage(imageUrl);
      setModal(true);
      document.body.style.overflow = 'hidden';
      document.body.style.setProperty('--modal-text-height', '0px');
    }
  };

  // Close modal and reset states
  const closeModal = () => {
    if (modal) {
      setModal(false);
      document.body.style.overflow = 'auto';
      setModalLoaded(false);
    }
  };

  // Handle modal image load with slight delay
  const handleImageLoaded = () => {
    const timeout = setTimeout(() => {
      setModalLoaded(true);
    }, 250);
    return () => clearTimeout(timeout);
  };

  // Return null if no project title (data not loaded yet)
  if (!projectData.title) return null;

  // Split images into two columns
  const splitImages = (images) => {
    const midpoint = Math.ceil(images.length / 2);
    return {
      leftImages: images.slice(0, midpoint),
      rightImages: images.slice(midpoint),
    };
  };

  const { leftImages, rightImages } = splitImages(projectData.images);

  return (
    <>
      {/* Page Cover with transition */}
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
            // display: projectData.description.length === 0 ? 'none' : 'block',
          }}
        >
          {projectData.description}
        </div>
      </div>

      {/* Main content */}
      <div className="wrapper">
        <div className="header">{projectData.title}</div>
        <div 
          className="description"
            style={{
              transform: transition ? 'translateY(0)' : 'translateY(-500px)',
              display: projectData.description.length === 0 ? 'none' : 'block',
            }}
          > 
          {projectData.description}</div>

        <div className="flex-container">
          {/* Left column */}
          <div className="column-left">
            {leftImages.map((imageUrl, index) => (
              <div
                key={index}
                className="grid-item"
                style={{ marginBottom: '2.5rem' }}
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

          {/* Right column */}
          {rightImages.length > 0 && (
            <div className="column-right">
              {rightImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="grid-item"
                  style={{ marginBottom: '2.5rem' }}
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

      {/* Modal */}
      {modal && (
        <div
          onClick={closeModal}
          className="modal-wrapper"
          style={{ height: `${calculatedHeight}px` }}
        >
          {modalLoaded ? (
            <img src={`${modalImage}?w=2560`} width="80%" alt="Modal" />
          ) : (
            <>
              <span className="loader"></span>
              <img
                onLoad={handleImageLoaded}
                src={`${modalImage}?w=2560`}
                style={{ display: 'none' }}
                alt="Modal"
              />
            </>
          )}
        </div>
      )}

      {/* Logo link */}
      <Link to="/">
        <img className="logo" src="/stars.png" alt="Logo" />
      </Link>
    </>
  );
}

export default ProjectDetail;
