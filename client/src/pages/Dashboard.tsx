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
import TestPaymentHelper from '../components/TestPaymentHelper';

import RequestsModal from '../components/RequestsModal';
import RequestedProjectsModal from '../components/RequestedProjectsModal';
import UIDesignModal from '../components/UIDesignModal';
import { modalEvents } from '../utils/modalEvents';



// Styles
import '../styles/dashboard/index.css';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Custom hooks
  const dashboardData = useDashboardData(currentUser);
  const modals = useProjectModals();

  const [isMobile, setIsMobile] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showRequestedProjectsModal, setShowRequestedProjectsModal] = useState(false);
  const [showUIDesignModal, setShowUIDesignModal] = useState(false);

  // Check authentication and mobile state
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Handle payment success/cancel from Stripe Checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      // Payment was successful, update subscription status
      console.log('Payment successful, session ID:', sessionId);
      
      // You can add logic here to update the subscription status
      // For now, we'll just show a success message
      alert('Payment successful! Your subscription has been activated.');
      
      // Clean up the URL
      window.history.replaceState({}, document.title, '/dashboard');
    } else if (paymentStatus === 'cancelled') {
      console.log('Payment was cancelled');
      alert('Payment was cancelled. You can try again anytime.');
      
      // Clean up the URL
      window.history.replaceState({}, document.title, '/dashboard');
    }
  }, []);

  // Check mobile state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Subscribe to modal events
  useEffect(() => {
    const unsubscribeRequests = modalEvents.subscribe('requests', () => {
      setShowRequestsModal(true);
    });
    
    const unsubscribeRequestedProjects = modalEvents.subscribe('requestedProjects', () => {
      setShowRequestedProjectsModal(true);
    });

    const unsubscribeUIDesign = modalEvents.subscribe('uiDesign', () => {
      setShowUIDesignModal(true);
    });

    return () => {
      unsubscribeRequests();
      unsubscribeRequestedProjects();
      unsubscribeUIDesign();
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

  // Show simple loading state
  if (dashboardData.loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <UserDashboard
        customerProjects={dashboardData.customerProjects}
        requestedProjects={dashboardData.requestedProjects}
        customerProjectsLoading={dashboardData.customerProjectsLoading}
        requestedProjectsLoading={dashboardData.requestedProjectsLoading}
        onOpenAIChat={modals.openAIChat}
        onOpenCustomerProject={handleOpenCustomerProject}
        onFeatureRequest={handleFeatureRequest}
        onOpenRequestsModal={() => setShowRequestsModal(true)}
        onOpenRequestedProjectsModal={() => setShowRequestedProjectsModal(true)}
      />

      {/* Test Payment Helper - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <TestPaymentHelper />
      )}

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

      <RequestsModal
        isOpen={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        currentUser={currentUser}
      />

      <RequestedProjectsModal
        isOpen={showRequestedProjectsModal}
        onClose={() => setShowRequestedProjectsModal(false)}
        requestedProjects={dashboardData.requestedProjects}
        requestedProjectsLoading={dashboardData.requestedProjectsLoading}
      />

      <UIDesignModal
        isOpen={showUIDesignModal}
        onClose={() => setShowUIDesignModal(false)}
        currentUser={currentUser}
      />


    </>
  );
};

export default Dashboard; 