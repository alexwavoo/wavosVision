// ProjectDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import '../style.css';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

function ProjectDetail() {
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    images: [],
  });
  const [transition, setTransition] = useState(false);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalImage, setModalImage] = useState(null); 

  useEffect(() => {
    AOS.init({
      duration: 400
    });
    AOS.refresh();
    return () => {
      AOS.refresh();
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTransition(true);
      const readyTimeout = setTimeout(() => {
        setReady(true);
      }, 600);
    }, 2400);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch('https://graphql.contentful.com/content/v1/spaces/oen9jg6suzgv/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo',
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
        });

        const { data, errors } = await response.json();

        if (errors) {
          console.error(errors);
          return;
        }

        const project = data.project;
        if (project) {
          setProjectData({
            title: project.title || '',
            description: project.description ? extractTextFromJson(project.description.json) : '',
            images: project.imagesCollection.items.map((image) => image?.url) || [],
          });
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();
  }, [projectId]);

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

  function openModal(imageUrl) {
    if (modal === false) {
      setModalImage(imageUrl);
      setModal(true);
      document.body.style.overflow = 'hidden';
      document.body.style.setProperty('--modal-text-height', '0px');
    }
  }
  function closeModal() {
    if (modal === true) {
      setModal(false);
      document.body.style.overflow = 'auto';
    }
  }

  if (!projectData.title) {
    return '';
  }

  const splitImages = (images) => {
    const midpoint = Math.ceil(images.length / 2);
    const leftImages = images.slice(0, midpoint);
    const rightImages = images.slice(midpoint);
    return { leftImages, rightImages };
  };

  const { leftImages, rightImages } = splitImages(projectData.images);

  

  return (
    <>

      <div className='page-cover' style={{
          opacity: transition ? 0 : 1,
          zIndex: ready ? 0 : undefined,
        }}>
        <div className='header'>{projectData.title}</div>
        <div className='description'>{projectData.description}</div>
      </div>


    <div className="wrapper">
      <div className="header">{projectData.title}</div>
      <div className="description">
        {projectData.description}
      </div>

      <div className="flex-container">
        <div className="column-left">
          {leftImages.map((imageUrl, index) => (
            <div key={index} className="grid-item" data-aos="fade-up" style={{marginBottom: '2.5rem'}} onClick={() => openModal(imageUrl)}>
              <img src={imageUrl} alt={`Image ${index + 1}`} style={{cursor: "crosshair"}}  />
            </div>
          ))}
        </div>
        {rightImages.length > 0 &&
        <div className="column-right">
          {rightImages.map((imageUrl, index) => (
            <div key={index} className="grid-item" data-aos="fade-up" style={{marginBottom: '2.5rem'}} onClick={() => openModal(imageUrl)}>
              <img src={imageUrl} alt={`Image ${index + 1}`} style={{cursor: "crosshair"}} />
            </div>
          ))}
        </div>
        }
      </div>
    </div>

    {modal ? (
      <div onClick={closeModal} className='modal-wrapper'>
        <img  src={modalImage} width="80%" alt="" />
      </div>
      ) : null
        }


    <Link to="/">
    <img className="logo" src="/stars.png" alt="" />
    </Link>
    </>
  );
}

export default ProjectDetail;
