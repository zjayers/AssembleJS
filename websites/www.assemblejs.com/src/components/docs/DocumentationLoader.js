import React, { useState, useEffect, useRef } from 'react';

/**
 * A component that loads and displays documentation content from markdown files
 * with proper syntax highlighting and formatting.
 */
const DocumentationLoader = ({ path }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);
  
  // Clear previous content when path changes
  useEffect(() => {
    setContent('');
    setIsLoading(true);
    setError(null);
    // Reset state when path changes
  }, [path]);
  
  useEffect(() => {
    const loadContent = async () => {
      if (!path) return;
      
      // Start loading content for path
      setIsLoading(true);
      
      try {
        // Create the document path correctly with proper handling
        const docPath = path.includes('/') ? path : `${path}`;
        
        // First attempt to load from custom docs
        const customResponse = await fetch(`/custom-docs/${docPath}.md`);
        
        if (customResponse.ok) {
          const markdown = await customResponse.text();
          setContent(markdown);
          setError(null);
          return;
        }
        
        // If not found in custom docs, try the auto-generated docs
        const response = await fetch(`/docs/${docPath}.md`);
        
        if (!response.ok) {
          // Document fetch failed, try fallback
          
          if (path === 'index') {
            // Special case for index - check if we need to redirect
            try {
              // Try loading modules.md as a fallback for index
              const modulesResponse = await fetch('/docs/modules.md');
              if (modulesResponse.ok) {
                const markdown = await modulesResponse.text();
                setContent(markdown);
                setError(null);
                return;
              }
            } catch (e) {
              // Error in fallback
            }
          }
          throw new Error(`Failed to load documentation: ${response.status} ${response.statusText}`);
        }
        
        const markdown = await response.text();
        // Successfully loaded content
        setContent(markdown);
        setError(null);
      } catch (err) {
        // Error loading documentation
        setError(`Failed to load documentation content for "${path}". The page may not exist or there could be a server issue.`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, [path]);
  
  // Add code block actions (copy button, etc.) after content is rendered
  useEffect(() => {
    if (!isLoading && content && contentRef.current && window.marked) {
      const addCodeBlockActions = () => {
        const codeBlocks = contentRef.current.querySelectorAll('pre');
        
        codeBlocks.forEach(codeBlock => {
          if (codeBlock.querySelector('.code-block-actions')) return;
          
          // Handle npm install blocks specially
          const codeElement = codeBlock.querySelector('code');
          if (codeElement && codeElement.textContent) {
            const codeText = codeElement.textContent.trim();
            
            // Check if this is an npm install command
            if (codeText.includes('npm install') || codeText.includes('npm i -g') || codeText.startsWith('npm ')) {
              codeBlock.classList.add('npm-install-block');
            }
          }
          
          // Create actions container
          const actionsContainer = document.createElement('div');
          actionsContainer.className = 'code-block-actions';
          
          // Add copy button
          const copyButton = document.createElement('button');
          copyButton.className = 'copy-button';
          copyButton.setAttribute('aria-label', 'Copy code to clipboard');
          copyButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          `;
          
          // Add copy functionality
          copyButton.addEventListener('click', () => {
            const code = codeBlock.querySelector('code');
            if (!code) return;
            
            navigator.clipboard.writeText(code.textContent || '')
              .then(() => {
                copyButton.classList.add('copied');
                copyButton.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                `;
                
                setTimeout(() => {
                  copyButton.classList.remove('copied');
                  copyButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  `;
                }, 2000);
              })
              .catch(err => {
                // Handle clipboard copy error
              });
          });
          
          actionsContainer.appendChild(copyButton);
          codeBlock.appendChild(actionsContainer);
        });
      };
      
      // Wait for the content to be fully rendered before adding code block actions
      setTimeout(addCodeBlockActions, 200);
      
      // Apply syntax highlighting if Highlight.js is available
      if (window.hljs) {
        // Give it a bit of time for hljs to be fully loaded
        setTimeout(() => {
          try {
            window.hljs.highlightAll();
          } catch (e) {
            // Error applying syntax highlighting
          }
        }, 500);
      }
    }
  }, [isLoading, content]);
  
  // Function to render markdown with custom formatting
  const renderMarkdown = () => {
    if (!content || !window.marked) return { __html: '' };
    
    // Set up custom renderer to add features
    const renderer = new window.marked.Renderer();
    
    // Enhance code blocks with language information
    renderer.code = function(code, language) {
      // Make sure code is a string
      code = String(code || '');
      
      // Store the raw code for the copy functionality
      const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      let highlighted = escapedCode;
      let validLang = false;
      
      try {
        if (window.hljs && language) {
          // Try to detect if language is supported
          validLang = window.hljs.getLanguage && window.hljs.getLanguage(language);
          
          // Apply highlighting if the language is valid
          if (validLang) {
            const result = window.hljs.highlight(code, { language });
            if (result && result.value) {
              highlighted = result.value;
            }
          } else if (window.hljs.highlightAuto) {
            // Fallback to auto-detection if available
            const result = window.hljs.highlightAuto(code);
            if (result && result.value) {
              highlighted = result.value;
            }
          }
        }
      } catch (e) {
        console.error('Error highlighting code:', e);
        // In case of error, use the escaped code
        highlighted = escapedCode;
      }
      
      // Add language label to code blocks
      const langLabel = validLang ? `<div class="code-lang">${language}</div>` : '';
      
      // Check if this is an npm install block (ensuring code is a string)
      const trimmedCode = String(code).trim();
      const isNpmInstall = trimmedCode.includes('npm install') || 
                          trimmedCode.includes('npm i') || 
                          trimmedCode.startsWith('npm ');
      
      const npmClass = isNpmInstall ? 'npm-install-block' : '';
      
      return `<div class="code-block-wrapper ${npmClass}">
                ${langLabel}
                <pre><code class="hljs language-${validLang ? language : 'plaintext'}">${highlighted}</code></pre>
              </div>`;
    };
    
    // Enhance headings with anchor links
    renderer.heading = function(text, level, raw) {
      if (level <= 4) {
        const slug = raw
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        
        return `
          <h${level} id="${slug}">
            <a href="#${slug}" class="heading-anchor">#</a>
            ${text}
          </h${level}>
        `;
      }
      return `<h${level} id="${raw.toLowerCase().replace(/[^\w]+/g, '-')}">${text}</h${level}>`;
    };
    
    // Enhance links with proper target for external links
    renderer.link = function(href, title, text) {
      const isExternal = href.startsWith('http');
      const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
      const titleAttr = title ? `title="${title}"` : '';
      
      return `<a href="${href}" ${titleAttr} ${targetAttr}>${text}</a>`;
    };
    
    // Set custom renderer and parsing options
    window.marked.setOptions({
      renderer: renderer,
      gfm: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: true
    });
    
    return { __html: window.marked.parse(content) };
  };
  
  if (isLoading) {
    return (
      <div className="documentation-loader loading" aria-live="polite">
        <div className="spinner"></div>
        <span className="sr-only">Loading documentation...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="documentation-loader error" role="alert">
        <h2>Documentation Not Found</h2>
        <p>{error}</p>
        <p>
          Please check the URL or navigate to the <a href="/docs">Documentation Home</a> to find what you're looking for.
        </p>
      </div>
    );
  }
  
  // Get title from first heading in content
  const getTitleFromContent = () => {
    if (!content) return null;
    const match = content.match(/^# (.+)$/m);
    return match ? match[1] : null;
  };
  
  const title = getTitleFromContent();
  
  return (
    <div className="documentation-loader loaded" ref={contentRef}>
      {title && <h1 className="documentation-title">{title}</h1>}
      <div className="documentation-content" dangerouslySetInnerHTML={renderMarkdown()} />
    </div>
  );
};

export default DocumentationLoader;