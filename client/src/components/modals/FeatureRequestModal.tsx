import React, { useState } from 'react';
import { X, Settings, Clock, Zap, Calendar, Code, Database, Globe } from 'lucide-react';

interface FeatureRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (featureData: any) => void;
  onBack: () => void;
  conversationData: any;
  project: any;
}

const FeatureRequestModal: React.FC<FeatureRequestModalProps> = ({
  isOpen,
  onClose,
  onNext,
  onBack,
  conversationData,
  project
}) => {
  const [formData, setFormData] = useState({
    featureName: conversationData?.featureName || '',
    description: conversationData?.description || '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    urgency: 'normal' as 'urgent' | 'normal' | 'low',
    category: 'feature' as 'feature' | 'bug-fix' | 'enhancement' | 'integration',
    hasApiIntegration: false,
    apiDetails: '',
    estimatedComplexity: 'medium' as 'low' | 'medium' | 'high',
    businessImpact: '',
    acceptanceCriteria: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    onNext({
      ...formData,
      project,
      conversationData
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="feature-request-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Settings size={24} />
            <div>
              <h2>Feature Request Details</h2>
              <p className="modal-subtitle">Refine your feature request for {project?.name}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <div className="feature-form">
            {/* Feature Name */}
            <div className="form-group">
              <label className="form-label">
                <Settings size={16} />
                Feature Name
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.featureName}
                onChange={(e) => handleInputChange('featureName', e.target.value)}
                placeholder="Enter a clear, descriptive name for this feature"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                Description
              </label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this feature should do and why it's needed"
                rows={4}
              />
            </div>

            {/* Priority and Urgency */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Zap size={16} />
                  Priority
                </label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <option value="high">High - Critical for success</option>
                  <option value="medium">Medium - Important but not urgent</option>
                  <option value="low">Low - Nice to have</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  Urgency
                </label>
                <select
                  className="form-select"
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                >
                  <option value="urgent">Urgent - Needed ASAP</option>
                  <option value="normal">Normal - Standard timeline</option>
                  <option value="low">Low - Can wait</option>
                </select>
              </div>
            </div>

            {/* Category and Complexity */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Category
                </label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="feature">New Feature</option>
                  <option value="enhancement">Enhancement</option>
                  <option value="bug-fix">Bug Fix</option>
                  <option value="integration">Integration</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Estimated Complexity
                </label>
                <select
                  className="form-select"
                  value={formData.estimatedComplexity}
                  onChange={(e) => handleInputChange('estimatedComplexity', e.target.value)}
                >
                  <option value="low">Low - Simple change</option>
                  <option value="medium">Medium - Moderate effort</option>
                  <option value="high">High - Complex implementation</option>
                </select>
              </div>
            </div>

            {/* API Integration */}
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="hasApiIntegration"
                  checked={formData.hasApiIntegration}
                  onChange={(e) => handleInputChange('hasApiIntegration', e.target.checked)}
                />
                <label htmlFor="hasApiIntegration" className="checkbox-label">
                  <Code size={16} />
                  This feature requires API integration
                </label>
              </div>
            </div>

            {formData.hasApiIntegration && (
              <div className="form-group api-details">
                <label className="form-label">
                  <Database size={16} />
                  API Integration Details
                </label>
                <textarea
                  className="form-textarea"
                  value={formData.apiDetails}
                  onChange={(e) => handleInputChange('apiDetails', e.target.value)}
                  placeholder="Describe what APIs or external services this feature needs to integrate with"
                  rows={3}
                />
              </div>
            )}

            {/* Business Impact */}
            <div className="form-group">
              <label className="form-label">
                <Globe size={16} />
                Business Impact
              </label>
              <textarea
                className="form-textarea"
                value={formData.businessImpact}
                onChange={(e) => handleInputChange('businessImpact', e.target.value)}
                placeholder="How will this feature benefit the business or users?"
                rows={3}
              />
            </div>

            {/* Acceptance Criteria */}
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} />
                Acceptance Criteria
              </label>
              <textarea
                className="form-textarea"
                value={formData.acceptanceCriteria}
                onChange={(e) => handleInputChange('acceptanceCriteria', e.target.value)}
                placeholder="What needs to be done for this feature to be considered complete?"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onBack}>
            Back to Consultation
          </button>
          <button 
            className="btn-primary" 
            onClick={handleNext}
            disabled={!formData.featureName || !formData.description}
          >
            Next: Assignment & Timeline
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureRequestModal; 