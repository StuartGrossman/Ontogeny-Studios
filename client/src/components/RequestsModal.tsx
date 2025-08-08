import React, { useState, useEffect } from 'react';
import { X, MessageCircle, GitPullRequest, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/RequestsModal.css';

interface RequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

interface ProjectRequest {
  id: string;
  projectName: string;
  description: string;
  requestedBy: string;
  requestedByName: string;
  requestedByEmail: string;
  status: 'pending' | 'under-review' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
}

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  requestedByName: string;
  requestedByEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
}

const RequestsModal: React.FC<RequestsModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'features'>('projects');
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser?.uid) {
      loadRequests();
    }
  }, [isOpen, currentUser?.uid]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Load project requests
      const projectRequestsQuery = query(
        collection(db, 'user_project_requests'),
        where('status', 'in', ['pending', 'under-review']),
        orderBy('createdAt', 'desc')
      );
      
      const projectRequestsSnapshot = await getDocs(projectRequestsQuery);
      const projects = projectRequestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt
      })) as ProjectRequest[];
      
      setProjectRequests(projects);

      // Load feature requests for this user or their projects, ordered by requestedAt when available
      let featureRequestsSnapshot;
      try {
        const featureRequestsQuery = query(
          collection(db, 'feature_requests'),
          where('requestedBy', '==', currentUser.uid),
          orderBy('requestedAt', 'desc')
        );
        featureRequestsSnapshot = await getDocs(featureRequestsQuery);
      } catch (e) {
        // Fallback without orderBy if index/rules cause issues
        const featureRequestsQuery = query(
          collection(db, 'feature_requests'),
          where('requestedBy', '==', currentUser.uid)
        );
        featureRequestsSnapshot = await getDocs(featureRequestsQuery);
      }
      const features = featureRequestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt) ||
                   (doc.data().requestedAt?.toDate ? doc.data().requestedAt.toDate() : doc.data().requestedAt),
        updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt
      })) as FeatureRequest[];
      
      setFeatureRequests(features);

    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="status-icon pending" />;
      case 'approved':
      case 'under-review':
        return <CheckCircle size={16} className="status-icon approved" />;
      case 'rejected':
        return <AlertCircle size={16} className="status-icon rejected" />;
      default:
        return <Clock size={16} className="status-icon pending" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
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

  if (!isOpen) return null;

  return (
    <div className="requests-modal-overlay" onClick={onClose}>
      <div className="requests-modal" onClick={(e) => e.stopPropagation()}>
        <div className="requests-modal-header">
          <div className="requests-modal-title">
            <MessageCircle size={24} />
            <div>
              <h2>Requests</h2>
              <p>Project and feature requests</p>
            </div>
          </div>
          <button className="requests-modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="requests-modal-tabs">
          <button 
            className={`requests-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <GitPullRequest size={16} />
            Project Requests ({projectRequests.length})
          </button>
          <button 
            className={`requests-tab-btn ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            <MessageCircle size={16} />
            Feature Requests ({featureRequests.length})
          </button>
        </div>

        <div className="requests-modal-content">
          {loading ? (
            <div className="requests-loading">
              <div className="loading-spinner"></div>
              <p>Loading requests...</p>
            </div>
          ) : (
            <>
              {activeTab === 'projects' && (
                <div className="requests-tab">
                  <div className="requests-tab-header">
                    <h3>Project Requests</h3>
                    <p>Pending and under review project requests</p>
                  </div>
                  
                  <div className="requests-grid">
                    {projectRequests.length > 0 ? (
                      projectRequests.map((request) => (
                        <div key={request.id} className={`request-card ${request.status}`}>
                          <div className="request-header">
                            <div className="request-info">
                              <h4>{request.projectName}</h4>
                              <div className="request-meta">
                                <span className="requested-by">
                                  <User size={14} />
                                  {request.requestedByName || request.requestedByEmail}
                                </span>
                                <span className="request-date">
                                  {formatDate(request.createdAt)}
                                </span>
                              </div>
                            </div>
                            <div className="request-status">
                              {getStatusIcon(request.status)}
                              <span className={`status-text ${request.status}`}>
                                {request.status.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                          <p className="request-description">{request.description}</p>
                          <div className="request-meta-footer">
                            <span className={`priority-badge ${getPriorityColor(request.priority)}`}>
                              {request.priority} priority
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="requests-empty">
                        <MessageCircle size={48} />
                        <h4>No Project Requests</h4>
                        <p>There are no pending project requests at the moment.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="requests-tab">
                  <div className="requests-tab-header">
                    <h3>Feature Requests</h3>
                    <p>Pending feature requests</p>
                  </div>
                  
                  <div className="requests-grid">
                    {featureRequests.length > 0 ? (
                      featureRequests.map((request) => (
                        <div key={request.id} className={`request-card ${request.status}`}>
                          <div className="request-header">
                            <div className="request-info">
                              <h4>{request.title}</h4>
                              <div className="request-meta">
                                <span className="requested-by">
                                  <User size={14} />
                                  {request.requestedByName || request.requestedByEmail}
                                </span>
                                <span className="request-date">
                                  {formatDate(request.createdAt)}
                                </span>
                              </div>
                            </div>
                            <div className="request-status">
                              {getStatusIcon(request.status)}
                              <span className={`status-text ${request.status}`}>
                                {request.status.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                          <p className="request-description">{request.description}</p>
                          <div className="request-meta-footer">
                            <span className={`priority-badge ${getPriorityColor(request.priority)}`}>
                              {request.priority} priority
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="requests-empty">
                        <MessageCircle size={48} />
                        <h4>No Feature Requests</h4>
                        <p>There are no pending feature requests at the moment.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsModal; 