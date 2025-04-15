import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { debounce, set } from 'lodash';
import { Analytics } from "@vercel/analytics/react"

const CollectionList = lazy(() => import('./pages/CollectionList'));
const ProjectsList = lazy(() => import('./pages/ProjectsList'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  const [calculatedHeight, setCalculatedHeight] = useState(0);
  const [collections, setCollections] = useState([]);
  const [featuredImages, setFeaturedImages] = useState([]);
  const [projectsData, setProjectsData] = useState({});
  const [dataFetched, setDataFetched] = useState(false);
  const [finalImages, setFinalImages] = useState([]);


  const calculateHeight = useMemo(() => debounce(() => {
    const windowHeight = window.innerHeight;
    setCalculatedHeight(windowHeight);
  }, 200), []);

  useEffect(() => {
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => {
      window.removeEventListener('resize', calculateHeight);
      calculateHeight.cancel();
    };
  }, [calculateHeight]);

  useEffect(() => {
    const cachedCollections = sessionStorage.getItem('collections');
    if (cachedCollections) {
      setCollections(JSON.parse(cachedCollections));
 
    } else {
      fetch('https://cdn.contentful.com/spaces/oen9jg6suzgv/environments/master/entries?access_token=DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo&content_type=collection&include=2')
        .then((response) => response.json())
        .then((data) => {
          const fetchedCollections = data.items.map(item => ({
            sys: { id: item.sys.id },
            title: item.fields.title,
            thumbnail: {
              url: data.includes.Asset.find(asset => asset.sys.id === item.fields.thumbnail.sys.id)?.fields.file.url
            }
          }));
          setCollections(fetchedCollections);
          sessionStorage.setItem('collections', JSON.stringify(fetchedCollections));
          
        })
        .catch((error) => console.error('Error fetching collections:', error));
    }
  }, []);

  const matchFeaturedImages = () => {
    if (!projectsData) return;
    // console.log('projectsData:', Object.entries(projectsData));
    // console.log('featuredImages:', featuredImages);
    const matched = [];
    featuredImages.forEach(featuredImage => {
      for (const [collectionId, projects] of Object.entries(projectsData)) {

        for (const project of projects) {
          const matchingImage = project?.imagesCollection?.items?.find(
            img => img.id === featuredImage.sys.id
          );
          if (matchingImage) {
            matched.push({
              imageId: featuredImage.sys.id,
              imageUrl: featuredImage.fields.file.url,
              projectId: project.id,
              projectTitle: project.title,
              collectionId: collectionId,
              tags: featuredImage.contentfulMetadata?.tags?.map(tag => tag.name) || [],
            });
            break;
          }
        }
      }
    });
    setFeaturedImages(matched);
    setFinalImages(matched);
    // console.log('matched:', matched);
    // console.log('featuredImages:', featuredImages);
    sessionStorage.setItem('featuredImages', JSON.stringify(matched));
    setDataFetched(true);
  };

  useEffect(() => {
    const allCollectionsLoaded = collections.length > 0 && 
      Object.keys(projectsData).length === collections.length;
    
    if (allCollectionsLoaded && featuredImages.length > 0 && !dataFetched) {
      matchFeaturedImages();
    }
  }, [collections, projectsData, featuredImages, dataFetched]);

  useEffect(() => {
    const cachedFeaturedImages = sessionStorage.getItem('featuredImages');
    const cachedProjectsData = sessionStorage.getItem('projectsData');
    console.log('cachedFeaturedImages:', collections);

    if (cachedFeaturedImages && cachedProjectsData) {
      setFeaturedImages(JSON.parse(cachedFeaturedImages));
      setProjectsData(JSON.parse(cachedProjectsData));
      
    } else {
      const fetchData = async () => {
        try {
          // Fetch featured images
          const featuredImagesResponse = await fetch('https://graphql.contentful.com/content/v1/spaces/oen9jg6suzgv/environments/master', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo',
            },
            body: JSON.stringify({
              query: `
                query {
                  featuredImagesCollection(limit: 1) {
                    items {
                      imagesCollection(limit: 150) {
                        items {
                          sys {
                            id
                          }
                          title
                          url
                          contentfulMetadata {
                            tags {
                              name
                            }
                          }
                        }
                      }
                    }
                  }
                }
              `
            }),
          });

          const featuredImagesData = await featuredImagesResponse.json();
          
          const featuredImages = featuredImagesData.data.featuredImagesCollection.items[0].imagesCollection.items.map(item => ({
            sys: { id: item.sys.id },
            fields: {
              title: item.title,
              file: { url: item.url }
            },
            contentfulMetadata: {
              tags: item.contentfulMetadata?.tags || []
            }
          }));

          setFeaturedImages(featuredImages);
          sessionStorage.setItem('featuredImages', JSON.stringify(featuredImages));

          // Fetch projects data for all collections
          for (const collection of collections) {
            await fetchProjects(collection.sys.id);
          }

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [collections]);


  const fetchProjects = async (collectionId) => {
    try {
      const cachedProjects = sessionStorage.getItem(`projects_${collectionId}`);
      if (cachedProjects) {
        setProjectsData(prevData => ({...prevData, [collectionId]: JSON.parse(cachedProjects)}));
        // console.log('cachedProjects:', projectsData);
        return;
      }

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
                          url
                          sys { id }
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
          description: project?.description,
          thumbnail: project?.thumbnail?.url,
          imagesCollection: {
            items: project?.imagesCollection?.items.map(item => ({
              id: item?.sys?.id,
              url: item?.url
            })),
            total: project?.imagesCollection?.total
          },
        }));

        setProjectsData(prevData => ({...prevData, [collectionId]: projectsData}));
        sessionStorage.setItem(`projects_${collectionId}`, JSON.stringify(projectsData));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (collections.length > 0) {
      collections.forEach(collection => {
        fetchProjects(collection.sys.id);
      });
    }
  }, [collections]);
  

  return (
    <>
    <Router>
      <Suspense fallback={<></>}>
        <Routes>
          <Route path="/" element={<CollectionList calculatedHeight={calculatedHeight} collections={collections} finalImages={finalImages}  dataFetched={dataFetched}/>} />
          <Route path="/collection/:collectionId/projects" element={<ProjectsList collections={collections} calculatedHeight={calculatedHeight} projectsData={projectsData} fetchProjects={fetchProjects} />} />
          <Route path="/collection/:collectionId/projects/:projectId" element={<ProjectDetail calculatedHeight={calculatedHeight}/>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
    <Analytics />
    </>
  );
}
