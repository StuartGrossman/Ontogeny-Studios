import React, { useState, useEffect } from 'react';
import '../styles/APIIntegrationHub.css';

interface APIService {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  type: 'CRM' | 'ERP' | 'Payment' | 'Marketing' | 'Analytics' | 'Database';
  icon: string;
  lastSync: string;
  requestCount: number;
  errorRate: number;
  responseTime: number;
  description: string;
}

interface Integration {
  id: string;
  name: string;
  source: string;
  destination: string;
  status: 'active' | 'inactive' | 'error';
  dataFlow: number;
  lastRun: string;
}

const APIIntegrationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'integrations' | 'monitoring' | 'logs'>('overview');
  const [selectedService, setSelectedService] = useState<string>('');
  const [realTimeData, setRealTimeData] = useState({
    totalRequests: 125847,
    successRate: 99.2,
    avgResponseTime: 145,
    activeConnections: 23
  });

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
      description: 'Customer relationship management and sales automation'
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
      description: 'Payment processing and transaction management'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      status: 'pending',
      type: 'Marketing',
      icon: '📧',
      lastSync: 'Connecting...',
      requestCount: 0,
      errorRate: 0,
      responseTime: 0,
      description: 'Email marketing and automation platform'
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
      description: 'Web analytics and performance tracking'
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
      description: 'E-commerce platform and inventory management'
    },
    {
      id: 'postgres',
      name: 'PostgreSQL',
      status: 'connected',
      type: 'Database',
      icon: '🗄️',
      lastSync: '5 seconds ago',
      requestCount: 2847,
      errorRate: 0.0,
      responseTime: 45,
      description: 'Primary database for application data'
    }
  ];

  const integrations: Integration[] = [
    {
      id: 'crm-to-email',
      name: 'CRM to Email Marketing',
      source: 'Salesforce CRM',
      destination: 'Mailchimp',
      status: 'active',
      dataFlow: 1250,
      lastRun: '5 minutes ago'
    },
    {
      id: 'payments-to-crm',
      name: 'Payment to CRM Sync',
      source: 'Stripe Payments',
      destination: 'Salesforce CRM',
      status: 'active',
      dataFlow: 892,
      lastRun: '2 minutes ago'
    },
    {
      id: 'analytics-to-db',
      name: 'Analytics Data Pipeline',
      source: 'Google Analytics',
      destination: 'PostgreSQL',
      status: 'error',
      dataFlow: 0,
      lastRun: '2 hours ago'
    }
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 10),
        successRate: 99.2 + (Math.random() - 0.5) * 0.1,
        avgResponseTime: 145 + Math.floor((Math.random() - 0.5) * 20),
        activeConnections: 23 + Math.floor((Math.random() - 0.5) * 4)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      case 'disconnected':
      case 'inactive':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const renderOverview = () => (
    <div className="overview-content">
      <div className="overview-stats">
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-value">{realTimeData.totalRequests.toLocaleString()}</div>
            <div className="stat-label">Total Requests</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{realTimeData.successRate.toFixed(1)}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{realTimeData.avgResponseTime}ms</div>
            <div className="stat-label">Avg Response Time</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔗</div>
          <div className="stat-content">
            <div className="stat-value">{realTimeData.activeConnections}</div>
            <div className="stat-label">Active Connections</div>
          </div>
        </div>
      </div>

      <div className="overview-sections">
        <div className="service-health">
          <h3>Service Health</h3>
          <div className="health-grid">
            {services.map(service => (
              <div key={service.id} className="health-item">
                <div className="health-icon">{service.icon}</div>
                <div className="health-info">
                  <div className="health-name">{service.name}</div>
                  <div className="health-status" style={{ color: getStatusColor(service.status) }}>
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </div>
                </div>
                <div className="health-metrics">
                  <div className="metric">
                    <span className="metric-label">Response:</span>
                    <span className="metric-value">{service.responseTime}ms</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Error Rate:</span>
                    <span className="metric-value">{service.errorRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-time">2 min ago</div>
              <div className="activity-content">
                <span className="activity-icon">✅</span>
                Salesforce CRM sync completed - 47 records updated
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-time">5 min ago</div>
              <div className="activity-content">
                <span className="activity-icon">⚠️</span>
                Analytics pipeline retry initiated - connection timeout
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-time">8 min ago</div>
              <div className="activity-content">
                <span className="activity-icon">🔄</span>
                Payment webhook received - Order #12847 processed
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-time">12 min ago</div>
              <div className="activity-content">
                <span className="activity-icon">📧</span>
                Mailchimp connection established - Testing in progress
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="services-content">
      <div className="services-header">
        <h3>Connected Services</h3>
        <button className="add-service-btn">+ Add Service</button>
      </div>
      <div className="services-grid">
        {services.map(service => (
          <div 
            key={service.id} 
            className={`service-card ${selectedService === service.id ? 'selected' : ''}`}
            onClick={() => setSelectedService(selectedService === service.id ? '' : service.id)}
          >
            <div className="service-header">
              <div className="service-icon">{service.icon}</div>
              <div className="service-info">
                <div className="service-name">{service.name}</div>
                <div className="service-type">{service.type}</div>
              </div>
              <div className="service-status" style={{ backgroundColor: getStatusColor(service.status) }}>
                {service.status}
              </div>
            </div>
            <div className="service-description">{service.description}</div>
            <div className="service-metrics">
              <div className="metric-row">
                <span>Last Sync:</span>
                <span>{service.lastSync}</span>
              </div>
              <div className="metric-row">
                <span>Requests (24h):</span>
                <span>{service.requestCount.toLocaleString()}</span>
              </div>
              <div className="metric-row">
                <span>Error Rate:</span>
                <span>{service.errorRate}%</span>
              </div>
              <div className="metric-row">
                <span>Response Time:</span>
                <span>{service.responseTime}ms</span>
              </div>
            </div>
            {selectedService === service.id && (
              <div className="service-actions">
                <button className="action-btn primary">Configure</button>
                <button className="action-btn secondary">Test Connection</button>
                <button className="action-btn danger">Disconnect</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="integrations-content">
      <div className="integrations-header">
        <h3>Integration Workflows</h3>
        <button className="create-integration-btn">+ Create Integration</button>
      </div>
      <div className="integrations-list">
        {integrations.map(integration => (
          <div key={integration.id} className="integration-item">
            <div className="integration-flow">
              <div className="flow-source">
                <div className="flow-node">{services.find(s => s.name === integration.source)?.icon}</div>
                <span className="flow-label">{integration.source}</span>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-destination">
                <div className="flow-node">{services.find(s => s.name === integration.destination)?.icon}</div>
                <span className="flow-label">{integration.destination}</span>
              </div>
            </div>
            <div className="integration-details">
              <div className="integration-name">{integration.name}</div>
              <div className="integration-meta">
                <span className="integration-status" style={{ color: getStatusColor(integration.status) }}>
                  {integration.status}
                </span>
                <span className="integration-data">
                  {integration.dataFlow > 0 ? `${integration.dataFlow} records/day` : 'No data flow'}
                </span>
                <span className="integration-time">Last run: {integration.lastRun}</span>
              </div>
            </div>
            <div className="integration-actions">
              <button className="action-btn small">Edit</button>
              <button className="action-btn small">Logs</button>
              <button className="action-btn small">Test</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="monitoring-content">
      <div className="monitoring-charts">
        <div className="chart-card">
          <h4>Request Volume (24h)</h4>
          <div className="chart-placeholder">
            <div className="chart-bars">
              {Array.from({ length: 24 }, (_, i) => (
                <div 
                  key={i} 
                  className="chart-bar" 
                  style={{ height: `${Math.random() * 80 + 20}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="chart-card">
          <h4>Response Time Trends</h4>
          <div className="chart-placeholder">
            <div className="trend-line">
              <svg viewBox="0 0 100 50" className="trend-svg">
                <path
                  d="M 0,40 Q 25,20 50,30 Q 75,10 100,25"
                  stroke="#10b981"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="monitoring-alerts">
        <h4>Active Alerts</h4>
        <div className="alert-list">
          <div className="alert-item error">
            <span className="alert-icon">🚨</span>
            <div className="alert-content">
              <div className="alert-title">High Error Rate - Shopify Integration</div>
              <div className="alert-time">Started 15 minutes ago</div>
            </div>
          </div>
          <div className="alert-item warning">
            <span className="alert-icon">⚠️</span>
            <div className="alert-content">
              <div className="alert-title">Slow Response Time - Analytics API</div>
              <div className="alert-time">Started 8 minutes ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="logs-content">
      <div className="logs-header">
        <h3>API Logs</h3>
        <div className="logs-filters">
          <select className="log-filter">
            <option>All Services</option>
            <option>Salesforce CRM</option>
            <option>Stripe Payments</option>
            <option>Google Analytics</option>
          </select>
          <select className="log-filter">
            <option>All Levels</option>
            <option>Error</option>
            <option>Warning</option>
            <option>Info</option>
          </select>
        </div>
      </div>
      <div className="logs-list">
        <div className="log-entry info">
          <span className="log-time">14:32:15</span>
          <span className="log-level info">INFO</span>
          <span className="log-service">Salesforce</span>
          <span className="log-message">Contact sync completed successfully - 47 records processed</span>
        </div>
        <div className="log-entry error">
          <span className="log-time">14:30:42</span>
          <span className="log-level error">ERROR</span>
          <span className="log-service">Shopify</span>
          <span className="log-message">API rate limit exceeded - retrying in 60 seconds</span>
        </div>
        <div className="log-entry warning">
          <span className="log-time">14:28:33</span>
          <span className="log-level warning">WARN</span>
          <span className="log-service">Analytics</span>
          <span className="log-message">Response time above threshold: 2.3s</span>
        </div>
        <div className="log-entry info">
          <span className="log-time">14:27:18</span>
          <span className="log-level info">INFO</span>
          <span className="log-service">Stripe</span>
          <span className="log-message">Payment webhook received - Order #12847</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="api-integration-hub">
      <div className="hub-header">
        <div className="hub-title">
          <h2>🔗 API Integration Hub</h2>
          <p>Centralized management for all your API connections and integrations</p>
        </div>
        <div className="hub-actions">
          <button className="hub-btn secondary">Import Config</button>
          <button className="hub-btn primary">Quick Connect</button>
        </div>
      </div>

      <div className="hub-navigation">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          🔌 Services
        </button>
        <button 
          className={`nav-tab ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          🔄 Integrations
        </button>
        <button 
          className={`nav-tab ${activeTab === 'monitoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitoring')}
        >
          📈 Monitoring
        </button>
        <button 
          className={`nav-tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📋 Logs
        </button>
      </div>

      <div className="hub-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'integrations' && renderIntegrations()}
        {activeTab === 'monitoring' && renderMonitoring()}
        {activeTab === 'logs' && renderLogs()}
      </div>
    </div>
  );
};

export default APIIntegrationHub; 