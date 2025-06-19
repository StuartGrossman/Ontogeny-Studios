import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown } from 'lucide-react';
import ontogenyIcon from '../assets/otogeny-icon.png';
import '../styles/ExampleNavbar.css';

interface ExamplePage {
  title: string;
  route: string;
  description: string;
}

const examplePages: ExamplePage[] = [
  {
    title: 'Business Logistics',
    route: '/logistics',
    description: 'Supply chain and logistics management'
  },
  {
    title: 'Enterprise Scheduling',
    route: '/scheduling',
    description: 'AI-powered scheduling optimization'
  },
  {
    title: 'Payroll Automation',
    route: '/payroll',
    description: 'Automated payroll and compliance'
  },
  {
    title: 'API Integration Hub',
    route: '/api-integration',
    description: 'Unified API management platform'
  },
  {
    title: 'Inventory Management',
    route: '/inventory',
    description: 'Smart inventory tracking system'
  },
  {
    title: 'Customer Portal',
    route: '/customer-portal',
    description: 'Self-service customer platform'
  }
];

const ExampleNavbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signInWithGoogle, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogin = async () => {
    await signInWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getCurrentPageTitle = () => {
    const currentPage = examplePages.find(page => page.route === location.pathname);
    return currentPage ? currentPage.title : 'Examples';
  };

  const getOtherPages = () => {
    return examplePages.filter(page => page.route !== location.pathname);
  };

  return (
    <nav className="example-navbar">
      <div className="example-navbar-content">
        <div className="nav-left">
          <Link to="/" className="nav-brand">
            <img src={ontogenyIcon} alt="Ontogeny Labs" className="nav-brand-icon" />
            <span className="nav-brand-text">Ontogeny Labs</span>
          </Link>
          
          <div className="nav-divider">|</div>
          
          <div className="examples-dropdown" ref={dropdownRef}>
            <button
              className="dropdown-trigger"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
            >
              <span className="current-page">{getCurrentPageTitle()}</span>
              <ChevronDown 
                className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} 
                size={16} 
              />
            </button>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link 
                  to="/examples" 
                  className="dropdown-item overview-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="dropdown-item-content">
                    <span className="dropdown-item-title">All Examples</span>
                    <span className="dropdown-item-description">View all project examples</span>
                  </div>
                </Link>
                <div className="dropdown-divider"></div>
                {getOtherPages().map((page) => (
                  <Link
                    key={page.route}
                    to={page.route}
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <div className="dropdown-item-content">
                      <span className="dropdown-item-title">{page.title}</span>
                      <span className="dropdown-item-description">{page.description}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="nav-right">
          {currentUser && (
            <Link 
              to="/dashboard" 
              className="nav-link dashboard-link"
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

export default ExampleNavbar; 