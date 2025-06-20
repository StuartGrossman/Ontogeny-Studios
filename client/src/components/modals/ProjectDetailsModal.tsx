import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Target, 
  List, 
  Calendar, 
  ArrowRight,
  Edit3,
  Check
} from 'lucide-react';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextStep: (projectDetails: any) => void;
  conversationData: any;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  onNextStep, 
  conversationData 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    features: '',
    priority: 'medium',
    timeline: 'standard',
    budget: 'discuss'
  });

  const [isEditing, setIsEditing] = useState({
    name: false,
    description: false,
    features: false
  });

  // Initialize form data when conversation data changes
  useEffect(() => {
    if (conversationData) {
      setFormData({
        name: conversationData.name || 'My Project',
        description: conversationData.description || 'Project description from consultation',
        features: conversationData.features || 'Features discussed in consultation',
        priority: 'medium',
        timeline: 'standard',
        budget: 'discuss'
      });
    }
  }, [conversationData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleEdit = (field: string) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  const handleNextStep = () => {
    const projectDetails = {
      ...formData,
      conversationData: conversationData
    };
    onNextStep(projectDetails);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="project-details-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <FileText size={24} />
            <h2>Project Details Review</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-subtitle">
          <span>Please review and confirm your project details extracted from our consultation</span>
        </div>

        <div className="project-details-form">
          {/* Project Name */}
          <div className="detail-section">
            <div className="detail-header">
              <Target size={18} />
              <h3>Project Name</h3>
              <button 
                className="edit-btn"
                onClick={() => toggleEdit('name')}
              >
                {isEditing.name ? <Check size={14} /> : <Edit3 size={14} />}
              </button>
            </div>
            {isEditing.name ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="detail-input"
                autoFocus
                onBlur={() => toggleEdit('name')}
                onKeyPress={(e) => e.key === 'Enter' && toggleEdit('name')}
              />
            ) : (
              <div className="detail-content">
                <p>{formData.name}</p>
              </div>
            )}
          </div>

          {/* Project Description */}
          <div className="detail-section">
            <div className="detail-header">
              <FileText size={18} />
              <h3>Project Description</h3>
              <button 
                className="edit-btn"
                onClick={() => toggleEdit('description')}
              >
                {isEditing.description ? <Check size={14} /> : <Edit3 size={14} />}
              </button>
            </div>
            {isEditing.description ? (
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="detail-textarea"
                rows={4}
                autoFocus
                onBlur={() => toggleEdit('description')}
              />
            ) : (
              <div className="detail-content">
                <p>{formData.description}</p>
              </div>
            )}
          </div>

          {/* Features List */}
          <div className="detail-section">
            <div className="detail-header">
              <List size={18} />
              <h3>Features & Requirements</h3>
              <button 
                className="edit-btn"
                onClick={() => toggleEdit('features')}
              >
                {isEditing.features ? <Check size={14} /> : <Edit3 size={14} />}
              </button>
            </div>
            {isEditing.features ? (
              <textarea
                value={formData.features}
                onChange={(e) => handleInputChange('features', e.target.value)}
                className="detail-textarea"
                rows={6}
                autoFocus
                onBlur={() => toggleEdit('features')}
                placeholder="List features, one per line or separated by commas..."
              />
            ) : (
              <div className="detail-content">
                <div className="features-list">
                  {formData.features.split('\n').filter(f => f.trim()).map((feature, index) => {
                    const trimmedFeature = feature.trim();
                    const priorityMatch = trimmedFeature.match(/\((high|medium|low) priority\)$/i);
                    const featureText = priorityMatch 
                      ? trimmedFeature.replace(/\s*\((high|medium|low) priority\)$/i, '')
                      : trimmedFeature;
                    const priority = priorityMatch ? priorityMatch[1].toLowerCase() : 'medium';
                    
                    return (
                      <div key={index} className="feature-item">
                        <span className={`feature-priority priority-${priority}`}>
                          {priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'}
                        </span>
                        <span className="feature-text">{featureText}</span>
                        <span className={`priority-label priority-${priority}`}>
                          {priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Project Preferences */}
          <div className="preferences-section">
            <h3 className="preferences-title">
              <Calendar size={18} />
              Project Preferences
            </h3>
            
            <div className="preferences-grid">
              <div className="preference-item">
                <label className="preference-label">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="preference-select"
                >
                  <option value="low">Low - When convenient</option>
                  <option value="medium">Medium - Standard priority</option>
                  <option value="high">High - Important project</option>
                  <option value="urgent">Urgent - ASAP</option>
                </select>
              </div>

              <div className="preference-item">
                <label className="preference-label">Timeline Preference</label>
                <select
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  className="preference-select"
                >
                  <option value="flexible">Flexible - No rush</option>
                  <option value="standard">Standard - 2-3 months</option>
                  <option value="fast">Fast Track - 1-2 months</option>
                  <option value="express">Express - Under 1 month</option>
                </select>
              </div>

              <div className="preference-item">
                <label className="preference-label">Budget Discussion</label>
                <select
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="preference-select"
                >
                  <option value="discuss">Discuss during meeting</option>
                  <option value="budget-friendly">Budget-friendly options</option>
                  <option value="standard">Standard pricing</option>
                  <option value="premium">Premium features</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="summary-section">
            <h3>Summary</h3>
            <div className="summary-content">
              <p>
                We'll discuss your <strong>{formData.name}</strong> project with{' '}
                <strong>{formData.priority}</strong> priority and{' '}
                <strong>{formData.timeline}</strong> timeline preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Back to Consultation
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="btn-primary"
          >
            <span>Schedule Meeting</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal; 