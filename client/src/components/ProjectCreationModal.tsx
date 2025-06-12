import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import './ProjectCreationModal.css';

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface Project {
  name: string;
  description: string;
  userId: string;
  status: 'active' | 'completed' | 'on-hold';
  createdAt: string;
}

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectCreationModal = ({ isOpen, onClose }: ProjectCreationModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectStatus, setProjectStatus] = useState<'active' | 'completed' | 'on-hold'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;
      
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as User));
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !projectName) return;

    setIsSubmitting(true);
    try {
      const project: Omit<Project, 'id'> = {
        name: projectName,
        description: projectDescription,
        userId: selectedUser,
        status: projectStatus,
        createdAt: new Date().toISOString()
      };

      const projectsCollection = collection(db, 'projects');
      await addDoc(projectsCollection, project);

      // Reset form
      setProjectName('');
      setProjectDescription('');
      setSelectedUser('');
      setProjectStatus('active');
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content project-creation-modal">
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <form onSubmit={handleSubmit} className="project-form">
              <div className="form-group">
                <label htmlFor="user">Select User</label>
                <select
                  id="user"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  required
                >
                  <option value="">Select a user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.displayName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="projectName">Project Name</label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  placeholder="Enter project name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="projectDescription">Description</label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="projectStatus">Status</label>
                <select
                  id="projectStatus"
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value as Project['status'])}
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCreationModal; 