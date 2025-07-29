import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Modal.css';

interface MFAModalProps {
  onClose: () => void;
}

const MFAModal: React.FC<MFAModalProps> = ({ onClose }) => {
  const { clearAuthError } = useAuth();

  const handleTryDifferentAccount = () => {
    clearAuthError();
    onClose();
  };

  const handleTryEmailPassword = () => {
    clearAuthError();
    onClose();
    // This will allow the user to try email/password sign-in
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Multi-Factor Authentication Required</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <div className="mfa-message">
            <p>
              Your Google account requires multi-factor authentication (MFA) for security. 
              To sign in to this application, you have a few options:
            </p>
            
            <div className="mfa-options">
              <div className="mfa-option">
                <h3>Option 1: Try a Different Google Account</h3>
                <p>Use a Google account that doesn't have MFA enabled.</p>
                <button 
                  className="button button-primary"
                  onClick={handleTryDifferentAccount}
                >
                  Try Different Account
                </button>
              </div>
              
              <div className="mfa-option">
                <h3>Option 2: Use Email/Password</h3>
                <p>Create a new account or sign in with email and password instead.</p>
                <button 
                  className="button button-secondary"
                  onClick={handleTryEmailPassword}
                >
                  Use Email/Password
                </button>
              </div>
              
              <div className="mfa-option">
                <h3>Option 3: Contact Support</h3>
                <p>If you need help with your specific account setup.</p>
                <button 
                  className="button button-secondary"
                  onClick={() => window.open('mailto:support@ontogenylabs.com', '_blank')}
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="button button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFAModal; 