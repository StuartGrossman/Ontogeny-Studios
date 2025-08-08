import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, TrendingUp, Clock, CheckCircle, Plus, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Components
import ActiveProjectsSection from './ActiveProjectsSection';
import CompletedProjectsSection from './CompletedProjectsSection';
import EnhancedProjectRequestModal from './EnhancedProjectRequestModal';
import SettingsPage from './SettingsPage';
import PaymentsSection from './PaymentsSection';
import UserPaymentSection from './UserPaymentSection';
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
  onOpenRequestsModal: () => void;
  onOpenRequestedProjectsModal: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  customerProjects,
  requestedProjects,
  customerProjectsLoading,
  requestedProjectsLoading,
  onOpenAIChat,
  onOpenCustomerProject,
  onFeatureRequest,
  onOpenRequestsModal,
  onOpenRequestedProjectsModal,
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
    if (section === 'requests') {
      onOpenRequestsModal();
      return;
    }
    if (section === 'requested-projects') {
      onOpenRequestedProjectsModal();
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
          <>
            {/* Main Sections */}
            <ActiveProjectsSection 
              customerProjects={customerProjects}
              customerProjectsLoading={customerProjectsLoading}
              onOpenCustomerProject={onOpenCustomerProject}
              onFeatureRequest={onFeatureRequest}
              selectedProject={selectedProject}
              onProjectSelect={setSelectedProject}
            />
          </>
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
          <SettingsPage
            isOpen={true}
            onClose={() => setActiveSection('overview')}
            currentUser={currentUser}
          />
        );
      
      case 'payments':
        return (
          <UserPaymentSection
            customerProjects={customerProjects}
            customerProjectsLoading={customerProjectsLoading}
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
    <>
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
          
          {/* Removed Active Projects and Requests buttons per product request */}
          
          <button 
            className={`nav-item ${activeSection === 'completed-projects' ? 'active' : ''}`}
            onClick={() => handleSectionChange('completed-projects')}
          >
            <CheckCircle size={20} />
            Completed
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'payments' ? 'active' : ''}`}
            onClick={() => handleSectionChange('payments')}
          >
            <CreditCard size={20} />
            Payments
          </button>
        </div>
        

      </div>

      {/* Content */}
      {renderContent()}

      {/* Modal */}
      <EnhancedProjectRequestModal
        isOpen={showEnhancedModal}
        onClose={() => setShowEnhancedModal(false)}
        onSubmit={handleProjectSubmit}
        activeProjects={customerProjects}
      />
    </>
  );
};

export default UserDashboard; 