import React, { useState, useCallback, useEffect, useRef } from 'react';
import { modalUrl } from '../utils/contentfulImage';
import '../styles/modal.css';

const Modal = ({
  isOpen,
  images = [],
  currentIndex = 0,
  title,
  subtitle,
  calculatedHeight,
  onClose,
  onNavigate,
}) => {
  const [loaded, setLoaded] = useState(false);
  const previousFocusRef = useRef(null);
  const modalRef = useRef(null);
  const touchStartX = useRef(null);

  const singleImage = typeof images === 'string';
  const imageList = singleImage ? [images] : images;
  const canNavigate = !singleImage && imageList.length > 1 && onNavigate;
  const currentImage = imageList[currentIndex] || '';

  useEffect(() => {
    setLoaded(false);
  }, [currentIndex, currentImage]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      requestAnimationFrame(() => modalRef.current?.focus());
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setLoaded(false);
    onClose();
  }, [onClose]);

  const handlePrev = useCallback(
    (e) => {
      e.stopPropagation();
      if (canNavigate && currentIndex > 0) onNavigate(currentIndex - 1);
    },
    [canNavigate, currentIndex, onNavigate]
  );

  const handleNext = useCallback(
    (e) => {
      e.stopPropagation();
      if (canNavigate && currentIndex < imageList.length - 1) onNavigate(currentIndex + 1);
    },
    [canNavigate, currentIndex, imageList.length, onNavigate]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (canNavigate && currentIndex > 0) onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (canNavigate && currentIndex < imageList.length - 1) onNavigate(currentIndex + 1);
      } else if (e.key === 'Tab') {
        e.preventDefault();
      }
    },
    [handleClose, canNavigate, currentIndex, imageList.length, onNavigate]
  );

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (touchStartX.current === null || !canNavigate) return;
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(delta) > 50) {
        if (delta < 0 && currentIndex < imageList.length - 1) {
          onNavigate(currentIndex + 1);
        } else if (delta > 0 && currentIndex > 0) {
          onNavigate(currentIndex - 1);
        }
      }
      touchStartX.current = null;
    },
    [canNavigate, currentIndex, imageList.length, onNavigate]
  );

  const handleImageLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  if (!isOpen) return null;

  const imgSrc = modalUrl(currentImage);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      tabIndex={-1}
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="modal-wrapper"
      style={{ height: `${calculatedHeight}px` }}
    >
      {canNavigate && (
        <span className="modal-counter">
          {currentIndex + 1} / {imageList.length}
        </span>
      )}

      {canNavigate && currentIndex > 0 && (
        <button
          className="modal-nav prev"
          onClick={handlePrev}
          aria-label="Previous image"
        >
          &#8249;
        </button>
      )}

      {canNavigate && currentIndex < imageList.length - 1 && (
        <button
          className="modal-nav next"
          onClick={handleNext}
          aria-label="Next image"
        >
          &#8250;
        </button>
      )}

      {loaded ? (
        <img
          src={imgSrc}
          width="80%"
          alt={title || `Image ${currentIndex + 1}`}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <span className="loader"></span>
          <img
            onLoad={handleImageLoaded}
            src={imgSrc}
            style={{ display: 'none' }}
            alt={title || `Image ${currentIndex + 1}`}
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
