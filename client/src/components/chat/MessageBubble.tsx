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
          <p>{message.content}</p>
        </div>
        <span className="message-time">
          Message {message.isOwn ? 'Sent' : 'Received'} {message.timestamp}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble; 