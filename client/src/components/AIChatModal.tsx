import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aiService, Message, Conversation } from '../services/aiService';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/AIChatModal.css';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextStep?: (conversationData: any) => void;
  mode?: 'project-request' | 'feature-request';
  project?: any;
}

// Helper function to format message text with better rendering
const formatMessageText = (text: string): React.ReactNode => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Skip empty lines but add spacing
    if (!trimmedLine) {
      if (i > 0 && i < lines.length - 1) {
        elements.push(<br key={`br-${i}`} />);
      }
      continue;
    }
    
    // Handle headers (lines starting with #)
    if (trimmedLine.startsWith('#')) {
      const headerLevel = trimmedLine.match(/^#+/)?.[0].length || 1;
      const headerText = trimmedLine.replace(/^#+\s*/, '');
      const level = Math.min(headerLevel, 6);
      
      if (level === 1) {
        elements.push(<h1 key={`header-${i}`}>{formatInlineText(headerText)}</h1>);
      } else if (level === 2) {
        elements.push(<h2 key={`header-${i}`}>{formatInlineText(headerText)}</h2>);
      } else if (level === 3) {
        elements.push(<h3 key={`header-${i}`}>{formatInlineText(headerText)}</h3>);
      } else if (level === 4) {
        elements.push(<h4 key={`header-${i}`}>{formatInlineText(headerText)}</h4>);
      } else if (level === 5) {
        elements.push(<h5 key={`header-${i}`}>{formatInlineText(headerText)}</h5>);
      } else {
        elements.push(<h6 key={`header-${i}`}>{formatInlineText(headerText)}</h6>);
      }
      continue;
    }
    
    // Handle bullet points (•, -, *, or numbered lists)
    if (trimmedLine.match(/^[•\-\*]\s+/) || trimmedLine.match(/^\d+\.\s+/)) {
      const listText = trimmedLine.replace(/^[•\-\*]\s+/, '').replace(/^\d+\.\s+/, '');
      elements.push(
        <div key={`list-${i}`} className="message-list-item">
          {formatInlineText(listText)}
        </div>
      );
      continue;
    }
    
    // Handle regular paragraphs
    if (trimmedLine.length > 0) {
      elements.push(
        <p key={`p-${i}`}>
          {formatInlineText(trimmedLine)}
        </p>
      );
    }
  }
  
  return <>{elements}</>;
};

