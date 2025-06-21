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
  allUsers?: any[]; // Pass in the real users from the management system
  onClose?: () => void;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ currentUser, allUsers = [] }) => {
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Convert real users to chat users format, with fallback to mock data
  const [chatUsers] = useState<ChatUser[]>(() => {
    if (allUsers && allUsers.length > 0) {
      return allUsers.map((user, index) => ({
        id: user.id || user.uid,
        name: user.displayName || user.name || 'Unknown User',
        avatar: user.photoURL || user.avatar,
        lastMessage: index === 0 ? "Let's discuss the project..." : 
                    index === 1 ? "Thanks for the update" : 
                    index === 2 ? "When can we schedule a meeting?" : "Hello there!",
        timestamp: new Date(Date.now() - Math.random() * 86400000).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : undefined,
        isOnline: Math.random() > 0.5,
        status: Math.random() > 0.5 ? 'active' : 'away'
      }));
    }
    
         // Fallback mock data if no real users provided
     return [
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
     ];
   });

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
      const newMessage = {
        id: Date.now().toString(),
        senderId: 'current',
        content: messageInput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text' as const,
        isOwn: true
      };
      
      // In a real app, you would send this to your backend
      console.log('Sending message:', newMessage);
      setMessageInput('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedChat) {
      // Handle file upload logic here
      console.log('Uploading file:', file.name);
      // In a real app, you would upload to your storage service
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
                <input
                  type="file"
                  id="file-upload"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />
                <button 
                  className="input-action-btn"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  title="Attach file"
                >
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
                <button className="input-action-btn" title="Add emoji">
                  <Smile size={20} />
                </button>
                <button className="input-action-btn" title="Voice message">
                  <Mic size={20} />
                </button>
                <button 
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  title="Send message"
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