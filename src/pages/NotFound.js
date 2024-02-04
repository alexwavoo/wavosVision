// NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', height: '100vh', display: 'grid', alignContent: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>404 - Not Found</h1>
      <p style={{ fontSize: '1.2rem', color: '#777', marginBottom: '30px' }}>
        Oops! The page you are looking for does not exist.
      </p>
      <Link to="/" style={{ fontSize: '1.2rem', color: '#3498db', textDecoration: 'none' }}>
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFound;
