import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Hamburger from 'hamburger-react';
import InstagramIcon from './InstagramIcon';
import { getStoreUrl } from '../config/externalUrls';
import '../styles/header.css';

const Header = ({ collections }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hamburgerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const instagramUrl = 'https://www.instagram.com/alexwavo/';

  return (
    <header className="site-header">
      <div className="header-top-row">
        <NavLink to="/" className="header-logo">
          <img src="/stars.png" alt="Wavo's Vision Logo" />
        </NavLink>

        <a
          href={instagramUrl}
          className="header-instagram desktop-only"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <InstagramIcon size={18} />
        </a>

        <button
          ref={hamburgerRef}
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <Hamburger
            toggled={isMobileMenuOpen}
            size={24}
            color="var(--text-color)"
          />
        </button>
      </div>

      <div className="header-nav-row desktop-only">
        <nav className="header-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            FEATURED WORK
          </NavLink>
          {collections && collections.map(({ sys, title }) => (
            <NavLink
              key={sys.id}
              to={`/collection/${sys.id}/projects`}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {title}
            </NavLink>
          ))}
          <a
            href={getStoreUrl()}
            className="nav-link header-store-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            SHOP
          </a>
        </nav>
      </div>

      <div
        ref={dropdownRef}
        className={`mobile-dropdown mobile-only ${isMobileMenuOpen ? 'open' : ''}`}
      >
        <nav className="mobile-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          >
            FEATURED WORK
          </NavLink>
          {collections && collections.map(({ sys, title }) => (
            <NavLink
              key={sys.id}
              to={`/collection/${sys.id}/projects`}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            >
              {title}
            </NavLink>
          ))}
          <a
            href={getStoreUrl()}
            className="mobile-nav-link header-store-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            SHOP
          </a>
          <a
            href={instagramUrl}
            className="mobile-nav-link mobile-instagram-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            style={{
              alignSelf: 'center',
              width: '18px',
              padding: '1rem 0 0',
            }}
          >
            <InstagramIcon size={18} />
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
