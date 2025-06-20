import React from 'react';
import { Activity, RefreshCw, TrendingUp, Clock, AlertCircle, Zap, Target, MessageSquare, Play } from 'lucide-react';

interface Project {
  id: string;
  name?: string;
  description?: string;
  status: string;
  progress?: number;
  deadline?: string;
  tasks?: any[];
  createdAt?: any;
}

interface ActiveProjectsSectionProps {
  customerProjects: Project[];
  customerProjectsLoading: boolean;
  onOpenCustomerProject: (project: Project) => void;
  onFeatureRequest: (project: Project) => void;
}

const ActiveProjectsSection: React.FC<ActiveProjectsSectionProps> = ({
  customerProjects,
  customerProjectsLoading,
  onOpenCustomerProject,
  onFeatureRequest,
}) => {
  // Generate project metrics
  const generateProjectMetrics = (project: Project) => {
    const baseMetrics = {
      tasksCompleted: Math.floor(Math.random() * 20) + 5,
      totalTasks: Math.floor(Math.random() * 30) + 15,
      daysRemaining: Math.floor(Math.random() * 45) + 1,
      teamMembers: Math.floor(Math.random() * 6) + 2,
      riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
    };
    
    return {
      ...baseMetrics,
      completionRate: Math.round((baseMetrics.tasksCompleted / baseMetrics.totalTasks) * 100)
    };
  };

  if (customerProjectsLoading) {
    return (
      <div className="loading-state">
        <RefreshCw className="spinning" size={32} />
        <p>Loading your projects...</p>
      </div>
    );
  }

  if (customerProjects.length === 0) {
    return null;
  }

  return (
    <div className="active-projects-section">
      {/* Active Projects (Large Cards) */}
      <div className="active-projects-header">
        <h2>
          <Activity size={24} />
          Active Projects
        </h2>
        <div className="project-summary">
          <span className="summary-item">
            <span className="summary-number">{customerProjects.filter(p => p.status === 'in-progress').length}</span>
            <span className="summary-label">Active</span>
          </span>
          <span className="summary-item">
            <span className="summary-number">{customerProjects.filter(p => p.status === 'completed').length}</span>
            <span className="summary-label">Completed</span>
          </span>
        </div>
      </div>

      <div className="enhanced-projects-grid">
        {customerProjects
          .filter(project => project.status === 'in-progress' || project.status === 'planning')
          .map((project) => {
            const metrics = generateProjectMetrics(project);
            return (
              <div key={project.id} className="enhanced-project-card">
                {/* Project Header */}
                <div className="enhanced-project-header">
                  <div className="project-title-section">
                    <h3>{project.name}</h3>
                    <span className={`enhanced-status-badge ${project.status}`}>
                      <Activity size={12} />
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="project-actions">
                    <button 
                      className="action-button primary"
                      onClick={() => onOpenCustomerProject(project)}
                      title="View project details"
                    >
                      <Play size={14} />
                      View Details
                    </button>
                    <button 
                      className="action-button secondary"
                      onClick={() => onFeatureRequest(project)}
                      title="Request new feature"
                    >
                      <MessageSquare size={14} />
                      Request Feature
                    </button>
                  </div>
                </div>

                {/* Project Progress */}
                <div className="enhanced-progress-section">
                  <div className="progress-info">
                    <span className="progress-label">Overall Progress</span>
                    <span className="progress-value">{project.progress || 0}%</span>
                  </div>
                  <div className="enhanced-progress-bar">
                    <div 
                      className="enhanced-progress-fill"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                  <div className="progress-details">
                    <span>{metrics.tasksCompleted} of {metrics.totalTasks} tasks completed</span>
                  </div>
                </div>

                {/* Project Metrics Grid */}
                <div className="project-metrics-grid">
                  <div className="metric-card">
                    <div className="metric-icon">
                      <TrendingUp size={16} />
                    </div>
                    <div className="metric-info">
                      <span className="metric-value">{metrics.completionRate}%</span>
                      <span className="metric-label">Completion Rate</span>
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-icon">
                      <Clock size={16} />
                    </div>
                    <div className="metric-info">
                      <span className="metric-value">{metrics.daysRemaining}</span>
                      <span className="metric-label">Days Remaining</span>
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-icon">
                      <Target size={16} />
                    </div>
                    <div className="metric-info">
                      <span className="metric-value">{metrics.teamMembers}</span>
                      <span className="metric-label">Team Members</span>
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <div className={`metric-icon risk-${metrics.riskLevel}`}>
                      {metrics.riskLevel === 'low' ? <Zap size={16} /> : 
                       metrics.riskLevel === 'medium' ? <AlertCircle size={16} /> : 
                       <AlertCircle size={16} />}
                    </div>
                    <div className="metric-info">
                      <span className={`metric-value risk-${metrics.riskLevel}`}>
                        {metrics.riskLevel.charAt(0).toUpperCase() + metrics.riskLevel.slice(1)}
                      </span>
                      <span className="metric-label">Risk Level</span>
                    </div>
                  </div>
                </div>

                {/* Project Description */}
                <div className="enhanced-project-description">
                  <p>{project.description || 'No description available for this project.'}</p>
                </div>

                {/* Project Timeline */}
                <div className="project-timeline">
                  <div className="timeline-item">
                    <span className="timeline-label">Started:</span>
                    <span className="timeline-date">
                      {project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="timeline-item">
                    <span className="timeline-label">Deadline:</span>
                    <span className="timeline-date">{project.deadline || 'Not set'}</span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Completed Projects (Compact Cards) */}
      <div className="completed-projects-section">
        <h3>Completed Projects</h3>
        {customerProjects.filter(p => p.status === 'completed').length > 0 ? (
          <div className="completed-projects-grid">
            {customerProjects
              .filter(project => project.status === 'completed')
              .map((project) => (
                <div key={project.id} className="completed-project-card">
                  <div className="completed-project-header">
                    <h4>{project.name}</h4>
                    <span className="completed-badge">✅ Completed</span>
                  </div>
                  <p className="completed-project-description">
                    {project.description ? 
                      (project.description.length > 100 ? 
                        `${project.description.substring(0, 100)}...` : 
                        project.description
                      ) : 
                      'No description available.'
                    }
                  </p>
                  <div className="completed-project-meta">
                    <span>Completed: {project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <button 
                    className="view-completed-btn"
                    onClick={() => onOpenCustomerProject(project)}
                  >
                    View Details
                  </button>
                </div>
              ))}
          </div>
        ) : (
          <div className="empty-completed-projects">
            <div className="empty-state-icon">
              <Target size={48} />
            </div>
            <h4>No Completed Projects</h4>
            <p>You don't have any completed projects yet. Once your active projects are finished, they'll appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveProjectsSection; 