import React, { useState } from 'react';
import { CreditCard, X } from 'lucide-react';
import './Modal.css';
import '../styles/PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  amount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  amount
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3002/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'usd',
          projectId,
          projectName,
          userId: 'current-user', // You might want to pass this as a prop
          userEmail: 'user@example.com', // You might want to pass this as a prop
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
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <CreditCard size={24} />
            <div>
              <h2>Complete Payment</h2>
              <p>Process payment for {projectName}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <div className="payment-amount">
            <span className="amount-label">Total Amount:</span>
            <span className="amount-value">${amount.toFixed(2)}</span>
          </div>

          {error && (
            <div className="payment-error">
              {error}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button 
            className="button button-secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="button button-primary"
            onClick={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <CreditCard size={16} />
                Process Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 