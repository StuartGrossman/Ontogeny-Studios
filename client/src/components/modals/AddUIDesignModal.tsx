import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Palette, Eye, Upload, Download, Star, Heart, Layers, Zap, Sparkles, Image, Monitor, Smartphone, Tablet } from 'lucide-react';

interface AddUIDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (designData: any) => void;
  project?: any;
}

interface DesignAsset {
  id: string;
  name: string;
  type: 'mockup' | 'wireframe' | 'prototype' | 'component' | 'style-guide';
  status: 'requested' | 'in-progress' | 'completed' | 'revision';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  dueDate?: Date;
  designer?: string;
  previewUrl?: string;
}

const AddUIDesignModal: React.FC<AddUIDesignModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    designType: '',
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    targetDevices: [] as string[],
    stylePreferences: '',
    inspirationUrls: '',
    deadline: '',
    additionalNotes: ''
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'request' | 'gallery'>('request');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock existing design assets
  const [existingAssets] = useState<DesignAsset[]>([
    {
      id: '1',
      name: 'Homepage Redesign',
      type: 'mockup',
      status: 'completed',
      priority: 'high',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      designer: 'Sarah Chen',
      previewUrl: '/mockup-preview-1.jpg'
    },
    {
      id: '2',
      name: 'Mobile App Wireframes',
      type: 'wireframe',
      status: 'in-progress',
      priority: 'medium',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      designer: 'Mike Johnson'
    },
    {
      id: '3',
      name: 'Dashboard Components',
      type: 'component',
      status: 'requested',
      priority: 'low',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]);

  // Design types
  const designTypes = [
    { 
      value: 'landing-page', 
      label: 'Landing Page', 
      icon: '🏠',
      description: 'Convert visitors into customers'
    },
    { 
      value: 'dashboard', 
      label: 'Dashboard/Admin', 
      icon: '📊',
      description: 'Control panels and data visualization'
    },
    { 
      value: 'mobile-app', 
      label: 'Mobile App', 
      icon: '📱',
      description: 'Native or web app interfaces'
    },
    { 
      value: 'e-commerce', 
      label: 'E-commerce', 
      icon: '🛒',
      description: 'Product pages and shopping flows'
    },
    { 
      value: 'portfolio', 
      label: 'Portfolio/Showcase', 
      icon: '🎨',
      description: 'Creative and professional portfolios'
    },
    { 
      value: 'blog', 
      label: 'Blog/Content', 
      icon: '📝',
      description: 'Content-focused layouts'
    },
    { 
      value: 'saas', 
      label: 'SaaS Platform', 
      icon: '💼',
      description: 'Software-as-a-Service interfaces'
    },
    { 
      value: 'components', 
      label: 'UI Components', 
      icon: '🧩',
      description: 'Reusable interface elements'
    }
  ];

  // Device targets
  const deviceTargets = [
    { value: 'desktop', label: 'Desktop', icon: Monitor },
    { value: 'tablet', label: 'Tablet', icon: Tablet },
    { value: 'mobile', label: 'Mobile', icon: Smartphone }
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        designType: '',
        title: '',
        description: '',
        priority: 'medium',
        targetDevices: ['desktop'],
        stylePreferences: '',
        inspirationUrls: '',
        deadline: '',
        additionalNotes: ''
      });
      setErrors({});
      setActiveTab('request');
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDeviceToggle = (device: string) => {
    setFormData(prev => ({
      ...prev,
      targetDevices: prev.targetDevices.includes(device)
        ? prev.targetDevices.filter(d => d !== device)
        : [...prev.targetDevices, device]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.designType) {
      newErrors.designType = 'Please select a design type';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Design title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.targetDevices.length === 0) {
      newErrors.targetDevices = 'Select at least one target device';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const designData = {
        ...formData,
        projectId: project?.id,
        createdAt: new Date(),
        id: Date.now().toString(),
        status: 'requested'
      };

      await onSubmit(designData);
      handleClose();
    } catch (error) {
      console.error('Error adding design request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      designType: '',
      title: '',
      description: '',
      priority: 'medium',
      targetDevices: ['desktop'],
      stylePreferences: '',
      inspirationUrls: '',
      deadline: '',
      additionalNotes: ''
    });
    setErrors({});
    setIsSubmitting(false);
    setActiveTab('request');
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'revision': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="ui-design-modal-overlay" onClick={handleClose}>
      <div className="ui-design-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <Palette className="header-icon" />
            <div className="header-text">
              <h2>UI/UX Design Studio</h2>
              <p>Create stunning designs for {project?.name || 'your project'}</p>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'request' ? 'active' : ''}`}
            onClick={() => setActiveTab('request')}
          >
            <Sparkles size={18} />
            New Design Request
          </button>
          <button
            className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            <Layers size={18} />
            Design Gallery ({existingAssets.length})
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'request' ? (
            /* New Design Request Form */
            <div className="design-request-form">
              <form onSubmit={handleSubmit}>
                {/* Design Type Selection */}
                <div className="form-section">
                  <h3>What type of design do you need?</h3>
                  <div className="design-type-grid">
                    {designTypes.map((type) => (
                      <div
                        key={type.value}
                        className={`design-type-card ${
                          formData.designType === type.value ? 'selected' : ''
                        }`}
                        onClick={() => handleInputChange('designType', type.value)}
                      >
                        <div className="type-icon">{type.icon}</div>
                        <div className="type-info">
                          <h4>{type.label}</h4>
                          <p>{type.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.designType && (
                    <span className="error-message">{errors.designType}</span>
                  )}
                </div>

                {/* Basic Information */}
                <div className="form-section">
                  <h3>Project Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="title">Design Title</label>
                      <input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g., Homepage Hero Section"
                        className={`form-input ${errors.title ? 'error' : ''}`}
                      />
                      {errors.title && (
                        <span className="error-message">{errors.title}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="priority">Priority Level</label>
                      <select
                        id="priority"
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="form-select"
                      >
                        <option value="low">🟢 Low Priority</option>
                        <option value="medium">🟡 Medium Priority</option>
                        <option value="high">🔴 High Priority</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description & Requirements</label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe what you need designed, key features, user goals, and any specific requirements..."
                      className={`form-textarea ${errors.description ? 'error' : ''}`}
                      rows={4}
                    />
                    {errors.description && (
                      <span className="error-message">{errors.description}</span>
                    )}
                  </div>
                </div>

                {/* Target Devices */}
                <div className="form-section">
                  <h3>Target Devices</h3>
                  <div className="device-selector">
                    {deviceTargets.map((device) => {
                      const IconComponent = device.icon;
                      return (
                        <div
                          key={device.value}
                          className={`device-option ${
                            formData.targetDevices.includes(device.value) ? 'selected' : ''
                          }`}
                          onClick={() => handleDeviceToggle(device.value)}
                        >
                          <IconComponent size={24} />
                          <span>{device.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {errors.targetDevices && (
                    <span className="error-message">{errors.targetDevices}</span>
                  )}
                </div>

                {/* Style Preferences */}
                <div className="form-section">
                  <h3>Design Preferences</h3>
                  <div className="form-group">
                    <label htmlFor="stylePreferences">Style & Aesthetic</label>
                    <textarea
                      id="stylePreferences"
                      value={formData.stylePreferences}
                      onChange={(e) => handleInputChange('stylePreferences', e.target.value)}
                      placeholder="Describe your preferred style: modern, minimalist, colorful, professional, etc. Include color preferences, typography, or mood..."
                      className="form-textarea"
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="inspirationUrls">Inspiration Links (Optional)</label>
                    <textarea
                      id="inspirationUrls"
                      value={formData.inspirationUrls}
                      onChange={(e) => handleInputChange('inspirationUrls', e.target.value)}
                      placeholder="Share URLs of designs you like, one per line..."
                      className="form-textarea"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Timeline & Notes */}
                <div className="form-section">
                  <h3>Timeline & Additional Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="deadline">Preferred Deadline (Optional)</label>
                      <input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => handleInputChange('deadline', e.target.value)}
                        className="form-input"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="additionalNotes">Additional Notes</label>
                    <textarea
                      id="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                      placeholder="Any other details, constraints, or special requirements..."
                      className="form-textarea"
                      rows={3}
                    />
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* Design Gallery */
            <div className="design-gallery">
              <div className="gallery-header">
                <h3>
                  <Layers size={20} />
                  Your Design Assets
                </h3>
                <p>Track progress and download completed designs</p>
              </div>

              {existingAssets.length > 0 ? (
                <div className="assets-grid">
                  {existingAssets.map((asset) => (
                    <div key={asset.id} className="asset-card">
                      <div className="asset-preview">
                        {asset.previewUrl ? (
                          <div className="preview-image">
                            <Image size={32} />
                          </div>
                        ) : (
                          <div className="preview-placeholder">
                            <Palette size={32} />
                          </div>
                        )}
                        <div className="asset-badges">
                          <span className={`status-badge ${getStatusColor(asset.status)}`}>
                            {asset.status.replace('-', ' ')}
                          </span>
                          <span className={`priority-badge ${getPriorityColor(asset.priority)}`}>
                            {asset.priority}
                          </span>
                        </div>
                      </div>
                      
                      <div className="asset-info">
                        <h4>{asset.name}</h4>
                        <div className="asset-meta">
                          <span className="asset-type">{asset.type.replace('-', ' ')}</span>
                          <span className="asset-date">{formatRelativeTime(asset.createdAt)}</span>
                        </div>
                        {asset.designer && (
                          <div className="designer-info">
                            <span>👨‍🎨 {asset.designer}</span>
                          </div>
                        )}
                        {asset.dueDate && (
                          <div className="due-date">
                            <span>📅 Due {formatRelativeTime(asset.dueDate)}</span>
                          </div>
                        )}
                      </div>

                      <div className="asset-actions">
                        <button className="btn-secondary small">
                          <Eye size={14} />
                          View
                        </button>
                        {asset.status === 'completed' && (
                          <button className="btn-primary small">
                            <Download size={14} />
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-gallery">
                  <Palette size={64} />
                  <h3>No Design Assets Yet</h3>
                  <p>Create your first design request to get started</p>
                  <button
                    onClick={() => setActiveTab('request')}
                    className="btn-primary"
                  >
                    <Sparkles size={16} />
                    Create Design Request
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'request' && (
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
                <>Submitting Request...</>
              ) : (
                <>
                  <Sparkles size={16} />
                  Submit Design Request
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddUIDesignModal; 