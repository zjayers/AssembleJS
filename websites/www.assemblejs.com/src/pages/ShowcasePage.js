import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import './ShowcasePage.css';

const ShowcasePage = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Initialize the floating elements animation
    const container = containerRef.current;
    if (!container) return;

    const floatingElements = container.querySelectorAll('.floating-element');
    
    floatingElements.forEach(element => {
      // Random starting position
      const startX = Math.random() * 40 - 20; // -20 to 20
      const startY = Math.random() * 40 - 20; // -20 to 20
      
      // Set initial position
      element.style.transform = `translate(${startX}px, ${startY}px)`;
      
      // Generate random animation properties
      const duration = 15 + Math.random() * 10; // 15-25s
      const delay = Math.random() * 5; // 0-5s
      
      // Apply animation
      element.style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;
    });
    
    // Clean up animation frames on unmount
    return () => {
      floatingElements.forEach(element => {
        element.style.animation = 'none';
      });
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Showcase | AssembleJS</title>
        <meta name="description" content="Browse examples built with AssembleJS." />
      </Helmet>
      <div className="container">
        <main className="showcase coming-soon" role="main" ref={containerRef}>
          {/* Background decorative elements */}
          <div className="background-decoration">
            <div className="floating-element grid-lines grid-lines-1"></div>
            <div className="floating-element grid-lines grid-lines-2"></div>
            <div className="floating-element shape shape-square"></div>
            <div className="floating-element shape shape-circle"></div>
            <div className="floating-element shape shape-triangle"></div>
          </div>
          
          <div className="showcase-coming-soon">
            <div className="showcase-header">
              <div className="showcase-header-content">
                <h2>Showcase Gallery</h2>
                
                <p className="lead-text">
                  We're building a collection of impressive projects and applications created with AssembleJS.
                </p>
                
                <p>
                  Our showcase section is under construction. Soon, you'll be able to browse real-world examples 
                  of how companies and developers are using AssembleJS to build innovative web experiences.
                </p>
              </div>
              
              <div className="coming-soon-illustration">
                <div className="devices-container">
                  <div className="device desktop">
                    <div className="device-screen">
                      <div className="screen-content">
                        <div className="screen-header"></div>
                        <div className="screen-body">
                          <div className="screen-block"></div>
                          <div className="screen-block"></div>
                        </div>
                      </div>
                    </div>
                    <div className="device-stand"></div>
                  </div>
                  
                  
                  <div className="device mobile">
                    <div className="device-screen">
                      <div className="screen-content">
                        <div className="screen-header"></div>
                        <div className="screen-body">
                          <div className="screen-block"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="floating-code-blocks">
                    <div className="code-block-mini code-block-1">
                      <div className="code-header-mini"></div>
                      <div className="code-lines">
                        <div className="code-line"></div>
                        <div className="code-line"></div>
                        <div className="code-line"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="features-preview">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <h3>Featured Projects</h3>
                <p>Browse top-notch projects built with AssembleJS</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <h3>Code Examples</h3>
                <p>Explore real-world code implementations</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </div>
                <h3>Starter Templates</h3>
                <p>Jump-start your project with ready-to-use templates</p>
              </div>
            </div>
          </div>
          
        </main>
      </div>
    </>
  );
};

export default ShowcasePage;