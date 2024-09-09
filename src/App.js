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
  const [calculatedHeight, setCalculatedHeight] = useState(0);
  const [collections, setCollections] = useState([]);
  const [featuredImages, setFeaturedImages] = useState([]);
  


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
  }, [setCalculatedHeight, calculatedHeight, setCollections, collections]);


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
    const fetchProjectsWithFeaturedImages = async () => {
      try {
        // Fetch all projects with their images and collections
        const response = await fetch('https://cdn.contentful.com/spaces/oen9jg6suzgv/environments/master/entries?access_token=DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo&content_type=project&include=2');
        const data = await response.json();

        // Extract projects and assets
        const projects = data.items;
        const assets = data.includes.Asset;

        // Create a map of asset IDs to assets for quick lookup
        const assetMap = new Map(assets.map(asset => [asset.sys.id, asset]));

        // Use a Set to keep track of unique asset IDs
        const uniqueAssetIds = new Set();

        // Filter for featured images and associate them with projects
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
        console.log('Featured Images:', featuredProjectImages);
      } catch (error) {
        console.error('Error fetching projects and featured images:', error);
      }
    };

    fetchProjectsWithFeaturedImages();
  }, []);
  


  return (
    <Router>
      <Routes>
        {/* pass variable calculatedHeight and collections */}
        <Route path="/" element={<CollectionList calculatedHeight={calculatedHeight} collections={collections} featuredImages={featuredImages} />} />
        <Route
          path="/collection/:collectionId/projects"
          element={<ProjectsList collections={collections} calculatedHeight={calculatedHeight} />}
        />
        <Route
          path="/collection/:collectionId/projects/:projectId"
          element={<ProjectDetail  calculatedHeight={calculatedHeight}/>}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

