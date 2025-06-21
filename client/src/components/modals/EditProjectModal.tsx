import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
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
  PauseCircle
} from 'lucide-react';

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
  features: string;
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
}

interface EditProjectModalProps {
  project: ProjectData;
  onClose: () => void;
  onUpdate: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    features: project.features || '',
    link: project.link || '',
    status: project.status || 'planning',
    progress: project.progress || 0,
    deadline: project.deadline || ''
  });

  const [tasks, setTasks] = useState<Task[]>(project.tasks || []);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{[key: string]: string}>({});

  // Generate task ID
  const generateTaskId = () => {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-project-modal-new" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-new">
          <div className="project-header-info">
            <div className="project-title-section">
              <Target className="project-icon" />
              <h1 className="project-title">{formData.name}</h1>
            </div>
            <div className="project-meta">
              <div className="assigned-user">
                <Users size={16} />
                <span>{project.assignedUserName}</span>
              </div>
              <div className="project-status" style={{ color: getStatusColor(formData.status) }}>
                {getStatusIcon(formData.status)}
                <span>{formData.status.replace('-', ' ').toUpperCase()}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="close-btn-new">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => setError('')} className="error-close">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="modal-content-new">
          {/* Progress Overview */}
          <div className="progress-overview">
            <div className="progress-header">
              <h3>Project Progress</h3>
              <span className="progress-percentage">{formData.progress}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-new">
                <div 
                  className="progress-fill-new" 
                  style={{ width: `${formData.progress}%` }}
                />
              </div>
                              <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => {
                    const newProgress = parseInt(e.target.value);
                    setFormData(prev => ({ ...prev, progress: newProgress }));
                  }}
                  onMouseUp={(e) => {
                    const newProgress = parseInt((e.target as HTMLInputElement).value);
                    handleProgressChange(newProgress);
                  }}
                  onTouchEnd={(e) => {
                    const newProgress = parseInt((e.target as HTMLInputElement).value);
                    handleProgressChange(newProgress);
                  }}
                  className="progress-slider"
                  disabled={isSubmitting}
                />
            </div>
            <div className="progress-stats">
              <div className="stat">
                <span className="stat-label">Completed Tasks</span>
                <span className="stat-value">{tasks.filter(t => t.completed).length} / {tasks.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Status</span>
                <select
                  value={formData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="status-select"
                  disabled={isSubmitting}
                >
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              <div className="stat">
                <span className="stat-label">Deadline</span>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleDeadlineChange(e.target.value)}
                  className="deadline-input"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="fields-grid">
            {/* Project Name */}
            <div className="field-card">
              <div className="field-header">
                <Target size={18} />
                <h4>Project Name</h4>
                {editingField !== 'name' && (
                  <button 
                    onClick={() => startEditing('name')} 
                    className="edit-btn"
                    disabled={isSubmitting}
                  >
                    <Edit3 size={14} />
                  </button>
                )}
              </div>
              {editingField === 'name' ? (
                <div className="edit-field">
                  <input
                    type="text"
                    value={tempValues.name || ''}
                    onChange={(e) => setTempValues({ ...tempValues, name: e.target.value })}
                    className="field-input"
                    placeholder="Enter project name..."
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button onClick={() => saveField('name')} className="save-btn" disabled={isSubmitting}>
                      <Check size={14} />
                    </button>
                    <button onClick={cancelEditing} className="cancel-btn" disabled={isSubmitting}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="field-content">{formData.name || 'No name set'}</p>
              )}
            </div>

            {/* Description */}
            <div className="field-card">
              <div className="field-header">
                <FileText size={18} />
                <h4>Description</h4>
                {editingField !== 'description' && (
                  <button 
                    onClick={() => startEditing('description')} 
                    className="edit-btn"
                    disabled={isSubmitting}
                  >
                    <Edit3 size={14} />
                  </button>
                )}
              </div>
              {editingField === 'description' ? (
                <div className="edit-field">
                  <textarea
                    value={tempValues.description || ''}
                    onChange={(e) => setTempValues({ ...tempValues, description: e.target.value })}
                    className="field-textarea"
                    placeholder="Describe the project goals and objectives..."
                    rows={3}
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button onClick={() => saveField('description')} className="save-btn" disabled={isSubmitting}>
                      <Check size={14} />
                    </button>
                    <button onClick={cancelEditing} className="cancel-btn" disabled={isSubmitting}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="field-content">{formData.description || 'No description set'}</p>
              )}
            </div>

            {/* Features */}
            <div className="field-card">
              <div className="field-header">
                <BarChart3 size={18} />
                <h4>Features & Requirements</h4>
                {editingField !== 'features' && (
                  <button 
                    onClick={() => startEditing('features')} 
                    className="edit-btn"
                    disabled={isSubmitting}
                  >
                    <Edit3 size={14} />
                  </button>
                )}
              </div>
              {editingField === 'features' ? (
                <div className="edit-field">
                  <textarea
                    value={tempValues.features || ''}
                    onChange={(e) => setTempValues({ ...tempValues, features: e.target.value })}
                    className="field-textarea"
                    placeholder="List the key features and requirements..."
                    rows={4}
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button onClick={() => saveField('features')} className="save-btn" disabled={isSubmitting}>
                      <Check size={14} />
                    </button>
                    <button onClick={cancelEditing} className="cancel-btn" disabled={isSubmitting}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="field-content">{formData.features || 'No features specified'}</p>
              )}
            </div>

            {/* Project Link */}
            <div className="field-card">
              <div className="field-header">
                <Link size={18} />
                <h4>Project Link</h4>
                {editingField !== 'link' && (
                  <button 
                    onClick={() => startEditing('link')} 
                    className="edit-btn"
                    disabled={isSubmitting}
                  >
                    <Edit3 size={14} />
                  </button>
                )}
              </div>
              {editingField === 'link' ? (
                <div className="edit-field">
                  <input
                    type="url"
                    value={tempValues.link || ''}
                    onChange={(e) => setTempValues({ ...tempValues, link: e.target.value })}
                    className="field-input"
                    placeholder="https://..."
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button onClick={() => saveField('link')} className="save-btn" disabled={isSubmitting}>
                      <Check size={14} />
                    </button>
                    <button onClick={cancelEditing} className="cancel-btn" disabled={isSubmitting}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="field-content">
                  {formData.link ? (
                    <a href={formData.link} target="_blank" rel="noopener noreferrer" className="project-link">
                      {formData.link}
                    </a>
                  ) : (
                    'No link set'
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Tasks Section */}
          <div className="tasks-section">
            <div className="tasks-header">
              <h3>Tasks ({tasks.length})</h3>
            </div>

            {/* Add New Task */}
            <div className="add-task-form">
              <div className="task-inputs">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  className="task-title-input"
                />
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="task-date-input"
                />
                <button
                  onClick={addTask}
                  className="add-task-btn-new"
                  disabled={!newTaskTitle.trim() || isSubmitting}
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
              {newTaskTitle && (
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Task description (optional)..."
                  className="task-description-input"
                  rows={2}
                />
              )}
            </div>

            {/* Tasks List */}
            <div className="tasks-list-new">
              {tasks.map((task) => (
                <div key={task.id} className={`task-item-new ${task.completed ? 'completed' : ''}`}>
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className="task-checkbox-new"
                    disabled={isSubmitting}
                  >
                    {task.completed && <Check size={14} />}
                  </button>
                  <div className="task-content-new">
                    <div className="task-title-new">{task.title}</div>
                    {task.description && (
                      <div className="task-description-new">{task.description}</div>
                    )}
                    {task.dueDate && (
                      <div className="task-due-date-new">
                        <Calendar size={12} />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="remove-task-btn-new"
                    disabled={isSubmitting}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              
              {tasks.length === 0 && (
                <div className="no-tasks-new">
                  <Clock size={32} />
                  <p>No tasks yet. Add some tasks to track project progress.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal; 