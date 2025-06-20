import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import ontogenyIcon from '../assets/otogeny-icon.png';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

// Custom hooks
import { useDashboardData } from '../hooks/useDashboardData';
import { useProjectModals } from '../hooks/useProjectModals';

// Components
import AdminDashboard from '../components/AdminDashboard';
import UserDashboard from '../components/UserDashboard';
import Footer from '../components/Footer';
import AIChatModal from '../components/AIChatModal';
import CreateProjectModal, { ProjectFormData } from '../components/modals/CreateProjectModal';
import EditProjectModal from '../components/modals/EditProjectModal';
import UserRequestedProjectModal from '../components/modals/UserRequestedProjectModal';
import { ProjectDetailsModal, MeetingSchedulerModal, FeatureRequestModal, FeatureAssignmentModal } from '../components/modals';

// Styles
import '../styles/Dashboard.css';
import '../styles/ProjectDetailsModal.css';
import '../styles/MeetingSchedulerModal.css';
import '../styles/FeatureRequestModal.css';
import '../styles/FeatureAssignmentModal.css';
import '../styles/EditProjectModal.css';
import '../styles/UserRequestedProjectModal.css';
import '../styles/Sidebar.css';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Custom hooks
  const dashboardData = useDashboardData(currentUser);
  const modals = useProjectModals();

  // Check authentication
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Handle project creation (admin)
  const handleCreateProject = async (projectData: ProjectFormData) => {
    if (!dashboardData.selectedUser) return;

    try {
      await addDoc(collection(db, 'projects'), {
        ...projectData,
        userId: dashboardData.selectedUser.id,
        createdAt: new Date(),
        status: 'planning',
        progress: 0
      });
      
      modals.closeCreateProjectModal();
      // Refresh user projects
      dashboardData.handleUserSelect(dashboardData.selectedUser);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  // Handle project update
  const handleProjectUpdate = async () => {
    modals.closeEditProjectModal();
    // Refresh data as needed
    if (dashboardData.selectedUser) {
      dashboardData.handleUserSelect(dashboardData.selectedUser);
    }
  };

  // Handle admin project modal opening
  const handleOpenAdminProject = async (adminProjectId: string) => {
    // Implementation for opening admin project details
    console.log('Opening admin project:', adminProjectId);
  };

  // Handle meeting scheduler completion
  const handleMeetingSchedulerComplete = async (meetingData: any) => {
    try {
      // Save meeting data to Firebase
      await addDoc(collection(db, 'meetings'), {
        ...meetingData,
        userId: currentUser?.uid,
        createdAt: new Date(),
        status: 'scheduled'
      });

      // Update project request with meeting scheduled flag
      if (modals.projectDetails?.requestId) {
        await setDoc(doc(db, 'project-requests', modals.projectDetails.requestId), {
          meetingScheduled: true,
          meetingData: meetingData
        }, { merge: true });
      }

      modals.handleCloseProjectWorkflow();
      
      // Refresh requested projects
      dashboardData.loadRequestedProjects();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    }
  };

  // Handle feature assignment completion
  const handleFeatureAssignmentComplete = async (assignmentData: any) => {
    try {
      // Save feature assignment to Firebase
      await addDoc(collection(db, 'feature-assignments'), {
        ...assignmentData,
        projectId: modals.selectedProjectForFeature?.id,
        userId: currentUser?.uid,
        createdAt: new Date(),
        status: 'pending'
      });

      modals.handleCloseFeatureWorkflow();
      
      // Refresh customer projects
      dashboardData.loadCustomerProjects();
    } catch (error) {
      console.error('Error assigning feature:', error);
    }
  };

  // Handle feature request
  const handleFeatureRequest = (project: any) => {
    modals.openAIChat(project);
  };

  // Handle customer project modal opening
  const handleOpenCustomerProject = (project: any) => {
    // Implementation for opening customer project details
    console.log('Opening customer project:', project);
  };

  // Show loading state
  if (dashboardData.loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard">
        {/* Top Navigation Bar */}
                 <nav className={`dashboard-navbar ${!dashboardData.isAdmin ? 'with-sidebar' : ''}`}>
          <div className="navbar-left">
            <img src={ontogenyIcon} alt="Ontogeny" className="navbar-logo" />
            <h1>Ontogeny Studios</h1>
          </div>
          
          <div className="navbar-right">
            <button className="navbar-btn">
              <Settings size={20} />
            </button>
            <button className="navbar-btn" onClick={handleLogout}>
              <LogOut size={20} />
            </button>
          </div>
        </nav>

        {/* Main Content */}
        {dashboardData.isAdmin ? (
          <AdminDashboard
            allUsers={dashboardData.allUsers}
            selectedUser={dashboardData.selectedUser}
            userProjects={dashboardData.userProjects}
            usersLoading={dashboardData.usersLoading}
            userSearchQuery={dashboardData.userSearchQuery}
            sortByAlerts={dashboardData.sortByAlerts}
            onUserSelect={dashboardData.handleUserSelect}
            onUserSearchChange={dashboardData.setUserSearchQuery}
            onToggleAlertSort={dashboardData.toggleAlertSort}
            onCreateProject={modals.openCreateProjectModal}
            onOpenAdminProject={modals.openUserRequestedModal}
          />
        ) : (
          <UserDashboard
            customerProjects={dashboardData.customerProjects}
            requestedProjects={dashboardData.requestedProjects}
            customerProjectsLoading={dashboardData.customerProjectsLoading}
            requestedProjectsLoading={dashboardData.requestedProjectsLoading}
            onOpenAIChat={modals.openAIChat}
            onOpenCustomerProject={handleOpenCustomerProject}
            onFeatureRequest={handleFeatureRequest}
          />
        )}
      </div>
      
      {/* AI Chat Modal */}
      <AIChatModal
        isOpen={modals.aiChatOpen}
        onClose={modals.selectedProjectForFeature ? modals.handleCloseFeatureWorkflow : modals.handleCloseProjectWorkflow}
        onNextStep={modals.selectedProjectForFeature ? modals.handleFeatureConsultationNextStep : modals.handleAIConsultationNextStep}
        mode={modals.selectedProjectForFeature ? 'feature-request' : 'project-request'}
        project={modals.selectedProjectForFeature}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={modals.createProjectModalOpen}
        onClose={modals.closeCreateProjectModal}
        onSubmit={handleCreateProject}
        userDisplayName={dashboardData.selectedUser?.displayName || ''}
      />

      {/* Feature Request Workflow Modals */}
      <FeatureRequestModal
        isOpen={modals.featureRequestModalOpen}
        onClose={modals.handleCloseFeatureWorkflow}
        onNext={modals.handleFeatureDetailsNextStep}
        onBack={() => {
          modals.closeFeatureRequestModal();
          modals.openAIChat(modals.selectedProjectForFeature);
        }}
        conversationData={modals.featureConversationData}
        project={modals.selectedProjectForFeature}
      />

      <FeatureAssignmentModal
        isOpen={modals.featureAssignmentModalOpen}
        onClose={modals.handleCloseFeatureWorkflow}
        onSubmit={handleFeatureAssignmentComplete}
        onBack={() => {
          modals.closeFeatureAssignmentModal();
          modals.openFeatureRequestModal(modals.featureConversationData);
        }}
        featureData={modals.featureRequestData}
      />

      {/* Edit Project Modal */}
      {modals.editProjectModalOpen && modals.selectedProjectForEdit && (
        <EditProjectModal
          project={modals.selectedProjectForEdit}
          onClose={modals.closeEditProjectModal}
          onUpdate={handleProjectUpdate}
        />
      )}

      {/* User Requested Project Modal */}
      <UserRequestedProjectModal
        isOpen={modals.showUserRequestedModal}
        onClose={modals.closeUserRequestedModal}
        project={modals.selectedUserProject}
        onUpdate={() => {
          if (dashboardData.selectedUser) {
            dashboardData.handleUserSelect(dashboardData.selectedUser);
          }
        }}
        currentUser={currentUser}
        onOpenAdminProject={handleOpenAdminProject}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={modals.projectDetailsModalOpen}
        onClose={modals.handleCloseProjectWorkflow}
        onNextStep={modals.handleProjectDetailsNextStep}
        conversationData={modals.conversationData}
      />

      {/* Meeting Scheduler Modal */}
      <MeetingSchedulerModal
        isOpen={modals.meetingSchedulerModalOpen}
        onClose={modals.handleCloseProjectWorkflow}
        onComplete={handleMeetingSchedulerComplete}
        projectDetails={modals.projectDetails}
      />

      <Footer />
    </>
  );
};

export default Dashboard; 