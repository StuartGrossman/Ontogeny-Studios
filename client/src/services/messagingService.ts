import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { Message, Conversation, MessageFormData } from '../types/messaging';

// Create or get existing conversation between two users
export const getOrCreateConversation = async (
  userId1: string,
  userName1: string,
  userPhoto1: string | null,
  userId2: string,
  userName2: string,
  userPhoto2: string | null
): Promise<string> => {
  // Create conversation ID by sorting user IDs to ensure consistency
  const conversationId = [userId1, userId2].sort().join('_');
  
  try {
    // Create conversation with merge option - this will create if not exists, or do nothing if exists
    const conversationRef = doc(db, 'conversations', conversationId);
    await setDoc(conversationRef, {
      id: conversationId,
      participants: [userId1, userId2],
      participantNames: [userName1, userName2],
      participantPhotos: [userPhoto1 || null, userPhoto2 || null],
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      lastMessageSender: '',
      unreadCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return conversationId;
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (
  messageData: MessageFormData,
  senderId: string,
  senderName: string,
  senderPhotoURL?: string | null
): Promise<void> => {
  try {
    const conversationId = await getOrCreateConversation(
      senderId,
      senderName,
      senderPhotoURL || null,
      messageData.receiverId,
      messageData.receiverName,
      null
    );

    const batch = writeBatch(db);

    // Add message to messages collection
    const messageRef = doc(collection(db, 'messages'));
    batch.set(messageRef, {
      conversationId,
      senderId,
      senderName,
      senderPhotoURL: senderPhotoURL || null,
      receiverId: messageData.receiverId,
      receiverName: messageData.receiverName,
      content: messageData.content,
      timestamp: serverTimestamp(),
      read: false,
      type: 'text'
    });

    // Update conversation with last message info
    const conversationRef = doc(db, 'conversations', conversationId);
    batch.update(conversationRef, {
      lastMessage: messageData.content,
      lastMessageTime: serverTimestamp(),
      lastMessageSender: senderName,
      updatedAt: serverTimestamp()
    });

    await batch.commit();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get conversations for a user
export const getUserConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, 
    (querySnapshot) => {
      const conversations = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          participants: data.participants,
          participantNames: data.participantNames,
          participantPhotos: data.participantPhotos,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime?.toDate(),
          lastMessageSender: data.lastMessageSender,
          unreadCount: data.unreadCount || 0,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Conversation;
      });
      callback(conversations);
    },
    (error) => {
      console.error('Error getting user conversations:', error);
      // Return empty array on error
      callback([]);
    }
  );
};

// Get messages for a conversation
export const getConversationMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, 
    (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          conversationId: data.conversationId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderPhotoURL: data.senderPhotoURL,
          receiverId: data.receiverId,
          receiverName: data.receiverName,
          content: data.content,
          timestamp: data.timestamp?.toDate(),
          read: data.read,
          type: data.type
        } as Message;
      });
      callback(messages);
    },
    (error) => {
      console.error('Error getting conversation messages:', error);
      // Return empty array on error
      callback([]);
    }
  );
};

// Mark messages as read
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('receiverId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Get unread message count for a user
export const getUnreadMessageCount = (
  userId: string,
  callback: (count: number) => void
) => {
  const q = query(
    collection(db, 'messages'),
    where('receiverId', '==', userId),
    where('read', '==', false)
  );

  return onSnapshot(q, 
    (querySnapshot) => {
      callback(querySnapshot.size);
    },
    (error) => {
      console.error('Error getting unread message count:', error);
      // Return 0 count on error to prevent UI issues
      callback(0);
    }
  );
}; 