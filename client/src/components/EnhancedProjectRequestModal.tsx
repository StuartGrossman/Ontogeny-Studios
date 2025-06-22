import React, { useState, useEffect } from 'react';
import { X, Plus, Edit3, Trash2, Clock, CheckCircle, List, Sparkles, Wand2, MessageSquare, Send } from 'lucide-react';
import '../styles/EnhancedProjectRequestModal.css';

interface UIFeature {
  id: string;
  title: string;
  description: string;
  category: 'Core Functionality' | 'User Interface' | 'Integration' | 'Security' | 'Performance' | 'Analytics' | 'Communication';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  complexity: 'Simple' | 'Moderate' | 'Complex';
  timeEstimate: number;
  isCustom?: boolean;
}

// For backwards compatibility
type Feature = UIFeature;

interface ProjectData {
  name: string;
  description: string;
  features: Feature[];
  totalTimeEstimate: number;
  estimatedCost: number;
  timeline: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface EnhancedProjectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: ProjectData) => void;
}

const EnhancedProjectRequestModal: React.FC<EnhancedProjectRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [step, setStep] = useState<'chat' | 'review'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hi! I'm your AI assistant. Tell me about the project you'd like to build, and I'll generate a comprehensive feature list for you. You can then edit, add, or remove features as needed.\n\nFor example, you could say: \"I want to build an e-commerce platform\" or \"I need a social media app for my community\"",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    features: [],
    totalTimeEstimate: 0,
    estimatedCost: 0,
    timeline: ''
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingFeature, setEditingFeature] = useState<string | null>(null);

  const categories = [
    'All',
    'Core Functionality',
    'User Interface',
    'Integration',
    'Security',
    'Performance',
    'Analytics',
    'Communication'
  ];

  useEffect(() => {
    const totalHours = projectData.features.reduce((sum, feature) => sum + feature.timeEstimate, 0);
    const estimatedCost = totalHours * 75;
    const weeks = Math.ceil(totalHours / 40);
    const timeline = weeks <= 1 ? '1 week' : weeks <= 4 ? `${weeks} weeks` : `${Math.ceil(weeks / 4)} month${Math.ceil(weeks / 4) > 1 ? 's' : ''}`;
    
    setProjectData(prev => ({
      ...prev,
      totalTimeEstimate: totalHours,
      estimatedCost,
      timeline
    }));
  }, [projectData.features]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    // Check if this is the first project description
    if (projectData.features.length === 0 && (input.includes('want to build') || input.includes('need') || input.includes('create'))) {
      // Generate initial features
      const features = generateInitialFeatures(userInput);
      const projectName = extractProjectName(userInput);
      
      setProjectData(prev => ({
        ...prev,
        name: projectName,
        description: userInput,
        features
      }));

      return {
        id: Date.now().toString(),
        text: `Perfect! I've generated ${features.length} essential features for your project. You can see them on the right side. 

**Generated Features:**
${features.slice(0, 5).map(f => `• ${f.title}`).join('\n')}
${features.length > 5 ? `... and ${features.length - 5} more!` : ''}

You can:
- Edit any feature by clicking on it
- Add new features by clicking "Add Custom Feature"
- Ask me to add specific features by describing them

What would you like to add or modify?`,
        sender: 'ai',
        timestamp: new Date()
      };
    }

    // Handle feature additions/modifications
    if (input.includes('add') || input.includes('include') || input.includes('need')) {
      const newFeature = generateFeatureFromText(userInput);
      if (newFeature) {
        addFeature(newFeature);
        return {
          id: Date.now().toString(),
          text: `✅ I've added "${newFeature.title}" to your feature list! You can see it on the right side and edit it if needed.

Is there anything else you'd like to add or modify?`,
          sender: 'ai',
          timestamp: new Date()
        };
      }
    }

    // Handle feature removal
    if (input.includes('remove') || input.includes('delete')) {
      return {
        id: Date.now().toString(),
        text: `I can help you remove features! You can click the trash icon next to any feature on the right side to remove it. 

Which specific feature would you like me to help you with?`,
        sender: 'ai',
        timestamp: new Date()
      };
    }

    // Handle project review
    if (input.includes('done') || input.includes('finished') || input.includes('ready') || input.includes('submit')) {
      return {
        id: Date.now().toString(),
        text: `Great! Your project looks comprehensive with ${projectData.features.length} features. 

**Project Summary:**
- **Features:** ${projectData.features.length}
- **Estimated Time:** ${projectData.totalTimeEstimate} hours
- **Estimated Cost:** $${projectData.estimatedCost.toLocaleString()}
- **Timeline:** ${projectData.timeline}

Click "Review & Submit" when you're ready to finalize your project request!`,
        sender: 'ai',
        timestamp: new Date()
      };
    }

    // Default helpful response
    return {
      id: Date.now().toString(),
      text: `I'm here to help you build your feature list! You can:

- **Add features**: "Add user notifications" or "I need payment processing"
- **Modify existing features**: Click on any feature card to edit it
- **Get suggestions**: "What features do I need for an e-commerce site?"
- **Review project**: "I'm done" or "Ready to submit"

What would you like to do next?`,
      sender: 'ai',
      timestamp: new Date()
    };
  };

  const extractProjectName = (description: string): string => {
    const words = description.split(' ').slice(0, 4);
    return words.join(' ').replace(/[^a-zA-Z0-9\s]/g, '') + ' App';
  };

  const generateInitialFeatures = (description: string): Feature[] => {
    const lowerDesc = description.toLowerCase();
    let features: Feature[] = [];

    // Base features every app needs
    const baseFeatures: Feature[] = [
      {
        id: 'auth_1',
        title: 'User Registration & Login',
        description: 'Secure user registration and authentication system',
        category: 'Security',
        priority: 'Critical',
        complexity: 'Moderate',
        timeEstimate: 16
      },
      {
        id: 'ui_1',
        title: 'Responsive Design',
        description: 'Mobile-first responsive design that works on all devices',
        category: 'User Interface',
        priority: 'Critical',
        complexity: 'Moderate',
        timeEstimate: 24,
        status: 'pending',
        createdAt: new Date()
      },
      {
        id: 'data_1',
        title: 'Data Storage',
        description: 'Secure cloud-based data storage with backup capabilities',
        category: 'Core Functionality',
        priority: 'Critical',
        complexity: 'Complex',
        timeEstimate: 32,
        status: 'pending',
        createdAt: new Date()
      }
    ];

    features = [...baseFeatures];

    // E-commerce specific features
    if (lowerDesc.includes('ecommerce') || lowerDesc.includes('shop') || lowerDesc.includes('store') || lowerDesc.includes('buy') || lowerDesc.includes('sell')) {
              features.push(
          {
            id: 'ecom_1',
            title: 'Product Catalog',
            description: 'Display products with images, descriptions, and pricing',
            category: 'Core Functionality',
            priority: 'Critical',
            complexity: 'Moderate',
            timeEstimate: 28,
            status: 'pending',
            createdAt: new Date()
          },
          {
            id: 'ecom_2',
            title: 'Shopping Cart',
            description: 'Add items to cart and manage quantities',
            category: 'Core Functionality',
            priority: 'Critical',
            complexity: 'Moderate',
            timeEstimate: 20,
            status: 'pending',
            createdAt: new Date()
          },
          {
            id: 'ecom_3',
            title: 'Payment Processing',
            description: 'Secure payment processing with Stripe/PayPal integration',
            category: 'Integration',
            priority: 'Critical',
            complexity: 'Complex',
            timeEstimate: 32,
            status: 'pending',
            createdAt: new Date()
          },
          {
            id: 'ecom_4',
            title: 'Order Management',
            description: 'Track orders and manage fulfillment',
            category: 'Core Functionality',
            priority: 'High',
            complexity: 'Moderate',
            timeEstimate: 24,
            status: 'pending',
            createdAt: new Date()
          },
          {
            id: 'ecom_5',
            title: 'Admin Dashboard',
            description: 'Admin interface for managing products and orders',
            category: 'Analytics',
            priority: 'High',
            complexity: 'Complex',
            timeEstimate: 40,
            status: 'pending',
            createdAt: new Date()
          }
        );
    }

    // Social media specific features
    if (lowerDesc.includes('social') || lowerDesc.includes('community') || lowerDesc.includes('network') || lowerDesc.includes('post') || lowerDesc.includes('share')) {
      features.push(
        {
          id: 'social_1',
          title: 'User Profiles',
          description: 'Public user profiles with bio and activity',
          category: 'Core Features',
          priority: 'High',
          complexity: 'Moderate',
          timeEstimate: 20
        },
        {
          id: 'social_2',
          title: 'Post Creation',
          description: 'Create and share posts with text, images, and media',
          category: 'Core Features',
          priority: 'High',
          complexity: 'Moderate',
          timeEstimate: 24
        },
        {
          id: 'social_3',
          title: 'Follow System',
          description: 'Users can follow each other',
          category: 'Core Features',
          priority: 'Medium',
          complexity: 'Moderate',
          timeEstimate: 16
        },
        {
          id: 'social_4',
          title: 'Activity Feed',
          description: 'News feed showing user activities and posts',
          category: 'Core Features',
          priority: 'Medium',
          complexity: 'Moderate',
          timeEstimate: 28
        }
      );
    }

    // Always add some additional common features
    features.push(
      {
        id: 'common_1',
        title: 'Email Notifications',
        description: 'Automated email notifications for important events',
        category: 'Integrations',
        priority: 'High',
        complexity: 'Moderate',
        timeEstimate: 16
      },
      {
        id: 'common_2',
        title: 'User Dashboard',
        description: 'Main dashboard showing user overview and key metrics',
        category: 'Core Features',
        priority: 'High',
        complexity: 'Moderate',
        timeEstimate: 20
      }
    );

    return features;
  };

  const generateFeatureFromText = (text: string): Feature | null => {
    const lowerText = text.toLowerCase();
    
    // Extract feature information from natural language
    let title = '';
    let description = '';
    let category: Feature['category'] = 'Core Features';
    let priority: Feature['priority'] = 'Medium';
    let complexity: Feature['complexity'] = 'Moderate';
    let timeEstimate = 16;

    // Common feature patterns
    if (lowerText.includes('payment') || lowerText.includes('stripe') || lowerText.includes('paypal')) {
      title = 'Payment Processing';
      description = 'Secure payment processing with multiple payment methods';
      category = 'Integrations';
      priority = 'High';
      complexity = 'Complex';
      timeEstimate = 32;
    } else if (lowerText.includes('notification') || lowerText.includes('email')) {
      title = 'Notification System';
      description = 'Send notifications to users via email and in-app';
      category = 'Integrations';
      priority = 'Medium';
      timeEstimate = 16;
    } else if (lowerText.includes('admin') || lowerText.includes('management')) {
      title = 'Admin Panel';
      description = 'Administrative interface for managing the application';
      category = 'Admin';
      priority = 'High';
      complexity = 'Complex';
      timeEstimate = 40;
    } else if (lowerText.includes('chat') || lowerText.includes('messaging')) {
      title = 'Real-time Chat';
      description = 'Live messaging between users';
      category = 'Core Features';
      priority = 'High';
      complexity = 'Complex';
      timeEstimate = 36;
    } else if (lowerText.includes('search')) {
      title = 'Search Functionality';
      description = 'Search through content and data';
      category = 'Core Features';
      priority = 'Medium';
      timeEstimate = 20;
    } else {
      // Extract from the text itself
      const words = text.split(' ').filter(word => 
        !['add', 'include', 'need', 'want', 'i', 'we', 'the', 'a', 'an'].includes(word.toLowerCase())
      );
      
      if (words.length < 2) return null;
      
      title = words.slice(0, 3).join(' ').replace(/[^a-zA-Z0-9\s]/g, '');
      description = `Implement ${title.toLowerCase()} functionality`;
    }

    if (!title) return null;

    return {
      id: `custom_${Date.now()}`,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      description,
      category,
      priority,
      complexity,
      timeEstimate,
      isCustom: true
    };
  };

  const addFeature = (feature: Omit<Feature, 'id'>) => {
    const newFeature: Feature = {
      ...feature,
      id: `feature_${Date.now()}`
    };
    
    setProjectData(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
  };

  const addCustomFeature = () => {
    const newFeature: Feature = {
      id: `custom_${Date.now()}`,
      title: 'New Feature',
      description: 'Click to edit this feature',
      category: 'Core Features',
      priority: 'Medium',
      complexity: 'Moderate',
      timeEstimate: 8,
      isCustom: true
    };
    
    setProjectData(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
    
    setEditingFeature(newFeature.id);
  };

  const updateFeature = (featureId: string, updates: Partial<Feature>) => {
    setProjectData(prev => ({
      ...prev,
      features: prev.features.map(f => 
        f.id === featureId ? { ...f, ...updates } : f
      )
    }));
  };

  const removeFeature = (featureId: string) => {
    setProjectData(prev => ({
      ...prev,
      features: prev.features.filter(f => f.id !== featureId)
    }));
  };

  const filteredFeatures = selectedCategory === 'All' 
    ? projectData.features 
    : projectData.features.filter(f => f.category === selectedCategory);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return '#dc2626';
      case 'High': return '#ea580c';
      case 'Medium': return '#d97706';
      case 'Low': return '#65a30d';
      default: return '#6b7280';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="enhanced-modal-overlay" onClick={onClose}>
      <div className="enhanced-project-modal" onClick={e => e.stopPropagation()}>
        <div className="enhanced-modal-header">
          <div className="modal-title-section">
            <Sparkles size={24} />
            <div>
              <h2>AI-Powered Project Builder</h2>
              <p>{step === 'chat' ? 'Chat with AI to build your feature list' : 'Review and finalize your project'}</p>
            </div>
          </div>
          <div className="modal-header-actions">
            {step === 'chat' && projectData.features.length > 0 && (
              <button 
                className="review-btn"
                onClick={() => setStep('review')}
              >
                Review & Submit
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="enhanced-modal-content">
          {step === 'chat' && (
            <div className="chat-features-layout">
              {/* AI Chat Section */}
              <div className="ai-chat-section">
                <div className="chat-header">
                  <MessageSquare size={20} />
                  <h3>AI Assistant</h3>
                </div>
                
                <div className="chat-messages">
                  {messages.map(message => (
                    <div key={message.id} className={`message ${message.sender}`}>
                      <div className="message-content">
                        {message.text.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                      <div className="message-time">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="message ai">
                      <div className="message-content typing">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="chat-input">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Describe your project or ask for specific features..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>

              {/* Features Section */}
              <div className="features-section">
                <div className="features-header">
                  <div className="features-title">
                    <List size={20} />
                    <h3>Generated Features</h3>
                    {projectData.features.length > 0 && (
                      <span className="feature-count">({projectData.features.length})</span>
                    )}
                  </div>
                  
                  {projectData.features.length > 0 && (
                    <div className="features-stats">
                      <div className="stat">
                        <span className="stat-number">{projectData.totalTimeEstimate}h</span>
                        <span className="stat-label">Time</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">${projectData.estimatedCost.toLocaleString()}</span>
                        <span className="stat-label">Cost</span>
                      </div>
                    </div>
                  )}
                </div>

                {projectData.features.length === 0 ? (
                  <div className="no-features">
                    <Wand2 size={48} />
                    <h4>No features yet</h4>
                    <p>Chat with the AI to describe your project and generate features automatically!</p>
                  </div>
                ) : (
                  <div className="features-content">
                    <div className="features-filters">
                      {categories.map(category => (
                        <button
                          key={category}
                          className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                          <span className="category-count">
                            {category === 'All' 
                              ? projectData.features.length 
                              : projectData.features.filter(f => f.category === category).length
                            }
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="features-list">
                      {filteredFeatures.map(feature => (
                        <div key={feature.id} className="feature-card">
                          {editingFeature === feature.id ? (
                            <div className="feature-edit-form">
                              <input
                                type="text"
                                value={feature.title}
                                onChange={(e) => updateFeature(feature.id, { title: e.target.value })}
                                className="feature-title-input"
                              />
                              <textarea
                                value={feature.description}
                                onChange={(e) => updateFeature(feature.id, { description: e.target.value })}
                                className="feature-description-input"
                                rows={2}
                              />
                              <div className="feature-properties">
                                <select
                                  value={feature.priority}
                                  onChange={(e) => updateFeature(feature.id, { priority: e.target.value as Feature['priority'] })}
                                >
                                  <option value="Critical">Critical</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                                <input
                                  type="number"
                                  value={feature.timeEstimate}
                                  onChange={(e) => updateFeature(feature.id, { timeEstimate: parseInt(e.target.value) || 0 })}
                                  className="time-input"
                                  placeholder="Hours"
                                />
                              </div>
                              <div className="feature-edit-actions">
                                <button 
                                  className="save-feature-btn"
                                  onClick={() => setEditingFeature(null)}
                                >
                                  <CheckCircle size={16} />
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="feature-display">
                              <div className="feature-header">
                                <h4>{feature.title}</h4>
                                <div className="feature-actions">
                                  <button 
                                    className="edit-feature-btn"
                                    onClick={() => setEditingFeature(feature.id)}
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button 
                                    className="remove-feature-btn"
                                    onClick={() => removeFeature(feature.id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <p className="feature-description">{feature.description}</p>
                              <div className="feature-metadata">
                                <span 
                                  className="priority-badge"
                                  style={{ backgroundColor: getPriorityColor(feature.priority) }}
                                >
                                  {feature.priority}
                                </span>
                                <span className="time-badge">
                                  <Clock size={12} />
                                  {feature.timeEstimate}h
                                </span>
                                <span className="category-badge">
                                  {feature.category}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <button className="add-feature-btn" onClick={addCustomFeature}>
                        <Plus size={16} />
                        Add Custom Feature
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="review-step">
              <div className="review-header">
                <CheckCircle size={24} />
                <div>
                  <h3>Project Review</h3>
                  <p>Review your project details before submission</p>
                </div>
              </div>

              <div className="review-content">
                <div className="review-layout">
                  <div className="project-details-section">
                    <h4>Project Information</h4>
                    <div className="form-group">
                      <label>Project Name</label>
                      <input
                        type="text"
                        value={projectData.name}
                        onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your project name"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Project Description</label>
                      <textarea
                        value={projectData.description}
                        onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Provide a detailed description"
                        rows={4}
                        className="form-textarea"
                      />
                    </div>
                  </div>

                  <div className="project-summary-section">
                    <h4>Project Summary</h4>
                    <div className="summary-cards">
                      <div className="summary-card">
                        <div className="summary-number">{projectData.features.length}</div>
                        <div className="summary-label">Features</div>
                      </div>
                      <div className="summary-card">
                        <div className="summary-number">{projectData.totalTimeEstimate}</div>
                        <div className="summary-label">Hours</div>
                      </div>
                      <div className="summary-card">
                        <div className="summary-number">${projectData.estimatedCost.toLocaleString()}</div>
                        <div className="summary-label">Cost</div>
                      </div>
                      <div className="summary-card">
                        <div className="summary-number">{projectData.timeline}</div>
                        <div className="summary-label">Timeline</div>
                      </div>
                    </div>
                    
                    <div className="feature-summary">
                      <h5>Features Summary ({projectData.features.length})</h5>
                      <div className="features-grid">
                        {projectData.features.map(feature => (
                          <div key={feature.id} className="feature-summary-item">
                            <span className="feature-name">{feature.title}</span>
                            <span className="feature-time">{feature.timeEstimate}h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="review-actions">
                <button 
                  className="back-btn"
                  onClick={() => setStep('chat')}
                >
                  ← Back to Chat
                </button>
                <button 
                  className="submit-project-btn"
                  onClick={() => onSubmit(projectData)}
                  disabled={!projectData.name || !projectData.description || projectData.features.length === 0}
                >
                  Submit Project Request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedProjectRequestModal; 