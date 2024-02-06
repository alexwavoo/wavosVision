import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../style.css';
import { Link } from 'react-router-dom';

function ProjectsList() {
  const { collectionId } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(null);   

  // get collection and filter by collectionId to find the collection
  useEffect(() => {
    sessionStorage.getItem('collections') && setCollection(JSON.parse(sessionStorage.getItem('collections')).find((collection) => collection.sys.id === collectionId));
  }, [collectionId]);

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

  if (loading) {
    return '';
  }

  if (projects.length === 0) {
    return (
      <Link to="/">
        <img className="logo" src="/stars.png" alt="" style={{ position: 'absolute', right: '0.5rem' }} />
      </Link>
    );
  }

  const midpoint = Math.ceil(projects.length / 2);
  const projectsLeft = projects.slice(0, midpoint);
  const projectsRight = projects.slice(midpoint);

  return (
    <>
      <div className='page-cover'>
        <div className='cover-title'>{collection.title}</div>
      </div>
      <div className="wrapper">
        <div style={{ marginTop: '2.5rem' }}></div>
        <div className="flex-container">
          <div className="column-left">
            {projectsLeft.map((project) => (
              <Link key={project.id} to={`/collection/${collectionId}/projects/${project.id}`}>
                <div className="grid-item" style={{ marginBottom: '1.5rem' }}>
                  <img src={project.thumbnail} alt={project.title} />
                  <div className="subtitle">{project.title}</div>
                </div>
              </Link>
            ))}
          </div>
          {projectsRight.length > 0 && (
            <div className="column-right">
              {projectsRight.map((project) => (
                <Link key={project.id} to={`/collection/${collectionId}/projects/${project.id}`}>
                  <div className="grid-item" style={{ marginBottom: '1.5rem' }}>
                    <img src={project.thumbnail} alt={project.title} />
                    <div className="subtitle">{project.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Link to="/">
        <img className="logo" src="/stars.png" alt="" />
      </Link>
    </>
  );
}

export default ProjectsList;
