import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import './PaymentSuccessModal.css';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  sessionId
}) => {
  if (!isOpen) return null;

  return (
    <div className="payment-success-modal-overlay">
      <div className="payment-success-modal">
        <div className="payment-success-modal-header">
          <div className="payment-success-icon">
            <CheckCircle size={24} />
          </div>
          <button className="payment-success-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="payment-success-content">
          <h2>Payment Successful!</h2>
          <p>Your subscription has been activated successfully.</p>
          
          {sessionId && (
            <div className="payment-session-info">
              <span>Session ID: {sessionId}</span>
            </div>
          )}
          
          <div className="payment-success-actions">
            <button className="payment-success-btn" onClick={onClose}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal; 