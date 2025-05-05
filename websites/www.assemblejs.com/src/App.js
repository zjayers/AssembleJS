import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import DocsPage from './pages/DocsPage';
import ShowcasePage from './pages/ShowcasePage';
import ArloPage from './pages/ArloPage';
import NotFoundPage from './pages/NotFoundPage';
import Chatbot from './components/common/Chatbot';
import './App.css';

// Import documentation styles
import './pages/DocsPage.css';

function App() {
  const location = useLocation();
  
  // Scroll to top on route change, but preserve anchor navigation
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <>
      <Helmet>
        <html lang="en" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF5A00" />
      </Helmet>
      
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs/*" element={<DocsPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/arlo" element={<ArloPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
      
      {/* Global Chatbot component fixed to the bottom left of all pages */}
      <Chatbot />
    </>
  );
}

export default App;