import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from '../common/Logo';
import { FaGithub } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const isDocsPage = location.pathname.startsWith('/docs');
  const [theme, setTheme] = useState('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Initialize theme from localStorage if available
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
    
    // Apply a transition to all elements for smoother theme switching
    document.documentElement.style.setProperty('--theme-transition-time', '0.3s');
  }, []);

  // Track scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Toggle between light and dark modes
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header 
        className={`site-header ${isDocsPage ? 'docs-page' : ''} ${scrolled ? 'scrolled' : ''}`} 
        role="banner"
      >
        <div className="header-container">
          <Link to="/" className="site-logo" aria-label="AssembleJS home">
            <Logo />
            <span className="logo-text">AssembleJS</span>
          </Link>

          {/* Main navigation */}
          <nav className="main-nav" aria-label="Main navigation">
            <ul>
              <li>
                <NavLink to="/#features" className={({isActive}) => isActive ? 'active' : ''}>
                  Features
                </NavLink>
              </li>
              <li>
                <NavLink to="/docs" className={({isActive}) => isActive || isDocsPage ? 'active' : ''}>
                  Documentation
                </NavLink>
              </li>
              <li>
                <NavLink to="/showcase" className={({isActive}) => isActive ? 'active' : ''}>
                  Showcase
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            {/* GitHub button */}
            <a 
              href="https://github.com/zjayers/assemblejs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-btn"
              aria-label="View AssembleJS on GitHub (opens in a new tab)"
            >
              <FaGithub aria-hidden="true" className="github-icon" />
              <span>GitHub</span>
            </a>

            {/* Theme toggle button */}
            <button 
              className="theme-btn" 
              onClick={toggleTheme}
              aria-pressed={theme === 'light'}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
              <span className="sr-only">
                {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              </span>
            </button>

            {/* Mobile menu toggle */}
            <button 
              className="menu-toggle" 
              onClick={toggleMobileMenu} 
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <span className="menu-toggle-bar"></span>
              <span className="menu-toggle-bar"></span>
              <span className="menu-toggle-bar"></span>
              <span className="sr-only">{isMobileMenuOpen ? "Close menu" : "Open menu"}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          id="mobile-menu"
          className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`} 
          aria-hidden={!isMobileMenuOpen}
        >
          <nav aria-label="Mobile navigation">
            <ul>
              <li>
                <NavLink 
                  to="/#features" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({isActive}) => isActive ? 'active' : ''}
                >
                  Features
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/docs" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({isActive}) => isActive || isDocsPage ? 'active' : ''}
                >
                  Documentation
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/showcase" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({isActive}) => isActive ? 'active' : ''}
                >
                  Showcase
                </NavLink>
              </li>
              <li className="mobile-github-item">
                <a 
                  href="https://github.com/zjayers/assemblejs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-github-link"
                >
                  <FaGithub aria-hidden="true" className="github-icon" />
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-overlay" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </header>
    </>
  );
};

export default Header;