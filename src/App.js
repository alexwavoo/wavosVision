import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CollectionList from './pages/CollectionList';
import ProjectsList from './pages/ProjectsList';
import ProjectDetail from './pages/ProjectDetail';
import NotFound from './pages/NotFound';

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
  const [loading, setLoading] = useState(true);
  const [calculatedHeight, setCalculatedHeight] = useState(0);
  const [collections, setCollections] = useState(null);


  useEffect(() => {
    // Function to recalculate height based on the window size
    const calculateHeight = () => {
      const windowHeight = window.innerHeight;
      const heightPercentage = 100; // Adjust this as needed
      const newHeight = (windowHeight * heightPercentage) / 100;
      setCalculatedHeight(newHeight);
    };
    // Initial calculation
    calculateHeight();

    // Event listener for window resize
    window.addEventListener('resize', calculateHeight);

    // Cleanup: remove event listener on component unmount
    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);

  useEffect(() => {
    // Check if the session is new
    if (!sessionStorage.getItem('session')) {
      // Set timeout to 3 seconds
      const timeoutId = setTimeout(() => {
        sessionStorage.setItem('session', Date.now());
        sessionStorage.setItem('transition', true);
        setLoading(false);
      }, 3500);

      // Clear the timeout if the component unmounts before 3 seconds
      return () => clearTimeout(timeoutId);
    } else {
      // If the session already exists, set loading to false immediately
      setLoading(false);
    }
  }, []); 

  // API REQUESTS

  useEffect(() => { // Fetch collections from Contentful
    window
      .fetch(`https://graphql.contentful.com/content/v1/spaces/oen9jg6suzgv/`, {
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


        // Store collections data in session storage
        sessionStorage.setItem('collections', JSON.stringify(fetchedCollections));
      });
  }, []);

  useEffect(() => { 
    console.log('collections', collections);
  }, [collections]);


  
  if (loading) {
    // Render loading message
    return (
      <div className="home" style={{ height: `${calculatedHeight}px` }}>
        <div className="title">WAVO'S VISION</div>
      </div>
    );
  }

  // If the session is new or has already been established, render the actual content
  return (
    <Router>
      <Routes>
        {/* pass variable calculatedHeight and collections */}
        <Route path="/" element={<CollectionList calculatedHeight={calculatedHeight} collections={collections} setCollections={setCollections} />} />
        <Route
          path="/collection/:collectionId/projects"
          element={<ProjectsList collections={collections} setCollections={setCollections} />}
        />
        <Route
          path="/collection/:collectionId/projects/:projectId"
          element={<ProjectDetail />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
