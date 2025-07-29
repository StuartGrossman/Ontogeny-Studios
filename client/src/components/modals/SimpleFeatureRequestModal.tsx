import React, { useState } from 'react';
import { X, Plus, Send } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

interface SimpleFeatureRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  currentUser: any;
}

const SimpleFeatureRequestModal: React.FC<SimpleFeatureRequestModalProps> = ({
  isOpen,
  onClose,
  project,
  currentUser
}) => {
  const [featureDescription, setFeatureDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!featureDescription.trim()) {
      setError('Please describe the feature you want to request.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Add feature request to Firestore
      await addDoc(collection(db, 'feature_requests'), {
        projectId: project.id,
        projectName: project.name || project.projectName,
        description: featureDescription.trim(),
        requestedBy: currentUser?.uid || 'anonymous',
        requestedByEmail: currentUser?.email || '',
        requestedAt: serverTimestamp(),
        status: 'pending',
        priority: 'medium', // Default priority
        category: 'feature',
        adminNotes: '',
        assignedTo: null,
        estimatedCompletion: null,
        completedAt: null
      });

      // Close modal and reset form
      setFeatureDescription('');
      onClose();
      
      // Show success message (you could add a toast notification here)
      console.log('✅ Feature request submitted successfully');
      
    } catch (error) {
      console.error('❌ Error submitting feature request:', error);
      setError('Failed to submit feature request. Please try again.');
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
              <h2>Request a Feature</h2>
              <p className="modal-subtitle">Add a new feature request for {project?.name || project?.projectName}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit} className="feature-request-form">
            <div className="form-group">
              <label className="form-label">
                Feature Description
              </label>
              <textarea
                className="form-textarea"
                value={featureDescription}
                onChange={(e) => setFeatureDescription(e.target.value)}
                placeholder="Describe the feature you'd like to add to this project. Be as detailed as possible to help us understand your needs."
                rows={6}
                required
                disabled={isSubmitting}
              />
              <div className="form-help">
                <p>💡 Tips for a good feature request:</p>
                <ul>
                  <li>Explain what the feature should do</li>
                  <li>Describe why it's needed</li>
                  <li>Include any specific requirements or preferences</li>
                  <li>Mention if it's related to existing functionality</li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !featureDescription.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Feature Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimpleFeatureRequestModal; 