import React, { useState, useEffect, useRef, useMemo, forwardRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const DocsSidebar = forwardRef(({ className = '' }, ref) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({});
  const location = useLocation();
  const localSidebarRef = useRef(null);

  // Use the forwarded ref or fallback to local ref
  const sidebarRef = ref || localSidebarRef;

  // Define the documentation structure - comprehensive API documentation inspired by Vue/React
  const docsStructure = useMemo(() => [
    {
      title: 'Introduction',
      items: [
        { name: 'Getting Started', path: 'index' },
        { name: 'Why AssembleJS', path: 'why-assemblejs' },
        { name: 'Quick Start', path: 'quick-start' },
      ]
    },
    {
      title: 'Core Concepts',
      items: [
        { name: 'Architecture Overview', path: 'core-concepts-architecture-overview' },
        { name: 'Blueprints', path: 'core-concepts-blueprints' },
        { name: 'Components', path: 'core-concepts-components' },
        { name: 'Factories', path: 'core-concepts-factories' },
        { name: 'Event System', path: 'core-concepts-event-system' },
        { name: 'Renderers', path: 'core-concepts-renderers' },
      ]
    },
    {
      title: 'Development',
      items: [
        { name: 'Project Setup', path: 'development-setup' },
        { name: 'Development Workflow', path: 'development-workflow' },
        { name: 'Deployment', path: 'deployment-guide' },
      ]
    },
    {
      title: 'CLI Reference',
      items: [
        { name: 'CLI Overview', path: 'cli-guide' },
        { name: 'asm (Generator)', path: 'cli/asmgen' },
        { name: 'asm-build (Build)', path: 'cli/asm-build' },
        { name: 'asm-serve (Development)', path: 'cli/asm-serve' },
        { name: 'specsheet (Analysis)', path: 'cli/asm-insights' },
        { name: 'redline (Code Quality)', path: 'redline-code-quality-tool' },
        { name: 'rivet (Deployment)', path: 'rivet-deployment-system' },
      ]
    },
    {
      title: 'Cookbook',
      items: [
        { name: 'Advanced Routing', path: 'cookbook/routing' },
        { name: 'API Integration', path: 'cookbook/api-integration' },
        { name: 'Authentication Flow', path: 'cookbook/authentication' },
        { name: 'Caching Strategies', path: 'cookbook/caching' },
        { name: 'Data Tables & Grids', path: 'cookbook/data-tables' },
        { name: 'Data Visualization', path: 'cookbook/data-viz' },
        { name: 'Drag & Drop Interfaces', path: 'cookbook/drag-drop' },
        { name: 'File Upload & Processing', path: 'cookbook/file-upload' },
        { name: 'Form Handling', path: 'cookbook/forms' },
        { name: 'Infinite Scrolling', path: 'cookbook/infinite-scroll' },
        { name: 'Multi-language Support', path: 'cookbook/i18n' },
        { name: 'Multi-step Wizards', path: 'cookbook/wizards' },
        { name: 'Performance Profiling', path: 'cookbook/performance' },
        { name: 'Product Listings', path: 'tutorials/storefront' },
        { name: 'Real-time Updates', path: 'cookbook/real-time' },
        { name: 'Responsive Layouts', path: 'cookbook/responsive' },
        { name: 'Search & Filtering', path: 'cookbook/search' },
        { name: 'State Management', path: 'cookbook/state-management' },
        { name: 'User Notifications', path: 'cookbook/notifications' },
        { name: 'User Permissions & RBAC', path: 'cookbook/permissions' }
      ]
    },
    {
      title: 'UI Frameworks',
      items: [
        { name: 'HTML & Templates', path: 'frameworks/html-templates' },
        { name: 'Preact Integration', path: 'frameworks/preact' },
        { name: 'React Integration', path: 'frameworks/react' },
        { name: 'Vue Integration', path: 'frameworks/vue' },
        { name: 'Svelte Integration', path: 'frameworks/svelte' },
        { name: 'Web Components', path: 'frameworks/web-components' },
      ]
    },
    {
      title: 'Migration Guides',
      items: [
        { name: 'From React', path: 'migration/react' },
        { name: 'From Vue', path: 'migration/vue' },
        { name: 'From Angular', path: 'migration/angular' },
        { name: 'From Svelte', path: 'migration/svelte' },
        { name: 'From Next.js', path: 'migration/nextjs' },
        { name: 'From Nuxt.js', path: 'migration/nuxtjs' },
      ]
    },
    {
      title: 'Advanced Topics',
      items: [
        { name: 'Islands Architecture', path: 'advanced-islands-architecture' },
        { name: 'Server-Side Rendering', path: 'advanced-server-side-rendering' },
        { name: 'Component Lifecycle', path: 'advanced-component-lifecycle' },
        { name: 'Cross-Framework State', path: 'advanced-cross-framework-state' },
        { name: 'Security Best Practices', path: 'advanced-security' },
      ]
    },
    {
      title: 'API Documentation',
      items: [
        { name: 'API Reference', path: 'api-global' },
        { name: 'Core Classes', path: 'classes-Blueprint' },
        { name: 'Core Functions', path: 'functions-createBlueprintServer' },
        { name: 'Interfaces', path: 'interfaces-Assembly' },
        { name: 'Type Definitions', path: 'types-ApiReply' },
        { name: 'Exports', path: 'variables-events' },
      ]
    },
    {
      title: 'A.R.L.O.',
      items: [
        { name: 'Introduction to A.R.L.O.', path: 'arlo/introduction' },
        { name: 'Getting Started with A.R.L.O.', path: 'arlo/getting-started' },
        { name: 'A.R.L.O. Architecture', path: 'arlo/architecture' },
        { name: 'A.R.L.O. Workflow', path: 'arlo/workflow' },
        { name: 'A.R.L.O. Agents', path: 'arlo/agents' },
      ]
    },
    {
      title: 'Help & Resources',
      items: [
        { name: 'Troubleshooting', path: 'troubleshooting' },
        { name: 'Development Roadmap', path: 'development-roadmap' },
        { name: 'Contributing', path: 'contributing-to-assemblejs' },
        { name: 'FAQ', path: 'frequently-asked-questions' },
        { name: 'Philosophy', path: 'the-assemblejs-philosophy' },
      ]
    }
  ], []);

  // Initially expand the section of the current page
  useEffect(() => {
    const currentPath = location.pathname.replace('/docs/', '');
    // Handle empty path as 'index'
    const normalizedCurrentPath = currentPath === '' ? 'index' : currentPath;
    const initialExpandedSections = {};

    docsStructure.forEach((section, index) => {
      const hasActiveItem = section.items.some(item =>
        normalizedCurrentPath === item.path || normalizedCurrentPath.startsWith(item.path + '/')
      );

      if (hasActiveItem) {
        initialExpandedSections[index] = true;
      }
    });

    setExpandedSections(initialExpandedSections);
  }, [location.pathname, docsStructure]);

  // Mobile functionality removed

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
    <aside
      id={sidebarId}
      className={`docs-sidebar ${className}`}
      ref={sidebarRef}
      aria-label="Documentation navigation"
    >
      <div className="sidebar-inner">
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
            placeholder="Search Documentation"
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
                        // Handle empty path as 'index'
                        const normalizedCurrentPath = currentPath === '' ? 'index' : currentPath;
                        const isActive = normalizedCurrentPath === item.path ||
                          normalizedCurrentPath.startsWith(item.path + '/');

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
      </div>
    </aside>
  );
});

export default DocsSidebar;