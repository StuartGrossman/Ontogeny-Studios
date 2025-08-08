import React, { useState } from 'react';
import { X, Plus, Send, Building2, Check } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../styles/SimpleFeatureRequestModal.css';
import { createNotification } from '../../services/notificationService';

interface SimpleProjectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

const APP_TYPES = [
  'Marketing Website',
  'E‑commerce Store',
  'SaaS Web App',
  'Admin Dashboard',
  'Mobile Web App',
  'Customer Portal',
  'Internal Tool',
  'Analytics/Reporting',
  'Content Platform',
  'Other'
];

const SimpleProjectRequestModal: React.FC<SimpleProjectRequestModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [projectType, setProjectType] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectType) {
      setError('Please select a web application type.');
      return;
    }
    if (!businessType.trim()) {
      setError('Please specify your business type.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a general breakdown of what you need.');
      return;
    }
    if (description.length > 3000) {
      setError('Description must be 3000 characters or less.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create a minimal user project request document for admin review
      await addDoc(collection(db, 'user_project_requests'), {
        name: `${projectType} Request`,
        projectName: `${projectType} Request`,
        description: description.trim(),
        appType: projectType,
        businessType: businessType.trim(),
        requestedBy: currentUser?.uid || 'anonymous',
        requestedByEmail: currentUser?.email || '',
        requestedByName: currentUser?.displayName || '',
        status: 'pending',
        priority: 'medium',
        isNewProject: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Broadcast so dashboards/management can refresh
      try {
        window.dispatchEvent(new CustomEvent('projectRequestAdded', { detail: {} }));
      } catch {}

      // Create a notification for the submitting user
      try {
        await createNotification({
          userId: currentUser?.uid || 'anonymous',
          title: 'Project request submitted',
          description: `${projectType} • ${businessType}`,
          type: 'admin_action',
          action: 'openRequestsModal'
        });
      } catch {}

      // Success UX
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setProjectType('');
        setBusinessType('');
        setDescription('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error submitting project request:', err);
      setError('Failed to submit project request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="simple-feature-request-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Plus size={24} />
            <div>
              <h2>Request a New Project</h2>
              <p className="modal-subtitle">Tell us about the web application you need</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {showSuccess ? (
            <div className="success-message-container">
              <div className="success-icon">
                <Check size={48} />
              </div>
              <h3>Project Request Submitted!</h3>
              <p>Your request has been sent to our team for review.</p>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="feature-request-form">
            <div className="form-group">
              <label className="form-label">Web Application Type</label>
              <select
                className="form-input"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Select a type...</option>
                {APP_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Building2 size={16} /> Business Type
              </label>
              <input
                type="text"
                className="form-input"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g., Landscaping, Retail, Healthcare, SaaS, Non‑profit"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">General Breakdown (max 3000 chars)</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the goals, key features, user types, integrations, and any timelines."
                rows={8}
                maxLength={3000}
                disabled={isSubmitting}
                required
              />
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}

            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting || !projectType || !businessType.trim() || !description.trim()}>
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Project Request
                  </>
                )}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleProjectRequestModal;

