import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Save, Edit, Trash2, Plus, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/PaymentsSection.css';
import SetupSubscriptionModal from './modals/SetupSubscriptionModal';
import PaymentHistory from './PaymentHistory';

interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  projectId?: string;
  projectName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentsSectionProps {
  customerProjects: any[];
  customerProjectsLoading: boolean;
}

const PaymentsSection: React.FC<PaymentsSectionProps> = ({
  customerProjects,
  customerProjectsLoading
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'setup' | 'history'>('setup');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const handleSetupSubscription = (project?: any) => {
    setSelectedProject(project);
    setShowSetupModal(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'setup':
        return (
          <div className="subscription-setup">
            <div className="setup-content">
              <div className="setup-header">
                <h3>Setup Subscription</h3>
                <p>Configure subscription amounts for your projects</p>
              </div>
              
              <div className="project-selection">
                <h4>Select a Project (Optional)</h4>
                <p>Choose a specific project or set up a general subscription</p>
                
                <div className="project-grid">
                  <div 
                    className={`project-option ${!selectedProject ? 'selected' : ''}`}
                    onClick={() => setSelectedProject(null)}
                  >
                    <div className="project-info">
                      <h5>General Subscription</h5>
                      <p>Set up a general subscription amount</p>
                    </div>
                  </div>
                  
                  {customerProjects.map(project => (
                    <div 
                      key={project.id}
                      className={`project-option ${selectedProject?.id === project.id ? 'selected' : ''}`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="project-info">
                        <h5>{project.name || project.projectName}</h5>
                        <p>{project.description || 'No description'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="setup-actions">
                <button 
                  className="dash-btn primary"
                  onClick={() => handleSetupSubscription(selectedProject)}
                >
                  <CreditCard size={16} />
                  Setup Subscription
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'history':
        return <PaymentHistory />;
      
      default:
        return null;
    }
  };

  return (
    <div className="payments-section">
      <div className="section-header">
        <div className="header-content">
          <CreditCard size={24} />
          <div>
            <h2>Payments</h2>
            <p>Setup subscriptions and view payment history</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="payments-tabs">
        <button 
          className={`tab-button ${activeTab === 'setup' ? 'active' : ''}`}
          onClick={() => setActiveTab('setup')}
        >
          <CreditCard size={16} />
          Setup Subscription
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={16} />
          Payment History
        </button>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Setup Subscription Modal */}
      <SetupSubscriptionModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        projectId={selectedProject?.id}
        projectName={selectedProject?.name || selectedProject?.projectName}
      />
    </div>
  );
};

export default PaymentsSection; 