import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ArloPage.css';

const ArloPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Animation trigger after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
      <section className="arlo-page" aria-labelledby="arlo-heading">
        <div className="arlo-content">
          <div className="arlo-info" style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.8s ease'
          }}>
            <h1 id="arlo-heading" className="arlo-heading">A.R.L.O.</h1>
            <h2 className="arlo-subheading">AssembleJS Repository Logic
              Orchestrator</h2>
            <p className="arlo-description">
              A team of specialized AI agents trained to enhance and maintain
              the framework
              with surgical precision. Build your dream application faster than
              ever with
              the power of A.R.L.O.
            </p>

            <Link to="/docs/arlo/introduction" className="arlo-cta">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span>Explore A.R.L.O. Documentation</span>
            </Link>
          </div>

          <div className="arlo-main-content">
            <div className="arlo-text-content">
              {/* Empty by design - text content is now in arlo-info above */}
            </div>
            <div className="arlo-visual" style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease'
            }}>
              <div className="arlo-card">
                <div className="arlo-card-header">
                  <div className="arlo-card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                         fill="#fff">
                      <path
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                      <path d="M10 9h4v6h-4z"/>
                    </svg>
                    A.R.L.O. Agent System
                  </div>
                  <div className="arlo-card-dots">
                    <span className="arlo-dot arlo-dot-red"></span>
                    <span className="arlo-dot arlo-dot-yellow"></span>
                    <span className="arlo-dot arlo-dot-green"></span>
                  </div>
                </div>
                <div className="arlo-card-content">
                  <div className="arlo-agent">
                    <div className="arlo-agent-icon admin-agent">A</div>
                    <div className="arlo-agent-details">
                      <div className="arlo-agent-name">Admin Agent</div>
                      <div className="arlo-agent-role">Project coordinator and
                        workflow orchestrator
                      </div>
                    </div>
                  </div>

                  <div className="arlo-agent">
                    <div className="arlo-agent-icon browser-agent">B</div>
                    <div className="arlo-agent-details">
                      <div className="arlo-agent-name">Browser Agent</div>
                      <div className="arlo-agent-role">Frontend architecture
                        expert
                      </div>
                    </div>
                  </div>

                  <div className="arlo-agent">
                    <div className="arlo-agent-icon server-agent">S</div>
                    <div className="arlo-agent-details">
                      <div className="arlo-agent-name">Server Agent</div>
                      <div className="arlo-agent-role">Backend architecture
                        expert
                      </div>
                    </div>
                  </div>

                  <div className="arlo-agent">
                    <div className="arlo-agent-icon docs-agent">D</div>
                    <div className="arlo-agent-details">
                      <div className="arlo-agent-name">Docs Agent</div>
                      <div className="arlo-agent-role">Documentation and
                        knowledge management
                      </div>
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginTop: 'auto',
                    paddingTop: '1rem'
                  }}>
                    ... and 13 other specialist agents
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
};

export default ArloPage;