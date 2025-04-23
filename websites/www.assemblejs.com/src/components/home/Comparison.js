import React from 'react';

const Comparison = () => {
  return (
    <section className="comparison" aria-labelledby="comparison-heading">
      <div className="container">
        <h2 id="comparison-heading" className="section-title">Why AssembleJS?</h2>
        <div className="comparison-content">
          <div className="comparison-text">
            <p className="comparison-lead">
              AssembleJS takes a unique approach to building web applications, focusing on true component isolation, 
              framework flexibility, and a server-first architecture that prioritizes performance.
            </p>
            <ul className="comparison-list">
              <li>
                <strong>Islands Architecture</strong>: Each component hydrates independently, minimizing JavaScript payload.
              </li>
              <li>
                <strong>Framework Freedom</strong>: Use React, Vue, Svelte, or vanilla JS - even in the same project.
              </li>
              <li>
                <strong>Factory System</strong>: Powerful server-side data preparation before rendering.
              </li>
              <li>
                <strong>Event Communication</strong>: Components communicate via a robust event system.
              </li>
              <li>
                <strong>Enterprise Tools</strong>: Built-in code quality, performance analysis, and deployment tools.
              </li>
            </ul>
          </div>
          <div className="comparison-table-container">
            <table className="comparison-table" aria-labelledby="comparison-table-caption">
              <caption id="comparison-table-caption" className="sr-only">
                Feature comparison between AssembleJS and other frameworks
              </caption>
              <thead>
                <tr>
                  <th scope="col">Features</th>
                  <th scope="col">AssembleJS</th>
                  <th scope="col">SingleSPA</th>
                  <th scope="col">Next.js</th>
                  <th scope="col">Astro</th>
                  <th scope="col">Qwik</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Islands Architecture</th>
                  <td aria-label="AssembleJS: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="SingleSPA: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Next.js: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Astro: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="Qwik: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                </tr>
                <tr>
                  <th scope="row">Multi-framework</th>
                  <td aria-label="AssembleJS: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="SingleSPA: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="Next.js: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Astro: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="Qwik: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                </tr>
                <tr>
                  <th scope="row">Server-first Approach</th>
                  <td aria-label="AssembleJS: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="SingleSPA: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Next.js: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="Astro: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="Qwik: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                </tr>
                <tr>
                  <th scope="row">Component Isolation</th>
                  <td aria-label="AssembleJS: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="SingleSPA: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="Next.js: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Astro: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="Qwik: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                </tr>
                <tr>
                  <th scope="row">Micro-Frontends</th>
                  <td aria-label="AssembleJS: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="SingleSPA: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="Next.js: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Astro: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Qwik: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                </tr>
                <tr>
                  <th scope="row">Integrated Code Quality</th>
                  <td aria-label="AssembleJS: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="SingleSPA: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Next.js: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Astro: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Qwik: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                </tr>
                <tr>
                  <th scope="row">Built-in Event System</th>
                  <td aria-label="AssembleJS: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="SingleSPA: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="Next.js: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Astro: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Qwik: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                </tr>
                <tr>
                  <th scope="row">Global State Solution</th>
                  <td aria-label="AssembleJS: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="SingleSPA: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="Next.js: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Astro: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Qwik: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                </tr>
                <tr>
                  <th scope="row">Server-Side Rendering</th>
                  <td aria-label="AssembleJS: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="SingleSPA: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Next.js: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="Astro: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="Qwik: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                </tr>
                <tr>
                  <th scope="row">Zero Configuration</th>
                  <td aria-label="AssembleJS: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="SingleSPA: No"><span aria-hidden="true">❌</span><span className="sr-only">No</span></td>
                  <td aria-label="Next.js: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="Astro: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                  <td aria-label="Qwik: Yes"><span aria-hidden="true">✅</span><span className="sr-only">Yes</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;