import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Conversation, Message } from '../services/aiService';
import '../styles/ConversationDebugger.css';

interface ConversationMetadata {
  id: string;
  userId: string;
  title: string;
  mode: 'project-request' | 'feature-request';
  status: 'active' | 'completed' | 'abandoned';
  projectId?: string;
  projectName?: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  tags: string[];
  contextQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  hasProjectSubmission?: boolean;
}

interface ConversationWithMetadata {
  conversation: Conversation;
  metadata: ConversationMetadata;
}

const ConversationDebugger: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationWithMetadata[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'poor' | 'fair' | 'good' | 'excellent'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Load conversations
      const conversationsQuery = query(
        collection(db, 'ai_conversations'),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );
      
      const conversationsSnapshot = await getDocs(conversationsQuery);
      
      // Load metadata
      const metadataQuery = query(
        collection(db, 'conversation_metadata'),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );
      
      const metadataSnapshot = await getDocs(metadataQuery);
      
      // Combine conversations with metadata
      const conversationData: ConversationWithMetadata[] = [];
      
      conversationsSnapshot.docs.forEach(convDoc => {
        const convData = convDoc.data();
        const conversation: Conversation = {
          ...convData,
          createdAt: convData.createdAt.toDate(),
          updatedAt: convData.updatedAt.toDate(),
          messages: convData.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)
          }))
        } as Conversation;
        
        // Find matching metadata
        const metadataDoc = metadataSnapshot.docs.find(metaDoc => 
          metaDoc.data().id === conversation.id
        );
        
        let metadata: ConversationMetadata;
        
        if (metadataDoc) {
          const metaData = metadataDoc.data();
          metadata = {
            ...metaData,
            createdAt: metaData.createdAt.toDate(),
            updatedAt: metaData.updatedAt.toDate(),
            lastActivity: metaData.lastActivity.toDate()
          } as ConversationMetadata;
        } else {
          // Create default metadata if none exists
          metadata = {
            id: conversation.id,
            userId: conversation.userId,
            title: conversation.title || 'Unknown',
            mode: 'project-request',
            status: 'active',
            messageCount: conversation.messages.length,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
            lastActivity: conversation.updatedAt,
            tags: [],
            contextQuality: analyzeContextQuality(conversation.messages)
          };
        }
        
        conversationData.push({ conversation, metadata });
      });
      
      setConversations(conversationData);
      
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeContextQuality = (messages: Message[]): 'excellent' | 'good' | 'fair' | 'poor' => {
    const userMessages = messages.filter(msg => msg.sender === 'user');
    const aiMessages = messages.filter(msg => msg.sender === 'ai');
    
    if (userMessages.length >= 3 && aiMessages.length >= 3) {
      return 'excellent';
    } else if (userMessages.length >= 2 && aiMessages.length >= 2) {
      return 'good';
    } else if (userMessages.length >= 1 && aiMessages.length >= 1) {
      return 'fair';
    }
    return 'poor';
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesFilter = filter === 'all' || conv.metadata.contextQuality === filter;
    const matchesSearch = !searchTerm || 
      conv.metadata.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.metadata.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.metadata.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getQualityColor = (quality?: string) => {
    switch (quality) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getMissingContext = (conversation: Conversation): string[] => {
    const missing: string[] = [];
    const userMessages = conversation.messages.filter(msg => msg.sender === 'user');
    
    if (userMessages.length === 0) {
      missing.push('No user input');
    } else if (userMessages.length === 1) {
      missing.push('Minimal user interaction');
    }
    
    const avgMessageLength = userMessages.reduce((sum, msg) => sum + msg.text.length, 0) / userMessages.length;
    if (avgMessageLength < 50) {
      missing.push('Messages too brief');
    }
    
    const hasProjectDetails = conversation.messages.some(msg => 
      msg.text.toLowerCase().includes('project') ||
      msg.text.toLowerCase().includes('feature') ||
      msg.text.toLowerCase().includes('app')
    );
    
    if (!hasProjectDetails) {
      missing.push('No clear project details');
    }
    
    return missing;
  };

  const getRecommendations = (conversation: Conversation): string[] => {
    const recommendations: string[] = [];
    const userMessages = conversation.messages.filter(msg => msg.sender === 'user');
    
    if (userMessages.length < 2) {
      recommendations.push('Encourage more user engagement');
    }
    
    const avgMessageLength = userMessages.reduce((sum, msg) => sum + msg.text.length, 0) / userMessages.length;
    if (avgMessageLength < 50) {
      recommendations.push('Ask more detailed follow-up questions');
    }
    
    const hasFeatureDetails = conversation.messages.some(msg => 
      msg.text.toLowerCase().includes('feature') ||
      msg.text.toLowerCase().includes('functionality')
    );
    
    if (!hasFeatureDetails) {
      recommendations.push('Probe for specific feature requirements');
    }
    
    return recommendations;
  };

  if (loading) {
    return (
      <div className="conversation-debugger">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-debugger">
      <div className="debugger-header">
        <h2>🔍 Conversation Debugger</h2>
        <p>Analyze AI chat conversations for context quality and debugging</p>
      </div>

      <div className="debugger-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          {['all', 'poor', 'fair', 'good', 'excellent'].map(filterOption => (
            <button
              key={filterOption}
              className={`filter-btn ${filter === filterOption ? 'active' : ''}`}
              onClick={() => setFilter(filterOption as any)}
              style={{
                backgroundColor: filter === filterOption ? getQualityColor(filterOption) : undefined
              }}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="debugger-content">
        <div className="conversations-list">
          <h3>Conversations ({filteredConversations.length})</h3>
          
          {filteredConversations.map(({ conversation, metadata }) => (
            <div
              key={conversation.id}
              className={`conversation-item ${selectedConversation?.conversation.id === conversation.id ? 'selected' : ''}`}
              onClick={() => setSelectedConversation({ conversation, metadata })}
            >
              <div className="conversation-header">
                <h4>{metadata.title}</h4>
                <div 
                  className="quality-badge"
                  style={{ backgroundColor: getQualityColor(metadata.contextQuality) }}
                >
                  {metadata.contextQuality || 'unknown'}
                </div>
              </div>
              
              <div className="conversation-meta">
                <span className="mode-badge">{metadata.mode}</span>
                <span className="message-count">{metadata.messageCount} messages</span>
                <span className="timestamp">
                  {metadata.lastActivity.toLocaleDateString()}
                </span>
              </div>
              
              {metadata.projectName && (
                <div className="project-name">📁 {metadata.projectName}</div>
              )}
            </div>
          ))}
        </div>

        <div className="conversation-details">
          {selectedConversation ? (
            <div className="details-content">
              <div className="details-header">
                <h3>{selectedConversation.metadata.title}</h3>
                <div className="header-badges">
                  <span 
                    className="quality-badge large"
                    style={{ backgroundColor: getQualityColor(selectedConversation.metadata.contextQuality) }}
                  >
                    {selectedConversation.metadata.contextQuality || 'unknown'} context
                  </span>
                  {selectedConversation.metadata.hasProjectSubmission && (
                    <span className="submission-badge">✅ Submitted</span>
                  )}
                </div>
              </div>

              <div className="analysis-section">
                <h4>📊 Analysis</h4>
                
                <div className="analysis-grid">
                  <div className="analysis-item">
                    <label>Messages:</label>
                    <span>{selectedConversation.metadata.messageCount}</span>
                  </div>
                  
                  <div className="analysis-item">
                    <label>User ID:</label>
                    <span className="user-id">{selectedConversation.metadata.userId}</span>
                  </div>
                  
                  <div className="analysis-item">
                    <label>Mode:</label>
                    <span>{selectedConversation.metadata.mode}</span>
                  </div>
                  
                  <div className="analysis-item">
                    <label>Status:</label>
                    <span>{selectedConversation.metadata.status}</span>
                  </div>
                </div>

                {getMissingContext(selectedConversation.conversation).length > 0 && (
                  <div className="missing-context">
                    <h5>⚠️ Missing Context:</h5>
                    <ul>
                      {getMissingContext(selectedConversation.conversation).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {getRecommendations(selectedConversation.conversation).length > 0 && (
                  <div className="recommendations">
                    <h5>💡 Recommendations:</h5>
                    <ul>
                      {getRecommendations(selectedConversation.conversation).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="messages-section">
                <h4>💬 Messages</h4>
                <div className="messages-timeline">
                  {selectedConversation.conversation.messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`message-debug ${message.sender}`}
                    >
                      <div className="message-header">
                        <span className="sender">{message.sender === 'user' ? '👤 User' : '🤖 AI'}</span>
                        <span className="timestamp">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="message-content">
                        {message.text}
                      </div>
                      <div className="message-stats">
                        Length: {message.text.length} chars
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="no-selection-content">
                <h3>Select a conversation to debug</h3>
                <p>Choose a conversation from the list to view detailed analysis and recommendations.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationDebugger; 