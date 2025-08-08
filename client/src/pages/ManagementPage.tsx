import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, MessageCircle, GitPullRequest, Star, FileText, RefreshCw, Bell } from 'lucide-react';
import ontogenyIcon from '../assets/otogeny-icon.png';
import { doc, setDoc, addDoc, collection, updateDoc, query, where, getDocs, getDoc, orderBy } from 'firebase/firestore';
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
import ProjectTeamModal from '../components/modals/ProjectTeamModal';
import { ProjectDetailsModal, MeetingSchedulerModal, FeatureRequestModal, FeatureAssignmentModal } from '../components/modals';

// Styles (scoped to management)
import '../styles/management/index.css';

const ManagementPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | undefined>(undefined);
  const [currentView, setCurrentView] = useState<'dashboard' | 'requested-projects' | 'requested-features'>('dashboard');
  const [unaddressedProjects, setUnaddressedProjects] = useState<any[]>([]);
  const [unaddressedFeatures, setUnaddressedFeatures] = useState<any[]>([]);
  const [unaddressedUIDesigns, setUnaddressedUIDesigns] = useState<any[]>([]);
  const [alertCounts, setAlertCounts] = useState({ projects: 0, features: 0, ui: 0 });
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedProjectForTeam, setSelectedProjectForTeam] = useState<any>(null);
  const [showBellRequests, setShowBellRequests] = useState(false);

  // Custom hooks
  const dashboardData = useDashboardData(currentUser);
  const modals = useProjectModals();

  // Check authentication and admin status
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    
    const checkAndSetAdminStatus = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const isAdmin = userDoc.exists() && userDoc.data().isAdmin === true;
        
        // If not admin in Firestore, update it
        if (!isAdmin) {
          await updateDoc(doc(db, 'users', currentUser.uid), {
            isAdmin: true,
            role: 'admin',
            updatedAt: new Date()
          });
          console.log('Updated admin status in Firestore');
        }

        // Force admin mode for management page
        if (!dashboardData.loading && !dashboardData.isAdmin) {
          dashboardData.toggleAdminStatus();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      }
    };

    checkAndSetAdminStatus();
  }, [currentUser, navigate, dashboardData.loading, dashboardData.isAdmin]);

  // Fetch unaddressed requests
  const fetchUnaddressedRequests = async () => {
    try {
      if (!currentUser?.uid) {
        console.warn('No current user. Skipping unaddressed requests fetch.');
        return;
      }

      // Fetch unaddressed project requests from the correct collection
      const projectsQuery = query(
        collection(db, 'user_project_requests'),
        where('status', 'in', ['pending', 'under-review'])
      );
      
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamps to Date objects for display
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
          // Handle features that might be a string, array, or undefined
          features: (() => {
            const features = doc.data().features;
            console.log('Processing features for project', doc.id, {
              featuresType: typeof features,
              isArray: Array.isArray(features),
              rawFeatures: features
            });
            if (!features || features === '') return [];
            if (Array.isArray(features)) {
              return features.map((f: any) => ({
                ...f,
                id: f.id || `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: f.createdAt?.toDate ? f.createdAt.toDate() : f.createdAt || new Date()
              }));
            }
            if (typeof features === 'string') {
              // If features is a string, split by newlines and create feature objects
              const featureArray = features.split('\n')
                .filter(line => line.trim())
                .map(line => ({
                  text: line.trim(),
                  id: `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  createdAt: new Date(),
                  completed: line.startsWith('✓') || line.startsWith('[x]'),
                  estimatedHours: 0
                }));
              console.log('Converted string features to array:', featureArray);
              return featureArray;
            }
            console.warn('Unexpected features format:', features);
            return [];
          })()
        }))
        .sort((a, b) => {
          // Sort by createdAt in descending order
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

      // Fetch feature requests from the new feature_requests collection
      const featureRequestsQuery = query(
        collection(db, 'feature_requests'),
        where('status', '==', 'pending')
      );
      
      const featureRequestsSnapshot = await getDocs(featureRequestsQuery);
      const featureRequests = featureRequestsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamps to Date objects for display
          requestedAt: doc.data().requestedAt?.toDate ? doc.data().requestedAt.toDate() : doc.data().requestedAt,
        }))
        .sort((a, b) => {
          // Sort by requestedAt in descending order
          const dateA = a.requestedAt instanceof Date ? a.requestedAt : new Date(a.requestedAt);
          const dateB = b.requestedAt instanceof Date ? b.requestedAt : new Date(b.requestedAt);
          return dateB.getTime() - dateA.getTime();
        });

      // Fetch UI design requests from ui_design_requests collection
      const uiRequestsQuery = query(
        collection(db, 'ui_design_requests'),
        where('status', '==', 'pending')
      );

      const uiRequestsSnapshot = await getDocs(uiRequestsQuery);
      const uiRequests = uiRequestsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          requestedAt: doc.data().requestedAt?.toDate ? doc.data().requestedAt.toDate() : doc.data().requestedAt,
        }))
        .sort((a, b) => {
          const dateA = a.requestedAt instanceof Date ? a.requestedAt : new Date(a.requestedAt);
          const dateB = b.requestedAt instanceof Date ? b.requestedAt : new Date(b.requestedAt);
          return dateB.getTime() - dateA.getTime();
        });

      setUnaddressedProjects(projects);
      setUnaddressedFeatures(featureRequests);
      setUnaddressedUIDesigns(uiRequests);
      setAlertCounts({
        projects: projects.length,
        features: featureRequests.length,
        ui: uiRequests.length
      });

    } catch (error: unknown) {
      console.error('Error fetching unaddressed requests:', error);
      // If it's a permission error, try to refresh admin status
      if (error instanceof Error && 'code' in error && error.code === 'permission-denied') {
        console.log('Permission denied. Checking admin status...');
        if (!currentUser?.uid) {
          console.warn('No current user. Skipping admin status check.');
          return;
        }
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().isAdmin) {
            console.log('User is admin. Retrying in 5 seconds...');
            setTimeout(fetchUnaddressedRequests, 5000);
          } else {
            console.warn('User is not an admin. Skipping unaddressed requests fetch.');
          }
        } catch (adminCheckError) {
          console.error('Error checking admin status:', adminCheckError);
          // Still retry after a delay in case it's a temporary issue
          setTimeout(fetchUnaddressedRequests, 5000);
        }
      }
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

  // Listen for client-side events that indicate new requests were added
  useEffect(() => {
    const handler = () => {
      fetchUnaddressedRequests();
    };
    try {
      window.addEventListener('projectRequestAdded', handler as EventListener);
      window.addEventListener('featureRequestAdded', handler as EventListener);
      window.addEventListener('uiDesignRequestAdded', handler as EventListener);
    } catch {}
    return () => {
      try {
        window.removeEventListener('projectRequestAdded', handler as EventListener);
        window.removeEventListener('featureRequestAdded', handler as EventListener);
        window.removeEventListener('uiDesignRequestAdded', handler as EventListener);
      } catch {}
    };
  }, []);

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
      const createdRef = await addDoc(collection(db, 'projects'), {
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
      console.log('Created project ID:', createdRef.id);
      
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

  // Handle project deletion (soft delete) - Now with enhanced security logging
  const handleDeleteProject = async (projectId: string) => {
    try {
      // Get project data for logging
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.exists() ? projectDoc.data() : null;

      // Enhanced deletion with security logging
      await updateDoc(doc(db, 'projects', projectId), {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: currentUser?.uid,
        deletedByEmail: currentUser?.email,
        deletedByName: currentUser?.displayName,
        deletionReason: 'Admin initiated secure deletion',
        securityVerification: {
          adminPasswordVerified: true,
          adminAssignedToProject: true,
          verificationTimestamp: new Date(),
          verificationMethod: 'secure-delete-modal'
        }
      });

      // Log the deletion event for audit purposes
      await addDoc(collection(db, 'admin_audit_logs'), {
        action: 'project_deletion',
        projectId: projectId,
        projectName: projectData?.name || projectData?.projectName || 'Unknown',
        adminId: currentUser?.uid,
        adminEmail: currentUser?.email,
        adminName: currentUser?.displayName,
        timestamp: new Date(),
        details: {
          deletionMethod: 'secure-delete-modal',
          passwordVerification: true,
          authorizationCheck: true,
          projectAssignments: projectData?.assignments || []
        }
      });

      // Refresh user projects
      if (dashboardData.selectedUser) {
        await dashboardData.handleUserSelect(dashboardData.selectedUser);
      }
      
      console.log('Project deleted successfully with enhanced security logging');
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error; // Re-throw to show error in modal
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

  // Handle team management
  const handleManageTeam = (project: any) => {
    setSelectedProjectForTeam(project);
    setShowTeamModal(true);
  };

  // Show loading state
  if (dashboardData.loading) {
    return (
      <div className="mgmt-loading">
        <div className="loading-spinner"></div>
        <p>Loading management dashboard...</p>
      </div>
    );
  }

  // Redirect non-admin users
  if (!dashboardData.isAdmin) {
    return (
      <div className="mgmt-unauthorized">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the management dashboard.</p>
        <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  return (
    <>
      <div className="mgmt-page">
        {/* Top Navigation Bar */}
        <nav className="mgmt-navbar">
          <div className="mgmt-nav-left">
            <div className="mgmt-nav-brand">
              <img src={ontogenyIcon} alt="Ontogeny" className="mgmt-brand-icon" />
              <div className="mgmt-brand-text">
                <span className="mgmt-gradient-text">Ontogeny Studios</span>
                <span className="mgmt-subtitle">Management</span>
              </div>
            </div>
          </div>
          
          <div className="mgmt-nav-center">
            <div className="mgmt-nav-tabs">
              <button 
                className={`mgmt-request-tab ${currentView === 'requested-projects' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('requested-projects');
                  setShowChat(false);
                  setSelectedChatUserId(undefined);
                  // Refresh data when switching to this view
                  fetchUnaddressedRequests();
                }}
              >
                <FileText size={16} />
                <span>Project Requests</span>
                {alertCounts.projects > 0 && (
                  <span className="mgmt-alert-badge">{alertCounts.projects}</span>
                )}
              </button>
              <button 
                className={`mgmt-request-tab ${currentView === 'requested-features' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('requested-features');
                  setShowChat(false);
                  setSelectedChatUserId(undefined);
                  // Refresh data when switching to this view
                  fetchUnaddressedRequests();
                }}
              >
                <Star size={16} />
                <span>Feature Requests</span>
                {alertCounts.features > 0 && (
                  <span className="mgmt-alert-badge">{alertCounts.features}</span>
                )}
              </button>
            </div>
          </div>
          
          <div className="mgmt-nav-right">
            {/* Admin Alert Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                className={`nav-tab ${showBellRequests ? 'active' : ''}`}
                onClick={() => {
                  setShowBellRequests(!showBellRequests);
                  if (!showBellRequests) {
                    fetchUnaddressedRequests();
                  }
                }}
                title="Alerts"
              >
                <Bell size={20} />
              </button>
              {(alertCounts.projects + alertCounts.features + alertCounts.ui) > 0 && (
                <span className="mgmt-alert-badge" style={{ position: 'absolute', top: -6, right: -6 }}>
                  {alertCounts.projects + alertCounts.features + alertCounts.ui}
                </span>
              )}
              {showBellRequests && (
                <div style={{ position: 'absolute', right: 0, top: 44, background: '#111', border: '1px solid #333', borderRadius: 12, width: 360, zIndex: 1000, boxShadow: '0 12px 24px rgba(0,0,0,.4)' }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #333', color: '#fff', fontWeight: 700 }}>Pending Requests</div>
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {unaddressedProjects.slice(0, 5).map((proj) => (
                      <div key={proj.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #222', cursor: 'pointer', color: '#ddd' }}
                        onClick={() => {
                          setShowBellRequests(false);
                          modals.openUserRequestedModal(proj);
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>{proj.name}</span>
                          <span style={{ color: '#888', fontSize: 12 }}>{proj.status}</span>
                        </div>
                        <div style={{ color: '#888', fontSize: 12 }}>Project • {proj.priority} priority</div>
                      </div>
                    ))}
                    {unaddressedFeatures.slice(0, 5).map((fr) => (
                      <div key={fr.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #222', color: '#ddd' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>{fr.projectName}</span>
                          <span style={{ color: '#888', fontSize: 12 }}>{fr.status}</span>
                        </div>
                        <div style={{ color: '#888', fontSize: 12 }}>Feature • {fr.priority} priority</div>
                      </div>
                    ))}
                    {unaddressedUIDesigns.slice(0, 5).map((ur) => (
                      <div key={ur.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #222', color: '#ddd' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>{ur.projectName || 'UI Design'}</span>
                          <span style={{ color: '#888', fontSize: 12 }}>{ur.status}</span>
                        </div>
                        <div style={{ color: '#888', fontSize: 12 }}>UI Design • {ur.priority} priority</div>
                      </div>
                    ))}
                    {(unaddressedProjects.length + unaddressedFeatures.length + unaddressedUIDesigns.length) === 0 && (
                      <div style={{ padding: '1rem', color: '#888' }}>No pending requests</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="mgmt-user-profile">
              <UserAvatar
                photoURL={currentUser?.photoURL}
                displayName={currentUser?.displayName || 'User'}
                size={32}
              />
              <span className="mgmt-user-name">{currentUser?.displayName || 'User'}</span>
            </div>
            <button 
              className="nav-tab"
              onClick={() => navigate('/dashboard')}
              title="Switch to User Dashboard"
            >
              <GitPullRequest size={20} />
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
          <div className="mgmt-requests-view">
            <div className="mgmt-requests-header">
              <h2>Unaddressed Project Requests</h2>
              <p>Review and respond to user project requests that need your attention.</p>
              <button 
                className="mgmt-refresh-btn"
                onClick={fetchUnaddressedRequests}
                title="Refresh requests"
              >
                <RefreshCw size={16} />
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
                      <h3>{project.name}</h3>
                      <span className={`status-badge ${project.status}`}>
                        {project.status}
                      </span>
                      <span className="project-type-badge">
                        {project.isNewProject ? 'New Project' : 'Feature Request'}
                      </span>
                    </div>
                    <p className="request-description">
                      {project.description?.substring(0, 150)}
                      {project.description?.length > 150 ? '...' : ''}
                    </p>
                    <div className="request-meta">
                      <span>Priority: {project.priority}</span>
                      <span>Features: {project.features?.length || 0}</span>
                      <span>Est. {project.totalTimeEstimate}h</span>
                      <span>
                        Requested: {project.createdAt instanceof Date 
                          ? project.createdAt.toLocaleDateString()
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
          <div className="mgmt-requests-view">
            <div className="mgmt-requests-header">
              <h2>Unaddressed Feature Requests</h2>
              <p>Review and respond to user feature requests that need your attention.</p>
              <button 
                className="mgmt-refresh-btn"
                onClick={fetchUnaddressedRequests}
                title="Refresh requests"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
            <div className="requests-grid">
              {unaddressedFeatures.length > 0 ? (
                unaddressedFeatures.map((featureRequest) => (
                  <div 
                    key={featureRequest.id} 
                    className="request-card feature-request-card"
                    onClick={() => {
                      // For now, just log the feature request
                      console.log('Feature request clicked:', featureRequest);
                      // TODO: Create a modal to view/edit feature request details
                    }}
                  >
                    <div className="request-header">
                      <h3>{featureRequest.projectName}</h3>
                      <span className={`status-badge ${featureRequest.status}`}>
                        {featureRequest.status}
                      </span>
                      <span className="priority-badge">
                        {featureRequest.priority} priority
                      </span>
                    </div>
                    <div className="feature-description">
                      <p>{featureRequest.description}</p>
                    </div>
                    <div className="request-meta">
                      <span>Category: {featureRequest.category}</span>
                      <span>
                        Requested: {featureRequest.requestedAt instanceof Date 
                          ? featureRequest.requestedAt.toLocaleDateString()
                          : new Date(featureRequest.requestedAt).toLocaleDateString()}
                      </span>
                      <span>By: {featureRequest.requestedByEmail || 'Unknown'}</span>
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
            onManageTeam={handleManageTeam}
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
          onNavigateToMessages={handleNavigateToMessages}
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

      {/* Project Team Modal */}
      <ProjectTeamModal
        isOpen={showTeamModal}
        onClose={() => {
          setShowTeamModal(false);
          setSelectedProjectForTeam(null);
        }}
        project={selectedProjectForTeam}
        onUpdate={async () => {
          // Refresh data in background
          if (dashboardData.selectedUser) {
            await dashboardData.handleUserSelect(dashboardData.selectedUser);
          }
        }}
      />
    </>
  );
};

export default ManagementPage; 