import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, MessageCircle, GitPullRequest, Star } from 'lucide-react';
import ontogenyIcon from '../assets/otogeny-icon.png';
import { doc, setDoc, addDoc, collection, updateDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { UserAvatar } from '../utils/avatarGenerator';

// Custom hooks
import { useDashboardData } from '../hooks/useDashboardData';
import { useProjectModals } from '../hooks/useProjectModals';

// Components
import AdminDashboard from '../components/AdminDashboard';
import ChatSystem from '../components/ChatSystem';
import SettingsPage from '../components/SettingsPage';

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
  const [showSettings, setShowSettings] = useState(false);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | undefined>(undefined);
  const [currentView, setCurrentView] = useState<'dashboard' | 'requested-projects' | 'requested-features'>('dashboard');
  const [unaddressedProjects, setUnaddressedProjects] = useState<any[]>([]);
  const [unaddressedFeatures, setUnaddressedFeatures] = useState<any[]>([]);
  const [alertCounts, setAlertCounts] = useState({ projects: 0, features: 0 });

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

  // Fetch unaddressed requests
  const fetchUnaddressedRequests = async () => {
    try {
      // Fetch unaddressed project requests (status: pending, requested, under-review)
      // Note: Removed 'deleted != true' filter to avoid multiple inequality filters
      const projectsQuery = query(
        collection(db, 'projects'),
        where('type', '==', 'user-requested'),
        where('status', 'in', ['pending', 'requested', 'under-review']),
        orderBy('createdAt', 'desc')
      );
      
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((project: any) => !project.deleted); // Filter out deleted projects on client side

      // Fetch unaddressed feature requests (projects with features that haven't been addressed)
      // Note: Using separate queries to avoid multiple inequality filters
      const featuresQuery = query(
        collection(db, 'projects'),
        where('type', '==', 'user-requested'),
        where('status', 'in', ['pending', 'requested', 'under-review']),
        orderBy('createdAt', 'desc')
      );
      
      const featuresSnapshot = await getDocs(featuresQuery);
      const features = featuresSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((project: any) => 
          !project.deleted && 
          project.features && 
          project.features.trim() !== ''
        ); // Filter on client side for deleted and empty features

      setUnaddressedProjects(projects);
      setUnaddressedFeatures(features);
      setAlertCounts({
        projects: projects.length,
        features: features.length
      });

    } catch (error) {
      console.error('Error fetching unaddressed requests:', error);
    }
  };

  // Fetch unaddressed requests on component mount and periodically
  useEffect(() => {
    if (currentUser && dashboardData.isAdmin) {
      fetchUnaddressedRequests();
      
      // Set up periodic refresh every 30 seconds
      const interval = setInterval(fetchUnaddressedRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, dashboardData.isAdmin]);

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

  // Handle project update without closing modal
  const handleProjectUpdate = async () => {
    // Refresh data in background without closing the modal
    if (dashboardData.selectedUser) {
      await dashboardData.handleUserSelect(dashboardData.selectedUser);
    }
    // Refresh alert counts
    await fetchUnaddressedRequests();
    // Note: Modal stays open so user can continue editing or make more changes
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

  // Handle project deletion (soft delete)
  const handleDeleteProject = async (projectId: string) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: currentUser?.uid
      });

      // Refresh user projects
      if (dashboardData.selectedUser) {
        await dashboardData.handleUserSelect(dashboardData.selectedUser);
      }
      
      console.log('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  // Handle project restoration
  const handleRestoreProject = async (projectId: string) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        deleted: false,
        deletedAt: null,
        restoredAt: new Date(),
        restoredBy: currentUser?.uid
      });

      // Refresh user projects
      if (dashboardData.selectedUser) {
        await dashboardData.handleUserSelect(dashboardData.selectedUser);
      }
      
      console.log('Project restored successfully');
    } catch (error) {
      console.error('Error restoring project:', error);
    }
  };

  // Handle navigation to messages with specific user
  const handleNavigateToMessages = (userId: string) => {
    const targetUser = dashboardData.allUsers.find(user => user.id === userId);
    if (targetUser) {
      setSelectedChatUserId(userId);
      setShowChat(true);
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
            <div className="nav-tabs-section">
              <button 
                className={`nav-request-tab ${currentView === 'requested-projects' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('requested-projects');
                  setShowChat(false);
                  setSelectedChatUserId(undefined);
                  // Refresh data when switching to this view
                  fetchUnaddressedRequests();
                }}
                title="View Requested Projects"
              >
                <GitPullRequest size={18} />
                <span>Requested Projects</span>
                {alertCounts.projects > 0 && (
                  <span className="nav-alert-badge">{alertCounts.projects}</span>
                )}
              </button>
              <button 
                className={`nav-request-tab ${currentView === 'requested-features' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('requested-features');
                  setShowChat(false);
                  setSelectedChatUserId(undefined);
                  // Refresh data when switching to this view
                  fetchUnaddressedRequests();
                }}
                title="View Requested Features"
              >
                <Star size={18} />
                <span>Requested Features</span>
                {alertCounts.features > 0 && (
                  <span className="nav-alert-badge">{alertCounts.features}</span>
                )}
              </button>
              <button 
                className={`nav-request-tab ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('dashboard');
                  setShowChat(false);
                  setSelectedChatUserId(undefined);
                }}
                title="Back to Dashboard"
              >
                <MessageCircle size={18} />
                <span>User Management</span>
              </button>
            </div>
          </div>
          
          <div className="nav-right">
            <div className="user-profile-section">
              <UserAvatar
                photoURL={currentUser?.photoURL}
                displayName={currentUser?.displayName || 'Admin'}
                size={32}
              />
              <span className="user-name">{currentUser?.displayName || 'Admin'}</span>
            </div>
            <button 
              className="nav-link-button"
              onClick={() => navigate('/dashboard')}
              title="Switch to User Dashboard"
            >
              User Dashboard
            </button>
            <button 
              className={`nav-tab ${showChat ? 'active' : ''}`} 
              onClick={() => {
                if (showChat) {
                  setSelectedChatUserId(undefined);
                }
                setShowChat(!showChat);
                setShowSettings(false); // Close settings when opening chat
              }}
              title="User Chat"
            >
              <MessageCircle size={20} />
            </button>
            <button 
              className={`nav-tab ${showSettings ? 'active' : ''}`} 
              onClick={() => {
                setShowSettings(!showSettings);
                setShowChat(false); // Close chat when opening settings
              }}
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button className="nav-tab" onClick={handleLogout} title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        {showSettings ? (
          <SettingsPage 
            isOpen={showSettings}
            currentUser={currentUser}
            onClose={() => setShowSettings(false)}
          />
        ) : showChat ? (
          <ChatSystem 
            currentUser={currentUser ? {
              id: currentUser.uid,
              name: currentUser.displayName || 'Admin',
              avatar: currentUser.photoURL || undefined
            } : undefined}
            allUsers={dashboardData.allUsers}
            preselectedUserId={selectedChatUserId}
          />
        ) : currentView === 'requested-projects' ? (
          <div className="requested-projects-view">
            <div className="requests-header">
              <h2>Unaddressed Project Requests</h2>
              <p>Review and respond to user project requests that need your attention.</p>
              <button 
                className="refresh-btn"
                onClick={fetchUnaddressedRequests}
                title="Refresh requests"
              >
                Refresh
              </button>
            </div>
            <div className="requests-grid">
              {unaddressedProjects.length > 0 ? (
                unaddressedProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className="request-card"
                    onClick={() => modals.openUserRequestedModal(project)}
                  >
                    <div className="request-header">
                      <h3>{project.name || project.projectName}</h3>
                      <span className={`status-badge ${project.status}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="request-description">
                      {project.description?.substring(0, 150)}...
                    </p>
                    <div className="request-meta">
                      <span>Priority: {project.priority}</span>
                      <span>
                        Requested: {project.createdAt?.seconds 
                          ? new Date(project.createdAt.seconds * 1000).toLocaleDateString()
                          : new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-requests">
                  <GitPullRequest size={64} />
                  <h3>No pending project requests</h3>
                  <p>All project requests have been addressed!</p>
                </div>
              )}
            </div>
          </div>
        ) : currentView === 'requested-features' ? (
          <div className="requested-features-view">
            <div className="requests-header">
              <h2>Unaddressed Feature Requests</h2>
              <p>Review and respond to user feature requests that need your attention.</p>
              <button 
                className="refresh-btn"
                onClick={fetchUnaddressedRequests}
                title="Refresh requests"
              >
                Refresh
              </button>
            </div>
            <div className="requests-grid">
              {unaddressedFeatures.length > 0 ? (
                unaddressedFeatures.map((project) => (
                  <div 
                    key={project.id} 
                    className="request-card"
                    onClick={() => modals.openUserRequestedModal(project)}
                  >
                    <div className="request-header">
                      <h3>{project.name || project.projectName}</h3>
                      <span className={`status-badge ${project.status}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="features-preview">
                      <strong>Requested Features:</strong>
                      <div className="features-list">
                        {project.features?.split('\n').slice(0, 3).map((feature: string, index: number) => (
                          <div key={index} className="feature-item">
                            {feature.length > 80 ? `${feature.substring(0, 80)}...` : feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="request-meta">
                      <span>Priority: {project.priority}</span>
                      <span>
                        Requested: {project.createdAt?.seconds 
                          ? new Date(project.createdAt.seconds * 1000).toLocaleDateString()
                          : new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-requests">
                  <Star size={64} />
                  <h3>No pending feature requests</h3>
                  <p>All feature requests have been addressed!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <AdminDashboard
            allUsers={dashboardData.allUsers}
            selectedUser={dashboardData.selectedUser}
            userProjects={dashboardData.userProjects}
            allProjects={dashboardData.allProjects}
            usersLoading={dashboardData.usersLoading}
            userProjectsLoading={dashboardData.userProjectsLoading}
            userSearchQuery={dashboardData.userSearchQuery}
            sortByAlerts={dashboardData.sortByAlerts}
            onUserSelect={dashboardData.handleUserSelect}
            onUserSearchChange={dashboardData.setUserSearchQuery}
            onToggleAlertSort={dashboardData.toggleAlertSort}
            onCreateProject={modals.openCreateProjectModal}
            onOpenAdminProject={handleOpenAdminProject}
            onDeleteProject={handleDeleteProject}
            onRestoreProject={handleRestoreProject}
            onNavigateToMessages={handleNavigateToMessages}
            currentUser={currentUser}
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
        onUpdate={async () => {
          // Refresh data in background without closing the modal
          if (dashboardData.selectedUser) {
            await dashboardData.handleUserSelect(dashboardData.selectedUser);
          }
          await fetchUnaddressedRequests();
          // Note: Modal stays open so user can continue working
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
    </>
  );
};

export default ManagementPage; 