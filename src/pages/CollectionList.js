import React, { useEffect, useState, useMemo } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';

const CollectionList = ({ calculatedHeight, collections, featuredImages }) => {
  const [showContent, setShowContent] = useState(false);
  const [imageGroups, setImageGroups] = useState([]);

  useEffect(() => {
    const handleLoad = () => {
      if (document.readyState === 'complete') {
        setTimeout(() => setShowContent(true), 1000);
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(() => setShowContent(true), 1000);
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

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
        setImageGroups(splitImagesIntoGroups(featuredImages));
      }, 100),
    [splitImagesIntoGroups, featuredImages]
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
          {imageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="featured-images-column">
              {group.map((image, index) => (
                <div key={index} className="featured-image-item">
                  <Link to={`/collection/${image.linkedProject.collectionId}/projects/${image.linkedProject.id}`}>
                    <img 
                      src={`${image.fields.file.url}?w=550`} 
                      alt={image.fields.title || 'Featured image'} 
                      className="featured-image" 
                     
                    />
                    <div className="featured-image-subtitle">
                      {image.linkedProject.title}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CollectionList;