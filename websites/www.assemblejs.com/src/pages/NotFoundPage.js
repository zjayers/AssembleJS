import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | AssembleJS</title>
        <meta name="description" content="The requested page was not found." />
      </Helmet>
      <div className="container">
        <main className="error-page" role="main">
          <h1 id="error-title">404</h1>
          <h2 id="error-subtitle">Page Not Found</h2>
          <p>The page you are looking for doesn't exist or has been moved.</p>
          <div className="error-actions" role="navigation" aria-label="Error page navigation">
            <Link to="/" className="btn btn-primary" aria-describedby="error-title error-subtitle">Go Home</Link>
            <Link to="/docs" className="btn btn-secondary" aria-describedby="error-title error-subtitle">Documentation</Link>
          </div>
        </main>
      </div>
    </>
  );
};

export default NotFoundPage;