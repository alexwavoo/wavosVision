
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CollectionList from './pages/CollectionList';
import ProjectsList from './pages/ProjectsList';
import ProjectDetail from './pages/ProjectDetail';
import NotFound from './pages/NotFound';


export default function App() {
  const [loading, setLoading] = useState(true);

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
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    // Render loading message
    return (
      <div className="home">
        <div className="title">WAVO'S VISION</div>
    </div>
    );
  }

  // If the session is new or has already been established, render the actual content
return (
    <Router>
      <Routes>
        <Route path="/" element={<CollectionList  />} />
        <Route
          path="/collection/:collectionId/projects"
          element={<ProjectsList  />}
        />
        <Route
          path="/collection/:collectionId/projects/:projectId"
          element={<ProjectDetail  />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
