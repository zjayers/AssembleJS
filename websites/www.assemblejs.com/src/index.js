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
  
  // Load Highlight.js as an ES module
  const script = document.createElement('script');
  script.type = 'module';
  script.textContent = `
    import hljs from 'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/+esm';
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
};

// Load documentation dependencies if on documentation page
if (window.location.pathname.startsWith('/docs')) {
  loadDocLibraries();
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
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
