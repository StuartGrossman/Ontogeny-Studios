import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Key, Shield, Eye, EyeOff, Plus, Check, AlertCircle } from 'lucide-react';

interface AddAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKeyData: any) => void;
  project?: any;
}

interface APIKey {
  id: string;
  provider: string;
  name: string;
  environment: 'development' | 'staging' | 'production';
  createdAt: Date;
  lastUsed?: Date;
}

const AddAPIKeyModal: React.FC<AddAPIKeyModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    provider: '',
    name: '',
    apiKey: '',
    environment: 'development' as 'development' | 'staging' | 'production',
    description: ''
  });

  // UI state
  const [showAPIKey, setShowAPIKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock existing API keys
  const [existingKeys] = useState<APIKey[]>([
    {
      id: '1',
      provider: 'Stripe',
      name: 'Production Payment Processing',
      environment: 'production',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      provider: 'SendGrid',
      name: 'Email Service',
      environment: 'production',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        provider: '',
        name: '',
        apiKey: '',
        environment: 'development',
        description: ''
      });
      setErrors({});
      setShowAPIKey(false);
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

    if (!formData.provider) {
      newErrors.provider = 'Please select a provider';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'API key name is required';
    }
    if (!formData.apiKey.trim()) {
      newErrors.apiKey = 'API key value is required';
    } else if (formData.apiKey.length < 10) {
      newErrors.apiKey = 'API key seems too short';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const apiKeyData = {
        ...formData,
        projectId: project?.id,
        createdAt: new Date(),
        id: Date.now().toString()
      };

      await onSubmit(apiKeyData);
      handleClose();
    } catch (error) {
      console.error('Error adding API key:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      provider: '',
      name: '',
      apiKey: '',
      environment: 'development',
      description: ''
    });
    setErrors({});
    setShowAPIKey(false);
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

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="api-key-modal-overlay" onClick={handleClose}>
      <div className="api-key-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <Key className="header-icon" />
            <div className="header-text">
              <h2>API Key Management</h2>
              <p>Manage API keys for {project?.name || 'your project'}</p>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Existing API Keys */}
          <div className="existing-keys-section">
            <div className="section-header">
              <h3>
                <Shield size={18} />
                Existing API Keys ({existingKeys.length})
              </h3>
              <span className="section-subtitle">Active integrations for this project</span>
            </div>

            {existingKeys.length > 0 ? (
              <div className="keys-list">
                {existingKeys.map((key) => {
                  const providerInfo = getProviderLabel(key.provider.toLowerCase());
                  return (
                    <div key={key.id} className="key-item">
                      <div className="key-info">
                        <div className="key-header">
                          <div className="provider-info">
                            <span className="provider-icon">
                              {providerInfo?.icon || '🔑'}
                            </span>
                            <span className="provider-name">{key.provider}</span>
                          </div>
                          <span className={`environment-badge ${key.environment}`}>
                            {key.environment}
                          </span>
                        </div>
                        <div className="key-details">
                          <h4 className="key-name">{key.name}</h4>
                          <div className="key-meta">
                            <span>Created {formatRelativeTime(key.createdAt)}</span>
                            {key.lastUsed && (
                              <span>• Last used {formatRelativeTime(key.lastUsed)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="key-actions">
                        <button className="btn-secondary small">
                          <Eye size={14} />
                          View
                        </button>
                        <button className="btn-danger small">
                          <X size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <Key size={48} />
                <h3>No API Keys Yet</h3>
                <p>Add your first API key to enable integrations</p>
              </div>
            )}
          </div>

          {/* Add New API Key Form */}
          <div className="add-key-section">
            <div className="section-header">
              <h3>
                <Plus size={18} />
                Add New API Key
              </h3>
              <span className="section-subtitle">Connect a new service or API</span>
            </div>

            <form onSubmit={handleSubmit} className="api-key-form">
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

              {/* Key Name and Environment */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Key Name</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Production Payments"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                  />
                  {errors.name && (
                    <span className="error-message">
                      <AlertCircle size={14} />
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="environment">Environment</label>
                  <select
                    id="environment"
                    value={formData.environment}
                    onChange={(e) => handleInputChange('environment', e.target.value as any)}
                    className="form-select"
                  >
                    <option value="development">🧪 Development</option>
                    <option value="staging">🔄 Staging</option>
                    <option value="production">🚀 Production</option>
                  </select>
                </div>
              </div>

              {/* API Key Input */}
              <div className="form-group">
                <label htmlFor="apiKey">API Key</label>
                <div className="api-key-input-group">
                  <input
                    id="apiKey"
                    type={showAPIKey ? 'text' : 'password'}
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    placeholder="Paste your API key here"
                    className={`form-input ${errors.apiKey ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAPIKey(!showAPIKey)}
                    className="toggle-visibility"
                  >
                    {showAPIKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.apiKey && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.apiKey}
                  </span>
                )}
                <div className="form-help">
                  <Shield size={12} />
                  <span>API keys are encrypted and stored securely</span>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Add notes about this API key's purpose..."
                  className="form-textarea"
                  rows={3}
                />
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
              <>Adding API Key...</>
            ) : (
              <>
                <Key size={16} />
                Add API Key
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddAPIKeyModal; 