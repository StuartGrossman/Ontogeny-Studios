import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Search, 
  FileText, 
  FolderOpen, 
  Upload,
  File,
  FileCheck,
  Folder
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
}

interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent';
  message: string;
  timestamp: string;
  senderName: string;
}

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'other';
  size: string;
  uploadDate: string;
  category: string;
  file?: File;
}

const CustomerPortalPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Modal states
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [isUploadDocumentModalOpen, setIsUploadDocumentModalOpen] = useState(false);
  
  // Form states
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'general'
  });
  
  const [uploadForm, setUploadForm] = useState({
    category: 'general',
    description: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mock data
  const mockTickets: SupportTicket[] = [
    {
      id: 'TKT-001',
      subject: 'Login Issues with Mobile App',
      status: 'open',
      priority: 'high',
      createdDate: '2024-03-15',
      lastUpdated: '2024-03-15',
      description: 'Unable to log into the mobile application using my credentials.',
      responses: 2,
      assignedAgent: 'Sarah Johnson'
    },
    {
      id: 'TKT-002',
      subject: 'Billing Question about Premium Plan',
      status: 'in-progress',
      priority: 'medium',
      createdDate: '2024-03-14',
      lastUpdated: '2024-03-15',
      description: 'Need clarification on premium plan pricing and features.',
      responses: 3,
      assignedAgent: 'Mike Chen'
    },
    {
      id: 'TKT-003',
      subject: 'Feature Request: Dark Mode',
      status: 'resolved',
      priority: 'low',
      createdDate: '2024-03-10',
      lastUpdated: '2024-03-14',
      description: 'Request for dark mode theme option in the application.',
      responses: 5
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
      content: 'Step-by-step guide to reset your account password...',
      tags: ['password', 'security', 'account']
    },
    {
      id: 'KB-002',
      title: 'Understanding Your Dashboard',
      category: 'Getting Started',
      views: 890,
      helpful: 38,
      lastUpdated: '2024-03-08',
      content: 'Complete guide to navigating your customer dashboard...',
      tags: ['dashboard', 'navigation', 'tutorial']
    },
    {
      id: 'KB-003',
      title: 'Billing and Payment Options',
      category: 'Billing',
      views: 756,
      helpful: 42,
      lastUpdated: '2024-03-05',
      content: 'Information about billing cycles and payment methods...',
      tags: ['billing', 'payment', 'subscription']
    }
  ];

  const mockChatMessages: ChatMessage[] = [
    {
      id: 'MSG-001',
      sender: 'agent',
      message: 'Hello! How can I help you today?',
      timestamp: '14:30',
      senderName: 'Agent Sarah'
    },
    {
      id: 'MSG-002',
      sender: 'customer',
      message: 'Hi, I\'m having trouble with my recent order.',
      timestamp: '14:32',
      senderName: 'You'
    },
    {
      id: 'MSG-003',
      sender: 'agent',
      message: 'I\'d be happy to help with that! Can you provide your order number?',
      timestamp: '14:33',
      senderName: 'Agent Sarah'
    }
  ];

  const mockDocuments: Document[] = [
    {
      id: 'DOC-001',
      name: 'Service Agreement.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadDate: '2024-03-15',
      category: 'Contracts'
    },
    {
      id: 'DOC-002',
      name: 'Product Manual.pdf',
      type: 'pdf',
      size: '5.1 MB',
      uploadDate: '2024-03-12',
      category: 'Documentation'
    },
    {
      id: 'DOC-003',
      name: 'Invoice_March_2024.pdf',
      type: 'pdf',
      size: '1.2 MB',
      uploadDate: '2024-03-01',
      category: 'Billing'
    }
  ];

  useEffect(() => {
    setTickets(mockTickets);
    setKnowledgeArticles(mockKnowledgeArticles);
    setChatMessages(mockChatMessages);
    setDocuments(mockDocuments);
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
      responses: 0
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
      file: selectedFile
    };

    setDocuments([newDocument, ...documents]);
    setSelectedFile(null);
    setUploadForm({
      category: 'general',
      description: ''
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
        senderName: 'You'
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
          senderName: 'Agent Sarah'
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
              <span className="action-icon">📝</span>
              Create Ticket
            </button>
            <button className="action-btn" onClick={() => setActiveTab('knowledge')}>
              <Search className="action-icon" size={16} />
              Search Knowledge Base
            </button>
            <button className="action-btn" onClick={() => setIsChatOpen(true)}>
              <MessageCircle className="action-icon" size={16} />
              Start Live Chat
            </button>
            <button className="action-btn" onClick={() => setIsUploadDocumentModalOpen(true)}>
              <FileText className="action-icon" size={16} />
              Upload Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTickets = () => (
    <div className="tickets-section">
      <div className="section-header">
        <h2>Support Tickets</h2>
        <button className="primary-btn" onClick={() => setIsCreateTicketModalOpen(true)}>Create New Ticket</button>
      </div>

      <div className="tickets-container">
        <div className="tickets-list">
          <div className="filter-bar">
            <select className="filter-select">
              <option>All Statuses</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <select className="filter-select">
              <option>All Priorities</option>
              <option>Urgent</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          {tickets.map(ticket => (
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
                <span className="ticket-date">{ticket.createdDate}</span>
              </div>
              <h4 className="ticket-subject">{ticket.subject}</h4>
              <p className="ticket-description">{ticket.description}</p>
              <div className="ticket-footer">
                <span>Responses: {ticket.responses}</span>
                {ticket.assignedAgent && <span>Assigned to: {ticket.assignedAgent}</span>}
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
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="knowledge-container">
        <div className="articles-list">
          <div className="category-filter">
            <button className="category-btn active">All Categories</button>
            <button className="category-btn">Getting Started</button>
            <button className="category-btn">Account Management</button>
            <button className="category-btn">Billing</button>
            <button className="category-btn">Technical</button>
          </div>

          {knowledgeArticles
            .filter(article => 
              searchQuery === '' || 
              article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map(article => (
            <div 
              key={article.id} 
              className={`article-card ${selectedArticle?.id === article.id ? 'selected' : ''}`}
              onClick={() => setSelectedArticle(article)}
            >
              <h4 className="article-title">{article.title}</h4>
              <div className="article-meta">
                <span className="article-category">{article.category}</span>
                <span className="article-stats">
                  👁️ {article.views} • 👍 {article.helpful}
                </span>
              </div>
              <div className="article-tags">
                {article.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div className="article-updated">Updated: {article.lastUpdated}</div>
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
        <button className="primary-btn" onClick={() => setIsUploadDocumentModalOpen(true)}>Upload Document</button>
      </div>

      <div className="documents-grid">
        {documents.map(doc => (
          <div key={doc.id} className="document-card">
            <div className="document-icon">
                              {doc.type === 'pdf' ? <FileText size={16} /> : doc.type === 'doc' ? <FileCheck size={16} /> : <Folder size={16} />}
            </div>
            <div className="document-info">
              <h4 className="document-name">{doc.name}</h4>
              <div className="document-meta">
                <span className="document-size">{doc.size}</span>
                <span className="document-date">{doc.uploadDate}</span>
              </div>
              <span className="document-category">{doc.category}</span>
            </div>
            <div className="document-actions">
              <button className="doc-action-btn">👁️</button>
              <button className="doc-action-btn">⬇️</button>
              <button className="doc-action-btn">🗑️</button>
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
      </div>

      <div className="portal-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'tickets' && renderTickets()}
        {activeTab === 'knowledge' && renderKnowledgeBase()}
        {activeTab === 'documents' && renderDocuments()}
        {activeTab === 'analytics' && renderDashboard()}
      </div>

      {/* Live Chat Widget */}
      {isChatOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <span>Live Chat Support</span>
            <button className="chat-close" onClick={() => setIsChatOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {chatMessages.map(message => (
              <div key={message.id} className={`chat-message ${message.sender}`}>
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
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}

      {/* Chat Button */}
      {!isChatOpen && (
        <button className="chat-button" onClick={() => setIsChatOpen(true)}>
                          <MessageCircle size={16} />
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