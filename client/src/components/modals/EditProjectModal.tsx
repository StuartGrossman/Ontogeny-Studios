import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
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
  AlertCircle
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

  // Generate task ID
  const generateTaskId = () => {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle progress change
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const progress = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
    setFormData(prev => ({
      ...prev,
      progress
    }));
  };

  // Add new task
  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: generateTaskId(),
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      completed: false,
      createdAt: new Date(),
      dueDate: newTaskDueDate || undefined
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate('');
  };

  // Remove task
  const removeTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Calculate progress based on completed tasks
  const calculateProgressFromTasks = () => {
    if (tasks.length === 0) return formData.progress;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // Auto-update progress when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      const autoProgress = calculateProgressFromTasks();
      setFormData(prev => ({
        ...prev,
        progress: autoProgress
      }));
    }
  }, [tasks]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const projectRef = doc(db, 'admin_projects', project.id);
      
      const updateData = {
        ...formData,
        tasks: tasks,
        updatedAt: new Date(),
        progress: Math.min(100, Math.max(0, formData.progress))
      };

      await updateDoc(projectRef, updateData);
      
      console.log('Project updated successfully');
      onUpdate(); // Refresh the project list
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="edit-project-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <FileText size={24} />
            <h2>Edit Project</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="modal-close-btn"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-subtitle">
          <Users size={16} />
          <span>Assigned to: <strong>{project.assignedUserName}</strong> ({project.assignedUserEmail})</span>
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Basic Project Information */}
          <div className="form-section">
            <h3 className="section-title">Project Information</h3>
            
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <Target size={16} />
                Project Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter project name..."
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                <FileText size={16} />
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the project goals and objectives..."
                className="form-textarea"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="features" className="form-label">
                <FileText size={16} />
                Features & Requirements
              </label>
              <textarea
                id="features"
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                placeholder="List the key features and requirements..."
                className="form-textarea"
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="link" className="form-label">
                <Link size={16} />
                Project Link
              </label>
              <input
                type="url"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="https://..."
                className="form-input"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Project Status & Progress */}
          <div className="form-section">
            <h3 className="section-title">Status & Progress</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  <Clock size={16} />
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-input"
                  disabled={isSubmitting}
                >
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="progress" className="form-label">
                  <BarChart3 size={16} />
                  Progress ({formData.progress}%)
                </label>
                <input
                  type="number"
                  id="progress"
                  name="progress"
                  value={formData.progress}
                  onChange={handleProgressChange}
                  min="0"
                  max="100"
                  className="form-input"
                  disabled={isSubmitting}
                />
                <div className="progress-bar-preview">
                  <div 
                    className="progress-fill-preview"
                    style={{ width: `${formData.progress}%` }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="deadline" className="form-label">
                  <Calendar size={16} />
                  Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="form-input"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Tasks Management */}
          <div className="form-section">
            <h3 className="section-title">Tasks ({tasks.length})</h3>
            
            {/* Add New Task */}
            <div className="add-task-section">
              <div className="form-group">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  className="form-input"
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Task description (optional)..."
                  className="form-textarea"
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  type="button"
                  onClick={addTask}
                  className="add-task-btn"
                  disabled={!newTaskTitle.trim() || isSubmitting}
                >
                  <Plus size={16} />
                  Add Task
                </button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="tasks-list">
              {tasks.map((task) => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-content">
                    <button
                      type="button"
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="task-checkbox"
                      disabled={isSubmitting}
                    >
                      {task.completed ? <Check size={16} /> : <div className="checkbox-empty" />}
                    </button>
                    <div className="task-details">
                      <div className="task-title">{task.title}</div>
                      {task.description && (
                        <div className="task-description">{task.description}</div>
                      )}
                      {task.dueDate && (
                        <div className="task-due-date">Due: {task.dueDate}</div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    className="remove-task-btn"
                    disabled={isSubmitting}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              {tasks.length === 0 && (
                <div className="no-tasks">
                  <Clock size={24} />
                  <p>No tasks yet. Add some tasks to track project progress.</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Update Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal; 