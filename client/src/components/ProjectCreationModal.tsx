import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './ProjectCreationModal.css';

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface Project {
  userId: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
}

interface ProjectCreationModalProps {
  onClose: () => void;
}

const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectStatus, setProjectStatus] = useState<Project['status']>('pending');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !projectName) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'projects'), {
        userId: selectedUser,
        name: projectName,
        description: projectDescription,
        status: projectStatus,
        createdAt: new Date().toISOString()
      });

      // Reset form
      setSelectedUser('');
      setProjectName('');
      setProjectDescription('');
      setProjectStatus('pending');
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="card-header">
          <h2>Create New Project</h2>
          <button onClick={onClose} className="button button-icon">×</button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center">Loading users...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select User</label>
                <select
                  className="form-input"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  required
                >
                  <option value="">Choose a user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.displayName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  placeholder="Enter project name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value as Project['status'])}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Project'}
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