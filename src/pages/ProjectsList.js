// ProjectsList.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../style.css';
import { Link } from 'react-router-dom';

function ProjectsList() {
  const { collectionId } = useParams();
  const [projectIds, setProjectIds] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjectIds = async () => {
      try {
        const response = await fetch('https://graphql.contentful.com/content/v1/spaces/oen9jg6suzgv/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo',
          },
          body: JSON.stringify({
            query: `
              query collectionEntryQuery {
                collection(id: "${collectionId}") {
                  sys {
                    id
                  }
                  projectsCollection {
                    items {
                      sys {
                        id
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
          setProjectIds(collection.projectsCollection.items.map((item) => item?.sys?.id));
          console.log(collection.projectsCollection.items.map((item) => item?.sys?.id));
        }
      } catch (error) {
        console.error('Error fetching project IDs:', error);
      }
    };

    fetchProjectIds();
  }, [collectionId]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectPromises = projectIds.map(async (projectId) => {
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
                      thumbnail {
                        url
                      }
                    }
                  }
                `,
              }),
            });

            const { data, errors } = await response.json();

            if (errors) {
              console.error(errors);
              return null;
            }

            return data.project;
          } catch (projectError) {
            console.error('Error fetching project:', projectError);
            return null;
          }
        });

        const resolvedProjects = await Promise.all(projectPromises);
        const validProjects = resolvedProjects.filter((project) => project !== null);

        setProjects(validProjects);
        // apply project id to each project
        validProjects.forEach((project, index) => {
          project.id = projectIds[index];
        });
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    if (projectIds.length > 0) {
      fetchProjects();
    }
  }, [projectIds]);

  if (projects.length === 0) {
    return '';
  }

  const midpoint = Math.ceil(projects.length / 2);
  const projectsLeft = projects.slice(0, midpoint);
  const projectsRight = projects.slice(midpoint);

  return (
    <>
    <div className="wrapper">
        <div style={{ marginTop: '2.5rem' }}></div>
      <div className="flex-container">
        <div className="column-left">
          {projectsLeft.map((project) => (
            <Link key={project.id} to={`/collection/${collectionId}/projects/${project.id}`}>
              <div className="grid-item">
                <img src={project?.thumbnail?.url} alt={project?.title} />
                <div className="subtitle">{project?.title}</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="column-right">
          {projectsRight.map((project) => (
            <Link key={project.id} to={`/collection/${collectionId}/projects/${project.id}`}>
              <div className="grid-item">
                <img src={project?.thumbnail?.url} alt={project?.title} />
                <div className="subtitle">{project?.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
    <Link to="/">
    <img className="logo" src="/stars.png" alt="" />
    </Link>
    </>
  );
}

export default ProjectsList;
