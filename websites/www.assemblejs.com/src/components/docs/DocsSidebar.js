import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const DocsSidebar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({});
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef(null);
  
  // Define the documentation structure - based on docs/index.md table of contents
  const docsStructure = [
    {
      title: 'Getting Started',
      icon: '🚀',
      items: [
        { name: 'Introduction', path: 'index' },
        { name: 'Architecture Overview', path: 'architecture-overview' },
        { name: 'Core Concepts', path: 'core-concepts' },
      ]
    },
    {
      title: 'Guides',
      icon: '📚',
      items: [
        { name: 'Development Setup', path: 'development-setup' },
        { name: 'Development Workflow', path: 'development-workflow' },
        { name: 'CLI Guide', path: 'cli-guide' },
        { name: 'Best Practices', path: 'best-practices' },
      ]
    },
    {
      title: 'Reference',
      icon: '📖',
      items: [
        { name: 'Components Reference', path: 'components-reference' },
        { name: 'Technical Implementation', path: 'technical-implementation' },
        { name: 'Detailed Architecture', path: 'detailed-architecture' },
      ]
    },
    {
      title: 'Enterprise Tools',
      icon: '🔧',
      items: [
        { name: 'REDLINE: Code Quality', path: 'redline-code-quality-tool' },
        { name: 'RIVET: Deployment System', path: 'rivet-deployment-system' },
        { name: 'Website Deployment', path: 'website-deployment' },
      ]
    },
    {
      title: 'Classes',
      icon: '🧩',
      items: [
        { name: 'Blueprint', path: 'classes/Blueprint' },
        { name: 'BlueprintClient', path: 'classes/BlueprintClient' },
        { name: 'BlueprintController', path: 'classes/BlueprintController' },
        { name: 'EventBus', path: 'classes/EventBus' },
        { name: 'Service', path: 'classes/Service' },
      ]
    },
    {
      title: 'Functions',
      icon: '⚙️',
      items: [
        { name: 'createBlueprintServer', path: 'functions/createBlueprintServer' },
        { name: 'http', path: 'functions/http' },
      ]
    },
    {
      title: 'Interfaces',
      icon: '🔄',
      items: [
        { name: 'Assembly', path: 'interfaces/Assembly' },
        { name: 'BlueprintClientRegistry', path: 'interfaces/BlueprintClientRegistry' },
        { name: 'BlueprintEvent', path: 'interfaces/BlueprintEvent' },
        { name: 'BlueprintInstance', path: 'interfaces/BlueprintInstance' },
        { name: 'BlueprintServerManifest', path: 'interfaces/BlueprintServerManifest' },
        { name: 'Component', path: 'interfaces/Component' },
        { name: 'PreactViewContext', path: 'interfaces/PreactViewContext' },
        { name: 'ViewContext', path: 'interfaces/ViewContext' },
      ]
    },
    {
      title: 'Types',
      icon: '📝',
      items: [
        { name: 'ApiReply', path: 'types/ApiReply' },
        { name: 'ApiRequest', path: 'types/ApiRequest' },
        { name: 'ComponentFactory', path: 'types/ComponentFactory' },
        { name: 'EventAddress', path: 'types/EventAddress' },
        { name: 'ServerContext', path: 'types/ServerContext' },
      ]
    },
    {
      title: 'Variables',
      icon: '🔠',
      items: [
        { name: 'events', path: 'variables/events' },
        { name: 'hooks', path: 'variables/hooks' },
        { name: 'preact', path: 'variables/preact' },
        { name: 'utils', path: 'variables/utils' },
      ]
    },
    {
      title: 'Help & Information',
      icon: '❓',
      items: [
        { name: 'Troubleshooting', path: 'troubleshooting' },
        { name: 'Development Roadmap', path: 'development-roadmap' },
        { name: 'Contributing', path: 'contributing-to-assemblejs' },
        { name: 'FAQ', path: 'frequently-asked-questions' },
        { name: 'Philosophy', path: 'the-assemblejs-philosophy' },
      ]
    }
  ];

  // Initially expand the section of the current page
  useEffect(() => {
    const currentPath = location.pathname.replace('/docs/', '');
    const initialExpandedSections = {};
    
    docsStructure.forEach((section, index) => {
      const hasActiveItem = section.items.some(item => 
        currentPath === item.path || currentPath.startsWith(item.path + '/')
      );
      
      if (hasActiveItem) {
        initialExpandedSections[index] = true;
      }
    });
    
    setExpandedSections(initialExpandedSections);
  }, [location.pathname]);
  
  // Reset mobile sidebar visibility on navigation
  useEffect(() => {
    setShowMobileSidebar(false);
  }, [location.pathname]);

  // Close sidebar with escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showMobileSidebar) {
        setShowMobileSidebar(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showMobileSidebar]);

  // Trap focus inside mobile sidebar when open
  useEffect(() => {
    if (showMobileSidebar && sidebarRef.current) {
      // Find all focusable elements in sidebar
      const focusableElements = sidebarRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            // If shift + tab and on first element, move to last element
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // If tab and on last element, move to first element
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      // Focus the first element when opened
      if (firstElement) {
        setTimeout(() => firstElement.focus(), 100);
      }
      
      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [showMobileSidebar]);
  
  // Filter items based on search term
  const filteredStructure = docsStructure.map(section => {
    const filteredItems = section.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return {
      ...section,
      items: filteredItems,
      hasMatches: filteredItems.length > 0
    };
  }).filter(section => searchTerm === "" || section.hasMatches);
  
  // Toggle a section's expanded state
  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Generate unique IDs for ARIA
  const sidebarId = "docs-sidebar";
  const searchId = "docs-search";

  return (
    <>
      <div className="docs-sidebar-mobile-toggle">
        <button 
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          aria-expanded={showMobileSidebar}
          aria-controls={sidebarId}
        >
          {showMobileSidebar ? 'Hide Menu' : 'Show Documentation Menu'}
        </button>
      </div>
      
      <aside 
        id={sidebarId}
        className={`docs-sidebar ${showMobileSidebar ? 'mobile-visible' : ''}`}
        ref={sidebarRef}
        aria-label="Documentation navigation"
      >
        {/* Close button for mobile - only shown when sidebar is visible */}
        {showMobileSidebar && (
          <button 
            className="close-sidebar-button"
            onClick={() => setShowMobileSidebar(false)}
            aria-label="Close documentation menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span className="sr-only">Close</span>
          </button>
        )}
        
        <div className="docs-search" role="search">
          <label htmlFor={searchId} className="sr-only">Search documentation</label>
          <svg 
            className="search-icon" 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            id={searchId}
            type="text" 
            placeholder="Search documentation..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search documentation"
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <span aria-hidden="true">×</span>
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>
      
        <nav className="docs-nav" aria-label="Documentation sections">
          {filteredStructure.map((section, sectionIndex) => {
            const isExpanded = expandedSections[sectionIndex] || searchTerm !== "";
            const sectionId = `section-${section.title.toLowerCase().replace(/\s+/g, '-')}`;
            const headingId = `heading-${sectionId}`;
            const contentId = `content-${sectionId}`;
            
            return (
              <div className="docs-nav-section" key={sectionIndex}>
                <h3 
                  id={headingId}
                  className={isExpanded ? "expanded" : ""}
                  onClick={() => toggleSection(sectionIndex)}
                  aria-expanded={isExpanded}
                  aria-controls={contentId}
                  tabIndex="0" // Make heading keyboard-focusable
                  role="button"
                  onKeyDown={(e) => {
                    // Toggle on Enter or Space
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSection(sectionIndex);
                    }
                  }}
                >
                  <div className="section-header">
                    {section.icon && (
                      <span className="section-icon" aria-hidden="true">
                        {section.icon}
                      </span>
                    )}
                    <span className="section-title">{section.title}</span>
                  </div>
                  <svg 
                    className="expand-icon" 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points={isExpanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}></polyline>
                  </svg>
                </h3>
                <div 
                  id={contentId}
                  className={isExpanded ? "doc-section-content expanded" : "doc-section-content"}
                  aria-labelledby={headingId}
                  hidden={!isExpanded}
                >
                  {isExpanded && (
                    <ul>
                      {section.items.map((item, itemIndex) => {
                        const currentPath = location.pathname.replace('/docs/', '');
                        const isActive = currentPath === item.path || 
                                      currentPath.startsWith(item.path + '/');
                        
                        return (
                          <li key={itemIndex}>
                            <NavLink 
                              to={`/docs/${item.path}`}
                              className={({ isActive: navActive }) => navActive ? 'active' : ''}
                              aria-current={isActive ? 'page' : undefined}
                            >
                              {item.name}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </nav>
        
        {searchTerm === "" && (
          <div className="docs-sidebar-footer">
            <a 
              href="https://github.com/zjayers/assemblejs" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="github-link"
              aria-label="AssembleJS on GitHub (opens in a new tab)"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77A5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              GitHub
            </a>
            <span className="docs-version" aria-label="AssembleJS version 1.0.0">
              v1.0.0
            </span>
          </div>
        )}
      </aside>
      
      {/* Overlay for mobile sidebar */}
      {showMobileSidebar && (
        <div 
          className="sidebar-overlay"
          onClick={() => setShowMobileSidebar(false)}
          aria-hidden="true"
          tabIndex="-1"
        />
      )}
    </>
  );
};

export default DocsSidebar;