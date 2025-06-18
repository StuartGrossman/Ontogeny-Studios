import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aiService, Message, Conversation } from '../services/aiService';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/AIChatModal.css';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Welcome to Ontogeny Labs Project Consultant!\n\nI'm here to help you define the features for your new software project. Let's work together to create a comprehensive feature list that our development team can bring to life.\n\n🎯 **What I need from you:**\n• Tell me about your project idea\n• Describe the features you envision\n• Share any specific requirements or goals\n\nThe more detail you provide, the better I can help you refine and organize your feature requirements. What project are you thinking about building?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
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
    
    setIsSubmittingProject(true);
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
    } finally {
      setIsSubmittingProject(false);
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
      text: "👋 Welcome to Ontogeny Labs Project Consultant!\n\nI'm here to help you define the features for your new software project. Let's work together to create a comprehensive feature list that our development team can bring to life.\n\n🎯 **What I need from you:**\n• Tell me about your project idea\n• Describe the features you envision\n• Share any specific requirements or goals\n\nThe more detail you provide, the better I can help you refine and organize your feature requirements. What project are you thinking about building?",
      sender: 'ai',
      timestamp: new Date()
    }]);
    setConversationId('');
    setError('');
    onClose();
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
              <h3>AI Project Consultant</h3>
              <span className="chat-subtitle">Let's plan your next project</span>
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
                  {message.text.split('\n').map((line, index) => {
                    // Handle markdown-style formatting
                    let formattedLine = line;
                    
                    // Bold text **text**
                    if (formattedLine.includes('**')) {
                      const parts = formattedLine.split('**');
                      return (
                        <React.Fragment key={index}>
                          {parts.map((part, partIndex) => 
                            partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part
                          )}
                          {index < message.text.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      );
                    }
                    
                    // List items starting with •
                    if (formattedLine.trim().startsWith('•')) {
                      return (
                        <React.Fragment key={index}>
                          <div className="message-list-item">{formattedLine}</div>
                          {index < message.text.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      );
                    }
                    
                    return (
                      <React.Fragment key={index}>
                        {formattedLine}
                        {index < message.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    );
                  })}
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
            <span className="suggestion-label">Project ideas:</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatModal; 