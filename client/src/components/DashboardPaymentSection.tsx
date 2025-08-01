import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, CheckCircle, AlertCircle, Clock, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/DashboardPaymentSection.css';

interface Subscription {
  id: string;
  amount: number;
  currency: string;
  projectId?: string;
  projectName?: string;
  status: 'setup_pending' | 'active' | 'inactive';
  createdAt: Date;
}

interface DashboardPaymentSectionProps {
  project: any;
}

const DashboardPaymentSection: React.FC<DashboardPaymentSectionProps> = ({ project }) => {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectingCard, setConnectingCard] = useState(false);
  const [cardConnected, setCardConnected] = useState(false);

  useEffect(() => {
    if (currentUser?.uid && project?.id) {
      loadSubscription();
    }
  }, [currentUser?.uid, project?.id]);

  const loadSubscription = async () => {
    if (!currentUser?.uid || !project?.id) return;

    try {
      setLoading(true);
      const subscriptionsRef = collection(db, 'users', currentUser.uid, 'subscriptions');
      const q = query(subscriptionsRef, where('projectId', '==', project.id));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const subDoc = querySnapshot.docs[0];
        const subData = subDoc.data();
        setSubscription({
          id: subDoc.id,
          amount: subData.amount,
          currency: subData.currency,
          projectId: subData.projectId,
          projectName: subData.projectName,
          status: subData.status,
          createdAt: subData.createdAt?.toDate() || new Date()
        });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectCard = async () => {
    if (!subscription || !currentUser?.uid) return;

    try {
      setConnectingCard(true);
      
      // Create checkout session on the server
      const response = await fetch('http://localhost:3002/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: subscription.amount,
          currency: subscription.currency,
          projectId: subscription.projectId || project?.id,
          projectName: subscription.projectName || project?.name || project?.projectName,
          userId: currentUser.uid,
          userEmail: currentUser.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Checkout session creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error('No checkout URL received from server');
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error connecting card:', error);
    } finally {
      setConnectingCard(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'setup_pending':
        return {
          icon: <Clock size={16} className="status-icon pending" />,
          text: 'Payment Setup Required',
          className: 'pending'
        };
      case 'active':
        return {
          icon: <CheckCircle size={16} className="status-icon active" />,
          text: 'Active Subscription',
          className: 'active'
        };
      case 'inactive':
        return {
          icon: <AlertCircle size={16} className="status-icon inactive" />,
          text: 'Inactive',
          className: 'inactive'
        };
      default:
        return {
          icon: <Clock size={16} className="status-icon pending" />,
          text: 'Unknown Status',
          className: 'pending'
        };
    }
  };

  if (loading) {
    return (
      <div className="dashboard-payment-section loading">
        <div className="loading-spinner"></div>
        <p>Loading payment information...</p>
      </div>
    );
  }

  if (!subscription) {
    return null; // Don't show payment section if no subscription is set up
  }

  const statusInfo = getStatusInfo(subscription.status);

  return (
    <div className="dashboard-payment-section">
      <div className="payment-header">
        <div className="header-content">
          <CreditCard size={24} />
          <div>
            <h3>Payment Setup</h3>
            <p>Manage your subscription payment method</p>
          </div>
        </div>
        <div className={`status-badge ${statusInfo.className}`}>
          {statusInfo.icon}
          <span>{statusInfo.text}</span>
        </div>
      </div>

      <div className="payment-content">
        <div className="subscription-info">
          <div className="info-item">
            <span className="label">Subscription Amount:</span>
            <span className="value">
              <DollarSign size={16} />
              {formatCurrency(subscription.amount, subscription.currency)}/month
            </span>
          </div>
          <div className="info-item">
            <span className="label">Project:</span>
            <span className="value">{subscription.projectName || 'General Subscription'}</span>
          </div>
        </div>

        {subscription.status === 'setup_pending' && (
          <div className="payment-actions">
            <div className="action-info">
              <h4>Connect Your Payment Method</h4>
              <p>Connect your card via Stripe to activate your subscription</p>
            </div>
            <button 
              className="dash-btn primary connect-card-btn"
              onClick={handleConnectCard}
              disabled={connectingCard}
            >
              {connectingCard ? (
                <>
                  <div className="loading-spinner small"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Connect Card via Stripe
                </>
              )}
            </button>
          </div>
        )}

        {subscription.status === 'active' && cardConnected && (
          <div className="success-message">
            <CheckCircle size={20} />
            <div>
              <h4>Payment Method Connected!</h4>
              <p>Your subscription is now active and ready to accept payments.</p>
            </div>
          </div>
        )}

        {subscription.status === 'active' && !cardConnected && (
          <div className="payment-actions">
            <div className="action-info">
              <h4>Complete Payment Setup</h4>
              <p>Connect your payment method to activate your subscription</p>
            </div>
            <button 
              className="dash-btn primary connect-card-btn"
              onClick={handleConnectCard}
              disabled={connectingCard}
            >
              {connectingCard ? (
                <>
                  <div className="loading-spinner small"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Connect Stripe & Pay
                </>
              )}
            </button>
          </div>
        )}

        {subscription.status === 'active' && cardConnected && (
          <div className="success-message">
            <CheckCircle size={20} />
            <div>
              <h4>Payment Successful!</h4>
              <p>Your subscription is now active and payment has been processed.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPaymentSection;