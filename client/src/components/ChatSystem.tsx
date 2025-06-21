import React, { useState, useEffect } from 'react';
import { Search, Phone, Video, MoreVertical, Paperclip, Smile, Mic, Send, Settings, Bell, User, MessageCircle } from 'lucide-react';
import { UserAvatar } from '../utils/avatarGenerator';
import ChatListItem from './chat/ChatListItem';
import MessageBubble from './chat/MessageBubble';
import '../styles/ChatSystem.css';

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

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'image';
  isOwn?: boolean;
}

interface ChatSystemProps {
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  onClose?: () => void;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ currentUser }) => {
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Mock data - replace with real data from your backend
  const [chatUsers] = useState<ChatUser[]>([
    {
      id: '1',
      name: 'Penny Valeria',
      avatar: '/api/placeholder/40/40',
      lastMessage: "Let's see the...",
      timestamp: '12:35',
      unreadCount: 1,
      isOnline: true
    },
    {
      id: '2',
      name: 'Pharah House',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'sent',
      timestamp: '11:52',
      isOnline: true
    },
    {
      id: '3',
      name: 'Leonard Kayle',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Already started',
      timestamp: '11:31',
      unreadCount: 1,
      isOnline: false
    },
    {
      id: '4',
      name: 'Leslie Winkle',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Hello, I have...',
      timestamp: '11:14',
      isOnline: true
    },
    {
      id: '5',
      name: 'Richard Hammon',
      avatar: '/api/placeholder/40/40',
      lastMessage: "We'll proceed...",
      timestamp: '11:09',
      unreadCount: 11,
      isOnline: false
    }
  ]);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      senderId: '2',
      content: 'We need to make sure that the product works well at every circumstances that fit with us',
      timestamp: '04:15PM',
      type: 'text'
    },
    {
      id: '2',
      senderId: 'current',
      content: 'Sending you the files and docs within few moments Meanwhile Check our websites for insights',
      timestamp: '6:40PM',
      type: 'text',
      isOwn: true
    },
    {
      id: '3',
      senderId: '2',
      content: 'Thanks and checking 👍',
      timestamp: '10:15PM',
      type: 'text'
    },
    {
      id: '4',
      senderId: 'current',
      content: 'Quick glimpse of our proposal, when you\'re proposing the next meeting',
      timestamp: '11:45PM',
      type: 'text',
      isOwn: true
    }
  ]);

  const filteredChats = chatUsers.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedChat) {
      // Add message sending logic here
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-system">
      {/* Chat Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <div className="sidebar-title">
            <MessageCircle size={20} />
            <span>Messages</span>
          </div>
          <div className="sidebar-actions">
            <button className="sidebar-action-btn">
              <Settings size={16} />
            </button>
          </div>
        </div>

        <div className="chat-search">
          <div className="search-input-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by chats and people"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="chat-filters">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">New</button>
          <button className="filter-btn">Move to Closed</button>
        </div>

        <div className="chat-list">
          {filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isActive={selectedChat?.id === chat.id}
              onClick={setSelectedChat}
            />
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-user">
                <UserAvatar
                  photoURL={selectedChat.avatar}
                  displayName={selectedChat.name}
                  size={40}
                />
                <div className="chat-header-info">
                  <h3>{selectedChat.name}</h3>
                  <span className={`status ${selectedChat.isOnline ? 'online' : 'offline'}`}>
                    {selectedChat.isOnline ? 'Active' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="chat-header-actions">
                <button className="header-action-btn">
                  <Phone size={20} />
                </button>
                <button className="header-action-btn">
                  <Video size={20} />
                </button>
                <button 
                  className="header-action-btn"
                  onClick={() => setShowUserProfile(!showUserProfile)}
                >
                  <User size={20} />
                </button>
                <button className="header-action-btn">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="chat-messages">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  senderAvatar={selectedChat.avatar}
                  senderName={selectedChat.name}
                />
              ))}
            </div>

            {/* Message Input */}
            <div className="chat-input">
              <div className="input-container">
                <button className="input-action-btn">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="message-input"
                />
                <button className="input-action-btn">
                  <Smile size={20} />
                </button>
                <button className="input-action-btn">
                  <Mic size={20} />
                </button>
                <button 
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="chat-empty">
            <MessageCircle size={64} />
            <h3>Select a conversation</h3>
            <p>Choose a chat from the sidebar to start messaging</p>
          </div>
        )}
      </div>

      {/* User Profile Panel */}
      {showUserProfile && selectedChat && (
        <div className="chat-profile">
          <div className="profile-header">
            <UserAvatar
              photoURL={selectedChat.avatar}
              displayName={selectedChat.name}
              size={80}
            />
            <h3>{selectedChat.name}</h3>
            <p>https://desig.com/sta</p>
            <div className="profile-actions">
              <button className="profile-action-btn primary">
                <MessageCircle size={16} />
              </button>
              <button className="profile-action-btn secondary">
                <Phone size={16} />
              </button>
              <button className="profile-action-btn tertiary">
                Unsubscribe
              </button>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-detail-item">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status ${selectedChat.isOnline ? 'active' : 'inactive'}`}>
                {selectedChat.isOnline ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Appeals:</span>
              <span className="detail-value">2</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Last Contact:</span>
              <span className="detail-value">1hr ago</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Subscribed:</span>
              <span className="detail-value">9 Days ago</span>
            </div>
          </div>

          <div className="profile-notifications">
            <h4>Notifications</h4>
            <div className="notification-item">
              <Bell size={16} />
              <div className="notification-content">
                <span>5 Deals Pending</span>
                <small>Just now</small>
              </div>
            </div>
            <div className="notification-item">
              <MessageCircle size={16} />
              <div className="notification-content">
                <span>New Message</span>
                <small>12 hours ago</small>
              </div>
            </div>
            <div className="notification-item">
              <User size={16} />
              <div className="notification-content">
                <span>New user registered</span>
                <small>59 minutes ago</small>
              </div>
            </div>
          </div>

          <div className="profile-settings">
            <h4>User Settings</h4>
            <div className="setting-item">
              <Bell size={16} />
              <span>Notifications</span>
              <div className="toggle-switch active"></div>
            </div>
            <div className="setting-item">
              <span>Report</span>
            </div>
            <div className="setting-item">
              <span>Block</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSystem; 