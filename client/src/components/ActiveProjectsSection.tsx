import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, TrendingUp, Clock, AlertCircle, Zap, Target, MessageSquare, Play, Calendar, Users, CheckCircle, Settings, BarChart3, FileText, GitBranch, Plus, X, Key, Palette, Globe, Copy, Trash2, Eye, Shield, Edit } from 'lucide-react';
import ProjectFeaturesModal from './ProjectFeaturesModal';
import ProjectNavbar from './ProjectNavbar';
import { AddFeatureModal, AddAPIKeyModal, AddUIDesignModal, AddDNSRecordsModal } from './modals';
import '../styles/ActiveProjectsSection.css';
import '../styles/ProjectFeaturesModal.css';
import '../styles/AddFeatureModal.css';
import '../styles/AddAPIKeyModal.css';
import '../styles/AddUIDesignModal.css';
import '../styles/AddDNSRecordsModal.css';

interface ProjectFeature {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface Project {
  id: string;
  name?: string;
  description?: string;
  status: string;
  progress?: number;
  deadline?: string;
  tasks?: any[];
  createdAt?: any;
  websiteUrl?: string;
  liveLink?: string;
}

interface ActiveProjectsSectionProps {
  customerProjects: Project[];
  customerProjectsLoading: boolean;
  onOpenCustomerProject: (project: Project) => void;
  onFeatureRequest: (project: Project) => void;
  selectedProject?: Project | null;
  onProjectSelect?: (project: Project) => void;
  sidebarCollapsed?: boolean;
}

const ActiveProjectsSection: React.FC<ActiveProjectsSectionProps> = ({
  customerProjects,
  customerProjectsLoading,
  onOpenCustomerProject,
  onFeatureRequest,
  selectedProject: externalSelectedProject,
  onProjectSelect,
  sidebarCollapsed = false,
}) => {
  const [internalSelectedProject, setInternalSelectedProject] = useState<Project | null>(null);
  const [projectDetailsLoading, setProjectDetailsLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [showProjectFeaturesModal, setShowProjectFeaturesModal] = useState(false);
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);
  const [showUIDesignModal, setShowUIDesignModal] = useState(false);
  const [showDNSRecordsModal, setShowDNSRecordsModal] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingModalAction, setPendingModalAction] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [profilePassword, setProfilePassword] = useState('admin123'); // Default password, should come from profile settings

  // Use external selected project if provided, otherwise use internal state
  const selectedProject = externalSelectedProject !== undefined ? externalSelectedProject : internalSelectedProject;
  const setSelectedProject = onProjectSelect || setInternalSelectedProject;

  console.log('🎯 ActiveProjectsSection rendered');
  console.log('📊 customerProjects:', customerProjects);
  console.log('⏳ customerProjectsLoading:', customerProjectsLoading);
  console.log('📈 customerProjects.length:', customerProjects?.length || 0);

  // Calculate project arrays
  const activeProjects = customerProjects.filter(p => p.status === 'in-progress' || p.status === 'planning');
  const completedProjects = customerProjects.filter(p => p.status === 'completed');

