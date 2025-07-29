import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Trash2, X, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../styles/SecureDeleteProjectModal.css';

interface SecureDeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  projectId: string;
  projectName: string;
  currentUser: any;
}

const SecureDeleteProjectModal: React.FC<SecureDeleteProjectModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  projectId,
  projectName,
  currentUser
}) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'password' | 'authorization' | 'confirm'>('password');
  const [error, setError] = useState('');
  const [projectData, setProjectData] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAdminPassword('');
      setShowPassword(false);
      setIsVerifying(false);
      setVerificationStep('password');
      setError('');
      setProjectData(null);
      setIsAuthorized(false);
      setIsSubmitting(false);
      loadProjectData();
    }
  }, [isOpen, projectId]);

  const loadProjectData = async () => {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (projectDoc.exists()) {
        setProjectData(projectDoc.data());
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      setError('Failed to load project data');
    }
  };

  const verifyAdminPassword = async () => {
    if (!adminPassword.trim()) {
      setError('Please enter your admin password');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Get admin user data to check secondary password
      const adminDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!adminDoc.exists()) {
        setError('Admin user data not found');
        return;
      }

      const adminData = adminDoc.data();
      const secondaryPassword = adminData.secondaryPassword;

      if (!secondaryPassword) {
        setError('You must set up a secondary password in your settings before deleting projects');
        return;
      }

      if (adminPassword !== secondaryPassword) {
        setError('Incorrect admin password');
        setAdminPassword('');
        return;
      }

      // Password is correct, check authorization
      await checkProjectAuthorization();
    } catch (error) {
      console.error('Error verifying admin password:', error);
      setError('Failed to verify admin password');
    } finally {
      setIsVerifying(false);
    }
  };

  const checkProjectAuthorization = async () => {
    if (!projectData) {
      setError('Project data not available');
      return;
    }

    // Check if current admin is assigned to this project
    const assignments = projectData.assignments || [];
    const isAssigned = assignments.some((assignment: any) => 
      assignment.userId === currentUser.uid
    );

    if (!isAssigned) {
      setError('You are not authorized to delete this project. Only admins assigned to this project can delete it.');
      return;
    }

    setIsAuthorized(true);
    setVerificationStep('confirm');
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Call the parent's delete function
      await onConfirmDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="secure-delete-modal-overlay" onClick={onClose}>
      <div className="secure-delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-icon">
            <Shield size={24} />
          </div>
          <div className="header-content">
            <h2>Secure Project Deletion</h2>
            <p>Additional verification required to delete this project</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {verificationStep === 'password' && (
            <div className="verification-step">
              <div className="step-header">
                <div className="step-number">1</div>
                <h3>Admin Password Verification</h3>
              </div>
              
              <div className="project-info">
                <h4>Project: {projectName}</h4>
                <p>You are about to delete this project. This action requires your admin password.</p>
              </div>

              <div className="form-group">
                <label htmlFor="adminPassword">Admin Password</label>
                <div className="password-input-group">
                  <input
                    id="adminPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter your admin password"
                    className="form-input"
                    disabled={isVerifying}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    disabled={isVerifying}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="form-help">
                  This is the secondary password you set up in your account settings
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button
                  onClick={onClose}
                  className="btn-secondary"
                  disabled={isVerifying}
                >
                  Cancel
                </button>
                <button
                  onClick={verifyAdminPassword}
                  className="btn-primary"
                  disabled={isVerifying || !adminPassword.trim()}
                >
                  {isVerifying ? (
                    <>
                      <div className="loading-spinner"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      Verify Password
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {verificationStep === 'confirm' && (
            <div className="verification-step">
              <div className="step-header">
                <div className="step-number">2</div>
                <h3>Authorization Confirmed</h3>
              </div>

              <div className="authorization-success">
                <CheckCircle size={48} className="success-icon" />
                <h4>Authorization Verified</h4>
                <p>You are authorized to delete this project.</p>
              </div>

              <div className="final-warning">
                <AlertTriangle size={24} className="warning-icon" />
                <div className="warning-content">
                  <h4>Final Warning</h4>
                  <p>This action will:</p>
                  <ul>
                    <li>Mark the project as deleted (soft delete)</li>
                    <li>Hide it from active project lists</li>
                    <li>Preserve all project data for potential restoration</li>
                    <li>Record your identity as the admin who performed this action</li>
                  </ul>
                  <p><strong>This action can be undone by restoring the project later.</strong></p>
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={() => setVerificationStep('password')}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="btn-danger"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="loading-spinner"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Project
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecureDeleteProjectModal; 