import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <span className="footer-logo">AssembleJS</span>
            <div className="footer-social">
              <a href="https://github.com/zjayers/assemblejs" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </a>
              <a href="https://x.com/assemblejs" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="X">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://discord.gg/assemblejs" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path fill="currentColor" d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.39-.444.898-.608 1.297a19.65 19.65 0 0 0-5.91 0 12.63 12.63 0 0 0-.617-1.297.077.077 0 0 0-.079-.036c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.4 14.4 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.21 13.21 0 0 1-1.872-.892.076.076 0 0 1-.008-.125c.126-.095.252-.193.372-.292a.075.075 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.075.075 0 0 1 .078.01c.12.099.246.198.373.292a.076.076 0 0 1-.006.127 12.36 12.36 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.96 19.96 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="footer-nav-group">
            <h3>Resources</h3>
            <ul>
              <li><Link to="/docs">Documentation</Link></li>
              <li><Link to="/docs/development-setup">Getting Started</Link></li>
              <li><a href="https://github.com/zjayers/assemblejs/releases" target="_blank" rel="noopener noreferrer">Releases</a></li>
            </ul>
          </div>
          
          <div className="footer-nav-group">
            <h3>Community</h3>
            <ul>
              <li><a href="https://github.com/zjayers/assemblejs" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="https://github.com/zjayers/assemblejs/discussions" target="_blank" rel="noopener noreferrer">Discussions</a></li>
              <li><a href="mailto:support@assemblejs.com">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright">
            &copy; {new Date().getFullYear()} <span className="footer-name">AssembleJS</span> — You Can Build It
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;