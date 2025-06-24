import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Lightbulb, Eye, Plus, ArrowRight, CheckCircle } from 'lucide-react';

interface AddFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (featureData: any) => void;
  project?: any;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'consultant';
  timestamp: Date;
}

interface Requirement {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
}

const AddFeatureModal: React.FC<AddFeatureModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project 
}) => {
  // State management
  const [step, setStep] = useState<'chat' | 'review'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Feature data
  const [featureName, setFeatureName] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [category, setCategory] = useState('Feature');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [estimatedHours, setEstimatedHours] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: `Hi! I'm your AI Feature Consultant. I'll help you design a new feature for "${project?.name || 'your project'}". 

What feature would you like to add? Describe your idea and I'll help you break it down into requirements.`,
        sender: 'consultant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, project?.name]);

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
    const consultantMessage: Message = {
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
    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    processUserMessage(currentMessage);
    setCurrentMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const proceedToReview = () => {
    if (featureName && requirements.length > 0) {
      setStep('review');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const featureData = {
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
      };

      await onSubmit(featureData);
      handleClose();
    } catch (error) {
      console.error('Error adding feature:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset all state
    setStep('chat');
    setMessages([]);
    setCurrentMessage('');
    setFeatureName('');
    setFeatureDescription('');
    setRequirements([]);
    setCategory('Feature');
    setPriority('medium');
    setEstimatedHours(0);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="add-feature-modal-overlay" onClick={handleClose}>
      <div className="add-feature-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <Plus className="header-icon" />
            <div className="header-text">
              <h2>Add New Feature</h2>
              <p>Step {step === 'chat' ? '1' : '2'} of 2: {step === 'chat' ? 'AI Consultation' : 'Review & Submit'}</p>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="modal-body">
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
                  onKeyPress={handleKeyPress}
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
        <div className="modal-footer">
          {step === 'chat' ? (
            <>
              <button onClick={handleClose} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={proceedToReview}
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
                onClick={handleSubmit}
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
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddFeatureModal; 