import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  MultiFactorResolver, 
  PhoneAuthProvider, 
  PhoneMultiFactorGenerator,
  RecaptchaVerifier
} from 'firebase/auth';
import { auth } from '../../firebase';
import './Modal.css';

interface MFAModalProps {
  onClose: () => void;
  resolver?: MultiFactorResolver;
}

const MFAModal: React.FC<MFAModalProps> = ({ onClose, resolver }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'verify'>('select');

  useEffect(() => {
    // Log resolver state for debugging
    console.log('MFA Resolver:', resolver);
    if (resolver) {
      console.log('MFA Hints:', resolver.hints);
    }
  }, [resolver]);

  const handleSendVerificationCode = async () => {
    if (!resolver) {
      setError('No MFA session available. Please try signing in again.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Get the first enrolled factor
      const hints = resolver.hints;
      if (!hints || hints.length === 0) {
        console.error('No MFA hints available');
        setError('No MFA methods found. Please contact support.');
        return;
      }

      const hint = hints[0];
      console.log('Using MFA hint:', hint);

      // Create a new RecaptchaVerifier instance for this attempt
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: async (response: any) => {
          console.log('reCAPTCHA verified:', response);
          try {
            // Send verification code after reCAPTCHA is solved
            const phoneInfoOptions = {
              multiFactorHint: hint,
              session: resolver.session
            };
            
            const phoneAuthProvider = new PhoneAuthProvider(auth);
            console.log('Sending verification code with options:', phoneInfoOptions);
            
            const verificationId = await phoneAuthProvider.verifyPhoneNumber(
              phoneInfoOptions,
              recaptchaVerifier
            );
            
            console.log('Verification ID received:', verificationId);
            setVerificationId(verificationId);
            setStep('verify');
          } catch (err) {
            console.error('Error in reCAPTCHA callback:', err);
            setError('Failed to send verification code. Please try again.');
          }
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please solve it again.');
          recaptchaVerifier.clear();
        }
      });

      // Render the reCAPTCHA widget
      await recaptchaVerifier.render();
      console.log('reCAPTCHA rendered');

    } catch (err) {
      console.error('Error in handleSendVerificationCode:', err);
      setError('Failed to initialize verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!resolver || !verificationId) {
      setError('Invalid verification session. Please try again.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('Verifying code with ID:', verificationId);
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      
      // Complete sign in with MFA
      console.log('Resolving sign in with assertion');
      await resolver.resolveSignIn(multiFactorAssertion);
      console.log('Sign in resolved successfully');
      onClose();
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'select') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Multi-Factor Authentication Required</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-content">
            <p>To continue signing in, we need to verify your identity.</p>
            {error && <div className="error-message">{error}</div>}
            <div id="recaptcha-container" className="recaptcha-container"></div>
            <button 
              className="button button-primary"
              onClick={handleSendVerificationCode}
              disabled={loading}
            >
              {loading ? 'Initializing...' : 'Start Verification'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Enter Verification Code</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <p>Please enter the verification code sent to your device:</p>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            className="input-field"
          />
          <div className="modal-actions">
            <button 
              className="button button-primary"
              onClick={handleVerifyCode}
              disabled={loading || !verificationCode}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              className="button button-secondary"
              onClick={() => {
                setStep('select');
                setVerificationCode('');
                setError('');
              }}
              disabled={loading}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFAModal; 