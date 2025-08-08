// Global modal event system
type ModalType = 'requests' | 'requestedProjects' | 'uiDesign' | 'newProjectRequest';

let modalEventListeners: { [key in ModalType]?: (() => void)[] } = {};

export const modalEvents = {
  // Subscribe to modal events
  subscribe: (modalType: ModalType, callback: () => void) => {
    if (!modalEventListeners[modalType]) {
      modalEventListeners[modalType] = [];
    }
    modalEventListeners[modalType]!.push(callback);
    
    // Return unsubscribe function
    return () => {
      if (modalEventListeners[modalType]) {
        modalEventListeners[modalType] = modalEventListeners[modalType]!.filter(cb => cb !== callback);
      }
    };
  },
  
  // Trigger modal open event
  openModal: (modalType: ModalType) => {
    if (modalEventListeners[modalType]) {
      modalEventListeners[modalType]!.forEach(callback => callback());
    }
  },
  
  // Clear all listeners (useful for cleanup)
  clearAll: () => {
    modalEventListeners = {};
  }
}; 