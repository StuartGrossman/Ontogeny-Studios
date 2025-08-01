import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  X, 
  Calendar, 
  FileText, 
  Target, 
  BarChart3, 
  Users, 
  Plus, 
  Trash2, 
  Check, 
  Clock,
  Link,
  Save,
  AlertCircle,
  Edit3,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  ExternalLink,
  UserPlus,
  Settings,
  MessageCircle,
  CreditCard
} from 'lucide-react';
import ProjectAttributesView from '../ProjectAttributesView';
import PaymentModal from '../PaymentModal';
import SetupSubscriptionModal from './SetupSubscriptionModal';
import '../../styles/ProjectAttributesView.css';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: string;
}

interface ProjectData {
  id: string;
  name: string;
  description: string;
  features: string | any[];
  link?: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  deadline: string;
  tasks: Task[];
  assignedTo: string;
  assignedUserName: string;
  assignedUserEmail: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
  notes?: string;
  assignments?: ProjectAssignment[];
  subscriptionStatus?: string;
  subscriptionSetupAt?: any;
  subscriptionAmount?: number;
  firstPaymentCompleted?: boolean;
  firstPaymentDate?: any;
  lastPaymentDate?: any;
}

interface EditProjectModalProps {
  project: ProjectData;
  onClose: () => void;
  onUpdate: () => void;
  onNavigateToMessages?: (userId: string) => void;
}

interface AdminUser {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  isAdmin?: boolean;
}

