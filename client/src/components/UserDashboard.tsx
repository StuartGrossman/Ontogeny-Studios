import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProjectRequestSection from './ProjectRequestSection';
import RequestedProjectsSection from './RequestedProjectsSection';
import ActiveProjectsSection from './ActiveProjectsSection';
import MessagesSection from './MessagesSection';

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
}) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (onSidebarStateChange) {
      onSidebarStateChange(!sidebarCollapsed);
    }
  };

  const renderSectionContent = () => {
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
          />
        );
      
      case 'completed-projects':
        return (
          <ActiveProjectsSection 
            customerProjects={customerProjects.filter(p => p.status === 'completed')}
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
      
      {/* Main Content */}
      <div className={`user-dashboard-content-area ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {renderSectionContent()}
      </div>
    </div>
  );
};

export default UserDashboard; 