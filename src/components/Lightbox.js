import React from 'react';

const Lightbox = ({ imageUrl, onClose }) => {
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-container">
        <img src={imageUrl} alt="Enlarged Image" />
      </div>
    </div>
  );
};

export default Lightbox;
