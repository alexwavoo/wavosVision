import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { debounce } from 'lodash';
import { Analytics } from '@vercel/analytics/react';

import './style.css';
import Header from './components/Header';
import Footer from './components/Footer';

const CollectionList = lazy(() => import('./pages/CollectionList'));
const ProjectsList = lazy(() => import('./pages/ProjectsList'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  const [calculatedHeight, setCalculatedHeight] = useState(0);
  const [collections, setCollections] = useState([]);
  const [clientImages, setClientImages] = useState([]);
  const [signatureImages, setSignatureImages] = useState([]);
  const [projectsData, setProjectsData] = useState({});
  const [finalClientImages, setFinalClientImages] = useState([]);
  const [finalSignatureImages, setFinalSignatureImages] = useState([]);
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

  // Fetch featured image collections or load from cache
  useEffect(() => {
    if (collections.length === 0) return; // Wait for collections

    const cachedClientImages = sessionStorage.getItem('clientImages');
    const cachedSignatureImages = sessionStorage.getItem('signatureImages');
    
    if (cachedClientImages && cachedSignatureImages) {
      setClientImages(JSON.parse(cachedClientImages));
      setSignatureImages(JSON.parse(cachedSignatureImages));
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
              featuredImagesCollection(limit: 3) {
                items {
                  name
                  imagesCollection(limit: 150) {
                    items {
                      sys { id }
                      title
                      url
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
          const collections = data.data.featuredImagesCollection?.items || [];
          
          // Find client facing and signature direction collections
          const clientCollection = collections.find(item => item.name === "Client Facing");
          const signatureCollection = collections.find(item => item.name === "Signature Direction");
          
          // Process client images
          const clientItems = clientCollection?.imagesCollection?.items || [];
          const clientImagesData = clientItems.map((item) => ({
            sys: { id: item.sys.id },
            fields: {
              title: item.title,
              file: { url: item.url },
            },
          }));
          
          // Process signature images
          const signatureItems = signatureCollection?.imagesCollection?.items || [];
          const signatureImagesData = signatureItems.map((item) => ({
            sys: { id: item.sys.id },
            fields: {
              title: item.title,
              file: { url: item.url },
            },
          }));
          
          setClientImages(clientImagesData);
          setSignatureImages(signatureImagesData);
          
          sessionStorage.setItem('clientImages', JSON.stringify(clientImagesData));
          sessionStorage.setItem('signatureImages', JSON.stringify(signatureImagesData));
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

  // Match client images to projects and collections
  useEffect(() => {
    if (
      collections.length === 0 ||
      clientImages.length === 0 ||
      Object.keys(projectsData).length !== collections.length
    )
      return;

    // Match client images to projects
    const matched = [];

    clientImages.forEach((clientImage) => {
      for (const [collectionId, projects] of Object.entries(projectsData)) {
        for (const project of projects) {
          const matchingImage = project.imagesCollection.items.find(
            (img) => img.id === clientImage.sys.id
          );
          if (matchingImage) {
            matched.push({
              imageId: clientImage.sys.id,
              imageUrl: clientImage.fields.file.url,
              projectId: project.id,
              projectTitle: project.title,
              collectionId,
            });
            break; // Stop searching projects once matched
          }
        }
      }
    });

    setFinalClientImages(matched);
    sessionStorage.setItem('finalClientImagesMatched', JSON.stringify(matched));
  }, [collections, clientImages, projectsData]);

  // Match signature images to projects and collections
  useEffect(() => {
    if (
      collections.length === 0 ||
      signatureImages.length === 0 ||
      Object.keys(projectsData).length !== collections.length
    )
      return;

    // Match signature images to projects
    const matched = [];

    signatureImages.forEach((signatureImage) => {
      for (const [collectionId, projects] of Object.entries(projectsData)) {
        for (const project of projects) {
          const matchingImage = project.imagesCollection.items.find(
            (img) => img.id === signatureImage.sys.id
          );
          if (matchingImage) {
            matched.push({
              imageId: signatureImage.sys.id,
              imageUrl: signatureImage.fields.file.url,
              projectId: project.id,
              projectTitle: project.title,
              collectionId,
            });
            break; // Stop searching projects once matched
          }
        }
      }
    });

    setFinalSignatureImages(matched);
    sessionStorage.setItem('finalSignatureImagesMatched', JSON.stringify(matched));
    setDataFetched(true);
  }, [collections, signatureImages, projectsData]);

  return (
    <>
      <Router>
        <Header collections={collections} />
        <Suspense fallback={<></>}>
          <Routes>
            <Route
              path="/"
              element={
                <CollectionList
                  calculatedHeight={calculatedHeight}
                  collections={collections}
                  clientImages={finalClientImages}
                  signatureImages={finalSignatureImages}
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
        <Footer />
      </Router>
      <Analytics />
    </>
  );
}