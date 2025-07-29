import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Paperclip, Smile, Send, Settings, User, MessageCircle, X, Check } from 'lucide-react';
import { UserAvatar } from '../utils/avatarGenerator';
import ChatListItem from './chat/ChatListItem';
import MessageBubble from './chat/MessageBubble';
import { storage, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
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

interface UserChatSystemProps {
  onClose?: () => void;
  preselectedUserId?: string;
}

const UserChatSystem: React.FC<UserChatSystemProps> = ({ preselectedUserId }) => {
  const { currentUser } = useAuth();
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
  const [adminUsers, setAdminUsers] = useState<ChatUser[]>([]);

  // Common emojis for the picker
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
    '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
    '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫',
    '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳',
    '👍', '👎', '👏', '🙌', '👐', '🤝', '🙏', '✌️', '🤞', '🤟',
    '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️',
    '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀'
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



  // Load admin users for chat list
  useEffect(() => {
    const loadAdminUsers = async () => {
      try {
        console.log('Loading admin users...');
        
        // First try to find users with role 'admin'
        const adminQuery = query(
          collection(db, 'users'),
          where('role', '==', 'admin')
        );
        const adminSnapshot = await getDocs(adminQuery);
        
        console.log('Admin users found:', adminSnapshot.docs.length);
        
        let admins: ChatUser[] = adminSnapshot.docs.map(doc => {
          const userData = doc.data();
          console.log('Admin user data:', userData);
          return {
            id: doc.id,
            name: userData.displayName || userData.email || 'Admin',
            avatar: userData.photoURL || undefined,
            lastMessage: 'Available for chat',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOnline: true,
            status: 'active'
          };
        });

        // If no admin users found, try looking for users with isAdmin: true
        if (admins.length === 0) {
          console.log('No admin role users found, checking for isAdmin field...');
          const isAdminQuery = query(
            collection(db, 'users'),
            where('isAdmin', '==', true)
          );
          const isAdminSnapshot = await getDocs(isAdminQuery);
          console.log('isAdmin users found:', isAdminSnapshot.docs.length);
          
          admins = isAdminSnapshot.docs.map(doc => {
            const userData = doc.data();
            console.log('isAdmin user data:', userData);
            return {
              id: doc.id,
              name: userData.displayName || userData.email || 'Admin',
              avatar: userData.photoURL || undefined,
              lastMessage: 'Available for chat',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isOnline: true,
              status: 'active'
            };
          });
        }

        if (admins.length > 0) {
          console.log('Setting admin users:', admins);
          setAdminUsers(admins);
        } else {
          console.log('No admin users found, using fallback support team');
          // Fallback support team for testing
          setAdminUsers([{
            id: 'support-team',
            name: 'Support Team',
            avatar: undefined,
            lastMessage: 'How can we help you?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOnline: true,
            status: 'active'
          }]);
        }
      } catch (error) {
        console.error('Error loading admin users:', error);
        // Fallback to a default admin user
        setAdminUsers([{
          id: 'support-team',
          name: 'Support Team',
          avatar: undefined,
          lastMessage: 'How can we help you?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOnline: true,
          status: 'active'
        }]);
      }
    };

    loadAdminUsers();
  }, []);

  // Load messages from Firestore when chat is selected
  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    const chatId = getChatId(currentUser.uid, selectedChat.id);
    console.log('Loading messages for chatId:', chatId);
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(messagesQuery, 
      (snapshot) => {
        console.log('Messages snapshot received, docs count:', snapshot.docs.length);
        const loadedMessages: Message[] = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Message data:', data);
          return {
            id: doc.id,
            senderId: data.senderId,
            content: data.content,
            timestamp: data.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
            type: data.type,
            isOwn: data.senderId === currentUser.uid,
            imageUrl: data.imageUrl,
            isUploading: false
          };
        });
        console.log('Setting messages:', loadedMessages);
        setMessages(loadedMessages);
      },
      (error) => {
        console.error('Error loading messages:', error);
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
        await setDoc(chatDoc, {
          participants: [currentUser?.uid, selectedChat?.id],
          createdAt: new Date(),
          lastMessage: new Date()
        });
      } else {
        await updateDoc(chatDoc, {
          lastMessage: new Date()
        });
      }
    } catch (error) {
      console.log('Chat initialization error:', error);
    }
  };

  const filteredChats = adminUsers.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-select preselected user when component mounts
  useEffect(() => {
    if (preselectedUserId && adminUsers.length > 0 && !selectedChat) {
      const userToSelect = adminUsers.find(user => user.id === preselectedUserId);
      if (userToSelect) {
        setSelectedChat(userToSelect);
      }
    }
  }, [preselectedUserId, adminUsers, selectedChat]);

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
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!imageTypes.includes(file.type)) {
        alert('Please select a valid image file');
        event.target.value = '';
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        event.target.value = '';
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(file);
      setImagePreview(previewUrl);
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

  const uploadImageWithProgress = async (file: File, tempMessageId: string): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${sanitizedFileName}`;
    const storageRef = ref(storage, `chat-images/${currentUser.uid}/${fileName}`);
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
        (error) => reject(error),
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
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedImage) || !selectedChat || !currentUser) return;

    try {
      const chatId = getChatId(currentUser.uid, selectedChat.id);
      console.log('Sending message. ChatId:', chatId, 'CurrentUser:', currentUser.uid, 'SelectedChat:', selectedChat.id);
      await initializeChatIfNeeded(chatId);  
      const timestamp = Date.now();
    
      // Handle image upload with progress
      if (selectedImage) {
        const tempImageId = `temp-img-${timestamp}`;
        
        const tempImageMessage: Message = {
          id: tempImageId,
          senderId: currentUser.uid,
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
          
          await addDoc(collection(db, 'chats', chatId, 'messages'), {
            senderId: currentUser.uid,
            content: `📷 ${selectedImage.name}`,
            type: 'image',
            imageUrl,
            createdAt: new Date(),
            chatId
          });

          setMessages(prev => prev.filter(msg => msg.id !== tempImageId));
          setImageUploaded(true);
          setTimeout(() => setImageUploaded(false), 2000);
          
        } catch (uploadError) {
          setMessages(prev => prev.filter(msg => msg.id !== tempImageId));
          throw uploadError;
        }
      }

      // Handle text message (preserve formatting including line breaks)
      if (messageInput.trim()) {
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          senderId: currentUser.uid,
          content: messageInput, // Don't trim here to preserve formatting
          type: 'text',
          createdAt: new Date(),
          chatId
        });
      }
      
      setMessageInput('');
      handleRemoveImage();
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
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
            <span>Support Chat</span>
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
              placeholder="Search support team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="chat-filters">
          <button className="filter-btn active">Support</button>
          <button className="filter-btn">Available</button>
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
                    {selectedChat.isOnline ? 'Available' : 'Offline'}
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
                  accept="image/*"
                />
                <button 
                  className={`input-action-btn ${selectedImage ? 'active' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach image (max 5MB)"
                >
                  <Paperclip size={20} />
                </button>
                <textarea
                  placeholder={selectedImage ? "Add a message with your image..." : "Type your message..."}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="message-input"
                  rows={1}
                  style={{
                    resize: 'none',
                    minHeight: '24px',
                    maxHeight: '120px',
                    overflow: 'auto'
                  }}
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
            <h3>Select a support agent</h3>
            <p>Choose from our support team to start messaging</p>
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
            <p>Support Team Member</p>
          </div>

          <div className="profile-details">
            <div className="profile-detail-item">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status ${selectedChat.isOnline ? 'active' : 'inactive'}`}>
                {selectedChat.isOnline ? 'Available' : 'Offline'}
              </span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Response Time:</span>
              <span className="detail-value">Usually within 5 minutes</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Department:</span>
              <span className="detail-value">Support</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserChatSystem; 