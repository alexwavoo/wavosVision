import React, { useState, useCallback } from 'react';

const Modal = ({ isOpen, imageUrl, title, subtitle, calculatedHeight, onClose }) => {
  const [loaded, setLoaded] = useState(false);

  const handleClose = useCallback(() => {
    setLoaded(false);
    onClose();
  }, [onClose]);

  const handleImageLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      className="modal-wrapper"
      style={{ height: `${calculatedHeight}px` }}
    >
      {loaded ? (
        <img src={`${imageUrl}?w=2560`} width="80%" alt="Modal" />
      ) : (
        <>
          <span className="loader"></span>
          <img
            onLoad={handleImageLoaded}
            src={`${imageUrl}?w=2560`}
            style={{ display: 'none' }}
            alt="Modal"
          />
        </>
      )}
      {(title || subtitle) && (
        <div className="modal-text">
          {title && <div className="modal-title">{title}</div>}
          {subtitle && <div className="modal-subtitle">{subtitle}</div>}
        </div>
      )}
    </div>
  );
};

export default Modal;
