import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Mail, 
  BarChart3, 
  ShoppingBag, 
  Zap, 
  AlertTriangle,
  Info,
  BarChart,
  Activity,
  FileText,
  RefreshCw,
  CheckCircle,
  Link,
  Plus,
  Settings,
  TrendingUp,
  Database,
  Cloud,
  Webhook,
  X,
  Play,
  Pause,
  Edit3,
  Trash2,
  Eye
} from 'lucide-react';
import '../styles/APIIntegrationHub.css';

interface APIService {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  type: 'CRM' | 'ERP' | 'Payment' | 'Marketing' | 'Analytics' | 'Database' | 'Cloud' | 'Webhook';
  icon: string;
  lastSync: string;
  requestCount: number;
  errorRate: number;
  responseTime: number;
  description: string;
  version: string;
  endpoint: string;
  authentication: string;
  dataTransferred: number;
  uptime: number;
}

interface Integration {
  id: string;
  name: string;
  source: string;
  destination: string;
  status: 'active' | 'inactive' | 'error' | 'scheduled';
  dataFlow: number;
  lastRun: string;
  frequency: string;
  successRate: number;
  totalRuns: number;
  avgRunTime: number;
}

interface APILog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  service: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  message: string;
}

const APIIntegrationHub: React.FC = () => {
  const [currentView, setCurrentView] = useState<'main' | 'statistics' | 'graphs'>('main');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [realTimeData, setRealTimeData] = useState({
    totalRequests: 125847,
    successRate: 99.2,
    avgResponseTime: 145,
    activeConnections: 23,
    totalDataTransferred: 2.4,
    alertsCount: 3,
    integrationCount: 12,
    servicesCount: 8
  });

  // Enhanced sample data with more services
  const services: APIService[] = [
    {
      id: 'salesforce',
      name: 'Salesforce CRM',
      status: 'connected',
      type: 'CRM',
      icon: '☁️',
      lastSync: '2 minutes ago',
      requestCount: 1247,
      errorRate: 0.1,
      responseTime: 120,
      description: 'Customer relationship management and sales automation platform',
      version: 'v54.0',
      endpoint: 'https://api.salesforce.com',
      authentication: 'OAuth 2.0',
      dataTransferred: 456.7,
      uptime: 99.8
    },
    {
      id: 'stripe',
      name: 'Stripe Payments',
      status: 'connected',
      type: 'Payment',
      icon: '💳',
      lastSync: '30 seconds ago',
      requestCount: 892,
      errorRate: 0.0,
      responseTime: 89,
      description: 'Payment processing and transaction management system',
      version: '2023-10-16',
      endpoint: 'https://api.stripe.com',
      authentication: 'API Key',
      dataTransferred: 234.5,
      uptime: 99.9
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp Marketing',
      status: 'connected',
      type: 'Marketing',
      icon: '📧',
      lastSync: '5 minutes ago',
      requestCount: 324,
      errorRate: 0.3,
      responseTime: 180,
      description: 'Email marketing automation and campaign management',
      version: 'v3.0',
      endpoint: 'https://api.mailchimp.com',
      authentication: 'API Key',
      dataTransferred: 123.4,
      uptime: 99.5
    },
    {
      id: 'analytics',
      name: 'Google Analytics',
      status: 'connected',
      type: 'Analytics',
      icon: '📊',
      lastSync: '1 minute ago',
      requestCount: 456,
      errorRate: 0.2,
      responseTime: 180,
      description: 'Web analytics and performance tracking platform',
      version: 'v4',
      endpoint: 'https://analyticsreporting.googleapis.com',
      authentication: 'OAuth 2.0',
      dataTransferred: 789.1,
      uptime: 99.7
    },
    {
      id: 'shopify',
      name: 'Shopify Store',
      status: 'error',
      type: 'ERP',
      icon: '🛍️',
      lastSync: '15 minutes ago',
      requestCount: 234,
      errorRate: 5.2,
      responseTime: 320,
      description: 'E-commerce platform and inventory management system',
      version: '2023-10',
      endpoint: 'https://api.shopify.com',
      authentication: 'Private App',
      dataTransferred: 345.6,
      uptime: 94.2
    },
    {
      id: 'postgres',
      name: 'PostgreSQL Database',
      status: 'connected',
      type: 'Database',
      icon: '🗄️',
      lastSync: '5 seconds ago',
      requestCount: 2847,
      errorRate: 0.0,
      responseTime: 45,
      description: 'Primary database for application data storage',
      version: '15.4',
      endpoint: 'localhost:5432',
      authentication: 'Username/Password',
      dataTransferred: 1234.5,
      uptime: 99.9
    },
    {
      id: 'aws-s3',
      name: 'AWS S3 Storage',
      status: 'connected',
      type: 'Cloud',
      icon: '☁️',
      lastSync: '1 minute ago',
      requestCount: 567,
      errorRate: 0.1,
      responseTime: 95,
      description: 'Cloud storage for files and media assets',
      version: '2006-03-01',
      endpoint: 'https://s3.amazonaws.com',
      authentication: 'IAM Role',
      dataTransferred: 2345.6,
      uptime: 99.9
    },
    {
      id: 'slack',
      name: 'Slack Notifications',
      status: 'connected',
      type: 'Webhook',
      icon: '💬',
      lastSync: '3 minutes ago',
      requestCount: 89,
      errorRate: 0.0,
      responseTime: 150,
      description: 'Team communication and notification system',
      version: 'v1.7.0',
      endpoint: 'https://hooks.slack.com',
      authentication: 'Webhook URL',
      dataTransferred: 12.3,
      uptime: 99.8
    }
  ];

  const integrations: Integration[] = [
    {
      id: 'crm-to-email',
      name: 'CRM to Email Marketing Sync',
      source: 'Salesforce CRM',
      destination: 'Mailchimp Marketing',
      status: 'active',
      dataFlow: 1250,
      lastRun: '5 minutes ago',
      frequency: 'Every 15 minutes',
      successRate: 98.5,
      totalRuns: 2847,
      avgRunTime: 23
    },
    {
      id: 'payments-to-crm',
      name: 'Payment to CRM Integration',
      source: 'Stripe Payments',
      destination: 'Salesforce CRM',
      status: 'active',
      dataFlow: 892,
      lastRun: '2 minutes ago',
      frequency: 'Real-time',
      successRate: 99.8,
      totalRuns: 5632,
      avgRunTime: 12
    },
    {
      id: 'analytics-to-db',
      name: 'Analytics Data Pipeline',
      source: 'Google Analytics',
      destination: 'PostgreSQL Database',
      status: 'error',
      dataFlow: 0,
      lastRun: '2 hours ago',
      frequency: 'Daily at 2 AM',
      successRate: 87.3,
      totalRuns: 127,
      avgRunTime: 156
    },
    {
      id: 'shopify-to-storage',
      name: 'Product Images Backup',
      source: 'Shopify Store',
      destination: 'AWS S3 Storage',
      status: 'scheduled',
      dataFlow: 456,
      lastRun: '1 day ago',
      frequency: 'Weekly',
      successRate: 95.2,
      totalRuns: 52,
      avgRunTime: 89
    },
    {
      id: 'alerts-to-slack',
      name: 'System Alerts to Slack',
      source: 'PostgreSQL Database',
      destination: 'Slack Notifications',
      status: 'active',
      dataFlow: 23,
      lastRun: '10 minutes ago',
      frequency: 'As needed',
      successRate: 100.0,
      totalRuns: 234,
      avgRunTime: 3
    }
  ];

  const apiLogs: APILog[] = [
    {
      id: '1',
      timestamp: '2024-01-15 14:32:15',
      level: 'success',
      service: 'Salesforce CRM',
      method: 'POST',
      endpoint: '/services/data/v54.0/sobjects/Contact',
      statusCode: 201,
      responseTime: 120,
      message: 'Contact created successfully - ID: 003XX0000012345'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:30:42',
      level: 'error',
      service: 'Shopify Store',
      method: 'GET',
      endpoint: '/admin/api/2023-10/products.json',
      statusCode: 429,
      responseTime: 320,
      message: 'API rate limit exceeded - retrying in 60 seconds'
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:28:33',
      level: 'warning',
      service: 'Google Analytics',
      method: 'POST',
      endpoint: '/v4/reports:batchGet',
      statusCode: 200,
      responseTime: 2300,
      message: 'Response time above threshold: 2.3s'
    },
    {
      id: '4',
      timestamp: '2024-01-15 14:27:18',
      level: 'info',
      service: 'Stripe Payments',
      method: 'POST',
      endpoint: '/v1/payment_intents',
      statusCode: 200,
      responseTime: 89,
      message: 'Payment intent created - Amount: $129.99'
    },
    {
      id: '5',
      timestamp: '2024-01-15 14:25:45',
      level: 'success',
      service: 'AWS S3 Storage',
      method: 'PUT',
      endpoint: '/bucket/product-images/img_001.jpg',
      statusCode: 200,
      responseTime: 95,
      message: 'File uploaded successfully - Size: 2.4MB'
    }
  ];

  // Simulate real-time updates
  useEffect(() => {
    console.log('🔗 Sample data loaded for API Integration Hub Demo');
    
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 10),
        successRate: 99.2 + (Math.random() - 0.5) * 0.1,
        avgResponseTime: 145 + Math.floor((Math.random() - 0.5) * 20),
        activeConnections: 23 + Math.floor((Math.random() - 0.5) * 4),
        totalDataTransferred: prev.totalDataTransferred + Math.random() * 0.1,
        alertsCount: Math.floor(Math.random() * 5),
        integrationCount: integrations.length,
        servicesCount: services.length
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'pending':
      case 'scheduled':
      case 'warning':
        return '#f59e0b';
      case 'disconnected':
      case 'inactive':
      case 'info':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId);
    setModalType('view');
    setShowServiceModal(true);
  };

  const handleIntegrationClick = (integrationId: string) => {
    setSelectedIntegration(integrationId);
    setModalType('view');
    setShowIntegrationModal(true);
  };

  const handleAddService = () => {
    setSelectedService('');
    setModalType('add');
    setShowServiceModal(true);
  };

  const handleAddIntegration = () => {
    setSelectedIntegration('');
    setModalType('add');
    setShowIntegrationModal(true);
  };

  const renderSecondaryNavbar = () => (
    <div className="api-secondary-navbar">
      <div className="api-secondary-nav-content">
        <button className="api-secondary-nav-btn" onClick={handleAddService}>
          <Plus size={16} />
          <span>Add Service</span>
        </button>
        <button className="api-secondary-nav-btn" onClick={handleAddIntegration}>
          <Link size={16} />
          <span>Add Integration</span>
        </button>
        <button className="api-secondary-nav-btn" onClick={() => setCurrentView('statistics')}>
          <BarChart3 size={16} />
          <span>Statistics</span>
        </button>
        <button className="api-secondary-nav-btn" onClick={() => setCurrentView('graphs')}>
          <TrendingUp size={16} />
          <span>Graphs</span>
        </button>
        <button className="api-secondary-nav-btn" onClick={() => setShowLogModal(true)}>
          <FileText size={16} />
          <span>View Logs</span>
        </button>
        <button className="api-secondary-nav-btn">
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );

  const renderMainDashboard = () => (
    <div className="api-main-section">
      <div className="api-main-header">
        <h2>API Integration Hub</h2>
        <p>Centralized management for all your API connections and data flows</p>
      </div>

      {/* Real-time Statistics */}
      <div className="api-main-summary">
        <div className="api-summary-card">
          <div className="api-summary-header">
            <h4>Total API Requests</h4>
            <div className="api-status-badge active">Live</div>
          </div>
          <div className="api-summary-content">
            <div className="api-amount">{realTimeData.totalRequests.toLocaleString()}</div>
            <div className="api-change positive">+{Math.floor(Math.random() * 100)} today</div>
          </div>
        </div>

        <div className="api-summary-card">
          <div className="api-summary-header">
            <h4>Success Rate</h4>
            <div className="api-status-badge active">Healthy</div>
          </div>
          <div className="api-summary-content">
            <div className="api-amount">{realTimeData.successRate.toFixed(1)}%</div>
            <div className="api-change positive">+0.3% this week</div>
          </div>
        </div>

        <div className="api-summary-card">
          <div className="api-summary-header">
            <h4>Average Response Time</h4>
            <div className="api-status-badge warning">Monitor</div>
          </div>
          <div className="api-summary-content">
            <div className="api-amount">{realTimeData.avgResponseTime}ms</div>
            <div className="api-change negative">+15ms vs target</div>
          </div>
        </div>

        <div className="api-summary-card">
          <div className="api-summary-header">
            <h4>Data Transferred</h4>
            <div className="api-status-badge active">Normal</div>
          </div>
          <div className="api-summary-content">
            <div className="api-amount">{realTimeData.totalDataTransferred.toFixed(1)}GB</div>
            <div className="api-change positive">+0.2GB today</div>
          </div>
        </div>
      </div>

      {/* Services Overview */}
      <div className="api-services-section">
        <div className="api-services-header">
          <h3>Connected Services ({services.length})</h3>
          <button className="api-add-btn" onClick={handleAddService}>
            <Plus size={16} />
            Add Service
          </button>
        </div>
        <div className="api-services-grid">
          {services.map(service => (
            <div 
              key={service.id} 
              className="api-service-card clickable"
              onClick={() => handleServiceClick(service.id)}
            >
              <div className="api-service-header">
                <div className="api-service-icon">{service.icon}</div>
                <div className="api-service-info">
                  <div className="api-service-name">{service.name}</div>
                  <div className="api-service-type">{service.type}</div>
                </div>
                <div 
                  className="api-service-status" 
                  style={{ backgroundColor: getStatusColor(service.status) }}
                >
                  {service.status}
                </div>
              </div>
              <div className="api-service-metrics">
                <div className="api-metric">
                  <span>Requests (24h)</span>
                  <span>{service.requestCount.toLocaleString()}</span>
                </div>
                <div className="api-metric">
                  <span>Response Time</span>
                  <span>{service.responseTime}ms</span>
                </div>
                <div className="api-metric">
                  <span>Error Rate</span>
                  <span>{service.errorRate}%</span>
                </div>
                <div className="api-metric">
                  <span>Uptime</span>
                  <span>{service.uptime}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Integrations */}
      <div className="api-integrations-section">
        <div className="api-integrations-header">
          <h3>Active Integrations ({integrations.filter(i => i.status === 'active').length})</h3>
          <button className="api-add-btn" onClick={handleAddIntegration}>
            <Link size={16} />
            Create Integration
          </button>
        </div>
        <div className="api-integrations-list">
          {integrations.map(integration => (
            <div 
              key={integration.id} 
              className="api-integration-card clickable"
              onClick={() => handleIntegrationClick(integration.id)}
            >
              <div className="api-integration-flow">
                <div className="api-flow-source">
                  <div className="api-flow-icon">
                    {services.find(s => s.name === integration.source)?.icon}
                  </div>
                  <span>{integration.source}</span>
                </div>
                <div className="api-flow-arrow">→</div>
                <div className="api-flow-destination">
                  <div className="api-flow-icon">
                    {services.find(s => s.name === integration.destination)?.icon}
                  </div>
                  <span>{integration.destination}</span>
                </div>
              </div>
              <div className="api-integration-details">
                <div className="api-integration-name">{integration.name}</div>
                <div className="api-integration-meta">
                  <span 
                    className="api-integration-status" 
                    style={{ color: getStatusColor(integration.status) }}
                  >
                    {integration.status}
                  </span>
                  <span className="api-integration-frequency">{integration.frequency}</span>
                  <span className="api-integration-success">
                    {integration.successRate}% success rate
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStatistics = () => (
    <div className="api-statistics-section">
      <div className="api-stats-header">
        <h2>API Integration Statistics</h2>
        <p>Comprehensive analytics and performance metrics</p>
        <button className="api-back-btn" onClick={() => setCurrentView('main')}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="api-stats-content">
        {/* Service Statistics */}
        <div className="api-stats-section">
          <h3>Service Overview</h3>
          <div className="api-stats-grid">
            <div className="api-stat-card">
              <div className="api-stat-icon">🔌</div>
              <div className="api-stat-info">
                <div className="api-stat-value">{services.length}</div>
                <div className="api-stat-label">Connected Services</div>
              </div>
            </div>
            <div className="api-stat-card">
              <div className="api-stat-icon">✅</div>
              <div className="api-stat-info">
                <div className="api-stat-value">{services.filter(s => s.status === 'connected').length}</div>
                <div className="api-stat-label">Active Services</div>
              </div>
            </div>
            <div className="api-stat-card">
              <div className="api-stat-icon">⚠️</div>
              <div className="api-stat-info">
                <div className="api-stat-value">{services.filter(s => s.status === 'error').length}</div>
                <div className="api-stat-label">Services with Errors</div>
              </div>
            </div>
            <div className="api-stat-card">
              <div className="api-stat-icon">⏱️</div>
              <div className="api-stat-info">
                <div className="api-stat-value">{Math.round(services.reduce((acc, s) => acc + s.responseTime, 0) / services.length)}ms</div>
                <div className="api-stat-label">Avg Response Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Statistics */}
        <div className="api-stats-section">
          <h3>Integration Performance</h3>
          <div className="api-stats-grid">
            <div className="api-stat-card">
              <div className="api-stat-icon">🔄</div>
              <div className="api-stat-info">
                <div className="api-stat-value">{integrations.length}</div>
                <div className="api-stat-label">Total Integrations</div>
              </div>
            </div>
            <div className="api-stat-card">
              <div className="api-stat-icon">🟢</div>
              <div className="api-stat-info">
                <div className="api-stat-value">{integrations.filter(i => i.status === 'active').length}</div>
                <div className="api-stat-label">Active Integrations</div>
              </div>
            </div>
            <div className="api-stat-card">
              <div className="api-stat-icon">📊</div>
              <div className="api-stat-info">
                <div className="api-stat-value">{Math.round(integrations.reduce((acc, i) => acc + i.successRate, 0) / integrations.length)}%</div>
                <div className="api-stat-label">Avg Success Rate</div>
              </div>
            </div>
            <div className="api-stat-card">
              <div className="api-stat-icon">⚡</div>
              <div className="api-stat-info">
                <div className="api-stat-value">{integrations.reduce((acc, i) => acc + i.dataFlow, 0).toLocaleString()}</div>
                <div className="api-stat-label">Records/Day</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="api-stats-section">
          <h3>Performance Breakdown</h3>
          <div className="api-performance-grid">
            {services.map(service => (
              <div key={service.id} className="api-performance-card">
                <div className="api-performance-header">
                  <div className="api-performance-icon">{service.icon}</div>
                  <div className="api-performance-info">
                    <h5>{service.name}</h5>
                    <p>{service.type}</p>
                  </div>
                </div>
                <div className="api-performance-metrics">
                  <div className="api-performance-metric">
                    <span>Requests (24h)</span>
                    <span>{service.requestCount.toLocaleString()}</span>
                  </div>
                  <div className="api-performance-metric">
                    <span>Data Transferred</span>
                    <span>{service.dataTransferred}MB</span>
                  </div>
                  <div className="api-performance-metric">
                    <span>Uptime</span>
                    <span>{service.uptime}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGraphs = () => (
    <div className="api-graphs-section">
      <div className="api-graphs-header">
        <h2>API Integration Analytics</h2>
        <p>Visual insights and performance trends</p>
        <button className="api-back-btn" onClick={() => setCurrentView('main')}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="api-graphs-content">
        {/* Service Status Distribution */}
        <div className="api-graph-section">
          <h3>Service Status Distribution</h3>
          <div className="api-pie-chart">
            <div className="api-pie-slice connected" style={{ '--percentage': '75%' } as React.CSSProperties}>
              <span>Connected (6)</span>
            </div>
            <div className="api-pie-slice error" style={{ '--percentage': '12.5%' } as React.CSSProperties}>
              <span>Error (1)</span>
            </div>
            <div className="api-pie-slice pending" style={{ '--percentage': '12.5%' } as React.CSSProperties}>
              <span>Pending (1)</span>
            </div>
          </div>
        </div>

        {/* Response Time Comparison */}
        <div className="api-graph-section">
          <h3>Response Time by Service</h3>
          <div className="api-bar-chart">
            {services.map(service => (
              <div key={service.id} className="api-bar-item">
                <div className="api-bar-label">{service.name.split(' ')[0]}</div>
                <div className="api-bar-container">
                  <div 
                    className="api-bar-fill" 
                    style={{ 
                      width: `${(service.responseTime / 400) * 100}%`,
                      backgroundColor: service.responseTime > 200 ? '#ef4444' : '#10b981'
                    }}
                  ></div>
                </div>
                <div className="api-bar-value">{service.responseTime}ms</div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Success Rates */}
        <div className="api-graph-section">
          <h3>Integration Success Rates</h3>
          <div className="api-success-chart">
            {integrations.map(integration => (
              <div key={integration.id} className="api-success-item">
                <div className="api-success-name">{integration.name}</div>
                <div className="api-success-bar">
                  <div 
                    className="api-success-fill" 
                    style={{ 
                      width: `${integration.successRate}%`,
                      backgroundColor: integration.successRate > 95 ? '#10b981' : 
                                     integration.successRate > 90 ? '#f59e0b' : '#ef4444'
                    }}
                  ></div>
                </div>
                <div className="api-success-value">{integration.successRate}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Flow Timeline */}
        <div className="api-graph-section full-width">
          <h3>Data Flow Overview</h3>
          <div className="api-timeline-chart">
            <div className="api-timeline-bar">
              <div className="api-timeline-segment active" style={{ width: '45%' }}>
                Active ({integrations.filter(i => i.status === 'active').length})
              </div>
              <div className="api-timeline-segment error" style={{ width: '20%' }}>
                Error ({integrations.filter(i => i.status === 'error').length})
              </div>
              <div className="api-timeline-segment scheduled" style={{ width: '20%' }}>
                Scheduled ({integrations.filter(i => i.status === 'scheduled').length})
              </div>
              <div className="api-timeline-segment inactive" style={{ width: '15%' }}>
                Inactive ({integrations.filter(i => i.status === 'inactive').length})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServiceModal = () => {
    const service = services.find(s => s.id === selectedService);
    
    return (
      <div className="api-modal-backdrop" onClick={() => setShowServiceModal(false)}>
        <div className="api-modal-content" onClick={e => e.stopPropagation()}>
          <div className="api-modal-header">
            <h3>
              {modalType === 'add' ? 'Add New Service' : 
               modalType === 'edit' ? 'Edit Service' : 'Service Details'}
            </h3>
            <button className="api-modal-close" onClick={() => setShowServiceModal(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="api-modal-body">
            {modalType === 'view' && service ? (
              <div className="api-service-details">
                <div className="api-detail-header">
                  <div className="api-detail-icon">{service.icon}</div>
                  <div className="api-detail-info">
                    <h4>{service.name}</h4>
                    <p>{service.description}</p>
                  </div>
                </div>
                
                <div className="api-detail-grid">
                  <div className="api-detail-section">
                    <h5>Connection Details</h5>
                    <div className="api-detail-stats">
                      <div className="api-stat-item">
                        <span className="api-stat-label">Status</span>
                        <span className="api-stat-value" style={{ color: getStatusColor(service.status) }}>
                          {service.status}
                        </span>
                      </div>
                      <div className="api-stat-item">
                        <span className="api-stat-label">Version</span>
                        <span className="api-stat-value">{service.version}</span>
                      </div>
                      <div className="api-stat-item">
                        <span className="api-stat-label">Endpoint</span>
                        <span className="api-stat-value">{service.endpoint}</span>
                      </div>
                      <div className="api-stat-item">
                        <span className="api-stat-label">Authentication</span>
                        <span className="api-stat-value">{service.authentication}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="api-detail-section">
                    <h5>Performance Metrics</h5>
                    <div className="api-performance-metrics">
                      <div className="api-metric-card">
                        <div className="api-metric-value">{service.requestCount.toLocaleString()}</div>
                        <div className="api-metric-label">Requests (24h)</div>
                      </div>
                      <div className="api-metric-card">
                        <div className="api-metric-value">{service.responseTime}ms</div>
                        <div className="api-metric-label">Avg Response Time</div>
                      </div>
                      <div className="api-metric-card">
                        <div className="api-metric-value">{service.errorRate}%</div>
                        <div className="api-metric-label">Error Rate</div>
                      </div>
                      <div className="api-metric-card">
                        <div className="api-metric-value">{service.uptime}%</div>
                        <div className="api-metric-label">Uptime</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="api-form-grid">
                <div className="api-form-group">
                  <label>Service Name</label>
                  <input type="text" placeholder="Enter service name" />
                </div>
                <div className="api-form-group">
                  <label>Service Type</label>
                  <select>
                    <option>CRM</option>
                    <option>ERP</option>
                    <option>Payment</option>
                    <option>Marketing</option>
                    <option>Analytics</option>
                    <option>Database</option>
                    <option>Cloud</option>
                    <option>Webhook</option>
                  </select>
                </div>
                <div className="api-form-group">
                  <label>Endpoint URL</label>
                  <input type="url" placeholder="https://api.example.com" />
                </div>
                <div className="api-form-group">
                  <label>Authentication Method</label>
                  <select>
                    <option>API Key</option>
                    <option>OAuth 2.0</option>
                    <option>Basic Auth</option>
                    <option>Bearer Token</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          <div className="api-modal-actions">
            <button onClick={() => setShowServiceModal(false)}>Cancel</button>
            {modalType !== 'view' && (
              <button className="primary">
                {modalType === 'add' ? 'Add Service' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderIntegrationModal = () => {
    const integration = integrations.find(i => i.id === selectedIntegration);
    
    return (
      <div className="api-modal-backdrop" onClick={() => setShowIntegrationModal(false)}>
        <div className="api-modal-content" onClick={e => e.stopPropagation()}>
          <div className="api-modal-header">
            <h3>
              {modalType === 'add' ? 'Create Integration' : 
               modalType === 'edit' ? 'Edit Integration' : 'Integration Details'}
            </h3>
            <button className="api-modal-close" onClick={() => setShowIntegrationModal(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="api-modal-body">
            {modalType === 'view' && integration ? (
              <div className="api-integration-details">
                <div className="api-detail-header">
                  <h4>{integration.name}</h4>
                  <p>Data flow between {integration.source} and {integration.destination}</p>
                </div>
                
                <div className="api-detail-grid">
                  <div className="api-detail-section">
                    <h5>Integration Info</h5>
                    <div className="api-detail-stats">
                      <div className="api-stat-item">
                        <span className="api-stat-label">Status</span>
                        <span className="api-stat-value" style={{ color: getStatusColor(integration.status) }}>
                          {integration.status}
                        </span>
                      </div>
                      <div className="api-stat-item">
                        <span className="api-stat-label">Frequency</span>
                        <span className="api-stat-value">{integration.frequency}</span>
                      </div>
                      <div className="api-stat-item">
                        <span className="api-stat-label">Last Run</span>
                        <span className="api-stat-value">{integration.lastRun}</span>
                      </div>
                      <div className="api-stat-item">
                        <span className="api-stat-label">Total Runs</span>
                        <span className="api-stat-value">{integration.totalRuns.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="api-detail-section">
                    <h5>Performance Metrics</h5>
                    <div className="api-performance-metrics">
                      <div className="api-metric-card">
                        <div className="api-metric-value">{integration.successRate}%</div>
                        <div className="api-metric-label">Success Rate</div>
                      </div>
                      <div className="api-metric-card">
                        <div className="api-metric-value">{integration.dataFlow.toLocaleString()}</div>
                        <div className="api-metric-label">Records/Day</div>
                      </div>
                      <div className="api-metric-card">
                        <div className="api-metric-value">{integration.avgRunTime}s</div>
                        <div className="api-metric-label">Avg Run Time</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="api-form-grid">
                <div className="api-form-group">
                  <label>Integration Name</label>
                  <input type="text" placeholder="Enter integration name" />
                </div>
                <div className="api-form-group">
                  <label>Source Service</label>
                  <select>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </div>
                <div className="api-form-group">
                  <label>Destination Service</label>
                  <select>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </div>
                <div className="api-form-group">
                  <label>Frequency</label>
                  <select>
                    <option>Real-time</option>
                    <option>Every 5 minutes</option>
                    <option>Every 15 minutes</option>
                    <option>Hourly</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          <div className="api-modal-actions">
            <button onClick={() => setShowIntegrationModal(false)}>Cancel</button>
            {modalType !== 'view' && (
              <button className="primary">
                {modalType === 'add' ? 'Create Integration' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLogModal = () => (
    <div className="api-modal-backdrop" onClick={() => setShowLogModal(false)}>
      <div className="api-modal-content large" onClick={e => e.stopPropagation()}>
        <div className="api-modal-header">
          <h3>API Request Logs</h3>
          <button className="api-modal-close" onClick={() => setShowLogModal(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="api-modal-body">
          <div className="api-logs-filters">
            <select>
              <option>All Services</option>
              {services.map(service => (
                <option key={service.id}>{service.name}</option>
              ))}
            </select>
            <select>
              <option>All Levels</option>
              <option>Success</option>
              <option>Error</option>
              <option>Warning</option>
              <option>Info</option>
            </select>
          </div>
          
          <div className="api-logs-list">
            {apiLogs.map(log => (
              <div key={log.id} className={`api-log-entry ${log.level}`}>
                <div className="api-log-time">{log.timestamp}</div>
                <div className={`api-log-level ${log.level}`}>{log.level.toUpperCase()}</div>
                <div className="api-log-service">{log.service}</div>
                <div className="api-log-method">{log.method}</div>
                <div className="api-log-endpoint">{log.endpoint}</div>
                <div className="api-log-status">{log.statusCode}</div>
                <div className="api-log-response">{log.responseTime}ms</div>
                <div className="api-log-message">{log.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="api-integration-hub">
      {renderSecondaryNavbar()}
      
      <div className="api-dashboard-content">
        {currentView === 'main' && renderMainDashboard()}
        {currentView === 'statistics' && renderStatistics()}
        {currentView === 'graphs' && renderGraphs()}
      </div>

      {showServiceModal && renderServiceModal()}
      {showIntegrationModal && renderIntegrationModal()}
      {showLogModal && renderLogModal()}
    </div>
  );
};

export default APIIntegrationHub; 