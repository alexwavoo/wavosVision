import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import InstagramIcon from './InstagramIcon';
import '../styles/footer.css';

const Footer = () => {
  const instagramUrl = 'https://www.instagram.com/alexwavo/';
  const footerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (footerRef.current) {
      footerRef.current.style.opacity = '0';
      footerRef.current.style.animation = 'none';
      void footerRef.current.offsetHeight;
      footerRef.current.style.animation = 'fadeIn 0.5s ease-in 0.3s forwards';
    }
  }, [location.pathname]);

  return (
    <footer ref={footerRef} className="site-footer">
      <Link to="/store" className="footer-store-link">
        Shop
      </Link>
      <a
        href={instagramUrl}
        className="footer-instagram-link"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <InstagramIcon />
      </a>
      <div className="footer-copyright">
        Alex Wavo | All Rights Reserved {new Date().getFullYear()}
      </div>
    </footer>
  );
};

export default Footer;
