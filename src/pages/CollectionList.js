import React, { useState, useEffect } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';
import classNames from 'classnames';


const CollectionList = ({ calculatedHeight, collections, setCollections}) => {
  const [subtitlePositions, setSubtitlePositions] = useState({});
  const [loading, setLoading] = useState(true);


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

// download images from contentful using thumbnail urls

const preloadImages = async () => {
  await Promise.all(
    collections.map(async (collection) => {
      const img = new Image();
      img.src = collection.thumbnail.url;
      await img.decode();
    })
  );
};


useEffect(() => {
  const downloadImages = async () => {
    try {
      await preloadImages();

      const updatedCollections = await Promise.all(
        collections.map(async (collection) => {
          const response = await fetch(collection.thumbnail.url);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          return { ...collection, thumbnail: { ...collection.thumbnail, url } };
        })
      );

      setCollections(updatedCollections);
    } catch (error) {
      // Handle errors if any during image download
      console.error('Error downloading images:', error);
    } finally {
      setLoading(false);
    }
  };

  downloadImages();
}, [collections, setCollections, setLoading]);



  if (!collections) {
    return '';
  }


  return (
    <div className={`collection-wrapper ${classNames({ 'invisible': loading })}`}>
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
        <img className="logo" src="/stars.png" alt="" style={{ bottom: '15px', right: '8px', position: 'absolute' }} />
      </Link>
    </div>
  );
  
};

export default CollectionList;
