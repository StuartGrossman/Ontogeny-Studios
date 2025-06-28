import React from 'react';
import { UserAvatar } from '../../utils/avatarGenerator';
import '../../styles/chat/MessageBubble.css';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'image';
  isOwn?: boolean;
  imageUrl?: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

interface MessageBubbleProps {
  message: Message;
  senderAvatar?: string;
  senderName?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  senderAvatar, 
  senderName 
}) => {
  return (
    <div
      className={`message-bubble-container ${message.isOwn ? 'message-own' : 'message-other'}`}
    >
      {!message.isOwn && (
        <UserAvatar
          photoURL={senderAvatar}
          displayName={senderName || 'User'}
          size={32}
          className="message-avatar"
        />
      )}
      <div className="message-content">
        <div className="message-bubble">
          {message.type === 'image' && message.imageUrl && !message.isUploading ? (
            <div className="message-image-container">
              <img 
                src={message.imageUrl} 
                alt="Uploaded image" 
                className="message-image"
                onError={(e) => {
                  console.error('Failed to load image:', message.imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
              <p className="image-caption">{message.content}</p>
            </div>
          ) : message.isUploading ? (
            <div className="upload-progress-container">
              <p>{message.content}</p>
              <div className="upload-progress-bar">
                <div 
                  className="upload-progress-fill"
                  style={{ width: `${message.uploadProgress || 0}%` }}
                />
              </div>
              <span className="upload-progress-text">{message.uploadProgress || 0}%</span>
            </div>
          ) : (
            <p>{message.content}</p>
          )}
        </div>
        <span className="message-time">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble; 