interface ProjectAssignment {
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  assignedAt: Date;
}

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAdmin: (admin: AdminUser, title: string) => void;
  currentAssignments: ProjectAssignment[];
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({ isOpen, onClose, onAddAdmin, currentAssignments }) => {
  const [availableAdmins, setAvailableAdmins] = useState<AdminUser[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [adminTitle, setAdminTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableAdmins();
    }
  }, [isOpen, currentAssignments]);

  const fetchAvailableAdmins = async () => {
    setLoading(true);
    try {
      // Try multiple queries to find admins
      let admins: AdminUser[] = [];
      
      // First try: users with isAdmin = true
      try {
        const usersQuery = query(
          collection(db, 'users'),
          where('isAdmin', '==', true)
        );
        const usersSnapshot = await getDocs(usersQuery);
        console.log('Found users with isAdmin=true:', usersSnapshot.docs.length);
        
        admins = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as AdminUser));
      } catch (error) {
        console.log('Query with isAdmin failed, trying role query:', error);
      }
      
      // Second try: users with role = 'admin' (fallback)
      if (admins.length === 0) {
        try {
          const usersQuery = query(
            collection(db, 'users'),
            where('role', '==', 'admin')
          );
          const usersSnapshot = await getDocs(usersQuery);
          console.log('Found users with role=admin:', usersSnapshot.docs.length);
          
          admins = usersSnapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
          } as AdminUser));
        } catch (error) {
          console.log('Query with role also failed:', error);
        }
      }
      
      // Third try: get all users and filter client-side (if no query worked)
      if (admins.length === 0) {
        try {
          const usersSnapshot = await getDocs(collection(db, 'users'));
          console.log('Found all users:', usersSnapshot.docs.length);
          
          admins = usersSnapshot.docs
            .map(doc => ({
              uid: doc.id,
              ...doc.data()
            } as AdminUser))
            .filter(user => user.isAdmin === true || user.role === 'admin');
          
          console.log('Filtered admins from all users:', admins.length);
        } catch (error) {
          console.log('Getting all users also failed:', error);
        }
      }

      console.log('Final admins found:', admins.map(a => ({ uid: a.uid, displayName: a.displayName, email: a.email })));

      // Filter out already assigned admins
      const assignedUserIds = currentAssignments.map(a => a.userId);
      console.log('Already assigned user IDs:', assignedUserIds);
      
      const available = admins.filter(admin => !assignedUserIds.includes(admin.uid));
      
      console.log('Available admins after filtering:', available.map(a => ({ uid: a.uid, displayName: a.displayName })));
      
      setAvailableAdmins(available);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = () => {
    if (selectedAdmin && adminTitle.trim()) {
      onAddAdmin(selectedAdmin, adminTitle.trim());
      setSelectedAdmin(null);
      setAdminTitle('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-admin-modal" onClick={e => e.stopPropagation()}>
        <div className="add-admin-header">
          <h3>Add Team Member</h3>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="add-admin-content">
          {loading ? (
            <div className="loading-state">Loading admins...</div>
          ) : availableAdmins.length === 0 ? (
            <div className="no-admins">
              <Users size={48} />
              <h4>No Available Admins</h4>
              <p>All admins are already assigned to this project.</p>
            </div>
          ) : (
            <>
              <div className="admin-selection">
                <label className="admin-label">Select Admin</label>
                <div className="admin-list">
                  {availableAdmins.map((admin) => (
                    <div
                      key={admin.uid}
                      className={`admin-item ${selectedAdmin?.uid === admin.uid ? 'selected' : ''}`}
                      onClick={() => setSelectedAdmin(admin)}
                    >
                      <div className="admin-avatar">
                        {admin.displayName?.charAt(0) || admin.email.charAt(0)}
                      </div>
                      <div className="admin-info">
                        <div className="admin-name">{admin.displayName || 'Unnamed Admin'}</div>
                        <div className="admin-email">{admin.email}</div>
                      </div>
                      {selectedAdmin?.uid === admin.uid && (
                        <Check size={16} className="admin-check" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedAdmin && (
                <div className="title-input-section">
                  <label className="title-label">Role/Title</label>
                  <input
                    type="text"
                    value={adminTitle}
                    onChange={(e) => setAdminTitle(e.target.value)}
                    placeholder="e.g., Lead Developer, Project Manager, Designer..."
                    className="title-input"
                    autoFocus
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="add-admin-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleAddAdmin}
            disabled={!selectedAdmin || !adminTitle.trim()}
            className="btn-primary"
          >
            <UserPlus size={16} />
            Add to Project
          </button>
        </div>
      </div>
    </div>
  );
};

const DescriptionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  description: string;
  projectName: string;
}> = ({ isOpen, onClose, description, projectName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="description-modal" onClick={e => e.stopPropagation()}>
        <div className="description-modal-header">
          <h3>Project Description</h3>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>
        <div className="description-modal-content">
          <h4>{projectName}</h4>
          <div className="description-text-full">
            {description || 'No description provided for this project.'}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, onClose, onUpdate, onNavigateToMessages }) => {
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    features: project.features || [],
    link: project.link || '',
    status: project.status || 'planning',
    progress: project.progress || 0,
    deadline: project.deadline || '',
    notes: project.notes || '',
    assignments: project.assignments || (project.assignedTo ? [{
      userId: project.assignedTo,
      userName: project.assignedUserName || 'Unknown User',
      userEmail: project.assignedUserEmail || '',
      title: 'Project Owner',
      assignedAt: new Date()
    }] : [])
  });

  const [tasks, setTasks] = useState<Task[]>(project.tasks || []);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{[key: string]: string}>({});
  const [editingFeature, setEditingFeature] = useState<string | null>(null);
  const [tempFeatureTime, setTempFeatureTime] = useState<number>(0);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'project' | 'client-attributes' | 'payment'>('project');

  // Feature addition state
  const [newFeatureText, setNewFeatureText] = useState('');
  const [newFeatureComplexity, setNewFeatureComplexity] = useState<'simple' | 'moderate' | 'complex'>('moderate');
  const [addingFeature, setAddingFeature] = useState(false);

  // Generate task ID
  const generateTaskId = () => {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Get estimated hours based on complexity
  const getEstimatedHours = (complexity: 'simple' | 'moderate' | 'complex'): number => {
    switch (complexity) {
      case 'simple': return 2;
      case 'moderate': return 8;
      case 'complex': return 24;
      default: return 8;
    }
  };

  // Add new feature
  const addFeature = async () => {
    if (!newFeatureText.trim()) return;
    
    setAddingFeature(true);
    setError('');

    try {
      const newFeature = {
        id: generateTaskId(),
        text: newFeatureText.trim(),
        complexity: newFeatureComplexity,
        estimatedHours: getEstimatedHours(newFeatureComplexity),
        completed: false,
        createdAt: new Date()
      };

      const updatedFeatures = [...(Array.isArray(formData.features) ? formData.features : []), newFeature];

      await updateDoc(doc(db, 'projects', project.id), {
        features: updatedFeatures,
        updatedAt: new Date()
      });

      setFormData(prev => ({
        ...prev,
        features: updatedFeatures
      }));

      setNewFeatureText('');
      setNewFeatureComplexity('moderate');
      onUpdate();
    } catch (error) {
      console.error('Error adding feature:', error);
      setError('Failed to add feature. Please try again.');
    } finally {
      setAddingFeature(false);
    }
  };

  // Handle individual field editing
  const startEditing = (field: string) => {
    setEditingField(field);
    setTempValues({ [field]: formData[field as keyof typeof formData]?.toString() || '' });
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValues({});
  };

  const saveField = async (field: string) => {
    if (!tempValues[field]?.trim() && field !== 'link') {
      setError(`${field} cannot be empty`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const updateData = {
        [field]: tempValues[field]?.trim() || '',
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'projects', project.id), updateData);
      
      setFormData(prev => ({
        ...prev,
        [field]: tempValues[field]?.trim() || ''
      }));

      setEditingField(null);
      setTempValues({});
      onUpdate();
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setError(`Failed to update ${field}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle progress change with immediate update
  const handleProgressChange = async (newProgress: number) => {
    const progress = Math.min(100, Math.max(0, newProgress));
    
    // Update UI immediately for better UX
    setFormData(prev => ({ ...prev, progress }));
    
    try {
      await updateDoc(doc(db, 'projects', project.id), {
        progress,
        updatedAt: new Date()
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating progress:', error);
      setError('Failed to update progress');
      // Revert on error
      setFormData(prev => ({ ...prev, progress: project.progress || 0 }));
    }
  };

  // Handle status change with immediate update
  const handleStatusChange = async (newStatus: string) => {
    // Update UI immediately
    setFormData(prev => ({ ...prev, status: newStatus as any }));
    
    try {
      await updateDoc(doc(db, 'projects', project.id), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
      // Revert on error
      setFormData(prev => ({ ...prev, status: project.status }));
    }
  };

  // Handle deadline change with immediate update
  const handleDeadlineChange = async (newDeadline: string) => {
    if (newDeadline && new Date(newDeadline) < new Date()) {
      setError('Deadline cannot be in the past');
      return;
    }

    // Update UI immediately
    setFormData(prev => ({ ...prev, deadline: newDeadline }));
    
    try {
      await updateDoc(doc(db, 'projects', project.id), {
        deadline: newDeadline,
        updatedAt: new Date()
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating deadline:', error);
      setError('Failed to update deadline');
      // Revert on error
      setFormData(prev => ({ ...prev, deadline: project.deadline }));
    }
  };

  // Add new task
  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    const isDuplicate = tasks.some(task => 
      task.title.toLowerCase().trim() === newTaskTitle.toLowerCase().trim()
    );
    
    if (isDuplicate) {
      setError('A task with this title already exists');
      return;
    }

    const newTask: Task = {
      id: generateTaskId(),
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      completed: false,
      createdAt: new Date(),
      dueDate: newTaskDueDate || undefined
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);

    try {
      await updateDoc(doc(db, 'projects', project.id), {
        tasks: updatedTasks,
        updatedAt: new Date()
      });

      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setError('');
      onUpdate();
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task');
      setTasks(tasks); // Revert
    }
  };

  // Remove task
  const removeTask = async (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);

    try {
      await updateDoc(doc(db, 'projects', project.id), {
        tasks: updatedTasks,
        updatedAt: new Date()
      });
      onUpdate();
    } catch (error) {
      console.error('Error removing task:', error);
      setError('Failed to remove task');
      setTasks(tasks); // Revert
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    try {
      await updateDoc(doc(db, 'projects', project.id), {
        tasks: updatedTasks,
        updatedAt: new Date()
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
      setTasks(tasks); // Revert
    }
  };

  // Calculate progress based on completed features
  const calculateProgress = (features: any[]) => {
    if (!features || features.length === 0) return 0;
    const completedFeatures = features.filter(f => f.completed).length;
    return Math.round((completedFeatures / features.length) * 100);
  };

  // Toggle feature completion
  const toggleFeatureCompletion = async (featureId: string) => {
    const updatedFeatures = Array.isArray(formData.features) 
      ? formData.features.map((feature: any) => 
          feature.id === featureId 
            ? { ...feature, completed: !feature.completed }
            : feature
        )
      : [];

    const newProgress = calculateProgress(updatedFeatures);
    
    setFormData(prev => ({ 
      ...prev, 
      features: updatedFeatures,
      progress: newProgress
    }));

    try {
      await updateDoc(doc(db, 'projects', project.id), {
        features: updatedFeatures,
        progress: newProgress,
        updatedAt: new Date()
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating feature:', error);
      setError('Failed to update feature');
    }
  };

  // Start editing feature time
  const startEditingFeature = (featureId: string, currentTime: number) => {
    setEditingFeature(featureId);
    setTempFeatureTime(currentTime);
  };

  // Save feature time
  const saveFeatureTime = async (featureId: string) => {
    const updatedFeatures = Array.isArray(formData.features)
      ? formData.features.map((feature: any) => 
          feature.id === featureId 
            ? { ...feature, estimatedHours: tempFeatureTime }
            : feature
        )
      : [];

    setFormData(prev => ({ ...prev, features: updatedFeatures }));
    setEditingFeature(null);

    try {
      await updateDoc(doc(db, 'projects', project.id), {
        features: updatedFeatures,
        updatedAt: new Date()
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating feature time:', error);
      setError('Failed to update feature time');
    }
  };

  // Cancel editing
  const cancelEditingFeature = () => {
    setEditingFeature(null);
    setTempFeatureTime(0);
  };

  // Delete feature
  const deleteFeature = async (featureId: string) => {
    const updatedFeatures = Array.isArray(formData.features)
      ? formData.features.filter((feature: any) => feature.id !== featureId)
      : [];

    const newProgress = calculateProgress(updatedFeatures);

    setFormData(prev => ({ 
      ...prev, 
      features: updatedFeatures,
      progress: newProgress
    }));

    try {
      await updateDoc(doc(db, 'projects', project.id), {
        features: updatedFeatures,
        progress: newProgress,
        updatedAt: new Date()
      });
      onUpdate();
    } catch (error) {
      console.error('Error deleting feature:', error);
      setError('Failed to delete feature');
    }
  };

  // Get total estimated hours
  const getTotalEstimatedHours = () => {
    if (!Array.isArray(formData.features)) return 0;
    return formData.features.reduce((total: number, feature: any) => 
      total + (feature.estimatedHours || 0), 0
    );
  };

  // Get completed hours
  const getCompletedHours = () => {
    if (!Array.isArray(formData.features)) return 0;
    return formData.features
      .filter((feature: any) => feature.completed)
      .reduce((total: number, feature: any) => total + (feature.estimatedHours || 0), 0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Clock size={16} />;
      case 'in-progress': return <PlayCircle size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'on-hold': return <PauseCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return '#f59e0b';
      case 'in-progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'on-hold': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleAddAdmin = async (admin: AdminUser, title: string) => {
    console.log('Adding admin:', { admin, title });
    
    // Validate admin data
    if (!admin.uid || !admin.email) {
      console.error('Invalid admin data:', admin);
      setError('Invalid admin data');
      return;
    }

    const newAssignment: ProjectAssignment = {
      userId: admin.uid,
      userName: admin.displayName || admin.email || 'Unknown User',
      userEmail: admin.email,
      title: title || 'Team Member',
      assignedAt: new Date()
    };

    console.log('New assignment:', newAssignment);

    const updatedAssignments = [...(formData.assignments || []), newAssignment];
    
    console.log('Updated assignments:', updatedAssignments);
    
    setFormData(prev => ({ ...prev, assignments: updatedAssignments }));

    try {
      // Clean the data to remove any undefined values
      const cleanAssignments = updatedAssignments.map(assignment => ({
        userId: assignment.userId || '',
        userName: assignment.userName || 'Unknown User',
        userEmail: assignment.userEmail || '',
        title: assignment.title || 'Team Member',
        assignedAt: assignment.assignedAt || new Date()
      }));

      const updateData = {
        assignments: cleanAssignments,
        updatedAt: new Date()
      };
      
      console.log('Updating project with cleaned data:', updateData);
      
      await updateDoc(doc(db, 'projects', project.id), updateData);
      onUpdate();
    } catch (error) {
      console.error('Error adding admin:', error);
      setError('Failed to add team member');
    }
  };

  const removeAssignment = async (userId: string) => {
    const updatedAssignments = formData.assignments?.filter(a => a.userId !== userId) || [];
    
    setFormData(prev => ({ ...prev, assignments: updatedAssignments }));

    try {
      await updateDoc(doc(db, 'projects', project.id), {
        assignments: updatedAssignments,
        updatedAt: new Date()
      });
      onUpdate();
    } catch (error) {
      console.error('Error removing assignment:', error);
      setError('Failed to remove team member');
    }
  };

  // Handle notes change with debounced update
  const handleNotesChange = async (newNotes: string) => {
    // Update UI immediately
    setFormData(prev => ({ ...prev, notes: newNotes }));
    
    try {
      await updateDoc(doc(db, 'projects', project.id), {
        notes: newNotes,
        updatedAt: new Date()
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating notes:', error);
      setError('Failed to update notes');
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="feature-focused-modal-expanded" onClick={e => e.stopPropagation()}>
          {/* Simplified Header */}
          <div className="feature-modal-header-simplified">
            <h2 className="project-name-main">{formData.name}</h2>
            <div className="header-actions">
              {formData.link && (
                <a 
                  href={formData.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="project-link-btn"
                  title="Open project link"
                >
                  <ExternalLink size={16} />
                </a>
              )}
              <button onClick={onClose} className="modal-close-fixed">
                <X size={18} />
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button onClick={() => setError('')}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="project-tabs">
            <button
              className={`project-tab ${activeTab === 'project' ? 'active' : ''}`}
              onClick={() => setActiveTab('project')}
            >
              <Target size={16} />
              Project Details
            </button>
            <button
              className={`project-tab ${activeTab === 'client-attributes' ? 'active' : ''}`}
              onClick={() => setActiveTab('client-attributes')}
            >
              <Settings size={16} />
              Client Attributes
            </button>
            <button
              className={`project-tab ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              <CreditCard size={16} />
              Payment
            </button>
          </div>

          {/* Content Area */}
          {activeTab === 'project' ? (
            /* Project Details View */
            <div className="modal-two-column-layout">
            {/* Left Column: Project Information */}
            <div className="left-column-info">
              {/* Description Button */}
              <div className="info-section">
                <h3 className="section-title">Description</h3>
                <button 
                  onClick={() => setShowDescriptionModal(true)}
                  className="description-preview-btn-sidebar"
                  title="View project description"
                >
                  <FileText size={14} />
                  <span className="description-preview">
                    {formData.description ? 
                      `${formData.description.substring(0, 80)}...` : 
                      'Click to view description'
                    }
                  </span>
                </button>
              </div>

              {/* Progress Section */}
              <div className="info-section">
                <h3 className="section-title">Progress</h3>
                <div className="progress-section-sidebar">
                  <div className="progress-header">
                    <span className="progress-value">{formData.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${formData.progress}%` }}
                    />
                  </div>
                  <div className="progress-stats">
                    <div className="stat">
                      <span>{getCompletedHours()}h / {getTotalEstimatedHours()}h</span>
                    </div>
                    <div className="stat">
                      <span>{Array.isArray(formData.features) ? formData.features.filter((f: any) => f.completed).length : 0} / {Array.isArray(formData.features) ? formData.features.length : 0} features</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Assignments */}
              <div className="info-section">
                <h3 className="section-title">Team</h3>
                <div className="project-assignments-sidebar">
                  <div className="assignments-list">
                    {(formData.assignments || []).map((assignment, index) => (
                      <div key={assignment.userId || `assignment-${index}`} className="assignment-item-sidebar">
                        <div className="assignment-avatar">
                          {assignment.userName?.charAt(0) || 'U'}
                        </div>
                        <div className="assignment-info">
                          <span className="assignment-name">{assignment.userName}</span>
                          <span className="assignment-title">{assignment.title}</span>
                        </div>
                        <div className="assignment-actions">
                          {onNavigateToMessages && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToMessages(assignment.userId);
                              }}
                              className="message-assignment"
                              title="Message team member"
                            >
                              <MessageCircle size={12} />
                            </button>
                          )}
                          {formData.assignments && formData.assignments.length > 1 && (
                            <button
                              onClick={() => removeAssignment(assignment.userId)}
                              className="remove-assignment"
                              title="Remove from project"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowAddAdminModal(true)}
                    className="add-admin-btn-sidebar"
                    title="Add team member"
                  >
                    <Plus size={14} />
                    Add Team Member
                  </button>
                </div>
              </div>

              {/* Project Management */}
              <div className="info-section">
                <h3 className="section-title">Project Management</h3>
                <div className="project-management-section">
                  {/* Status Selection */}
                  <div className="status-control">
                    <label className="control-label">Status</label>
                    <div className="status-options">
                      {[
                        { value: 'planning', label: 'Planning', icon: Clock, color: '#f59e0b' },
                        { value: 'in-progress', label: 'In Progress', icon: PlayCircle, color: '#3b82f6' },
                        { value: 'on-hold', label: 'On Hold', icon: PauseCircle, color: '#ef4444' },
                        { value: 'completed', label: 'Completed', icon: CheckCircle, color: '#10b981' }
                      ].map((status) => {
                        const IconComponent = status.icon;
                        return (
                          <button
                            key={status.value}
                            onClick={() => handleStatusChange(status.value)}
                            className={`status-option ${formData.status === status.value ? 'active' : ''}`}
                            style={{ 
                              '--status-color': status.color,
                              borderColor: formData.status === status.value ? status.color : '#e2e8f0'
                            } as any}
                            disabled={isSubmitting}
                          >
                            <IconComponent size={14} />
                            <span>{status.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>



                  {/* Project Notes */}
                  <div className="notes-control">
                    <label className="control-label">Project Notes</label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      className="notes-textarea"
                      placeholder="Add project notes, updates, or important information..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Features & Requirements */}
            <div className="right-column-features">
              <div className="features-main-expanded">
                <div className="features-header">
                  <div className="features-header-content">
                    <h3>Features & Requirements</h3>
                    <span className="features-count">
                      {Array.isArray(formData.features) ? formData.features.length : 0} features
                    </span>
                  </div>
                </div>

                {/* Add Feature Form */}
                <div className="add-feature-form">
                  <div className="feature-input-row">
                    <div className="feature-input-group">
                      <label className="feature-input-label">Feature Description</label>
                      <input
                        type="text"
                        value={newFeatureText}
                        onChange={(e) => setNewFeatureText(e.target.value)}
                        placeholder="Enter feature description..."
                        className="feature-input"
                        disabled={addingFeature}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                    </div>
                    <div className="feature-input-group">
                      <label className="feature-input-label">Time Complexity</label>
                      <select
                        value={newFeatureComplexity}
                        onChange={(e) => setNewFeatureComplexity(e.target.value as 'simple' | 'moderate' | 'complex')}
                        className="complexity-select"
                        disabled={addingFeature}
                      >
                        <option value="simple">Simple (2h)</option>
                        <option value="moderate">Moderate (8h)</option>
                        <option value="complex">Complex (24h)</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={addFeature}
                      disabled={!newFeatureText.trim() || addingFeature}
                      className="add-feature-btn"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                </div>

                <div className="features-list-main">
                  {Array.isArray(formData.features) && formData.features.length > 0 ? (
                    formData.features.map((feature: any, index: number) => (
                      <div 
                        key={feature.id || `feature_${index}_${Date.now()}`} 
                        className={`feature-card ${feature.completed ? 'completed' : ''}`}
                      >
                        {/* Feature Completion Checkbox */}
                        <button
                          onClick={() => toggleFeatureCompletion(feature.id || index.toString())}
                          className="feature-checkbox"
                          disabled={isSubmitting}
                        >
                          {feature.completed && <Check size={16} />}
                        </button>

                        {/* Feature Content */}
                        <div className="feature-content">
                          <div className="feature-text">
                            {feature.text || `Feature ${index + 1}`}
                          </div>
                          
                          {feature.complexity && (
                            <div className={`feature-complexity ${feature.complexity}`}>
                              {feature.complexity === 'simple' && '⚡ Simple'}
                              {feature.complexity === 'moderate' && '⚙️ Moderate'}
                              {feature.complexity === 'complex' && '🔥 Complex'}
                            </div>
                          )}
                        </div>

                        {/* Time Editing */}
                        <div className="feature-time">
                          {editingFeature === (feature.id || index.toString()) ? (
                            <div className="time-edit">
                              <input
                                type="number"
                                value={tempFeatureTime}
                                onChange={(e) => setTempFeatureTime(parseInt(e.target.value) || 0)}
                                className="time-input"
                                min="0"
                                max="200"
                                autoFocus
                              />
                              <span>h</span>
                              <button
                                onClick={() => saveFeatureTime(feature.id || index.toString())}
                                className="save-time"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={cancelEditingFeature}
                                className="cancel-time"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="time-display">
                              <Clock size={14} />
                              <span
                                onClick={() => startEditingFeature(
                                  feature.id || index.toString(), 
                                  feature.estimatedHours || 0
                                )}
                                className="time-value"
                              >
                                {feature.estimatedHours || 0}h
                              </span>
                              <button
                                onClick={() => startEditingFeature(
                                  feature.id || index.toString(), 
                                  feature.estimatedHours || 0
                                )}
                                className="edit-time"
                              >
                                <Edit3 size={12} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Delete Feature */}
                        <button
                          onClick={() => deleteFeature(feature.id || index.toString())}
                          className="delete-feature"
                          disabled={isSubmitting}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-features">
                      <CheckCircle size={48} />
                      <h4>No features defined</h4>
                      <p>This project doesn't have any features listed yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'payment' ? (
          /* Payment View */
          <div className="payment-container">
            <div className="payment-section">
              <div className="payment-header">
                <h3>Project Payment & Subscription</h3>
                <p>Set up monthly membership payments for this project</p>
              </div>
              
              <div className="payment-content">
                <div className="payment-status">
                  <h4>Current Payment Status</h4>
                  <div className="status-card">
                    <div className="status-info">
                      <span className="status-label">Subscription Status:</span>
                      <span className={`status-value ${project.subscriptionStatus === 'active' ? 'active' : 'inactive'}`}>
                        {project.subscriptionStatus || 'Not Set'}
                      </span>
                    </div>
                    <div className="status-info">
                      <span className="status-label">First Payment:</span>
                      <span className="status-value">
                        {project.firstPaymentCompleted ? 
                          (project.firstPaymentDate ? 
                            (() => {
                              try {
                                const date = project.firstPaymentDate.toDate ? 
                                  project.firstPaymentDate.toDate() : 
                                  new Date(project.firstPaymentDate);
                                return date.toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                });
                              } catch (error) {
                                return 'Completed';
                              }
                            })() : 
                            'Completed'
                          ) : 
                          'Pending'
                        }
                      </span>
                    </div>
                    <div className="status-info">
                      <span className="status-label">Last Payment:</span>
                      <span className="status-value">
                        {project.lastPaymentDate ? 
                          (() => {
                            try {
                              const date = project.lastPaymentDate.toDate ? 
                                project.lastPaymentDate.toDate() : 
                                new Date(project.lastPaymentDate);
                              return date.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              });
                            } catch (error) {
                              return 'Not Available';
                            }
                          })() : 
                          'Not Available'
                        }
                      </span>
                    </div>
                    <div className="status-info">
                      <span className="status-label">Amount:</span>
                      <span className="status-value">
                        {project.subscriptionAmount ? 
                          `$${project.subscriptionAmount}/month` : 
                          'Not Set'
                        }
                      </span>
                    </div>
                    {project.firstPaymentCompleted && (
                      <div className="payment-success-badge">
                        <CheckCircle size={16} />
                        <span>First Payment Completed</span>
                      </div>
                    )}
                  </div>
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                      Debug: subscriptionAmount={project.subscriptionAmount}, 
                      subscriptionStatus={project.subscriptionStatus}, 
                      subscriptionSetupAt={project.subscriptionSetupAt ? 'Set' : 'Not Set'}
                    </div>
                  )}
                </div>

                <div className="payment-actions">
                  <h4>Payment Actions</h4>
                  <div className="action-buttons">
                    <button 
                      className="btn-primary"
                      onClick={() => setShowSubscriptionModal(true)}
                    >
                      <CreditCard size={16} />
                      Set Up Subscription
                    </button>
                  </div>
                </div>


              </div>
            </div>
          </div>
        ) : (
          /* Client Attributes View */
          <div className="client-attributes-container">
            <ProjectAttributesView 
              key={`project-attributes-${project.id}`}
              projectId={project.id}
              projectName={formData.name}
              currentUser={(window as any).currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}')}
              onAttributeUpdate={() => {
                // Refresh project data if needed
                onUpdate();
              }}
            />
          </div>
        )}
        </div>
      </div>

      <AddAdminModal
        key={`add-admin-modal-${project.id}`}
        isOpen={showAddAdminModal}
        onClose={() => setShowAddAdminModal(false)}
        onAddAdmin={handleAddAdmin}
        currentAssignments={formData.assignments || []}
      />

      <DescriptionModal
        key={`description-modal-${project.id}`}
        isOpen={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        description={formData.description}
        projectName={formData.name}
      />

      {/* Payment Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        projectId={project.id}
        projectName={formData.name}
        amount={99}
      />

      <SetupSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        projectId={project.id}
        projectName={formData.name}
        onSuccess={() => {
          // Refresh project data to show updated subscription amount
          onUpdate();
        }}
      />
    </>
  );
};

export default EditProjectModal; 