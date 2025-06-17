import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  
  // AI Chat Modal state
  const [aiChatOpen, setAiChatOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const metrics = [
    {
      title: 'Total Projects',
      value: '12',
      change: '+3',
      changeType: 'positive',
      icon: '📊',
      details: 'You have 12 active projects across your organization. 3 new projects were added this month.'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: '👥',
      details: '1,234 users have logged in this month. User engagement is up 12% compared to last month.'
    },
    {
      title: 'Revenue',
      value: '$45,678',
      change: '+8.5%',
      changeType: 'positive',
      icon: '💰',
      details: 'Total revenue for this quarter is $45,678, an increase of 8.5% over the previous quarter.'
    },
    {
      title: 'Completion Rate',
      value: '94%',
      change: '+2.1%',
      changeType: 'positive',
      icon: '✅',
      details: '94% of all projects are completed on time. This is a 2.1% improvement.'
    }
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'E-commerce Platform',
      status: 'In Progress',
      progress: 75,
      team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      deadline: '2024-04-15',
      details: 'A scalable e-commerce platform for B2B and B2C sales, with real-time inventory and analytics.'
    },
    {
      id: 2,
      name: 'Mobile App',
      status: 'Completed',
      progress: 100,
      team: ['Sarah Wilson', 'Tom Brown'],
      deadline: '2024-03-20',
      details: 'A cross-platform mobile app for customer engagement and loyalty rewards.'
    },
    {
      id: 3,
      name: 'Analytics Dashboard',
      status: 'Planning',
      progress: 25,
      team: ['Alex Chen', 'Emily Davis'],
      deadline: '2024-05-10',
      details: 'A business intelligence dashboard for real-time reporting and data visualization.'
    }
  ];

  const activities = [
    { id: 1, action: 'Project "E-commerce Platform" updated', time: '2 hours ago', user: 'John Doe' },
    { id: 2, action: 'New team member added to "Mobile App"', time: '4 hours ago', user: 'Sarah Wilson' },
    { id: 3, action: 'Milestone completed for "Analytics Dashboard"', time: '1 day ago', user: 'Alex Chen' },
    { id: 4, action: 'Client feedback received for "E-commerce Platform"', time: '2 days ago', user: 'Jane Smith' }
  ];

  // Modal open helpers
  const openMetricModal = (metric: typeof metrics[0]) => {
    setModalContent(
      <div className="modal-details">
        <div className="modal-icon">{metric.icon}</div>
        <h2>{metric.title}</h2>
        <div className="modal-value">{metric.value}</div>
        <p>{metric.details}</p>
      </div>
    );
    setModalOpen(true);
  };

  const openProjectModal = (project: typeof recentProjects[0]) => {
    setModalContent(
      <div className="modal-details">
        <h2>{project.name}</h2>
        <div className="modal-status">Status: {project.status}</div>
        <div className="modal-progress">Progress: {project.progress}%</div>
        <div className="modal-deadline">Deadline: {project.deadline}</div>
        <div className="modal-team">Team: {project.team.join(', ')}</div>
        <p>{project.details}</p>
      </div>
    );
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  return (
    <div className="dashboard dashboard-light-bg">
      {/* Modal */}
      {modalOpen && (
        <div className="dashboard-modal-overlay" onClick={closeModal}>
          <div className="dashboard-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            {modalContent}
          </div>
        </div>
      )}
      {/* Top Navigation Bar */}
      <nav className="dashboard-navbar">
        <div className="nav-left">
          <h1 className="nav-brand">
            <span className="gradient-text">Ontogeny</span>
            <span className="brand-subtitle">Labs</span>
          </h1>
        </div>
        <div className="nav-center">
          <button 
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`nav-tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button 
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>
        <div className="nav-right">
          <div className="user-info">
            <img 
              src={currentUser?.photoURL || '/default-avatar.png'} 
              alt="Profile" 
              className="user-avatar"
            />
            <span className="user-name">{currentUser?.displayName || 'User'}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="welcome-section">
              <h2>Welcome back, {currentUser?.displayName?.split(' ')[0] || 'User'}! 👋</h2>
              <p>Here's what's happening with your projects today.</p>
              <button 
                className="request-project-button"
                onClick={() => setAiChatOpen(true)}
              >
                <span className="button-icon">🚀</span>
                Request New Project
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="metrics-grid">
              {metrics.map((metric, index) => (
                <div key={index} className="metric-card metric-card-hover" onClick={() => openMetricModal(metric)}>
                  <div className="metric-header">
                    <span className="metric-icon">{metric.icon}</span>
                    <span className={`metric-change ${metric.changeType}`}>
                      {metric.change}
                    </span>
                  </div>
                  <div className="metric-value">{metric.value}</div>
                  <div className="metric-title">{metric.title}</div>
                </div>
              ))}
            </div>

            {/* Recent Projects */}
            <div className="recent-projects">
              <h3>Recent Projects</h3>
              <div className="projects-grid">
                {recentProjects.map((project) => (
                  <div key={project.id} className="project-card project-card-hover" onClick={() => openProjectModal(project)}>
                    <div className="project-header">
                      <h4>{project.name}</h4>
                      <span className={`project-status ${project.status.toLowerCase().replace(' ', '-')}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="project-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{project.progress}%</span>
                    </div>
                    <div className="project-team">
                      <span className="team-label">Team:</span>
                      <div className="team-members">
                        {project.team.map((member, index) => (
                          <span key={index} className="team-member">{member}</span>
                        ))}
                      </div>
                    </div>
                    <div className="project-deadline">
                      <span className="deadline-label">Deadline:</span>
                      <span className="deadline-date">{project.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {activities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-content">
                      <span className="activity-action">{activity.action}</span>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                    <span className="activity-user">{activity.user}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="projects-section">
            <h2>All Projects</h2>
            <div className="projects-list">
              {recentProjects.map((project) => (
                <div key={project.id} className="project-item">
                  <div className="project-info">
                    <h3>{project.name}</h3>
                    <p>Team: {project.team.join(', ')}</p>
                    <p>Deadline: {project.deadline}</p>
                  </div>
                  <div className="project-actions">
                    <button className="action-button view">View Details</button>
                    <button className="action-button edit">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>Analytics Dashboard</h2>
            <div className="analytics-grid">
              <div className="chart-card">
                <h3>Project Completion Rate</h3>
                <div className="chart-placeholder">
                  <div className="chart-bar" style={{height: '60%'}}></div>
                  <div className="chart-bar" style={{height: '80%'}}></div>
                  <div className="chart-bar" style={{height: '70%'}}></div>
                  <div className="chart-bar" style={{height: '90%'}}></div>
                  <div className="chart-bar" style={{height: '85%'}}></div>
                </div>
              </div>
              <div className="chart-card">
                <h3>Team Performance</h3>
                <div className="chart-placeholder">
                  <div className="chart-bar" style={{height: '75%'}}></div>
                  <div className="chart-bar" style={{height: '85%'}}></div>
                  <div className="chart-bar" style={{height: '90%'}}></div>
                  <div className="chart-bar" style={{height: '70%'}}></div>
                  <div className="chart-bar" style={{height: '95%'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* AI Chat Modal */}
      <AIChatModal 
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
      />
    </div>
  );
};

export default Dashboard; 