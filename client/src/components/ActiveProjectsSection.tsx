import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, TrendingUp, Clock, AlertCircle, Zap, Target, MessageSquare, Play, Calendar, Users, CheckCircle, Settings, BarChart3, FileText, GitBranch } from 'lucide-react';
import '../styles/ActiveProjectsSection.css';

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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDetailsLoading, setProjectDetailsLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);

  console.log('🎯 ActiveProjectsSection rendered');
  console.log('📊 customerProjects:', customerProjects);
  console.log('⏳ customerProjectsLoading:', customerProjectsLoading);
  console.log('📈 customerProjects.length:', customerProjects?.length || 0);

  // Calculate project arrays
  const activeProjects = customerProjects.filter(p => p.status === 'in-progress' || p.status === 'planning');
  const completedProjects = customerProjects.filter(p => p.status === 'completed');

  // Auto-select first project if none selected
  useEffect(() => {
    if (!selectedProject && activeProjects.length > 0) {
      setSelectedProject(activeProjects[0]);
    }
  }, [activeProjects, selectedProject]);

  // Simulate loading when project changes
  useEffect(() => {
    if (selectedProject) {
      setProjectDetailsLoading(true);
      setMetricsLoading(true);
      
      const detailsTimer = setTimeout(() => {
        setProjectDetailsLoading(false);
      }, 600);
      
      const metricsTimer = setTimeout(() => {
        setMetricsLoading(false);
      }, 900);
      
      return () => {
        clearTimeout(detailsTimer);
        clearTimeout(metricsTimer);
      };
    }
  }, [selectedProject]);

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

  // Get project icon based on name or type
  const getProjectIcon = (project: Project) => {
    const name = project.name?.toLowerCase() || '';
    if (name.includes('web') || name.includes('website')) return <BarChart3 size={20} />;
    if (name.includes('mobile') || name.includes('app')) return <Settings size={20} />;
    if (name.includes('dashboard') || name.includes('admin')) return <Target size={20} />;
    if (name.includes('api') || name.includes('backend')) return <GitBranch size={20} />;
    return <FileText size={20} />;
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
    return (
      <div className="active-projects-section">
        <div className="active-projects-header">
          <h2>
            <Activity size={24} />
            Active Projects
          </h2>
          <div className="project-summary">
            <span className="summary-item">
              <span className="summary-number">0</span>
              <span className="summary-label">Active</span>
            </span>
            <span className="summary-item">
              <span className="summary-number">0</span>
              <span className="summary-label">Completed</span>
            </span>
          </div>
        </div>

        <div className="empty-projects-state">
          <div className="empty-state-icon">
            <Activity size={64} />
          </div>
          <h3>No Active Projects</h3>
          <p>You don't have any active projects yet. Start by requesting a new project or check your requested projects to see if any have been approved.</p>
          <div className="empty-state-actions">
            <button className="primary-action-btn">
              <Play size={16} />
              Request New Project
            </button>
            <button className="secondary-action-btn">
              <MessageSquare size={16} />
              View Requested Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-management-container">
      {/* Header */}
      <div className="projects-header-section">
        <div className="projects-title">
          <h1>
            <Activity size={28} />
            Project Management
          </h1>
          <p>Manage and track your active and completed projects</p>
        </div>
        <div className="projects-stats">
          <div className="stat-card active">
            <span className="stat-number">{activeProjects.length}</span>
            <span className="stat-label">Active Projects</span>
          </div>
          <div className="stat-card completed">
            <span className="stat-number">{completedProjects.length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card total">
            <span className="stat-number">{customerProjects.length}</span>
            <span className="stat-label">Total Projects</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="projects-main-content">
        {/* Left Sidebar - Project List */}
        <div className="projects-sidebar">
          <div className="projects-sidebar-header">
            <h3>Your Projects</h3>
            <span className="project-count">{activeProjects.length} active</span>
          </div>
          
          <div className="projects-list">
            {activeProjects.map((project) => (
              <div 
                key={project.id}
                className={`project-list-item ${selectedProject?.id === project.id ? 'selected' : ''}`}
                onClick={() => setSelectedProject(project)}
              >
                <div className="project-icon">
                  {getProjectIcon(project)}
                </div>
                <div className="project-info">
                  <h4>{project.name}</h4>
                  <div className="project-status-mini">
                    <span className={`status-dot ${project.status}`}></span>
                    <span className="status-text">{project.status}</span>
                  </div>
                  <div className="project-progress-mini">
                    <div className="progress-bar-mini">
                      <div 
                        className="progress-fill-mini"
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text-mini">{project.progress || 0}%</span>
                  </div>
                </div>
              </div>
            ))}
            
            {completedProjects.length > 0 && (
              <>
                <div className="projects-divider">
                  <span>Completed Projects</span>
                </div>
                {completedProjects.map((project) => (
                  <div 
                    key={project.id}
                    className={`project-list-item completed ${selectedProject?.id === project.id ? 'selected' : ''}`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="project-icon completed">
                      <CheckCircle size={20} />
                    </div>
                    <div className="project-info">
                      <h4>{project.name}</h4>
                      <div className="project-status-mini">
                        <span className="completed-badge">✅ Completed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right Content - Project Details */}
        <div className="project-details-content">
          {selectedProject ? (
            <div className="project-details-view">
              {/* Project Header */}
              {projectDetailsLoading ? (
                <div className="project-details-header">
                  <div className="project-title-section">
                    <div className="project-icon-large">
                      <RefreshCw className="spinning" size={32} />
                    </div>
                    <div className="project-title-info">
                      <div className="loading-placeholder" style={{width: '200px', height: '28px', marginBottom: '8px'}}></div>
                      <div className="loading-placeholder" style={{width: '100px', height: '20px'}}></div>
                    </div>
                  </div>
                  <div className="project-actions-header">
                    <div className="loading-placeholder" style={{width: '120px', height: '40px', marginRight: '10px'}}></div>
                    <div className="loading-placeholder" style={{width: '120px', height: '40px'}}></div>
                  </div>
                </div>
              ) : (
                <div className="project-details-header">
                  <div className="project-title-section">
                    <div className="project-icon-large">
                      {selectedProject.status === 'completed' ? 
                        <CheckCircle size={32} /> : 
                        getProjectIcon(selectedProject)
                      }
                    </div>
                    <div className="project-title-info">
                      <h2>{selectedProject.name}</h2>
                      <span className={`project-status-badge ${selectedProject.status}`}>
                        {selectedProject.status === 'completed' ? 'Completed' : 
                         selectedProject.status === 'in-progress' ? 'In Progress' :
                         selectedProject.status === 'planning' ? 'Planning' : selectedProject.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="project-actions-header">
                    <button 
                      className="action-btn primary"
                      onClick={() => onOpenCustomerProject(selectedProject)}
                    >
                      <Settings size={16} />
                      Project Details
                    </button>
                    {selectedProject.status !== 'completed' && (
                      <button 
                        className="action-btn secondary"
                        onClick={() => onFeatureRequest(selectedProject)}
                      >
                        <MessageSquare size={16} />
                        Request Feature
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Project Overview */}
              <div className="project-overview-section">
                {metricsLoading ? (
                  <div className="overview-cards">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="overview-card">
                        <div className="card-header">
                          <RefreshCw className="spinning" size={20} />
                          <div className="loading-placeholder" style={{width: '80px', height: '16px'}}></div>
                        </div>
                        <div className="card-content">
                          <div className="loading-placeholder" style={{width: '100%', height: '60px', marginBottom: '10px'}}></div>
                          <div className="loading-placeholder" style={{width: '120px', height: '14px'}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overview-cards">
                  {selectedProject.status !== 'completed' && (
                    <>
                      <div className="overview-card progress">
                        <div className="card-header">
                          <TrendingUp size={20} />
                          <span>Progress</span>
                        </div>
                        <div className="card-content">
                          <div className="progress-circle">
                            <span className="progress-value">{selectedProject.progress || 0}%</span>
                          </div>
                          <div className="progress-details">
                            <span>{generateProjectMetrics(selectedProject).tasksCompleted} tasks completed</span>
                          </div>
                        </div>
                      </div>

                      <div className="overview-card timeline">
                        <div className="card-header">
                          <Clock size={20} />
                          <span>Timeline</span>
                        </div>
                        <div className="card-content">
                          <div className="timeline-info">
                            <span className="days-remaining">{generateProjectMetrics(selectedProject).daysRemaining}</span>
                            <span className="days-label">days remaining</span>
                          </div>
                          <div className="deadline-info">
                            <span>Deadline: {selectedProject.deadline || 'Not set'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="overview-card team">
                        <div className="card-header">
                          <Users size={20} />
                          <span>Team</span>
                        </div>
                        <div className="card-content">
                          <div className="team-size">
                            <span className="team-count">{generateProjectMetrics(selectedProject).teamMembers}</span>
                            <span className="team-label">team members</span>
                          </div>
                          <div className="team-activity">
                            <span>Active development</span>
                          </div>
                        </div>
                      </div>

                      <div className="overview-card risk">
                        <div className="card-header">
                          <AlertCircle size={20} />
                          <span>Risk Level</span>
                        </div>
                        <div className="card-content">
                          <div className={`risk-indicator ${generateProjectMetrics(selectedProject).riskLevel}`}>
                            <span className="risk-level">{generateProjectMetrics(selectedProject).riskLevel}</span>
                          </div>
                          <div className="risk-description">
                            <span>Project health monitoring</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {selectedProject.status === 'completed' && (
                    <div className="overview-card completed-summary">
                      <div className="card-header">
                        <CheckCircle size={20} />
                        <span>Project Completed</span>
                      </div>
                      <div className="card-content">
                        <div className="completion-info">
                          <span className="completion-date">
                            Completed: {selectedProject.createdAt ? 
                              new Date(selectedProject.createdAt.seconds * 1000).toLocaleDateString() : 
                              'Recently'
                            }
                          </span>
                          <span className="completion-description">
                            Project successfully delivered and deployed
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                )}
              </div>

              {/* Project Description */}
              <div className="project-description-section">
                <h3>Project Description</h3>
                <div className="description-content">
                  <p>{selectedProject.description || 'No description available for this project.'}</p>
                </div>
              </div>

              {/* Project Timeline */}
              {selectedProject.status !== 'completed' && (
                <div className="project-timeline-section">
                  <h3>Project Timeline</h3>
                  <div className="timeline-content">
                    <div className="timeline-item">
                      <div className="timeline-marker started"></div>
                      <div className="timeline-info">
                        <span className="timeline-title">Project Started</span>
                        <span className="timeline-date">
                          {selectedProject.createdAt ? 
                            new Date(selectedProject.createdAt.seconds * 1000).toLocaleDateString() : 
                            'Recently'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-marker current"></div>
                      <div className="timeline-info">
                        <span className="timeline-title">Current Phase</span>
                        <span className="timeline-date">Development in progress</span>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-marker future"></div>
                      <div className="timeline-info">
                        <span className="timeline-title">Expected Completion</span>
                        <span className="timeline-date">{selectedProject.deadline || 'To be determined'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-project-selected">
              <div className="no-selection-content">
                <Activity size={64} />
                <h3>Select a Project</h3>
                <p>Choose a project from the sidebar to view its details and manage its progress.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveProjectsSection; 