import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Search, 
  FileText, 
  FolderOpen, 
  Upload,
  File,
  FileCheck,
  Folder,
  Bell,
  Settings,
  User,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Filter,
  Star,
  ThumbsUp,
  Share2,
  Printer,
  Calendar,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';
import '../styles/CustomerPortalPlatform.css';

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdDate: string;
  lastUpdated: string;
  description: string;
  responses: number;
  assignedAgent?: string;
  category: string;
  estimatedResolution?: string;
  satisfaction?: number;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  views: number;
  helpful: number;
  lastUpdated: string;
  content: string;
  tags: string[];
  author: string;
  readTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent';
  message: string;
  timestamp: string;
  senderName: string;
  avatar?: string;
  type?: 'text' | 'file' | 'system';
}

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'other';
  size: string;
  uploadDate: string;
  category: string;
  file?: File;
  description?: string;
  version?: string;
  downloadCount?: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

const CustomerPortalPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [articleCategory, setArticleCategory] = useState('all');
  const [documentFilter, setDocumentFilter] = useState('all');
  
  // Modal states
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [isUploadDocumentModalOpen, setIsUploadDocumentModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Form states
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'general'
  });
  
  const [uploadForm, setUploadForm] = useState({
    category: 'general',
    description: '',
    version: '1.0'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Enhanced mock data
  const mockTickets: SupportTicket[] = [
    {
      id: 'TKT-001',
      subject: 'Login Issues with Mobile App',
      status: 'open',
      priority: 'high',
      createdDate: '2024-03-15',
      lastUpdated: '2024-03-15',
      description: 'Unable to log into the mobile application using my credentials. The app shows an error message after entering valid login information.',
      responses: 2,
      assignedAgent: 'Sarah Johnson',
      category: 'Technical Support',
      estimatedResolution: '2024-03-16',
      satisfaction: 4
    },
    {
      id: 'TKT-002',
      subject: 'Billing Question about Premium Plan',
      status: 'in-progress',
      priority: 'medium',
      createdDate: '2024-03-14',
      lastUpdated: '2024-03-15',
      description: 'Need clarification on premium plan pricing and features. Would like to understand the difference between plans.',
      responses: 3,
      assignedAgent: 'Mike Chen',
      category: 'Billing',
      estimatedResolution: '2024-03-17',
      satisfaction: 5
    },
    {
      id: 'TKT-003',
      subject: 'Feature Request: Dark Mode',
      status: 'resolved',
      priority: 'low',
      createdDate: '2024-03-10',
      lastUpdated: '2024-03-14',
      description: 'Request for dark mode theme option in the application to reduce eye strain during night usage.',
      responses: 5,
      category: 'Feature Request',
      satisfaction: 5
    },
    {
      id: 'TKT-004',
      subject: 'Data Export Functionality',
      status: 'closed',
      priority: 'medium',
      createdDate: '2024-03-08',
      lastUpdated: '2024-03-12',
      description: 'Need ability to export data in CSV format for external analysis.',
      responses: 4,
      assignedAgent: 'Lisa Wang',
      category: 'Feature Request',
      satisfaction: 4
    }
  ];

  const mockKnowledgeArticles: KnowledgeArticle[] = [
    {
      id: 'KB-001',
      title: 'How to Reset Your Password',
      category: 'Account Management',
      views: 1205,
      helpful: 45,
      lastUpdated: '2024-03-10',
      content: 'Step-by-step guide to reset your account password securely...',
      tags: ['password', 'security', 'account'],
      author: 'Support Team',
      readTime: 3,
      difficulty: 'beginner'
    },
    {
      id: 'KB-002',
      title: 'Understanding Your Dashboard',
      category: 'Getting Started',
      views: 890,
      helpful: 38,
      lastUpdated: '2024-03-08',
      content: 'Complete guide to navigating your customer dashboard and utilizing all features...',
      tags: ['dashboard', 'navigation', 'tutorial'],
      author: 'Product Team',
      readTime: 5,
      difficulty: 'beginner'
    },
    {
      id: 'KB-003',
      title: 'Billing and Payment Options',
      category: 'Billing',
      views: 756,
      helpful: 42,
      lastUpdated: '2024-03-05',
      content: 'Information about billing cycles, payment methods, and subscription management...',
      tags: ['billing', 'payment', 'subscription'],
      author: 'Finance Team',
      readTime: 4,
      difficulty: 'intermediate'
    },
    {
      id: 'KB-004',
      title: 'Advanced API Integration',
      category: 'Technical',
      views: 324,
      helpful: 28,
      lastUpdated: '2024-03-12',
      content: 'Comprehensive guide for integrating with our API endpoints...',
      tags: ['api', 'integration', 'technical'],
      author: 'Engineering Team',
      readTime: 15,
      difficulty: 'advanced'
    }
  ];

  const mockChatMessages: ChatMessage[] = [
    {
      id: 'MSG-001',
      sender: 'agent',
      message: 'Hello! How can I help you today?',
      timestamp: '14:30',
      senderName: 'Agent Sarah',
      avatar: '👩‍💼',
      type: 'text'
    },
    {
      id: 'MSG-002',
      sender: 'customer',
      message: 'Hi, I\'m having trouble with my recent order.',
      timestamp: '14:32',
      senderName: 'You',
      avatar: '👤',
      type: 'text'
    },
    {
      id: 'MSG-003',
      sender: 'agent',
      message: 'I\'d be happy to help with that! Can you provide your order number?',
      timestamp: '14:33',
      senderName: 'Agent Sarah',
      avatar: '👩‍💼',
      type: 'text'
    }
  ];

  const mockDocuments: Document[] = [
    {
      id: 'DOC-001',
      name: 'Service Agreement.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadDate: '2024-03-15',
      category: 'Contracts',
      description: 'Master service agreement document',
      version: '2.1',
      downloadCount: 15
    },
    {
      id: 'DOC-002',
      name: 'Product Manual.pdf',
      type: 'pdf',
      size: '5.1 MB',
      uploadDate: '2024-03-12',
      category: 'Documentation',
      description: 'Complete product usage manual',
      version: '3.0',
      downloadCount: 42
    },
    {
      id: 'DOC-003',
      name: 'Invoice_March_2024.pdf',
      type: 'pdf',
      size: '156 KB',
      uploadDate: '2024-03-01',
      category: 'Billing',
      description: 'Monthly invoice for March 2024',
      version: '1.0',
      downloadCount: 8
    },
    {
      id: 'DOC-004',
      name: 'API_Documentation.pdf',
      type: 'pdf',
      size: '3.8 MB',
      uploadDate: '2024-02-28',
      category: 'Technical',
      description: 'API integration documentation',
      version: '4.2',
      downloadCount: 23
    }
  ];

  const mockNotifications: Notification[] = [
    {
      id: 'NOT-001',
      title: 'Ticket Update',
      message: 'Your support ticket TKT-001 has been updated',
      type: 'info',
      timestamp: '2 hours ago',
      read: false
    },
    {
      id: 'NOT-002',
      title: 'Payment Successful',
      message: 'Your monthly subscription payment has been processed',
      type: 'success',
      timestamp: '1 day ago',
      read: false
    },
    {
      id: 'NOT-003',
      title: 'New Feature Available',
      message: 'Dark mode is now available in your settings',
      type: 'info',
      timestamp: '3 days ago',
      read: true
    }
  ];

  useEffect(() => {
    setTickets(mockTickets);
    setKnowledgeArticles(mockKnowledgeArticles);
    setChatMessages(mockChatMessages);
    setDocuments(mockDocuments);
    setNotifications(mockNotifications);
  }, []);

  // Handler functions
  const handleCreateTicket = () => {
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newTicket: SupportTicket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      subject: newTicketForm.subject,
      description: newTicketForm.description,
      priority: newTicketForm.priority,
      status: 'open',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      responses: 0,
      category: newTicketForm.category
    };

    setTickets([newTicket, ...tickets]);
    setNewTicketForm({
      subject: '',
      description: '',
      priority: 'medium',
      category: 'general'
    });
    setIsCreateTicketModalOpen(false);
    setActiveTab('tickets');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadDocument = () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
    let docType: 'pdf' | 'doc' | 'image' | 'other' = 'other';
    
    if (fileType === 'pdf') docType = 'pdf';
    else if (['doc', 'docx'].includes(fileType || '')) docType = 'doc';
    else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType || '')) docType = 'image';

    const newDocument: Document = {
      id: `DOC-${String(documents.length + 1).padStart(3, '0')}`,
      name: selectedFile.name,
      type: docType,
      size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      category: uploadForm.category,
      file: selectedFile,
      description: uploadForm.description,
      version: uploadForm.version,
      downloadCount: 0
    };

    setDocuments([newDocument, ...documents]);
    setSelectedFile(null);
    setUploadForm({
      category: 'general',
      description: '',
      version: '1.0'
    });
    setIsUploadDocumentModalOpen(false);
    setActiveTab('documents');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: `MSG-${Date.now()}`,
        sender: 'customer',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderName: 'You',
        avatar: '👤',
        type: 'text'
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');

      // Simulate agent response
      setTimeout(() => {
        const agentResponse: ChatMessage = {
          id: `MSG-${Date.now() + 1}`,
          sender: 'agent',
          message: 'Thank you for your message. Let me look into that for you.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderName: 'Agent Sarah',
          avatar: '👩‍💼',
          type: 'text'
        };
        setChatMessages(prev => [...prev, agentResponse]);
      }, 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'in-progress': return 'status-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return 'status-open';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const renderDashboard = () => (
    <div className="dashboard-section">
      <div className="welcome-banner">
        <h2>Welcome back, John!</h2>
        <p>Here's your account overview and recent activity</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <h3>Open Tickets</h3>
            <div className="stat-number">3</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Documents</h3>
            <div className="stat-number">12</div>
          </div>
        </div>
        <div className="stat-card">
          <MessageCircle className="stat-icon" size={24} />
          <div className="stat-content">
            <h3>Messages</h3>
            <div className="stat-number">5</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Satisfaction</h3>
            <div className="stat-number">98%</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="recent-tickets">
          <h3>Recent Support Tickets</h3>
          <div className="ticket-list">
            {tickets.slice(0, 3).map(ticket => (
              <div key={ticket.id} className="ticket-item" onClick={() => setSelectedTicket(ticket)}>
                <div className="ticket-header">
                  <span className="ticket-id">{ticket.id}</span>
                  <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="ticket-subject">{ticket.subject}</div>
                <div className="ticket-meta">
                  <span>Created: {ticket.createdDate}</span>
                  <span className={`priority-badge ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="view-all-btn" onClick={() => setActiveTab('tickets')}>
            View All Tickets
          </button>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => setIsCreateTicketModalOpen(true)}>
              <Plus className="action-icon" size={20} />
              <span>Create Ticket</span>
            </button>
            <button className="action-btn" onClick={() => setIsUploadDocumentModalOpen(true)}>
              <Upload className="action-icon" size={20} />
              <span>Upload Document</span>
            </button>
            <button className="action-btn" onClick={() => setActiveTab('knowledge')}>
              <FileText className="action-icon" size={20} />
              <span>Browse Knowledge Base</span>
            </button>
            <button className="action-btn" onClick={() => setIsChatOpen(true)}>
              <MessageCircle className="action-icon" size={20} />
              <span>Start Chat</span>
            </button>
          </div>
        </div>

        <div className="activity-overview">
          <h3>Recent Activity</h3>
          <div className="activity-feed">
            <div className="activity-item">
              <div className="activity-icon success">
                <CheckCircle size={16} />
              </div>
              <div className="activity-content">
                <p><strong>Ticket TKT-003</strong> was resolved</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon info">
                <Upload size={16} />
              </div>
              <div className="activity-content">
                <p>New document <strong>Service Agreement.pdf</strong> uploaded</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon warning">
                <Clock size={16} />
              </div>
              <div className="activity-content">
                <p><strong>Ticket TKT-001</strong> is awaiting response</p>
                <span className="activity-time">2 days ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="performance-metrics">
          <h3>Account Performance</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <TrendingUp className="metric-icon" size={20} />
                <span>Response Time</span>
              </div>
              <div className="metric-value">2.3 hrs</div>
              <div className="metric-change positive">↑ 15% faster</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <Star className="metric-icon" size={20} />
                <span>Satisfaction</span>
              </div>
              <div className="metric-value">4.8/5</div>
              <div className="metric-change positive">↑ 0.2 points</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <Activity className="metric-icon" size={20} />
                <span>Resolution Rate</span>
              </div>
              <div className="metric-value">94%</div>
              <div className="metric-change positive">↑ 3%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTickets = () => (
    <div className="tickets-section">
      <div className="section-header">
        <h2>Support Tickets</h2>
        <div className="header-actions">
          <div className="search-container">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="primary-btn" onClick={() => setIsCreateTicketModalOpen(true)}>
            <Plus size={16} />
            Create New Ticket
          </button>
        </div>
      </div>

      <div className="tickets-overview">
        <div className="ticket-stats">
          <div className="stat-item">
            <div className="stat-value">{tickets.filter(t => t.status === 'open').length}</div>
            <div className="stat-label">Open</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{tickets.filter(t => t.status === 'in-progress').length}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{tickets.filter(t => t.status === 'resolved').length}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{tickets.filter(t => t.status === 'closed').length}</div>
            <div className="stat-label">Closed</div>
          </div>
        </div>
      </div>

      <div className="tickets-container">
        <div className="tickets-list">
          <div className="filter-bar">
            <select 
              className="filter-select" 
              value={ticketFilter} 
              onChange={(e) => setTicketFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select className="filter-select">
              <option>All Priorities</option>
              <option>Urgent</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="filter-select">
              <option>All Categories</option>
              <option>Technical Support</option>
              <option>Billing</option>
              <option>Feature Request</option>
              <option>General</option>
            </select>
          </div>

          {tickets
            .filter(ticket => {
              const matchesFilter = ticketFilter === 'all' || ticket.status === ticketFilter;
              const matchesSearch = searchQuery === '' || 
                ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
              return matchesFilter && matchesSearch;
            })
            .map(ticket => (
            <div 
              key={ticket.id} 
              className={`ticket-card ${selectedTicket?.id === ticket.id ? 'selected' : ''}`}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="ticket-card-header">
                <div className="ticket-info">
                  <span className="ticket-id">{ticket.id}</span>
                  <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('-', ' ')}
                  </span>
                  <span className={`priority-badge ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="ticket-meta-right">
                  <span className="ticket-category">{ticket.category}</span>
                  <span className="ticket-date">{ticket.createdDate}</span>
                </div>
              </div>
              <h4 className="ticket-subject">{ticket.subject}</h4>
              <p className="ticket-description">{ticket.description.substring(0, 120)}...</p>
              <div className="ticket-footer">
                <div className="ticket-stats">
                  <span><MessageCircle size={14} /> {ticket.responses}</span>
                  {ticket.assignedAgent && <span><User size={14} /> {ticket.assignedAgent}</span>}
                  {ticket.estimatedResolution && (
                    <span><Calendar size={14} /> Est: {ticket.estimatedResolution}</span>
                  )}
                </div>
                {ticket.satisfaction && (
                  <div className="satisfaction-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={i < ticket.satisfaction! ? 'filled' : 'empty'} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedTicket && (
          <div className="ticket-details">
            <div className="ticket-details-header">
              <h3>{selectedTicket.subject}</h3>
              <button className="close-btn" onClick={() => setSelectedTicket(null)}>✕</button>
            </div>
            <div className="ticket-details-content">
              <div className="ticket-meta-info">
                <div className="meta-item">
                  <strong>Ticket ID:</strong> {selectedTicket.id}
                </div>
                <div className="meta-item">
                  <strong>Status:</strong> 
                  <span className={`status-badge ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="meta-item">
                  <strong>Priority:</strong>
                  <span className={`priority-badge ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className="meta-item">
                  <strong>Created:</strong> {selectedTicket.createdDate}
                </div>
                <div className="meta-item">
                  <strong>Last Updated:</strong> {selectedTicket.lastUpdated}
                </div>
                {selectedTicket.assignedAgent && (
                  <div className="meta-item">
                    <strong>Assigned Agent:</strong> {selectedTicket.assignedAgent}
                  </div>
                )}
              </div>
              <div className="ticket-description-full">
                <h4>Description</h4>
                <p>{selectedTicket.description}</p>
              </div>
              <div className="ticket-actions">
                <button className="action-btn-primary">Add Response</button>
                <button className="action-btn-secondary">Close Ticket</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderKnowledgeBase = () => (
    <div className="knowledge-section">
      <div className="section-header">
        <h2>Knowledge Base</h2>
        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="knowledge-stats">
        <div className="kb-stat">
          <BarChart3 className="kb-stat-icon" size={20} />
          <div className="kb-stat-content">
            <div className="kb-stat-value">{knowledgeArticles.length}</div>
            <div className="kb-stat-label">Articles</div>
          </div>
        </div>
        <div className="kb-stat">
          <Eye className="kb-stat-icon" size={20} />
          <div className="kb-stat-content">
            <div className="kb-stat-value">{knowledgeArticles.reduce((sum, article) => sum + article.views, 0).toLocaleString()}</div>
            <div className="kb-stat-label">Total Views</div>
          </div>
        </div>
        <div className="kb-stat">
          <ThumbsUp className="kb-stat-icon" size={20} />
          <div className="kb-stat-content">
            <div className="kb-stat-value">{knowledgeArticles.reduce((sum, article) => sum + article.helpful, 0)}</div>
            <div className="kb-stat-label">Helpful Votes</div>
          </div>
        </div>
      </div>

      <div className="knowledge-container">
        <div className="articles-list">
          <div className="category-filter">
            <button 
              className={`category-btn ${articleCategory === 'all' ? 'active' : ''}`}
              onClick={() => setArticleCategory('all')}
            >
              All Categories
            </button>
            <button 
              className={`category-btn ${articleCategory === 'Getting Started' ? 'active' : ''}`}
              onClick={() => setArticleCategory('Getting Started')}
            >
              Getting Started
            </button>
            <button 
              className={`category-btn ${articleCategory === 'Account Management' ? 'active' : ''}`}
              onClick={() => setArticleCategory('Account Management')}
            >
              Account Management
            </button>
            <button 
              className={`category-btn ${articleCategory === 'Billing' ? 'active' : ''}`}
              onClick={() => setArticleCategory('Billing')}
            >
              Billing
            </button>
            <button 
              className={`category-btn ${articleCategory === 'Technical' ? 'active' : ''}`}
              onClick={() => setArticleCategory('Technical')}
            >
              Technical
            </button>
          </div>

          {knowledgeArticles
            .filter(article => {
              const matchesCategory = articleCategory === 'all' || article.category === articleCategory;
              const matchesSearch = searchQuery === '' || 
                article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
              return matchesCategory && matchesSearch;
            })
            .map(article => (
            <div 
              key={article.id} 
              className={`article-card ${selectedArticle?.id === article.id ? 'selected' : ''}`}
              onClick={() => setSelectedArticle(article)}
            >
              <div className="article-header">
                <h4 className="article-title">{article.title}</h4>
                <div className="article-difficulty">
                  <span className={`difficulty-badge ${article.difficulty}`}>
                    {article.difficulty}
                  </span>
                </div>
              </div>
              <div className="article-meta">
                <span className="article-category">{article.category}</span>
                <span className="article-author">By {article.author}</span>
                <span className="article-read-time">
                  <Clock size={12} /> {article.readTime} min read
                </span>
              </div>
              <p className="article-preview">{article.content.substring(0, 100)}...</p>
              <div className="article-stats">
                <span><Eye size={14} /> {article.views.toLocaleString()}</span>
                <span><ThumbsUp size={14} /> {article.helpful}</span>
                <span className="article-updated">Updated {article.lastUpdated}</span>
              </div>
              <div className="article-tags">
                {article.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedArticle && (
          <div className="article-details">
            <div className="article-details-header">
              <h3>{selectedArticle.title}</h3>
              <button className="close-btn" onClick={() => setSelectedArticle(null)}>✕</button>
            </div>
            <div className="article-details-content">
              <div className="article-meta-info">
                <span className="category-badge">{selectedArticle.category}</span>
                <span className="views-count">👁️ {selectedArticle.views} views</span>
                <span className="helpful-count">👍 {selectedArticle.helpful} helpful</span>
              </div>
              <div className="article-content">
                <p>{selectedArticle.content}</p>
              </div>
              <div className="article-actions">
                <button className="helpful-btn">👍 Helpful</button>
                <button className="share-btn">📤 Share</button>
                <button className="print-btn">🖨️ Print</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="documents-section">
      <div className="section-header">
        <h2>My Documents</h2>
        <div className="header-actions">
          <div className="search-container">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <select 
            className="filter-select" 
            value={documentFilter} 
            onChange={(e) => setDocumentFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Contracts">Contracts</option>
            <option value="Documentation">Documentation</option>
            <option value="Billing">Billing</option>
            <option value="Technical">Technical</option>
          </select>
          <button className="primary-btn" onClick={() => setIsUploadDocumentModalOpen(true)}>
            <Upload size={16} />
            Upload Document
          </button>
        </div>
      </div>

      <div className="documents-overview">
        <div className="doc-stats">
          <div className="doc-stat">
            <File className="doc-stat-icon" size={20} />
            <div className="doc-stat-content">
              <div className="doc-stat-value">{documents.length}</div>
              <div className="doc-stat-label">Total Documents</div>
            </div>
          </div>
          <div className="doc-stat">
            <Download className="doc-stat-icon" size={20} />
            <div className="doc-stat-content">
              <div className="doc-stat-value">{documents.reduce((sum, doc) => sum + (doc.downloadCount || 0), 0)}</div>
              <div className="doc-stat-label">Total Downloads</div>
            </div>
          </div>
          <div className="doc-stat">
            <FolderOpen className="doc-stat-icon" size={20} />
            <div className="doc-stat-content">
              <div className="doc-stat-value">{new Set(documents.map(doc => doc.category)).size}</div>
              <div className="doc-stat-label">Categories</div>
            </div>
          </div>
        </div>
      </div>

      <div className="documents-grid">
        {documents
          .filter(doc => {
            const matchesCategory = documentFilter === 'all' || doc.category === documentFilter;
            const matchesSearch = searchQuery === '' || 
              doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
          })
          .map(doc => (
          <div key={doc.id} className="document-card">
            <div className="document-header">
              <div className="document-icon">
                {doc.type === 'pdf' ? <FileText size={24} /> : 
                 doc.type === 'doc' ? <FileCheck size={24} /> : 
                 doc.type === 'image' ? <File size={24} /> : 
                 <Folder size={24} />}
              </div>
              <div className="document-category-badge">{doc.category}</div>
            </div>
            <div className="document-info">
              <h4 className="document-name">{doc.name}</h4>
              {doc.description && (
                <p className="document-description">{doc.description}</p>
              )}
              <div className="document-meta">
                <span className="document-size">{doc.size}</span>
                <span className="document-date">
                  <Calendar size={12} /> {doc.uploadDate}
                </span>
                {doc.version && (
                  <span className="document-version">v{doc.version}</span>
                )}
              </div>
              {doc.downloadCount !== undefined && (
                <div className="document-stats">
                  <span><Download size={12} /> {doc.downloadCount} downloads</span>
                </div>
              )}
            </div>
            <div className="document-actions">
              <button className="doc-action-btn view" title="View">
                <Eye size={16} />
              </button>
              <button className="doc-action-btn download" title="Download">
                <Download size={16} />
              </button>
              <button className="doc-action-btn share" title="Share">
                <Share2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="customer-portal">
      <div className="portal-header">
        <div className="portal-title-section">
          <h2>Customer Portal</h2>
          <p className="portal-description">
            Your personalized dashboard for support, resources, and account management
          </p>
        </div>
        <div className="portal-header-actions">
          <div className="portal-tabs">
            <button
              className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`tab-button ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              Support
            </button>
            <button
              className={`tab-button ${activeTab === 'knowledge' ? 'active' : ''}`}
              onClick={() => setActiveTab('knowledge')}
            >
              Knowledge Base
            </button>
            <button
              className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents
            </button>
            <button
              className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>
          <div className="portal-user-actions">
            <div className="notification-center">
              <button 
                className={`notification-btn ${notifications.some(n => !n.read) ? 'has-unread' : ''}`}
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell size={20} />
                {notifications.some(n => !n.read) && (
                  <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <button onClick={() => setIsNotificationsOpen(false)}>×</button>
                  </div>
                  <div className="notification-list">
                    {notifications.map(notification => (
                      <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                        <div className={`notification-icon ${notification.type}`}>
                          {notification.type === 'success' && <CheckCircle size={16} />}
                          {notification.type === 'info' && <AlertCircle size={16} />}
                          {notification.type === 'warning' && <AlertCircle size={16} />}
                          {notification.type === 'error' && <XCircle size={16} />}
                        </div>
                        <div className="notification-content">
                          <h4>{notification.title}</h4>
                          <p>{notification.message}</p>
                          <span className="notification-time">{notification.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button 
              className="profile-btn"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="portal-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'tickets' && renderTickets()}
        {activeTab === 'knowledge' && renderKnowledgeBase()}
        {activeTab === 'documents' && renderDocuments()}
        {activeTab === 'analytics' && renderDashboard()}
      </div>

      {/* Enhanced Live Chat Widget */}
      {isChatOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <div className="chat-agent-info">
              <div className="agent-avatar">👩‍💼</div>
              <div className="agent-details">
                <span className="agent-name">Agent Sarah</span>
                <span className="agent-status online">Online</span>
              </div>
            </div>
            <button className="chat-close" onClick={() => setIsChatOpen(false)}>
              <XCircle size={20} />
            </button>
          </div>
          <div className="chat-messages">
            {chatMessages.map(message => (
              <div key={message.id} className={`chat-message ${message.sender}`}>
                <div className="message-avatar">
                  {message.avatar}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.message}</div>
                  <div className="message-meta">
                    <span className="sender-name">{message.senderName}</span>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} className="send-btn">
              <span>Send</span>
            </button>
          </div>
          <div className="chat-footer">
            <span className="typing-indicator">Agent is typing...</span>
          </div>
        </div>
      )}

      {/* Enhanced Chat Button */}
      {!isChatOpen && (
        <button className="chat-button" onClick={() => setIsChatOpen(true)}>
          <MessageCircle size={20} />
          <span className="chat-tooltip">Need help? Chat with us!</span>
        </button>
      )}

      {/* Create Ticket Modal */}
      {isCreateTicketModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateTicketModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Support Ticket</h3>
              <button className="modal-close" onClick={() => setIsCreateTicketModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="ticket-subject">Subject *</label>
                  <input
                    id="ticket-subject"
                    type="text"
                    placeholder="Brief description of your issue"
                    value={newTicketForm.subject}
                    onChange={(e) => setNewTicketForm({...newTicketForm, subject: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ticket-priority">Priority</label>
                  <select
                    id="ticket-priority"
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({...newTicketForm, priority: e.target.value as any})}
                    className="form-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="ticket-description">Description *</label>
                  <textarea
                    id="ticket-description"
                    placeholder="Please provide detailed information about your issue"
                    value={newTicketForm.description}
                    onChange={(e) => setNewTicketForm({...newTicketForm, description: e.target.value})}
                    className="form-textarea"
                    rows={4}
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setIsCreateTicketModalOpen(false)}>
                Cancel
              </button>
              <button className="submit-btn" onClick={handleCreateTicket}>
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadDocumentModalOpen && (
        <div className="modal-overlay" onClick={() => setIsUploadDocumentModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Document</h3>
              <button className="modal-close" onClick={() => setIsUploadDocumentModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="doc-category">Category</label>
                  <select
                    id="doc-category"
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                    className="form-select"
                  >
                    <option value="general">General</option>
                    <option value="contracts">Contracts</option>
                    <option value="billing">Billing</option>
                    <option value="documentation">Documentation</option>
                    <option value="support">Support</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="doc-file">Select File *</label>
                  <div className="file-upload-area">
                    <input
                      ref={fileInputRef}
                      id="doc-file"
                      type="file"
                      onChange={handleFileSelect}
                      className="file-input"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    />
                    <div className="file-upload-display">
                      {selectedFile ? (
                        <div className="selected-file">
                          <File className="file-icon" size={16} />
                          <div className="file-info">
                            <div className="file-name">{selectedFile.name}</div>
                            <div className="file-size">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</div>
                          </div>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <Upload className="upload-icon" size={24} />
                          <p>Click to select a file or drag and drop</p>
                          <p className="upload-hint">Supported: PDF, DOC, DOCX, JPG, PNG, GIF</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="doc-description">Description (Optional)</label>
                  <textarea
                    id="doc-description"
                    placeholder="Brief description of the document"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setIsUploadDocumentModalOpen(false)}>
                Cancel
              </button>
              <button className="submit-btn" onClick={handleUploadDocument}>
                Upload Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortalPlatform; 