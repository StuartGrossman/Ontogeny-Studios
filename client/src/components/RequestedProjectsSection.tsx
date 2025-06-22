import React, { useState } from 'react';
import { FileText, RefreshCw, Clock, Eye, CheckCircle, Calendar, User, Video, Settings, ChevronRight } from 'lucide-react';
import '../styles/RequestedProjectsSection.css';

interface Project {
  id: string;
  projectName?: string;
  description?: string;
  status: string;
  progress?: number;
  features?: string;
  priority?: string;
  createdAt?: any;
  meetingScheduled?: boolean;
}

interface RequestedProjectsSectionProps {
  requestedProjects: Project[];
  requestedProjectsLoading: boolean;
}

interface RequestedProjectFeaturesProps {
  features: string;
  requestId: string;
}

const RequestedProjectFeatures: React.FC<RequestedProjectFeaturesProps> = ({ features, requestId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const parseFeatures = (featuresText: string) => {
    const featureLines = featuresText.split('\n').filter((f: string) => f.trim());
    
    const categorized: { [key: string]: Array<{ text: string; priority: string; complexity: 'simple' | 'moderate' | 'complex' }> } = {
      '🔐 Authentication & Security': [],
      '💻 Core Functionality': [],
      '🎨 User Interface & Design': [],
      '🔗 Integrations & APIs': [],
      '📊 Data & Analytics': [],
      '🚀 Performance & Optimization': [],
      '📱 Mobile & Responsive': [],
      '🛠️ Admin & Management': [],
      '🔔 Notifications & Communication': [],
      '💳 Payment & Billing': [],
      '📈 Reporting & Insights': [],
      '🌐 Other Features': []
    };

    featureLines.forEach((feature: string) => {
      const trimmedFeature = feature.trim();
      const priorityMatch = trimmedFeature.match(/\((high|medium|low) priority\)$/i);
      const featureText = priorityMatch 
        ? trimmedFeature.replace(/\s*\((high|medium|low) priority\)$/i, '')
        : trimmedFeature;
      const priority = priorityMatch ? priorityMatch[1].toLowerCase() : 'medium';

      const complexity = determineComplexity(featureText);
      const lowerText = featureText.toLowerCase();
      
      if (lowerText.includes('login') || lowerText.includes('auth') || lowerText.includes('security') || 
          lowerText.includes('password') || lowerText.includes('permission') || lowerText.includes('role') ||
          lowerText.includes('encrypt') || lowerText.includes('2fa') || lowerText.includes('oauth')) {
        categorized['🔐 Authentication & Security'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('payment') || lowerText.includes('billing') || lowerText.includes('subscription') ||
                 lowerText.includes('invoice') || lowerText.includes('stripe') || lowerText.includes('paypal')) {
        categorized['💳 Payment & Billing'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('notification') || lowerText.includes('email') || lowerText.includes('sms') ||
                 lowerText.includes('push') || lowerText.includes('alert') || lowerText.includes('message')) {
        categorized['🔔 Notifications & Communication'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('api') || lowerText.includes('integration') || lowerText.includes('connect') || 
                 lowerText.includes('sync') || lowerText.includes('webhook') || lowerText.includes('third-party')) {
        categorized['🔗 Integrations & APIs'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('ui') || lowerText.includes('interface') || lowerText.includes('design') || 
                 lowerText.includes('theme') || lowerText.includes('layout') || lowerText.includes('style')) {
        categorized['🎨 User Interface & Design'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('mobile') || lowerText.includes('responsive') || lowerText.includes('tablet') ||
                 lowerText.includes('ios') || lowerText.includes('android') || lowerText.includes('app')) {
        categorized['📱 Mobile & Responsive'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('admin') || lowerText.includes('management') || lowerText.includes('control') ||
                 lowerText.includes('setting') || lowerText.includes('config') || lowerText.includes('moderate')) {
        categorized['🛠️ Admin & Management'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('report') || lowerText.includes('analytics') || lowerText.includes('insight') ||
                 lowerText.includes('metric') || lowerText.includes('chart') || lowerText.includes('graph')) {
        categorized['📊 Data & Analytics'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('performance') || lowerText.includes('optimization') || lowerText.includes('cache') ||
                 lowerText.includes('speed') || lowerText.includes('load') || lowerText.includes('compress')) {
        categorized['🚀 Performance & Optimization'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('dashboard') || lowerText.includes('overview') || lowerText.includes('summary') ||
                 lowerText.includes('status') || lowerText.includes('monitor')) {
        categorized['📈 Reporting & Insights'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('core') || lowerText.includes('main') || lowerText.includes('primary') || 
                 lowerText.includes('essential') || lowerText.includes('basic') || lowerText.includes('fundamental')) {
        categorized['💻 Core Functionality'].push({ text: featureText, priority, complexity });
      } else {
        categorized['🌐 Other Features'].push({ text: featureText, priority, complexity });
      }
    });

    return Object.entries(categorized)
      .filter(([_, features]) => features.length > 0)
      .map(([category, features]) => [
        category, 
        features.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        })
      ]);
  };

  const determineComplexity = (featureText: string): 'simple' | 'moderate' | 'complex' => {
    const lowerText = featureText.toLowerCase();
    
    if (lowerText.includes('ai') || lowerText.includes('machine learning') || lowerText.includes('blockchain') ||
        lowerText.includes('real-time') || lowerText.includes('video') || lowerText.includes('streaming') ||
        lowerText.includes('complex algorithm') || lowerText.includes('advanced')) {
      return 'complex';
    }
    
    if (lowerText.includes('button') || lowerText.includes('text') || lowerText.includes('color') ||
        lowerText.includes('simple') || lowerText.includes('basic') || lowerText.includes('static')) {
      return 'simple';
    }
    
    return 'moderate';
  };

  const categorizedFeatures = parseFeatures(features);
  const totalFeatures = categorizedFeatures.reduce((sum, [_, features]) => sum + features.length, 0);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="project-features">
      <div 
        className="features-header clickable"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="features-title">
          <Settings size={16} />
          <strong>Requested Features</strong>
          <span className="feature-count">({totalFeatures})</span>
        </div>
        <ChevronRight 
          size={16} 
          className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
        />
      </div>
      
      {isExpanded && (
        <div className="features-content">
          {categorizedFeatures.map(([category, categoryFeatures]) => {
            const categoryName = category as string;
            const features = categoryFeatures as Array<{ text: string; priority: string; complexity: 'simple' | 'moderate' | 'complex' }>;
            
            return (
              <div key={categoryName} className="feature-category">
                <div 
                  className="category-header"
                  onClick={() => toggleCategory(categoryName)}
                >
                  <div className="category-title">
                    <span className="category-name">{categoryName}</span>
                    <span className="category-count">({features.length})</span>
                  </div>
                  <ChevronRight 
                    size={14} 
                    className={`category-expand-icon ${expandedCategories.has(categoryName) ? 'expanded' : ''}`}
                  />
                </div>
                
                {expandedCategories.has(categoryName) && (
                  <div className="category-features">
                    {features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <span className={`feature-priority priority-${feature.priority}`}>
                          {feature.priority === 'high' ? '🔴' : feature.priority === 'medium' ? '🟡' : '🟢'}
                        </span>
                        <span className="feature-text">{feature.text}</span>
                        <span className={`feature-complexity complexity-${feature.complexity}`} title={`${feature.complexity} complexity`}>
                          {feature.complexity === 'complex' ? '⚡' : feature.complexity === 'moderate' ? '⚙️' : '✨'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const RequestedProjectsSection: React.FC<RequestedProjectsSectionProps> = ({
  requestedProjects,
  requestedProjectsLoading,
}) => {
  if (requestedProjectsLoading) {
    return (
      <div className="requested-projects-section">
        <div className="loading-state">
          <RefreshCw className="spinning" size={32} />
          <p>Loading your project requests...</p>
        </div>
      </div>
    );
  }

  if (requestedProjects.length === 0) {
    return (
      <div className="requested-projects-section">
        <div className="empty-state">
          <FileText size={48} />
          <h3>No Project Requests</h3>
          <p>You haven't requested any projects yet. Click "Request New Project" to get started!</p>
        </div>
      </div>
    );
  }

  const pendingCount = requestedProjects.filter(r => r.status === 'pending').length;
  const reviewCount = requestedProjects.filter(r => r.status === 'under-review' || r.status === 'in-review').length;
  const acceptedCount = requestedProjects.filter(r => r.status === 'accepted' || r.status === 'approved').length;

  return (
    <div className="requested-projects-section">
      <div className="requested-projects-header">
        <div className="requested-projects-title">
          <FileText size={24} />
          <h2>Requested Projects</h2>
        </div>
      </div>

      <div className="projects-summary">
        <div className="summary-card pending">
          <div className="summary-number">{pendingCount}</div>
          <div className="summary-label">Pending</div>
        </div>
        <div className="summary-card in-review">
          <div className="summary-number">{reviewCount}</div>
          <div className="summary-label">In Review</div>
        </div>
        <div className="summary-card accepted">
          <div className="summary-number">{acceptedCount}</div>
          <div className="summary-label">Accepted</div>
        </div>
      </div>
      
      <div className="requested-projects-grid">
        {requestedProjects.map((request) => {
          let progress = 0;
          if (request.features && typeof request.features === 'string') {
            const lines = request.features.split('\n').filter((line: string) => line.trim());
            if (lines.length > 0) {
              const completedLines = lines.filter((line: string) => /^(\[x\]|\✓)/.test(line.trim()));
              progress = Math.round((completedLines.length / lines.length) * 100);
            }
          }
          
          return (
            <div key={request.id} className="requested-project-card">
              <div className="project-card-header">
                <div className="project-name">
                  {request.projectName}
                </div>
                <span className={`project-status ${request.status}`}>
                  {request.status === 'pending' && <Clock size={12} />}
                  {request.status === 'under-review' && <Eye size={12} />}
                  {request.status === 'approved' && <CheckCircle size={12} />}
                  {request.status === 'accepted' && <CheckCircle size={12} />}
                  {request.status === 'accepted' ? 'Accepted' : request.status.replace('-', ' ')}
                </span>
              </div>
              
              <div className="project-meta">
                <div className="meta-item">
                  <Calendar size={14} />
                  <span>{new Date(request.createdAt.seconds * 1000).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <User size={14} />
                  <span>Requested by You</span>
                </div>
                {request.meetingScheduled && (
                  <div className="meta-item">
                    <Video size={14} />
                    <span>Meeting Scheduled</span>
                  </div>
                )}
              </div>

              <div className="project-description">
                {request.description}
              </div>
              
              {request.features && (
                <RequestedProjectFeatures 
                  features={request.features}
                  requestId={request.id}
                />
              )}

              {request.status === 'accepted' && (
                <div className="request-progress-section">
                  <div className="progress-header">
                    <span className="progress-label">Development Progress</span>
                    <span className="progress-percentage">{progress}%</span>
                  </div>
                  <div className="request-progress-bar">
                    <div 
                      className="request-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="progress-details">
                    <span>{request.features ? request.features.split('\n').filter((line: string) => /^(\[x\]|\✓)/.test(line.trim())).length : 0} features completed</span>
                    {progress === 100 && (
                      <span className="ready-badge">🚀 Ready for Deployment!</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RequestedProjectsSection; 