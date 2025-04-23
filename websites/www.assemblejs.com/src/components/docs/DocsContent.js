import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DocsContent = () => {
  const { path } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [tableOfContents, setTableOfContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);
  const [activeHeading, setActiveHeading] = useState('');
  
  useEffect(() => {
    const loadContent = async () => {
      if (!path) {
        navigate('/docs/index', { replace: true });
        return;
      }
      
      setIsLoading(true);
      try {
        // Construct the URL to the markdown file
        const markdownPath = `/docs/${path}.md`;
        const response = await fetch(markdownPath);
        
        if (!response.ok) {
          throw new Error(`Failed to load documentation: ${response.status} ${response.statusText}`);
        }
        
        const markdown = await response.text();
        setContent(markdown);
        setError(null);
      } catch (err) {
        console.error('Error loading documentation:', err);
        setError('Failed to load documentation content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, [path, navigate]);
  
  // Parse headings to generate a table of contents
  useEffect(() => {
    if (!content) return;
    
    // Use regex to extract all headings
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const matches = [...content.matchAll(headingRegex)];
    
    // Build table of contents with level and slug
    const toc = matches.map(match => {
      const level = match[1].length;
      const text = match[2].trim();
      const slug = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
        
      return { level, text, slug };
    });
    
    // Only include headings 1-3 level
    const filteredToc = toc.filter(heading => heading.level <= 3);
    setTableOfContents(filteredToc);
  }, [content]);
  
  // Add intersection observer to highlight active heading
  useEffect(() => {
    if (isLoading || !contentRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const headingId = entry.target.id;
            if (headingId) {
              setActiveHeading(headingId);
              
              // Update URL hash without scrolling
              const url = new URL(window.location);
              url.hash = headingId;
              window.history.replaceState({}, '', url);
            }
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
        threshold: 0
      }
    );
    
    // Observe all headings
    const headingElements = contentRef.current.querySelectorAll('h1, h2, h3');
    headingElements.forEach(element => {
      observer.observe(element);
    });
    
    return () => {
      headingElements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, [isLoading, content]);
  
  // Handle anchor link clicks for smooth scrolling
  useEffect(() => {
    if (isLoading || !contentRef.current) return;
    
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[data-smooth-scroll]');
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
  }, [isLoading, content]);
  
  // Function to render markdown with syntax highlighting and heading IDs
  const renderMarkdown = () => {
    if (!content) return { __html: '' };
    
    // Add custom renderer to add IDs to headings and enhance links
    const renderer = new window.marked.Renderer();
    
    // Add IDs to headings with proper ARIA
    renderer.heading = function(text, level) {
      const slug = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      
      return `<h${level} id="${slug}">${text}</h${level}>`;
    };
    
    // Enhance links to support smooth scrolling for anchor links with proper accessibility
    renderer.link = function(href, title, text) {
      const isAnchor = href.startsWith('#');
      const attributes = [];
      
      if (title) {
        attributes.push(`title="${title}"`);
      }
      
      if (isAnchor) {
        return `<a href="${href}" ${attributes.join(' ')} class="anchor-link" data-smooth-scroll>${text}</a>`;
      } else if (href.startsWith('http')) {
        return `<a href="${href}" ${attributes.join(' ')} target="_blank" rel="noopener noreferrer" aria-label="${text} (opens in a new tab)">${text}</a>`;
      } else {
        return `<a href="${href}" ${attributes.join(' ')}>${text}</a>`;
      }
    };
    
    // Make code blocks accessible
    renderer.code = function(code, language) {
      const validLang = !!(language && window.hljs.getLanguage(language));
      const highlighted = validLang ? window.hljs.highlight(code, { language }).value : window.hljs.highlightAuto(code).value;
      
      return `<div role="region" aria-label="Code example in ${validLang ? language : 'code'}">` +
             `<pre><code class="hljs language-${validLang ? language : 'plaintext'}">${highlighted}</code></pre>` +
             `</div>`;
    };
    
    // Use marked library to parse markdown
    window.marked.setOptions({
      renderer: renderer,
      highlight: function(code, lang) {
        const hljs = window.hljs;
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (e) {
            console.error(e);
          }
        }
        return hljs.highlightAuto(code).value;
      },
      gfm: true,
      breaks: true
    });
    
    return { __html: window.marked.parse(content) };
  };
  
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
  
  if (isLoading) {
    return (
      <div className="docs-content">
        <div className="docs-loading" role="status" aria-live="polite">
          <div className="spinner" aria-hidden="true"></div>
          <span className="sr-only">Loading documentation content...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="docs-content">
        <div className="docs-error" role="alert">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="docs-content-wrapper">
      {tableOfContents.length > 0 && (
        <aside className="docs-toc" aria-labelledby="toc-heading">
          <div className="toc-container">
            <h3 id="toc-heading">On this page</h3>
            <nav aria-label="Table of contents">
              <ul className="toc-list">
                {tableOfContents.map((heading, index) => (
                  <li 
                    key={index} 
                    className={`toc-item toc-level-${heading.level} ${activeHeading === heading.slug ? 'active' : ''}`}
                  >
                    <a 
                      href={`#${heading.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToHeading(heading.slug);
                      }}
                      aria-current={activeHeading === heading.slug ? 'location' : undefined}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      )}
      <article className="docs-content markdown-content" ref={contentRef} aria-busy={isLoading}>
        <div className="docs-content-inner" dangerouslySetInnerHTML={renderMarkdown()} />
      </article>
    </div>
  );
};

export default DocsContent;