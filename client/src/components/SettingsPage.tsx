import React, { useState, useEffect } from 'react';
import { X, User, Shield, Phone, Check, AlertCircle, Loader, Key, Lock, Smartphone, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
      
      // Remove the reCAPTCHA container
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.remove();
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
      
      // Remove the reCAPTCHA container
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.remove();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (showReauthModal) {
      console.log('Re-authentication modal is now showing');
    }
  }, [showReauthModal]);

  const initializeRecaptcha = async () => {
    try {
      // Only initialize if we don't already have a verifier
      if (recaptchaVerifier) {
        console.log('reCAPTCHA verifier already exists, skipping initialization');
        return;
      }

      if (auth.currentUser) {
        console.log('Initializing reCAPTCHA verifier...');
        
        // Create a completely new container each time
        const existingContainer = document.getElementById('recaptcha-container');
        if (existingContainer) {
          existingContainer.remove();
        }
        
        // Create new container
        const newContainer = document.createElement('div');
        newContainer.id = 'recaptcha-container';
        newContainer.style.position = 'absolute';
        newContainer.style.left = '-9999px';
        newContainer.style.top = '-9999px';
        document.body.appendChild(newContainer);
        
        console.log('Creating new reCAPTCHA verifier...');
        
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
        
        // Wait a bit to ensure verifier is stable
        await new Promise(resolve => setTimeout(resolve, 1000));
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
      // Ensure we have a valid reCAPTCHA verifier
      if (!recaptchaVerifier) {
        console.log('No reCAPTCHA verifier found, initializing...');
        await initializeRecaptcha();
        
        if (!recaptchaVerifier) {
          throw new Error('Failed to initialize reCAPTCHA verifier. Please refresh the page and try again.');
        }
      }
      
      console.log('Using existing reCAPTCHA verifier for phone verification...');

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
      // Update the secondary password in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        secondaryPassword: newSecondaryPassword
      });
      
      // Update API and DNS requests with the new password
      await updateAPIAndDNSRequests(newSecondaryPassword);
      
      setHasSecondaryPassword(true);
      setNewSecondaryPassword('');
      setConfirmSecondaryPassword('');
      setShowPasswordChangeFlow(false);
      setTwoFactorAction(null);
      setSuccess('Secondary password updated successfully. API and DNS requests have been updated.');
    } catch (error: any) {
      setError(error.message || 'Failed to update secondary password');
    } finally {
      setLoading(false);
    }
  };

  const updateAPIAndDNSRequests = async (newPassword: string) => {
    try {
      console.log('🔄 Updating API and DNS requests with new secondary password...');
      
      // Get all user's projects
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', currentUser.uid),
        where('status', 'in', ['planning', 'in-progress'])
      );
      
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log(`📋 Found ${projects.length} active projects for user`);
      
      let updatedRequests = 0;
      
      // Update each project's API and DNS requests
      for (const project of projects) {
        try {
          // Update API key requests
          const apiKeysQuery = query(
            collection(db, 'admin_projects', project.id, 'required_api_keys'),
            where('status', '==', 'pending')
          );
          
          const apiKeysSnapshot = await getDocs(apiKeysQuery);
          const apiKeyUpdates = apiKeysSnapshot.docs.map(doc => 
            updateDoc(doc.ref, {
              lastUpdated: new Date(),
              passwordUpdatedAt: new Date()
            })
          );
          
          if (apiKeyUpdates.length > 0) {
            await Promise.all(apiKeyUpdates);
            updatedRequests += apiKeyUpdates.length;
            console.log(`✅ Updated ${apiKeyUpdates.length} API key requests for project ${project.id}`);
          }
          
          // Update DNS record requests
          const dnsRecordsQuery = query(
            collection(db, 'admin_projects', project.id, 'required_dns_records'),
            where('status', '==', 'pending')
          );
          
          const dnsRecordsSnapshot = await getDocs(dnsRecordsQuery);
          const dnsRecordUpdates = dnsRecordsSnapshot.docs.map(doc => 
            updateDoc(doc.ref, {
              lastUpdated: new Date(),
              passwordUpdatedAt: new Date()
            })
          );
          
          if (dnsRecordUpdates.length > 0) {
            await Promise.all(dnsRecordUpdates);
            updatedRequests += dnsRecordUpdates.length;
            console.log(`✅ Updated ${dnsRecordUpdates.length} DNS record requests for project ${project.id}`);
          }
          
        } catch (projectError) {
          console.warn(`⚠️ Error updating requests for project ${project.id}:`, projectError);
          // Continue with other projects even if one fails
        }
      }
      
      console.log(`🎉 Successfully updated ${updatedRequests} total API and DNS requests`);
      
    } catch (error) {
      console.error('❌ Error updating API and DNS requests:', error);
      // Don't throw error here - password update should still succeed
      // Just log the error for debugging
    }
  };

  const handleSecondaryPasswordRequest = () => {
    if (!isPhoneVerified) {
      setError('You must enable Two-Factor Authentication first to set a secondary password.');
      setActiveSection('two-factor');
      setTwoFactorAction('change-password');
      return;
    }
    
    // If 2FA is already enabled, allow direct password change
    setShowPasswordChangeFlow(true);
    setTwoFactorAction(null);
    setError('');
    setSuccess('You can now change your secondary password.');
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
    <div className="settings-page-inline">
      <div className="settings-content-inline">
        <div className="settings-content">
          {/* Compact Header */}
          <div className="settings-header-compact">
            <div className="settings-header-left">
              <User size={20} />
              <span>Account Settings</span>
            </div>
            
            <div className="settings-header-right">
              <button className="settings-close-btn" onClick={onClose}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Compact Navigation */}
          <div className="settings-nav-compact">
            <button 
              className={`settings-nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('profile');
                resetMessages();
                resetPasswordFlow();
              }}
            >
              <User size={16} />
              <span>Profile</span>
            </button>
            <button 
              className={`settings-nav-btn ${activeSection === 'two-factor' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('two-factor');
                resetMessages();
                resetPasswordFlow();
              }}
            >
              <Smartphone size={16} />
              <span>Two-Factor Auth</span>
            </button>
            <button 
              className={`settings-nav-btn ${activeSection === 'secondary-password' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('secondary-password');
                resetMessages();
                resetPasswordFlow();
              }}
            >
              <Lock size={16} />
              <span>Secondary Password</span>
            </button>
          </div>

          <div className="settings-main-compact">
            {error && (
              <div className="error-message-compact">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            {success && (
              <div className="success-message-compact">
                <Check size={16} />
                {success}
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="settings-section-compact">
                <div className="section-header-compact">
                  <h3>Profile Information</h3>
                  <p>View your account information. Contact support to make changes.</p>
                </div>

                <div className="profile-info-compact">
                  <div className="profile-field-compact">
                    <div className="field-label">Display Name</div>
                    <div className="field-value">
                      <User size={14} />
                      <span>{currentUser?.displayName || 'Not set'}</span>
                    </div>
                  </div>

                  <div className="profile-field-compact">
                    <div className="field-label">Email Address</div>
                    <div className="field-value">
                      <span>📧</span>
                      <span>{currentUser?.email || 'Not set'}</span>
                    </div>
                  </div>

                  <div className="profile-field-compact">
                    <div className="field-label">Account Created</div>
                    <div className="field-value">
                      <span>📅</span>
                      <span>{currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-notice-compact">
                  <AlertCircle size={16} />
                  <div>
                    <strong>Need to update your information?</strong>
                    <p>Contact our support team to make changes to your profile information.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'two-factor' && (
              <div className="settings-section-compact">
                <div className="section-header-compact">
                  <h3>Two-Factor Authentication</h3>
                  <p>Secure your account with SMS verification using your phone number.</p>
                </div>

                <div className="security-status-compact">
                  <div className="status-card">
                    <div className="status-icon">
                      <Phone size={20} />
                    </div>
                    <div className="status-content">
                      <h4>SMS Verification</h4>
                      <p>Receive verification codes via text message for enhanced security.</p>
                    </div>
                    <div className="status-badge">
                      <span className={`badge ${isPhoneVerified ? 'enabled' : 'disabled'}`}>
                        {isPhoneVerified ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                {!isPhoneVerified ? (
                  <div className="verification-steps-compact">
                    {phoneVerificationSteps.map((step) => (
                      <div key={step.step} className={`verification-step-compact ${step.status}`}>
                        <div className={`step-icon-compact ${step.status}`}>
                          {step.status === 'completed' ? <Check size={14} /> : step.step}
                        </div>
                        <div className="step-content-compact">
                          <h4>{step.title}</h4>
                          <p>{step.description}</p>
                          
                          {step.step === 1 && step.status === 'active' && (
                            <div className="phone-input-compact">
                              <div className="input-instructions">
                                <p>Enter your phone number in any format:</p>
                                <ul>
                                  <li>+1 (415) 999-4541</li>
                                  <li>+14159994541</li>
                                  <li>4159994541 (US numbers)</li>
                                </ul>
                              </div>
                              <div className="input-group-compact">
                                <input
                                  type="tel"
                                  value={phoneNumber}
                                  onChange={(e) => setPhoneNumber(e.target.value)}
                                  placeholder="Enter phone number"
                                  className="phone-input"
                                />
                                <button
                                  className="action-btn-compact primary"
                                  onClick={sendPhoneVerification}
                                  disabled={phoneVerificationLoading || !phoneNumber.trim()}
                                >
                                  {phoneVerificationLoading ? <Loader size={14} className="spinning" /> : <Phone size={14} />}
                                  Send Code
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {step.step === 2 && step.status === 'active' && (
                            <div className="verification-code-compact">
                              <div className="input-group-compact">
                                <input
                                  type="text"
                                  value={verificationCode}
                                  onChange={(e) => setVerificationCode(e.target.value)}
                                  placeholder="Enter 6-digit code"
                                  className="code-input"
                                  maxLength={6}
                                />
                                <button
                                  className="action-btn-compact primary"
                                  onClick={verifyPhoneCode}
                                  disabled={phoneVerificationLoading || !verificationCode.trim()}
                                >
                                  {phoneVerificationLoading ? <Loader size={14} className="spinning" /> : <Check size={14} />}
                                  Verify Code
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="verification-enabled-compact">
                    <div className="enabled-card">
                      <CheckCircle size={20} />
                      <div>
                        <h4>Two-Factor Authentication Enabled</h4>
                        <p>Your account is now protected with SMS verification.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'secondary-password' && (
              <div className="settings-section-compact">
                <div className="section-header-compact">
                  <h3>Secondary Password</h3>
                  <p>Set up an additional password for enhanced security on sensitive operations.</p>
                </div>

                <div className="password-status-compact">
                  <div className="status-card">
                    <div className="status-icon">
                      <Key size={20} />
                    </div>
                    <div className="status-content">
                      <h4>Secondary Password</h4>
                      <p>Additional password required for API key management and DNS changes.</p>
                    </div>
                    <div className="status-badge">
                      <span className={`badge ${hasSecondaryPassword ? 'enabled' : 'disabled'}`}>
                        {hasSecondaryPassword ? 'Set' : 'Not Set'}
                      </span>
                    </div>
                  </div>
                </div>

                {!hasSecondaryPassword ? (
                  <div className="password-setup-compact">
                    <div className="setup-form">
                      <div className="form-group-compact">
                        <label>New Secondary Password</label>
                        <div className="password-input-group-compact">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newSecondaryPassword}
                            onChange={(e) => setNewSecondaryPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="password-input-compact"
                          />
                          <button
                            type="button"
                            className="toggle-password-compact"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group-compact">
                        <label>Confirm Password</label>
                        <div className="password-input-group-compact">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmSecondaryPassword}
                            onChange={(e) => setConfirmSecondaryPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="password-input-compact"
                          />
                          <button
                            type="button"
                            className="toggle-password-compact"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <button
                        className="action-btn-compact primary"
                        onClick={updateSecondaryPassword}
                        disabled={loading || !newSecondaryPassword || !confirmSecondaryPassword}
                      >
                        {loading ? <Loader size={14} className="spinning" /> : <Key size={14} />}
                        Set Secondary Password
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="password-enabled-compact">
                    <div className="enabled-card">
                      <CheckCircle size={20} />
                      <div>
                        <h4>Secondary Password Set</h4>
                        <p>Your secondary password is active and protecting sensitive operations.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 