import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

import debounce from './utils/debounce';
import { useCollections } from './hooks/useCollections';
import { useFeaturedImages } from './hooks/useFeaturedImages';
import { useProjectsForCollections } from './hooks/useProjectsForCollections';
import { useMatchedImages } from './hooks/useMatchedImages';
import { getStoreUrl } from './config/externalUrls';

import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import GoogleAnalyticsCrossDomain from './components/GoogleAnalyticsCrossDomain';

const CollectionList = lazy(() => import('./pages/CollectionList'));
const ProjectsList = lazy(() => import('./pages/ProjectsList'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

function StoreRedirect() {
  useEffect(() => { window.location.replace(getStoreUrl()); }, []);
  return null;
}

export default function App() {
  const [calculatedHeight, setCalculatedHeight] = useState(window.innerHeight);

  const calculateHeight = useMemo(
    () =>
      debounce(() => {
        setCalculatedHeight(window.innerHeight);
      }, 200),
    []
  );

  useEffect(() => {
    window.addEventListener('resize', calculateHeight);
    return () => {
      window.removeEventListener('resize', calculateHeight);
      calculateHeight.cancel();
    };
  }, [calculateHeight]);

  const { data: collections = [], error: collectionsError, refetch: refetchCollections } = useCollections();
  const { data: featured, error: featuredError, refetch: refetchFeatured } = useFeaturedImages(collections.length > 0);
  const { projectsData, allLoaded, hasError: projectsError, queries: projectQueries } = useProjectsForCollections(collections);

  const clientImages = featured?.clientImages || [];
  const signatureImages = featured?.signatureImages || [];

  const { finalClientImages, finalSignatureImages, dataFetched } = useMatchedImages(
    clientImages,
    signatureImages,
    projectsData,
    allLoaded
  );

  return (
    <>
      <Router>
        <GoogleAnalyticsCrossDomain />
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
                    error={collectionsError || featuredError}
                    onRetry={() => {
                      refetchCollections();
                      refetchFeatured();
                    }}
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
                    projectsError={projectsError}
                    projectQueries={projectQueries}
                  />
                }
              />
              <Route
                path="/collection/:collectionId/projects/:projectId"
                element={
                  <ProjectDetail
                    calculatedHeight={calculatedHeight}
                  />
                }
              />
              <Route path="/store" element={<StoreRedirect />} />
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
