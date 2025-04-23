import React from 'react';
import { Link } from 'react-router-dom';
import ParallaxBackground from './ParallaxBackground';

const Hero = () => {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      {/* Add the parallax background */}
      <ParallaxBackground />
      
      <div className="container">
        <div className="hero-content">
          <h1 id="hero-heading" className="hero-title">Micro-Frontends, <span className="gold-emboss">Assemble!</span></h1>
          <p className="hero-description">
            AssembleJS unites the mightiest web technologies to build powerful distributed UIs.
            Harness the strength of multiple frameworks within a single application.
          </p>
          <div className="hero-actions">
            <div className="cta-buttons">
              <Link to="/docs" className="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <span>Get Started</span>
              </Link>
              <a href="https://github.com/zjayers/assemblejs" className="btn btn-secondary" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository (opens in a new tab)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
                <span>GitHub</span>
              </a>
            </div>
            <div className="hero-version">
              <span className="npmjs-label">Install via NPM</span>
              <a href="https://www.npmjs.com/package/asmbl" target="_blank" rel="noopener noreferrer" className="code-install-command" aria-label="Install from NPM (opens in a new tab)">
                <pre><code>npm i -g asmbl</code></pre>
              </a>
            </div>
          </div>
        </div>
        <div className="hero-image" aria-hidden="true" style={{ height: '100%' }}>
          <div className="hero-image-container" style={{ height: '100%' }}>
            <div className="code-block" role="img" aria-label="Example AssembleJS server code">
              <div className="code-header">
                <span className="code-title">server.ts</span>
                <div className="code-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
              </div>
              <pre className="code-content">
                <code className="code-block-content">
                  <div className="code-line"><span className="code-keyword">import</span> {'{' } createBlueprintServer {'}' } <span className="code-keyword">from</span> <span className="code-string">'asmbl'</span>;</div>
                  <div className="code-line"><span className="code-function">createBlueprintServer</span>({'{'}</div>
                  <div className="code-line">  serverRoot: <span className="code-string">import.meta.url</span>,</div>
                  <div className="code-line">  manifest: {'{'}</div>
                  <div className="code-line">    components: [</div>
                  <div className="code-line">      {'{'}</div>
                  <div className="code-line">        path: <span className="code-string">'app'</span>,</div>
                  <div className="code-line">        views: [{'{' }</div>
                  <div className="code-line">          <span className="code-comment">{/* React blueprint */}</span></div>
                  <div className="code-line">          exposeAsBlueprint: <span className="code-keyword">true</span>,</div>
                  <div className="code-line">          templateFile: <span className="code-string">'app.view.jsx'</span>,</div>
                  <div className="code-line">          components: [</div>
                  <div className="code-line">            <span className="code-comment">{/* Svelte component */}</span></div>
                  <div className="code-line">            {'{'} name: <span className="code-string">'cart'</span>, contentUrl: </div>
                  <div className="code-line">              <span className="code-string">'/cart/dropdown/'</span> {'}'}</div>
                  <div className="code-line">          ]</div>
                  <div className="code-line">        {'}'}]</div>
                  <div className="code-line">      {'}'},</div>
                  <div className="code-line">      {'{'}</div>
                  <div className="code-line">        path: <span className="code-string">'cart'</span>,</div>
                  <div className="code-line">        views: [{'{' } viewName: <span className="code-string">'dropdown'</span>, </div>
                  <div className="code-line">          templateFile: <span className="code-string">'dropdown.view.svelte'</span> {'}'}]</div>
                  <div className="code-line">      {'}'}</div>
                  <div className="code-line">    ]</div>
                  <div className="code-line">  {'}'}</div>
                  <div className="code-line">{'}'});</div>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;