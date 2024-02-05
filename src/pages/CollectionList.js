import React, { useState, useEffect } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';

const query = `
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

const CollectionList = () => {
  const [collections, setCollections] = useState(null);
  const [subtitlePositions, setSubtitlePositions] = useState({});
  const [transition, setTransition] = useState(false);
  const [calculatedHeight, setCalculatedHeight] = useState(0);

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

  // useeffect to check session storage to so if transition should be set to true
  useEffect(() => {
    if (sessionStorage.getItem('transition') === 'true') {
      setTransition(true);
      sessionStorage.setItem('transition', 'false');
      setTimeout(() => {
        setTransition(false);
      }, 6000);
    } 
  }, []);



  useEffect(() => {
    // Set body and id='app' to overflow hidden
    document.body.style.overflow = 'hidden';
    document.getElementById('app').style.overflow = 'hidden';
  
    // Cleanup function to reset styles when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
      const appElement = document.getElementById('app');
      if (appElement) {
        appElement.style.overflow = 'unset';
      }
    };
  }, []);
  

  useEffect(() => {
    window
      .fetch(`https://graphql.contentful.com/content/v1/spaces/oen9jg6suzgv/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo',
        },
        body: JSON.stringify({ query }),
      })
      .then((response) => response.json())
      .then(({ data, errors }) => {
        if (errors) {
          console.error(errors);
        }

        setCollections(data.collectionCollection.items);
      });
  }, []);

  const updateSubtitlePositions = () => {
    if (collections) {
      const positions = {};
      collections.forEach((collection) => {
        const element = document.getElementById(`collection-item-${collection.sys.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          positions[collection.sys.id] = { x: centerX, y: centerY };
        }
      });
      setSubtitlePositions(positions);
    }
  };

  useEffect(() => {
    updateSubtitlePositions();
    window.addEventListener('resize', updateSubtitlePositions);
    return () => {
      window.removeEventListener('resize', updateSubtitlePositions);
    };
  }, [collections]);


  if (!collections) {
    return '';
  }


  return (
    <div className={transition ? 'transition' : '' }>
      <div className='menu-wrapper' style={{ height: `${calculatedHeight - 60}px` }}>
        <div className="menu">
          {collections.map((collection) => (
            <Link
              key={collection.sys.id}
              to={`/collection/${collection.sys.id}/projects`}
              className="collection-item"
              id={`collection-item-${collection.sys.id}`}
            >
              <img src={collection.thumbnail.url} alt={collection.title} />
              {subtitlePositions[collection.sys.id] && (
                <p
                  style={{
                    position: 'absolute',
                    top: `${subtitlePositions[collection.sys.id].y}px`,
                    left: `${subtitlePositions[collection.sys.id].x}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {collection.title}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
      <Link to="/">
        <img className="logo" src="/stars.png" alt="" style={{ bottom: '5px', right: '5px', position: 'absolute' }} />
      </Link>
    </div>
  );
};

export default CollectionList;
