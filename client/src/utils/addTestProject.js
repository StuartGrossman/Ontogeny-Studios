// Simple debugging utility
console.log('🔧 Debug utilities loaded');

// Make debug functions available globally
window.debugActiveProjects = () => {
  console.log('🎯 Debugging Active Projects...');
  console.log('Check the debug panel in the top-right corner for current state');
  
  // Log current authentication state
  const auth = window.firebase?.auth();
  if (auth) {
    console.log('🔐 Auth state:', auth.currentUser ? 'Logged in' : 'Not logged in');
    if (auth.currentUser) {
      console.log('👤 Current user:', {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName
      });
    }
  }
}; 