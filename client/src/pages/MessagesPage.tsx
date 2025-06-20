import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageCircle, 
  Send, 
  ArrowLeft, 
  Users,
  Clock,
  CheckCheck,
  Check
} from 'lucide-react';
import { UserAvatar } from '../utils/avatarGenerator';
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead
} from '../services/messagingService';
import { Conversation, Message, MessageFormData } from '../types/messaging';
import '../styles/MessagesPage.css';

const MessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = getUserConversations(currentUser.uid, (conversations) => {
      setConversations(conversations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const unsubscribe = getConversationMessages(selectedConversation.id, (messages) => {
      setMessages(messages);
      
      // Mark messages as read
      if (messages.length > 0 && currentUser?.uid) {
        markMessagesAsRead(selectedConversation.id, currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [selectedConversation, currentUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    setSending(true);

    try {
      // Find the other participant
      const otherParticipantIndex = selectedConversation.participants.findIndex(
        id => id !== currentUser.uid
      );
      const otherParticipantId = selectedConversation.participants[otherParticipantIndex];
      const otherParticipantName = selectedConversation.participantNames[otherParticipantIndex];

      const messageData: MessageFormData = {
        content: newMessage.trim(),
        receiverId: otherParticipantId,
        receiverName: otherParticipantName
      };

      await sendMessage(
        messageData,
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'User',
        currentUser.photoURL || undefined
      );

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const otherIndex = conversation.participants.findIndex(id => id !== currentUser?.uid);
    return {
      id: conversation.participants[otherIndex],
      name: conversation.participantNames[otherIndex],
      photo: conversation.participantPhotos[otherIndex]
    };
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="messages-page">
        <div className="loading-state">
          <MessageCircle size={48} />
          <h3>Loading conversations...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* Conversations Sidebar */}
        <div className={`conversations-sidebar ${selectedConversation ? 'hidden-mobile' : ''}`}>
          <div className="sidebar-header">
            <h2>
              <MessageCircle size={24} />
              Messages
            </h2>
            <span className="conversation-count">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="conversations-list">
            {conversations.length > 0 ? (
              conversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const isSelected = selectedConversation?.id === conversation.id;

                return (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <UserAvatar
                      photoURL={otherParticipant.photo}
                      displayName={otherParticipant.name}
                      size={50}
                      className="conversation-avatar"
                    />
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <h4>{otherParticipant.name}</h4>
                        <span className="conversation-time">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <div className="conversation-preview">
                        {conversation.lastMessage && (
                          <p className="last-message">
                            {conversation.lastMessageSender === (currentUser?.displayName || currentUser?.email) 
                              ? 'You: ' : ''
                            }
                            {conversation.lastMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="unread-badge">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-conversations">
                <Users size={48} />
                <h3>No conversations yet</h3>
                <p>Your messages will appear here when someone sends you a message.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`chat-area ${!selectedConversation ? 'hidden-mobile' : ''}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <button 
                  className="back-button mobile-only"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="chat-participant">
                  {(() => {
                    const otherParticipant = getOtherParticipant(selectedConversation);
                    return (
                      <>
                        <UserAvatar
                          photoURL={otherParticipant.photo}
                          displayName={otherParticipant.name}
                          size={40}
                          className="chat-avatar"
                        />
                        <div className="participant-info">
                          <h3>{otherParticipant.name}</h3>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container-chat">
                <div className="messages-list">
                  {messages.map((message) => {
                    const isOwnMessage = message.senderId === currentUser?.uid;
                    
                    return (
                      <div
                        key={message.id}
                        className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'}`}
                      >
                        {!isOwnMessage && (
                          <UserAvatar
                            photoURL={message.senderPhotoURL}
                            displayName={message.senderName}
                            size={32}
                            className="message-avatar"
                          />
                        )}
                        <div className="message-content">
                          <div className="message-bubble">
                            <p>{message.content}</p>
                          </div>
                          <div className="message-meta">
                            <span className="message-time">
                              {formatTime(message.timestamp)}
                            </span>
                            {isOwnMessage && (
                              <span className="message-status">
                                {message.read ? (
                                  <CheckCheck size={14} className="read" />
                                ) : (
                                  <Check size={14} className="sent" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="message-input-container">
                <form onSubmit={handleSendMessage} className="message-input-form">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    disabled={sending}
                    className="message-input"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="send-button"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <MessageCircle size={64} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage; 