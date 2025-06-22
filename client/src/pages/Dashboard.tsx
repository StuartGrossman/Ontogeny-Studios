import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import ontogenyIcon from '../assets/otogeny-icon.png';
import { doc, setDoc, addDoc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { onSnapshot } from 'firebase/firestore';
import { FaPlus, FaRocket, FaBell, FaUser, FaChartLine, FaCalendar, FaCog, FaProjectDiagram, FaUsers, FaChevronRight, FaSpinner, FaEye, FaCommentAlt, FaHeart, FaBuilding, FaLightbulb, FaExclamationTriangle, FaCheckCircle, FaClock, FaFire, FaUserTie } from 'react-icons/fa';

// Custom hooks
import { useDashboardData } from '../hooks/useDashboardData';
import { useProjectModals } from '../hooks/useProjectModals';

// Components
import UserDashboard from '../components/UserDashboard';
// import Footer from '../components/Footer'; // Removed footer from dashboard
import AIChatModal from '../components/AIChatModal';


// Debug utility
import '../utils/addTestProject.js';

import { ProjectDetailsModal, MeetingSchedulerModal, FeatureRequestModal, FeatureAssignmentModal } from '../components/modals';

// Styles
import '../styles/UserDashboard.css';
import '../styles/ProjectDetailsModal.css';
import '../styles/MeetingSchedulerModal.css';
import '../styles/FeatureRequestModal.css';
import '../styles/FeatureAssignmentModal.css';
import '../styles/EditProjectModal.css';
import '../styles/UserRequestedProjectModal.css';
import '../styles/Sidebar.css';
import '../styles/AddFeatureModal.css';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Custom hooks
  const dashboardData = useDashboardData(currentUser);
  const modals = useProjectModals();

  // Sidebar state for user dashboard
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  interface Notification {
    id: string;
    read: boolean;
    [key: string]: any;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check authentication
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Fetch notifications
  useEffect(() => {
    if (!currentUser) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        read: false, // Default value
        ...doc.data()
      })) as Notification[];
      setNotifications(notificationsList);
      setUnreadCount(notificationsList.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
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

  // Handle sidebar state change
  const handleSidebarStateChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  // Show loading state
  if (dashboardData.loading) {
    return (
      <div className="user-dashboard-loading">
        <div className="user-dashboard-loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Add logging for dashboard data
  console.log('🏠 Dashboard component rendered');
  console.log('📊 dashboardData:', dashboardData);
  console.log('👤 currentUser:', currentUser?.uid);

  return (
    <div className="user-dashboard-page">
      
      {/* Navigation Bar */}
      <nav className={`user-dashboard-navbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="user-dashboard-nav-left">
          <div className="user-dashboard-nav-brand">
            <img 
              src={ontogenyIcon} 
              alt="Ontogeny" 
              className="user-dashboard-brand-icon"
            />
            <div className="user-dashboard-brand-text">
              <span className="user-dashboard-gradient-text">Ontogeny</span>
            </div>
          </div>
        </div>

        <div className="user-dashboard-nav-center">
          <div className="user-dashboard-nav-links">
            {/* Management link moved to the right side */}
          </div>
        </div>

        <div className="user-dashboard-nav-right">
          {dashboardData.isAdmin && (
            <a href="/management" className="user-dashboard-nav-link" title="Management Dashboard">
              <FaUserTie />
              Management
            </a>
          )}
          <button className="user-dashboard-nav-tab" title="Notifications">
            <FaBell />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          <button className="user-dashboard-nav-tab" title="Settings">
            <FaCog />
          </button>
          <button className="user-dashboard-nav-tab" title="Profile">
            <FaUser />
          </button>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <div className="user-dashboard-container">
        <main className={`user-dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="user-dashboard-content">
            <UserDashboard
              customerProjects={dashboardData.customerProjects}
              requestedProjects={dashboardData.requestedProjects}
              customerProjectsLoading={dashboardData.customerProjectsLoading}
              requestedProjectsLoading={dashboardData.requestedProjectsLoading}
              onOpenAIChat={modals.openAIChat}
              onOpenCustomerProject={handleOpenCustomerProject}
              onFeatureRequest={handleFeatureRequest}
              onSidebarStateChange={handleSidebarStateChange}
              sidebarCollapsed={sidebarCollapsed}
            />
          </div>
        </main>
      </div>

      {/* AI Chat Modal */}
      <AIChatModal
        isOpen={modals.aiChatOpen}
        onClose={modals.selectedProjectForFeature ? modals.handleCloseFeatureWorkflow : modals.handleCloseProjectWorkflow}
        onNextStep={modals.selectedProjectForFeature ? modals.handleFeatureConsultationNextStep : modals.handleAIConsultationNextStep}
        mode={modals.selectedProjectForFeature ? 'feature-request' : 'project-request'}
        project={modals.selectedProjectForFeature}
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

      {/* Footer removed from dashboard for better space utilization */}
    </div>
  );
};

export default Dashboard; 