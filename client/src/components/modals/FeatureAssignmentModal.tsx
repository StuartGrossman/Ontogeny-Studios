import React, { useState } from 'react';
import { X, User, Calendar, Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface FeatureAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (assignmentData: any) => void;
  onBack: () => void;
  featureData: any;
}

const FeatureAssignmentModal: React.FC<FeatureAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onBack,
  featureData
}) => {
  const [formData, setFormData] = useState({
    assignedTo: 'auto' as 'auto' | 'specific',
    specificDeveloper: '',
    timeline: 'normal' as 'rush' | 'normal' | 'flexible',
    preferredStartDate: '',
    preferredDeadline: '',
    budget: 'standard' as 'low' | 'standard' | 'high' | 'unlimited',
    notes: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit({
      ...featureData,
      assignment: formData,
      submittedAt: new Date()
    });
  };

  const getTimelineDescription = (timeline: string) => {
    switch (timeline) {
      case 'rush':
        return 'ASAP - Drop everything else';
      case 'normal':
        return 'Standard development cycle';
      case 'flexible':
        return 'When time permits';
      default:
        return '';
    }
  };

  const getBudgetDescription = (budget: string) => {
    switch (budget) {
      case 'low':
        return 'Minimal resources - keep it simple';
      case 'standard':
        return 'Normal project budget allocation';
      case 'high':
        return 'Premium implementation with extra polish';
      case 'unlimited':
        return 'Spare no expense - best possible solution';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="feature-assignment-modal">
        <div className="modal-header">
          <div className="modal-title">
            <User size={24} />
            <div>
              <h2>Assignment & Timeline</h2>
              <p className="modal-subtitle">Set priority and timeline for "{featureData?.featureName}"</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {/* Feature Summary */}
          <div className="feature-summary">
            <h3>Feature Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Feature:</span>
                <span className="summary-value">{featureData?.featureName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Priority:</span>
                <span className={`priority-badge priority-${featureData?.priority}`}>
                  {featureData?.priority === 'high' ? '🔴' : featureData?.priority === 'medium' ? '🟡' : '🟢'}
                  {featureData?.priority}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Urgency:</span>
                <span className={`urgency-badge urgency-${featureData?.urgency}`}>
                  {featureData?.urgency}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Complexity:</span>
                <span className={`complexity-badge complexity-${featureData?.estimatedComplexity}`}>
                  {featureData?.estimatedComplexity}
                </span>
              </div>
              {featureData?.hasApiIntegration && (
                <div className="summary-item">
                  <span className="summary-label">API Integration:</span>
                  <span className="api-badge">Required</span>
                </div>
              )}
            </div>
          </div>

          <div className="assignment-form">
            {/* Assignment */}
            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Assignment
              </label>
              <div className="radio-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="auto-assign"
                    name="assignment"
                    value="auto"
                    checked={formData.assignedTo === 'auto'}
                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  />
                  <label htmlFor="auto-assign">
                    <strong>Auto-assign</strong>
                    <span>Let the system assign the best available developer</span>
                  </label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="specific-assign"
                    name="assignment"
                    value="specific"
                    checked={formData.assignedTo === 'specific'}
                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  />
                  <label htmlFor="specific-assign">
                    <strong>Specific developer</strong>
                    <span>Request a particular team member</span>
                  </label>
                </div>
              </div>
              
              {formData.assignedTo === 'specific' && (
                <input
                  type="text"
                  className="form-input"
                  value={formData.specificDeveloper}
                  onChange={(e) => handleInputChange('specificDeveloper', e.target.value)}
                  placeholder="Enter developer name or email"
                />
              )}
            </div>

            {/* Timeline */}
            <div className="form-group">
              <label className="form-label">
                <Clock size={16} />
                Development Timeline
              </label>
              <div className="timeline-options">
                <div 
                  className={`timeline-card ${formData.timeline === 'rush' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('timeline', 'rush')}
                >
                  <div className="timeline-header">
                    <Zap size={16} className="rush-icon" />
                    <strong>Rush</strong>
                  </div>
                  <p>{getTimelineDescription('rush')}</p>
                  <div className="timeline-estimate">~1-3 days</div>
                </div>
                
                <div 
                  className={`timeline-card ${formData.timeline === 'normal' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('timeline', 'normal')}
                >
                  <div className="timeline-header">
                    <Clock size={16} className="normal-icon" />
                    <strong>Normal</strong>
                  </div>
                  <p>{getTimelineDescription('normal')}</p>
                  <div className="timeline-estimate">~1-2 weeks</div>
                </div>
                
                <div 
                  className={`timeline-card ${formData.timeline === 'flexible' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('timeline', 'flexible')}
                >
                  <div className="timeline-header">
                    <Calendar size={16} className="flexible-icon" />
                    <strong>Flexible</strong>
                  </div>
                  <p>{getTimelineDescription('flexible')}</p>
                  <div className="timeline-estimate">~2-4 weeks</div>
                </div>
              </div>
            </div>

            {/* Preferred Dates */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Preferred Start Date (Optional)
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.preferredStartDate}
                  onChange={(e) => handleInputChange('preferredStartDate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Preferred Deadline (Optional)
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.preferredDeadline}
                  onChange={(e) => handleInputChange('preferredDeadline', e.target.value)}
                />
              </div>
            </div>

            {/* Budget */}
            <div className="form-group">
              <label className="form-label">
                Budget Level
              </label>
              <select
                className="form-select"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
              >
                <option value="low">Low - {getBudgetDescription('low')}</option>
                <option value="standard">Standard - {getBudgetDescription('standard')}</option>
                <option value="high">High - {getBudgetDescription('high')}</option>
                <option value="unlimited">Unlimited - {getBudgetDescription('unlimited')}</option>
              </select>
            </div>

            {/* Additional Notes */}
            <div className="form-group">
              <label className="form-label">
                Additional Notes (Optional)
              </label>
              <textarea
                className="form-textarea"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional context, constraints, or special requirements"
                rows={3}
              />
            </div>
          </div>

          {/* Submission Summary */}
          <div className="submission-summary">
            <div className="summary-header">
              <CheckCircle size={20} />
              <h4>Ready to Submit</h4>
            </div>
            <p>
              Your feature request will be submitted to the development team and you'll receive 
              updates on its progress. Expected response time: <strong>24-48 hours</strong>.
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onBack}>
            Back to Details
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            <CheckCircle size={16} />
            Submit Feature Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureAssignmentModal; 