import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/ProjectPaymentSection.css';

interface ProjectPaymentSectionProps {
  projectId: string;
  projectName: string;
  subscriptionAmount?: number;
}

const ProjectPaymentSection: React.FC<ProjectPaymentSectionProps> = ({
  projectId,
  projectName,
  subscriptionAmount = 0
}) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);

  useEffect(() => {
    if (currentUser?.uid && projectId) {
      checkPaymentMethod();
    }
  }, [currentUser?.uid, projectId]);

  const checkPaymentMethod = async () => {
    if (!currentUser?.uid || !projectId) return;

    try {
      const paymentDoc = await getDoc(doc(db, 'users', currentUser.uid, 'payments', projectId));
      if (paymentDoc.exists()) {
        const data = paymentDoc.data();
        setHasPaymentMethod(true);
        setPaymentMethod(data);
      }
    } catch (error) {
      console.error('Error checking payment method:', error);
    }
  };

  const handleConnectCard = async () => {
    if (!currentUser?.uid || !projectId) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Create a payment method setup session
      const response = await fetch('http://localhost:3002/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: subscriptionAmount,
          currency: 'usd',
          projectId,
          projectName,
          userId: currentUser.uid,
          userEmail: currentUser.email,
        }),
      });

      const { url } = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      if (!url) {
        throw new Error('No checkout URL received');
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect card');
      console.error('Error connecting card:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!currentUser?.uid || !projectId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          userId: currentUser.uid,
          returnUrl: window.location.href
        }),
      });

      const session = await response.json();
      
      if (!response.ok) {
        throw new Error(session.message || 'Failed to create portal session');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = session.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open customer portal');
      console.error('Error opening customer portal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="project-payment-section">
      <div className="payment-header">
        <div className="header-content">
          <CreditCard size={24} />
          <div>
            <h3>Payment Settings</h3>
            <p>Manage your payment method for {projectName}</p>
          </div>
        </div>
      </div>

      <div className="payment-content">
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        <div className="payment-info">
          <div className="info-card">
            <div className="info-header">
              <Shield size={20} />
              <h4>Secure Payment Processing</h4>
            </div>
            <p>Your payment information is securely processed by Stripe, a trusted payment processor used by millions of businesses worldwide.</p>
          </div>

          {subscriptionAmount > 0 && (
            <div className="subscription-info">
              <div className="amount-display">
                <span className="amount-label">Monthly Subscription:</span>
                <span className="amount-value">${subscriptionAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {hasPaymentMethod ? (
          <div className="payment-method-section">
            <div className="method-info">
              <div className="method-header">
                <CheckCircle size={20} className="success-icon" />
                <h4>Payment Method Connected</h4>
              </div>
              {paymentMethod && (
                <div className="method-details">
                  <p>Card ending in {paymentMethod.last4}</p>
                  <p>Expires {paymentMethod.expMonth}/{paymentMethod.expYear}</p>
                </div>
              )}
            </div>
            
            <div className="method-actions">
              <button 
                className="button button-secondary"
                onClick={handleManageSubscription}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    <CreditCard size={16} />
                    Manage Subscription
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="connect-card-section">
            <div className="connect-info">
              <div className="connect-header">
                <Lock size={20} />
                <h4>Connect Payment Method</h4>
              </div>
              <p>Add a credit or debit card to enable automatic monthly payments for your subscription.</p>
            </div>
            
            <div className="connect-actions">
              <button 
                className="button button-primary"
                onClick={handleConnectCard}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    <CreditCard size={16} />
                    Connect Card
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPaymentSection; 