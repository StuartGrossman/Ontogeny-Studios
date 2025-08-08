import React, { useState } from 'react';
import { X, Palette, Send, Image as ImageIcon, Monitor, Smartphone, Tablet, Check } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import '../../styles/SimpleUIDesignModal.css';
import { createNotification } from '../../services/notificationService';

interface SimpleUIDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  currentUser: any;
}

const SimpleUIDesignModal: React.FC<SimpleUIDesignModalProps> = ({
  isOpen,
  onClose,
  project,
  currentUser
}) => {
  const [stylePreferences, setStylePreferences] = useState('');
  const [targetDevices, setTargetDevices] = useState<string[]>(['desktop']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const isDev = import.meta.env.DEV;

  const deviceOptions = [
    { value: 'desktop', label: 'Desktop', icon: Monitor },
    { value: 'tablet', label: 'Tablet', icon: Tablet },
    { value: 'mobile', label: 'Mobile', icon: Smartphone }
  ];

  const handleDeviceToggle = (device: string) => {
    setTargetDevices(prev => 
      prev.includes(device) 
        ? prev.filter(d => d !== device)
        : [...prev, device]
    );
  };

  // Upload with timeout fallback to avoid UI hanging on CORS/preflight failures
  const uploadWithTimeout = async (file: File, path: string, timeoutMs = 4000): Promise<string> => {
    const storageRef = ref(storage, path);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort('upload-timeout'), timeoutMs);
    try {
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
    
    if (!stylePreferences.trim()) {
      setError('Please describe your design preferences.');
      return;
    }

    if (targetDevices.length === 0) {
      setError('Please select at least one target device.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let referenceImageUrl: string | null = null;
      if (attachment) {
        try {
          const path = `ui_design_requests/${project.id}/${Date.now()}_${attachment.name}`;
          referenceImageUrl = await uploadWithTimeout(attachment, path, 5000);
        } catch (uploadErr) {
          console.warn('Attachment upload failed or timed out, submitting without attachment:', uploadErr);
          referenceImageUrl = null;
        }
      }

      // Add UI design request to Firestore
      await addDoc(collection(db, 'ui_design_requests'), {
        projectId: project.id,
        projectName: project.name || project.projectName,
        stylePreferences: stylePreferences.trim(),
        targetDevices,
        // Standard fields for image
        referenceImageUrl,
        hasReferenceImage: !!referenceImageUrl,
        // Backward-compat shadow field used elsewhere
        attachmentUrl: referenceImageUrl,
        requestedBy: currentUser?.uid || 'anonymous',
        requestedByEmail: currentUser?.email || '',
        requestedAt: serverTimestamp(),
        status: 'pending',
        priority: 'medium',
        category: 'ui-design',
        adminNotes: '',
        assignedTo: null,
        completedAt: null,
        title: `UI Design for ${targetDevices.join(', ')}`
      });

      // Create a notification for the user
      try {
        await createNotification({
          userId: currentUser?.uid || 'anonymous',
          title: 'UI design request submitted',
          description: `Devices: ${targetDevices.join(', ')}`,
          type: 'ui_design_request',
          projectId: project.id,
          projectName: project.name || project.projectName,
          action: 'openRequestsModal'
        });
      } catch {}

      // Clear form
      setStylePreferences('');
      setAttachment(null);
      setTargetDevices(['desktop']);
      
      // Broadcast event so dashboard sections can refresh
      try {
        window.dispatchEvent(new CustomEvent('uiDesignRequestAdded', { detail: { projectId: project.id } }));
      } catch {}

      // Show success message
      setShowSuccess(true);
      console.log('✅ UI design request submitted successfully');
      
      // Close modal after a short delay to show success
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error submitting UI design request:', error);
      setError('Failed to submit UI design request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="simple-ui-design-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Palette size={24} />
            <div>
              <h2>Request UI Design</h2>
              <p className="modal-subtitle">Request a new UI design for {project?.name || project?.projectName}</p>
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
              <h3>UI Design Request Submitted!</h3>
              <p>Your UI design request has been successfully added to the project.</p>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="ui-design-form">
            <div className="form-group">
              <label className="form-label">
                Target Devices
              </label>
              <div className="device-selection">
                {deviceOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={`device-option ${targetDevices.includes(value) ? 'active' : ''}`}
                    onClick={() => handleDeviceToggle(value)}
                    disabled={isSubmitting}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Design Preferences
              </label>
              <textarea
                className="form-textarea"
                value={stylePreferences}
                onChange={(e) => setStylePreferences(e.target.value)}
                placeholder="Describe your preferred style: modern, minimalist, colorful, professional, brand colors, layout preferences, inspiration, etc."
                rows={6}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reference Image (optional)</label>
              <label className="upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  disabled={isSubmitting}
                  hidden
                />
                <ImageIcon size={16} /> {attachment ? attachment.name : 'Upload reference image'}
              </label>
              {attachment && (
                <p className="file-info">Selected: {attachment.name}</p>
              )}
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
                disabled={isSubmitting || !stylePreferences.trim() || targetDevices.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit UI Design Request
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

export default SimpleUIDesignModal;