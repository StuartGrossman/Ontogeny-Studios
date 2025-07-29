import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Settings, 
  MessageCircle, 
  Activity,
  LogOut,
  User,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ontogenyIcon from '../assets/otogeny-icon.png';
import '../styles/MobileNavbar.css';

interface MobileNavbarProps {
  currentUser?: any;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onOpenMessages?: () => void;
  onOpenDashboard?: () => void;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({
  currentUser,
  onLogout,
  onOpenSettings,
  onOpenMessages,
  onOpenDashboard
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowMobileMenu(false);
  };

  const handleNavigation = (action: string) => {
    setShowMobileMenu(false);
    
    switch (action) {
      case 'dashboard':
        if (onOpenDashboard) {
          onOpenDashboard();
        } else {
          navigate('/dashboard');
        }
        break;
      case 'settings':
        if (onOpenSettings) {
          onOpenSettings();
        } else {
          navigate('/settings');
        }
        break;
      case 'messages':
        if (onOpenMessages) {
          onOpenMessages();
        } else {
          navigate('/messages');
        }
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  return (
    <nav className="mobile-navbar">
      <div className="mobile-navbar-content">
        {/* Left - Brand */}
        <div className="mobile-navbar-left">
          <Link to="/" className="mobile-navbar-brand">
            <img src={ontogenyIcon} alt="Ontogeny" className="mobile-navbar-icon" />
            <span className="mobile-navbar-text">Ontogeny</span>
          </Link>
        </div>

        {/* Right - Menu Button */}
        <div className="mobile-navbar-right">
          <button 
            className="mobile-navbar-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="mobile-navbar-overlay">
          <div className="mobile-navbar-menu">
            {/* User Info */}
            {currentUser && (
              <div className="mobile-navbar-user-info">
                <div className="mobile-navbar-user-avatar">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div className="mobile-navbar-user-details">
                  <div className="mobile-navbar-user-name">
                    {currentUser.displayName || 'User'}
                  </div>
                  <div className="mobile-navbar-user-email">
                    {currentUser.email}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <div className="mobile-navbar-nav-items">
              <button 
                className="mobile-navbar-nav-item"
                onClick={() => handleNavigation('dashboard')}
              >
                <Home size={20} />
                <span>Dashboard</span>
              </button>

              <button 
                className="mobile-navbar-nav-item"
                onClick={() => handleNavigation('messages')}
              >
                <MessageCircle size={20} />
                <span>Messages</span>
              </button>

              <button 
                className="mobile-navbar-nav-item"
                onClick={() => handleNavigation('settings')}
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>

              {/* Additional Tools */}
              <div className="mobile-navbar-section">
                <h3 className="mobile-navbar-section-title">Tools</h3>
                <Link to="/inventory" className="mobile-navbar-nav-item">
                  <Activity size={20} />
                  <span>Inventory</span>
                </Link>
                <Link to="/customer-portal" className="mobile-navbar-nav-item">
                  <Activity size={20} />
                  <span>Customer Portal</span>
                </Link>
                <Link to="/api-integration" className="mobile-navbar-nav-item">
                  <Activity size={20} />
                  <span>API Integration</span>
                </Link>
                <Link to="/payroll" className="mobile-navbar-nav-item">
                  <Activity size={20} />
                  <span>Payroll</span>
                </Link>
                <Link to="/scheduling" className="mobile-navbar-nav-item">
                  <Activity size={20} />
                  <span>Scheduling</span>
                </Link>
                <Link to="/logistics" className="mobile-navbar-nav-item">
                  <Activity size={20} />
                  <span>Logistics</span>
                </Link>
              </div>

              {/* Account Actions */}
              <div className="mobile-navbar-section">
                <h3 className="mobile-navbar-section-title">Account</h3>
                <button 
                  className="mobile-navbar-nav-item logout-item"
                  onClick={() => handleNavigation('logout')}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MobileNavbar; 