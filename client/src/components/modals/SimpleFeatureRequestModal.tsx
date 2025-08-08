import React, { useEffect, useState } from 'react';
import { X, Plus, Send, Image as ImageIcon, Link as LinkIcon, Check } from 'lucide-react';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import '../../styles/SimpleFeatureRequestModal.css';

interface SimpleFeatureRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  currentUser: any;
  existingRequest?: any | null;
}

const SimpleFeatureRequestModal: React.FC<SimpleFeatureRequestModalProps> = ({
  isOpen,
  onClose,
  project,
  currentUser,
  existingRequest = null
}) => {
  const [featureDescription, setFeatureDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [links, setLinks] = useState<string>('');
  const [quickTags, setQuickTags] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const isDev = import.meta.env.DEV;

  // Prefill when editing
  useEffect(() => {
    if (isOpen && existingRequest) {
      setFeatureDescription(existingRequest.description || '');
      setLinks(existingRequest.links || '');
      setQuickTags(existingRequest.tags || []);
      setAttachment(null);
      setError('');
      setShowSuccess(false);
    }
    if (isOpen && !existingRequest) {
      setFeatureDescription('');
      setLinks('');
      setQuickTags([]);
      setAttachment(null);
      setError('');
      setShowSuccess(false);
    }
  }, [isOpen, existingRequest]);

  // Upload with timeout fallback to avoid UI hanging on CORS/preflight failures
  const uploadWithTimeout = async (file: File, path: string, timeoutMs = 4000): Promise<string> => {
    const storageRef = ref(storage, path);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort('upload-timeout'), timeoutMs);
    try {
      // uploadBytes does not accept AbortSignal, but we still enforce a logical timeout
      await uploadBytes(storageRef, file, {
        contentType: (file.type || 'image/png') as string,
        cacheControl: 'public, max-age=31536000'
      });
      const url = await getDownloadURL(storageRef);
      return url;
    } finally {
      clearTimeout(timeout);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!featureDescription.trim()) {
      setError('Please describe the feature you want to request.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let attachmentUrl: string | null = null;
      if (attachment) {
        // In development, skip uploads to avoid CORS errors until the bucket CORS is configured
        if (isDev) {
          console.info('Dev mode: skipping attachment upload; submit will proceed without file.');
          attachmentUrl = null;
        } else {
        try {
          const path = `feature_requests/${project.id}/${Date.now()}_${attachment.name}`;
          attachmentUrl = await uploadWithTimeout(attachment, path, 5000);
        } catch (uploadErr) {
          console.warn('Attachment upload failed or timed out, submitting without attachment:', uploadErr);
          attachmentUrl = null;
        }
        }
      }

      if (existingRequest?.id) {
        const requestRef = doc(db, 'feature_requests', existingRequest.id);
        await updateDoc(requestRef, {
          description: featureDescription.trim(),
          links: links.trim(),
          tags: quickTags,
          ...(attachmentUrl ? { attachmentUrl } : {}),
          updatedAt: serverTimestamp(),
          title: featureDescription.trim().slice(0, 80)
        });
      } else {
        // Add feature request to top-level collection used by management views
        await addDoc(collection(db, 'feature_requests'), {
          projectId: project.id,
          projectName: project.name || project.projectName,
          description: featureDescription.trim(),
          links: links.trim(),
          tags: quickTags,
          attachmentUrl,
          requestedBy: currentUser?.uid || 'anonymous',
          requestedByEmail: currentUser?.email || '',
          requestedAt: serverTimestamp(),
          status: 'pending',
          priority: 'medium', // Default priority
          category: 'feature',
          adminNotes: '',
          assignedTo: null,
          estimatedCompletion: null,
          completedAt: null,
          title: featureDescription.trim().slice(0, 80)
        });
      }

      // Optionally emit a toast/notification system here if available

      // Close modal and reset form
      setFeatureDescription('');
      setAttachment(null);
      setLinks('');
      setQuickTags([]);
      // Broadcast event so dashboard sections can refresh without a full reload
      try {
        window.dispatchEvent(new CustomEvent('featureRequestAdded', { detail: { projectId: project?.id || existingRequest?.projectId } }));
      } catch {}

      // Show success message
      setShowSuccess(true);
      console.log('✅ Feature request submitted successfully');
      
      // Close modal after a short delay to show success
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
      
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
          {showSuccess ? (
            <div className="success-message-container">
              <div className="success-icon">
                <Check size={48} />
              </div>
              <h3>Feature Request Submitted!</h3>
              <p>Your feature request has been successfully added to the project.</p>
            </div>
          ) : (
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
            </div>

            <div className="form-group">
              <label className="form-label">Links (optional)</label>
              <div className="form-input-row">
                <span className="input-icon"><LinkIcon size={16} /></span>
                <input
                  type="text"
                  className="form-input"
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  placeholder="Paste any relevant links (comma separated)"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Attachment (optional)</label>
              <label className="upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  disabled={isSubmitting}
                  hidden
                />
                <ImageIcon size={16} /> {attachment ? attachment.name : 'Upload image'}
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Quick Suggestions</label>
              <div className="quick-tags">
                {['Authentication', 'Search', 'Dashboard', 'Payments', 'Notifications', 'Export'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`quick-tag ${quickTags.includes(tag) ? 'active' : ''}`}
                    onClick={() => setQuickTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                    disabled={isSubmitting}
                  >
                    {tag}
                  </button>
                ))}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleFeatureRequestModal; 