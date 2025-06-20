import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, ArrowLeft } from 'lucide-react';
import { 
  getOrCreateConversation,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead
} from '../../services/messagingService';
import { Message, MessageFormData } from '../../types/messaging';
import { UserAvatar } from '../../utils/avatarGenerator';
import './Modal.css';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
  };
  currentUser: {
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
  };
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  recipient,
  currentUser
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Use a timeout to ensure the DOM has updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }, 100);
    }
  };

  // Load conversation and messages when modal opens
  useEffect(() => {
    if (!isOpen || !currentUser || !recipient) return;

    const loadConversation = async () => {
      setLoading(true);
      try {
        const convId = await getOrCreateConversation(
          currentUser.uid,
          currentUser.displayName || currentUser.email || 'Admin',
          currentUser.photoURL || null,
          recipient.id,
          recipient.displayName,
          recipient.photoURL || null
        );
        setConversationId(convId);
      } catch (error) {
        console.error('Error loading conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [isOpen, currentUser, recipient]);

  // Load messages when conversation ID is set
  useEffect(() => {
    if (!conversationId) {
      setMessages([]); // Clear messages when no conversation
      return;
    }

    const unsubscribe = getConversationMessages(conversationId, (messages) => {
      setMessages(messages);
      
      // Mark messages as read
      if (messages.length > 0 && currentUser?.uid) {
        markMessagesAsRead(conversationId, currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [conversationId, currentUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    setSending(true);

    try {
      // Ensure conversation exists before sending message
      let convId = conversationId;
      if (!convId) {
        convId = await getOrCreateConversation(
          currentUser.uid,
          currentUser.displayName || currentUser.email || 'Admin',
          currentUser.photoURL || null,
          recipient.id,
          recipient.displayName,
          recipient.photoURL || null
        );
        setConversationId(convId);
        // Small delay to ensure conversation is fully created
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const messageData: MessageFormData = {
        content: newMessage.trim(),
        receiverId: recipient.id,
        receiverName: recipient.displayName
      };

      await sendMessage(
        messageData,
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Admin',
        currentUser.photoURL || null
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

  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = diff / (1000 * 60);
    const hours = diff / (1000 * 60 * 60);
    
    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${Math.floor(minutes)}m ago`;
    } else if (hours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (hours < 48) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chat-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <MessageCircle size={24} className="modal-icon" />
            <div>
              <h2>Chat with {recipient.displayName}</h2>
              <p>{recipient.email}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body chat-body">
          {/* Messages Area */}
          <div className="messages-area">
            {loading ? (
              <div className="loading-state">
                <MessageCircle size={32} />
                <p>Loading conversation...</p>
              </div>
            ) : messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.senderId === currentUser?.uid ? 'sent' : 'received'}`}
                >
                  <div className="message-avatar">
                    <UserAvatar
                      photoURL={message.senderPhotoURL}
                      displayName={message.senderName}
                      size={32}
                    />
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">{message.senderName}</span>
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                    </div>
                    <div className="message-text">{message.content}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-messages">
                <MessageCircle size={48} />
                <h3>Start a conversation</h3>
                <p>Send a message to {recipient.displayName}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input - Always show, even when loading */}
          <form onSubmit={handleSendMessage} className="message-input-form">
            <div className="message-input-container">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${recipient.displayName}...`}
                rows={1}
                disabled={sending || loading}
                className="message-input"
              />
              <button
                type="submit"
                className="send-button"
                disabled={sending || loading || !newMessage.trim()}
              >
                <Send size={20} />
              </button>
            </div>
            <div className="character-count">
              {newMessage.length}/1000
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal; 