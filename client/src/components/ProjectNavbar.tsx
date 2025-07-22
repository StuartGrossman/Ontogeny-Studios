import React from 'react';
import { Activity, CheckCircle, BarChart3, Settings, Target, GitBranch, FileText, Plus, Key, Palette, Globe } from 'lucide-react';
import '../styles/ProjectNavbar.css';
import '../styles/SecondaryActionNavbar.css';

interface Project {
  id: string;
  name?: string;
  description?: string;
  status: string;
  progress?: number;
  deadline?: string;
  tasks?: any[];
  createdAt?: any;
  websiteUrl?: string;
  liveLink?: string;
  link?: string;
}

interface ProjectNavbarProps {
  // Project selection mode
  projects?: Project[];
  selectedProject?: Project | null;
  onProjectSelect?: (project: Project) => void;
  isCollapsed?: boolean;
  
  // Project actions mode
  project?: Project;
  onAddFeature?: () => void;
  onViewRequests?: () => void;
  onAddAPIKey?: () => void;
  onAddUIDesign?: () => void;
  onAddDNSRecords?: () => void;
  mode?: 'selection' | 'actions';
  
  // Notification counts
  apiKeyRequestCount?: number;
  dnsRequestCount?: number;
  featureRequestCount?: number;
}

const ProjectNavbar: React.FC<ProjectNavbarProps> = ({
  projects,
  selectedProject,
  onProjectSelect,
  isCollapsed = false, // Main sidebar collapsed state
  project,
  onAddFeature,
  onViewRequests,
  onAddAPIKey,
  onAddUIDesign,
  onAddDNSRecords,
  mode = 'selection',
  apiKeyRequestCount = 0,
  dnsRequestCount = 0,
  featureRequestCount = 0
}) => {
  const activeProjects = projects?.filter(p => p.status === 'in-progress' || p.status === 'planning') || [];
  const completedProjects = projects?.filter(p => p.status === 'completed') || [];

  const getProjectIcon = (project: Project) => {
    const name = project.name?.toLowerCase() || '';
    if (name.includes('web') || name.includes('website')) return <BarChart3 size={20} />;
    if (name.includes('mobile') || name.includes('app')) return <Settings size={20} />;
    if (name.includes('dashboard') || name.includes('admin')) return <Target size={20} />;
    if (name.includes('api') || name.includes('backend')) return <GitBranch size={20} />;
    return <FileText size={20} />;
  };

  // Project Actions Mode
  if (mode === 'actions' && project) {
    return (
      <div className={`secondary-action-navbar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="secondary-action-navbar-content">
          <div className="secondary-action-navbar-left">
            <div className="secondary-action-project-info">
              <div className="secondary-action-project-icon">
                {getProjectIcon(project)}
              </div>
              <div className="secondary-action-project-details">
                <span className="secondary-action-project-name">{project.name}</span>
                <span className={`secondary-action-project-status ${project.status}`}>
                  {project.status === 'completed' ? 'Completed' : 
                   project.status === 'in-progress' ? 'In Progress' :
                   project.status === 'planning' ? 'Planning' : project.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="secondary-action-navbar-center">
            <div className="secondary-action-buttons-group">
              {project.status !== 'completed' && (
                <button 
                  className="secondary-action-btn primary"
                  onClick={onAddFeature}
                >
                  <Plus size={14} />
                  Add Feature
                </button>
              )}
              
              <button 
                className="secondary-action-btn secondary"
                onClick={onViewRequests}
              >
                <FileText size={14} />
                View Requests
              </button>
              
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button 
                  className="secondary-action-btn secondary"
                  onClick={onAddAPIKey}
                >
                  <Key size={14} />
                  API Keys
                </button>
                {apiKeyRequestCount > 0 && (
                  <span className="notification-badge" style={{ 
                    position: 'absolute', 
                    top: '-5px', 
                    right: '-5px',
                    background: '#ffffff',
                    color: '#000000',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    border: '2px solid #000000'
                  }}>
                    {apiKeyRequestCount}
                  </span>
                )}
              </div>
              
              <button 
                className="secondary-action-btn secondary"
                onClick={onAddUIDesign}
              >
                <Palette size={14} />
                UI Design
              </button>
              
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button 
                  className="secondary-action-btn secondary"
                  onClick={onAddDNSRecords}
                >
                  <Globe size={14} />
                  DNS Records
                </button>
                {dnsRequestCount > 0 && (
                  <span className="notification-badge" style={{ 
                    position: 'absolute', 
                    top: '-5px', 
                    right: '-5px',
                    background: '#ffffff',
                    color: '#000000',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    border: '2px solid #000000'
                  }}>
                    {dnsRequestCount}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="secondary-action-navbar-right">
            {(project.liveLink || project.link || project.websiteUrl) && (
              <a 
                href={project.liveLink || project.link || project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-action-btn secondary small"
              >
                <BarChart3 size={12} />
                Live
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Project Selection Mode (original functionality)
  if (projects?.length === 0) {
    return (
      <div className={`project-navbar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="project-navbar-header">
          <Activity size={20} />
          <span>Projects</span>
        </div>
        <div className="project-navbar-empty">
          <Activity size={32} />
          <p>No projects</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`project-navbar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Header */}
      <div className="project-navbar-header">
        <Activity size={20} />
        <span>Projects</span>
        <div className="project-count-badge">{activeProjects.length}</div>
      </div>

      {/* Active Projects */}
      <div className="project-navbar-content">
        {activeProjects.length > 0 && (
          <div className="project-section">
            <div className="section-label">Active</div>
            {activeProjects.map((project) => (
              <div
                key={project.id}
                className={`project-navbar-item ${selectedProject?.id === project.id ? 'selected' : ''}`}
                onClick={() => onProjectSelect?.(project)}
              >
                <div className="project-navbar-icon">
                  {getProjectIcon(project)}
                </div>
                <div className="project-navbar-info">
                  <div className="project-navbar-name">{project.name}</div>
                  <div className="project-navbar-status">
                    <span className={`status-dot ${project.status}`}></span>
                    <span className="status-text">{project.status}</span>
                  </div>
                  <div className="project-navbar-progress">
                    <div className="progress-bar-small">
                      <div 
                        className="progress-fill-small"
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text-small">{project.progress || 0}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed Projects */}
        {completedProjects.length > 0 && (
          <div className="project-section">
            <div className="section-label">Completed</div>
            {completedProjects.map((project) => (
              <div
                key={project.id}
                className={`project-navbar-item completed ${selectedProject?.id === project.id ? 'selected' : ''}`}
                onClick={() => onProjectSelect?.(project)}
              >
                <div className="project-navbar-icon completed">
                  <CheckCircle size={20} />
                </div>
                <div className="project-navbar-info">
                  <div className="project-navbar-name">{project.name}</div>
                  <div className="project-navbar-status completed">
                    <CheckCircle size={12} />
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectNavbar; 