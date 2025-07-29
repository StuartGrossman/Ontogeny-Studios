import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, TrendingUp, Clock, CheckCircle, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Components
import ProjectRequestSection from './ProjectRequestSection';
import RequestedProjectsSection from './RequestedProjectsSection';
import ActiveProjectsSection from './ActiveProjectsSection';
import CompletedProjectsSection from './CompletedProjectsSection';
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
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showEnhancedModal, setShowEnhancedModal] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSectionChange = (section: string) => {
    if (section === 'open-project-modal') {
      setShowEnhancedModal(true);
      return;
    }
    if (section === 'messages') {
      navigate('/messages');
      return;
    }
    setActiveSection(section);
  };

  const handleProjectSubmit = async (projectData: any) => {
    try {
      if (!currentUser) {
        console.error('User must be logged in to submit a project request');
        return;
      }
      
      const projectId = await projectService.submitProjectRequest(
        projectData, 
        currentUser.uid, 
        currentUser.email || ''
      );
      
      setShowEnhancedModal(false);
      setActiveSection('requested-projects');
      
    } catch (error) {
      console.error('Error submitting project:', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="dashboard-overview">
            {/* Quick Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-number">
                    {customerProjects?.filter(p => p.status === 'in-progress' || p.status === 'planning').length || 0}
                  </span>
                  <span className="stat-label">Active Projects</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-number">
                    {customerProjects?.filter(p => p.status === 'completed').length || 0}
                  </span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-number">{requestedProjects?.length || 0}</span>
                  <span className="stat-label">Pending Requests</span>
                </div>
              </div>
            </div>

            {/* Main Sections */}
            <div className="overview-sections">
              <ProjectRequestSection onOpenAIChat={onOpenAIChat} />
              
              {requestedProjects && requestedProjects.length > 0 && (
                <RequestedProjectsSection 
                  requestedProjects={requestedProjects}
                  requestedProjectsLoading={requestedProjectsLoading}
                />
              )}
              
              <ActiveProjectsSection 
                customerProjects={customerProjects}
                customerProjectsLoading={customerProjectsLoading}
                onOpenCustomerProject={onOpenCustomerProject}
                onFeatureRequest={onFeatureRequest}
                selectedProject={selectedProject}
                onProjectSelect={setSelectedProject}
              />
            </div>
          </div>
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
      
      case 'requested-projects':
        return (
          <RequestedProjectsSection 
            requestedProjects={requestedProjects}
            requestedProjectsLoading={requestedProjectsLoading}
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
          <SettingsPage
            isOpen={true}
            onClose={() => setActiveSection('overview')}
            currentUser={currentUser}
          />
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
    <div className="user-dashboard">
      {/* Simple Navigation */}
      <div className="dashboard-nav">
        <div className="nav-items">
          <button 
            className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => handleSectionChange('overview')}
          >
            <Activity size={20} />
            Overview
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'active-projects' ? 'active' : ''}`}
            onClick={() => handleSectionChange('active-projects')}
          >
            <TrendingUp size={20} />
            Active Projects
            {customerProjects?.filter(p => p.status === 'in-progress' || p.status === 'planning').length > 0 && (
              <span className="nav-badge">
                {customerProjects.filter(p => p.status === 'in-progress' || p.status === 'planning').length}
              </span>
            )}
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'requested-projects' ? 'active' : ''}`}
            onClick={() => handleSectionChange('requested-projects')}
          >
            <Clock size={20} />
            Requests
            {requestedProjects?.length > 0 && (
              <span className="nav-badge">{requestedProjects.length}</span>
            )}
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'completed-projects' ? 'active' : ''}`}
            onClick={() => handleSectionChange('completed-projects')}
          >
            <CheckCircle size={20} />
            Completed
          </button>
        </div>
        
        <button 
          className="new-project-btn"
          onClick={onOpenAIChat}
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {renderContent()}
      </div>

      {/* Modal */}
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