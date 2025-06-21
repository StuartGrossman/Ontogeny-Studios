import React from 'react';
import { UserAvatar } from '../../utils/avatarGenerator';
import '../../styles/chat/ChatListItem.css';

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
  status?: string;
}

interface ChatListItemProps {
  chat: ChatUser;
  isActive: boolean;
  onClick: (chat: ChatUser) => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, isActive, onClick }) => {
  return (
    <div
      className={`chat-list-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(chat)}
    >
      <div className="chat-list-item-avatar">
        <UserAvatar
          photoURL={chat.avatar}
          displayName={chat.name}
          size={40}
        />
        {chat.isOnline && <div className="online-indicator" />}
      </div>
      <div className="chat-list-item-content">
        <div className="chat-list-item-header">
          <h4 className="chat-list-item-name">{chat.name}</h4>
          <span className="chat-list-item-time">{chat.timestamp}</span>
        </div>
        <div className="chat-list-item-message">
          <p>{chat.lastMessage}</p>
          {chat.unreadCount && (
            <span className="unread-badge">{chat.unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem; 