// Helper function to format inline text (bold, italic, etc.)
const formatInlineText = (text: string): React.ReactNode => {
  // Handle bold text **text**
  if (text.includes('**')) {
    const parts = text.split('**');
    return (
      <>
        {parts.map((part, index) => 
          index % 2 === 1 ? <strong key={index}>{part}</strong> : part
        )}
      </>
    );
  }
  
  // Handle italic text *text*
  if (text.includes('*') && !text.includes('**')) {
    const parts = text.split('*');
    return (
      <>
        {parts.map((part, index) => 
          index % 2 === 1 ? <em key={index}>{part}</em> : part
        )}
      </>
    );
  }
  
  return text;
};

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, onNextStep, mode = 'project-request', project }) => {
  const { currentUser } = useAuth();
  const getInitialMessage = () => {
    if (mode === 'feature-request') {
      return `👋 Welcome to Ontogeny Labs Feature Consultant!\n\nI'm here to help you define a new feature for your project "${project?.name}". Let's work together to create a detailed feature specification that our development team can implement.\n\n🎯 **What I need from you:**\n• Describe the feature you want to add\n• Explain why this feature is needed\n• Share any specific functionality requirements\n• Mention any API integrations needed\n\nThe more detail you provide, the better I can help you refine and organize your feature requirements. What feature would you like to add to ${project?.name}?`;
    } else {
      return "👋 Welcome to Ontogeny Labs Project Consultant!\n\nI'm here to help you define the features for your new software project. Let's work together to create a comprehensive feature list that our development team can bring to life.\n\n🎯 **What I need from you:**\n• Tell me about your project idea\n• Describe the features you envision\n• Share any specific requirements or goals\n\nThe more detail you provide, the better I can help you refine and organize your feature requirements. What project are you thinking about building?";
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: getInitialMessage(),
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !conversationId) {
      // Create new conversation when modal opens
      const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setConversationId(newConversationId);
    }
  }, [isOpen, conversationId]);

  const submitProjectRequest = async (projectName: string, features: string, description: string) => {
    if (!currentUser) return false;
    
    try {
      await addDoc(collection(db, 'user_project_requests'), {
        projectName: projectName.trim(),
        description: description.trim(),
        features: features.trim(),
        requestedBy: currentUser.uid,
        requestedByName: currentUser.displayName || currentUser.email,
        requestedByEmail: currentUser.email,
        status: 'requested',
        priority: 'medium',
        conversationId: conversationId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Project request submitted successfully');
      return true;
    } catch (error) {
      console.error('Error submitting project request:', error);
      return false;
    }
  };

  const getAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    setError('');
    
    try {
      // Add user message to conversation
      const userMessageObj: Message = {
        id: Date.now().toString(),
        text: userMessage,
        sender: 'user',
        timestamp: new Date()
      };
      
      const updatedMessages = [...messages, userMessageObj];
      setMessages(updatedMessages);
      
      // Get AI response
      const response = await aiService.getAIResponse(updatedMessages);
      
      if (response.success && response.message) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.message,
          sender: 'ai',
          timestamp: new Date()
        };
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        
        // Check if AI wants to submit the project
        if (response.shouldSubmitProject && response.projectData) {
          console.log('AI detected project submission intent:', response.projectData);
          
          // Submit the project request
          const success = await submitProjectRequest(
            response.projectData.name,
            response.projectData.features,
            response.projectData.description
          );
          
          if (success) {
            // Add success message
            const successMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: "✅ **Project Request Submitted Successfully!**\n\nYour project request has been submitted to our development team. You can view the status of your request in your dashboard under 'Requested Projects'.\n\nThank you for choosing Ontogeny Labs! 🚀",
              sender: 'ai',
              timestamp: new Date()
            };
            
            const successMessages = [...finalMessages, successMessage];
            setMessages(successMessages);
          } else {
            // Add error message
            const errorMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: "❌ **Project Submission Failed**\n\nI'm sorry, there was an error submitting your project request. Please try again later or contact support.\n\nYour conversation has been saved and you can continue refining your project requirements.",
              sender: 'ai',
              timestamp: new Date()
            };
            
            const errorMessages = [...finalMessages, errorMessage];
            setMessages(errorMessages);
          }
        }
        
        // Save conversation
        if (currentUser) {
          const conversation: Conversation = {
            id: conversationId,
            userId: currentUser.uid,
            messages: finalMessages,
            createdAt: new Date(),
            updatedAt: new Date(),
            title: aiService.generateConversationTitle(finalMessages)
          };
          
          try {
            await aiService.saveConversation(conversation);
          } catch (error) {
            console.error('Error saving conversation:', error);
          }
        }
      } else {
        setError(response.error || 'Failed to get AI response');
        console.error('AI Response Error:', response.error);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error in getAIResponse:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const messageText = inputValue.trim();
    setInputValue('');
    
    await getAIResponse(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const extractProjectDataFromConversation = () => {
    // Extract information from the conversation based on mode
    const allText = messages.map(msg => msg.text).join('\n');
    
    if (mode === 'feature-request') {
      return {
        featureName: extractFeatureName(allText),
        description: extractDescription(allText),
        conversation: messages,
        conversationId: conversationId
      };
    } else {
      return {
        name: extractProjectName(allText),
        description: extractDescription(allText),
        features: extractFeatures(allText),
        conversation: messages,
        conversationId: conversationId
      };
    }
  };

  const extractFeatureName = (text: string): string => {
    // Look for patterns like "I want to add..." or "I need..."
    const patterns = [
      /(?:i want to add|i want to build|i need|i'd like to add|add)\s+(?:a|an)?\s*([^.!?\n]+)/i,
      /feature\s*(?:name|title)?\s*:?\s*([^.!?\n]+)/i,
      /(?:called|named)\s+([^.!?\n]+)/i,
      /implement\s+([^.!?\n]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const featureName = match[1].trim().replace(/['"]/g, '');
        if (featureName.length > 3 && featureName.length < 100) {
          return featureName.charAt(0).toUpperCase() + featureName.slice(1);
        }
      }
    }
    
    return 'New Feature';
  };

  const extractProjectName = (text: string): string => {
    // Look for patterns like "I want to build..." or "My project is..."
    const patterns = [
      /(?:i want to build|i'm building|my project is|the project is called|i need)\s+(?:a|an)?\s*([^.!?\n]+)/i,
      /project\s*(?:name|title)?\s*:?\s*([^.!?\n]+)/i,
      /(?:called|named)\s+([^.!?\n]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().replace(/['"]/g, '');
      }
    }
    
    return 'My Project';
  };

  const extractDescription = (_text: string): string => {
    // Extract meaningful description from user messages
    const userMessages = messages.filter(msg => msg.sender === 'user');
    if (userMessages.length > 0) {
      // Use the first substantial user message as description
      const firstMessage = userMessages[0].text;
      return firstMessage.length > 20 ? firstMessage : 'Project description from consultation';
    }
    return 'Project description from consultation';
  };

  const extractFeatures = (text: string): string => {
    const features: { text: string; priority: 'high' | 'medium' | 'low' }[] = [];
    
    // Look for feature lists or feature mentions
    const featurePatterns = [
      /features?\s*:?\s*([^.!?\n]+(?:\n[^.!?\n]+)*)/i,
      /(?:include|need|want|require)s?\s*:?\s*([^.!?\n]+(?:\n[^.!?\n]+)*)/i,
      /functionality\s*:?\s*([^.!?\n]+(?:\n[^.!?\n]+)*)/i
    ];
    
    // Extract bullet points or numbered lists
    const bulletPoints = text.match(/[•\-\*]\s*([^.\n]+)/g);
    if (bulletPoints) {
      bulletPoints.forEach(point => {
        const cleanPoint = point.replace(/[•\-\*]\s*/, '').trim();
        if (cleanPoint.length > 3) {
          features.push({
            text: cleanPoint,
            priority: determinePriority(cleanPoint)
          });
        }
      });
    }
    
    // Extract features from patterns
    for (const pattern of featurePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const featureText = match[1].trim();
        const subFeatures = featureText.split(/[,\n]/).filter(f => f.trim().length > 3);
        subFeatures.forEach(feature => {
          const cleanFeature = feature.trim();
          if (!features.some(f => f.text.toLowerCase().includes(cleanFeature.toLowerCase()))) {
            features.push({
              text: cleanFeature,
              priority: determinePriority(cleanFeature)
            });
          }
        });
      }
    }
    
    // Sort by priority and format
    const sortedFeatures = features.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    if (sortedFeatures.length === 0) {
      return 'Features discussed in consultation';
    }
    
    return sortedFeatures
      .map(feature => `${feature.text} (${feature.priority} priority)`)
      .join('\n');
  };

  const determinePriority = (featureText: string): 'high' | 'medium' | 'low' => {
    const lowercaseText = featureText.toLowerCase();
    
    // High priority keywords
    const highPriorityKeywords = [
      'authentication', 'login', 'security', 'payment', 'database', 'user management',
      'core', 'essential', 'critical', 'must have', 'required', 'necessary'
    ];
    
    // Low priority keywords  
    const lowPriorityKeywords = [
      'nice to have', 'optional', 'future', 'enhancement', 'polish', 'styling',
      'theme', 'animation', 'decoration', 'cosmetic', 'later'
    ];
    
    // Check for high priority
    if (highPriorityKeywords.some(keyword => lowercaseText.includes(keyword))) {
      return 'high';
    }
    
    // Check for low priority
    if (lowPriorityKeywords.some(keyword => lowercaseText.includes(keyword))) {
      return 'low';
    }
    
    // Default to medium priority
    return 'medium';
  };

  const handleNextStep = () => {
    if (onNextStep) {
      const projectData = extractProjectDataFromConversation();
      onNextStep(projectData);
    }
  };

  const handleClose = () => {
    // Save conversation before closing if there are user messages
    const userMessages = messages.filter(msg => msg.sender === 'user');
    if (userMessages.length > 0 && currentUser) {
      const conversation: Conversation = {
        id: conversationId,
        userId: currentUser.uid,
        messages: messages,
        createdAt: new Date(),
        updatedAt: new Date(),
        title: aiService.generateConversationTitle(messages)
      };
      
      aiService.saveConversation(conversation).catch(error => {
        console.error('Error saving conversation on close:', error);
      });
    }
    
    // Reset state
    setMessages([{
      id: '1',
      text: getInitialMessage(),
      sender: 'ai',
      timestamp: new Date()
    }]);
    setConversationId('');
    setError('');
    onClose();
  };

  // Check if there's enough conversation to proceed to next step
  const canProceedToNextStep = () => {
    const userMessages = messages.filter(msg => msg.sender === 'user');
    return userMessages.length >= 2; // At least 2 user messages for meaningful conversation
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-modal-overlay" onClick={handleClose}>
      <div className="ai-chat-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-title">
            <div className="ai-avatar">🤖</div>
            <div>
              <h3>{mode === 'feature-request' ? 'Feature Consultant' : 'Project Consultant'}</h3>
              <span className="chat-subtitle">
                {mode === 'feature-request' 
                  ? `Let's discuss your feature idea for ${project?.name}` 
                  : "Let's plan your next project"
                }
              </span>
            </div>
          </div>
          <button className="chat-close" onClick={handleClose}>×</button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="chat-error">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-avatar">
                {message.sender === 'ai' ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {formatMessageText(message.text)}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message ai">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
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

        {/* Input */}
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              className="chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your project idea..."
              rows={1}
              disabled={isTyping}
            />
            <button 
              className="send-button"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
          <div className="chat-suggestions">
            <span className="suggestion-label">
              {mode === 'feature-request' ? 'Feature ideas:' : 'Project ideas:'}
            </span>
            {mode === 'feature-request' ? (
              <>
                <button 
                  className="suggestion-chip"
                  onClick={() => setInputValue("I want to add user authentication with login, signup, and password reset functionality.")}
                  disabled={isTyping}
                >
                  User Authentication
                </button>
                <button 
                  className="suggestion-chip"
                  onClick={() => setInputValue("I need to integrate payment processing with Stripe API for subscription billing.")}
                  disabled={isTyping}
                >
                  Payment Integration
                </button>
                <button 
                  className="suggestion-chip"
                  onClick={() => setInputValue("I want to add real-time notifications with email and push notification support.")}
                  disabled={isTyping}
                >
                  Notifications
                </button>
              </>
            ) : (
              <>
                <button 
                  className="suggestion-chip"
                  onClick={() => setInputValue("I want to build an e-commerce platform with user accounts, shopping cart, payment processing, and inventory management features.")}
                  disabled={isTyping}
                >
                  E-commerce Platform
                </button>
                <button 
                  className="suggestion-chip"
                  onClick={() => setInputValue("I need a mobile app with user authentication, push notifications, offline mode, and social sharing features.")}
                  disabled={isTyping}
                >
                  Mobile App
                </button>
                <button 
                  className="suggestion-chip"
                  onClick={() => setInputValue("I want a dashboard with real-time analytics, data visualization, user management, and reporting features.")}
                  disabled={isTyping}
                >
                  Analytics Dashboard
                </button>
              </>
            )}
          </div>
          
          {/* Next Step Button */}
          {canProceedToNextStep() && onNextStep && (
            <div className="chat-next-step">
              <div className="next-step-guidance">
                <div className="guidance-text">
                  💡 <strong>Ready to proceed?</strong> When you feel like your {mode === 'feature-request' ? 'feature' : 'project'} has been detailed out well enough, hit the Next Step button to continue with the technical specifications.
                </div>
              </div>
              <button 
                className="next-step-button"
                onClick={handleNextStep}
                disabled={isTyping}
              >
                <span>Next Step</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
              <span className="next-step-description">
                {mode === 'feature-request' 
                  ? 'Continue to feature specifications' 
                  : 'Continue to project details'
                }
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChatModal; 