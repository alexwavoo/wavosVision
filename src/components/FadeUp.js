import React, { useRef, useEffect, useState } from 'react';
import './fade.css'; // CSS file for animation styles

export default function FadeUp({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  const handleScroll = () => {
    if (ref.current) {
      const top = ref.current.getBoundingClientRect().top;
      const isVisible = top < window.innerHeight;
      setIsVisible(isVisible);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div ref={ref} className={`fade-up ${isVisible ? 'is-visible' : ''}`}>
      {children}
    </div>
  );
}