import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Load syntax highlighting and markdown libraries for documentation
const loadDocLibraries = () => {
  // Load Marked.js for Markdown parsing
  const markedScript = document.createElement('script');
  markedScript.src = 'https://cdn.jsdelivr.net/npm/marked@4.0.0/marked.min.js';
  markedScript.async = true;
  document.head.appendChild(markedScript);
  
  // Load Highlight.js with all languages needed for documentation
  const script = document.createElement('script');
  script.type = 'module';
  script.textContent = `
    import hljs from 'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/+esm';
    import xml from 'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.11.1/es/languages/xml.min.js';
    import javascript from 'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.11.1/es/languages/javascript.min.js';
    import typescript from 'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.11.1/es/languages/typescript.min.js';
    import css from 'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.11.1/es/languages/css.min.js';
    import bash from 'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.11.1/es/languages/bash.min.js';
    import json from 'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.11.1/es/languages/json.min.js';
    
    // Register all needed languages
    hljs.registerLanguage('xml', xml);
    hljs.registerLanguage('html', xml); // HTML uses XML syntax highlighting
    hljs.registerLanguage('javascript', javascript);
    hljs.registerLanguage('js', javascript);
    hljs.registerLanguage('typescript', typescript);
    hljs.registerLanguage('ts', typescript);
    hljs.registerLanguage('jsx', javascript); // Use JavaScript for JSX
    hljs.registerLanguage('tsx', typescript); // Use TypeScript for TSX
    hljs.registerLanguage('css', css);
    hljs.registerLanguage('bash', bash);
    hljs.registerLanguage('shell', bash);
    hljs.registerLanguage('json', json);
    
    // Register custom languages
    hljs.registerLanguage('vue', xml); // Use XML for Vue templates
    hljs.registerLanguage('svelte', xml); // Use XML for Svelte templates
    hljs.registerLanguage('react', javascript); // React uses JavaScript
    hljs.registerLanguage('preact', javascript); // Preact uses JavaScript
    hljs.registerLanguage('handlebars', xml); // Handlebars syntax is XML-like
    hljs.registerLanguage('ejs', xml); // EJS syntax is XML-like
    hljs.registerLanguage('pug', xml); // Highlight Pug as XML
    hljs.registerLanguage('nunjucks', xml); // Nunjucks syntax is XML-like
    
    // Make hljs available globally
    window.hljs = hljs;
  `;
  document.head.appendChild(script);
  
  // Determine current theme
  const isDarkTheme = document.body.getAttribute('data-theme') !== 'light';
  const themeName = isDarkTheme ? 'atom-one-dark' : 'atom-one-light';
  
  // Load Highlight.js styles
  const highlightStyles = document.createElement('link');
  highlightStyles.id = 'highlight-theme-css';
  highlightStyles.rel = 'stylesheet';
  highlightStyles.href = `https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/${themeName}.min.css`;
  document.head.appendChild(highlightStyles);
  
  // Add global script for copy buttons directly
  const copyButtonScript = document.createElement('script');
  copyButtonScript.textContent = `
    // Global function to add copy buttons to code blocks
    function addCopyButtonsToCodeBlocks() {
      try {
        console.log('Adding copy buttons to code blocks');
        
        // Guard clause to ensure document is ready
        if (!document || !document.body) {
          console.log('Document not ready yet, skipping button addition');
          return;
        }
        
        // Use try-catch for querySelectorAll to prevent errors during navigation
        let codeBlocks = [];
        try {
          codeBlocks = document.querySelectorAll('pre') || [];
          console.log('Found', codeBlocks.length, 'code blocks');
        } catch (error) {
          console.warn('Error querying for code blocks:', error);
          return;
        }
        
        if (!codeBlocks.length) return;
        
        codeBlocks.forEach(codeBlock => {
          if (!codeBlock) return;
          // Skip if already has copy button
          if (codeBlock.querySelector('.copy-button')) return;
        
        // Create button element
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.setAttribute('aria-label', 'Copy code to clipboard');
        copyButton.textContent = '';  // Keep empty, will be filled by ::before
        
        // Make sure code block has position relative
        codeBlock.style.position = 'relative';
        
        // Add click event
        copyButton.addEventListener('click', () => {
          const code = codeBlock.querySelector('code');
          if (!code) return;
          
          // Copy to clipboard
          navigator.clipboard.writeText(code.textContent || '')
            .then(() => {
              // Remove any existing classes first
              copyButton.classList.remove('error');
              copyButton.classList.add('copied');
              
              // Reset after 2 seconds
              setTimeout(() => {
                copyButton.classList.remove('copied');
              }, 2000);
            })
            .catch(err => {
              // Remove any existing classes first
              copyButton.classList.remove('copied');
              copyButton.classList.add('error');
              
              // Reset after 2 seconds
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
    }
    
    // Function to run periodically
    function ensureCopyButtons() {
      addCopyButtonsToCodeBlocks();
      
      // Check again after content might have changed
      setTimeout(addCopyButtonsToCodeBlocks, 1000);
      setTimeout(addCopyButtonsToCodeBlocks, 2000);
      setTimeout(addCopyButtonsToCodeBlocks, 3000);
    }
    
    // Run on page load
    document.addEventListener('DOMContentLoaded', ensureCopyButtons);
    
    // Add buttons when route changes
    const pushState = history.pushState;
    history.pushState = function() {
      pushState.apply(history, arguments);
      setTimeout(ensureCopyButtons, 500);
    };
    
    // Also watch for popstate (back/forward buttons)
    window.addEventListener('popstate', () => {
      setTimeout(ensureCopyButtons, 500);
    });
  `;
  document.head.appendChild(copyButtonScript);
};

