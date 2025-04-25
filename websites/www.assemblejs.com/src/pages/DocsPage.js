import React, { useEffect, useState, useRef } from 'react';
import DocsSidebar from '../components/docs/DocsSidebar';
import DocsContent from '../components/docs/DocsContent';
import { Helmet } from 'react-helmet';
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import './DocsPage.css';

const DocsPage = () => {
  const location = useLocation();
  const [tocItems, setTocItems] = useState([]);
  const [readTime, setReadTime] = useState('1 min read');
  // Mobile sidebar state removed
  const sidebarRef = useRef(null);

  // Effect to build table of contents from DOM headings
  useEffect(() => {
    const buildToc = () => {
      try {
        // Guard clause to ensure document is ready
        if (!document || !document.body) {
          console.log('Document not ready yet, skipping TOC building');
          return;
        }

        // Find all headings in the documentation content
        const mainContent = document.querySelector('.docs-content');
        if (!mainContent) return;

        const headings = mainContent.querySelectorAll('h1, h2, h3') || [];
        if (!headings.length) return;

        // Build TOC from headings
        const toc = Array.from(headings).map(heading => ({
          level: parseInt(heading.tagName.charAt(1)),
          text: heading.textContent,
          slug: heading.id || '', // Ensure we handle null ids gracefully
          element: heading // Keep reference to the original heading element
        }));

        // Calculate approximate read time
        const text = mainContent.textContent || '';
        const wordCount = text.trim().split(/\s+/).length;
        const minutes = Math.max(1, Math.ceil(wordCount / 200));

        setTocItems(toc);
        setReadTime(`${minutes} min read`);

        // Check if there's a hash in the URL and highlight the corresponding TOC item
        const hash = window.location.hash;
        if (hash) {
          const headingId = hash.slice(1); // Remove the # prefix
          highlightTocItem(headingId);
        } else if (toc.length > 0) {
          // Highlight the first TOC item by default
          highlightTocItem(toc[0].slug);
        }

        // Add copy buttons to code blocks if the function exists
        if (typeof window.addCopyButtonsToCodeBlocks === 'function') {
          window.addCopyButtonsToCodeBlocks();
        } else {
          // Directly inject copy buttons as a fallback
          const addCopyButtons = () => {
            try {
              console.log('Adding copy buttons directly from DocsPage');
              // Guard clause to ensure document is ready
              if (!document || !document.body) {
                console.log('Document not ready yet, skipping button addition');
                return;
              }

              const codeBlocks = document.querySelectorAll('pre') || [];
              console.log('Found', codeBlocks.length, 'code blocks');

              if (!codeBlocks.length) return;

              codeBlocks.forEach(codeBlock => {
                if (!codeBlock) return;
                // Skip if already has copy button
                if (codeBlock.querySelector('.copy-button')) return;

                // Create button element
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-button';
                copyButton.setAttribute('aria-label', 'Copy code to clipboard');
                copyButton.textContent = '';  // Keep empty, will be provided by CSS

                // Make sure code block has position relative
                codeBlock.style.position = 'relative';

                // Add click event
                copyButton.addEventListener('click', () => {
                  const code = codeBlock.querySelector('code');
                  if (!code) return;

                  // Copy to clipboard
                  navigator.clipboard.writeText(code.textContent || '')
                    .then(() => {
                      // Remove error class if it exists
                      copyButton.classList.remove('error');
                      // Add copied class
                      copyButton.classList.add('copied');

                      setTimeout(() => {
                        copyButton.classList.remove('copied');
                      }, 2000);
                    })
                    .catch(err => {
                      console.error('Copy failed:', err); // Error logging
                      // Remove copied class if it exists
                      copyButton.classList.remove('copied');
                      // Add error class
                      copyButton.classList.add('error');

                      setTimeout(() => {
                        copyButton.classList.remove('error');
                      }, 2000);
                    });
                });

                // Append button to code block
                codeBlock.appendChild(copyButton);
              });
            } catch (error) {
              console.error('Error adding copy buttons:', error);
            }
          };

          // Add buttons now and after a delay, but only if the component is still mounted
          const cleanup = [];
          // Run immediately
          addCopyButtons();

          // Schedule future runs with safe cleanup
          const timer1 = setTimeout(addCopyButtons, 500);
          cleanup.push(timer1);

          const timer2 = setTimeout(addCopyButtons, 1000);
          cleanup.push(timer2);

          // Add function to clean up timers
          return () => {
            cleanup.forEach(timerId => clearTimeout(timerId));
          };
        }
      } catch (error) {
        console.error('Error in buildToc function:', error);
      }
    };

    // Function to highlight TOC item
    const highlightTocItem = (headingId) => {
      try {
        if (!document || !document.body || !headingId) return;

        // Find the toc item and update active state
        const tocElement = document.querySelector(`.toc-item a[href="#${headingId}"]`);
        if (tocElement) {
          // Remove active class from all items
          const tocItems = document.querySelectorAll('.toc-item') || [];
          tocItems.forEach(el => {
            if (el) el.classList.remove('active');
          });

          // Add active class to current item
          tocElement.parentElement.classList.add('active');
        }
      } catch (error) {
        console.error('Error highlighting TOC item:', error);
      }
    };

    // Wait for content to load before building TOC (reduced timeout)
    const timer = setTimeout(buildToc, 750);

    // Listen for heading in view events from DocsContent
    const handleHeadingInView = (event) => {
      try {
        if (!event || !event.detail) return;
        const { headingId } = event.detail;
        if (headingId) highlightTocItem(headingId);
      } catch (error) {
        console.error('Error handling heading in view event:', error);
      }
    };

    document.addEventListener('headingInView', handleHeadingInView);

    // Add docs-page class to body
    document.body.classList.add('docs-page');

    // Add marked.js and highlight.js scripts if they don't exist
    if (!window.marked) {
      const markedScript = document.createElement('script');
      markedScript.src = 'https://cdn.jsdelivr.net/npm/marked@4.0.0/marked.min.js';
      markedScript.async = true;
      document.head.appendChild(markedScript);
    }

    if (!window.hljs) {
      // Load highlight.js as an ES module
      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = `
        import hljs from 'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/+esm';
        window.hljs = hljs;
      `;
      document.head.appendChild(script);

      // Load appropriate highlight.js theme based on site theme
      const isDarkTheme = document.body.getAttribute('data-theme') !== 'light';
      const themeName = isDarkTheme ? 'atom-one-dark' : 'atom-one-light';

      const highlightStyles = document.createElement('link');
      highlightStyles.id = 'highlight-theme-css';
      highlightStyles.rel = 'stylesheet';
      highlightStyles.href = `https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/${themeName}.min.css`;

      // Remove any existing highlight theme
      const existingTheme = document.getElementById('highlight-theme-css');
      if (existingTheme) {
        existingTheme.remove();
      }

      document.head.appendChild(highlightStyles);

      // Listen for theme changes to update highlight.js theme
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            const isDark = document.body.getAttribute('data-theme') !== 'light';
            const newThemeName = isDark ? 'atom-one-dark' : 'atom-one-light';
            const themeLink = document.getElementById('highlight-theme-css');

            if (themeLink) {
              themeLink.href = `https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/${newThemeName}.min.css`;
            }
          }
        });
      });

      observer.observe(document.body, { attributes: true });
    }

    return () => {
      clearTimeout(timer);
      document.body.classList.remove('docs-page');
      document.removeEventListener('headingInView', handleHeadingInView);
    };
  }, [location.pathname]);

  // Determine current page section for page title
  const getPageTitle = () => {
    const path = location.pathname.replace('/docs/', '');

    if (!path || path === '' || path === 'index') {
      return 'Documentation';
    }

    // Convert path to readable title
    const pathParts = path.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    const title = lastPart
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return `${title} | AssembleJS Docs`;
  };

  // Mobile toggle functionality removed

  // Current route path parameter is used for conditional rendering below

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content="AssembleJS documentation - learn how to build modern micro-frontend applications with component isolation, multi-framework support, and islands architecture." />
        <meta name="keywords" content="assemblejs, documentation, api, reference, micro-frontend, components, blueprints, islands architecture" />
      </Helmet>
      <div className="docs-container" role="main">
        <DocsSidebar ref={sidebarRef} />
        <Routes>
          <Route path="/" element={<Navigate to="/docs/index" replace />} />
          {/* Capture the entire path including nested segments */}
          <Route path="/:path/*" element={<DocsContent />} />
          <Route path="" element={<DocsContent />} />
        </Routes>
        {/* Table of Contents column */}
        <aside className="docs-toc" aria-labelledby="toc-heading">
          <div className="toc-container">
            <div className="toc-header">
              <h4 id="toc-heading">On this page</h4>
              <span className="read-time">{readTime}</span>
            </div>
            {location.pathname !== "/docs" && (
              <nav aria-label="Table of contents">
                <ul className="toc-list">
                  {tocItems.length > 0 ? (
                    tocItems.map((item, index) => (
                      <li
                        key={index}
                        className={`toc-item toc-level-${item.level}`}
                      >
                        <a
                          href={`#${item.slug}`}
                          onClick={(e) => {
                            e.preventDefault();

                            // Simply use regular hash navigation, but prevent default
                            // This allows the browser to handle the navigation
                            const targetId = item.slug;
                            const element = document.getElementById(targetId);

                            if (element) {
                              // Scroll to element with offset for header
                              window.scrollTo({
                                top: element.offsetTop - 120, // Match the offset in DocsContent.js
                                behavior: 'smooth'
                              });

                              // Update URL hash
                              window.location.hash = targetId;

                              // Update active class manually
                              document.querySelectorAll('.toc-item').forEach(el => {
                                el.classList.remove('active');
                              });
                              e.currentTarget.parentElement.classList.add('active');
                            }
                          }}
                        >
                          {item.text}
                        </a>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="toc-item toc-level-1">
                        <a href="#introduction">Introduction</a>
                      </li>
                      <li className="toc-item toc-level-2">
                        <a href="#getting-started">Getting Started</a>
                      </li>
                      <li className="toc-item toc-level-2">
                        <a href="#core-concepts">Core Concepts</a>
                      </li>
                    </>
                  )}
                </ul>
              </nav>
            )}
            <div className="docs-actions">
              <a
                href={`https://github.com/zjayers/assemblejs/edit/main/docs/${location.pathname.replace('/docs/', '')}.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="edit-page-link"
                aria-label="Edit this page on GitHub (opens in a new tab)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Edit this page
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default DocsPage;