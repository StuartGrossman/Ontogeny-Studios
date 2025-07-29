import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Key, AlertCircle, Plus, Bell, Users, Check } from 'lucide-react';

interface AddRequiredAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requiredAPIKeyData: any) => void;
  project?: any;
}

interface RequiredAPIKey {
  id: string;
  keyName: string;
  provider: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'requested' | 'provided' | 'verified';
  requestedBy: string;
  requestedAt: Date;
  providedAt?: Date;
  providedBy?: string;
  keyValue?: string;
  adminNotes?: string;
}

const AddRequiredAPIKeyModal: React.FC<AddRequiredAPIKeyModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    keyName: '',
    provider: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    adminNotes: ''
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock existing required API keys
  const [existingRequiredKeys] = useState<RequiredAPIKey[]>([
    {
      id: '1',
      keyName: 'Stripe Secret Key',
      provider: 'Stripe',
      description: 'Required for payment processing integration',
      priority: 'critical',
      status: 'pending',
      requestedBy: 'Admin User',
      requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      keyName: 'SendGrid API Key',
      provider: 'SendGrid',
      description: 'Required for email service integration',
      priority: 'high',
      status: 'requested',
      requestedBy: 'Admin User',
      requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]);

  // API providers
  const providers = [
    { 
      category: 'Payment Processing',
      options: [
        { value: 'stripe', label: 'Stripe', icon: '💳' },
        { value: 'paypal', label: 'PayPal', icon: '💰' },
        { value: 'square', label: 'Square', icon: '🔷' }
      ]
    },
    {
      category: 'Communication',
      options: [
        { value: 'sendgrid', label: 'SendGrid', icon: '📧' },
        { value: 'mailgun', label: 'Mailgun', icon: '📮' },
        { value: 'twilio', label: 'Twilio', icon: '📱' }
      ]
    },
    {
      category: 'Cloud Services',
      options: [
        { value: 'aws', label: 'Amazon AWS', icon: '☁️' },
        { value: 'google-cloud', label: 'Google Cloud', icon: '🌐' },
        { value: 'azure', label: 'Microsoft Azure', icon: '🔵' }
      ]
    },
    {
      category: 'Analytics',
      options: [
        { value: 'google-analytics', label: 'Google Analytics', icon: '📊' },
        { value: 'mixpanel', label: 'Mixpanel', icon: '📈' },
        { value: 'amplitude', label: 'Amplitude', icon: '📉' }
      ]
    },
    {
      category: 'Other',
      options: [
        { value: 'custom', label: 'Custom API', icon: '⚙️' }
      ]
    }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low Priority', icon: '🟢', description: 'Nice to have' },
    { value: 'medium', label: 'Medium Priority', icon: '🟡', description: 'Important for functionality' },
    { value: 'high', label: 'High Priority', icon: '🟠', description: 'Critical for core features' },
    { value: 'critical', label: 'Critical Priority', icon: '🔴', description: 'Required for launch' }
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        keyName: '',
        provider: '',
        description: '',
        priority: 'medium',
        adminNotes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.keyName.trim()) {
      newErrors.keyName = 'API key name is required';
    }
    if (!formData.provider) {
      newErrors.provider = 'Please select a provider';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const requiredAPIKeyData = {
        ...formData,
        projectId: project?.id,
        projectName: project?.name,
        createdAt: new Date(),
        id: Date.now().toString(),
        status: 'pending',
        requestedBy: 'Admin', // This would come from the current admin user
        requestedAt: new Date()
      };

      await onSubmit(requiredAPIKeyData);
      handleClose();
    } catch (error) {
      console.error('Error adding required API key:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      keyName: '',
      provider: '',
      description: '',
      priority: 'medium',
      adminNotes: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const getProviderLabel = (value: string) => {
    for (const category of providers) {
      const provider = category.options.find(p => p.value === value);
      if (provider) return provider;
    }
    return null;
  };

  const getPriorityInfo = (priority: string) => {
    return priorityOptions.find(p => p.value === priority);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-700 bg-gray-100';
      case 'requested': return 'text-blue-700 bg-blue-100';
      case 'provided': return 'text-green-700 bg-green-100';
      case 'verified': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="required-api-key-modal-overlay" onClick={handleClose}>
      <div className="required-api-key-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <Bell className="header-icon" />
            <div className="header-text">
              <h2>Request API Key from Client</h2>
              <p>Create a request for {project?.name || 'the project'} client to provide an API key</p>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Existing Required API Keys */}
          <div className="existing-required-keys-section">
            <div className="section-header">
              <h3>
                <Users size={18} />
                Existing API Key Requests ({existingRequiredKeys.length})
              </h3>
              <span className="section-subtitle">Keys requested from the client</span>
            </div>

            {existingRequiredKeys.length > 0 ? (
              <div className="required-keys-grid">
                {existingRequiredKeys.map((requiredKey) => (
                  <div key={requiredKey.id} className="required-key-card">
                    <div className="key-header">
                      <div className="key-info">
                        <h4>{requiredKey.keyName}</h4>
                        <span className="provider-tag">{requiredKey.provider}</span>
                      </div>
                      <div className="key-meta">
                        <span className={`priority-badge ${requiredKey.priority}`}>
                          {getPriorityInfo(requiredKey.priority)?.icon} {requiredKey.priority}
                        </span>
                        <span className={`status-badge ${getStatusColor(requiredKey.status)}`}>
                          {requiredKey.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="key-content">
                      <p className="key-description">{requiredKey.description}</p>
                      <div className="key-details">
                        <div className="detail-row">
                          <span className="detail-label">Requested by:</span>
                          <span>{requiredKey.requestedBy}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Requested on:</span>
                          <span>{formatDate(requiredKey.requestedAt)}</span>
                        </div>
                        {requiredKey.providedAt && (
                          <div className="detail-row">
                            <span className="detail-label">Provided on:</span>
                            <span>{formatDate(requiredKey.providedAt)}</span>
                          </div>
                        )}
                      </div>
                      
                      {requiredKey.adminNotes && (
                        <div className="admin-notes">
                          <strong>Admin Notes:</strong>
                          <p>{requiredKey.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Bell size={48} />
                <h3>No API Key Requests Yet</h3>
                <p>Create your first API key request for the client</p>
              </div>
            )}
          </div>

          {/* Add New Required API Key Form */}
          <div className="add-required-key-section">
            <div className="section-header">
              <h3>
                <Plus size={18} />
                Request New API Key
              </h3>
              <span className="section-subtitle">Create a new request for the client to provide an API key</span>
            </div>

            <form onSubmit={handleSubmit} className="required-api-key-form">
              {/* Provider Selection */}
              <div className="form-group">
                <label htmlFor="provider">Service Provider</label>
                <select
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                  className={`form-select ${errors.provider ? 'error' : ''}`}
                >
                  <option value="">Select a service provider</option>
                  {providers.map((category) => (
                    <optgroup key={category.category} label={category.category}>
                      {category.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {errors.provider && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.provider}
                  </span>
                )}
              </div>

              {/* Key Name */}
              <div className="form-group">
                <label htmlFor="keyName">API Key Name</label>
                <input
                  id="keyName"
                  type="text"
                  value={formData.keyName}
                  onChange={(e) => handleInputChange('keyName', e.target.value)}
                  placeholder="e.g., Stripe Secret Key, SendGrid API Key"
                  className={`form-input ${errors.keyName ? 'error' : ''}`}
                />
                {errors.keyName && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.keyName}
                  </span>
                )}
                <div className="form-help">
                  Be specific about which API key you need from the client
                </div>
              </div>

              {/* Priority Selection */}
              <div className="form-group">
                <label htmlFor="priority">Priority Level</label>
                <div className="priority-options">
                  {priorityOptions.map((priority) => (
                    <div
                      key={priority.value}
                      className={`priority-option ${formData.priority === priority.value ? 'selected' : ''}`}
                      onClick={() => handleInputChange('priority', priority.value)}
                    >
                      <div className="priority-icon">{priority.icon}</div>
                      <div className="priority-info">
                        <h4>{priority.label}</h4>
                        <p>{priority.description}</p>
                      </div>
                      {formData.priority === priority.value && (
                        <Check size={16} className="check-icon" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Explain why this API key is needed and how it will be used..."
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  rows={3}
                />
                {errors.description && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.description}
                  </span>
                )}
                <div className="form-help">
                  Provide clear instructions for the client about what API key is needed
                </div>
              </div>

              {/* Admin Notes */}
              <div className="form-group">
                <label htmlFor="adminNotes">Admin Notes (Optional)</label>
                <textarea
                  id="adminNotes"
                  value={formData.adminNotes}
                  onChange={(e) => handleInputChange('adminNotes', e.target.value)}
                  placeholder="Internal notes about this request..."
                  className="form-textarea"
                  rows={2}
                />
                <div className="form-help">
                  Internal notes that won't be shown to the client
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? (
              <>Creating Request...</>
            ) : (
              <>
                <Bell size={16} />
                Request API Key
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddRequiredAPIKeyModal; 