import React, { useLayoutEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ontogenyIcon from '../assets/otogeny-icon.png';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { currentUser, signInWithGoogle, logout } = useAuth();

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

  const handleLogin = async () => {
    await signInWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-content">
        <div className="nav-left">
          <Link to="/" className="nav-brand">
            <img src={ontogenyIcon} alt="Ontogeny Labs" className="nav-brand-icon" />
            <span className="nav-brand-text">Ontogeny Labs</span>
          </Link>
          {location.pathname !== '/' && location.pathname !== '/examples' && (
            <Link 
              to="/examples" 
              className={`nav-title-link ${location.pathname === '/examples' ? 'active' : ''}`}
            >
              Project Examples
            </Link>
          )}
        </div>
        
        <div className="nav-links">
          {currentUser && location.pathname !== '/' && (
            <Link 
              to="/dashboard" 
              className={`nav-link dashboard-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          )}
          {currentUser ? (
            <button className="nav-button logout-button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className="nav-button login-button" onClick={handleLogin}>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 