import React, { useEffect, useState, useMemo } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';
import FadeUp from '../components/FadeUp';

const CollectionList = ({ calculatedHeight, collections, finalImages, dataFetched }) => {
  const [showContent, setShowContent] = useState(false);
  const [imageGroups, setImageGroups] = useState([]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dataFetched) {
        setShowContent(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [dataFetched]);

  const splitImagesIntoGroups = useMemo(() => {
    return (images) => {
      const screenWidth = window.innerWidth;
      let groupCount;
      if (screenWidth > 1350) {
        groupCount = 4;
      } else if (screenWidth > 1000) {
        groupCount = 3;
      } else {
        groupCount = 2;
      }
      return Array.from({ length: groupCount }, (_, i) =>
        images.filter((_, index) => index % groupCount === i)
      );
    };
  }, []);

  const debouncedHandleResize = useMemo(
    () =>
      debounce(() => {
        setImageGroups(splitImagesIntoGroups(finalImages));
      }, 100),
    [splitImagesIntoGroups, finalImages]
  );

  useEffect(() => {
    debouncedHandleResize();
    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      debouncedHandleResize.cancel();
    };
  }, [debouncedHandleResize]);

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
        <div className='featured-title'>Featured Work</div>
        <div className="featured-images-container">
          {finalImages.length === 0 && (
            <div className="no-featured-images">
              <p>No featured images available.</p>
            </div>
          )}
          {imageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="featured-images-column">
              {group.map((image, index) => (
                
                <FadeUp key={index}>
                <div className="featured-image-item">
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
          ))}
        </div>
      </div>
    </>
  );
};

export default CollectionList;