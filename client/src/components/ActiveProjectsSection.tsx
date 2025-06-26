import React, { useState, useEffect, useRef } from 'react';
import { Activity, RefreshCw, TrendingUp, Clock, AlertCircle, Zap, Target, MessageSquare, Play, Calendar, Users, CheckCircle, Settings, BarChart3, FileText, GitBranch, Plus, X, Key, Palette, Globe, Copy, Trash2, Eye, Shield, Edit, Send, Lightbulb, ArrowRight, Check, EyeOff, Upload, Download, Star, Heart, Layers, Sparkles, Image, Monitor, Smartphone, Tablet, ExternalLink, Server } from 'lucide-react';
import ProjectFeaturesModal from './ProjectFeaturesModal';
import ProjectNavbar from './ProjectNavbar';
// Modal imports removed - now using inline sections
import '../styles/ActiveProjectsSection.css';
import '../styles/ProjectFeaturesModal.css';

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
  const [activeSection, setActiveSection] = useState<string | null>(null); // 'feature', 'api', 'design', 'dns'
  const [showTeamModal, setShowTeamModal] = useState(false);
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
          setActiveSection('api');
          break;
        case 'uidesign':
          setActiveSection('design');
          break;
        case 'dns':
          setActiveSection('dns');
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

  // Add Feature View Component
  const AddFeatureView = ({ project, onClose }: { project: Project; onClose: () => void }) => {
    const [step, setStep] = useState<'chat' | 'review'>('chat');
    const [messages, setMessages] = useState<any[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [featureName, setFeatureName] = useState('');
    const [featureDescription, setFeatureDescription] = useState('');
    const [requirements, setRequirements] = useState<any[]>([]);
    const [category, setCategory] = useState('Feature');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [estimatedHours, setEstimatedHours] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize chat
    useEffect(() => {
      if (messages.length === 0) {
        const welcomeMessage = {
          id: '1',
          text: `Hi! I'm your AI Feature Consultant. I'll help you design a new feature for "${project?.name || 'your project'}". 

What feature would you like to add? Describe your idea and I'll help you break it down into requirements.`,
          sender: 'consultant',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }, [project?.name]);

    // Auto-scroll messages
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when not typing
    useEffect(() => {
      if (!isTyping && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isTyping]);

    const processUserMessage = async (userMessage: string) => {
      setIsTyping(true);
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
      
      // Simple AI logic to extract feature information
      const response = analyzeMessage(userMessage);
      
      // Update feature data based on analysis
      if (response.featureName && !featureName) {
        setFeatureName(response.featureName);
      }
      if (response.description) {
        setFeatureDescription(response.description);
      }
      if (response.requirements.length > 0) {
        setRequirements(prev => [...prev, ...response.requirements]);
      }
      if (response.category) {
        setCategory(response.category);
      }
      if (response.estimatedHours > 0) {
        setEstimatedHours(prev => prev + response.estimatedHours);
      }

      // Add consultant response
      const consultantMessage = {
        id: Date.now().toString(),
        text: response.message,
        sender: 'consultant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, consultantMessage]);
      setIsTyping(false);
    };

    const analyzeMessage = (message: string): any => {
      const lowerMessage = message.toLowerCase();
      
      // User authentication feature
      if (lowerMessage.includes('login') || lowerMessage.includes('auth') || lowerMessage.includes('sign in')) {
        return {
          featureName: 'User Authentication System',
          description: 'Secure user login and registration system with password reset',
          category: 'Authentication',
          estimatedHours: 24,
          requirements: [
            { id: `req-${Date.now()}-1`, text: 'Login form with validation', priority: 'high' as const },
            { id: `req-${Date.now()}-2`, text: 'Registration page', priority: 'high' as const },
            { id: `req-${Date.now()}-3`, text: 'Password reset functionality', priority: 'medium' as const },
            { id: `req-${Date.now()}-4`, text: 'Session management', priority: 'high' as const }
          ],
          message: `Great! I've outlined a complete authentication system for you. This includes login, registration, password reset, and secure session management.

The estimated development time is 24 hours. Would you like me to add two-factor authentication or social login options?`
        };
      }
      
      // Search functionality
      if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('filter')) {
        return {
          featureName: 'Advanced Search System',
          description: 'Powerful search with filters, sorting, and real-time results',
          category: 'Core Feature',
          estimatedHours: 18,
          requirements: [
            { id: `req-${Date.now()}-1`, text: 'Search input with autocomplete', priority: 'high' as const },
            { id: `req-${Date.now()}-2`, text: 'Advanced filter options', priority: 'medium' as const },
            { id: `req-${Date.now()}-3`, text: 'Sort and pagination', priority: 'medium' as const },
            { id: `req-${Date.now()}-4`, text: 'Search result highlighting', priority: 'low' as const }
          ],
          message: `Perfect! I've designed a comprehensive search system with autocomplete, filters, and pagination.

This will take approximately 18 hours to implement. Should we add saved searches or search analytics?`
        };
      }
      
      // Dashboard feature
      if (lowerMessage.includes('dashboard') || lowerMessage.includes('analytics') || lowerMessage.includes('chart')) {
        return {
          featureName: 'Analytics Dashboard',
          description: 'Interactive dashboard with charts, metrics, and real-time data',
          category: 'Analytics',
          estimatedHours: 32,
          requirements: [
            { id: `req-${Date.now()}-1`, text: 'Data visualization charts', priority: 'high' as const },
            { id: `req-${Date.now()}-2`, text: 'Key metrics display', priority: 'high' as const },
            { id: `req-${Date.now()}-3`, text: 'Date range filtering', priority: 'medium' as const },
            { id: `req-${Date.now()}-4`, text: 'Export functionality', priority: 'low' as const }
          ],
          message: `Excellent idea! An analytics dashboard will provide great insights. I've included interactive charts, key metrics, and filtering options.

This is estimated at 32 hours of development. Would you like to add custom report generation or data export features?`
        };
      }
      
      // Generic response for other messages
      return {
        featureName: '',
        description: '',
        category: '',
        estimatedHours: 0,
        requirements: [],
        message: `I understand you want to add that feature. Can you provide more specific details about:

• What exactly should this feature do?
• Who will use it and how?
• Are there any specific requirements or constraints?

The more details you provide, the better I can help you plan it out!`
      };
    };

    const handleSendMessage = () => {
      if (!currentMessage.trim()) return;
      
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        text: currentMessage,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      processUserMessage(currentMessage);
      setCurrentMessage('');
    };

    return (
      <div className="add-feature-view">
        <div className="feature-view-body">
          {/* Left Panel - AI Consultant */}
          <div className="consultant-panel">
            <div className="consultant-header">
              <div className="consultant-avatar">
                <Lightbulb size={18} />
              </div>
              <div className="consultant-info">
                <h3>AI Feature Consultant</h3>
                <span className="status-online">● Online</span>
              </div>
            </div>

            <div className="chat-container">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-bubble">
                    <p>{message.text}</p>
                    <span className="message-time">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="message consultant">
                  <div className="message-bubble typing">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {step === 'chat' && (
              <div className="chat-input">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Describe your feature idea..."
                  className="message-input"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="send-button"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Feature Preview */}
          <div className="preview-panel">
            <div className="preview-header">
              <Eye size={18} />
              <h3>Feature Specification</h3>
            </div>

            <div className="preview-content">
              {featureName ? (
                <div className="feature-spec">
                  {/* Feature Name */}
                  <div className="spec-section">
                    <h4>Feature Name</h4>
                    <div className="feature-name">{featureName}</div>
                  </div>

                  {/* Description */}
                  {featureDescription && (
                    <div className="spec-section">
                      <h4>Description</h4>
                      <div className="feature-description">{featureDescription}</div>
                    </div>
                  )}

                  {/* Category & Priority */}
                  <div className="spec-section">
                    <h4>Details</h4>
                    <div className="feature-badges">
                      <span className="category-badge">{category}</span>
                      <span className={`priority-badge priority-${priority}`}>
                        {priority.toUpperCase()} Priority
                      </span>
                    </div>
                  </div>

                  {/* Requirements */}
                  {requirements.length > 0 && (
                    <div className="spec-section">
                      <h4>Requirements ({requirements.length})</h4>
                      <div className="requirements-list">
                        {requirements.map((req, index) => (
                          <div key={req.id} className="requirement-item">
                            <span className="req-number">{index + 1}</span>
                            <span className="req-text">{req.text}</span>
                            <span className={`req-priority priority-${req.priority}`}>
                              {req.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time Estimate */}
                  {estimatedHours > 0 && (
                    <div className="spec-section">
                      <h4>Time Estimate</h4>
                      <div className="time-estimate">
                        <div className="estimate-hours">{estimatedHours}h</div>
                        <div className="estimate-days">≈ {Math.ceil(estimatedHours / 8)} working days</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="preview-empty">
                  <Lightbulb size={64} />
                  <h3>Let's Build Your Feature</h3>
                  <p>Start chatting with the AI consultant to create your feature specification. The more details you provide, the better the result!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="feature-view-footer">
          {step === 'chat' ? (
            <>
              <button onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => setStep('review')}
                disabled={!featureName || requirements.length === 0}
                className="btn-primary"
              >
                Review Feature <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('chat')}
                className="btn-secondary"
              >
                ← Back to Chat
              </button>
              <button
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await handleAddFeature({
                      name: featureName,
                      description: featureDescription,
                      category,
                      priority,
                      requirements: requirements.map(req => req.text),
                      estimatedHours,
                      status: 'pending',
                      projectId: project?.id,
                      createdAt: new Date(),
                      messages: messages
                    });
                    onClose();
                  } catch (error) {
                    console.error('Error adding feature:', error);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <>Adding Feature...</>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Add to Project
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Add API Key View Component
  const AddAPIKeyView = ({ project, onClose }: { project: Project; onClose: () => void }) => {
    const [formData, setFormData] = useState({
      provider: '',
      name: '',
      apiKey: '',
      environment: 'development' as 'development' | 'staging' | 'production',
      description: ''
    });
    const [showAPIKey, setShowAPIKey] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Mock existing API keys
    const existingKeys = [
      {
        id: '1',
        provider: 'Stripe',
        name: 'Production Payment Processing',
        environment: 'production' as const,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        provider: 'SendGrid',
        name: 'Email Service',
        environment: 'production' as const,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    // API providers
    const providers = [
      { 
        category: 'Payment Processing',
        options: [
          { value: 'stripe', label: 'Stripe', icon: '💳' },
          { value: 'paypal', label: 'PayPal', icon: '💰' },
          { value: 'square', label: 'Square', icon: '🔷' }
        ]
      },
      {
        category: 'Communication',
        options: [
          { value: 'sendgrid', label: 'SendGrid', icon: '📧' },
          { value: 'mailgun', label: 'Mailgun', icon: '📮' },
          { value: 'twilio', label: 'Twilio', icon: '📱' }
        ]
      },
      {
        category: 'Cloud Services',
        options: [
          { value: 'aws', label: 'Amazon AWS', icon: '☁️' },
          { value: 'google-cloud', label: 'Google Cloud', icon: '🌐' },
          { value: 'azure', label: 'Microsoft Azure', icon: '🔵' }
        ]
      },
      {
        category: 'Analytics',
        options: [
          { value: 'google-analytics', label: 'Google Analytics', icon: '📊' },
          { value: 'mixpanel', label: 'Mixpanel', icon: '📈' },
          { value: 'amplitude', label: 'Amplitude', icon: '📉' }
        ]
      }
    ];

    const getProviderLabel = (value: string) => {
      for (const category of providers) {
        const provider = category.options.find(p => p.value === value);
        if (provider) return provider;
      }
      return null;
    };

    const formatRelativeTime = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      return 'Just now';
    };

    return (
      <div className="api-key-view">
        <div className="api-key-view-body">
          {/* Existing API Keys */}
          <div className="existing-keys-section">
            <div className="section-header">
              <h3>
                <Shield size={18} />
                Existing API Keys ({existingKeys.length})
              </h3>
              <span className="section-subtitle">Active integrations for this project</span>
            </div>

            {existingKeys.length > 0 ? (
              <div className="keys-list">
                {existingKeys.map((key) => {
                  const providerInfo = getProviderLabel(key.provider.toLowerCase());
                  return (
                    <div key={key.id} className="key-item">
                      <div className="key-info">
                        <div className="key-header">
                          <div className="provider-info">
                            <span className="provider-icon">
                              {providerInfo?.icon || '🔑'}
                            </span>
                            <span className="provider-name">{key.provider}</span>
                          </div>
                          <span className={`environment-badge ${key.environment}`}>
                            {key.environment}
                          </span>
                        </div>
                        <div className="key-details">
                          <h4 className="key-name">{key.name}</h4>
                          <div className="key-meta">
                            <span>Created {formatRelativeTime(key.createdAt)}</span>
                            {key.lastUsed && (
                              <span>• Last used {formatRelativeTime(key.lastUsed)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="key-actions">
                        <button className="btn-secondary small">
                          <Eye size={14} />
                          View
                        </button>
                        <button className="btn-danger small">
                          <X size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <Key size={48} />
                <h3>No API Keys Yet</h3>
                <p>Add your first API key to enable integrations</p>
              </div>
            )}
          </div>

          {/* Add New API Key Form */}
          <div className="add-key-section">
            <div className="section-header">
              <h3>
                <Plus size={18} />
                Add New API Key
              </h3>
              <span className="section-subtitle">Connect a new service or API</span>
            </div>

            <form className="api-key-form">
              {/* Provider Selection */}
              <div className="form-group">
                <label htmlFor="provider">Service Provider</label>
                <select
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                  className="form-select"
                >
                  <option value="">Select a service provider</option>
                  {providers.map((category) => (
                    <optgroup key={category.category} label={category.category}>
                      {category.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Key Name and Environment */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Key Name</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Production Payments"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="environment">Environment</label>
                  <select
                    id="environment"
                    value={formData.environment}
                    onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value as any }))}
                    className="form-select"
                  >
                    <option value="development">🧪 Development</option>
                    <option value="staging">🔄 Staging</option>
                    <option value="production">🚀 Production</option>
                  </select>
                </div>
              </div>

              {/* API Key Input */}
              <div className="form-group">
                <label htmlFor="apiKey">API Key</label>
                <div className="api-key-input-group">
                  <input
                    id="apiKey"
                    type={showAPIKey ? 'text' : 'password'}
                    value={formData.apiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Paste your API key here"
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAPIKey(!showAPIKey)}
                    className="toggle-visibility"
                  >
                    {showAPIKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="form-help">
                  <Shield size={12} />
                  <span>API keys are encrypted and stored securely</span>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add notes about this API key's purpose..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="api-key-view-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => {
              console.log('Adding API key:', formData);
              onClose();
            }}
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? (
              <>Adding API Key...</>
            ) : (
              <>
                <Key size={16} />
                Add API Key
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Add UI Design View Component
  const AddUIDesignView = ({ project, onClose }: { project: Project; onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'request' | 'gallery'>('request');
    const [formData, setFormData] = useState({
      targetDevices: ['desktop'] as string[],
      stylePreferences: '',
      uploadedImage: null as File | null
    });

    const deviceTargets = [
      { value: 'desktop', label: 'Desktop', icon: Monitor },
      { value: 'tablet', label: 'Tablet', icon: Tablet },
      { value: 'mobile', label: 'Mobile', icon: Smartphone }
    ];

    const handleDeviceToggle = (device: string) => {
      setFormData(prev => ({
        ...prev,
        targetDevices: prev.targetDevices.includes(device)
          ? prev.targetDevices.filter(d => d !== device)
          : [...prev.targetDevices, device]
      }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFormData(prev => ({ ...prev, uploadedImage: file }));
      }
    };

    const handleSubmit = () => {
      console.log('Submitting design request:', formData);
      // Here you would handle the form submission
      onClose();
    };

    return (
      <div className="ui-design-view">
        {/* Tab Navigation */}
        <div className="design-tab-navigation">
          <button
            className={`design-tab-button ${activeTab === 'request' ? 'active' : ''}`}
            onClick={() => setActiveTab('request')}
          >
            <Sparkles size={18} />
            <span>New Design Request</span>
          </button>
          <button
            className={`design-tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            <Layers size={18} />
            <span>Design Gallery</span>
          </button>
        </div>

        <div className="ui-design-view-body">
          {activeTab === 'request' ? (
            <div className="design-request-form-simplified">
              {/* Target Devices */}
              <div className="design-form-section">
                <h3>Target Devices</h3>
                <div className="device-selector-clean">
                  {deviceTargets.map((device) => {
                    const IconComponent = device.icon;
                    return (
                      <div
                        key={device.value}
                        className={`device-option-clean ${formData.targetDevices.includes(device.value) ? 'selected' : ''}`}
                        onClick={() => handleDeviceToggle(device.value)}
                      >
                        <IconComponent size={24} />
                        <span>{device.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Design Preferences */}
              <div className="design-form-section">
                <h3>Design Preferences</h3>
                <div className="form-group-clean">
                  <label htmlFor="stylePreferences">Describe your vision</label>
                  <textarea
                    id="stylePreferences"
                    value={formData.stylePreferences}
                    onChange={(e) => setFormData(prev => ({ ...prev, stylePreferences: e.target.value }))}
                    placeholder="Describe your preferred style: modern, minimalist, colorful, professional, brand colors, layout preferences, inspiration, etc."
                    className="form-textarea-clean"
                    rows={4}
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="design-form-section">
                <h3>Reference Image (Optional)</h3>
                <div className="image-upload-section">
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-upload-input"
                  />
                  <label htmlFor="imageUpload" className="image-upload-label">
                    <Upload size={32} />
                    <div className="upload-text">
                      <h4>Upload Reference Image</h4>
                      <p>Drop an image here or click to browse</p>
                      <span>Supports JPG, PNG, SVG</span>
                    </div>
                  </label>
                  {formData.uploadedImage && (
                    <div className="uploaded-image-preview">
                      <div className="image-info">
                        <span className="image-name">{formData.uploadedImage.name}</span>
                        <button 
                          className="remove-image-btn"
                          onClick={() => setFormData(prev => ({ ...prev, uploadedImage: null }))}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="design-gallery-clean">
              <div className="gallery-header-clean">
                <h3>
                  <Layers size={20} />
                  Your Design Assets
                </h3>
                <p>Track progress and download completed designs</p>
              </div>
              <div className="gallery-placeholder-clean">
                <Image size={64} />
                <h3>Design Gallery Coming Soon</h3>
                <p>Your completed designs will appear here</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ui-design-view-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary">
            <Palette size={16} />
            Submit Design Request
          </button>
        </div>
      </div>
    );
  };

  // Add DNS Records View Component
  const AddDNSRecordsView = ({ project, onClose }: { project: Project; onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
    const [formData, setFormData] = useState({
      domain: project?.name?.toLowerCase().replace(/\s+/g, '') + '.com' || '',
      recordType: 'A' as 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS',
      name: '',
      value: '',
      ttl: 3600,
      priority: 10
    });
    const [copiedValue, setCopiedValue] = useState<string | null>(null);

    // Mock existing DNS records
    const existingRecords = [
      {
        id: '1',
        type: 'A' as const,
        name: '@',
        value: '192.168.1.100',
        ttl: 3600,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastChecked: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: '2',
        type: 'CNAME' as const,
        name: 'www',
        value: 'example.com',
        ttl: 3600,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        lastChecked: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];

    const recordTypes = [
      { type: 'A', label: 'A Record', description: 'Points domain to IPv4 address', icon: '🌐', example: '192.168.1.1' },
      { type: 'AAAA', label: 'AAAA Record', description: 'Points domain to IPv6 address', icon: '🌐', example: '2001:0db8:85a3::8a2e:0370:7334' },
      { type: 'CNAME', label: 'CNAME Record', description: 'Points domain to another domain', icon: '🔗', example: 'example.com' },
      { type: 'MX', label: 'MX Record', description: 'Mail server configuration', icon: '📧', example: 'mail.example.com' },
      { type: 'TXT', label: 'TXT Record', description: 'Text information and verification', icon: '📝', example: 'v=spf1 include:_spf.google.com ~all' },
      { type: 'NS', label: 'NS Record', description: 'Name server configuration', icon: '🛠️', example: 'ns1.example.com' }
    ];

    const ttlOptions = [
      { value: 300, label: '5 minutes (300s)' },
      { value: 1800, label: '30 minutes (1800s)' },
      { value: 3600, label: '1 hour (3600s)' },
      { value: 21600, label: '6 hours (21600s)' },
      { value: 43200, label: '12 hours (43200s)' },
      { value: 86400, label: '24 hours (86400s)' }
    ];

    const handleCopy = async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopiedValue(value);
        setTimeout(() => setCopiedValue(null), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    };

    return (
      <div className="dns-records-view">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <Plus size={18} />
            Add DNS Record
          </button>
          <button
            className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <Settings size={18} />
            Manage Records ({existingRecords.length})
          </button>
        </div>

        <div className="dns-records-view-body">
          {activeTab === 'add' ? (
            <div className="dns-form-container">
              <form className="dns-form">
                {/* Domain Configuration */}
                <div className="form-section">
                  <h3>Domain Configuration</h3>
                  <div className="form-group">
                    <label htmlFor="domain">Domain Name</label>
                    <input
                      id="domain"
                      type="text"
                      value={formData.domain}
                      onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                      placeholder="example.com"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Record Type Selection */}
                <div className="form-section">
                  <h3>Record Type</h3>
                  <div className="record-type-grid">
                    {recordTypes.map((record) => (
                      <div
                        key={record.type}
                        className={`record-type-card ${formData.recordType === record.type ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, recordType: record.type as any }))}
                      >
                        <div className="record-icon">{record.icon}</div>
                        <div className="record-info">
                          <h4>{record.label}</h4>
                          <p>{record.description}</p>
                          <span className="record-example">e.g., {record.example}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Record Details */}
                <div className="form-section">
                  <h3>Record Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Record Name</label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="@ (root domain) or subdomain"
                        className="form-input"
                      />
                      <div className="form-help">
                        Use "@" for root domain, or enter subdomain name (e.g., "www", "mail")
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="ttl">TTL (Time to Live)</label>
                      <select
                        id="ttl"
                        value={formData.ttl}
                        onChange={(e) => setFormData(prev => ({ ...prev, ttl: parseInt(e.target.value) }))}
                        className="form-select"
                      >
                        {ttlOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="value">Record Value</label>
                    <input
                      id="value"
                      type="text"
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                      placeholder={recordTypes.find(r => r.type === formData.recordType)?.example || 'Enter record value'}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* DNS Propagation Info */}
                <div className="info-section">
                  <div className="info-card">
                    <Zap className="info-icon" />
                    <div className="info-content">
                      <h4>DNS Propagation</h4>
                      <p>DNS changes can take 24-48 hours to propagate worldwide. Lower TTL values update faster but increase DNS queries.</p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="dns-records-manager">
              <div className="manager-header">
                <h3>
                  <Server size={20} />
                  DNS Records for {formData.domain || 'your domain'}
                </h3>
                <p>Manage and monitor your DNS configuration</p>
              </div>

              {existingRecords.length > 0 ? (
                <div className="records-table">
                  <div className="table-header">
                    <div className="header-cell">Type</div>
                    <div className="header-cell">Name</div>
                    <div className="header-cell">Value</div>
                    <div className="header-cell">TTL</div>
                    <div className="header-cell">Status</div>
                    <div className="header-cell">Actions</div>
                  </div>
                  
                  {existingRecords.map((record) => (
                    <div key={record.id} className="table-row">
                      <div className="table-cell">
                        <div className="record-type-badge">
                          <span className="type-text">{record.type}</span>
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        <span className="record-name">{record.name}</span>
                      </div>
                      
                      <div className="table-cell">
                        <div className="record-value-container">
                          <span className="record-value">{record.value}</span>
                          <button
                            onClick={() => handleCopy(record.value)}
                            className="copy-button"
                            title="Copy to clipboard"
                          >
                            {copiedValue === record.value ? (
                              <Check size={14} className="copy-success" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        <span className="ttl-value">{record.ttl}s</span>
                      </div>
                      
                      <div className="table-cell">
                        <span className={`status-badge ${record.status}`}>
                          {record.status}
                        </span>
                      </div>
                      
                      <div className="table-cell">
                        <div className="record-actions">
                          <button className="btn-secondary small">
                            <Eye size={12} />
                          </button>
                          <button className="btn-danger small">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Globe size={48} />
                  <h3>No DNS Records</h3>
                  <p>Add your first DNS record to configure your domain</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="dns-records-view-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button className="btn-primary">
            <Globe size={16} />
            {activeTab === 'add' ? 'Add DNS Record' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  };

  // View Requests Component
  const ViewRequestsView = ({ project: _project, onClose: _onClose }: { project: Project; onClose: () => void }) => {
    // Mock data for feature requests
    const mockFeatureRequests = [
      {
        id: '1',
        type: 'feature',
        title: 'User Profile Dashboard',
        description: 'Create a comprehensive user profile dashboard with settings, preferences, and activity history.',
        priority: 'high' as const,
        status: 'pending' as const,
        category: 'UI/UX',
        requestedAt: new Date('2024-01-15'),
        estimatedHours: 16
      },
      {
        id: '2',
        type: 'feature',
        title: 'Email Notification System',
        description: 'Implement automated email notifications for user actions, system updates, and marketing campaigns.',
        priority: 'medium' as const,
        status: 'in-review' as const,
        category: 'Communication',
        requestedAt: new Date('2024-01-12'),
        estimatedHours: 24
      },
      {
        id: '3',
        type: 'feature',
        title: 'Advanced Search Filters',
        description: 'Add advanced filtering options for the main content search functionality.',
        priority: 'low' as const,
        status: 'approved' as const,
        category: 'Search',
        requestedAt: new Date('2024-01-10'),
        estimatedHours: 8
      }
    ];

    // Mock data for UI design requests
    const mockUIDesignRequests = [
      {
        id: '1',
        type: 'ui-design',
        title: 'Mobile App Landing Page',
        description: 'Modern, responsive landing page design for mobile app promotion.',
        targetDevices: ['desktop', 'tablet', 'mobile'],
        stylePreferences: 'Modern, minimalist design with bold colors and clean typography. Should feel premium and trustworthy.',
        status: 'in-progress' as const,
        requestedAt: new Date('2024-01-14'),
        hasReferenceImage: true
      },
      {
        id: '2',
        type: 'ui-design',
        title: 'Dashboard Redesign',
        description: 'Complete redesign of the admin dashboard with improved UX.',
        targetDevices: ['desktop', 'tablet'],
        stylePreferences: 'Professional, data-focused design with good information hierarchy. Dark mode support preferred.',
        status: 'pending' as const,
        requestedAt: new Date('2024-01-11'),
        hasReferenceImage: false
      },
      {
        id: '3',
        type: 'ui-design',
        title: 'E-commerce Product Pages',
        description: 'Product detail pages for e-commerce platform.',
        targetDevices: ['desktop', 'mobile'],
        stylePreferences: 'Clean, conversion-focused design with emphasis on product imagery and clear call-to-actions.',
        status: 'completed' as const,
        requestedAt: new Date('2024-01-08'),
        hasReferenceImage: true
      }
    ];

    const getStatusBadgeClass = (status: string) => {
      switch (status) {
        case 'pending': return 'status-pending';
        case 'in-review': return 'status-in-review';
        case 'approved': return 'status-approved';
        case 'in-progress': return 'status-in-progress';
        case 'completed': return 'status-completed';
        default: return 'status-pending';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'pending': return <Clock size={14} />;
        case 'in-review': return <AlertCircle size={14} />;
        case 'approved': return <CheckCircle size={14} />;
        case 'in-progress': return <Activity size={14} />;
        case 'completed': return <CheckCircle size={14} className="completed-icon" />;
        default: return <Clock size={14} />;
      }
    };

    const getPriorityBadgeClass = (priority: string) => {
      switch (priority) {
        case 'high': return 'priority-high';
        case 'medium': return 'priority-medium';
        case 'low': return 'priority-low';
        default: return 'priority-medium';
      }
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };

    return (
      <div className="view-requests-container">
        {/* Feature Requests Section */}
        <div className="requests-section">
          <div className="section-header-requests">
            <h3>
              <Plus size={20} />
              Feature Requests
              <span className="request-count">{mockFeatureRequests.length}</span>
            </h3>
            <p>Track your feature development requests and their progress</p>
          </div>

          {mockFeatureRequests.length > 0 ? (
            <div className="requests-grid">
              {mockFeatureRequests.map((request) => (
                <div key={request.id} className="request-card feature-request">
                  <div className="request-header">
                    <div className="request-title-section">
                      <h4>{request.title}</h4>
                      <div className="request-badges">
                        <span className={`priority-badge ${getPriorityBadgeClass(request.priority)}`}>
                          {request.priority}
                        </span>
                        <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="request-content">
                    <p className="request-description">{request.description}</p>
                    <div className="request-meta">
                      <div className="meta-item">
                        <Target size={14} />
                        <span>{request.category}</span>
                      </div>
                      <div className="meta-item">
                        <Clock size={14} />
                        <span>{request.estimatedHours}h estimated</span>
                      </div>
                      <div className="meta-item">
                        <Calendar size={14} />
                        <span>Requested {formatDate(request.requestedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-requests">
              <Plus size={48} />
              <h4>No Feature Requests</h4>
              <p>You haven't submitted any feature requests yet</p>
            </div>
          )}
        </div>

        {/* UI Design Requests Section */}
        <div className="requests-section">
          <div className="section-header-requests">
            <h3>
              <Palette size={20} />
              UI Design Requests
              <span className="request-count">{mockUIDesignRequests.length}</span>
            </h3>
            <p>Track your UI/UX design requests and deliverables</p>
          </div>

          {mockUIDesignRequests.length > 0 ? (
            <div className="requests-grid">
              {mockUIDesignRequests.map((request) => (
                <div key={request.id} className="request-card design-request">
                  <div className="request-header">
                    <div className="request-title-section">
                      <h4>{request.title}</h4>
                      <div className="request-badges">
                        <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="request-content">
                    <p className="request-description">{request.description}</p>
                    
                    <div className="design-details">
                      <div className="detail-group">
                        <span className="detail-label">Target Devices:</span>
                        <div className="device-tags">
                          {request.targetDevices.map((device) => (
                            <span key={device} className="device-tag">
                              {device === 'desktop' && <Monitor size={12} />}
                              {device === 'tablet' && <Tablet size={12} />}
                              {device === 'mobile' && <Smartphone size={12} />}
                              {device}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="detail-group">
                        <span className="detail-label">Style Preferences:</span>
                        <p className="style-preferences">{request.stylePreferences}</p>
                      </div>
                    </div>

                    <div className="request-meta design-meta">
                      <div className="meta-item">
                        <Calendar size={14} />
                        <span>Requested {formatDate(request.requestedAt)}</span>
                      </div>
                      {request.hasReferenceImage && (
                        <div className="meta-item">
                          <Image size={14} />
                          <span>Reference image provided</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-requests">
              <Palette size={48} />
              <h4>No UI Design Requests</h4>
              <p>You haven't submitted any design requests yet</p>
            </div>
          )}
        </div>
      </div>
    );
  };

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
            onAddFeature={() => setActiveSection('feature')}
            onViewRequests={() => setActiveSection('view-requests')}
            onAddAPIKey={() => handleProtectedModal('apikey')}
            onAddUIDesign={() => setActiveSection('design')}
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

          {/* Conditional Content - Show either project details or inline sections */}
          {activeSection ? (
            <div className="inline-section-container">
              <div className="inline-section-header">
                <h3>
                  {activeSection === 'feature' && <>
                    <Plus size={20} />
                    Add Feature Request
                  </>}
                  {activeSection === 'view-requests' && <>
                    <FileText size={20} />
                    View Requests
                  </>}
                  {activeSection === 'api' && <>
                    <Key size={20} />
                    API Key Management
                  </>}
                  {activeSection === 'design' && <>
                    <Palette size={20} />
                    UI Design Request
                  </>}
                  {activeSection === 'dns' && <>
                    <Globe size={20} />
                    DNS Records Management
                  </>}
                </h3>
                <button 
                  className="close-section-btn" 
                  onClick={() => setActiveSection(null)}
                >
                  <X size={16} />
                  Close
                </button>
              </div>
              
              <div className="inline-section-content">
                {activeSection === 'feature' && <AddFeatureView project={selectedProject} onClose={() => setActiveSection(null)} />}
                {activeSection === 'view-requests' && <ViewRequestsView project={selectedProject} onClose={() => setActiveSection(null)} />}
                {activeSection === 'api' && <AddAPIKeyView project={selectedProject} onClose={() => setActiveSection(null)} />}
                {activeSection === 'design' && <AddUIDesignView project={selectedProject} onClose={() => setActiveSection(null)} />}
                {activeSection === 'dns' && <AddDNSRecordsView project={selectedProject} onClose={() => setActiveSection(null)} />}
              </div>
            </div>
          ) : (
            <>
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
            </>
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
    </div>
  );
};

export default ActiveProjectsSection; 