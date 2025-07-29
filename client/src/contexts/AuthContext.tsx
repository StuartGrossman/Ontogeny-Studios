import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User,
  AuthError,
  MultiFactorError,
  getMultiFactorResolver,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
  // MFA related
  showMFAPrompt: boolean;
  setShowMFAPrompt: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showMFAPrompt, setShowMFAPrompt] = useState(false);

  const clearAuthError = () => {
    setAuthError(null);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setAuthError(null);
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      
      const authError = error as AuthError;
      
      // Handle MFA requirement
      if (authError.code === 'auth/multi-factor-auth-required') {
        setShowMFAPrompt(true);
        setAuthError('Multi-factor authentication required. Please complete the verification process.');
        return;
      }
      
      // Handle other specific error codes
      switch (authError.code) {
        case 'auth/popup-closed-by-user':
          setAuthError('Sign-in was cancelled. Please try again.');
          break;
        case 'auth/popup-blocked':
          setAuthError('Sign-in popup was blocked. Please allow popups for this site and try again.');
          break;
        case 'auth/account-exists-with-different-credential':
          setAuthError('An account already exists with the same email address but different sign-in credentials.');
          break;
        case 'auth/operation-not-allowed':
          setAuthError('Google sign-in is not enabled. Please contact support.');
          break;
        case 'auth/network-request-failed':
          setAuthError('Network error. Please check your internet connection and try again.');
          break;
        case 'auth/too-many-requests':
          setAuthError('Too many sign-in attempts. Please try again later.');
          break;
        case 'auth/user-disabled':
          setAuthError('This account has been disabled. Please contact support.');
          break;
        default:
          setAuthError('Sign-in failed. Please try again or contact support if the problem persists.');
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setAuthError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      const authError = error as AuthError;
      
      // Handle MFA requirement for email/password
      if (authError.code === 'auth/multi-factor-auth-required') {
        setShowMFAPrompt(true);
        setAuthError('Multi-factor authentication required. Please complete the verification process.');
        return;
      }
      
      switch (authError.code) {
        case 'auth/user-not-found':
          setAuthError('User not found. Please check your email address.');
          break;
        case 'auth/wrong-password':
          setAuthError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setAuthError('Invalid email address. Please check your email format.');
          break;
        case 'auth/network-request-failed':
          setAuthError('Network error. Please check your internet connection and try again.');
          break;
        case 'auth/too-many-requests':
          setAuthError('Too many sign-in attempts. Please try again later.');
          break;
        case 'auth/user-disabled':
          setAuthError('This account has been disabled. Please contact support.');
          break;
        default:
          setAuthError('Sign-in failed. Please try again or contact support if the problem persists.');
      }
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setAuthError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing up with email:', error);
      const authError = error as AuthError;
      switch (authError.code) {
        case 'auth/email-already-in-use':
          setAuthError('This email address is already in use. Please choose a different one.');
          break;
        case 'auth/invalid-email':
          setAuthError('Invalid email address. Please check your email format.');
          break;
        case 'auth/operation-not-allowed':
          setAuthError('Email/password sign-up is not enabled. Please contact support.');
          break;
        case 'auth/weak-password':
          setAuthError('Password is too weak. It must be at least 6 characters long.');
          break;
        case 'auth/network-request-failed':
          setAuthError('Network error. Please check your internet connection and try again.');
          break;
        case 'auth/too-many-requests':
          setAuthError('Too many sign-up attempts. Please try again later.');
          break;
        default:
          setAuthError('Sign-up failed. Please try again or contact support if the problem persists.');
      }
    }
  };

  const logout = async () => {
    try {
      setAuthError(null);
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthError('Error signing out. Please try again.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      // Clear any auth errors when user successfully signs in
      if (user) {
        setAuthError(null);
        setShowMFAPrompt(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    authError,
    clearAuthError,
    showMFAPrompt,
    setShowMFAPrompt
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 