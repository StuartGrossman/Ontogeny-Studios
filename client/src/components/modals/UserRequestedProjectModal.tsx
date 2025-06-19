import React, { useState } from 'react';
import { X, CheckCircle, Circle, Clock, User, Calendar, Target, MessageSquare, AlertCircle, Check, Play, FileText, Activity, Edit3 } from 'lucide-react';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';

interface Feature {
  id: number;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  startedAt?: Date | null;
  completedAt?: Date | null;
  workLog?: string;
}

interface WorkLogEntry {
  id: string;
  featureId: number;
  timestamp: Date;
  action: 'started' | 'completed' | 'updated' | 'note';
  description: string;
  adminId: string;
  adminName: string;
}

interface UserRequestedProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onUpdate: () => void;
  currentUser?: any;
  onOpenAdminProject?: (adminProjectId: string) => void;
}

const UserRequestedProjectModal: React.FC<UserRequestedProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdate,
  currentUser,
  onOpenAdminProject
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingFeature, setUpdatingFeature] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [acceptingProject, setAcceptingProject] = useState(false);
  const [workLogs, setWorkLogs] = useState<WorkLogEntry[]>([]);
  
  const [features, setFeatures] = useState(() => {
    if (!project?.features) return [];
    
    try {
      // Parse features from string format with better error handling
      const featuresText = project.features;
      const lines = featuresText.split('\n').filter((line: string) => line.trim());
      
      return lines.map((line: string, index: number) => {
        const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
        // Check if feature is marked as completed (has ✓ or [x])
        const isCompleted = /^(\[x\]|\✓)/.test(cleanLine);
        const text = cleanLine.replace(/^(\[x\]|\✓|\[ \])\s*/, '');
        
        return {
          id: index,
          text: text || `Feature ${index + 1}`, // Fallback text
          completed: isCompleted,
          priority: determinePriority(text),
          startedAt: null,
          completedAt: isCompleted ? new Date() : null,
          workLog: ''
        };
      });
    } catch (error) {
      console.error('Error parsing features:', error);
      return [];
    }
  });

  const [notes, setNotes] = useState(project?.adminNotes || '');

  if (!isOpen || !project) return null;

  const determinePriority = (text: string): 'high' | 'medium' | 'low' => {
    const highKeywords = ['critical', 'urgent', 'security', 'authentication', 'payment', 'core'];
    const mediumKeywords = ['dashboard', 'interface', 'user', 'management', 'integration'];
    
    const lowerText = text.toLowerCase();
    if (highKeywords.some(keyword => lowerText.includes(keyword))) return 'high';
    if (mediumKeywords.some(keyword => lowerText.includes(keyword))) return 'medium';
    return 'low';
  };

  const toggleFeatureCompletion = async (featureId: number) => {
    if (updatingFeature === featureId) return; // Prevent double-clicks
    
    setUpdatingFeature(featureId);
    setError('');
    
    const updatedFeatures = features.map((feature: Feature) =>
      feature.id === featureId ? { ...feature, completed: !feature.completed } : feature
    );
    
    // Optimistic update
    setFeatures(updatedFeatures);

    // Calculate new progress
    const completedCount = updatedFeatures.filter((f: Feature) => f.completed).length;
    const progress = Math.round((completedCount / updatedFeatures.length) * 100);

    try {
      // Update project with new feature status and progress
      const featuresString = updatedFeatures.map((f: Feature) => 
        `${f.completed ? '✓' : '[ ]'} ${f.text}`
      ).join('\n');

      // Determine new status based on progress
      let newStatus = project.status;
      if (progress === 100) {
        newStatus = 'completed';
      } else if (progress > 0 && project.status === 'pending') {
        newStatus = 'in-progress';
      }

      await updateDoc(doc(db, 'user_project_requests', project.id), {
        features: featuresString,
        progress,
        status: newStatus,
        lastUpdated: new Date()
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating feature status:', error);
      setError('Failed to update feature status. Please try again.');
      // Revert optimistic update on error
      setFeatures(features);
    } finally {
      setUpdatingFeature(null);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      await updateDoc(doc(db, 'user_project_requests', project.id), {
        status: newStatus,
        lastUpdated: new Date()
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveNotes = async () => {
    try {
      await updateDoc(doc(db, 'user_project_requests', project.id), {
        adminNotes: notes,
        lastUpdated: new Date()
      });
      onUpdate();
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const acceptProject = async () => {
    if (!currentUser) {
      setError('You must be logged in to accept projects');
      return;
    }

    try {
      setAcceptingProject(true);
      setError('');

      // Create admin project
      const adminProjectData = {
        name: project.projectName || project.name,
        description: project.description,
        assignedTo: [project.requestedBy],
        assignedToNames: [project.requestedByName || 'Unknown User'],
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        createdAt: new Date(),
        status: 'in-progress',
        priority: project.priority,
        progress: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        features: features.map((f: Feature) => ({
          id: f.id,
          text: f.text,
          priority: f.priority,
          completed: false,
          startedAt: null,
          completedAt: null,
          workLog: '',
          estimatedHours: getEstimatedHours(f.text, f.priority),
          actualHours: 0
        })),
        tasks: features.map((f: Feature) => ({
          id: `task_${f.id}`,
          title: f.text,
          description: `Implement: ${f.text}`,
          completed: false,
          priority: f.priority,
          createdAt: new Date(),
          assignedTo: currentUser.uid,
          assignedToName: currentUser.displayName || currentUser.email
        })),
        originalRequestId: project.id,
        workLogs: [],
        totalEstimatedHours: features.reduce((total: number, f: Feature) => total + getEstimatedHours(f.text, f.priority), 0),
        totalActualHours: 0,
        milestones: generateMilestones(features),
        lastUpdated: new Date()
      };

      // Add to admin_projects collection
      const adminProjectRef = await addDoc(collection(db, 'admin_projects'), adminProjectData);

      // Update original request status to accepted
      await updateDoc(doc(db, 'user_project_requests', project.id), {
        status: 'accepted',
        acceptedAt: new Date(),
        acceptedBy: currentUser.uid,
        acceptedByName: currentUser.displayName || currentUser.email,
        adminProjectId: adminProjectRef.id,
        lastUpdated: new Date()
      });

      // Create initial work log entry
      const initialWorkLog: WorkLogEntry = {
        id: `log_${Date.now()}`,
        featureId: -1, // -1 for project-level logs
        timestamp: new Date(),
        action: 'started',
        description: `Project accepted and development started by ${currentUser.displayName || currentUser.email}`,
        adminId: currentUser.uid,
        adminName: currentUser.displayName || currentUser.email
      };

      // Add work log to admin project
      await updateDoc(doc(db, 'admin_projects', adminProjectRef.id), {
        workLogs: [initialWorkLog]
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error accepting project:', error);
      setError('Failed to accept project. Please try again.');
    } finally {
      setAcceptingProject(false);
    }
  };

  const getEstimatedHours = (featureText: string, priority: 'high' | 'medium' | 'low'): number => {
    const baseHours = {
      high: 8,
      medium: 5,
      low: 3
    };

    const complexityMultiplier = getComplexityMultiplier(featureText);
    return Math.round(baseHours[priority] * complexityMultiplier);
  };

  const getComplexityMultiplier = (text: string): number => {
    const lowerText = text.toLowerCase();
    const complexKeywords = ['integration', 'api', 'database', 'authentication', 'payment', 'real-time', 'advanced'];
    const simpleKeywords = ['button', 'text', 'color', 'layout', 'simple', 'basic'];
    
    if (complexKeywords.some(keyword => lowerText.includes(keyword))) return 1.5;
    if (simpleKeywords.some(keyword => lowerText.includes(keyword))) return 0.7;
    return 1;
  };

  const generateMilestones = (features: Feature[]) => {
    const highPriorityFeatures = features.filter(f => f.priority === 'high');
    const mediumPriorityFeatures = features.filter(f => f.priority === 'medium');
    const lowPriorityFeatures = features.filter(f => f.priority === 'low');

    const milestones = [];
    
    if (highPriorityFeatures.length > 0) {
      milestones.push({
        id: 'milestone_1',
        title: 'Core Features Complete',
        description: 'All high-priority features implemented',
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        completed: false,
        features: highPriorityFeatures.map(f => f.id)
      });
    }

    if (mediumPriorityFeatures.length > 0) {
      milestones.push({
        id: 'milestone_2',
        title: 'Enhanced Features Complete',
        description: 'All medium-priority features implemented',
        targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
        completed: false,
        features: mediumPriorityFeatures.map(f => f.id)
      });
    }

    if (lowPriorityFeatures.length > 0) {
      milestones.push({
        id: 'milestone_3',
        title: 'Polish & Optimization Complete',
        description: 'All remaining features and optimizations',
        targetDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 4 weeks
        completed: false,
        features: lowPriorityFeatures.map(f => f.id)
      });
    }

    return milestones;
  };

  const completedFeatures = features.filter((f: Feature) => f.completed).length;
  const totalFeatures = features.length;
  const progressPercentage = totalFeatures > 0 ? Math.round((completedFeatures / totalFeatures) * 100) : 0;
  const isAccepted = project.status === 'accepted' || project.status === 'approved';
  const hasAdminProject = project.adminProjectId;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'under-review': return '#3b82f6';
      case 'approved': 
      case 'accepted': return '#10b981';
      case 'in-progress': return '#8b5cf6';
      case 'completed': return '#059669';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-requested-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{project.projectName || project.name}</h2>
            <div className="project-meta">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(project.status) }}
              >
                {project.status === 'accepted' ? '✅ ACCEPTED' : project.status.replace('-', ' ').toUpperCase()}
              </span>
              <span 
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(project.priority) }}
              >
                {project.priority} priority
              </span>
            </div>
          </div>
          <button 
            className="modal-close-btn"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* Error Display */}
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Enhanced Status Section for Accepted Projects */}
          {isAccepted && (
            <div className="accepted-project-notice">
              <div className="accepted-header">
                <CheckCircle size={24} className="accepted-icon" />
                <div className="accepted-content">
                  <h3>🎉 Project Accepted!</h3>
                  <p>Your project has been approved and is now in active development. Track progress below.</p>
                </div>
              </div>
              
              {/* Progress Bar for Accepted Projects */}
              <div className="accepted-progress-section">
                <div className="progress-header">
                  <span className="progress-label">Development Progress</span>
                  <span className="progress-percentage">{progressPercentage}%</span>
                </div>
                <div className="progress-bar-large">
                  <div 
                    className="progress-fill-large"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="progress-stats">
                  <span>{completedFeatures} of {features.length} features completed</span>
                  {progressPercentage === 100 && (
                    <span className="completion-badge">🚀 Ready for Deployment!</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Project Overview */}
          <div className="project-overview">
            <div className="overview-item">
              <User size={16} />
              <span>Requested by: {project.requestedByName || project.requestedBy}</span>
            </div>
            <div className="overview-item">
              <Calendar size={16} />
              <span>
                Requested: {project.createdAt?.seconds 
                  ? new Date(project.createdAt.seconds * 1000).toLocaleDateString()
                  : new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
            {project.lastUpdated && (
              <div className="overview-item">
                <Clock size={16} />
                <span>
                  Last Updated: {project.lastUpdated?.seconds 
                    ? new Date(project.lastUpdated.seconds * 1000).toLocaleDateString()
                    : new Date(project.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            )}
            {!isAccepted && (
              <div className="overview-item">
                <Target size={16} />
                <span>Priority: {project.priority}</span>
              </div>
            )}
          </div>

          {/* Progress Section for Non-Accepted Projects */}
          {!isAccepted && (
            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="progress-text">{progressPercentage}%</span>
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div className="description-section">
              <h3>Project Description</h3>
              <p>{project.description}</p>
            </div>
          )}

          {/* Features List */}
          <div className="features-section">
            <h3>Features & Requirements</h3>
            <div className="features-list">
              {features.map((feature: Feature) => (
                <div 
                  key={feature.id} 
                  className={`feature-item ${feature.completed ? 'completed' : ''} ${updatingFeature === feature.id ? 'updating' : ''}`}
                  onClick={() => toggleFeatureCompletion(feature.id)}
                >
                  <div className="feature-checkbox">
                    {updatingFeature === feature.id ? (
                      <div className="loading-spinner" />
                    ) : feature.completed ? (
                      <CheckCircle size={18} className="check-icon completed" />
                    ) : (
                      <Circle size={18} className="check-icon" />
                    )}
                  </div>
                  <div className="feature-content">
                    <span className="feature-text">{feature.text}</span>
                    <span 
                      className="feature-priority" 
                      style={{ color: getPriorityColor(feature.priority) }}
                    >
                      {feature.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Actions */}
          <div className="status-actions">
            <h3>Project Management</h3>
            
            {/* Accept Project Button (only show if pending/under-review) */}
            {(project.status === 'pending' || project.status === 'under-review') && (
              <div className="accept-project-section">
                <button 
                  className="accept-project-btn"
                  onClick={acceptProject}
                  disabled={acceptingProject}
                >
                  {acceptingProject ? (
                    <>
                      <div className="loading-spinner" />
                      Accepting Project...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Accept Project & Start Development
                    </>
                  )}
                </button>
                <p className="accept-description">
                  This will create a new admin project with detailed tracking, convert features to tasks, 
                  and notify the user that development has started.
                </p>
              </div>
            )}

            {/* Status Update Buttons */}
            <div className="status-buttons">
              <button 
                className={`status-btn ${project.status === 'pending' ? 'active' : ''}`}
                onClick={() => updateStatus('pending')}
                disabled={updatingStatus}
              >
                <Clock size={16} />
                Pending
              </button>
              <button 
                className={`status-btn ${project.status === 'under-review' ? 'active' : ''}`}
                onClick={() => updateStatus('under-review')}
                disabled={updatingStatus}
              >
                <MessageSquare size={16} />
                Under Review
              </button>
              <button 
                className={`status-btn ${project.status === 'in-progress' ? 'active' : ''}`}
                onClick={() => updateStatus('in-progress')}
                disabled={updatingStatus}
              >
                <Target size={16} />
                In Progress
              </button>
              <button 
                className={`status-btn ${project.status === 'accepted' ? 'active' : ''}`}
                onClick={() => updateStatus('accepted')}
                disabled={updatingStatus}
              >
                <CheckCircle size={16} />
                Accepted
              </button>
              <button 
                className={`status-btn ${project.status === 'completed' ? 'active' : ''}`}
                onClick={() => updateStatus('completed')}
                disabled={updatingStatus}
              >
                <CheckCircle size={16} />
                Completed
              </button>
              <button 
                className={`status-btn reject ${project.status === 'rejected' ? 'active' : ''}`}
                onClick={() => updateStatus('rejected')}
                disabled={updatingStatus}
              >
                <X size={16} />
                Rejected
              </button>
            </div>
          </div>

          {/* Project Timeline (show if accepted) */}
          {project.status === 'accepted' && project.acceptedAt && (
            <div className="timeline-section">
              <h3>Project Timeline</h3>
              <div className="timeline-item">
                <div className="timeline-icon accepted">
                  <Check size={16} />
                </div>
                <div className="timeline-content">
                  <h4>Project Accepted</h4>
                  <p>Accepted by {project.acceptedByName || 'Admin'}</p>
                  <span className="timeline-date">
                    {new Date(project.acceptedAt.seconds * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
              {project.adminProjectId && (
                <div className="timeline-item">
                  <div className="timeline-icon in-progress">
                    <Play size={16} />
                  </div>
                  <div className="timeline-content">
                    <h4>Development Started</h4>
                    <p>Admin project created with ID: {project.adminProjectId.slice(-8)}</p>
                    <span className="timeline-date">
                      {new Date(project.acceptedAt.seconds * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Enhanced Project Management */}
              <div className="admin-project-link">
                <div className="enhanced-project-notice">
                  <Activity size={20} />
                  <div className="notice-content">
                    <h4>Enhanced Project Management Available</h4>
                    <p>This project has been converted to an admin project with detailed task tracking, progress monitoring, and advanced features.</p>
                    <div className="admin-project-actions">
                      <button 
                        className="view-admin-project-btn"
                        onClick={() => {
                          onClose();
                          // The parent component should handle opening the admin project
                          if (project.adminProjectId) {
                            // Signal to parent to open admin project
                            console.log('Opening admin project:', project.adminProjectId);
                            onOpenAdminProject?.(project.adminProjectId);
                          }
                        }}
                      >
                        <FileText size={16} />
                        View Enhanced Project Details
                      </button>
                      <button 
                        className="edit-progression-btn"
                        onClick={() => {
                          onClose();
                          if (project.adminProjectId) {
                            onOpenAdminProject?.(project.adminProjectId);
                          }
                        }}
                      >
                        <Edit3 size={16} />
                        Edit Feature Progression
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div className="notes-section">
            <h3>Admin Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this project..."
              className="notes-textarea"
              rows={4}
            />
            <button className="save-notes-btn" onClick={saveNotes}>
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRequestedProjectModal; 