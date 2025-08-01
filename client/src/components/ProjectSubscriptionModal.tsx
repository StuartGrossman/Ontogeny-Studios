import React, { useState, useEffect } from 'react';
import { CreditCard, X, CheckCircle, AlertCircle } from 'lucide-react';
import '../styles/PaymentModal.css';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
}

interface ProjectSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  selectedPlan?: SubscriptionPlan;
}

const ProjectSubscriptionModal: React.FC<ProjectSubscriptionModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  selectedPlan
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(selectedPlan?.id || null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/subscription-plans');
        const plans = await response.json();
        setAvailablePlans(plans);
      } catch (err) {
        setError('Failed to load subscription plans');
      }
    };

    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const handleSubscribe = async () => {
    if (!selectedPlanId) {
      setError('Please select a subscription plan');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          planId: selectedPlanId,
        }),
      });

      const session = await response.json();
      
      if (!response.ok) {
        throw new Error(session.message || 'Failed to create subscription');
      }

      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title-section">
            <CreditCard size={24} />
            <div>
              <h2>Project Subscription</h2>
              <p>Set up subscription for {projectName}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body subscription-modal-body">
          <div className="subscription-plans">
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className={`subscription-plan ${selectedPlanId === plan.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <span className="amount">${plan.price}</span>
                    <span className="period">/{plan.billingPeriod}</span>
                  </div>
                </div>
                <div className="plan-features">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <CheckCircle size={16} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                {selectedPlanId === plan.id && (
                  <div className="selected-indicator">
                    <CheckCircle size={20} />
                    Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="subscription-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button 
            className="btn-secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="btn-primary"
            onClick={handleSubscribe}
            disabled={isLoading || !selectedPlanId}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <CreditCard size={16} />
                Subscribe Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSubscriptionModal; 