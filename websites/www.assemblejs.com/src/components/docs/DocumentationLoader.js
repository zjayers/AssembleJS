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
        setError(`Failed to load documentation content for "${path}". The page may not exist or there could be a server issue. Details: ${err.message}`);
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
        try {
          // Safety check to prevent errors when component is unmounting or ref is null
          if (!contentRef || !contentRef.current) {
            console.log('Content ref is not available, skipping code block actions');
            return;
          }
          
          // Look for both direct pre elements and code-block-wrappers
          const codeBlocks = contentRef.current.querySelectorAll('pre, .code-block-wrapper pre') || [];
          
          console.log('Found code blocks:', codeBlocks.length); // Debug logging
          
          if (!codeBlocks.length) return;
          
          codeBlocks.forEach(codeBlock => {
            if (!codeBlock) return;
            
            try {
              // Skip if already has actions
              if (codeBlock.querySelector('.code-block-actions') || 
                  (codeBlock.parentElement && codeBlock.parentElement.querySelector('.code-block-actions'))) return;
          
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
          
          // Add copy button (no inner content - will be provided by CSS)
          const copyButton = document.createElement('button');
          copyButton.className = 'copy-button';
          copyButton.setAttribute('aria-label', 'Copy code to clipboard');
          copyButton.setAttribute('title', 'Copy to clipboard');
          
          // Add copy functionality
          copyButton.addEventListener('click', () => {
            const code = codeBlock.querySelector('code');
            if (!code) return;
            
            // Log the content being copied for debugging
            console.log('Copying code: ', code.textContent.substring(0, 50) + '...');
            
            navigator.clipboard.writeText(code.textContent || '')
              .then(() => {
                console.log('Copy successful'); // Debug logging
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
          
          actionsContainer.appendChild(copyButton);
          
          // For code blocks inside .code-block-wrapper, append to wrapper instead
          const targetElement = codeBlock.closest('.code-block-wrapper') || codeBlock;
          targetElement.appendChild(actionsContainer);
          
          // Add a class to the code block to show it has actions
          targetElement.classList.add('has-actions');
            } catch (err) {
              console.error('Error processing code block:', err);
            }
          });
        } catch (error) {
          console.error('Error adding code block actions:', error);
        }
      };
      
      // Try multiple times to add code block actions, in case of race conditions
      setTimeout(addCodeBlockActions, 200);
      setTimeout(addCodeBlockActions, 500);
      setTimeout(addCodeBlockActions, 1000);
      
      // Apply syntax highlighting if Highlight.js is available
      if (window.hljs) {
        // Give it a bit of time for hljs to be fully loaded
        setTimeout(() => {
          try {
            window.hljs.highlightAll();
            // Try adding buttons again after highlighting
            setTimeout(addCodeBlockActions, 100);
          } catch (e) {
            console.error('Error applying syntax highlighting:', e);
          }
        }, 300);
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
      
      // Conditionally escape the code based on language
      let escapedCode;
      
      // First, check for language indicators in the code block itself
      const firstLine = (code || '').split('\n')[0] || '';
      const hasLanguageOverride = firstLine.match(/^(html|jsx|tsx|vue|svelte|react|preact|handlebars|ejs|pug|nunjucks)$/i);
      
      // Use the override if found, otherwise use the provided language
      const effectiveLanguage = hasLanguageOverride ? 
        firstLine.toLowerCase() : 
        (language || '').toLowerCase();
      
      // Remove the language override line if it exists
      if (hasLanguageOverride) {
        code = code.substring(firstLine.length + 1);
      }
      
      // Don't escape HTML in these languages - they need to render properly with tags
      if (effectiveLanguage === 'html' || effectiveLanguage === 'xml' || 
          effectiveLanguage === 'svg' || effectiveLanguage === 'markup' || 
          effectiveLanguage === 'script' || effectiveLanguage === 'jsx' || 
          effectiveLanguage === 'tsx' || effectiveLanguage === 'vue' || 
          effectiveLanguage === 'svelte' || effectiveLanguage === 'react' || 
          effectiveLanguage === 'preact' || effectiveLanguage === 'handlebars' || 
          effectiveLanguage === 'ejs' || effectiveLanguage === 'pug' || 
          effectiveLanguage === 'nunjucks') {
        // For HTML-like languages and UI frameworks, keep original tags
        escapedCode = code;
      } else {
        // For other languages, escape HTML to prevent rendering
        escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
      let highlighted = escapedCode;
      let validLang = false;
      
      try {
        if (window.hljs && language) {
          // Try to detect if language is supported
          validLang = window.hljs.getLanguage && window.hljs.getLanguage(language);
          
          // Apply highlighting if the language is valid
          if (validLang) {
            // Use escapedCode for highlighting to ensure HTML is properly displayed
            const result = window.hljs.highlight(escapedCode, { language });
            if (result && result.value) {
              highlighted = result.value;
            }
          } else if (window.hljs.highlightAuto) {
            // Fallback to auto-detection if available
            const result = window.hljs.highlightAuto(escapedCode);
            if (result && result.value) {
              highlighted = result.value;
            }
          }
        } else {
          // If no language specified or hljs not available, ensure code is escaped
          highlighted = escapedCode;
        }
      } catch (e) {
        console.error('Error highlighting code:', e);
        // In case of error, use the escaped code
        highlighted = escapedCode;
      }
      
      // Check for HTML, XML, or UI framework content and ensure proper language is set
      if (!validLang) {
        let detectedLanguage = '';
        
        // Try to detect the language from content if not already valid
        if (code.includes('<template>') && code.includes('<script>')) {
          detectedLanguage = 'vue';
        } else if (code.includes('<script>') && code.includes('export default') && !code.includes('import React')) {
          detectedLanguage = 'svelte';
        } else if (code.includes('className=') || code.includes('export function') || code.includes('render()')) {
          detectedLanguage = 'jsx';
        } else if (code.includes('<%') && code.includes('%>')) {
          detectedLanguage = 'ejs';
        } else if (code.includes('{{') && code.includes('}}') && (code.includes('{{#each') || code.includes('{{#if'))) {
          detectedLanguage = 'handlebars';
        } else if (code.includes('{%') && code.includes('%}')) {
          detectedLanguage = 'nunjucks';
        } else if (code.includes('<html>') || code.includes('<!DOCTYPE') || code.match(/<\w+>[\s\S]*?<\/\w+>/)) {
          detectedLanguage = 'html';
        }
        
        // Use detected language or fallback to html for markup-like content
        if (detectedLanguage) {
          // Use the detected language or fallback to HTML if not supported by highlighter
          const langToUse = window.hljs && window.hljs.getLanguage && 
                           window.hljs.getLanguage(detectedLanguage) ? detectedLanguage : 'html';
          
          try {
            const result = window.hljs.highlight(escapedCode, { language: langToUse });
            if (result && result.value) {
              highlighted = result.value;
              language = langToUse; // Update language for the label
              validLang = true;
            }
          } catch (e) {
            console.error('Error highlighting with detected language:', e);
            // Fallback to basic HTML highlighting
            try {
              const result = window.hljs.highlight(escapedCode, { language: 'html' });
              if (result && result.value) {
                highlighted = result.value;
                language = 'html';
                validLang = true;
              }
            } catch (err) {
              // Final fallback - just use the escaped code
            }
          }
        }
      }
      
      // Add language label to code blocks with language-specific class (lowercase for consistency)
      const langLabel = language ? `<div class="code-lang code-lang-${language.toLowerCase()}">${language.toLowerCase()}</div>` : '';
      
      // Check if this is an npm install block (ensuring code is a string)
      const trimmedCode = String(code).trim();
      const isNpmInstall = trimmedCode.includes('npm install') || 
                          trimmedCode.includes('npm i') || 
                          trimmedCode.startsWith('npm ');
      
      const npmClass = isNpmInstall ? 'npm-install-block' : '';
      
      // Add a copy button directly in the rendered HTML
      const copyButton = `
        <div class="code-block-actions">
          <button class="copy-button" aria-label="Copy code to clipboard" title="Copy to clipboard"></button>
        </div>
      `;
      
      return `<div class="code-block-wrapper ${npmClass}">
                ${langLabel}
                ${copyButton}
                <pre><code class="hljs language-${language || 'plaintext'}">${highlighted}</code></pre>
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
  
  // Get title from first heading in content - but don't render it, 
  // as the markdown already contains the h1 title
  const getTitleFromContent = () => {
    if (!content) return null;
    const match = content.match(/^# (.+)$/m);
    return match ? match[1] : null;
  };
  
  // We still get the title for metadata purposes but don't render it
  getTitleFromContent();
  
  return (
    <div className="documentation-loader loaded" ref={contentRef}>
      <div className="documentation-content" dangerouslySetInnerHTML={renderMarkdown()} />
    </div>
  );
};

export default DocumentationLoader;