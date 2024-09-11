import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { debounce } from 'lodash'; // Make sure to install lodash
import { Analytics } from "@vercel/analytics/react"

const CollectionList = lazy(() => import('./pages/CollectionList'));
const ProjectsList = lazy(() => import('./pages/ProjectsList'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

const collectionQuery = `
  query collectionQuery {
    collectionCollection {
      items {
        sys {
          id
        }
        title
        thumbnail {
          url
        }
      }
    }
  }
`;

export default function App() {
  const [calculatedHeight, setCalculatedHeight] = useState(0);
  const [collections, setCollections] = useState([]);
  const [featuredImages, setFeaturedImages] = useState([]);

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
      fetch('https://graphql.contentful.com/content/v1/spaces/oen9jg6suzgv/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo',
        },
        body: JSON.stringify({ query: collectionQuery }),
      })
        .then((response) => response.json())
        .then(({ data, errors }) => {
          if (errors) {
            console.error(errors);
          }
          const fetchedCollections = data.collectionCollection.items;
          setCollections(fetchedCollections);
          sessionStorage.setItem('collections', JSON.stringify(fetchedCollections));
        });
    }
  }, []);

  useEffect(() => {
    const cachedFeaturedImages = sessionStorage.getItem('featuredImages');
    if (cachedFeaturedImages) {
      setFeaturedImages(JSON.parse(cachedFeaturedImages));
    } else {
      const fetchProjectsWithFeaturedImages = async () => {
        try {
          const response = await fetch('https://cdn.contentful.com/spaces/oen9jg6suzgv/environments/master/entries?access_token=DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo&content_type=project&include=2');
          const data = await response.json();
          const projects = data.items;
          const assets = data.includes.Asset;
          const assetMap = new Map(assets.map(asset => [asset.sys.id, asset]));
          const uniqueAssetIds = new Set();
          const featuredProjectImages = projects.flatMap(project => {
            const projectImages = [
              project.fields.thumbnail,
              ...(project.fields.images || [])
            ].filter(Boolean);
            return projectImages.map(imageLink => {
              const assetId = imageLink.sys.id;
              const asset = assetMap.get(assetId);
              if (asset && asset.metadata && asset.metadata.tags) {
                const isFeatured = asset.metadata.tags.some(tag => tag.sys.id === 'featured');
                if (isFeatured && !uniqueAssetIds.has(assetId)) {
                  uniqueAssetIds.add(assetId);
                  return {
                    ...asset,
                    linkedProject: {
                      id: project.sys.id,
                      title: project.fields.title,
                      collectionId: project.fields.collection ? project.fields.collection.sys.id : null
                    }
                  };
                }
              }
              return null;
            }).filter(Boolean);
          });
          setFeaturedImages(featuredProjectImages);
          sessionStorage.setItem('featuredImages', JSON.stringify(featuredProjectImages));
        } catch (error) {
          console.error('Error fetching projects and featured images:', error);
        }
      };
      fetchProjectsWithFeaturedImages();
    }
  }, []);

  return (
    <>
    <Router>
      <Suspense fallback={<></>}>
        <Routes>
          <Route path="/" element={<CollectionList calculatedHeight={calculatedHeight} collections={collections} featuredImages={featuredImages} />} />
          <Route path="/collection/:collectionId/projects" element={<ProjectsList collections={collections} calculatedHeight={calculatedHeight} />} />
          <Route path="/collection/:collectionId/projects/:projectId" element={<ProjectDetail calculatedHeight={calculatedHeight}/>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
    <Analytics />
    </>
  );
}