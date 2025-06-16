import React, { useLayoutEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  // Set CSS variable for nav height at runtime
  useLayoutEffect(() => {
    const setHeight = () => {
      if (navRef.current) {
        const height = navRef.current.offsetHeight;
        document.documentElement.style.setProperty('--nav-height', `${height}px`);
      }
    };
    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-content">
        <Link to="/" className="nav-brand">
          Ontogeny Labs
        </Link>
        
        <div className="nav-links">
          
          <button className="nav-button login-button">
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 