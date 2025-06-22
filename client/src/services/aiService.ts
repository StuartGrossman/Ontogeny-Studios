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
  shouldSubmitProject?: boolean;
  projectData?: {
    name: string;
    description: string;
    features: string;
  };
}

export interface AIFeatureResponse {
  success: boolean;
  features?: Feature[];
  error?: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  category: 'Authentication' | 'Core Features' | 'User Interface' | 'Data Management' | 'Integrations' | 'Security' | 'Performance' | 'Admin' | 'Mobile' | 'Analytics';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  complexity: 'Simple' | 'Moderate' | 'Complex';
  timeEstimate: number; // in hours
  isCustom?: boolean;
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
              content: `You are a specialized Project Feature Consultant at Ontogeny Labs. Your ONLY focus is helping clients define comprehensive feature lists for their software projects.

🎯 YOUR MISSION:
- Guide clients to articulate ALL features they want in their project
- Ask specific follow-up questions about functionality, user experience, and requirements
- Help organize features into clear, actionable categories
- Once you have a comprehensive feature list, offer to submit it as a project request

📋 CONVERSATION FLOW:
1. First, understand their basic project idea
2. Ask detailed questions about specific features they want
3. Probe for additional functionality they might need
4. Organize features into a clean, bulleted list
5. When feature gathering feels complete, present the final list and ask: "Would you like me to submit this project request to our development team?"

💡 QUESTION EXAMPLES:
- "What specific user actions do you want to support?"
- "How should users interact with [feature]?"
- "What data do you need to track/store?"
- "Do you need admin/user role differences?"
- "What integrations or third-party services?"
- "Any specific security or performance requirements?"

✅ FORMATTING:
- Use bullet points for features
- Use emojis for visual appeal
- Keep responses concise but thorough
- Always end with a specific follow-up question

Remember: Your goal is comprehensive feature definition, not technical implementation details.`
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

    const response = await this.makeAPICall(apiMessages);
    
    // Check if the AI wants to submit the project
    if (response.success && response.message) {
      const shouldSubmit = this.checkForProjectSubmission(response.message);
      if (shouldSubmit) {
        const projectData = this.extractProjectData(conversationHistory, response.message);
        return {
          ...response,
          shouldSubmitProject: true,
          projectData
        };
      }
    }
    