  console.log('🔄 INITIAL COMPONENT STATE:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Active Projects Count:', activeProjects.length);
  console.log('✅ Completed Projects Count:', completedProjects.length);
  console.log('🎯 Selected Project:', selectedProject);
  console.log('⚡ External Selected Project:', externalSelectedProject);
  console.log('📱 Component Props:', {
    customerProjectsLoading,
    onOpenCustomerProject: !!onOpenCustomerProject,
    onFeatureRequest: !!onFeatureRequest,
    selectedProject: !!externalSelectedProject,
    onProjectSelect: !!onProjectSelect
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Add mock project for testing if no active projects exist
  const mockActiveProjects = activeProjects.length === 0 ? [
    {
      id: 'mock-1',
      name: 'E-commerce Platform',
      description: 'A modern e-commerce platform with advanced features including payment processing, inventory management, and user analytics.',
      status: 'in-progress',
      progress: 65,
      deadline: '2024-03-15',
      liveLink: 'https://shopify.com',
      websiteUrl: 'https://shopify.com', // Fallback for compatibility
      createdAt: { seconds: Date.now() / 1000 - (30 * 24 * 60 * 60) }, // 30 days ago
      tasks: []
    },
    {
      id: 'mock-2',
      name: 'Task Management App',
      description: 'A collaborative task management application with real-time updates and team collaboration features.',
      status: 'in-progress',
      progress: 40,
      deadline: '2024-04-01',
      liveLink: 'https://asana.com',
      websiteUrl: 'https://asana.com', // Fallback for compatibility
      createdAt: { seconds: Date.now() / 1000 - (15 * 24 * 60 * 60) }, // 15 days ago
      tasks: []
    }
  ] : activeProjects;

  console.log('🚀 FINAL PROJECT ARRAYS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Mock Active Projects:', mockActiveProjects);
  console.log('🔢 Mock Active Projects Count:', mockActiveProjects.length);
  console.log('📝 Project Names:', mockActiveProjects.map(p => p.name));
  console.log('📈 Project Progress:', mockActiveProjects.map(p => `${p.name}: ${p.progress}%`));
  console.log('🔗 Live Links:', mockActiveProjects.map(p => `${p.name}: ${p.liveLink || p.websiteUrl || 'None'}`));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Auto-select first project if none selected
  useEffect(() => {
    if (!selectedProject && mockActiveProjects.length > 0) {
      console.log('🎯 AUTO-SELECTING FIRST PROJECT');
      console.log('📊 Available Projects:', mockActiveProjects);
      console.log('🔍 Selected Project Data:', mockActiveProjects[0]);
      console.log('📝 Project Details:', {
        id: mockActiveProjects[0].id,
        name: mockActiveProjects[0].name,
        description: mockActiveProjects[0].description,
        status: mockActiveProjects[0].status,
        progress: mockActiveProjects[0].progress,
        deadline: mockActiveProjects[0].deadline,
        liveLink: mockActiveProjects[0].liveLink,
        websiteUrl: mockActiveProjects[0].websiteUrl,
        createdAt: mockActiveProjects[0].createdAt,
        tasks: mockActiveProjects[0].tasks,
        allFields: Object.keys(mockActiveProjects[0])
      });
      setSelectedProject(mockActiveProjects[0]);
    }
  }, [mockActiveProjects, selectedProject]);

  // Enhanced project selection with full logging
  const handleProjectSelect = (project: Project) => {
    console.log('🎯 PROJECT SELECTED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 FULL PROJECT DATA:');
    console.log('Raw Object:', project);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 PROJECT DETAILS:');
    console.log('• ID:', project.id);
    console.log('• Name:', project.name);
    console.log('• Description:', project.description);
    console.log('• Status:', project.status);
    console.log('• Progress:', project.progress + '%');
    console.log('• Deadline:', project.deadline);
    console.log('• Live Link:', project.liveLink);
    console.log('• Website URL:', project.websiteUrl);
    console.log('• Created At:', project.createdAt);
    console.log('• Tasks:', project.tasks);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 ALL AVAILABLE FIELDS:');
    Object.entries(project).forEach(([key, value]) => {
      console.log(`• ${key}:`, value);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 CALCULATED METRICS:');
    const metrics = generateProjectMetrics(project);
    console.log('• Tasks Completed:', metrics.tasksCompleted);
    console.log('• Total Tasks:', metrics.totalTasks);
    console.log('• Days Remaining:', metrics.daysRemaining);
    console.log('• Team Members:', metrics.teamMembers);
    console.log('• Completion Rate:', metrics.completionRate + '%');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    setSelectedProject(project);
    
    // Call the external onProjectSelect if provided
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  // Simulate loading when project changes
  useEffect(() => {
    if (selectedProject) {
      setProjectDetailsLoading(true);
      setMetricsLoading(true);
      
      const detailsTimer = setTimeout(() => {
        setProjectDetailsLoading(false);
      }, 600);
      
      const metricsTimer = setTimeout(() => {
        setMetricsLoading(false);
      }, 900);
      
      return () => {
        clearTimeout(detailsTimer);
        clearTimeout(metricsTimer);
      };
    }
  }, [selectedProject]);

  // Generate project metrics
  const generateProjectMetrics = (project: Project) => {
    const baseMetrics = {
      tasksCompleted: Math.floor(Math.random() * 20) + 5,
      totalTasks: Math.floor(Math.random() * 30) + 15,
      daysRemaining: Math.floor(Math.random() * 45) + 1,
      teamMembers: Math.floor(Math.random() * 6) + 2,
      riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
    };
    
    return {
      ...baseMetrics,
      completionRate: Math.round((baseMetrics.tasksCompleted / baseMetrics.totalTasks) * 100)
    };
  };

  // Get project icon based on name or type
  const getProjectIcon = (project: Project) => {
    const name = project.name?.toLowerCase() || '';
    if (name.includes('web') || name.includes('website')) return <BarChart3 size={24} />;
    if (name.includes('mobile') || name.includes('app')) return <Settings size={24} />;
    if (name.includes('dashboard') || name.includes('admin')) return <Target size={24} />;
    if (name.includes('api') || name.includes('backend')) return <GitBranch size={24} />;
    return <FileText size={24} />;
  };

  // Get feature status icon
  const getFeatureStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'in-progress':
        return <Clock size={16} />;
      case 'pending':
        return <AlertCircle size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  // Handle adding new feature
  const handleAddFeature = async (featureData: any) => {
    try {
      // Here you would typically save to your backend
      console.log('Adding new feature:', featureData);
      
      // For now, just simulate success
      // In a real app, you'd make an API call to save the feature
      
      // You could also refresh the project data here if needed
      
    } catch (error) {
      console.error('Error adding feature:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  // Password protection for sensitive modals
  const handleProtectedModal = (modalType: string) => {
    setPendingModalAction(modalType);
    setShowPasswordPrompt(true);
    setPasswordInput('');
  };

  const verifyPassword = () => {
    if (passwordInput === profilePassword) {
      setShowPasswordPrompt(false);
      
      switch (pendingModalAction) {
        case 'apikey':
          setShowAPIKeyModal(true);
          break;
        case 'uidesign':
          setShowUIDesignModal(true);
          break;
        case 'dns':
          setShowDNSRecordsModal(true);
          break;
        default:
          console.log('Unknown modal action:', pendingModalAction);
      }
      
      setPendingModalAction(null);
      setPasswordInput('');
    } else {
      alert('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  const cancelPasswordPrompt = () => {
    setShowPasswordPrompt(false);
    setPendingModalAction(null);
    setPasswordInput('');
  };

  // Mock team data - replace with actual data from your backend
  const mockTeamMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Lead Developer',
      avatar: 'SJ',
      email: 'sarah.johnson@ontogeny.com',
      status: 'active'
    },
    {
      id: '2',
      name: 'Mike Chen',
      role: 'UI/UX Designer',
      avatar: 'MC',
      email: 'mike.chen@ontogeny.com',
      status: 'active'
    },
    {
      id: '3',
      name: 'Alex Rodriguez',
      role: 'Backend Developer',
      avatar: 'AR',
      email: 'alex.rodriguez@ontogeny.com',
      status: 'active'
    },
    {
      id: '4',
      name: 'Emily Davis',
      role: 'Project Manager',
      avatar: 'ED',
      email: 'emily.davis@ontogeny.com',
      status: 'active'
    }
  ];

  // Team Modal Component
  const TeamModal = () => (
    <div className="modal-overlay">
      <div className="modal-content team-modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <Users size={24} />
            <div>
              <h2>Project Team</h2>
              <p>Team members working on {selectedProject?.name}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={() => setShowTeamModal(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="team-content">
          <div className="team-list">
            {mockTeamMembers.map((member) => (
              <div key={member.id} className="team-member">
                <div className="member-avatar">
                  {member.avatar}
                </div>
                <div className="member-info">
                  <h4>{member.name}</h4>
                  <p className="member-role">{member.role}</p>
                  <p className="member-email">{member.email}</p>
                </div>
                <div className={`member-status ${member.status}`}>
                  <span className="status-dot"></span>
                  {member.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Mock project features - replace with actual data from your backend
  const mockProjectFeatures: ProjectFeature[] = [
    {
      id: '1',
      name: 'User Authentication',
      description: 'Complete user registration, login, and password reset functionality',
      status: 'completed',
      priority: 'high',
      category: 'Authentication'
    },
    {
      id: '2',
      name: 'Dashboard Interface',
      description: 'Main user dashboard with project overview and quick actions',
      status: 'completed',
      priority: 'high',
      category: 'UI/UX'
    },
    {
      id: '3',
      name: 'Payment Integration',
      description: 'Stripe payment processing for subscriptions and one-time payments',
      status: 'in-progress',
      priority: 'high',
      category: 'Payment'
    },
    {
      id: '4',
      name: 'Email Notifications',
      description: 'Automated email system for user notifications and updates',
      status: 'in-progress',
      priority: 'medium',
      category: 'Communication'
    },
    {
      id: '5',
      name: 'Mobile Responsive Design',
      description: 'Optimize interface for mobile and tablet devices',
      status: 'pending',
      priority: 'medium',
      category: 'UI/UX'
    },
    {
      id: '6',
      name: 'Advanced Analytics',
      description: 'Detailed analytics dashboard with custom reporting',
      status: 'pending',
      priority: 'low',
      category: 'Analytics'
    }
  ];

  if (customerProjectsLoading) {
    return (
      <div className="loading-state">
        <RefreshCw className="spinning" size={32} />
        <p>Loading your projects...</p>
      </div>
    );
  }

  if (customerProjects.length === 0 && mockActiveProjects.length === 0) {
    return (
      <div className="active-projects-section">
        <div className="active-projects-header">
          <h2>
            <Activity size={24} />
            Active Projects
          </h2>
          <div className="project-summary">
            <span className="summary-item">
              <span className="summary-number">0</span>
              <span className="summary-label">Active</span>
            </span>
            <span className="summary-item">
              <span className="summary-number">0</span>
              <span className="summary-label">Completed</span>
            </span>
          </div>
        </div>

        <div className="empty-projects-state">
          <div className="empty-state-icon">
            <Activity size={64} />
          </div>
          <h3>No Active Projects</h3>
          <p>You don't have any active projects yet. Start by requesting a new project or check your requested projects to see if any have been approved.</p>
          <div className="empty-state-actions">
            <button className="primary-action-btn">
              <Play size={16} />
              Request New Project
            </button>
            <button className="secondary-action-btn">
              <MessageSquare size={16} />
              View Requested Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`active-projects-section ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {selectedProject ? (
        <div className="project-view">
          {/* Project Action Navbar */}
          <ProjectNavbar 
            mode="actions"
            project={selectedProject}
            isCollapsed={sidebarCollapsed}
            onAddFeature={() => setShowAddFeatureModal(true)}
            onAddAPIKey={() => handleProtectedModal('apikey')}
            onAddUIDesign={() => setShowUIDesignModal(true)}
            onAddDNSRecords={() => handleProtectedModal('dns')}
          />

          {/* Project Selection Navbar for Testing - Will show available projects */}
          {mockActiveProjects.length > 1 && (
            <div style={{ padding: '1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Available Projects (Click to test logging):</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {mockActiveProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      background: selectedProject?.id === project.id ? '#667eea' : 'white',
                      color: selectedProject?.id === project.id ? 'white' : '#1e293b',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Project Overview */}
          <div className="project-overview-section">
            {metricsLoading ? (
              <div className="overview-cards">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="overview-card">
                    <div className="card-header">
                      <RefreshCw className="spinning" size={20} />
                      <div className="loading-placeholder" style={{width: '80px', height: '16px'}}></div>
                    </div>
                    <div className="card-content">
                      <div className="loading-placeholder" style={{width: '100%', height: '60px', marginBottom: '10px'}}></div>
                      <div className="loading-placeholder" style={{width: '120px', height: '14px'}}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overview-cards">
                {selectedProject.status !== 'completed' && (
                  <>
                    <div className="overview-card progress">
                      <div className="card-header">
                        <TrendingUp size={20} />
                        <span>Progress</span>
                      </div>
                      <div className="card-content">
                        <div className="progress-circle">
                          <span className="progress-value">{selectedProject.progress || 0}%</span>
                        </div>
                        <div className="progress-details">
                          <span>{generateProjectMetrics(selectedProject).tasksCompleted} tasks completed</span>
                        </div>
                      </div>
                    </div>

                    <div className="overview-card timeline">
                      <div className="card-header">
                        <Clock size={20} />
                        <span>Timeline</span>
                      </div>
                      <div className="card-content">
                        <div className="timeline-info">
                          <span className="days-remaining">{generateProjectMetrics(selectedProject).daysRemaining}</span>
                          <span className="days-label">days remaining</span>
                        </div>
                        <div className="deadline-info">
                          <span>Deadline: {selectedProject.deadline || 'Not set'}</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="overview-card team clickable"
                      onClick={() => setShowTeamModal(true)}
                    >
                      <div className="card-header">
                        <Users size={20} />
                        <span>Team</span>
                      </div>
                      <div className="card-content">
                        <div className="team-size">
                          <span className="team-count">{generateProjectMetrics(selectedProject).teamMembers}</span>
                          <span className="team-label">team members</span>
                        </div>
                        <div className="team-activity">
                          <span>Click to view team details</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {selectedProject.status === 'completed' && (
                  <div className="overview-card completed-summary">
                    <div className="card-header">
                      <CheckCircle size={20} />
                      <span>Project Completed</span>
                    </div>
                    <div className="card-content">
                      <div className="completion-info">
                        <span className="completion-date">
                          Completed: {selectedProject.createdAt ? 
                            new Date(selectedProject.createdAt.seconds * 1000).toLocaleDateString() : 
                            'Recently'
                          }
                        </span>
                        <span className="completion-description">
                          Project successfully delivered and deployed
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Project Features - Most Important Section */}
          <div className="project-features-section">
            <div className="features-header">
              <div className="features-title-section">
                <h3>
                  <Settings size={20} />
                  Project Features
                </h3>
                <span className="features-subtitle">Track development progress and feature status</span>
              </div>
            </div>
            
            <div className="features-grid-main">
              {mockProjectFeatures.map((feature) => (
                <div key={feature.id} className={`feature-card-main ${feature.status}`}>
                  <div className="feature-status-indicator">
                    {getFeatureStatusIcon(feature.status)}
                  </div>
                  <div className="feature-content">
                    <div className="feature-header-main">
                      <h4>{feature.name}</h4>
                      <span className={`feature-priority ${feature.priority}`}>
                        {feature.priority}
                      </span>
                    </div>
                    <p className="feature-description-main">{feature.description}</p>
                    <div className="feature-meta-main">
                      <span className="feature-category-main">{feature.category}</span>
                      <span className={`feature-status-text ${feature.status}`}>
                        {feature.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="features-actions">
              <button 
                className="features-view-all-btn small"
                onClick={() => setShowProjectFeaturesModal(true)}
              >
                <Settings size={14} />
                View All Features & APIs
              </button>
            </div>
          </div>

          {/* Project Description */}
          <div className="project-description-section">
            <h3>Project Overview</h3>
            <div className="description-content">
              <div className="description-card">
                <div className="description-text">
                  <p>{selectedProject.description || 'No description available for this project.'}</p>
                </div>
                <div className="description-meta">
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>Started: {selectedProject.createdAt ? 
                      new Date(selectedProject.createdAt.seconds * 1000).toLocaleDateString() : 
                      'Recently'
                    }</span>
                  </div>
                  {selectedProject.deadline && (
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>Deadline: {selectedProject.deadline}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Project Timeline */}
          {selectedProject.status !== 'completed' && (
            <div className="project-timeline-section">
              <h3>Development Timeline</h3>
              <div className="timeline-horizontal">
                <div className="timeline-step completed">
                  <div className="timeline-step-marker"></div>
                  <div className="timeline-step-content">
                    <span className="timeline-step-title">Project Started</span>
                    <span className="timeline-step-date">
                      {selectedProject.createdAt ? 
                        new Date(selectedProject.createdAt.seconds * 1000).toLocaleDateString() : 
                        'Recently'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="timeline-connector completed"></div>
                
                <div className="timeline-step current">
                  <div className="timeline-step-marker"></div>
                  <div className="timeline-step-content">
                    <span className="timeline-step-title">Development</span>
                    <span className="timeline-step-date">In Progress</span>
                  </div>
                </div>
                
                <div className="timeline-connector"></div>
                
                <div className="timeline-step">
                  <div className="timeline-step-marker"></div>
                  <div className="timeline-step-content">
                    <span className="timeline-step-title">Testing</span>
                    <span className="timeline-step-date">Upcoming</span>
                  </div>
                </div>
                
                <div className="timeline-connector"></div>
                
                <div className="timeline-step">
                  <div className="timeline-step-marker"></div>
                  <div className="timeline-step-content">
                    <span className="timeline-step-title">Deployment</span>
                    <span className="timeline-step-date">
                      {selectedProject.deadline || 'TBD'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-project-selected">
          <div className="no-selection-content">
            <Activity size={64} />
            <h3>Select a Project</h3>
            <p>Choose a project from the sidebar to view its details and manage its progress.</p>
          </div>
        </div>
      )}

      {/* Project Features Modal */}
      {showProjectFeaturesModal && selectedProject && (
        <ProjectFeaturesModal
          isOpen={showProjectFeaturesModal}
          onClose={() => setShowProjectFeaturesModal(false)}
          project={selectedProject}
        />
      )}

      {/* Add Feature Modal */}
      <AddFeatureModal
        isOpen={showAddFeatureModal}
        onClose={() => setShowAddFeatureModal(false)}
        onSubmit={handleAddFeature}
        project={selectedProject}
      />

      {/* Team Modal */}
      {showTeamModal && <TeamModal />}

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="modal-overlay">
          <div className="modal-content password-prompt-modal">
            <div className="modal-header">
              <div className="modal-title-section">
                <Key size={24} />
                <div>
                  <h2>Password Required</h2>
                  <p>Enter your profile password to access {pendingModalAction} management</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={cancelPasswordPrompt}>
                <X size={20} />
              </button>
            </div>

            <div className="password-prompt-content">
              <div className="password-input-group">
                <label htmlFor="passwordInput">Password</label>
                <input
                  id="passwordInput"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && verifyPassword()}
                  placeholder="Enter your password"
                  className="password-input"
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={cancelPasswordPrompt} className="btn-secondary">
                Cancel
              </button>
              <button onClick={verifyPassword} className="btn-primary">
                <Key size={16} />
                Verify Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      <AddAPIKeyModal
        isOpen={showAPIKeyModal}
        onClose={() => setShowAPIKeyModal(false)}
        onSubmit={(apiKeyData) => {
          console.log('API key added:', apiKeyData);
          setShowAPIKeyModal(false);
        }}
        project={selectedProject}
      />

      {/* UI Design Modal */}
      <AddUIDesignModal
        isOpen={showUIDesignModal}
        onClose={() => setShowUIDesignModal(false)}
        onSubmit={(designData) => {
          console.log('Design request submitted:', designData);
          setShowUIDesignModal(false);
        }}
        project={selectedProject}
      />

      {/* DNS Records Modal */}
      <AddDNSRecordsModal
        isOpen={showDNSRecordsModal}
        onClose={() => setShowDNSRecordsModal(false)}
        onSubmit={(dnsData) => {
          console.log('DNS record added:', dnsData);
          setShowDNSRecordsModal(false);
        }}
        project={selectedProject}
      />
    </div>
  );
};

export default ActiveProjectsSection; 