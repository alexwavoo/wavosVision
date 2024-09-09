import React, { useEffect, useState, useMemo } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';

const CollectionList = ({ calculatedHeight, collections, featuredImages }) => {
  const [showContent, setShowContent] = useState(false);
  const [imageGroups, setImageGroups] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 2000);
    return () => clearTimeout(timer);
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

  if (!showContent) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: `${calculatedHeight}px` }}>
        <div className="title">WAVO'S VISION</div>
      </div>
    );
  }

  return (
    <>
      <div className="collection-wrapper">
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
                      src={`${image.fields.file.url}?w=650`} 
                      alt={image.fields.title || 'Featured image'} 
                      className="featured-image" 
                      loading="lazy"
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