    return response;
  }

  private checkForProjectSubmission(aiMessage: string): boolean {
    const submissionKeywords = [
      'submit this project request',
      'submit the project',
      'send this to our development team',
      'create the project request',
      'finalize the project',
      'submit your project'
    ];
    
    const lowerMessage = aiMessage.toLowerCase();
    return submissionKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private extractProjectData(conversationHistory: Message[], finalMessage: string): { name: string; description: string; features: string } {
    // Extract project name, description, and features from conversation
    let projectName = 'Untitled Project';
    let description = '';
    let features = '';
    
    // Look through conversation for project details
    const allText = conversationHistory.map(msg => msg.text).join(' ');
    
    // Try to extract project name (look for patterns like "I want to build..." or project names)
    const namePatterns = [
      /(?:build|create|develop|make)\s+(?:a|an)?\s*([^.!?]+)/i,
      /project\s+(?:called|named)\s+([^.!?]+)/i,
      /(?:app|application|system|platform)\s+(?:called|named)?\s*([^.!?]+)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = allText.match(pattern);
      if (match && match[1]) {
        projectName = match[1].trim().split(/\s+/).slice(0, 5).join(' '); // Max 5 words
        break;
      }
    }
    
    // Extract description from user messages
    const userMessages = conversationHistory.filter(msg => msg.sender === 'user');
    if (userMessages.length > 0) {
      description = userMessages[0].text.substring(0, 500); // First user message as description
    }
    
    // Extract features from the final AI message or throughout conversation
    const featureLines = finalMessage.split('\n').filter(line => 
      line.trim().startsWith('•') || 
      line.trim().startsWith('-') || 
      line.trim().startsWith('*')
    );
    
    if (featureLines.length > 0) {
      features = featureLines.join('\n');
    } else {
      // Look for feature mentions in the conversation
      const featureKeywords = conversationHistory
        .filter(msg => msg.sender === 'user')
        .map(msg => msg.text)
        .join('\n');
      features = featureKeywords.substring(0, 1000);
    }
    
    return {
      name: projectName,
      description: description,
      features: features
    };
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

  async generateFeatures(projectDescription: string): Promise<AIFeatureResponse> {
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
              content: `You are a professional software architect specializing in feature breakdown for web applications. Your task is to generate a comprehensive list of features based on a project description.

🎯 YOUR MISSION:
- Analyze the project description and generate 15-25 essential features
- Cover all aspects: authentication, core functionality, UI/UX, security, performance, integrations, admin tools, mobile support, and analytics
- Provide realistic time estimates in hours
- Categorize features properly
- Set appropriate priorities and complexity levels

📋 FEATURE CATEGORIES:
- Authentication: Login, registration, password management, social auth, 2FA
- Core Features: Main functionality specific to the project
- User Interface: Design, responsiveness, themes, accessibility
- Data Management: Storage, backup, export, import, data validation
- Integrations: APIs, third-party services, webhooks, notifications
- Security: Encryption, permissions, compliance, data protection
- Performance: Optimization, caching, monitoring, scalability
- Admin: Admin panel, user management, content management, analytics
- Mobile: Responsive design, mobile app, offline support
- Analytics: Usage tracking, reporting, insights, metrics

💡 TIME ESTIMATION GUIDELINES:
- Simple features: 4-12 hours (basic forms, static pages, simple UI components)
- Moderate features: 12-32 hours (user authentication, data processing, integrations)
- Complex features: 32-80 hours (real-time features, advanced algorithms, complex integrations)

✅ RESPONSE FORMAT:
Return a JSON array of features with this exact structure:
[
  {
    "title": "Feature Name",
    "description": "Detailed description of what this feature does",
    "category": "Authentication|Core Features|User Interface|Data Management|Integrations|Security|Performance|Admin|Mobile|Analytics",
    "priority": "Critical|High|Medium|Low",
    "complexity": "Simple|Moderate|Complex",
    "timeEstimate": <number_of_hours>
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or formatting.`
            },
            {
              role: 'user',
              content: `Generate a comprehensive feature list for this project: ${projectDescription}`
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content.trim();
        
        try {
          // Try to parse the JSON response
          const featuresData = JSON.parse(content);
          
          if (Array.isArray(featuresData)) {
            // Add IDs to features and validate structure
            const features: Feature[] = featuresData.map((feature, index) => ({
              id: `ai_feature_${Date.now()}_${index}`,
              title: feature.title || 'Untitled Feature',
              description: feature.description || 'No description provided',
              category: this.validateCategory(feature.category),
              priority: this.validatePriority(feature.priority),
              complexity: this.validateComplexity(feature.complexity),
              timeEstimate: Math.max(1, parseInt(feature.timeEstimate) || 8),
              isCustom: false
            }));

            return {
              success: true,
              features
            };
          } else {
            throw new Error('Invalid response format - not an array');
          }
        } catch (parseError) {
          console.warn('Failed to parse AI response as JSON, falling back to manual parsing');
          // Fallback to manual parsing if JSON parsing fails
          const features = this.parseFeatureText(content, projectDescription);
          return {
            success: true,
            features
          };
        }
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('AI Feature Generation Error:', error);
      
      // Fallback to pre-defined features based on project description
      const fallbackFeatures = this.generateFallbackFeatures(projectDescription);
      
      return {
        success: true,
        features: fallbackFeatures
      };
    }
  }

  private validateCategory(category: string): Feature['category'] {
    const validCategories: Feature['category'][] = [
      'Authentication', 'Core Features', 'User Interface', 'Data Management', 
      'Integrations', 'Security', 'Performance', 'Admin', 'Mobile', 'Analytics'
    ];
    return validCategories.includes(category as Feature['category']) 
      ? category as Feature['category'] 
      : 'Core Features';
  }

  private validatePriority(priority: string): Feature['priority'] {
    const validPriorities: Feature['priority'][] = ['Critical', 'High', 'Medium', 'Low'];
    return validPriorities.includes(priority as Feature['priority']) 
      ? priority as Feature['priority'] 
      : 'Medium';
  }

  private validateComplexity(complexity: string): Feature['complexity'] {
    const validComplexities: Feature['complexity'][] = ['Simple', 'Moderate', 'Complex'];
    return validComplexities.includes(complexity as Feature['complexity']) 
      ? complexity as Feature['complexity'] 
      : 'Moderate';
  }

  private parseFeatureText(content: string, projectDescription: string): Feature[] {
    // Manual parsing fallback if JSON parsing fails
    const lines = content.split('\n').filter(line => line.trim());
    const features: Feature[] = [];
    
    lines.forEach((line, index) => {
      if (line.includes('-') || line.includes('•') || line.includes('*')) {
        const cleanLine = line.replace(/^[-•*\s]+/, '').trim();
        
        if (cleanLine.length > 10) { // Only consider substantial lines
          features.push({
            id: `parsed_feature_${Date.now()}_${index}`,
            title: cleanLine.substring(0, 50), // First 50 chars as title
            description: cleanLine,
            category: this.categorizeFromText(cleanLine),
            priority: this.prioritizeFromText(cleanLine),
            complexity: this.complexityFromText(cleanLine),
            timeEstimate: this.estimateTimeFromText(cleanLine),
            isCustom: false
          });
        }
      }
    });

    // If we couldn't parse enough features, add fallback features
    if (features.length < 10) {
      const fallbackFeatures = this.generateFallbackFeatures(projectDescription);
      return [...features, ...fallbackFeatures].slice(0, 20);
    }

    return features.slice(0, 20); // Limit to 20 features
  }

  private categorizeFromText(text: string): Feature['category'] {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('login') || lowerText.includes('auth') || lowerText.includes('register')) {
      return 'Authentication';
    } else if (lowerText.includes('ui') || lowerText.includes('design') || lowerText.includes('interface')) {
      return 'User Interface';
    } else if (lowerText.includes('database') || lowerText.includes('data') || lowerText.includes('storage')) {
      return 'Data Management';
    } else if (lowerText.includes('api') || lowerText.includes('integration') || lowerText.includes('third-party')) {
      return 'Integrations';
    } else if (lowerText.includes('security') || lowerText.includes('encrypt') || lowerText.includes('permission')) {
      return 'Security';
    } else if (lowerText.includes('performance') || lowerText.includes('optimization') || lowerText.includes('cache')) {
      return 'Performance';
    } else if (lowerText.includes('admin') || lowerText.includes('management') || lowerText.includes('dashboard')) {
      return 'Admin';
    } else if (lowerText.includes('mobile') || lowerText.includes('responsive') || lowerText.includes('app')) {
      return 'Mobile';
    } else if (lowerText.includes('analytics') || lowerText.includes('tracking') || lowerText.includes('report')) {
      return 'Analytics';
    } else {
      return 'Core Features';
    }
  }

  private prioritizeFromText(text: string): Feature['priority'] {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('critical') || lowerText.includes('essential') || lowerText.includes('required')) {
      return 'Critical';
    } else if (lowerText.includes('important') || lowerText.includes('high') || lowerText.includes('priority')) {
      return 'High';
    } else if (lowerText.includes('optional') || lowerText.includes('nice') || lowerText.includes('low')) {
      return 'Low';
    } else {
      return 'Medium';
    }
  }

  private complexityFromText(text: string): Feature['complexity'] {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('simple') || lowerText.includes('basic') || lowerText.includes('easy')) {
      return 'Simple';
    } else if (lowerText.includes('complex') || lowerText.includes('advanced') || lowerText.includes('sophisticated')) {
      return 'Complex';
    } else {
      return 'Moderate';
    }
  }

  private estimateTimeFromText(text: string): number {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('simple') || lowerText.includes('basic')) {
      return 8;
    } else if (lowerText.includes('complex') || lowerText.includes('advanced')) {
      return 40;
    } else {
      return 20;
    }
  }

  private generateFallbackFeatures(projectDescription: string): Feature[] {
    const lowerDesc = projectDescription.toLowerCase();
    const baseFeatures: Omit<Feature, 'id'>[] = [
      // Always include core features
      {
        title: 'User Registration & Login',
        description: 'Secure user registration and authentication system with email verification',
        category: 'Authentication',
        priority: 'Critical',
        complexity: 'Moderate',
        timeEstimate: 16
      },
      {
        title: 'User Dashboard',
        description: 'Main dashboard showing user overview and key metrics',
        category: 'Core Features',
        priority: 'Critical',
        complexity: 'Moderate',
        timeEstimate: 20
      },
      {
        title: 'Responsive Design',
        description: 'Mobile-first responsive design that works on all devices',
        category: 'User Interface',
        priority: 'Critical',
        complexity: 'Moderate',
        timeEstimate: 24
      },
      {
        title: 'Data Storage',
        description: 'Secure cloud-based data storage with backup capabilities',
        category: 'Data Management',
        priority: 'Critical',
        complexity: 'Complex',
        timeEstimate: 32
      },
      {
        title: 'Email Notifications',
        description: 'Automated email notifications for important events',
        category: 'Integrations',
        priority: 'High',
        complexity: 'Moderate',
        timeEstimate: 16
      }
    ];

    // Add context-specific features
    const contextFeatures = this.getContextualFallbackFeatures(lowerDesc);
    
    const allFeatures = [...baseFeatures, ...contextFeatures];
    
    return allFeatures.map((feature, index) => ({
      ...feature,
      id: `fallback_feature_${Date.now()}_${index}`,
      isCustom: false
    }));
  }

  private getContextualFallbackFeatures(lowerDesc: string): Omit<Feature, 'id'>[] {
    const contextFeatures: Omit<Feature, 'id'>[] = [];

    if (lowerDesc.includes('ecommerce') || lowerDesc.includes('shop') || lowerDesc.includes('store')) {
      contextFeatures.push(
        {
          title: 'Shopping Cart',
          description: 'Add items to cart and manage quantities',
          category: 'Core Features',
          priority: 'Critical',
          complexity: 'Moderate',
          timeEstimate: 20
        },
        {
          title: 'Payment Processing',
          description: 'Secure payment processing with Stripe/PayPal',
          category: 'Integrations',
          priority: 'Critical',
          complexity: 'Complex',
          timeEstimate: 32
        }
      );
    }

    if (lowerDesc.includes('social') || lowerDesc.includes('community')) {
      contextFeatures.push(
        {
          title: 'User Profiles',
          description: 'Public user profiles with bio and activity',
          category: 'Core Features',
          priority: 'High',
          complexity: 'Moderate',
          timeEstimate: 20
        },
        {
          title: 'Activity Feed',
          description: 'News feed showing user activities',
          category: 'Core Features',
          priority: 'Medium',
          complexity: 'Moderate',
          timeEstimate: 24
        }
      );
    }

    if (lowerDesc.includes('chat') || lowerDesc.includes('messaging')) {
      contextFeatures.push(
        {
          title: 'Real-time Chat',
          description: 'Live messaging between users',
          category: 'Core Features',
          priority: 'High',
          complexity: 'Complex',
          timeEstimate: 36
        }
      );
    }

    return contextFeatures;
  }
}

export const aiService = new AIService(); 