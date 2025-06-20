export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'system';
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  participantPhotos: (string | undefined)[];
  lastMessage?: string;
  lastMessageTime?: Date;
  lastMessageSender?: string;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageFormData {
  content: string;
  receiverId: string;
  receiverName: string;
} 