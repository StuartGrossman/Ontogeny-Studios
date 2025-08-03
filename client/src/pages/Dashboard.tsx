import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, addDoc, collection, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Custom hooks
import { useDashboardData } from '../hooks/useDashboardData';
import { useProjectModals } from '../hooks/useProjectModals';

// Components
import UserDashboard from '../components/UserDashboard';
import AIChatModal from '../components/AIChatModal';
import { ProjectDetailsModal, MeetingSchedulerModal, FeatureRequestModal, FeatureAssignmentModal } from '../components/modals';
import SimpleFeatureRequestModal from '../components/modals/SimpleFeatureRequestModal';


import RequestsModal from '../components/RequestsModal';
import RequestedProjectsModal from '../components/RequestedProjectsModal';
import UIDesignModal from '../components/UIDesignModal';
import PaymentSuccessModal from '../components/PaymentSuccessModal';
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
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState<string>('');

  // Check authentication and mobile state
  useEffect(() => {
    console.log('🔍 Dashboard mounted, checking authentication...');
    console.log('👤 Current user:', currentUser);
    console.log('📍 Current URL:', window.location.href);
    
    if (!currentUser) {
      console.log('❌ No current user, redirecting to home');
      navigate('/');
    } else {
      console.log('✅ User authenticated, staying on dashboard');
    }
  }, [currentUser, navigate]);

  // Handle payment success/cancel from Stripe Checkout
  useEffect(() => {
    const handlePaymentStatus = async () => {
      console.log('🔍 Checking payment status from URL...');
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const sessionId = urlParams.get('session_id');

      console.log('📊 URL Parameters:', {
        paymentStatus,
        sessionId,
        fullUrl: window.location.href
      });

      if (paymentStatus === 'success' && sessionId) {
        // Payment was successful, update subscription status
        console.log('✅ Payment successful, session ID:', sessionId);
        
        try {
          // Update subscription status in database
          await updateSubscriptionStatus(sessionId);
          
          // Show success modal
          setPaymentSessionId(sessionId);
          setShowPaymentSuccessModal(true);
          
          // Dispatch a custom event to notify components about subscription update
          window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
            detail: { sessionId, projectId: 'all' } 
          }));
          
          // Also dispatch a payment success event
          window.dispatchEvent(new CustomEvent('paymentSuccess', { 
            detail: { sessionId, projectId: 'all' } 
          }));
          
          console.log('✅ Payment processing completed successfully');
        } catch (error) {
          console.error('❌ Error processing payment:', error);
        }
        
        // Clean up the URL
        window.history.replaceState({}, document.title, '/dashboard');
      } else if (paymentStatus === 'cancelled') {
        console.log('❌ Payment was cancelled');
        alert('Payment was cancelled. You can try again anytime.');
        
        // Clean up the URL
        window.history.replaceState({}, document.title, '/dashboard');
      } else {
        console.log('ℹ️ No payment status found in URL');
      }
    };

    handlePaymentStatus();
  }, []);

  // Update subscription status in database
  const updateSubscriptionStatus = async (sessionId: string) => {
    try {
      console.log('🔄 Updating subscription status for session:', sessionId);
      
      if (!currentUser?.uid) {
        console.error('❌ No current user found');
        return;
      }

      console.log('👤 Current user:', currentUser.uid);

      // First, verify the session with Stripe
      let sessionData = null;
      try {
        console.log('🔍 Verifying session with Stripe...');
        const verifyResponse = await fetch(`http://localhost:3002/api/payments/verify-session/${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (verifyResponse.ok) {
          sessionData = await verifyResponse.json();
          console.log('✅ Session verified with Stripe:', sessionData);
        } else {
          console.warn('⚠️ Could not verify session with Stripe, continuing anyway...');
        }
      } catch (verifyError) {
        console.warn('⚠️ Session verification failed, continuing anyway:', verifyError);
      }

      // Create or update the subscription status in Firestore
      const subscriptionRef = doc(db, 'subscriptions', sessionId);
      
      // Get the projectId from the session metadata or URL
      const projectId = sessionData?.metadata?.projectId || 
                       new URLSearchParams(window.location.search).get('projectId') || 
                       'unknown';
      
      const subscriptionData = {
        status: 'active',
        updatedAt: new Date(),
        sessionId: sessionId,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        projectId: projectId, // Add projectId to the subscription data
        createdAt: new Date()
      };

      console.log('📝 Writing subscription data with projectId:', projectId);

      console.log('📝 Writing subscription data:', subscriptionData);
      
      await setDoc(subscriptionRef, subscriptionData, { merge: true });

      console.log('✅ Subscription status updated to active');
      
      // Trigger a refresh of subscription data
      // The component will reload subscription data on next render
      
    } catch (error) {
      console.error('❌ Error updating subscription status:', error);
      
      // Log specific error details for debugging
      if (error.code === 'permission-denied') {
        console.error('❌ Permission denied - check Firestore rules');
      }
    }
  };

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

      <PaymentSuccessModal
        isOpen={showPaymentSuccessModal}
        onClose={() => setShowPaymentSuccessModal(false)}
        sessionId={paymentSessionId}
      />


    </>
  );
};

export default Dashboard; 