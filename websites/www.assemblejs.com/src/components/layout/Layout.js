import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

// Background shapes component for visual interest
const BackgroundShapes = () => (
  <div className="abstract-shapes" aria-hidden="true">
    <div className="shape shape-1"></div>
    <div className="shape shape-2"></div>
    <div className="shape shape-3"></div>
    <div className="shape shape-4"></div>
    <div className="shape shape-5"></div>
    <div className="shape shape-6"></div>
  </div>
);

const Layout = ({ children }) => {
  const location = useLocation();
  const isDocsPage = location.pathname.includes('/docs');
  const isArloPage = location.pathname.includes('/arlo');
  const isShowcasePage = location.pathname.includes('/showcase');
  
  // Ensure consistent background styling for all pages
  useEffect(() => {
    // Apply consistent background for all page types
    document.body.style.backgroundColor = 'var(--bg)';
    document.body.classList.toggle('docs-page', isDocsPage);
    document.body.classList.toggle('showcase-page', isShowcasePage);
    
    return () => {
      document.body.classList.remove('docs-page', 'arlo-page', 'showcase-page');
    };
  }, [isDocsPage, isArloPage, isShowcasePage]);
  
  // Add parallax effect on mouse move - reduce motion for accessibility
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Only apply parallax if reduced motion is not preferred
    if (!prefersReducedMotion) {
      const handleMouseMove = (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        document.documentElement.style.setProperty('--parallax-x', `${x * 10}px`);
        document.documentElement.style.setProperty('--parallax-y', `${y * 10}px`);
        document.documentElement.style.setProperty('--parallax-reverse-x', `${-x * 10}px`);
        document.documentElement.style.setProperty('--parallax-reverse-y', `${-y * 10}px`);
      };

      document.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
      };
    } else {
      // Reset parallax variables for reduced motion preference
      document.documentElement.style.setProperty('--parallax-x', '0px');
      document.documentElement.style.setProperty('--parallax-y', '0px');
      document.documentElement.style.setProperty('--parallax-reverse-x', '0px');
      document.documentElement.style.setProperty('--parallax-reverse-y', '0px');
    }
  }, []);

  return (
    <div className={`layout ${isDocsPage ? 'docs-layout' : ''} ${isArloPage ? 'arlo-layout' : ''} ${isShowcasePage ? 'showcase-layout' : ''}`}>
      <BackgroundShapes />
      <Header isDocsPage={isDocsPage} />
      <main id="main-content" role="main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;