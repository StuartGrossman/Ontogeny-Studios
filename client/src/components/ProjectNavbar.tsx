import React from 'react';
import { Activity, CheckCircle, BarChart3, Settings, Target, GitBranch, FileText, Plus, Key, Palette, Globe } from 'lucide-react';
import '../styles/ProjectNavbar.css';

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
  onAddAPIKey?: () => void;
  onAddUIDesign?: () => void;
  onAddDNSRecords?: () => void;
  mode?: 'selection' | 'actions';
}

const ProjectNavbar: React.FC<ProjectNavbarProps> = ({
  projects,
  selectedProject,
  onProjectSelect,
  isCollapsed = false, // Main sidebar collapsed state
  project,
  onAddFeature,
  onAddAPIKey,
  onAddUIDesign,
  onAddDNSRecords,
  mode = 'selection'
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
      <div className={`project-actions-navbar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="project-actions-content">
          <div className="project-actions-left">
            <div className="current-project-info">
              <div className="current-project-icon">
                {getProjectIcon(project)}
              </div>
              <div className="current-project-details">
                <span className="current-project-name">{project.name}</span>
                <span className={`current-project-status ${project.status}`}>
                  {project.status === 'completed' ? 'Completed' : 
                   project.status === 'in-progress' ? 'In Progress' :
                   project.status === 'planning' ? 'Planning' : project.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="project-actions-center">
            <div className="action-buttons-group">
              {project.status !== 'completed' && (
                <button 
                  className="action-btn primary"
                  onClick={onAddFeature}
                >
                  <Plus size={16} />
                  Add Feature
                </button>
              )}
              
              <button 
                className="action-btn secondary"
                onClick={onAddAPIKey}
              >
                <Key size={16} />
                Add API Key
              </button>
              
              <button 
                className="action-btn secondary"
                onClick={onAddUIDesign}
              >
                <Palette size={16} />
                Add UI Design
              </button>
              
              <button 
                className="action-btn secondary"
                onClick={onAddDNSRecords}
              >
                <Globe size={16} />
                DNS Records
              </button>
            </div>
          </div>
          
          <div className="project-actions-right">
            {(project.liveLink || project.link || project.websiteUrl) && (
              <a 
                href={project.liveLink || project.link || project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn tertiary small"
              >
                <BarChart3 size={14} />
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