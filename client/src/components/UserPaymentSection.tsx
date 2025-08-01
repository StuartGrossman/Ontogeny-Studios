import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/UserPaymentSection.css';

interface Project {
  id: string;
  name?: string;
  projectName?: string;
  description?: string;
  status: string;
  subscriptionAmount?: number;
  subscriptionCurrency?: string;
  subscriptionStatus?: string;
  subscriptionSetupAt?: Date;
}

interface UserPaymentSectionProps {
  customerProjects: Project[];
  customerProjectsLoading: boolean;
}

const UserPaymentSection: React.FC<UserPaymentSectionProps> = ({
  customerProjects,
  customerProjectsLoading
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter projects that have subscription amounts set
  const projectsWithSubscriptions = customerProjects.filter(
    project => project.subscriptionAmount && project.subscriptionAmount > 0
  );

  const handlePayment = async (project: Project) => {
    if (!currentUser?.uid || !project.subscriptionAmount) {
      setError('Missing payment information');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Create checkout session on the server
      const response = await fetch('http://localhost:3002/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: project.subscriptionAmount,
          currency: project.subscriptionCurrency || 'usd',
          projectId: project.id,
          projectName: project.name || project.projectName,
          userId: currentUser.uid,
          userEmail: currentUser.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error('No checkout URL received');
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };



  if (customerProjectsLoading) {
    return (
      <div className="user-payment-section">
        <div className="loading-state">
          <Loader className="spinning" size={24} />
          <p>Loading payment information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-payment-section">
      <div className="payment-header">
        <h3>Project Subscriptions</h3>
        <p>Pay for your active project subscriptions</p>
      </div>

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

      {projectsWithSubscriptions.length === 0 ? (
        <div className="no-subscriptions">
          <CreditCard size={48} />
          <h4>No Active Subscriptions</h4>
          <p>You don't have any projects with active subscriptions yet.</p>
        </div>
      ) : (
        <div className="subscriptions-list">
          {projectsWithSubscriptions.map((project) => (
            <div key={project.id} className="subscription-card">
              <div className="subscription-info">
                <h4>{project.name || project.projectName}</h4>
                <p>{project.description || 'No description'}</p>
                <div className="subscription-details">
                  <span className="amount">
                    ${project.subscriptionAmount}/month
                  </span>
                  <span className="status">
                    {project.subscriptionStatus === 'active' ? 'Active' : 'Pending'}
                  </span>
                </div>
              </div>
              
              <div className="subscription-actions">
                <button
                  className="payment-btn"
                  onClick={() => handlePayment(project)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="spinning" size={16} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Pay Now
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPaymentSection; 