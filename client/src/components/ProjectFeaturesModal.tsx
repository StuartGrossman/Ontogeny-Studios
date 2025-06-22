import React, { useState } from 'react';
import { X, Settings, Link, List, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import '../styles/ProjectFeaturesModal.css';

interface Project {
  id: string;
  name?: string;
  projectName?: string;
  description?: string;
  status: string;
  progress?: number;
  deadline?: string;
  tasks?: any[];
  type?: string;
  features?: string;
  priority?: string;
  createdAt?: any;
  meetingScheduled?: boolean;
}

interface ProjectFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

interface APIConnection {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'pending' | 'error';
  description: string;
  lastSync?: string;
}

interface ProjectFeature {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface RequestedFeature {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress';
  priority: 'high' | 'medium' | 'low';
}

const ProjectFeaturesModal: React.FC<ProjectFeaturesModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const [activeTab, setActiveTab] = useState<'features' | 'apis' | 'requests'>('features');

  // Mock data - replace with actual data from your backend
  const mockAPIConnections: APIConnection[] = [
    {
      id: '1',
      name: 'Stripe Payment API',
      type: 'Payment Gateway',
      status: 'connected',
      description: 'Handles payment processing and subscription management',
      lastSync: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'SendGrid Email API',
      type: 'Email Service',
      status: 'connected',
      description: 'Manages transactional emails and notifications',
      lastSync: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      name: 'Google Analytics',
      type: 'Analytics',
      status: 'pending',
      description: 'Tracks user behavior and website performance',
    },
    {
      id: '4',
      name: 'Twilio SMS API',
      type: 'Communication',
      status: 'error',
      description: 'Sends SMS notifications and verification codes',
    }
  ];

  const mockProjectFeatures: ProjectFeature[] = [
    {
      id: '1',
      name: 'User Authentication',
      description: 'Complete user registration, login, and password reset functionality',
      status: 'completed',
      priority: 'high',
      category: 'Authentication'
    },
    {
      id: '2',
      name: 'Dashboard Interface',
      description: 'Main user dashboard with project overview and quick actions',
      status: 'completed',
      priority: 'high',
      category: 'UI/UX'
    },
    {
      id: '3',
      name: 'Payment Integration',
      description: 'Stripe payment processing for subscriptions and one-time payments',
      status: 'in-progress',
      priority: 'high',
      category: 'Payment'
    },
    {
      id: '4',
      name: 'Email Notifications',
      description: 'Automated email system for user notifications and updates',
      status: 'in-progress',
      priority: 'medium',
      category: 'Communication'
    },
    {
      id: '5',
      name: 'Mobile Responsive Design',
      description: 'Optimize interface for mobile and tablet devices',
      status: 'pending',
      priority: 'medium',
      category: 'UI/UX'
    },
    {
      id: '6',
      name: 'Advanced Analytics',
      description: 'Detailed analytics dashboard with custom reporting',
      status: 'pending',
      priority: 'low',
      category: 'Analytics'
    }
  ];

  const mockRequestedFeatures: RequestedFeature[] = [
    {
      id: '1',
      title: 'Dark Mode Theme',
      description: 'Add dark mode toggle for better user experience in low-light environments',
      requestedBy: 'Current User',
      requestedAt: '2024-01-10T14:30:00Z',
      status: 'approved',
      priority: 'medium'
    },
    {
      id: '2',
      title: 'Export Data Feature',
      description: 'Allow users to export their data in CSV and PDF formats',
      requestedBy: 'Current User',
      requestedAt: '2024-01-08T11:20:00Z',
      status: 'in-progress',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Two-Factor Authentication',
      description: 'Enhanced security with SMS and app-based 2FA options',
      requestedBy: 'Current User',
      requestedAt: '2024-01-05T16:45:00Z',
      status: 'pending',
      priority: 'high'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'connected':
      case 'approved':
        return <CheckCircle size={16} className="status-icon success" />;
      case 'in-progress':
      case 'pending':
        return <Clock size={16} className="status-icon warning" />;
      case 'error':
      case 'rejected':
        return <AlertCircle size={16} className="status-icon error" />;
      default:
        return <Clock size={16} className="status-icon" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="project-features-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Settings size={24} />
            <div>
              <h2>Project Features</h2>
              <p>{project.name || project.projectName}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            <List size={16} />
            Features ({mockProjectFeatures.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'apis' ? 'active' : ''}`}
            onClick={() => setActiveTab('apis')}
          >
            <Link size={16} />
            API Connections ({mockAPIConnections.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <MessageSquare size={16} />
            Feature Requests ({mockRequestedFeatures.length})
          </button>
        </div>

        <div className="modal-content">
          {activeTab === 'features' && (
            <div className="features-tab">
              <div className="tab-header">
                <h3>Project Features</h3>
                <p>Current features and development status</p>
              </div>
              
              <div className="features-grid">
                {mockProjectFeatures.map((feature) => (
                  <div key={feature.id} className={`feature-card ${feature.status}`}>
                    <div className="feature-header">
                      <div className="feature-info">
                        <h4>{feature.name}</h4>
                        <span className="feature-category">{feature.category}</span>
                      </div>
                      <div className="feature-status">
                        {getStatusIcon(feature.status)}
                        <span className={`status-text ${feature.status}`}>
                          {feature.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="feature-description">{feature.description}</p>
                    <div className="feature-meta">
                      <span className={`priority-badge ${getPriorityColor(feature.priority)}`}>
                        {feature.priority} priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'apis' && (
            <div className="apis-tab">
              <div className="tab-header">
                <h3>API Connections</h3>
                <p>External services and integrations</p>
              </div>
              
              <div className="apis-grid">
                {mockAPIConnections.map((api) => (
                  <div key={api.id} className={`api-card ${api.status}`}>
                    <div className="api-header">
                      <div className="api-info">
                        <h4>{api.name}</h4>
                        <span className="api-type">{api.type}</span>
                      </div>
                      <div className="api-status">
                        {getStatusIcon(api.status)}
                        <span className={`status-text ${api.status}`}>
                          {api.status}
                        </span>
                      </div>
                    </div>
                    <p className="api-description">{api.description}</p>
                    {api.lastSync && (
                      <div className="api-meta">
                        <span className="last-sync">
                          Last sync: {new Date(api.lastSync).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="requests-tab">
              <div className="tab-header">
                <h3>Feature Requests</h3>
                <p>Requested features and their status</p>
              </div>
              
              <div className="requests-grid">
                {mockRequestedFeatures.map((request) => (
                  <div key={request.id} className={`request-card ${request.status}`}>
                    <div className="request-header">
                      <div className="request-info">
                        <h4>{request.title}</h4>
                        <div className="request-meta-header">
                          <span className="requested-by">by {request.requestedBy}</span>
                          <span className="requested-date">
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="request-status">
                        {getStatusIcon(request.status)}
                        <span className={`status-text ${request.status}`}>
                          {request.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="request-description">{request.description}</p>
                    <div className="request-meta">
                      <span className={`priority-badge ${getPriorityColor(request.priority)}`}>
                        {request.priority} priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectFeaturesModal; 