import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X,
  Activity,
  MessageCircle,
  CheckCircle,
  Folder,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUnreadMessageCount } from '../services/messagingService';
import { getActiveProjects } from '../services/projectService';
import ontogenyIcon from '../assets/otogeny-icon.png';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { currentUser, signInWithGoogle, logout, authError, clearAuthError } = useAuth();
  
  // State for enhanced navbar features
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

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



  const loadUnreadMessages = () => {
    if (!currentUser?.uid) return;

    try {
      const unsubscribe = getUnreadMessageCount(currentUser.uid, (count) => {
        setUnreadMessages(count);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading unread messages:', error);
      setUnreadMessages(0);
    }
  };

  // Cleanup subscriptions when component unmounts
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (currentUser?.uid) {
      unsubscribe = getUnreadMessageCount(currentUser.uid, (count) => {
        setUnreadMessages(count);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser?.uid]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.nav-dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Debug activeDropdown state changes
  useEffect(() => {
    console.log('🔄 activeDropdown state changed to:', activeDropdown);
  }, [activeDropdown]);

  const handleLogin = async () => {
    clearAuthError();
    await signInWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const loadActiveProjects = async () => {
    if (!currentUser?.uid) {
      console.log('No authenticated user, skipping active projects load');
      return;
    }
    
    setLoadingProjects(true);
    try {
      console.log('🔍 Loading active projects for user:', currentUser.uid);
      console.log('🔍 User email:', currentUser.email);
      console.log('🔍 User display name:', currentUser.displayName);
      
      const projects = await getActiveProjects(currentUser.uid);
      console.log('📊 Projects returned from getActiveProjects:', projects);
      console.log('📊 Project count:', projects.length);
      console.log('📊 Project details:', projects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        userId: p.userId
      })));
      
      setActiveProjects(projects);
      console.log('✅ Successfully set active projects in state');
    } catch (error) {
      console.error('❌ Error loading active projects:', error);
      // Don't show error to user, just set empty array
      setActiveProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  return (
    <>
      {authError && (
        <div className="auth-error-banner">
          <div className="auth-error-content">
            <span className="auth-error-message">{authError}</span>
            <button className="auth-error-close" onClick={clearAuthError}>×</button>
          </div>
        </div>
      )}
      <nav className="navbar" ref={navRef}>
        <div className="navbar-content">
        {/* Left Section - Brand */}
        <div className="nav-left">
          <Link to="/" className="nav-brand">
            <img src={ontogenyIcon} alt="Ontogeny Labs" className="nav-brand-icon" />
            <span className="nav-brand-text">Ontogeny Labs</span>
          </Link>
          
          {/* Page Title */}
          {location.pathname === '/dashboard' && (
            <span className="nav-title-link active">
              Dashboard
            </span>
          )}
          {location.pathname === '/examples' && (
            <Link 
              to="/examples" 
              className="nav-title-link active"
            >
              Project Examples
            </Link>
          )}
          {location.pathname !== '/' && location.pathname !== '/examples' && location.pathname !== '/dashboard' && (
            <Link 
              to="/examples" 
              className="nav-title-link"
            >
              Project Examples
            </Link>
          )}
        </div>
        
        {/* Center Section - Navigation */}
        <div className="nav-center">
          {currentUser && (
            <>
              {/* Dashboard/Management Button - Context Aware */}
              {location.pathname === '/management' ? (
                <Link to="/dashboard" className="nav-button">
                  <Activity size={20} />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link to="/management" className="nav-button">
                  <Settings size={20} />
                  <span>Management</span>
                </Link>
              )}

              {/* Projects Dropdown */}
              <div className="nav-dropdown">

                <button 
                  className={`nav-button dropdown-toggle ${activeDropdown === 'projects' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('🔽 Projects dropdown clicked!');
                    console.log('Current activeDropdown:', activeDropdown);
                    console.log('Current user:', currentUser?.uid);
                    if (!currentUser?.uid) {
                      console.log('User not authenticated, cannot load projects');
                      return;
                    }
                    if (activeDropdown !== 'projects') {
                      console.log('Loading active projects...');
                      loadActiveProjects();
                    }
                    const newState = activeDropdown === 'projects' ? null : 'projects';
                    setActiveDropdown(newState);
                  }}
                >
                  <Activity size={20} />
                  <span>Projects</span>
                  <ChevronDown size={16} />
                </button>
                {activeDropdown === 'projects' && (
                  <div className="nav-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    {loadingProjects ? (
                      <div className="nav-dropdown-item">
                        <Activity size={16} />
                        <span>Loading projects...</span>
                      </div>
                    ) : activeProjects.length > 0 ? (
                      <>
                        {activeProjects.map((project) => (
                          <Link 
                            key={project.id} 
                            to={`/dashboard?project=${project.id}`} 
                            className="nav-dropdown-item" 
                            onClick={() => setActiveDropdown(null)}
                          >
                            <Folder size={16} />
                            <span>{project.name}</span>
                          </Link>
                        ))}
                        <div className="nav-dropdown-divider"></div>
                        <Link to="/dashboard?view=all" className="nav-dropdown-item" onClick={() => setActiveDropdown(null)}>
                          <Activity size={16} />
                          <span>View All Projects</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="nav-dropdown-item">
                          <Activity size={16} />
                          <span>No active projects</span>
                        </div>
                        <div className="nav-dropdown-divider"></div>
                        <Link to="/dashboard?view=all" className="nav-dropdown-item" onClick={() => setActiveDropdown(null)}>
                          <Activity size={16} />
                          <span>View All Projects</span>
                        </Link>
                        <div className="nav-dropdown-divider"></div>
                        <Link to="/dashboard?view=create" className="nav-dropdown-item" onClick={() => setActiveDropdown(null)}>
                          <Plus size={16} />
                          <span>Create New Project</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Section - User Actions */}
        <div className="nav-right">
          {currentUser ? (
            <>
              {/* Messages Alert */}
              <div className="nav-messages">
                <Link to="/messages" className="nav-button messages-button">
                  <MessageCircle size={20} />
                  {unreadMessages > 0 && (
                    <span className="messages-badge">{unreadMessages}</span>
                  )}
                </Link>
              </div>

              {/* User Profile - Desktop Hidden, Mobile Only */}
              <div className="nav-user-profile desktop-hidden">
                <button 
                  className="nav-button user-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="Profile" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <span className="user-name">{currentUser.displayName || currentUser.email}</span>
                  <ChevronDown size={16} />
                </button>
                
                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="user-menu-dropdown">
                    <div className="user-menu-header">
                      <div className="user-info">
                        <div className="user-avatar-large">
                          {currentUser.photoURL ? (
                            <img src={currentUser.photoURL} alt="Profile" />
                          ) : (
                            <User size={24} />
                          )}
                        </div>
                        <div className="user-details">
                          <div className="user-name-large">{currentUser.displayName || 'User'}</div>
                          <div className="user-email">{currentUser.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="user-menu-items">
                      <Link to="/settings" className="user-menu-item">
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                      <button className="user-menu-item logout-item" onClick={handleLogout}>
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button className="nav-button login-button" onClick={handleLogin}>
              Login
            </button>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="nav-button mobile-menu-button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu">
          {currentUser ? (
            <>
              {/* Main Navigation */}
              <div className="mobile-menu-section">
                <h3 className="mobile-menu-section-title">Navigation</h3>
                <Link 
                  to="/dashboard" 
                  className="mobile-menu-item"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Activity size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/messages" 
                  className="mobile-menu-item"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <MessageCircle size={18} />
                  <span>Messages</span>
                  {unreadMessages > 0 && (
                    <span className="mobile-messages-badge">{unreadMessages}</span>
                  )}
                </Link>
                <Link 
                  to="/settings" 
                  className="mobile-menu-item"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
              </div>

              {/* Admin Navigation */}
              <div className="mobile-menu-section">
                <h3 className="mobile-menu-section-title">Admin</h3>
                <Link 
                  to="/management" 
                  className="mobile-menu-item"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Settings size={18} />
                  <span>Management</span>
                </Link>
              </div>

              {/* User Actions */}
              <div className="mobile-menu-section">
                <h3 className="mobile-menu-section-title">Account</h3>
                <button 
                  className="mobile-menu-item logout-item"
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <button 
              className="mobile-menu-item login-item"
              onClick={() => {
                handleLogin();
                setShowMobileMenu(false);
              }}
            >
              Login
            </button>
          )}
        </div>
      )}
    </nav>
    </>
  );
};

export default Navbar; 