import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../style.css';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

function ProjectsList({ collections }) {
  const { collectionId } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(null);
  const [transition, setTransition] = useState(false);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    console.log('collections', collections);
    if (collections) {
      const collection = collections.find((collection) => collection.sys.id === collectionId);
      setCollection(collection);
    }
  }, [collections]);

  useEffect(() => {
    AOS.init();
  }, [collectionId, projects])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTransition(true);
      const readyTimeout = setTimeout(() => {
        setReady(true);
      }, 600);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://graphql.contentful.com/content/v1/spaces/oen9jg6suzgv/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo',
          },
          body: JSON.stringify({
            query: `
              query collectionProjectsQuery {
                collection(id: "${collectionId}") {
                  sys {
                    id
                  }
                  projectsCollection {
                    items {
                      sys {
                        id
                      }
                      ... on Project {
                      title
                      thumbnail {
                        url
                      }
                      imagesCollection {
                        items {
                          url
                        }
                        total
                      }
                    }
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

        const collection = data.collection;
        if (collection && collection.projectsCollection) {
          const projectsData = collection.projectsCollection.items.map((project) => ({
            id: project?.sys?.id,
            title: project?.title,
            thumbnail: project?.thumbnail?.url,
            imagesCollection: project?.imagesCollection,
          }));

          setProjects(projectsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionId]);

  function openModal() {
    if (modal === false) {
      setModal(true);
    }
  }
  function closeModal() {
    if (modal === true) {
      setModal(false);
    }
  }
  

  if (loading) {
    return '';
  }

  if (projects.length === 0) {
    return (
      <>
        <div className='page-cover'style={{
          opacity: transition ? 0 : 1,
          zIndex: ready ? 0 : undefined,
        }} >
          <div className='subtitle'>{collection.title}</div>
        </div>

        <div className="wrapper">
          <div className="flex-container">
            <div className="column-left">
              <div className="grid-item"  style={{ marginBottom: '1.5rem' }}>
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
          <div className='subtitle'>
            {/* conditional collection.title */}
            {collection && collection.title}

            </div>
        </div>

      <div className="wrapper">
        <div style={{ marginTop: '2.5rem' }}></div>
        <div className="flex-container">
          <div className="column-left">
          {projectsLeft.map((project) => (
              project.imagesCollection.total > 1 ? (
                <Link key={project.id} to={`/collection/${collectionId}/projects/${project.id}`}>
                  <div className="grid-item" data-aos="fade-up" style={{ marginBottom: '1.5rem' }}>
                    <img src={project.thumbnail} alt={project.title} />
                    <div className="subtitle">{project.title}</div>
                  </div>
                </Link>
              ) : (
                  <div onClick={openModal} className="grid-item" data-aos="fade-up" style={{ marginBottom: '1.5rem', cursor: 'crosshair' }}>
                    <img src={project.thumbnail} alt={project.title} />
                    <div className="subtitle">{project.title}</div>
                  </div>
              )
            ))}
          </div>
          {projectsRight.length > 0 && (
            <div className="column-right">
              {projectsRight.map((project) => (
                project.imagesCollection.total > 1 ? (
                <Link key={project.id} to={`/collection/${collectionId}/projects/${project.id}`}>
                  <div className="grid-item" data-aos="fade-up" style={{ marginBottom: '1.5rem' }}>
                    <img src={project.thumbnail} alt={project.title} />
                    <div className="subtitle">{project.title}</div>
                  </div>
                </Link>
                ) : (
                  <div onClick={openModal} className="grid-item" data-aos="fade-up" style={{ marginBottom: '1.5rem', cursor: 'crosshair' }}>
                    <img src={project.thumbnail} alt={project.title} />
                    <div className="subtitle">{project.title}</div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
      {modal ? (
      <div onClick={closeModal} className='modal-wrapper'>
        <img  src="https://images.ctfassets.net/oen9jg6suzgv/3HBuhn9u8jpFRm1O0gyxwS/f02e42bb4ddad8649e367f00decee044/Main_Post.jpg" width="80%" alt="" />
        <div>
          <div className='modal-title'>Title</div>
          <div className='modal-subtitle'>Subtitle</div>
        </div>
      </div>
      ) : null
        }
      <Link to="/">
        <img className="logo" src="/stars.png" alt="" />
      </Link>
    </>
  );
}

export default ProjectsList;
