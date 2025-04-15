import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { debounce } from 'lodash';
import { Analytics } from '@vercel/analytics/react';

const CollectionList = lazy(() => import('./pages/CollectionList'));
const ProjectsList = lazy(() => import('./pages/ProjectsList'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  const [calculatedHeight, setCalculatedHeight] = useState(0);
  const [collections, setCollections] = useState([]);
  const [featuredImages, setFeaturedImages] = useState([]);
  const [projectsData, setProjectsData] = useState({});
  const [finalImages, setFinalImages] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);

  // Calculate window height with debounce
  const calculateHeight = useMemo(
    () =>
      debounce(() => {
        setCalculatedHeight(window.innerHeight);
      }, 200),
    []
  );

  useEffect(() => {
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => {
      window.removeEventListener('resize', calculateHeight);
      calculateHeight.cancel();
    };
  }, [calculateHeight]);

  // Fetch collections or load from cache
  useEffect(() => {
    const cachedCollections = sessionStorage.getItem('collections');
    if (cachedCollections) {
      setCollections(JSON.parse(cachedCollections));
    } else {
      fetch(
        'https://cdn.contentful.com/spaces/oen9jg6suzgv/environments/master/entries?access_token=DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo&content_type=collection&include=2'
      )
        .then((res) => res.json())
        .then((data) => {
          const fetchedCollections = data.items.map((item) => ({
            sys: { id: item.sys.id },
            title: item.fields.title,
            thumbnail: {
              url: data.includes.Asset.find(
                (asset) => asset.sys.id === item.fields.thumbnail.sys.id
              )?.fields.file.url,
            },
          }));
          setCollections(fetchedCollections);
          sessionStorage.setItem('collections', JSON.stringify(fetchedCollections));
        })
        .catch((err) => console.error('Error fetching collections:', err));
    }
  }, []);

  // Fetch featuredImages or load from cache
  useEffect(() => {
    if (collections.length === 0) return; // Wait for collections

    const cachedFeaturedImages = sessionStorage.getItem('featuredImages');
    if (cachedFeaturedImages) {
      setFeaturedImages(JSON.parse(cachedFeaturedImages));
    } else {
      // Fetch featured images from GraphQL
      fetch('https://graphql.contentful.com/content/v1/spaces/oen9jg6suzgv/environments/master', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo',
        },
        body: JSON.stringify({
          query: `
            query {
              featuredImagesCollection(limit: 1) {
                items {
                  imagesCollection(limit: 150) {
                    items {
                      sys { id }
                      title
                      url
                      contentfulMetadata {
                        tags { name }
                      }
                    }
                  }
                }
              }
            }
          `,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const items =
            data.data.featuredImagesCollection?.items?.[0]?.imagesCollection?.items || [];
          const images = items.map((item) => ({
            sys: { id: item.sys.id },
            fields: {
              title: item.title,
              file: { url: item.url },
            },
            contentfulMetadata: {
              tags: item.contentfulMetadata?.tags || [],
            },
          }));
          setFeaturedImages(images);
          sessionStorage.setItem('featuredImages', JSON.stringify(images));
        })
        .catch((err) => console.error('Error fetching featured images:', err));
    }
  }, [collections]);

  // Fetch projects for each collection or load from cache
  useEffect(() => {
    if (collections.length === 0) return;

    const loadProjectsForCollection = async (collectionId) => {
      const cachedProjects = sessionStorage.getItem(`projects_${collectionId}`);
      if (cachedProjects) {
        setProjectsData((prev) => ({
          ...prev,
          [collectionId]: JSON.parse(cachedProjects),
        }));
        return;
      }

      try {
        const response = await fetch('https://graphql.contentful.com/content/v1/spaces/oen9jg6suzgv/environments/master', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo',
          },
          body: JSON.stringify({
            query: `
              query {
                collection(id: "${collectionId}") {
                  sys { id }
                  projectsCollection {
                    items {
                      sys { id }
                      ... on Project {
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

        const projects =
          data.collection?.projectsCollection?.items.map((project) => ({
            id: project.sys.id,
            title: project.title,
            description: project.description,
            thumbnail: project.thumbnail?.url,
            imagesCollection: {
              items: project.imagesCollection?.items.map((img) => ({
                id: img.sys.id,
                url: img.url,
              })),
              total: project.imagesCollection?.total,
            },
          })) || [];

        setProjectsData((prev) => {
          const newData = { ...prev, [collectionId]: projects };
          sessionStorage.setItem(`projects_${collectionId}`, JSON.stringify(projects));
          return newData;
        });
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    // Load projects for all collections
    collections.forEach(({ sys }) => {
      loadProjectsForCollection(sys.id);
    });
  }, [collections]);

  // Match featured images to projects and collections, format finalImages
  useEffect(() => {
    if (
      collections.length === 0 ||
      featuredImages.length === 0 ||
      Object.keys(projectsData).length !== collections.length
    )
      return;

    // Match featured images to projects
    const matched = [];

    featuredImages.forEach((featuredImage) => {
      for (const [collectionId, projects] of Object.entries(projectsData)) {
        for (const project of projects) {
          const matchingImage = project.imagesCollection.items.find(
            (img) => img.id === featuredImage.sys.id
          );
          if (matchingImage) {
            matched.push({
              imageId: featuredImage.sys.id,
              imageUrl: featuredImage.fields.file.url,
              projectId: project.id,
              projectTitle: project.title,
              collectionId,
              tags: featuredImage.contentfulMetadata?.tags?.map((tag) => tag.name) || [],
            });
            break; // Stop searching projects once matched
          }
        }
      }
    });

    setFinalImages(matched);
    sessionStorage.setItem('featuredImagesMatched', JSON.stringify(matched));
    setDataFetched(true);
  }, [collections, featuredImages, projectsData]);

  return (
    <>
      <Router>
        <Suspense fallback={<></>}>
          <Routes>
            <Route
              path="/"
              element={
                <CollectionList
                  calculatedHeight={calculatedHeight}
                  collections={collections}
                  finalImages={finalImages}
                  dataFetched={dataFetched}
                />
              }
            />
            <Route
              path="/collection/:collectionId/projects"
              element={
                <ProjectsList
                  collections={collections}
                  calculatedHeight={calculatedHeight}
                  projectsData={projectsData}
                  fetchProjects={() => {}} // No need to fetch here anymore
                />
              }
            />
            <Route
              path="/collection/:collectionId/projects/:projectId"
              element={<ProjectDetail calculatedHeight={calculatedHeight} dataFetched={dataFetched} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
      <Analytics />
    </>
  );
}
