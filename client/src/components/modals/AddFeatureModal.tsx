import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Settings, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, Send, Lightbulb, Eye, Plus } from 'lucide-react';

interface AddFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (featureData: any) => void;
  project?: any;
}

interface FeatureRequirement {
  id: string;
  text: string;
  category: string;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedHours: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'consultant';
  timestamp: Date;
}

const AddFeatureModal: React.FC<AddFeatureModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project
}) => {
  const [currentStep, setCurrentStep] = useState<'consultation' | 'review'>('consultation');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConsultantTyping, setIsConsultantTyping] = useState(false);
  const [featureName, setFeatureName] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [featureRequirements, setFeatureRequirements] = useState<FeatureRequirement[]>([]);
  const [featureCategory, setFeatureCategory] = useState('Core Features');
  const [featurePriority, setFeaturePriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Core Features', 'Authentication & Security', 'UI/UX Improvements', 
    'Payment & Billing', 'Notifications', 'Integrations & APIs', 
    'Performance', 'Analytics', 'Mobile & Responsive', 'Admin Tools', 'Other'
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial consultant greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addConsultantMessage(`Hello! I'm your AI feature consultant. I'll help you design and define your new feature for "${project?.name || 'your project'}". 

What kind of feature would you like to add? Tell me about your idea, and I'll help you break it down into specific requirements and provide estimates.`);
      }, 500);
    }
  }, [isOpen]);

  const addConsultantMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'consultant',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const processUserMessage = async (message: string) => {
    setIsConsultantTyping(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Analyze message and generate response with feature details
    const analysisResult = analyzeFeatureRequest(message);
    
    if (analysisResult) {
      // Update feature details based on analysis
      if (analysisResult.name && !featureName) {
        setFeatureName(analysisResult.name);
      }
      if (analysisResult.description) {
        setFeatureDescription(analysisResult.description);
      }
      if (analysisResult.requirements) {
        setFeatureRequirements(prev => [...prev, ...analysisResult.requirements]);
      }
      if (analysisResult.category) {
        setFeatureCategory(analysisResult.category);
      }
      if (analysisResult.estimatedTime) {
        setEstimatedTime(prev => prev + analysisResult.estimatedTime);
      }
      
      addConsultantMessage(analysisResult.response);
    } else {
      addConsultantMessage("I understand. Can you provide more details about what this feature should do and how users will interact with it?");
    }
    
    setIsConsultantTyping(false);
  };

  const analyzeFeatureRequest = (message: string): any => {
    const lowerMessage = message.toLowerCase();
    
    // Simple AI-like analysis based on keywords
    if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
      return {
        name: 'Advanced Search',
        description: 'Enhanced search functionality with filters and advanced options',
        category: 'Core Features',
        estimatedTime: 20,
        requirements: [
          {
            id: '1',
            text: 'Search input field with autocomplete',
            category: 'UI Components',
            complexity: 'moderate' as const,
            estimatedHours: 6
          },
          {
            id: '2',
            text: 'Advanced filter options',
            category: 'Functionality',
            complexity: 'moderate' as const,
            estimatedHours: 8
          },
          {
            id: '3',
            text: 'Search results pagination',
            category: 'UI Components',
            complexity: 'simple' as const,
            estimatedHours: 4
          }
        ],
        response: `Great! I can see you want to add search functionality. I've outlined a comprehensive search feature that includes:

• Search input with autocomplete suggestions
• Advanced filtering options
• Paginated results display

This would enhance user experience significantly. Would you like me to add any specific search filters or modify any of these requirements?`
      };
    }
    
    if (lowerMessage.includes('chat') || lowerMessage.includes('message') || lowerMessage.includes('communication')) {
      return {
        name: 'Real-time Messaging',
        description: 'Live chat system for user communication',
        category: 'Communication',
        estimatedTime: 35,
        requirements: [
          {
            id: '1',
            text: 'Chat interface design',
            category: 'UI Components',
            complexity: 'moderate' as const,
            estimatedHours: 10
          },
          {
            id: '2',
            text: 'Real-time messaging backend',
            category: 'Backend',
            complexity: 'complex' as const,
            estimatedHours: 15
          },
          {
            id: '3',
            text: 'Message history and persistence',
            category: 'Database',
            complexity: 'moderate' as const,
            estimatedHours: 8
          }
        ],
        response: `Excellent idea! A messaging system would really improve user engagement. I've designed a complete chat solution including:

• Modern chat interface with emoji support
• Real-time message delivery
• Message history and search
• Online status indicators

Would you like to add file sharing capabilities or group chat features to this?`
      };
    }
    
    if (lowerMessage.includes('notification') || lowerMessage.includes('alert') || lowerMessage.includes('remind')) {
      return {
        name: 'Smart Notifications',
        description: 'Intelligent notification system with multiple delivery channels',
        category: 'Notifications',
        estimatedTime: 25,
        requirements: [
          {
            id: '1',
            text: 'In-app notification center',
            category: 'UI Components',
            complexity: 'moderate' as const,
            estimatedHours: 8
          },
          {
            id: '2',
            text: 'Email notification templates',
            category: 'Templates',
            complexity: 'simple' as const,
            estimatedHours: 6
          },
          {
            id: '3',
            text: 'Push notification service',
            category: 'Backend',
            complexity: 'complex' as const,
            estimatedHours: 12
          }
        ],
        response: `Perfect! Notifications are crucial for user engagement. I've created a comprehensive notification system:

• In-app notification center with badges
• Email notifications with custom templates  
• Push notifications for mobile users
• User preference controls

Should we add SMS notifications or specific notification triggers?`
      };
    }
    
    return null;
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    addUserMessage(inputMessage);
    processUserMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const proceedToReview = () => {
    if (!featureName || featureRequirements.length === 0) {
      addConsultantMessage("I need a bit more information to create your feature specification. Can you tell me more about what you'd like this feature to do?");
      return;
    }
    setCurrentStep('review');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const featureData = {
        name: featureName,
        description: featureDescription,
        category: featureCategory,
        priority: featurePriority,
        requirements: featureRequirements,
        estimatedHours: estimatedTime,
        status: 'pending',
        projectId: project?.id,
        requestedAt: new Date(),
        consultationMessages: messages
      };

      await onSubmit(featureData);
      onClose();
      
      // Reset form
      setCurrentStep('consultation');
      setMessages([]);
      setFeatureName('');
      setFeatureDescription('');
      setFeatureRequirements([]);
      setEstimatedTime(0);
      
    } catch (error) {
      console.error('Error adding feature:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeRequirement = (id: string) => {
    setFeatureRequirements(prev => prev.filter(req => req.id !== id));
    const removedReq = featureRequirements.find(req => req.id === id);
    if (removedReq) {
      setEstimatedTime(prev => prev - removedReq.estimatedHours);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content add-feature-modal-enhanced">
        <div className="modal-header">
          <div className="modal-title-section">
            <Plus size={24} />
            <div>
              <h2>Add New Feature</h2>
              <p>Step {currentStep === 'consultation' ? '1' : '2'} of 2: {currentStep === 'consultation' ? 'Feature Consultation' : 'Review & Submit'}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-split">
          {/* Left Side - Feature Consultant */}
          <div className="consultant-panel">
            <div className="consultant-header">
              <div className="consultant-avatar">
                <Lightbulb size={20} />
              </div>
              <div className="consultant-info">
                <h3>AI Feature Consultant</h3>
                <span className="consultant-status">Online</span>
              </div>
            </div>
            
            <div className="chat-messages">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isConsultantTyping && (
                <div className="message consultant">
                  <div className="message-content typing">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {currentStep === 'consultation' && (
              <div className="chat-input">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your feature idea..."
                  className="message-input"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="send-button"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Right Side - Live Preview */}
          <div className="preview-panel">
            <div className="preview-header">
              <Eye size={20} />
              <h3>Feature Specification</h3>
            </div>
            
            <div className="feature-preview">
              {featureName ? (
                <>
                  <div className="preview-section">
                    <h4>Feature Name</h4>
                    <div className="feature-name-display">{featureName}</div>
                  </div>
                  
                  {featureDescription && (
                    <div className="preview-section">
                      <h4>Description</h4>
                      <div className="feature-description-display">{featureDescription}</div>
                    </div>
                  )}
                  
                  <div className="preview-section">
                    <h4>Category & Priority</h4>
                    <div className="feature-meta">
                      <span className={`category-badge ${featureCategory.toLowerCase().replace(/\s+/g, '-')}`}>
                        {featureCategory}
                      </span>
                      <span className={`priority-badge priority-${featurePriority}`}>
                        {featurePriority} priority
                      </span>
                    </div>
                  </div>
                  
                  {featureRequirements.length > 0 && (
                    <div className="preview-section">
                      <h4>Requirements ({featureRequirements.length})</h4>
                      <div className="requirements-list">
                        {featureRequirements.map((req, index) => (
                          <div key={req.id} className="requirement-item">
                            <div className="requirement-content">
                              <span className="requirement-number">{index + 1}</span>
                              <span className="requirement-text">{req.text}</span>
                              <span className={`complexity-badge ${req.complexity}`}>
                                {req.complexity}
                              </span>
                            </div>
                            {currentStep === 'review' && (
                              <button
                                onClick={() => removeRequirement(req.id)}
                                className="remove-requirement"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {estimatedTime > 0 && (
                    <div className="preview-section">
                      <h4>Time Estimate</h4>
                      <div className="time-estimate">
                        <span className="estimate-number">{estimatedTime}</span>
                        <span className="estimate-unit">hours</span>
                        <span className="estimate-days">({Math.ceil(estimatedTime / 8)} days)</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="preview-placeholder">
                  <MessageSquare size={48} />
                  <p>Start chatting with the AI consultant to build your feature specification</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          {currentStep === 'consultation' ? (
            <>
              <button onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={proceedToReview}
                disabled={!featureName || featureRequirements.length === 0}
                className="btn-primary"
              >
                Review Feature <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentStep('consultation')}
                className="btn-secondary"
              >
                <ArrowLeft size={16} /> Back to Chat
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <Settings className="spinning" size={16} />
                    Adding Feature...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Add Feature to Project
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFeatureModal; 