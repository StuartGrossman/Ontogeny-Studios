import React from 'react';
import { Users, RefreshCw, ArrowUp, ArrowDown, FolderPlus, Calendar, FileText, CheckCircle, Edit3 } from 'lucide-react';
import { UserAvatar } from '../utils/avatarGenerator';

interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isAdmin: boolean;
  hasUncompletedItems?: boolean;
  uncompletedItems?: number;
}

interface Project {
  id: string;
  name?: string;
  projectName?: string;
  description?: string;
  status: string;
  progress?: number;
  deadline?: string;
  tasks?: any[];
  type?: string;
  features?: string;
  priority?: string;
  createdAt?: any;
  meetingScheduled?: boolean;
}

interface AdminDashboardProps {
  allUsers: User[];
  selectedUser: User | null;
  userProjects: Project[];
  usersLoading: boolean;
  userSearchQuery: string;
  sortByAlerts: boolean;
  onUserSelect: (user: User) => void;
  onUserSearchChange: (query: string) => void;
  onToggleAlertSort: () => void;
  onCreateProject: () => void;
  onOpenAdminProject: (project: Project) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  allUsers,
  selectedUser,
  userProjects,
  usersLoading,
  userSearchQuery,
  sortByAlerts,
  onUserSelect,
  onUserSearchChange,
  onToggleAlertSort,
  onCreateProject,
  onOpenAdminProject,
}) => {
  return (
    <div className="admin-dashboard">
      {/* User Management Sidebar (1/4 screen) */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="sidebar-title">
            <Users size={20} />
            <h3>User Management</h3>
            <span className="user-count">{allUsers.length} users</span>
            <div className="user-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchQuery}
                  onChange={(e) => onUserSearchChange(e.target.value)}
                  className="user-search-input"
                />
              </div>
              <button 
                className={`sort-btn ${sortByAlerts ? 'active' : ''}`}
                onClick={onToggleAlertSort}
                title={sortByAlerts ? 'Sort alphabetically' : 'Sort by most alerts'}
              >
                {sortByAlerts ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </button>
            </div>
          </div>
        </div>
        
        {usersLoading ? (
          <div className="loading-state">
            <RefreshCw className="spinning" size={24} />
            <p>Loading users...</p>
          </div>
        ) : (
          <div className="users-list">
            {allUsers.map((user) => (
              <div 
                key={user.id}
                className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                onClick={() => onUserSelect(user)}
              >
                <UserAvatar
                  photoURL={user.photoURL}
                  displayName={user.displayName}
                  size={40}
                  className="user-item-avatar"
                />
                <div className="user-item-info">
                  <h4>{user.displayName}</h4>
                  <p>{user.email}</p>
                  <span className={`user-role ${user.isAdmin ? 'admin' : 'user'}`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
                {user.hasUncompletedItems && (
                  <div className="user-alert-badge" title={`${user.uncompletedItems} uncompleted items`}>
                    {user.uncompletedItems}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area (3/4 screen) */}
      <div className="admin-main">
        {selectedUser ? (
          <>
            {/* Selected User Header */}
            <div className="selected-user-header">
              <div className="user-profile">
                <UserAvatar
                  photoURL={selectedUser.photoURL}
                  displayName={selectedUser.displayName}
                  size={80}
                  className="selected-user-avatar"
                />
                <div className="user-details">
                  <h2>{selectedUser.displayName}</h2>
                  <p>{selectedUser.email}</p>
                  <span className={`user-badge ${selectedUser.isAdmin ? 'admin' : 'user'}`}>
                    {selectedUser.isAdmin ? 'Administrator' : 'User'}
                  </span>
                </div>
              </div>
              
              {/* Admin Actions */}
              <div className="admin-actions">
                <button 
                  className="action-btn primary"
                  onClick={onCreateProject}
                >
                  <FolderPlus size={16} />
                  Create Project
                </button>
                <button className="action-btn secondary">
                  <Calendar size={16} />
                  Schedule Meeting
                </button>
                <button className="action-btn secondary">
                  <FileText size={16} />
                  View Reports
                </button>
              </div>
            </div>

            {/* User Projects & Tasks */}
            <div className="user-projects-section">
              <div className="section-header">
                <h3>Projects & Tasks</h3>
                <span className="project-count">{userProjects?.length || 0} projects</span>
              </div>
              
              {userProjects && userProjects.length > 0 ? (
                <div className="projects-list">
                  {userProjects.map((project) => {
                    const isUserRequested = project.type === 'user-requested';
                    return (
                      <div 
                        key={project.id} 
                        className={`project-card-admin clickable ${isUserRequested ? 'user-requested' : 'admin-created'}`}
                        onClick={() => onOpenAdminProject(project)}
                        title={isUserRequested ? 'Click to view details' : 'Click to edit project'}
                      >
                        <div className="project-header">
                          <h4>{project.name || project.projectName}</h4>
                          <div className="project-badges">
                            <span className={`status-badge ${project.status}`}>
                              {project.status}
                            </span>
                            <span className={`type-badge ${isUserRequested ? 'requested' : 'created'}`}>
                              {isUserRequested ? 'User Request' : 'Admin Created'}
                            </span>
                            {!isUserRequested && (
                              <span className="edit-indicator">
                                <Edit3 size={12} />
                                Editable
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {!isUserRequested ? (
                          <>
                            <div className="project-progress">
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span>{project.progress}%</span>
                            </div>
                            
                            <div className="project-meta">
                              <span>Deadline: {project.deadline}</span>
                              <span>{project.tasks?.length || 0} tasks</span>
                            </div>
                            
                            {/* Tasks List */}
                            {project.tasks && project.tasks.length > 0 && (
                              <div className="tasks-list">
                                <h5>Tasks:</h5>
                                {project.tasks.map((task: any) => (
                                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                                    <CheckCircle size={14} className={task.completed ? 'completed' : ''} />
                                    <span>{task.title}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {/* Progress Bar for Accepted User Requests */}
                            {project.status === 'accepted' && (
                              <div className="admin-progress-section">
                                <div className="progress-header">
                                  <span className="progress-label">Development Progress</span>
                                  <span className="progress-percentage">{project.progress || 0}%</span>
                                </div>
                                <div className="admin-progress-bar">
                                  <div 
                                    className="admin-progress-fill"
                                    style={{ width: `${project.progress || 0}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            <div className="request-description">
                              {project.description && (
                                <p>{project.description.substring(0, 150)}...</p>
                              )}
                            </div>
                            <div className="request-features">
                              <strong>Key Features:</strong>
                              <div className="features-preview">
                                {project.features?.split('\n').slice(0, 3).map((feature: string, index: number) => (
                                  <div key={index} className="feature-preview-item">
                                    {feature.length > 60 ? `${feature.substring(0, 60)}...` : feature}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="project-meta">
                              <span>Priority: {project.priority}</span>
                              <span>Status: {project.status === 'accepted' ? '✅ ACCEPTED' : project.status}</span>
                              <span>Requested: {project.createdAt?.seconds 
                                ? new Date(project.createdAt.seconds * 1000).toLocaleDateString()
                                : new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <FolderPlus size={48} />
                  <h4>No projects yet</h4>
                  <p>Use the "Create Project" button above to get started with {selectedUser.displayName}.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-user-selected">
            <Users size={64} />
            <h3>Select a user to manage</h3>
            <p>Choose a user from the sidebar to view their projects and tasks.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 