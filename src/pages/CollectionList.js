import React, { useEffect, useState, useMemo } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';
import FadeUp from '../components/FadeUp';

const CollectionList = ({ calculatedHeight, collections, finalImages, dataFetched }) => {
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dataFetched) {
        setShowContent(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [dataFetched]);

  // Split the finalImages into two categories (commercial and artistic)
  const commercialImages = useMemo(() => {
    if (!finalImages) return [];
    // For now, just take the first half of the images for commercial
    return finalImages.slice(0, Math.ceil(finalImages.length / 2));
  }, [finalImages]);

  const artisticImages = useMemo(() => {
    if (!finalImages) return [];
    // Take the second half for artistic
    return finalImages.slice(Math.ceil(finalImages.length / 2));
  }, [finalImages]);

  if (!collections) return null;
  if (!finalImages) return null;

  return (
    <>
      <div style={{ display: !showContent ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center', height: calculatedHeight ? `${calculatedHeight}px` : `${window.innerHeight}px` }}>
        <div className="title">WAVO'S VISION</div>
      </div>
      <div className="collection-wrapper" style={{ display: showContent ? 'block' : 'none' }}>
        <div className='menu-wrapper'>
          <div className="collections">
            <p>COLLECTIONS:</p>
            {collections.map(({ sys, title }) => (
              <Link key={sys.id} to={`/collection/${sys.id}/projects`} className="collection" id={`collection-item-${sys.id}`}>
                <p>{title}</p>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Commercial Work Section */}
        <div className='featured-section'>
          <div className='featured-title'>Commercial Work</div>
          <div className="carousel-container">
            <div className="carousel-track">
              {commercialImages.map((image, index) => (
                <FadeUp key={index}>
                  <div className="carousel-item">
                    <Link to={`/collection/${image.collectionId}/projects/${image.projectId}`}>
                      <img 
                        src={`${image.imageUrl}?w=550`} 
                        alt={image.imageId}
                        className="featured-image" 
                      />
                      <div className="featured-image-subtitle">
                        {image.projectTitle}
                      </div>
                    </Link>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
        
        {/* Artistic Work Section */}
        <div className='featured-section'>
          <div className='featured-title'>Artistic Work</div>
          <div className="carousel-container">
            <div className="carousel-track">
              {artisticImages.map((image, index) => (
                <FadeUp key={index}>
                  <div className="carousel-item">
                    <Link to={`/collection/${image.collectionId}/projects/${image.projectId}`}>
                      <img 
                        src={`${image.imageUrl}?w=550`} 
                        alt={image.imageId}
                        className="featured-image" 
                      />
                      <div className="featured-image-subtitle">
                        {image.projectTitle}
                      </div>
                    </Link>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionList;
