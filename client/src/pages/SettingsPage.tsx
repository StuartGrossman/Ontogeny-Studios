import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SettingsPage from '../components/SettingsPage';
import MobileNavbar from '../components/MobileNavbar';
import '../styles/Settings.css';

const SettingsPageRoute: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!currentUser) {
    navigate('/');
    return null;
  }

  return (
    <div className="settings-page-route">
      {/* Show mobile navbar on mobile devices */}
      {isMobile && (
        <MobileNavbar
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenSettings={() => navigate('/settings')}
          onOpenMessages={() => navigate('/messages')}
          onOpenDashboard={() => navigate('/dashboard')}
        />
      )}
      
      {/* Render settings as full page content */}
      <div className="settings-full-page">
        <SettingsPage
          isOpen={true}
          onClose={() => navigate('/dashboard')}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default SettingsPageRoute; 