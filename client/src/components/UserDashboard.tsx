import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, TrendingUp, Clock, CheckCircle, BarChart3, Calendar, Users, Settings, FileText, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Components with UX-focused organization
import ProjectRequestSection from './ProjectRequestSection';
import RequestedProjectsSection from './RequestedProjectsSection';
import ActiveProjectsSection from './ActiveProjectsSection';
import CompletedProjectsSection from './CompletedProjectsSection';
import UserChatSystem from './UserChatSystem';
import EnhancedProjectRequestModal from './EnhancedProjectRequestModal';
import SettingsPage from './SettingsPage';
import { projectService } from '../services/projectService';

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

interface UserDashboardProps {
  customerProjects: Project[];
  requestedProjects: Project[];
  customerProjectsLoading: boolean;
  requestedProjectsLoading: boolean;
  onOpenAIChat: () => void;
  onOpenCustomerProject: (project: Project) => void;
  onFeatureRequest: (project: Project) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  customerProjects,
  requestedProjects,
  customerProjectsLoading,
  requestedProjectsLoading,
  onOpenAIChat,
  onOpenCustomerProject,
  onFeatureRequest,
}) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showEnhancedModal, setShowEnhancedModal] = useState(false);
  const [settingsSection, setSettingsSection] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Calculate project statistics for information chunking
  const projectStats = {
    active: customerProjects?.filter(p => p.status === 'in-progress' || p.status === 'planning').length || 0,
    completed: customerProjects?.filter(p => p.status === 'completed').length || 0,
    requested: requestedProjects?.length || 0,
    total: customerProjects?.length || 0
  };

  const handleSectionChange = (section: string) => {
    if (section === 'open-project-modal') {
      setShowEnhancedModal(true);
      return;
    }
    if (section === 'messages') {
      navigate('/messages');
      return;
    }
    
    // Handle settings sections - show settings inline
    if (section === 'settings' || section === 'profile' || section === 'security' || section === 'payment' || section === 'notifications') {
      setSettingsSection(section);
      setActiveSection('settings');
      return;
    }
    
    setActiveSection(section);
  };

  const handleProjectSubmit = async (projectData: any) => {
    try {
      console.log('Submitting project:', projectData);
      
      if (!currentUser) {
        // Non-intrusive error handling - no alerts per user preference
        console.error('User must be logged in to submit a project request');
        return;
      }
      
      // Submit to Firebase using the project service
      const projectId = await projectService.submitProjectRequest(
        projectData, 
        currentUser.uid, 
        currentUser.email || ''
      );
      
      console.log('Project submitted successfully with ID:', projectId);
      
      // Close modal and show success
      setShowEnhancedModal(false);
      
      // Navigate to requested projects to see the new submission
      setActiveSection('requested-projects');
      
    } catch (error) {
      console.error('Error submitting project:', error);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setActiveSection('active-projects');
  };

  // Handle navigation from completed projects empty state
  useEffect(() => {
    const handleNavigateToSection = (event: CustomEvent) => {
      setActiveSection(event.detail);
    };

    window.addEventListener('navigate-to-section', handleNavigateToSection as EventListener);
    return () => {
      window.removeEventListener('navigate-to-section', handleNavigateToSection as EventListener);
    };
  }, []);

  // UX-focused navigation structure - Hick's Law (Limited choices)
  const navigationSections = [
    { id: 'dashboard', label: 'Overview', icon: Activity, description: 'Dashboard overview' },
    { id: 'active-projects', label: 'Active Projects', icon: TrendingUp, description: 'Projects in progress' },
    { id: 'requested-projects', label: 'Requests', icon: Clock, description: 'Pending requests' },
    { id: 'completed-projects', label: 'Completed', icon: CheckCircle, description: 'Finished projects' },
  ];

  const renderNavigationBar = () => (
    <div className="dashboard-navigation">
      <div className="nav-sections">
        {navigationSections.map((section) => (
          <button
            key={section.id}
            className={`nav-link ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => handleSectionChange(section.id)}
            aria-label={section.description}
          >
            <section.icon size={20} />
            <span className="nav-label">{section.label}</span>
            {section.id === 'active-projects' && projectStats.active > 0 && (
              <span className="nav-badge">{projectStats.active}</span>
            )}
            {section.id === 'requested-projects' && projectStats.requested > 0 && (
              <span className="nav-badge">{projectStats.requested}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // Project chunks implementation - Miller's Law
  const renderProjectChunks = () => (
    <div className="project-chunks-ux">
      {/* Project Overview Chunk */}
      <div className="project-chunk-ux">
        <div className="chunk-header-ux">
          <Activity className="chunk-icon-ux" size={24} />
          <h2 className="chunk-title-ux">Project Overview</h2>
        </div>
        <div className="chunk-content-ux">
          <div className="project-stats-grid">
            <div className="stat-item">
              <TrendingUp size={20} />
              <span className="stat-number">{projectStats.active}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <CheckCircle size={20} />
              <span className="stat-number">{projectStats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <Clock size={20} />
              <span className="stat-number">{projectStats.requested}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <button 
            className="chunk-action-button"
            onClick={onOpenAIChat}
          >
            <Plus size={16} />
            New Project Request
          </button>
        </div>
      </div>

      {/* Recent Activity Chunk */}
      <div className="project-chunk-ux">
        <div className="chunk-header-ux">
          <BarChart3 className="chunk-icon-ux" size={24} />
          <h2 className="chunk-title-ux">Recent Activity</h2>
        </div>
        <div className="chunk-content-ux">
          {customerProjects.slice(0, 3).map((project) => (
            <div key={project.id} className="activity-item">
              <div className="activity-info">
                <span className="activity-title">{project.name || project.projectName}</span>
                <span className="activity-status">{project.status}</span>
              </div>
              <ArrowRight size={16} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Chunk */}
      <div className="project-chunk-ux">
        <div className="chunk-header-ux">
          <Settings className="chunk-icon-ux" size={24} />
          <h2 className="chunk-title-ux">Quick Actions</h2>
        </div>
        <div className="chunk-content-ux">
          <div className="quick-actions-grid">
            <button 
              className="quick-action-button"
              onClick={() => setActiveSection('active-projects')}
            >
              <TrendingUp size={16} />
              View Projects
            </button>
            <button 
              className="quick-action-button"
              onClick={() => navigate('/messages')}
            >
              <FileText size={16} />
              Messages
            </button>
            <button 
              className="quick-action-button"
              onClick={() => setActiveSection('settings')}
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="dashboard-overview">
            {renderProjectChunks()}
            
            {/* Progressive Disclosure - Show overview first */}
            <div className="recent-projects">
              <div className="section-header">
                <h3>Recent Projects</h3>
                <button 
                  className="view-all-button"
                  onClick={() => setActiveSection('active-projects')}
                >
                  View All <ArrowRight size={16} />
                </button>
              </div>
              
              <ActiveProjectsSection 
                customerProjects={customerProjects.slice(0, 4)} // Show only first 4
                customerProjectsLoading={customerProjectsLoading}
                onOpenCustomerProject={onOpenCustomerProject}
                onFeatureRequest={onFeatureRequest}
                selectedProject={selectedProject}
                onProjectSelect={setSelectedProject}
              />
            </div>
          </div>
        );
      
      case 'requested-projects':
        return (
          <RequestedProjectsSection 
            requestedProjects={requestedProjects}
            requestedProjectsLoading={requestedProjectsLoading}
          />
        );
      
      case 'active-projects':
        return (
          <ActiveProjectsSection 
            customerProjects={customerProjects}
            customerProjectsLoading={customerProjectsLoading}
            onOpenCustomerProject={onOpenCustomerProject}
            onFeatureRequest={onFeatureRequest}
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />
        );
      
      case 'completed-projects':
        return (
          <CompletedProjectsSection 
            customerProjects={customerProjects}
            customerProjectsLoading={customerProjectsLoading}
            onOpenCustomerProject={onOpenCustomerProject}
            onFeatureRequest={onFeatureRequest}
          />
        );
      
      case 'settings':
        return (
          <div className="section-content">
            <SettingsPage
              isOpen={true}
              onClose={() => {
                setSettingsSection(null);
                setActiveSection('dashboard');
              }}
              currentUser={currentUser}
            />
          </div>
        );
      
      default:
        return (
          <div className="section-content">
            <h2>Coming Soon</h2>
            <p>This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="user-dashboard-modern">
      {/* Navigation - Applying Hick's Law */}
      {renderNavigationBar()}

      {/* Main Content Area */}
      <div className="dashboard-main-content">
        {renderSectionContent()}
      </div>

      {/* Enhanced Project Request Modal */}
      <EnhancedProjectRequestModal
        isOpen={showEnhancedModal}
        onClose={() => setShowEnhancedModal(false)}
        onSubmit={handleProjectSubmit}
        activeProjects={customerProjects}
      />
    </div>
  );
};

export default UserDashboard; 