import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { debounce } from 'lodash';
import { Analytics } from '@vercel/analytics/react';

import './style.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

const CollectionList = lazy(() => import('./pages/CollectionList'));
const ProjectsList = lazy(() => import('./pages/ProjectsList'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

const SPACE_ID = process.env.REACT_APP_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN;
const REST_BASE = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/master`;
const GRAPHQL_BASE = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}/environments/master`;

export default function App() {
  const [calculatedHeight, setCalculatedHeight] = useState(0);
  const [collections, setCollections] = useState([]);
  const [clientImages, setClientImages] = useState([]);
  const [signatureImages, setSignatureImages] = useState([]);
  const [projectsData, setProjectsData] = useState({});
  const [finalClientImages, setFinalClientImages] = useState([]);
  const [finalSignatureImages, setFinalSignatureImages] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);

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

  useEffect(() => {
    const cachedCollections = sessionStorage.getItem('collections');
    if (cachedCollections) {
      setCollections(JSON.parse(cachedCollections));
    } else {
      fetch(
        `${REST_BASE}/entries?access_token=${ACCESS_TOKEN}&content_type=collection&include=2`
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

  useEffect(() => {
    if (collections.length === 0) return;

    const cachedClientImages = sessionStorage.getItem('clientImages');
    const cachedSignatureImages = sessionStorage.getItem('signatureImages');
    
    if (cachedClientImages && cachedSignatureImages) {
      setClientImages(JSON.parse(cachedClientImages));
      setSignatureImages(JSON.parse(cachedSignatureImages));
    } else {
      fetch(GRAPHQL_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ACCESS_TOKEN}`,
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
                      width
                      height
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
          const cols = data.data.featuredImagesCollection?.items || [];
          
          const clientCollection = cols.find(item => item.name === "Client Facing");
          const signatureCollection = cols.find(item => item.name === "Signature Direction");
          
          const clientItems = clientCollection?.imagesCollection?.items || [];
          const clientImagesData = clientItems.map((item) => ({
            sys: { id: item.sys.id },
            fields: {
              title: item.title,
              file: { url: item.url },
              width: item.width,
              height: item.height,
            },
          }));
          
          const signatureItems = signatureCollection?.imagesCollection?.items || [];
          const signatureImagesData = signatureItems.map((item) => ({
            sys: { id: item.sys.id },
            fields: {
              title: item.title,
              file: { url: item.url },
              width: item.width,
              height: item.height,
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
        const response = await fetch(GRAPHQL_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ACCESS_TOKEN}`,
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

    collections.forEach(({ sys }) => {
      loadProjectsForCollection(sys.id);
    });
  }, [collections]);

  useEffect(() => {
    if (
      collections.length === 0 ||
      clientImages.length === 0 ||
      Object.keys(projectsData).length !== collections.length
    )
      return;

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
              imageWidth: clientImage.fields.width,
              imageHeight: clientImage.fields.height,
              projectId: project.id,
              projectTitle: project.title,
              collectionId,
            });
            break;
          }
        }
      }
    });

    setFinalClientImages(matched);
    sessionStorage.setItem('finalClientImagesMatched', JSON.stringify(matched));
  }, [collections, clientImages, projectsData]);

  useEffect(() => {
    if (
      collections.length === 0 ||
      signatureImages.length === 0 ||
      Object.keys(projectsData).length !== collections.length
    )
      return;

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
              imageWidth: signatureImage.fields.width,
              imageHeight: signatureImage.fields.height,
              projectId: project.id,
              projectTitle: project.title,
              collectionId,
            });
            break;
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
        <ErrorBoundary>
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
                  />
                }
              />
              <Route
                path="/collection/:collectionId/projects/:projectId"
                element={<ProjectDetail calculatedHeight={calculatedHeight} projectsData={projectsData} dataFetched={dataFetched} />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Footer />
        </ErrorBoundary>
      </Router>
      <Analytics />
    </>
  );
}
