import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', height: '100vh', display: 'grid', alignContent: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Something went wrong</h1>
          <p style={{ fontSize: '1.2rem', color: '#777', marginBottom: '30px' }}>
            We're sorry — an unexpected error occurred.
          </p>
          <Link to="/" style={{ fontSize: '1.2rem', color: '#3498db', textDecoration: 'none' }}
            onClick={() => this.setState({ hasError: false })}
          >
            Go back to Home
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
