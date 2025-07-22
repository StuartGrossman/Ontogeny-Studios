import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

// Custom hooks
import { useDashboardData } from '../hooks/useDashboardData';
import { useProjectModals } from '../hooks/useProjectModals';

// Components
import UserDashboard from '../components/UserDashboard';
import AIChatModal from '../components/AIChatModal';
import { ProjectDetailsModal, MeetingSchedulerModal, FeatureRequestModal, FeatureAssignmentModal } from '../components/modals';
import SimpleFeatureRequestModal from '../components/modals/SimpleFeatureRequestModal';

// Debug utility
import '../utils/addTestProject.js';

// Styles
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Custom hooks
  const dashboardData = useDashboardData(currentUser);
  const modals = useProjectModals();

  const [isMobile, setIsMobile] = useState(false);

  // Check authentication and mobile state
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Check mobile state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
    modals.openSimpleFeatureRequestModal(project);
  };

  // Handle customer project modal opening
  const handleOpenCustomerProject = (project: any) => {
    // Implementation for opening customer project details
    console.log('Opening customer project:', project);
  };

  // Show loading state with skeleton screen
  if (dashboardData.loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading-overlay">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h2>Loading your dashboard...</h2>
            <p>Preparing your workspace</p>
          </div>
          {/* Loading skeleton */}
          <div className="dashboard-skeleton">
            <div className="skeleton-navbar"></div>
            <div className="skeleton-content">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard modern-dashboard">
      {/* Main Dashboard Content with UX Improvements */}
      <div className="dashboard-container">
        <main className="dashboard-main">
          <div className="dashboard-content">
            {/* Welcome Section - Aesthetic-Usability Effect */}
            <div className="welcome-section">
              <div className="welcome-content">
                <h1>Welcome back, {currentUser?.displayName || 'User'}!</h1>
                <p>Here's what's happening with your projects today.</p>
                
                {/* Quick Actions - Hick's Law (Limited choices) */}
                <div className="quick-actions">
                  <button 
                    className="request-project-button"
                    onClick={modals.openAIChat}
                  >
                    Start New Project
                  </button>
                </div>
              </div>
              
              {/* Dashboard Metrics - Miller's Law (Chunked info) */}
              <div className="dashboard-metrics">
                <div className="metric-card">
                  <div className="metric-icon">📊</div>
                  <div className="metric-content">
                    <span className="metric-number">
                      {dashboardData.customerProjects?.filter(p => p.status === 'in-progress' || p.status === 'planning').length || 0}
                    </span>
                    <span className="metric-label">Active Projects</span>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon">✅</div>
                  <div className="metric-content">
                    <span className="metric-number">
                      {dashboardData.customerProjects?.filter(p => p.status === 'completed').length || 0}
                    </span>
                    <span className="metric-label">Completed</span>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon">📋</div>
                  <div className="metric-content">
                    <span className="metric-number">
                      {dashboardData.requestedProjects?.length || 0}
                    </span>
                    <span className="metric-label">Requests</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content with Progressive Disclosure */}
            <UserDashboard
              customerProjects={dashboardData.customerProjects}
              requestedProjects={dashboardData.requestedProjects}
              customerProjectsLoading={dashboardData.customerProjectsLoading}
              requestedProjectsLoading={dashboardData.requestedProjectsLoading}
              onOpenAIChat={modals.openAIChat}
              onOpenCustomerProject={handleOpenCustomerProject}
              onFeatureRequest={handleFeatureRequest}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <AIChatModal
        isOpen={modals.aiChatOpen}
        onClose={modals.selectedProjectForFeature ? modals.handleCloseFeatureWorkflow : modals.handleCloseProjectWorkflow}
        onNextStep={modals.selectedProjectForFeature ? modals.handleFeatureConsultationNextStep : modals.handleAIConsultationNextStep}
        mode={modals.selectedProjectForFeature ? 'feature-request' : 'project-request'}
        project={modals.selectedProjectForFeature}
      />

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

      <SimpleFeatureRequestModal
        isOpen={modals.simpleFeatureRequestModalOpen}
        onClose={modals.closeSimpleFeatureRequestModal}
        project={modals.selectedProjectForSimpleFeature}
        currentUser={currentUser}
      />

      <ProjectDetailsModal
        isOpen={modals.projectDetailsModalOpen}
        onClose={modals.handleCloseProjectWorkflow}
        onNextStep={modals.handleProjectDetailsNextStep}
        conversationData={modals.conversationData}
      />

      <MeetingSchedulerModal
        isOpen={modals.meetingSchedulerModalOpen}
        onClose={modals.handleCloseProjectWorkflow}
        onComplete={handleMeetingSchedulerComplete}
        projectDetails={modals.projectDetails}
      />
    </div>
  );
};

export default Dashboard; 