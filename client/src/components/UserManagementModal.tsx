import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserAvatar } from '../utils/avatarGenerator';
import { Search, Folder, Settings, Star, MessageSquare, Plus, MoreVertical } from 'lucide-react';
import './UserManagementModal.css';

interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in-progress' | 'completed';
  type: 'admin-created' | 'user-requested';
  progress: number;
  isEditable: boolean;
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active-projects');
  const [loading, setLoading] = useState(true);

  // Mock project data - in real app this would come from your database
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'adfa',
      status: 'in-progress',
      type: 'admin-created',
      progress: 15,
      isEditable: true
    },
    {
      id: '2',
      name: 'test',
      status: 'planning',
      type: 'admin-created',
      progress: 75,
      isEditable: true
    },
    {
      id: '3',
      name: 'Consignment',
      status: 'completed',
      type: 'admin-created',
      progress: 100,
      isEditable: true
    }
  ]);

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
      if (usersData.length > 0) {
        setSelectedUser(usersData[0]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isAdmin: !currentStatus });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: !currentStatus } : user
      ));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, isAdmin: !currentStatus });
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'planning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In-Progress';
      case 'planning': return 'Planning';
      default: return 'Unknown';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-management-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Management</h2>
          <button onClick={onClose} className="close-button">
            <MoreVertical size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          {/* Left Sidebar */}
          <div className="sidebar">
            <div className="search-container">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="user-list">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <UserAvatar
                    photoURL={user.photoURL}
                    displayName={user.displayName}
                    size={40}
                    className="user-avatar"
                  />
                  <div className="user-details">
                    <div className="user-name">{user.displayName}</div>
                    <div className="user-email">{user.email}</div>
                    <div className={`user-role ${user.isAdmin ? 'admin' : 'user'}`}>
                      {user.isAdmin ? 'ADMINISTRATOR' : 'USER'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="main-content">
            {selectedUser ? (
              <>
                {/* User Profile Section */}
                <div className="user-profile-section">
                  <div className="user-profile-info">
                    <UserAvatar
                      photoURL={selectedUser.photoURL}
                      displayName={selectedUser.displayName}
                      size={60}
                      className="profile-avatar"
                    />
                    <div className="profile-details">
                      <h3 className="profile-name">{selectedUser.displayName}</h3>
                      <p className="profile-email">{selectedUser.email}</p>
                      <span className={`profile-role ${selectedUser.isAdmin ? 'admin' : 'user'}`}>
                        {selectedUser.isAdmin ? 'ADMINISTRATOR' : 'USER'}
                      </span>
                    </div>
                  </div>
                  <div className="profile-actions">
                    <button className="action-button primary">
                      <Plus size={16} />
                      Create Project
                    </button>
                    <button className="action-button secondary">
                      <MessageSquare size={16} />
                      Messages
                    </button>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="navigation-tabs">
                  <button
                    className={`tab-button ${activeTab === 'active-projects' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active-projects')}
                  >
                    <Folder size={16} />
                    Active Projects {projects.length}
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'requested-projects' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requested-projects')}
                  >
                    <Settings size={16} />
                    Requested Projects {projects.length}
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'requested-features' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requested-features')}
                  >
                    <Star size={16} />
                    Requested Features 1
                  </button>
                  {/* API Keys tab not needed here */}
                </div>

                {/* Project Cards */}
                <div className="projects-section">
                  <h3 className="section-title">User Management</h3>
                  <div className="project-cards">
                    {projects.map(project => (
                      <div key={project.id} className="project-card">
                        <div className="project-status-indicator" style={{ backgroundColor: getStatusColor(project.status) }} />
                        <div className="project-content">
                          <div className="project-header">
                            <h4 className="project-name">{project.name}</h4>
                            <div className="project-tags">
                              <span className="tag status" style={{ backgroundColor: getStatusColor(project.status) }}>
                                {getStatusText(project.status)}
                              </span>
                              <span className="tag type">
                                {project.type === 'admin-created' ? 'ADMIN CREATED' : 'USER REQUESTED'}
                              </span>
                              {project.isEditable && (
                                <span className="tag editable">Editable</span>
                              )}
                            </div>
                          </div>
                          <div className="project-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-user-selected">
                <p>Select a user to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal; 