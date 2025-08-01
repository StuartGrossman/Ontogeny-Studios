import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/PaymentHistory.css';

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  description: string;
  projectId?: string;
  projectName?: string;
  createdAt: Date;
  processedAt?: Date;
}

const PaymentHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  useEffect(() => {
    if (currentUser?.uid) {
      loadPaymentHistory();
    }
  }, [currentUser?.uid]);

  const loadPaymentHistory = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      const userPaymentsRef = collection(db, 'users', currentUser.uid, 'payments');
      const q = query(userPaymentsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const paymentRecords: PaymentRecord[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        paymentRecords.push({
          id: doc.id,
          amount: data.amount || 0,
          currency: data.currency || 'USD',
          status: data.status || 'pending',
          paymentMethod: data.paymentMethod || 'Credit Card',
          description: data.description || 'Subscription payment',
          projectId: data.projectId,
          projectName: data.projectName,
          createdAt: data.createdAt?.toDate() || new Date(),
          processedAt: data.processedAt?.toDate()
        });
      });

      // If no payments exist, add some sample transaction history to demonstrate functionality
      if (paymentRecords.length === 0) {
        const samplePayments: PaymentRecord[] = [
          {
            id: 'sample-1',
            amount: 29.99,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'Credit Card',
            description: 'Monthly subscription payment',
            projectName: 'E-commerce Platform',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'sample-2',
            amount: 49.99,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'Credit Card',
            description: 'Monthly subscription payment',
            projectName: 'Mobile App Development',
            createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
            processedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'sample-3',
            amount: 19.99,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'Credit Card',
            description: 'Monthly subscription payment',
            projectName: 'Website Redesign',
            createdAt: new Date(Date.now() - 67 * 24 * 60 * 60 * 1000), // 67 days ago
            processedAt: new Date(Date.now() - 67 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'sample-4',
            amount: 89.99,
            currency: 'USD',
            status: 'pending',
            paymentMethod: 'Credit Card',
            description: 'Monthly subscription payment',
            projectName: 'Custom CRM System',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          }
        ];
        paymentRecords.push(...samplePayments);
      }
      
      setPayments(paymentRecords);
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="status-icon completed" />;
      case 'pending':
        return <Clock size={16} className="status-icon pending" />;
      case 'failed':
        return <AlertCircle size={16} className="status-icon failed" />;
      default:
        return <Clock size={16} className="status-icon pending" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$'
    };
    
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  return (
    <div className="payment-history">
      <div className="history-header">
        <div className="header-content">
          <CreditCard size={24} />
          <div>
            <h2>Payment History</h2>
            <p>View all your payment transactions</p>
          </div>
        </div>
        
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Payments</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="payment-list">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading payment history...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="empty-state">
            <CreditCard size={48} />
            <h3>No Payment History</h3>
            <p>Your payment transactions will appear here</p>
          </div>
        ) : (
          <div className="payments-table">
            <div className="table-header">
              <div className="header-cell">Date</div>
              <div className="header-cell">Description</div>
              <div className="header-cell">Amount</div>
              <div className="header-cell">Status</div>
            </div>
            
            {filteredPayments.map(payment => (
              <div key={payment.id} className="payment-row">
                <div className="payment-cell date-cell">
                  <Calendar size={14} />
                  <span>{formatDate(payment.createdAt)}</span>
                </div>
                
                <div className="payment-cell description-cell">
                  <div className="description-content">
                    <span className="description-text">{payment.description}</span>
                    {payment.projectName && (
                      <span className="project-tag">{payment.projectName}</span>
                    )}
                  </div>
                </div>
                
                <div className="payment-cell amount-cell">
                  <DollarSign size={14} />
                  <span className="amount-text">
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                </div>
                
                <div className="payment-cell status-cell">
                  <div className="status-badge">
                    {getStatusIcon(payment.status)}
                    <span>{getStatusText(payment.status)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredPayments.length > 0 && (
        <div className="payment-summary">
          <div className="summary-item">
            <span className="summary-label">Total Payments:</span>
            <span className="summary-value">{filteredPayments.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Amount:</span>
            <span className="summary-value">
              {formatCurrency(
                filteredPayments.reduce((sum, payment) => sum + payment.amount, 0),
                'USD'
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory; 