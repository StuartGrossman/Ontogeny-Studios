import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, MessageCircle } from 'lucide-react';
import ontogenyIcon from '../assets/otogeny-icon.png';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

// Custom hooks
import { useDashboardData } from '../hooks/useDashboardData';
import { useProjectModals } from '../hooks/useProjectModals';

// Components
import AdminDashboard from '../components/AdminDashboard';
import ChatSystem from '../components/ChatSystem';
import Footer from '../components/Footer';
import AIChatModal from '../components/AIChatModal';
import CreateProjectModal, { ProjectFormData } from '../components/modals/CreateProjectModal';
import EditProjectModal from '../components/modals/EditProjectModal';
import UserRequestedProjectModal from '../components/modals/UserRequestedProjectModal';
import { ProjectDetailsModal, MeetingSchedulerModal, FeatureRequestModal, FeatureAssignmentModal } from '../components/modals';

// Styles
import '../styles/Management.css';
import '../styles/ProjectDetailsModal.css';
import '../styles/MeetingSchedulerModal.css';
import '../styles/FeatureRequestModal.css';
import '../styles/FeatureAssignmentModal.css';
import '../styles/EditProjectModal.css';
import '../styles/UserRequestedProjectModal.css';

const ManagementPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);

  // Custom hooks
  const dashboardData = useDashboardData(currentUser);
  const modals = useProjectModals();

  // Check authentication and admin status
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    
    // Force admin mode for management page
    if (!dashboardData.loading && !dashboardData.isAdmin) {
      dashboardData.toggleAdminStatus();
    }
  }, [currentUser, navigate, dashboardData.loading, dashboardData.isAdmin]);

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
        progress: 0,
        type: 'admin-created',
        createdBy: currentUser?.uid,
        createdByAdmin: true,
        tasks: [],
        deadline: null
      });
      
      modals.closeCreateProjectModal();
      
      // Refresh user projects for admin view
      if (dashboardData.selectedUser) {
        await dashboardData.handleUserSelect(dashboardData.selectedUser);
      }
      
      console.log('Project created successfully for user:', dashboardData.selectedUser.displayName);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error; // Re-throw to show error in modal
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

  // Handle admin project modal opening - route to correct modal based on project type
  const handleOpenAdminProject = (project: any) => {
    console.log('Opening admin project with type:', project.type, project);
    
    if (project.type === 'user-requested') {
      // Open UserRequestedProjectModal for user-requested projects
      modals.openUserRequestedModal(project);
    } else if (project.type === 'admin-created') {
      // Open EditProjectModal for admin-created projects
      modals.openEditProjectModal(project);
    } else {
      console.error('Unknown project type:', project.type);
      // Default to edit modal for admin-created projects
      modals.openEditProjectModal(project);
    }
  };

  // Handle opening admin project from UserRequestedProjectModal (receives ID string)
  const handleOpenAdminProjectById = (adminProjectId: string) => {
    console.log('Opening admin project by ID:', adminProjectId);
    // This would need to fetch the project data by ID and open the appropriate modal
    // For now, just log it since this feature isn't fully implemented yet
  };

  // Handle meeting scheduler completion
  const handleMeetingSchedulerComplete = async (meetingData: any) => {
    try {
      // Save meeting data to Firestore
      await addDoc(collection(db, 'meetings'), {
        ...meetingData,
        createdAt: new Date(),
        createdBy: currentUser?.uid
      });
      
      modals.handleCloseProjectWorkflow();
      console.log('Meeting scheduled successfully');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    }
  };

  // Handle feature assignment completion
  const handleFeatureAssignmentComplete = async (assignmentData: any) => {
    try {
      // Save feature assignment to Firestore
      await addDoc(collection(db, 'featureAssignments'), {
        ...assignmentData,
        projectId: modals.selectedProjectForFeature?.id,
        userId: currentUser?.uid,
        createdAt: new Date(),
        status: 'pending'
      });

      modals.handleCloseFeatureWorkflow();
      console.log('Feature assigned successfully');
    } catch (error) {
      console.error('Error assigning feature:', error);
    }
  };

  // Show loading state
  if (dashboardData.loading) {
    return (
      <div className="management-loading">
        <div className="loading-spinner"></div>
        <p>Loading management dashboard...</p>
      </div>
    );
  }

  // Redirect non-admin users
  if (!dashboardData.isAdmin) {
    return (
      <div className="management-unauthorized">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the management dashboard.</p>
        <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  return (
    <>
      <div className="management-page">
        {/* Top Navigation Bar */}
        <nav className="management-navbar">
          <div className="nav-left">
            <div className="nav-brand">
              <img src={ontogenyIcon} alt="Ontogeny" className="brand-icon" />
              <div className="brand-text">
                <span className="gradient-text">Ontogeny Studios</span>
                <span className="management-subtitle">Management</span>
              </div>
            </div>
          </div>
          
          <div className="nav-center">
            <div className="management-nav-links">
              <button 
                className="nav-link"
                onClick={() => navigate('/dashboard')}
              >
                User Dashboard
              </button>
            </div>
          </div>
          
          <div className="nav-right">
            <button 
              className={`nav-tab ${showChat ? 'active' : ''}`} 
              onClick={() => setShowChat(!showChat)}
              title="User Chat"
            >
              <MessageCircle size={20} />
            </button>
            <button className="nav-tab" title="Settings">
              <Settings size={20} />
            </button>
            <button className="nav-tab" onClick={handleLogout} title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        {showChat ? (
          <ChatSystem 
            currentUser={currentUser ? {
              id: currentUser.uid,
              name: currentUser.displayName || 'Admin',
              avatar: currentUser.photoURL || undefined
            } : undefined}
          />
        ) : (
          <AdminDashboard
            allUsers={dashboardData.allUsers}
            selectedUser={dashboardData.selectedUser}
            userProjects={dashboardData.userProjects}
            usersLoading={dashboardData.usersLoading}
            userProjectsLoading={dashboardData.userProjectsLoading}
            userSearchQuery={dashboardData.userSearchQuery}
            sortByAlerts={dashboardData.sortByAlerts}
            onUserSelect={dashboardData.handleUserSelect}
            onUserSearchChange={dashboardData.setUserSearchQuery}
            onToggleAlertSort={dashboardData.toggleAlertSort}
            onCreateProject={modals.openCreateProjectModal}
            onOpenAdminProject={handleOpenAdminProject}
          />
        )}
      </div>
      
      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={modals.createProjectModalOpen}
        onClose={modals.closeCreateProjectModal}
        onSubmit={handleCreateProject}
        userDisplayName={dashboardData.selectedUser?.displayName || ''}
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
        onOpenAdminProject={handleOpenAdminProjectById}
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

      {/* AI Chat Modal */}
      <AIChatModal
        isOpen={modals.aiChatOpen}
        onClose={modals.selectedProjectForFeature ? modals.handleCloseFeatureWorkflow : modals.handleCloseProjectWorkflow}
        onNextStep={modals.selectedProjectForFeature ? modals.handleFeatureConsultationNextStep : modals.handleAIConsultationNextStep}
        mode={modals.selectedProjectForFeature ? 'feature-request' : 'project-request'}
        project={modals.selectedProjectForFeature}
      />

      <Footer />
    </>
  );
};

export default ManagementPage; 