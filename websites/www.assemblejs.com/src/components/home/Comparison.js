import React from 'react';
import './Comparison.css';

// SVG Icons for the comparison table
const CheckIcon = () => (
  <svg className="check-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = () => (
  <svg className="x-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Comparison = () => {
  return (
    <section className="comparison" aria-labelledby="comparison-heading">
      <div className="container">
        <h2 id="comparison-heading" className="section-title">Why AssembleJS?</h2>
        <h3 className="section-subtitle">AssembleJS revolutionizes web development by combining the best aspects of micro-frontends, islands architecture, and framework-agnostic design into a cohesive, high-performance solution.</h3>
        <div className="comparison-content">
          <div className="comparison-table-container">
            <table className="comparison-table" aria-labelledby="comparison-table-caption">
              <caption id="comparison-table-caption" className="sr-only">
                Feature comparison between AssembleJS and other frameworks
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="col-feature">FEATURES</th>
                  <th scope="col" className="col-framework">ASSEMBLEJS</th>
                  <th scope="col" className="col-framework">SINGLESPA</th>
                  <th scope="col" className="col-framework">NEXT.JS</th>
                  <th scope="col" className="col-framework">ASTRO</th>
                  <th scope="col" className="col-framework">QWIK</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" align="center">Islands Architecture</th>
                  <td aria-label="AssembleJS: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="SingleSPA: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Next.js: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Astro: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="Qwik: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                </tr>
                <tr>
                  <th scope="row" align="center">Multi-framework</th>
                  <td aria-label="AssembleJS: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="SingleSPA: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="Next.js: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Astro: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="Qwik: No" align="center"><div className="icon-container"><XIcon /></div></td>
                </tr>
                <tr>
                  <th scope="row" align="center">Server-first Approach</th>
                  <td aria-label="AssembleJS: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="SingleSPA: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Next.js: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="Astro: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="Qwik: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                </tr>
                <tr>
                  <th scope="row" align="center">Component Isolation</th>
                  <td aria-label="AssembleJS: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="SingleSPA: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="Next.js: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Astro: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="Qwik: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                </tr>
                <tr>
                  <th scope="row" align="center">Micro-Frontends</th>
                  <td aria-label="AssembleJS: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="SingleSPA: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="Next.js: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Astro: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Qwik: No" align="center"><div className="icon-container"><XIcon /></div></td>
                </tr>
                <tr>
                  <th scope="row" align="center">Integrated Code Quality</th>
                  <td aria-label="AssembleJS: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="SingleSPA: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Next.js: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Astro: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Qwik: No" align="center"><div className="icon-container"><XIcon /></div></td>
                </tr>
                <tr>
                  <th scope="row" align="center">Built-in Event System</th>
                  <td aria-label="AssembleJS: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="SingleSPA: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="Next.js: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Astro: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Qwik: No" align="center"><div className="icon-container"><XIcon /></div></td>
                </tr>
                <tr>
                  <th scope="row" align="center">Global State Solution</th>
                  <td aria-label="AssembleJS: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="SingleSPA: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="Next.js: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Astro: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Qwik: No" align="center"><div className="icon-container"><XIcon /></div></td>
                </tr>
                <tr>
                  <th scope="row" align="center">Server-Side Rendering</th>
                  <td aria-label="AssembleJS: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="SingleSPA: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Next.js: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="Astro: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="Qwik: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                </tr>
                <tr>
                  <th scope="row" align="center">Zero Configuration</th>
                  <td aria-label="AssembleJS: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="SingleSPA: No" align="center"><div className="icon-container"><XIcon /></div></td>
                  <td aria-label="Next.js: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="Astro: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                  <td aria-label="Qwik: Yes" align="center"><div className="icon-container"><CheckIcon /></div></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="comparison-text">
            <div>
              <ul className="comparison-list">
                <li>
                  <strong>True Component Isolation</strong>
                  Components are fully encapsulated with their own styles, logic, and view templates, eliminating unexpected side effects.
                </li>
                <li>
                  <strong>Islands Architecture</strong>
                  Each component hydrates independently, dramatically reducing initial JavaScript payload and improving time-to-interactive metrics.
                </li>
                <li>
                  <strong>Multi-Framework Support</strong>
                  Seamlessly mix React, Vue, Svelte, Preact, or vanilla JS components in the same application without configuration headaches.
                </li>
                <li>
                  <strong>Server-First Approach</strong>
                  Powerful data preparation and rendering happens on the server for optimal SEO and performance.
                </li>
                <li>
                  <strong>Event-Driven Communication</strong>
                  Components interact through a type-safe event bus that enables seamless cross-framework communication.
                </li>
                <li>
                  <strong>Enterprise-Ready Tools</strong>
                  Built-in code quality analysis, performance monitoring, and streamlined deployment workflows for teams of any size.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;