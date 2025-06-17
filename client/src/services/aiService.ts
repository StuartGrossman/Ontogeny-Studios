import { useAuth } from '../contexts/AuthContext';

const DEEPSEEK_API_KEY = 'sk-62b86883848c4907bdbdc730ac77eadd';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const SERVER_URL = 'http://localhost:5000/api';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

export interface AIResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class AIService {
  private async makeAPICall(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<AIResponse> {
    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are an expert software development consultant at Ontogeny Labs. Your role is to help clients define and plan their software projects. 

Key responsibilities:
- Ask clarifying questions to understand project requirements
- Provide technical recommendations and architecture suggestions
- Help estimate project scope and timeline
- Suggest appropriate technologies and frameworks
- Identify potential challenges and solutions
- Guide clients through the planning process

Always be professional, helpful, and thorough in your responses. Ask follow-up questions to gather more details when needed.`
            },
            ...messages
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return {
          success: true,
          message: data.choices[0].message.content
        };
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('AI API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getAIResponse(conversationHistory: Message[]): Promise<AIResponse> {
    // Convert our message format to API format
    const apiMessages = conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.text
    }));

    return await this.makeAPICall(apiMessages);
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    try {
      // Save to server
      const response = await fetch(`${SERVER_URL}/plans/save-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          userId: conversation.userId,
          messages: conversation.messages,
          title: conversation.title,
          createdAt: conversation.createdAt.toISOString(),
          updatedAt: conversation.updatedAt.toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save conversation');
      }

      console.log('Conversation saved to server:', result.filePath);
      
      // Also save to localStorage as backup
      this.saveToLocalStorage(conversation);
      
    } catch (error) {
      console.error('Error saving conversation to server:', error);
      
      // Fallback to localStorage only
      this.saveToLocalStorage(conversation);
    }
  }

  private saveToLocalStorage(conversation: Conversation): void {
    try {
      const conversations = this.getConversationsFromLocalStorage();
      const existingIndex = conversations.findIndex(conv => conv.id === conversation.id);
      
      if (existingIndex !== -1) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.push(conversation);
      }
      
      localStorage.setItem('ai_conversations', JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      // Try to get from server first
      const response = await fetch(`${SERVER_URL}/plans/conversations/${this.getCurrentUserId()}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Convert dates back to Date objects
          return result.conversations.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
        }
      }
    } catch (error) {
      console.error('Error getting conversations from server:', error);
    }
    
    // Fallback to localStorage
    return this.getConversationsFromLocalStorage();
  }

  private getConversationsFromLocalStorage(): Conversation[] {
    try {
      const stored = localStorage.getItem('ai_conversations');
      if (stored) {
        const conversations = JSON.parse(stored);
        return conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
    } catch (error) {
      console.error('Error loading conversations from localStorage:', error);
    }
    return [];
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    try {
      // Try server first
      const response = await fetch(`${SERVER_URL}/plans/conversation/${this.getCurrentUserId()}/${id}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const conv = result.conversation;
          return {
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          };
        }
      }
    } catch (error) {
      console.error('Error getting conversation from server:', error);
    }
    
    // Fallback to localStorage
    const conversations = this.getConversationsFromLocalStorage();
    return conversations.find(conv => conv.id === id) || null;
  }

  async updateConversation(conversationId: string, messages: Message[]): Promise<void> {
    try {
      // Update on server
      const response = await fetch(`${SERVER_URL}/plans/conversation/${this.getCurrentUserId()}/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          title: this.generateConversationTitle(messages)
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Also update localStorage
      const conversations = this.getConversationsFromLocalStorage();
      const index = conversations.findIndex(conv => conv.id === conversationId);
      
      if (index !== -1) {
        conversations[index].messages = messages;
        conversations[index].updatedAt = new Date();
        localStorage.setItem('ai_conversations', JSON.stringify(conversations));
      }
      
    } catch (error) {
      console.error('Error updating conversation:', error);
      
      // Fallback to localStorage only
      const conversations = this.getConversationsFromLocalStorage();
      const index = conversations.findIndex(conv => conv.id === conversationId);
      
      if (index !== -1) {
        conversations[index].messages = messages;
        conversations[index].updatedAt = new Date();
        localStorage.setItem('ai_conversations', JSON.stringify(conversations));
      }
    }
  }

  private getCurrentUserId(): string {
    // This should be replaced with actual user ID from auth context
    // For now, we'll use a default or get from localStorage
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.uid || 'default-user';
      } catch (error) {
        return 'default-user';
      }
    }
    return 'default-user';
  }

  generateConversationTitle(messages: Message[]): string {
    // Generate a title based on the first user message
    const firstUserMessage = messages.find(msg => msg.sender === 'user');
    if (firstUserMessage) {
      const text = firstUserMessage.text.toLowerCase();
      if (text.includes('e-commerce') || text.includes('online store')) {
        return 'E-commerce Platform Project';
      } else if (text.includes('mobile app') || text.includes('app')) {
        return 'Mobile Application Project';
      } else if (text.includes('dashboard') || text.includes('analytics')) {
        return 'Analytics Dashboard Project';
      } else if (text.includes('api') || text.includes('integration')) {
        return 'API Integration Project';
      } else if (text.includes('website') || text.includes('web app')) {
        return 'Web Application Project';
      } else {
        return 'New Project Discussion';
      }
    }
    return 'Project Planning Session';
  }
}

export const aiService = new AIService(); 