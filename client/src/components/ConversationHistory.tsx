import React, { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { aiService, Conversation } from '../services/aiService';
import '../styles/ConversationHistory.css';

interface ConversationHistoryProps {
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ onSelectConversation }) => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const convs = await aiService.getConversations();
      setConversations(convs);
    } catch (error) {
      setError('Failed to load conversations');
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getMessagePreview = (messages: any[]) => {
    const userMessage = messages.find(msg => msg.sender === 'user');
    if (userMessage) {
      return userMessage.text.length > 50 
        ? userMessage.text.substring(0, 50) + '...'
        : userMessage.text;
    }
    return 'No messages yet';
  };

  if (loading) {
    return (
      <div className="conversation-history">
        <div className="history-header">
          <h3>Project Plans</h3>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="conversation-history">
        <div className="history-header">
          <h3>Project Plans</h3>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadConversations} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-history">
      <div className="history-header">
        <h3>Project Plans</h3>
        <span className="conversation-count">{conversations.length} plans</span>
      </div>
      
      {conversations.length === 0 ? (
        <div className="empty-state">
          <ClipboardList className="empty-icon" size={48} />
          <p>No project plans yet</p>
          <span>Start a conversation to create your first plan</span>
        </div>
      ) : (
        <div className="conversations-list">
          {conversations.map((conversation) => (
            <div 
              key={conversation.id} 
              className="conversation-item"
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="conversation-header">
                <h4>{conversation.title}</h4>
                <span className="conversation-date">
                  {formatDate(conversation.updatedAt)}
                </span>
              </div>
              <p className="conversation-preview">
                {getMessagePreview(conversation.messages)}
              </p>
              <div className="conversation-meta">
                <span className="message-count">
                  {conversation.messages.length} messages
                </span>
                <span className="conversation-status">
                  {conversation.messages.length > 2 ? 'Active' : 'New'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationHistory; 