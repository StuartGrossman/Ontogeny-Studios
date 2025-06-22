import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import ProjectNavbar from './ProjectNavbar';
import ProjectRequestSection from './ProjectRequestSection';
import RequestedProjectsSection from './RequestedProjectsSection';
import ActiveProjectsSection from './ActiveProjectsSection';
import CompletedProjectsSection from './CompletedProjectsSection';
import MessagesSection from './MessagesSection';
import EnhancedProjectRequestModal from './EnhancedProjectRequestModal';
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
  onSidebarStateChange?: (collapsed: boolean) => void;
  sidebarCollapsed?: boolean;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  customerProjects,
  requestedProjects,
  customerProjectsLoading,
  requestedProjectsLoading,
  onOpenAIChat,
  onOpenCustomerProject,
  onFeatureRequest,
  onSidebarStateChange,
  sidebarCollapsed: externalSidebarCollapsed,
}) => {
  const [activeSection, setActiveSection] = useState('active-projects');
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showEnhancedModal, setShowEnhancedModal] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Use external sidebar state if provided, otherwise use internal state
  const sidebarCollapsed = externalSidebarCollapsed !== undefined ? externalSidebarCollapsed : internalSidebarCollapsed;

  console.log('🎛️ UserDashboard rendered');
  console.log('📊 customerProjects received:', customerProjects);
  console.log('📈 customerProjects.length:', customerProjects?.length || 0);
  console.log('⏳ customerProjectsLoading:', customerProjectsLoading);
  console.log('🎯 activeSection:', activeSection);

  const handleSectionChange = (section: string) => {
    if (section === 'open-project-modal') {
      setShowEnhancedModal(true);
      return;
    }
    setActiveSection(section);
  };

  const handleProjectSubmit = async (projectData: any) => {
    try {
      console.log('Submitting project:', projectData);
      
      if (!currentUser) {
        alert('You must be logged in to submit a project request.');
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
      
      // You could also show a toast notification here
      alert('Project request submitted successfully! You can track its progress in the Requested Projects section.');
      
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Failed to submit project request. Please try again.');
    }
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

  const toggleSidebar = () => {
    setInternalSidebarCollapsed(!sidebarCollapsed);
    if (onSidebarStateChange) {
      onSidebarStateChange(!sidebarCollapsed);
    }
  };

  const renderSectionContent = () => {
    console.log('🔄 renderSectionContent called with activeSection:', activeSection);
    
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            <ProjectRequestSection onOpenAIChat={onOpenAIChat} />
            
            <RequestedProjectsSection 
              requestedProjects={requestedProjects}
              requestedProjectsLoading={requestedProjectsLoading}
            />
            
            <ActiveProjectsSection 
              customerProjects={customerProjects}
              customerProjectsLoading={customerProjectsLoading}
              onOpenCustomerProject={onOpenCustomerProject}
              onFeatureRequest={onFeatureRequest}
            />
          </>
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
      
      case 'project-analytics':
        return (
          <div className="section-content">
            <h2>Project Analytics</h2>
            <p>Analytics and insights about your projects will be displayed here.</p>
          </div>
        );
      
      case 'time-tracking':
        return (
          <div className="section-content">
            <h2>Time Tracking</h2>
            <p>Time tracking and productivity metrics will be displayed here.</p>
          </div>
        );
      
      case 'achievements':
        return (
          <div className="section-content">
            <h2>Achievements</h2>
            <p>Your project milestones and achievements will be displayed here.</p>
          </div>
        );
      
      case 'calendar':
        return (
          <div className="section-content">
            <h2>Calendar</h2>
            <p>Project deadlines and scheduled meetings will be displayed here.</p>
          </div>
        );
      
      case 'messages':
        return <MessagesSection />;
      
      case 'profile':
        return (
          <div className="section-content">
            <h2>Profile Settings</h2>
            <p>Manage your profile information and preferences.</p>
          </div>
        );
      
      case 'payment':
        return (
          <div className="section-content">
            <h2>Payment & Billing</h2>
            <p>Manage your payment methods and billing information.</p>
          </div>
        );
      
      case 'security':
        return (
          <div className="section-content">
            <h2>Security Settings</h2>
            <p>Manage two-factor authentication and security preferences.</p>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="section-content">
            <h2>Notification Settings</h2>
            <p>Configure your notification preferences.</p>
          </div>
        );
      
      case 'documentation':
        return (
          <div className="section-content">
            <h2>Documentation</h2>
            <p>Access help documentation and guides.</p>
          </div>
        );
      
      case 'support-tickets':
        return (
          <div className="section-content">
            <h2>Support Tickets</h2>
            <p>View and manage your support requests.</p>
          </div>
        );
      
      case 'feature-requests':
        return (
          <div className="section-content">
            <h2>Feature Requests</h2>
            <p>Submit and track feature requests for existing projects.</p>
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
    <div className="user-dashboard-wrapper">
      {/* Left Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      
      {/* Project Navbar - Only show for active projects section */}
      {activeSection === 'active-projects' && (
        <ProjectNavbar
          projects={customerProjects}
          selectedProject={selectedProject}
          onProjectSelect={setSelectedProject}
          isCollapsed={sidebarCollapsed}
        />
      )}
      
      {/* Main Content */}
      <div className={`user-dashboard-content-area ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${activeSection === 'active-projects' ? 'with-project-navbar' : ''}`}>
        {renderSectionContent()}
      </div>

      {/* Enhanced Project Request Modal */}
      <EnhancedProjectRequestModal
        isOpen={showEnhancedModal}
        onClose={() => setShowEnhancedModal(false)}
        onSubmit={handleProjectSubmit}
      />
    </div>
  );
};

export default UserDashboard; 