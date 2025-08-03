import React, { useState } from 'react';
import { X, AlertTriangle, CreditCard, Calendar, DollarSign, Wifi, WifiOff } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './CancelSubscriptionModal.css';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscriptionData: any;
  project: any;
  currentUser: any;
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subscriptionData,
  project,
  currentUser
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleConfirmCancel = async () => {
    if (confirmText !== 'CANCEL') {
      return;
    }

    setIsCancelling(true);
    try {
      // Update subscription status to cancelled in Firestore
      const subscriptionRef = doc(db, 'subscriptions', subscriptionData.id);
      await updateDoc(subscriptionRef, {
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Subscription cancelled successfully');
      onConfirm();
      onClose();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cancel-subscription-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <AlertTriangle size={24} className="warning-icon" />
            <div>
              <h2>Cancel Subscription</h2>
              <p className="modal-subtitle">Review your subscription details before cancelling</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {/* Warning Section */}
          <div className="warning-section">
            <div className="warning-header">
              <WifiOff size={20} className="warning-icon" />
              <h3>⚠️ Your project will be deactivated</h3>
            </div>
            <p className="warning-text">
              <strong>Important:</strong> When you cancel your subscription, your project will immediately go offline and all features will be disabled. However, you can reactivate your project at any time by resubscribing to restore full functionality.
            </p>
            <div className="reactivation-info">
              <Wifi size={16} className="reactivation-icon" />
              <span>You can resubscribe anytime to reactivate your project</span>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="subscription-details">
            <h3 className="section-title">Current Subscription</h3>
            
            <div className="detail-cards">
              <div className="detail-card">
                <div className="detail-icon">
                  <DollarSign size={16} />
                </div>
                <div className="detail-content">
                  <label>Monthly Amount</label>
                  <span className="detail-value">
                    {formatCurrency(subscriptionData.amount, subscriptionData.currency)}/month
                  </span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">
                  <CreditCard size={16} />
                </div>
                <div className="detail-content">
                  <label>Payment Method</label>
                  <span className="detail-value">
                    {subscriptionData.paymentMethod || 'Card ending in ****'}
                  </span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">
                  <Calendar size={16} />
                </div>
                <div className="detail-content">
                  <label>Next Billing Date</label>
                  <span className="detail-value">
                    {subscriptionData.nextBillingDate ? 
                      formatDate(new Date(subscriptionData.nextBillingDate)) : 
                      'Not available'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Impact */}
          <div className="project-impact">
            <h3 className="section-title">What happens to your project</h3>
            
            <div className="impact-list">
              <div className="impact-item negative">
                <WifiOff size={16} />
                <span>Project will be deactivated immediately</span>
              </div>
              <div className="impact-item negative">
                <X size={16} />
                <span>All features and services disabled</span>
              </div>
              <div className="impact-item negative">
                <Calendar size={16} />
                <span>No further billing charges</span>
              </div>
              <div className="impact-item positive">
                <Wifi size={16} />
                <span>Can resubscribe to reactivate anytime</span>
              </div>
              <div className="impact-item positive">
                <CreditCard size={16} />
                <span>Your project data is preserved</span>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <div className="confirmation-section">
            <div className="confirmation-input">
              <label htmlFor="confirm-text">
                Type <strong>CANCEL</strong> to confirm you want to cancel your subscription:
              </label>
              <input
                id="confirm-text"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type CANCEL to confirm"
                className="confirm-input"
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Keep Subscription
          </button>
          <button 
            className="btn-danger" 
            onClick={handleConfirmCancel}
            disabled={confirmText !== 'CANCEL' || isCancelling}
          >
            {isCancelling ? (
              <>
                <div className="loading-spinner" />
                Cancelling...
              </>
            ) : (
              <>
                <AlertTriangle size={16} />
                Cancel Subscription
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelSubscriptionModal; 