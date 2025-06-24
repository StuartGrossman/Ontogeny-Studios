import React from 'react';
import { CheckCircle, RefreshCw, Trophy, Calendar, Award } from 'lucide-react';
import '../styles/ActiveProjectsSection.css';

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

interface CompletedProjectsSectionProps {
  customerProjects: Project[];
  customerProjectsLoading: boolean;
  onOpenCustomerProject: (project: Project) => void;
  onFeatureRequest: (project: Project) => void;
  sidebarCollapsed?: boolean;
}

const CompletedProjectsSection: React.FC<CompletedProjectsSectionProps> = ({
  customerProjects,
  customerProjectsLoading,
  onOpenCustomerProject,
  onFeatureRequest,
  sidebarCollapsed = false,
}) => {
  const completedProjects = customerProjects.filter(p => p.status === 'completed');

  if (customerProjectsLoading) {
    return (
      <div className={`active-projects-section ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="loading-state">
          <RefreshCw className="spinning" size={32} />
          <p>Loading completed projects...</p>
        </div>
      </div>
    );
  }

  if (completedProjects.length === 0) {
    return (
      <div className={`active-projects-section ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="active-projects-header">
          <h2>
            <CheckCircle size={24} />
            Completed Projects
          </h2>
          <div className="project-summary">
            <span className="summary-item">
              <span className="summary-number">0</span>
              <span className="summary-label">Completed</span>
            </span>
            <span className="summary-item">
              <span className="summary-number">{customerProjects.filter(p => p.status === 'in-progress').length}</span>
              <span className="summary-label">In Progress</span>
            </span>
          </div>
        </div>

        <div className="empty-projects-state">
          <div className="empty-state-icon">
            <Trophy size={64} />
          </div>
          <h3>No Completed Projects Yet</h3>
          <p>
            You don't have any completed projects yet. Once your active projects are finished and marked as completed by the admin, they will appear here.
          </p>
          <div className="empty-state-details">
            <div className="empty-detail-item">
              <Award size={20} />
              <span>Project achievements and milestones will be displayed</span>
            </div>
            <div className="empty-detail-item">
              <Calendar size={20} />
              <span>Completion dates and project timelines will be tracked</span>
            </div>
            <div className="empty-detail-item">
              <CheckCircle size={20} />
              <span>Final deliverables and project summaries will be available</span>
            </div>
          </div>
          <div className="empty-state-actions">
            <button 
              className="secondary-action-btn"
              onClick={() => {
                // Navigate to active projects
                window.dispatchEvent(new CustomEvent('navigate-to-section', { detail: 'active-projects' }));
              }}
            >
              <CheckCircle size={16} />
              View Active Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If there are completed projects, show them using the same layout as ActiveProjectsSection
  // but with completed-specific styling
  return (
    <div className={`active-projects-section completed-projects ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="active-projects-header">
        <h2>
          <CheckCircle size={24} />
          Completed Projects
        </h2>
        <div className="project-summary">
          <span className="summary-item">
            <span className="summary-number">{completedProjects.length}</span>
            <span className="summary-label">Completed</span>
          </span>
          <span className="summary-item">
            <span className="summary-number">{customerProjects.filter(p => p.status === 'in-progress').length}</span>
            <span className="summary-label">Still Active</span>
          </span>
        </div>
      </div>

      <div className="completed-projects-grid">
        {completedProjects.map((project) => (
          <div key={project.id} className="completed-project-card">
            <div className="project-card-header">
              <div className="project-icon">
                <CheckCircle size={24} />
              </div>
              <div className="project-info">
                <h3>{project.name || project.projectName}</h3>
                <span className="completion-badge">
                  <CheckCircle size={14} />
                  Completed
                </span>
              </div>
            </div>
            
            <div className="project-description">
              <p>{project.description || 'No description available.'}</p>
            </div>
            
            <div className="project-completion-details">
              <div className="completion-detail">
                <Calendar size={16} />
                <span>
                  Completed: {project.createdAt ? 
                    new Date(project.createdAt.seconds * 1000).toLocaleDateString() : 
                    'Recently'
                  }
                </span>
              </div>
              <div className="completion-detail">
                <Trophy size={16} />
                <span>Project delivered successfully</span>
              </div>
            </div>

            <div className="project-actions">
              <button 
                className="action-btn secondary"
                onClick={() => onOpenCustomerProject(project)}
              >
                <CheckCircle size={16} />
                View Project Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedProjectsSection; 