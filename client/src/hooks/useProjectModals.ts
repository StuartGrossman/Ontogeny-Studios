import { useState } from 'react';

interface ModalStates {
  aiChatOpen: boolean;
  createProjectModalOpen: boolean;
  editProjectModalOpen: boolean;
  showUserRequestedModal: boolean;
  projectDetailsModalOpen: boolean;
  meetingSchedulerModalOpen: boolean;
  featureRequestModalOpen: boolean;
  featureAssignmentModalOpen: boolean;
}

interface ModalData {
  selectedProjectForEdit: any;
  selectedUserProject: any;
  selectedProjectForFeature: any;
  conversationData: any;
  projectDetails: any;
  featureConversationData: any;
  featureRequestData: any;
}

export const useProjectModals = () => {
  // Modal states
  const [modalStates, setModalStates] = useState<ModalStates>({
    aiChatOpen: false,
    createProjectModalOpen: false,
    editProjectModalOpen: false,
    showUserRequestedModal: false,
    projectDetailsModalOpen: false,
    meetingSchedulerModalOpen: false,
    featureRequestModalOpen: false,
    featureAssignmentModalOpen: false,
  });

  // Modal data
  const [modalData, setModalData] = useState<ModalData>({
    selectedProjectForEdit: null,
    selectedUserProject: null,
    selectedProjectForFeature: null,
    conversationData: null,
    projectDetails: null,
    featureConversationData: null,
    featureRequestData: null,
  });

  // Helper function to update modal state
  const updateModalState = (modalName: keyof ModalStates, isOpen: boolean) => {
    setModalStates(prev => ({
      ...prev,
      [modalName]: isOpen
    }));
  };

  // Helper function to update modal data
  const updateModalData = (dataName: keyof ModalData, data: any) => {
    setModalData(prev => ({
      ...prev,
      [dataName]: data
    }));
  };

  // Modal actions
  const openAIChat = (project?: any) => {
    if (project) {
      updateModalData('selectedProjectForFeature', project);
    }
    updateModalState('aiChatOpen', true);
  };

  const closeAIChat = () => {
    updateModalState('aiChatOpen', false);
    updateModalData('selectedProjectForFeature', null);
  };

  const openCreateProjectModal = () => {
    updateModalState('createProjectModalOpen', true);
  };

  const closeCreateProjectModal = () => {
    updateModalState('createProjectModalOpen', false);
  };

  const openEditProjectModal = (project: any) => {
    updateModalData('selectedProjectForEdit', project);
    updateModalState('editProjectModalOpen', true);
  };

  const closeEditProjectModal = () => {
    updateModalState('editProjectModalOpen', false);
    updateModalData('selectedProjectForEdit', null);
  };

  const openUserRequestedModal = (project: any) => {
    // Validate project data before opening modal
    if (!project || !project.id) {
      console.error('Cannot open modal: Invalid project data', project);
      return;
    }
    
    console.log('Opening UserRequestedProjectModal with project:', {
      id: project.id,
      name: project.projectName || project.name,
      status: project.status,
      type: project.type
    });
    
    updateModalData('selectedUserProject', project);
    updateModalState('showUserRequestedModal', true);
  };

  const closeUserRequestedModal = () => {
    updateModalState('showUserRequestedModal', false);
    updateModalData('selectedUserProject', null);
  };

  const openProjectDetailsModal = (conversationData: any) => {
    updateModalData('conversationData', conversationData);
    updateModalState('projectDetailsModalOpen', true);
  };

  const closeProjectDetailsModal = () => {
    updateModalState('projectDetailsModalOpen', false);
    updateModalData('conversationData', null);
  };

  const openMeetingSchedulerModal = (projectDetails: any) => {
    updateModalData('projectDetails', projectDetails);
    updateModalState('meetingSchedulerModalOpen', true);
  };

  const closeMeetingSchedulerModal = () => {
    updateModalState('meetingSchedulerModalOpen', false);
    updateModalData('projectDetails', null);
  };

  const openFeatureRequestModal = (conversationData: any) => {
    updateModalData('featureConversationData', conversationData);
    updateModalState('featureRequestModalOpen', true);
  };

  const closeFeatureRequestModal = () => {
    updateModalState('featureRequestModalOpen', false);
    updateModalData('featureConversationData', null);
  };

  const openFeatureAssignmentModal = (featureData: any) => {
    updateModalData('featureRequestData', featureData);
    updateModalState('featureAssignmentModalOpen', true);
  };

  const closeFeatureAssignmentModal = () => {
    updateModalState('featureAssignmentModalOpen', false);
    updateModalData('featureRequestData', null);
  };

  // Workflow handlers
  const handleAIConsultationNextStep = (conversationData: any) => {
    closeAIChat();
    openProjectDetailsModal(conversationData);
  };

  const handleProjectDetailsNextStep = (projectDetails: any) => {
    closeProjectDetailsModal();
    openMeetingSchedulerModal(projectDetails);
  };

  const handleFeatureConsultationNextStep = (conversationData: any) => {
    closeAIChat();
    openFeatureRequestModal(conversationData);
  };

  const handleFeatureDetailsNextStep = (featureData: any) => {
    closeFeatureRequestModal();
    openFeatureAssignmentModal(featureData);
  };

  const handleCloseProjectWorkflow = () => {
    // Close all project-related modals
    updateModalState('aiChatOpen', false);
    updateModalState('projectDetailsModalOpen', false);
    updateModalState('meetingSchedulerModalOpen', false);
    
    // Clear project-related data
    updateModalData('conversationData', null);
    updateModalData('projectDetails', null);
    updateModalData('selectedProjectForFeature', null);
  };

  const handleCloseFeatureWorkflow = () => {
    // Close all feature-related modals
    updateModalState('aiChatOpen', false);
    updateModalState('featureRequestModalOpen', false);
    updateModalState('featureAssignmentModalOpen', false);
    
    // Clear feature-related data
    updateModalData('selectedProjectForFeature', null);
    updateModalData('featureConversationData', null);
    updateModalData('featureRequestData', null);
  };

  return {
    // Modal states
    ...modalStates,
    
    // Modal data
    ...modalData,
    
    // Modal actions
    openAIChat,
    closeAIChat,
    openCreateProjectModal,
    closeCreateProjectModal,
    openEditProjectModal,
    closeEditProjectModal,
    openUserRequestedModal,
    closeUserRequestedModal,
    openProjectDetailsModal,
    closeProjectDetailsModal,
    openMeetingSchedulerModal,
    closeMeetingSchedulerModal,
    openFeatureRequestModal,
    closeFeatureRequestModal,
    openFeatureAssignmentModal,
    closeFeatureAssignmentModal,
    
    // Workflow handlers
    handleAIConsultationNextStep,
    handleProjectDetailsNextStep,
    handleFeatureConsultationNextStep,
    handleFeatureDetailsNextStep,
    handleCloseProjectWorkflow,
    handleCloseFeatureWorkflow,
  };
}; 