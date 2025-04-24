import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DocumentationLoader from './DocumentationLoader';

const DocsContent = () => {
  const { path, '*': remainingPath } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  
  // Combine path segments for complete path
  const fullPath = useMemo(() => {
    if (!path) return '';
    return remainingPath ? `${path}/${remainingPath}` : path;
  }, [path, remainingPath]);
  
  // Redirect to index if no path
  useEffect(() => {
    if (!fullPath) {
      navigate('/docs/index', { replace: true });
    }
    
    // Path will be used for navigation logic
  }, [fullPath, navigate]);
  
  // Handle anchor link clicks for smooth scrolling
  useEffect(() => {
    if (!contentRef.current) return;
    
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (!target) return;
      
      const href = target.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      
      e.preventDefault();
      const targetId = href.slice(1);
      scrollToHeading(targetId);
    };
    
    // Handle initial hash in URL
    const initialHash = window.location.hash;
    if (initialHash) {
      const targetId = initialHash.slice(1);
      setTimeout(() => {
        scrollToHeading(targetId);
      }, 100);
    }
    
    // Add event listener for smooth scrolling
    contentRef.current.addEventListener('click', handleAnchorClick);
    
    // Save contentRef.current to a variable for the cleanup function
    const currentContentRef = contentRef.current;
    return () => {
      if (currentContentRef) {
        currentContentRef.removeEventListener('click', handleAnchorClick);
      }
    };
  }, []);
  
  // Scroll to heading when clicked from TOC
  const scrollToHeading = (slug) => {
    const element = document.getElementById(slug);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120,
        behavior: 'smooth'
      });
    }
  };
  
  // Set up intersection observer to update URL hash
  useEffect(() => {
    // Small delay to allow the new document to render
    const timer = setTimeout(() => {
      if (!contentRef.current) return;
      
      // Observe headings to update URL hash
      const headingElements = contentRef.current.querySelectorAll('h1, h2, h3');
      
      // Generate proper heading IDs based on text content
      headingElements.forEach((heading, index) => {
        if (!heading.id) {
          const text = heading.textContent || `heading-${index}`;
          // Create slug from heading text (lowercase, hyphens for spaces, no special chars)
          const slug = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          heading.id = slug || `heading-${index}`;
        }
      });
      
      // Set up intersection observer for headings
      const observer = new IntersectionObserver(
        (entries) => {
          // Find the topmost visible heading
          const visibleEntries = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => {
              const aRect = a.boundingClientRect;
              const bRect = b.boundingClientRect;
              return aRect.top - bRect.top;
            });
          
          // Get the first visible heading (closest to the top)
          if (visibleEntries.length > 0) {
            const entry = visibleEntries[0];
            const headingId = entry.target.id;
            
            if (headingId) {
              // Update URL hash without scrolling
              const url = new URL(window.location);
              url.hash = headingId;
              window.history.replaceState({}, '', url);
              
              // Dispatch an event to notify the parent about the active heading
              const event = new CustomEvent('headingInView', { 
                detail: { headingId }
              });
              document.dispatchEvent(event);
            }
          }
        },
        {
          rootMargin: '-80px 0px -80% 0px', // Adjusted to better detect headings at top
          threshold: [0, 0.1, 0.5] // Multiple thresholds for better detection
        }
      );
      
      // Observe all headings
      headingElements.forEach(element => {
        observer.observe(element);
      });
      
      return () => {
        headingElements.forEach(element => {
          observer.unobserve(element);
        });
      };
    }, 750); // Reduced timeout for faster content loading
    
    return () => clearTimeout(timer);
  }, [fullPath]);
  
  // Update page title when content changes
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Get the first heading as the page title
    const firstHeading = contentRef.current.querySelector('h1');
    
    if (firstHeading) {
      document.title = `${firstHeading.textContent} | AssembleJS Docs`;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Check if the current page is an API reference page
  const isApiPage = useMemo(() => {
    if (!fullPath) return false;
    return fullPath.startsWith('classes/') || 
           fullPath.startsWith('interfaces/') || 
           fullPath.startsWith('types/') || 
           fullPath.startsWith('functions/') || 
           fullPath.startsWith('variables/') ||
           fullPath.startsWith('api/');
  }, [fullPath]);
  
  // Loading state flag for UI
  const [isLoading, setIsLoading] = useState(true);
  
  // Reset loading state when path changes
  useEffect(() => {
    setIsLoading(true);
    // Wait for documentationLoader to finish
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [fullPath]);
  
  return (
    <div className="docs-content-wrapper">
      <article className="docs-content markdown-content" ref={contentRef} aria-busy={isLoading}>
        <div className="docs-content-inner">
          <div className="docs-page-header">
            {isApiPage && (
              <div className="api-tag">
                <span className="api-badge" title="API Reference">API</span>
              </div>
            )}
          </div>
          <DocumentationLoader path={fullPath} />
        </div>
        
        {!isLoading && (
          <div className="docs-footer">
            <div className="docs-feedback">
              <p>Was this page helpful?</p>
              {!feedbackSubmitted ? (
                <div className="feedback-buttons">
                  <button 
                    onClick={() => {
                      setFeedbackSubmitted(true);
                      setFeedbackType('positive');
                      // Here you would typically send the feedback to your backend
                      setTimeout(() => setFeedbackSubmitted(false), 3000);
                    }} 
                    aria-label="This documentation was helpful"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                    Yes
                  </button>
                  <button 
                    onClick={() => {
                      setFeedbackSubmitted(true);
                      setFeedbackType('negative');
                      // Here you would typically send the feedback to your backend
                      setTimeout(() => setFeedbackSubmitted(false), 3000);
                    }} 
                    aria-label="This documentation was not helpful"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                    </svg>
                    No
                  </button>
                </div>
              ) : (
                <div className="feedback-thank-you">
                  <p>Thank you for your feedback!</p>
                </div>
              )}
            </div>
            
            <div className="docs-navigation">
              <button className="nav-button prev" onClick={() => navigate('/docs/index')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Previous
              </button>
              <button className="nav-button next" onClick={() => navigate('/docs/quick-start')}>
                Next
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default DocsContent;