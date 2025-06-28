import React, { useState, useEffect } from 'react';
import { X, User, Shield, Phone, Check, AlertCircle, Loader, Key, Lock, Smartphone } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  multiFactor, 
  PhoneAuthProvider, 
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { db, auth } from '../firebase';
import '../styles/Settings.css';

interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

interface PhoneVerificationStep {
  step: number;
  status: 'pending' | 'active' | 'completed' | 'error';
  title: string;
  description: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isOpen, onClose, currentUser }) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'two-factor' | 'secondary-password'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Security state
  const [hasSecondaryPassword, setHasSecondaryPassword] = useState(false);
  const [showPasswordChangeFlow, setShowPasswordChangeFlow] = useState(false);
  const [newSecondaryPassword, setNewSecondaryPassword] = useState('');
  const [confirmSecondaryPassword, setConfirmSecondaryPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Phone verification state  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [phoneVerificationSteps, setPhoneVerificationSteps] = useState<PhoneVerificationStep[]>([
    { step: 1, status: 'active', title: 'Enter Phone Number', description: 'Add your phone number for 2FA' },
    { step: 2, status: 'pending', title: 'Verify Phone', description: 'Enter the SMS verification code' },
    { step: 3, status: 'pending', title: '2FA Enabled', description: 'Phone verification is now active' }
  ]);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneVerificationLoading, setPhoneVerificationLoading] = useState(false);
  const [twoFactorAction, setTwoFactorAction] = useState<'setup' | 'change-password' | null>(null);
  
  // Re-authentication state
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthLoading, setReauthLoading] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState('');
  const [showRetryButton, setShowRetryButton] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadUserData();
      checkMultiFactorStatus();
      initializeRecaptcha();
    }
    
    return () => {
      // Cleanup function
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
          console.log('Cleaned up reCAPTCHA verifier on component cleanup');
        } catch (error) {
          console.warn('Error clearing reCAPTCHA on cleanup:', error);
        }
        setRecaptchaVerifier(null);
      }
    };
  }, [isOpen, currentUser]);

  // Additional cleanup when modal closes
  useEffect(() => {
    if (!isOpen && recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
        console.log('Cleaned up reCAPTCHA verifier on modal close');
      } catch (error) {
        console.warn('Error clearing reCAPTCHA on modal close:', error);
      }
      setRecaptchaVerifier(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (showReauthModal) {
      console.log('Re-authentication modal is now showing');
    }
  }, [showReauthModal]);

  const initializeRecaptcha = async () => {
    try {
      // Clear any existing verifier first - but more safely
      if (recaptchaVerifier) {
        try {
          // Try to clear - if it fails, the verifier was already destroyed
          recaptchaVerifier.clear();
          console.log('Successfully cleared existing reCAPTCHA verifier');
        } catch (clearError) {
          console.warn('reCAPTCHA verifier was already destroyed or invalid:', clearError);
        }
        setRecaptchaVerifier(null);
      }

      if (auth.currentUser) {
        console.log('Initializing reCAPTCHA verifier with render()');
        
        // Wait longer to ensure everything is cleaned up
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Ensure the container exists and is completely clean
        const container = document.getElementById('recaptcha-container');
        if (container) {
          container.innerHTML = '';
          // Force DOM reflow
          container.offsetHeight;
        }
        
        console.log('Creating new reCAPTCHA verifier...');
        
        // Create fresh verifier
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired, will reinitialize on next use...');
          },
          'error-callback': (error: any) => {
            console.error('reCAPTCHA error:', error);
            setError('reCAPTCHA verification failed. Please try again.');
          }
        });
        
        // Immediately render the verifier to ensure it's fully ready
        try {
          console.log('Rendering reCAPTCHA verifier...');
          const widgetId = await verifier.render();
          console.log('reCAPTCHA verifier rendered successfully with widget ID:', widgetId);
        } catch (renderError) {
          console.error('Failed to render reCAPTCHA:', renderError);
          throw renderError;
        }
        
        setRecaptchaVerifier(verifier);
        console.log('reCAPTCHA verifier initialized and rendered successfully');
        
        // Wait longer to ensure verifier is completely stable
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('reCAPTCHA verifier ready for use');
      }
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
      setError('Failed to initialize security verification. Please refresh the page.');
      setRecaptchaVerifier(null);
    }
  };

  const checkMultiFactorStatus = async () => {
    try {
      if (auth.currentUser) {
        console.log('Checking multi-factor status for user:', auth.currentUser.uid);
        console.log('Firebase project ID:', auth.app.options.projectId);
        console.log('Auth domain:', auth.app.options.authDomain);
        console.log('Current URL:', window.location.origin);
        console.log('Environment: localhost =', window.location.hostname === 'localhost');
        
        const multiFactorUser = multiFactor(auth.currentUser);
        const enrolledFactors = multiFactorUser.enrolledFactors;
        console.log('Enrolled MFA factors:', enrolledFactors);
        
        const hasPhoneAuth = enrolledFactors.some(factor => factor.factorId === 'phone');
        
        setIsPhoneVerified(hasPhoneAuth);
        
        if (hasPhoneAuth) {
          setPhoneVerificationSteps(prev => prev.map(step => ({
            ...step,
            status: 'completed'
          })));
        }
      }
    } catch (error) {
      console.error('Error checking multi-factor status:', error);
      console.error('This might indicate MFA is not enabled in Firebase Console');
    }
  };

  const loadUserData = async () => {
    try {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setHasSecondaryPassword(!!userData.secondaryPassword);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    }
  };

  const handleReauthentication = async () => {
    if (!currentUser) {
      setError('No user logged in');
      return;
    }

    setReauthLoading(true);
    setError('');

    try {
      console.log('Starting re-authentication process');
      
      // Check the sign-in method used by the user
      const providerData = currentUser.providerData;
      const isGoogleUser = providerData.some((provider: any) => provider.providerId === 'google.com');
      
      console.log('User provider data:', providerData);
      console.log('Is Google user:', isGoogleUser);

      if (isGoogleUser) {
        // Re-authenticate with Google
        console.log('Re-authenticating with Google');
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(currentUser, provider);
      } else {
        // Re-authenticate with email/password
        if (!reauthPassword.trim()) {
          setError('Please enter your password');
          return;
        }
        
        console.log('Re-authenticating with email/password');
        const credential = EmailAuthProvider.credential(currentUser.email, reauthPassword);
        await reauthenticateWithCredential(currentUser, credential);
      }

      console.log('Re-authentication successful');
      setShowReauthModal(false);
      setReauthPassword('');
      setSuccess('Authentication successful! Please wait while we prepare for phone verification...');
      
      // Wait longer for the authentication to fully process and propagate
      console.log('Waiting for authentication to propagate...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Force a token refresh to ensure the session is fully updated
      try {
        console.log('Refreshing user token...');
        await auth.currentUser?.getIdToken(true); // Force refresh
        console.log('Token refreshed successfully');
      } catch (tokenError) {
        console.error('Token refresh error:', tokenError);
      }
      
      // Wait a bit more after token refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Re-initialize reCAPTCHA after re-authentication
      console.log('Re-initializing reCAPTCHA after re-authentication...');
      await initializeRecaptcha();
      
      // Wait for reCAPTCHA initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Proceed with phone verification using the pending phone number
      if (pendingPhoneNumber) {
        console.log('Proceeding with phone verification for:', pendingPhoneNumber);
        setSuccess('Starting phone verification...');
        
        try {
          await performPhoneVerification(pendingPhoneNumber);
          setPendingPhoneNumber('');
        } catch (phoneError: any) {
          console.error('Phone verification failed after re-auth:', phoneError);
          if (phoneError.code === 'auth/internal-error') {
            setError('Authentication system is still synchronizing. Please wait a moment and try again.');
            // Keep the pending phone number for manual retry
          } else {
            setPendingPhoneNumber('');
            throw phoneError; // Re-throw other errors
          }
        }
      }
    } catch (error: any) {
      console.error('Re-authentication error:', error);
      
      if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('Authentication cancelled. Please try again.');
      } else {
        setError(error.message || 'Failed to authenticate. Please try again.');
      }
    } finally {
      setReauthLoading(false);
    }
  };

  // Phone number formatting utility
  const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it's 10 digits and doesn't start with 1, assume US number
    if (cleaned.length === 10 && !cleaned.startsWith('1')) {
      return `+1${cleaned}`;
    }
    
    // If it's 11 digits and starts with 1, format as US number
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    // If it already starts with +, return as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    // For other cases, add + if not present
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  };

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    const formatted = formatPhoneNumber(phoneNumber);
    // Basic E.164 validation: starts with +, followed by 1-15 digits
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(formatted);
  };

  const performPhoneVerification = async (phoneNumberToVerify: string) => {
    if (!auth.currentUser) {
      setError('Authentication system not ready');
      return;
    }
    
    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(phoneNumberToVerify);
    
    if (!validatePhoneNumber(phoneNumberToVerify)) {
      setError('Please enter a valid phone number (e.g., +1 415 999 4541 or 4159994541)');
      return;
    }
    
    console.log('Original phone:', phoneNumberToVerify);
    console.log('Formatted phone:', formattedPhone);
    
    setPhoneVerificationLoading(true);
    setError('');
    
    try {
            // ALWAYS create fresh verifier to avoid lifecycle issues (especially in development)
      console.log('Creating fresh reCAPTCHA verifier for phone verification...');
      
      // Clear any existing verifier
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
          console.log('Cleared existing verifier before creating fresh one');
        } catch (clearError) {
          console.warn('Error clearing existing verifier:', clearError);
        }
        setRecaptchaVerifier(null);
      }
      
      // Wait for complete cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Initialize fresh verifier
      await initializeRecaptcha();
      
      // Wait longer for the fresh verifier to be completely ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!recaptchaVerifier) {
        throw new Error('Failed to initialize fresh reCAPTCHA verifier. Please refresh the page and try again.');
      }
      
      console.log('Fresh reCAPTCHA verifier is ready, proceeding with phone verification...');

      // Get a fresh multi-factor session
      const multiFactorUser = multiFactor(auth.currentUser);
      let session;
      
      try {
        session = await multiFactorUser.getSession();
        console.log('Multi-factor session obtained successfully');
      } catch (sessionError: any) {
        console.error('Failed to get multi-factor session:', sessionError);
        throw new Error('Failed to create secure session. Please refresh the page and try again.');
      }
      
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      console.log('Attempting phone verification with session...');
      
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        {
          phoneNumber: formattedPhone,
          session: session
        },
        recaptchaVerifier
      );
      
      setVerificationId(verificationId);
      setPhoneVerificationSteps(prev => prev.map(step => ({
        ...step,
        status: step.step === 1 ? 'completed' : step.step === 2 ? 'active' : 'pending'
      })));
      
      setSuccess(`Verification code sent to ${formattedPhone}`);
    } catch (error: any) {
      console.error('Phone verification error:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        console.log('Triggering re-authentication modal');
        console.log('Authentication state:', {
          currentUser: !!auth.currentUser,
          lastSignInTime: auth.currentUser?.metadata?.lastSignInTime,
          creationTime: auth.currentUser?.metadata?.creationTime
        });
        setError('For security, you need to sign in again before setting up 2FA.');
        setPendingPhoneNumber(formattedPhone);
        setShowReauthModal(true);
        setSuccess('');
      } else if (error.code === 'auth/invalid-phone-number') {
        setError('Please enter a valid phone number. US numbers can be entered as (415) 999-4541 or 4159994541');
      } else if (error.code === 'auth/quota-exceeded') {
        setError('SMS quota exceeded. Please try again later.');
      } else if (error.code === 'auth/invalid-app-credential') {
        setError('Multi-Factor Authentication is not enabled in Firebase Console. Please enable MFA and Phone authentication in your Firebase project settings.');
        console.error('MFA Configuration Error: Please check Firebase Console settings');
        console.error('Required steps: 1) Enable Multi-Factor Auth, 2) Enable Phone Authentication');
        // Reinitialize reCAPTCHA on this error
        initializeRecaptcha();
      } else if (error.code === 'auth/captcha-check-failed') {
        setError('Security verification failed. Please refresh the page and try again.');
        initializeRecaptcha();
      } else if (error.code === 'auth/internal-error') {
        console.error('Firebase internal error details:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        console.error('Error stack:', error.stack);
        console.error('Current user state:', {
          uid: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          emailVerified: auth.currentUser?.emailVerified,
          phoneNumber: auth.currentUser?.phoneNumber,
          lastSignInTime: auth.currentUser?.metadata?.lastSignInTime
        });
        
        setError('Firebase internal error detected. This usually indicates a project configuration issue. Please check the console for details and try the suggestions below.');
        setShowRetryButton(true);
      } else {
        setError(error.message || 'Failed to send verification code');
      }
    } finally {
      setPhoneVerificationLoading(false);
    }
  };

  const sendPhoneVerification = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }
    
    setShowRetryButton(false); // Clear retry button when starting new verification
    await performPhoneVerification(phoneNumber);
  };

  const retryPhoneVerification = async () => {
    setShowRetryButton(false);
    setError('');
    setSuccess('Retrying phone verification...');
    
    console.log('Retrying phone verification after internal error...');
    
    // Wait a moment before retry
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Force token refresh before retry
    try {
      await auth.currentUser?.getIdToken(true);
      console.log('Token refreshed before retry');
    } catch (tokenError) {
      console.error('Token refresh error on retry:', tokenError);
    }
    
    // Force complete reCAPTCHA cleanup and re-initialization (same as main flow)
    console.log('Retry: Clearing existing verifier and creating fresh one...');
    
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
        console.log('Retry: Cleared existing verifier');
      } catch (clearError) {
        console.warn('Retry: Error clearing reCAPTCHA:', clearError);
      }
      setRecaptchaVerifier(null);
    }
    
    // Clean the container thoroughly
    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.innerHTML = '';
      container.offsetHeight; // Force DOM reflow
    }
    
    // Wait for complete cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Re-initialize reCAPTCHA with same approach as main flow
    await initializeRecaptcha();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Retry: Fresh reCAPTCHA verifier ready');
    
    // Retry with pending phone number or current phone number
    const phoneToVerify = pendingPhoneNumber || phoneNumber;
    if (phoneToVerify) {
      await performPhoneVerification(phoneToVerify);
    } else {
      setError('No phone number to retry. Please enter your phone number again.');
    }
  };

  const verifyPhoneCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }
    
    if (!verificationId || !auth.currentUser) {
      setError('Verification session expired');
      return;
    }
    
    setPhoneVerificationLoading(true);
    setError('');
    
    try {
      const phoneCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneCredential);
      const multiFactorUser = multiFactor(auth.currentUser);
      
      await multiFactorUser.enroll(multiFactorAssertion, `Phone: ${phoneNumber}`);
      
      setIsPhoneVerified(true);
      setPhoneVerificationSteps(prev => prev.map(step => ({
        ...step,
        status: 'completed'
      })));
      
      if (twoFactorAction === 'change-password') {
        setShowPasswordChangeFlow(true);
        setSuccess('2FA verified! You can now set your secondary password.');
      } else {
        setSuccess('Phone verification enabled successfully');
      }
      
      setVerificationCode('');
    } catch (error: any) {
      console.error('Code verification error:', error);
      setError(error.message || 'Invalid verification code');
    } finally {
      setPhoneVerificationLoading(false);
    }
  };

  const disablePhoneVerification = async () => {
    if (!auth.currentUser) return;
    
    setPhoneVerificationLoading(true);
    setError('');
    
    try {
      const multiFactorUser = multiFactor(auth.currentUser);
      const enrolledFactors = multiFactorUser.enrolledFactors;
      const phoneFactors = enrolledFactors.filter(factor => factor.factorId === 'phone');
      
      for (const factor of phoneFactors) {
        await multiFactorUser.unenroll(factor);
      }
      
      setIsPhoneVerified(false);
      setPhoneNumber('');
      setVerificationCode('');
      setVerificationId('');
      setPhoneVerificationSteps(prev => prev.map(step => ({
        ...step,
        status: step.step === 1 ? 'active' : 'pending'
      })));
      
      setSuccess('Phone verification disabled');
    } catch (error: any) {
      console.error('Disable phone verification error:', error);
      if (error.code === 'auth/requires-recent-login') {
        setError('For security, you need to sign in again before disabling 2FA.');
        setShowReauthModal(true);
      } else {
        setError(error.message || 'Failed to disable phone verification');
      }
    } finally {
      setPhoneVerificationLoading(false);
    }
  };

  const updateSecondaryPassword = async () => {
    if (!currentUser) return;
    
    if (newSecondaryPassword !== confirmSecondaryPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newSecondaryPassword.length < 6) {
      setError('Secondary password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        secondaryPassword: newSecondaryPassword
      });
      
      setHasSecondaryPassword(true);
      setNewSecondaryPassword('');
      setConfirmSecondaryPassword('');
      setShowPasswordChangeFlow(false);
      setTwoFactorAction(null);
      setSuccess('Secondary password updated successfully');
    } catch (error: any) {
      setError(error.message || 'Failed to update secondary password');
    } finally {
      setLoading(false);
    }
  };

  const handleSecondaryPasswordRequest = () => {
    if (!isPhoneVerified) {
      setError('You must enable Two-Factor Authentication first to set a secondary password.');
      setActiveSection('two-factor');
      setTwoFactorAction('change-password');
      return;
    }
    
    // If 2FA is enabled, start the 2FA verification process for password change
    setTwoFactorAction('change-password');
    setError('');
    setSuccess('Please verify your identity with 2FA to change your secondary password.');
    
    // Reset verification state for password change flow
    setVerificationCode('');
    setVerificationId('');
    setPhoneVerificationSteps(prev => prev.map(step => ({
      ...step,
      status: step.step === 1 ? 'completed' : step.step === 2 ? 'active' : 'pending'
    })));
  };

  const resetMessages = () => {
    setError('');
    setSuccess('');
    setShowRetryButton(false);
  };

  const resetPasswordFlow = () => {
    setShowPasswordChangeFlow(false);
    setTwoFactorAction(null);
    setNewSecondaryPassword('');
    setConfirmSecondaryPassword('');
    setVerificationCode('');
    setVerificationId('');
  };

  const closeReauthModal = () => {
    setShowReauthModal(false);
    setReauthPassword('');
    setPendingPhoneNumber('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-modal-enhanced">
        <div className="settings-header">
          <h2>Account Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-sidebar">
            <button 
              className={`sidebar-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('profile');
                resetMessages();
                resetPasswordFlow();
              }}
            >
              <User size={18} />
              Profile
            </button>
            <button 
              className={`sidebar-item ${activeSection === 'two-factor' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('two-factor');
                resetMessages();
                resetPasswordFlow();
              }}
            >
              <Smartphone size={18} />
              Two-Factor Auth
            </button>
            <button 
              className={`sidebar-item ${activeSection === 'secondary-password' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('secondary-password');
                resetMessages();
                resetPasswordFlow();
              }}
            >
              <Lock size={18} />
              Secondary Password
            </button>
          </div>

          <div className="settings-main">
            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            {showRetryButton && (
              <div className="retry-section">
                <div className="troubleshooting-guide">
                  <h4>🔧 Troubleshooting Firebase Internal Error</h4>
                  <div className="troubleshooting-steps">
                    <div className="step">
                      <strong>1. Check Firebase Console Configuration:</strong>
                      <ul>
                        <li>✅ Multi-Factor Auth is enabled</li>
                        <li>✅ Phone provider is enabled</li>
                        <li>✅ Authorized domains include localhost</li>
                      </ul>
                    </div>
                    <div className="step">
                      <strong>2. Verify Project Settings:</strong>
                      <ul>
                        <li>📱 SMS usage quota not exceeded</li>
                        <li>💳 Firebase project has active billing (for production)</li>
                        <li>🌍 No regional restrictions on SMS</li>
                      </ul>
                    </div>
                                         <div className="step">
                       <strong>3. Quick Fixes to Try:</strong>
                       <ul>
                         <li>🔄 Refresh this page completely</li>
                         <li>⏱️ Wait 5-10 minutes for Firebase changes to propagate</li>
                         <li>🚪 Sign out and sign back in</li>
                         <li>💻 Try in incognito/private browsing mode</li>
                         <li>🌐 Test with different browser if on localhost</li>
                       </ul>
                     </div>
                  </div>
                </div>
                <div className="retry-buttons">
                  <button
                    className="action-btn secondary"
                    onClick={retryPhoneVerification}
                    disabled={phoneVerificationLoading}
                  >
                    {phoneVerificationLoading ? <Loader size={16} className="spinning" /> : <Phone size={16} />}
                    Retry Phone Verification
                  </button>
                  <button
                    className="action-btn secondary"
                    onClick={() => window.location.reload()}
                  >
                    🔄 Refresh Page
                  </button>
                </div>
              </div>
            )}
            
            {success && (
              <div className="success-message">
                <Check size={16} />
                {success}
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="settings-section">
                <h3>Profile Information</h3>
                <p>View your account information. Contact support to make changes.</p>

                <div className="profile-info-card">
                  <div className="profile-field">
                    <label>Display Name</label>
                    <div className="read-only-field">
                      <User size={16} />
                      <span>{currentUser?.displayName || 'Not set'}</span>
                    </div>
                  </div>

                  <div className="profile-field">
                    <label>Email Address</label>
                    <div className="read-only-field">
                      <span>📧</span>
                      <span>{currentUser?.email || 'Not set'}</span>
                    </div>
                  </div>

                  <div className="profile-field">
                    <label>Account Created</label>
                    <div className="read-only-field">
                      <span>📅</span>
                      <span>{currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-notice">
                  <div className="notice-content">
                    <AlertCircle size={20} />
                    <div>
                      <h4>Need to update your information?</h4>
                      <p>Contact our support team to make changes to your profile information.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'two-factor' && (
              <div className="settings-section">
                <h3>Two-Factor Authentication</h3>
                <p>Secure your account with SMS verification using your phone number.</p>

                <div className="security-info">
                  <div className="info-card">
                    <div className="info-icon">
                      <Phone size={24} />
                    </div>
                    <div className="info-content">
                      <h4>SMS Verification</h4>
                      <p>Receive verification codes via text message for enhanced security.</p>
                    </div>
                    <div className="info-status">
                      <span className={`status-badge ${isPhoneVerified ? 'configured' : 'not-configured'}`}>
                        {isPhoneVerified ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                {!isPhoneVerified ? (
                  <div className="verification-steps">
                    {phoneVerificationSteps.map((step) => (
                      <div key={step.step} className={`verification-step ${step.status}`}>
                        <div className={`step-icon ${step.status}`}>
                          {step.status === 'completed' ? <Check size={16} /> : step.step}
                        </div>
                        <div className="step-content">
                          <h4>{step.title}</h4>
                          <p>{step.description}</p>
                          
                          {step.step === 1 && step.status === 'active' && (
                            <div className="phone-input-group">
                              <div className="phone-input-instructions">
                                <p>Enter your phone number in any of these formats:</p>
                                <ul>
                                  <li>+1 (415) 999-4541</li>
                                  <li>+14159994541</li>
                                  <li>4159994541 (US numbers)</li>
                                  <li>(415) 999-4541</li>
                                </ul>
                              </div>
                              <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter phone number: +1 (415) 999-4541 or 4159994541"
                                className="form-input-enhanced"
                                disabled={phoneVerificationLoading}
                              />
                              <button
                                className="action-btn primary"
                                onClick={sendPhoneVerification}
                                disabled={phoneVerificationLoading || !phoneNumber.trim()}
                              >
                                {phoneVerificationLoading ? <Loader size={16} className="spinning" /> : <Phone size={16} />}
                                Send Code
                              </button>
                            </div>
                          )}
                          
                          {step.step === 2 && step.status === 'active' && (
                            <div className="verification-code-group">
                              <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                className="form-input-enhanced verification-code-input"
                                maxLength={6}
                                disabled={phoneVerificationLoading}
                              />
                              <button
                                className="action-btn primary"
                                onClick={verifyPhoneCode}
                                disabled={phoneVerificationLoading || !verificationCode.trim()}
                              >
                                {phoneVerificationLoading ? <Loader size={16} className="spinning" /> : <Check size={16} />}
                                Verify
                              </button>
                              <button
                                className="resend-code-btn"
                                onClick={sendPhoneVerification}
                                disabled={phoneVerificationLoading}
                              >
                                Resend Code
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="verification-enabled">
                    <div className="enabled-info">
                      <Check size={32} className="success-icon" />
                      <h4>Two-Factor Authentication Enabled</h4>
                      <p>Your account is protected with SMS verification.</p>
                    </div>
                    <button
                      className="action-btn secondary"
                      onClick={disablePhoneVerification}
                      disabled={phoneVerificationLoading}
                    >
                      {phoneVerificationLoading ? <Loader size={16} className="spinning" /> : <Phone size={16} />}
                      Disable 2FA
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'secondary-password' && (
              <div className="settings-section">
                <h3>Secondary Password</h3>
                <p>Set a secondary password for accessing sensitive areas like API keys management.</p>

                <div className="security-info">
                  <div className="info-card">
                    <div className="info-icon">
                      <Key size={24} />
                    </div>
                    <div className="info-content">
                      <h4>Administrative Access</h4>
                      <p>Required for viewing API keys and other sensitive information.</p>
                    </div>
                    <div className="info-status">
                      <span className={`status-badge ${hasSecondaryPassword ? 'configured' : 'not-configured'}`}>
                        {hasSecondaryPassword ? 'Configured' : 'Not Set'}
                      </span>
                    </div>
                  </div>
                </div>

                {!isPhoneVerified && (
                  <div className="requirement-notice">
                    <div className="notice-content">
                      <Shield size={20} />
                      <div>
                        <h4>Two-Factor Authentication Required</h4>
                        <p>You must enable Two-Factor Authentication before setting a secondary password.</p>
                        <button 
                          className="action-btn primary"
                          onClick={() => setActiveSection('two-factor')}
                        >
                          <Smartphone size={16} />
                          Set Up 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isPhoneVerified && !showPasswordChangeFlow && (
                  <div className="password-actions">
                    <h4>{hasSecondaryPassword ? 'Change Secondary Password' : 'Set Secondary Password'}</h4>
                    <p>Two-factor authentication is required to {hasSecondaryPassword ? 'change' : 'set'} your secondary password.</p>
                    
                    <button
                      className="action-btn primary"
                      onClick={handleSecondaryPasswordRequest}
                      disabled={loading}
                    >
                      <Shield size={16} />
                      {hasSecondaryPassword ? 'Change Password' : 'Set Password'}
                    </button>
                  </div>
                )}

                {showPasswordChangeFlow && (
                  <div className="password-change-form">
                    <h4>Set New Secondary Password</h4>
                    <p>Create a secure password for administrative access.</p>

                    <div className="form-group">
                      <label>New Secondary Password</label>
                      <div className="password-input-group">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newSecondaryPassword}
                          onChange={(e) => setNewSecondaryPassword(e.target.value)}
                          placeholder="Enter secondary password (min. 6 characters)"
                          className="form-input-enhanced"
                        />
                        <button
                          type="button"
                          className="toggle-password-btn"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Confirm Secondary Password</label>
                      <div className="password-input-group">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmSecondaryPassword}
                          onChange={(e) => setConfirmSecondaryPassword(e.target.value)}
                          placeholder="Confirm secondary password"
                          className="form-input-enhanced"
                        />
                        <button
                          type="button"
                          className="toggle-password-btn"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        className="action-btn secondary"
                        onClick={resetPasswordFlow}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        className="action-btn primary"
                        onClick={updateSecondaryPassword}
                        disabled={loading || !newSecondaryPassword || !confirmSecondaryPassword}
                      >
                        {loading ? <Loader size={16} className="spinning" /> : <Key size={16} />}
                        {hasSecondaryPassword ? 'Update' : 'Set'} Password
                      </button>
                    </div>
                  </div>
                )}

                {twoFactorAction === 'change-password' && !showPasswordChangeFlow && (
                  <div className="two-factor-verification">
                    <h4>Verify Your Identity</h4>
                    <p>Enter the verification code sent to your phone to proceed with password change.</p>
                    
                    <div className="verification-code-group">
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="form-input-enhanced verification-code-input"
                        maxLength={6}
                        disabled={phoneVerificationLoading}
                      />
                      <button
                        className="action-btn primary"
                        onClick={verifyPhoneCode}
                        disabled={phoneVerificationLoading || !verificationCode.trim()}
                      >
                        {phoneVerificationLoading ? <Loader size={16} className="spinning" /> : <Check size={16} />}
                        Verify
                      </button>
                      <button
                        className="resend-code-btn"
                        onClick={sendPhoneVerification}
                        disabled={phoneVerificationLoading}
                      >
                        Resend Code
                      </button>
                    </div>

                    <button
                      className="action-btn secondary"
                      onClick={resetPasswordFlow}
                      disabled={phoneVerificationLoading}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Re-authentication Modal */}
        {showReauthModal && (
          <div className="modal-overlay" onClick={closeReauthModal}>
            <div className="reauth-modal" onClick={(e) => e.stopPropagation()}>
              <div className="reauth-header">
                <h3>Sign In Again</h3>
                <button onClick={closeReauthModal} className="modal-close">
                  <X size={20} />
                </button>
              </div>
              
              <div className="reauth-content">
                <div className="reauth-info">
                  <Shield size={48} />
                  <h4>Authentication Required</h4>
                  <p>For security, you need to sign in again before setting up two-factor authentication.</p>
                </div>
                
                {currentUser?.providerData?.some((provider: any) => provider.providerId === 'google.com') ? (
                  <div className="google-reauth">
                    <p>You signed in with Google. Click the button below to authenticate again.</p>
                    <button
                      className="action-btn primary"
                      onClick={handleReauthentication}
                      disabled={reauthLoading}
                    >
                      {reauthLoading ? <Loader size={16} className="spinning" /> : <span>🔐</span>}
                      Sign In with Google
                    </button>
                  </div>
                ) : (
                  <div className="password-reauth">
                    <label>Enter Your Password</label>
                    <div className="password-input-group">
                      <input
                        type="password"
                        value={reauthPassword}
                        onChange={(e) => setReauthPassword(e.target.value)}
                        placeholder="Enter your account password"
                        className="form-input-enhanced"
                        onKeyPress={(e) => e.key === 'Enter' && handleReauthentication()}
                        autoFocus
                      />
                    </div>
                    <button
                      className="action-btn primary"
                      onClick={handleReauthentication}
                      disabled={reauthLoading || !reauthPassword.trim()}
                    >
                      {reauthLoading ? <Loader size={16} className="spinning" /> : <Shield size={16} />}
                      Verify Identity
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Hidden reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default SettingsPage; 