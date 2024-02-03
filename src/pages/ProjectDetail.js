// ProjectDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import '../style.css';
import { Link } from 'react-router-dom';
import Lightbox from '../components/Lightbox.js';

function ProjectDetail() {
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    images: [],
  });
  const [transition, setTransition] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem('transition') === 'true') {
      setTransition(true);
      sessionStorage.setItem('transition', 'false');
      setTimeout(() => {
        setTransition(false);
      }, 6000);
    } 
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

  const handleImageClick = (imageUrl) => {
    setLightboxImage(imageUrl);
    document.body.style.overflow = 'hidden';
  };

  // Function to close the lightbox
  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className={transition ? 'transition' : '' }>
    <div className="wrapper">
      <div className="header">{projectData.title}</div>
      <div className="description">
        {projectData.description}
      </div>

      <div className="flex-container">
        <div className="column-left">
          {leftImages.map((imageUrl, index) => (
            <div key={index} className="grid-item" onClick={() => handleImageClick(imageUrl)}>
              <img src={imageUrl} alt={`Image ${index + 1}`} style={{cursor: "crosshair"}} />
            </div>
          ))}
        </div>
        <div className="column-right">
          {rightImages.map((imageUrl, index) => (
            <div key={index} className="grid-item" onClick={() => handleImageClick(imageUrl)}>
              <img src={imageUrl} alt={`Image ${index + 1}`} style={{cursor: "crosshair"}} />
            </div>
          ))}
        </div>
      </div>
    </div>

    {lightboxImage && <Lightbox imageUrl={lightboxImage} onClose={closeLightbox} />}


    <Link to="/">
    <img className="logo" src="/stars.png" alt="" />
    </Link>
    </div>
  );
}

export default ProjectDetail;
