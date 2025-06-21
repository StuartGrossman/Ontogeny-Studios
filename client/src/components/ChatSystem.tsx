import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Paperclip, Smile, Mic, Send, Settings, Bell, User, MessageCircle, X, Check } from 'lucide-react';
import { UserAvatar } from '../utils/avatarGenerator';
import ChatListItem from './chat/ChatListItem';
import MessageBubble from './chat/MessageBubble';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
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
  imageUrl?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  createdAt?: Date;
}

interface ChatSystemProps {
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  allUsers?: any[];
  onClose?: () => void;
  preselectedUserId?: string; // Add prop to preselect a user
}

const ChatSystem: React.FC<ChatSystemProps> = ({ currentUser, allUsers = [], preselectedUserId }) => {
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploaded, setImageUploaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);

  // Common emojis for the picker
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
    '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
    '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫',
    '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳',
    '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭',
    '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
    '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹',
    '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃',
    '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋',
    '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟',
    '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎',
    '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
    '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻',
    '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'
  ];

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  // Load messages from Firestore when chat is selected
  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    const chatId = getChatId(currentUser.id, selectedChat.id);
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(messagesQuery, 
      (snapshot) => {
        const loadedMessages: Message[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            senderId: data.senderId,
            content: data.content,
            timestamp: data.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
            type: data.type,
            isOwn: data.senderId === currentUser.id,
            imageUrl: data.imageUrl,
            isUploading: false
          };
        });
        setMessages(loadedMessages);
      },
      (error) => {
        console.error('Error loading messages:', error);
        if (error.code === 'permission-denied') {
          console.error('Permission denied when loading messages for chat:', chatId);
        }
      }
    );

    return () => unsubscribe();
  }, [selectedChat, currentUser]);

  // Helper function to create consistent chat IDs
  const getChatId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('_');
  };

  // Initialize chat metadata if it doesn't exist
  const initializeChatIfNeeded = async (chatId: string) => {
    try {
      const chatDoc = doc(db, 'chats', chatId);
      const chatSnapshot = await getDoc(chatDoc);
      
      if (!chatSnapshot.exists()) {
        // Create the chat document with the specific ID
        await setDoc(chatDoc, {
          participants: [currentUser?.id, selectedChat?.id],
          createdAt: new Date(),
          lastMessage: new Date()
        });
      } else {
        // Update last message timestamp
        await updateDoc(chatDoc, {
          lastMessage: new Date()
        });
      }
    } catch (error) {
      console.log('Chat initialization error:', error);
      // Continue anyway - the message creation might work without explicit chat doc
    }
  };

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

  const filteredChats = chatUsers.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-select preselected user when component mounts
  useEffect(() => {
    if (preselectedUserId && chatUsers.length > 0 && !selectedChat) {
      const userToSelect = chatUsers.find(user => user.id === preselectedUserId);
      if (userToSelect) {
        setSelectedChat(userToSelect);
      }
    }
  }, [preselectedUserId, chatUsers, selectedChat]);



  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker && !(event.target as Element).closest('.emoji-picker')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's an image file
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml', 'image/tiff'];
      
      if (!imageTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP, BMP, SVG, TIFF)');
        event.target.value = '';
        return;
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        event.target.value = '';
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(file);
      setImagePreview(previewUrl);
      
      // Clear the input
      event.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    setImageUploaded(false);
  };



  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedImage) || !selectedChat || !currentUser) return;

          try {
        const chatId = getChatId(currentUser.id, selectedChat.id);
        await initializeChatIfNeeded(chatId);
        const timestamp = Date.now();
      
      // Handle image upload with progress
      if (selectedImage) {
        const tempImageId = `temp-img-${timestamp}`;
        
        // Create temporary image message with progress (local only)
        const tempImageMessage: Message = {
          id: tempImageId,
          senderId: currentUser.id,
          content: `📷 Uploading ${selectedImage.name}...`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'image',
          isOwn: true,
          isUploading: true,
          uploadProgress: 0
        };
        
        setMessages(prev => [...prev, tempImageMessage]);
        
        try {
          const imageUrl = await uploadImageWithProgress(selectedImage, tempImageId);
          
          // Save to Firestore
          await addDoc(collection(db, 'chats', chatId, 'messages'), {
            senderId: currentUser.id,
            content: `📷 ${selectedImage.name}`,
            type: 'image',
            imageUrl,
            createdAt: new Date(),
            chatId
          });

          // Remove temp message (real message will come from Firestore listener)
          setMessages(prev => prev.filter(msg => msg.id !== tempImageId));
          
          // Show green checkmark
          setImageUploaded(true);
          setTimeout(() => {
            setImageUploaded(false);
          }, 2000);
          
        } catch (uploadError) {
          // Remove failed upload message
          setMessages(prev => prev.filter(msg => msg.id !== tempImageId));
          throw uploadError;
        }
      }

      // Handle text message separately
      if (messageInput.trim()) {
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          senderId: currentUser.id,
          content: messageInput.trim(),
          type: 'text',
          createdAt: new Date(),
          chatId
        });
      }
      
      setMessageInput('');
      handleRemoveImage();
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error?.code === 'permission-denied') {
        alert('Permission denied. Please make sure you are logged in and have the correct permissions.');
      } else if (error?.code === 'unavailable') {
        alert('Service temporarily unavailable. Please try again in a moment.');
      } else {
        alert('Failed to send message. Please try again or check your connection.');
      }
    }
  };

  const uploadImageWithProgress = async (file: File, tempMessageId: string): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}-${sanitizedFileName}`;
      const storageRef = ref(storage, `chat-images/${currentUser.id}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setMessages(prev => prev.map(msg => 
              msg.id === tempMessageId 
                ? { ...msg, uploadProgress: Math.round(progress) }
                : msg
            ));
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Firebase upload error:', error);
      throw error;
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
            <div className="chat-messages" ref={chatMessagesRef}>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  senderAvatar={selectedChat.avatar}
                  senderName={selectedChat.name}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="chat-input">
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="emoji-picker">
                  <div className="emoji-grid">
                    {commonEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        className="emoji-button"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="image-preview-container">
                  <div className="image-preview">
                    {imageUploaded ? (
                      <div className="upload-success">
                        <div className="success-checkmark">
                          <Check size={24} />
                        </div>
                        <span>Image uploaded successfully!</span>
                      </div>
                    ) : (
                      <>
                        <img src={imagePreview} alt="Preview" className="preview-image" />
                        <button 
                          className="remove-image-btn"
                          onClick={handleRemoveImage}
                          title="Remove image"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </div>
                  {!imageUploaded && (
                    <div className="image-info">
                      <span className="image-name">{selectedImage?.name}</span>
                      <span className="image-size">
                        {selectedImage ? `${(selectedImage.size / 1024 / 1024).toFixed(2)} MB` : ''}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="input-container">
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/svg+xml,image/tiff"
                />
                <button 
                  className={`input-action-btn ${selectedImage ? 'active' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach image (max 5MB)"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  placeholder={selectedImage ? "Add a message with your image..." : "Type your message..."}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="message-input"
                />
                <button 
                  className={`input-action-btn ${showEmojiPicker ? 'active' : ''}`}
                  title="Add emoji"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile size={20} />
                </button>
                <button 
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() && !selectedImage}
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
                <Settings size={16} />
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