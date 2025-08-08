import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { CreditCard, RefreshCw } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import CancelSubscriptionModal from './modals/CancelSubscriptionModal';

interface Project {
  id: string;
  name?: string;
  projectName?: string;
}

interface PaymentCardContentProps {
  project: Project;
}

const PaymentCardContentComponent: React.FC<PaymentCardContentProps> = ({ project }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const hasLoadedRef = useRef<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadSubscription = useCallback(async () => {
    if (!currentUser?.uid || !project?.id) return;

    setLoading(true);
    try {
      const subscriptionQuery = query(
        collection(db, 'subscriptions'),
        where('projectId', '==', project.id),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'active')
      );
      const subscriptionSnapshot = await getDocs(subscriptionQuery);
      if (!subscriptionSnapshot.empty) {
        const subscriptionDoc = subscriptionSnapshot.docs[0];
        const subData = subscriptionDoc.data();
        setSubscriptionData({
          id: subscriptionDoc.id,
          amount: subData.amount || 60,
          currency: subData.currency || 'USD',
          projectId: project.id,
          projectName: project.name || project.projectName || 'Unknown Project',
          status: 'active',
          createdAt: subData.createdAt || new Date(),
          sessionId: subData.sessionId
        });
      } else {
        setSubscriptionData({
          id: 'pending',
          amount: 60,
          currency: 'USD',
          projectId: project.id,
          projectName: project.name || project.projectName || 'Unknown Project',
          status: 'setup_pending',
          createdAt: new Date()
        });
      }
    } catch (error) {
      // Fallback for dev
      setSubscriptionData({
        id: 'sub_fallback',
        amount: 60,
        currency: 'USD',
        projectId: project.id,
        projectName: project.name || project.projectName || 'Unknown Project',
        status: 'setup_pending',
        createdAt: new Date()
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, project?.id]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    if (project?.id && currentUser?.uid) {
      hasLoadedRef.current = true;
      loadSubscription();
    }
  }, [project?.id, currentUser?.uid, loadSubscription]);

  const handleConnectCard = async () => {
    if (!subscriptionData || !currentUser?.uid) return;
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3002/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: subscriptionData.amount,
          currency: subscriptionData.currency,
          projectId: subscriptionData.projectId,
          projectName: subscriptionData.projectName || project.name || project.projectName || 'Unknown Project',
          userId: currentUser.uid,
          userEmail: currentUser.email,
        }),
      });
      if (!response.ok) throw new Error('Failed to create checkout session');
      const { url } = await response.json();
      if (!url) throw new Error('No checkout URL received');
      window.location.href = url;
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionData || !currentUser?.uid) return;
    try {
      setLoading(true);
      const subscriptionRef = doc(db, 'subscriptions', subscriptionData.id);
      await updateDoc(subscriptionRef, {
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      });
      await loadSubscription();
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  if (authLoading) {
    return (
      <div className="payment-loading" style={{ minHeight: 120 }}>
        <RefreshCw className="spinning" size={16} />
        <span>Loading authentication...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="payment-loading" style={{ minHeight: 120 }}>
        <RefreshCw className="spinning" size={16} />
        <span>Loading payment info...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="payment-no-subscription" style={{ minHeight: 120 }}>
        <span>Please log in to manage payments</span>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="payment-no-subscription" style={{ minHeight: 120 }}>
        <span>No subscription found</span>
      </div>
    );
  }

  return (
    <div className="payment-card-content" style={{ minHeight: 120 }}>
      <div className="payment-status payment-status-top">
        {subscriptionData.status === 'active' ? (
          <div className="payment-status-indicator" title="Subscription is active">
            <span className="status-dot active" />
            <span className="status-label">Active</span>
          </div>
        ) : (
          <div className="payment-status-indicator">
            <span className="status-dot pending" />
            <span className="status-label">Setup Required</span>
          </div>
        )}
      </div>

      <div className="payment-amount">
        <span className="amount-value">{formatCurrency(subscriptionData.amount, subscriptionData.currency)}</span>
        <span className="amount-period">/month</span>
      </div>

      {subscriptionData.status === 'setup_pending' && (
        <button className="connect-card-btn" onClick={(e) => { e.stopPropagation(); handleConnectCard(); }} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="spinning" size={14} />
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={14} />
              Connect Card
            </>
          )}
        </button>
      )}

      {subscriptionData.status === 'active' && (
        <CancelSubscriptionModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={async () => {
            setShowCancelModal(false);
            await loadSubscription();
          }}
          subscriptionData={subscriptionData}
          project={project}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

const PaymentCardContent = memo(PaymentCardContentComponent, (prev, next) => prev.project?.id === next.project?.id);

export default PaymentCardContent;

