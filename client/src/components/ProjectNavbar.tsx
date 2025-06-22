import React from 'react';
import { Activity, CheckCircle, BarChart3, Settings, Target, GitBranch, FileText } from 'lucide-react';
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
}

interface ProjectNavbarProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  isCollapsed?: boolean; // This refers to the main sidebar being collapsed, affecting positioning
}

const ProjectNavbar: React.FC<ProjectNavbarProps> = ({
  projects,
  selectedProject,
  onProjectSelect,
  isCollapsed = false // Main sidebar collapsed state
}) => {
  const activeProjects = projects.filter(p => p.status === 'in-progress' || p.status === 'planning');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const getProjectIcon = (project: Project) => {
    const name = project.name?.toLowerCase() || '';
    if (name.includes('web') || name.includes('website')) return <BarChart3 size={20} />;
    if (name.includes('mobile') || name.includes('app')) return <Settings size={20} />;
    if (name.includes('dashboard') || name.includes('admin')) return <Target size={20} />;
    if (name.includes('api') || name.includes('backend')) return <GitBranch size={20} />;
    return <FileText size={20} />;
  };

  if (projects.length === 0) {
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
                onClick={() => onProjectSelect(project)}
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
                onClick={() => onProjectSelect(project)}
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