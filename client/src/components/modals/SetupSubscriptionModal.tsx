import React, { useCallback } from 'react';
import { CreditCard, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscriptionForm } from '../../hooks/useSubscriptionForm';
import '../Modal.css';
import '../../styles/SetupSubscriptionModal.css';
import '../../styles/dashboard/variables.css';

interface SetupSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectName?: string;
  onSuccess?: () => void;
}

// Form Input Component
const SubscriptionAmountInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}> = ({ value, onChange, error, disabled }) => {
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="form-group">
      <label htmlFor="subscription-amount" className="form-label">
        Monthly Subscription Amount
      </label>
      <div className="amount-input">
        <span className="currency-symbol" aria-hidden="true">$</span>
        <input
          id="subscription-amount"
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="0.00"
          className={`amount-field ${error ? 'error' : ''}`}
          disabled={disabled}
          aria-describedby={error ? 'amount-error' : undefined}
          aria-label="Monthly subscription amount in dollars"
        />
      </div>
      {error && (
        <div id="amount-error" className="error-message" role="alert">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      <p className="form-help">
        This will be the monthly amount that users can pay for this project
      </p>
    </div>
  );
};

// Confirmation Step Component
const ConfirmationStep: React.FC<{
  projectName?: string;
  amount: number;
  onBack: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  error?: string | null;
}> = ({ projectName, amount, onBack, onConfirm, isLoading, error }) => {
  return (
    <div className="confirmation-step">
      <div className="confirmation-header">
        <CheckCircle size={24} className="confirmation-icon" />
        <h3>Confirm Subscription Amount</h3>
      </div>
      
      <div className="confirmation-details">
        <div className="confirmation-item">
          <span className="label">Project:</span>
          <span className="value">{projectName || 'Unnamed Project'}</span>
        </div>
        <div className="confirmation-item">
          <span className="label">Monthly Amount:</span>
          <span className="value amount">${amount.toFixed(2)}</span>
        </div>
        <div className="confirmation-item">
          <span className="label">Billing Cycle:</span>
          <span className="value">Monthly</span>
        </div>
        <div className="confirmation-item">
          <span className="label">Currency:</span>
          <span className="value">USD</span>
        </div>
      </div>

      <div className="confirmation-notice">
        <p>⚠️ This will set the subscription amount for this project. Users will be able to pay this amount through the project dashboard.</p>
      </div>

      {error && (
        <div className="error-message" role="alert">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};

// Main Modal Component
const SetupSubscriptionModal: React.FC<SetupSubscriptionModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  
  const {
    subscriptionAmount,
    isLoading,
    error,
    showConfirmation,
    confirmedAmount,
    validation,
    isFormValid,
    handleAmountChange,
    handleSubmit,
    handleConfirm,
    handleBack,
    resetForm
  } = useSubscriptionForm({
    projectId,
    projectName,
    userId: currentUser?.uid,
    onSuccess: () => {
      onSuccess?.(); // Call the parent's onSuccess callback
      onClose(); // Close the modal
    },
    onError: (errorMessage) => {
      console.error('Subscription setup error:', errorMessage);
    }
  });

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-labelledby="subscription-modal-title">
      <div className="modal subscription-setup-modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <CreditCard size={24} aria-hidden="true" />
            <div>
              <h2 id="subscription-modal-title">Setup Subscription Amount</h2>
              <p>Set the monthly subscription amount for this project</p>
            </div>
          </div>
          <button 
            className="modal-close" 
            onClick={handleClose}
            aria-label="Close subscription setup modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {projectName && (
            <div className="project-info">
              <h3>Project: {projectName}</h3>
            </div>
          )}

          {!showConfirmation ? (
            <div className="subscription-form">
              <SubscriptionAmountInput
                value={subscriptionAmount}
                onChange={handleAmountChange}
                error={validation.error}
                disabled={isLoading}
              />
            </div>
          ) : (
            <ConfirmationStep
              projectName={projectName}
              amount={confirmedAmount!}
              onBack={handleBack}
              onConfirm={handleConfirm}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>

        <div className="modal-actions">
          {!showConfirmation ? (
            <>
              <button 
                className="button button-secondary" 
                onClick={handleClose}
                disabled={isLoading}
                aria-label="Cancel subscription setup"
              >
                Cancel
              </button>
              <button 
                className="button button-primary"
                onClick={handleSubmit}
                disabled={isLoading || !isFormValid}
                aria-label="Continue to subscription confirmation"
              >
                {isLoading ? (
                  <span className="loading-spinner" aria-hidden="true"></span>
                ) : (
                  <>
                    <Save size={16} aria-hidden="true" />
                    Continue
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button 
                className="button button-secondary" 
                onClick={handleBack}
                disabled={isLoading}
                aria-label="Go back to subscription amount"
              >
                Back
              </button>
              <button 
                className="button button-primary"
                onClick={handleConfirm}
                disabled={isLoading}
                aria-label="Confirm and set subscription amount"
              >
                {isLoading ? (
                  <span className="loading-spinner" aria-hidden="true"></span>
                ) : (
                  <>
                    <CheckCircle size={16} aria-hidden="true" />
                    Confirm & Set Amount
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupSubscriptionModal; 