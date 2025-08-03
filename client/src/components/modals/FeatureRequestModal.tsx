import React, { useState } from 'react';
import { X, Plus, Code, MessageSquare, Shield, Database, Globe, Zap, Settings, Users, FileText, BarChart3 } from 'lucide-react';

interface FeatureRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (featureData: any) => void;
  onBack: () => void;
  conversationData: any;
  project: any;
}

interface FeatureOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const FeatureRequestModal: React.FC<FeatureRequestModalProps> = ({
  isOpen,
  onClose,
  onNext,
  onBack,
  conversationData,
  project
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string>('');

  const featureOptions: FeatureOption[] = [
    {
      id: 'api-integration',
      name: 'API Integration',
      description: 'Connect your project with external APIs and services',
      icon: <Code size={20} />,
      category: 'Integration'
    },
    {
      id: 'messaging',
      name: 'Messaging System',
      description: 'Add real-time messaging and chat functionality',
      icon: <MessageSquare size={20} />,
      category: 'Communication'
    },
    {
      id: 'authentication',
      name: 'Authentication',
      description: 'User login, registration, and security features',
      icon: <Shield size={20} />,
      category: 'Security'
    },
    {
      id: 'database',
      name: 'Database Features',
      description: 'Data storage, management, and query capabilities',
      icon: <Database size={20} />,
      category: 'Data'
    },
    {
      id: 'analytics',
      name: 'Analytics & Reporting',
      description: 'Data visualization, charts, and business insights',
      icon: <BarChart3 size={20} />,
      category: 'Analytics'
    },
    {
      id: 'user-management',
      name: 'User Management',
      description: 'User roles, permissions, and profile management',
      icon: <Users size={20} />,
      category: 'Management'
    },
    {
      id: 'file-upload',
      name: 'File Upload System',
      description: 'Document and media file handling capabilities',
      icon: <FileText size={20} />,
      category: 'Files'
    },
    {
      id: 'notifications',
      name: 'Notification System',
      description: 'Email, push, and in-app notifications',
      icon: <Zap size={20} />,
      category: 'Communication'
    },
    {
      id: 'settings',
      name: 'Settings & Configuration',
      description: 'Customizable preferences and system settings',
      icon: <Settings size={20} />,
      category: 'Configuration'
    },
    {
      id: 'internationalization',
      name: 'Multi-language Support',
      description: 'Support for multiple languages and localization',
      icon: <Globe size={20} />,
      category: 'Localization'
    }
  ];

  const handleFeatureSelect = (featureId: string) => {
    setSelectedFeature(featureId);
  };

  const handleNext = () => {
    if (!selectedFeature) return;
    
    const selectedFeatureData = featureOptions.find(f => f.id === selectedFeature);
    
    onNext({
      featureId: selectedFeature,
      featureName: selectedFeatureData?.name,
      description: selectedFeatureData?.description,
      category: selectedFeatureData?.category,
      project,
      conversationData
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="feature-request-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Plus size={24} />
            <div>
              <h2>Request a Feature</h2>
              <p className="modal-subtitle">Choose a feature to add to {project?.name}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <div className="feature-selection">
            <div className="feature-grid">
              {featureOptions.map((feature) => (
                <div
                  key={feature.id}
                  className={`feature-option ${selectedFeature === feature.id ? 'selected' : ''}`}
                  onClick={() => handleFeatureSelect(feature.id)}
                >
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <div className="feature-info">
                    <h3 className="feature-name">{feature.name}</h3>
                    <p className="feature-description">{feature.description}</p>
                    <span className="feature-category">{feature.category}</span>
                  </div>
                </div>
              ))}
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
            disabled={!selectedFeature}
          >
            Next: Feature Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureRequestModal; 