// Add direct inline styles to ensure copy buttons are visible
const addInlineStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    /* Ensure copy buttons are visible with important flags */
    pre {
      position: relative !important;
      margin: 0 !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
    }
    .copy-button {
      position: absolute !important;
      top: 10px !important;
      right: 10px !important;
      background-color: #3b82f6 !important;
      color: white !important;
      border: none !important;
      border-radius: 4px !important;
      padding: 6px 12px !important;
      min-width: 80px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      z-index: 9999 !important;
      opacity: 1 !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
      transition: background-color 0.2s ease !important;
    }
    
    /* Reset all potential content */
    .copy-button::after {
      content: "" !important;
      display: none !important;
    }
    .copy-button * {
      display: none !important;
    }
    
    /* Language tag styling */
    .code-block-wrapper {
      margin-top: 0 !important;
      margin-bottom: 1.5rem !important;
      height: auto !important;
    }
    .code-lang {
      position: absolute !important;
      top: 8px !important;
      left: 10px !important;
      font-size: 0.65rem !important;
      padding: 0.15rem 0.5rem !important;
      color: white !important;
      background-color: #3b82f6 !important;
      border-radius: 4px !important;
      z-index: 5 !important;
      font-weight: 500 !important;
      letter-spacing: 0.5px !important;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
      text-transform: uppercase !important;
      display: inline-block !important;
      width: auto !important;
      min-width: min-content !important;
      opacity: 0.8 !important;
      transition: opacity 0.2s ease !important;
    }
    
    .code-block-wrapper:hover .code-lang {
      opacity: 1 !important;
    }
    
    /* Language-specific color classes (inline) */
    .code-lang-javascript, .code-lang-js {
      background-color: #f7df1e !important;
      color: #000 !important;
    }
    .code-lang-typescript, .code-lang-ts {
      background-color: #3178c6 !important;
      color: #fff !important;
    }
    .code-lang-jsx, .code-lang-tsx {
      background-color: #61dafb !important;
      color: #000 !important;
    }
    .code-lang-react, .code-lang-preact {
      background-color: #61dafb !important;
      color: #000 !important;
    }
    .code-lang-html, .code-lang-xml, .code-lang-markup {
      background-color: #e34c26 !important;
      color: #fff !important;
    }
    .code-lang-vue {
      background-color: #42b883 !important;
      color: #fff !important;
    }
    .code-lang-svelte {
      background-color: #ff3e00 !important;
      color: #fff !important;
    }
    .code-lang-handlebars, .code-lang-hbs {
      background-color: #f0772b !important;
      color: #fff !important;
    }
    .code-lang-ejs {
      background-color: #a91e50 !important;
      color: #fff !important;
    }
    .code-lang-pug {
      background-color: #a86454 !important;
      color: #fff !important;
    }
    .code-lang-nunjucks, .code-lang-njk {
      background-color: #1c4913 !important;
      color: #fff !important;
    }
    .code-lang-css, .code-lang-scss, .code-lang-sass {
      background-color: #264de4 !important;
      color: #fff !important;
    }
    .code-lang-json {
      background-color: #1e1e1e !important;
      color: #fff !important;
    }
    .code-lang-bash, .code-lang-sh, .code-lang-shell {
      background-color: #4eaa25 !important;
      color: #fff !important;
    }
    .code-lang-script {
      background-color: #9a3b26 !important;
      color: #fff !important;
    }
    
    /* Set single content text */
    .copy-button::before {
      content: "Copy" !important;
      display: inline !important;
    }
    .copy-button:hover {
      background-color: #2563eb !important;
      transform: translateY(-1px) !important;
    }
    .copy-button.copied {
      background-color: #16a34a !important;
    }
    .copy-button.copied::before {
      content: "Copied!" !important;
    }
    .copy-button.error {
      background-color: #ef4444 !important;
    }
    .copy-button.error::before {
      content: "Error!" !important;
    }
  `;
  document.head.appendChild(style);
};

// Load documentation dependencies if on documentation page
if (window.location.pathname.startsWith('/docs')) {
  loadDocLibraries();
  addInlineStyles();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
