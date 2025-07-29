import React, { useState, useEffect } from 'react';
import { 
  Plus, Key, Globe, Palette, Clock, CheckCircle, AlertCircle, 
  Activity, Eye, EyeOff, Trash2, Edit3, Monitor, Tablet, Smartphone,
  Calendar, Target, Server, Shield, Image, Settings, Bell, Copy, Download
} from 'lucide-react';
import { AddRequiredAPIKeyModal, AddRequiredDNSRecordModal } from './modals';

interface ProjectAttributesViewProps {
  projectId: string;
  projectName?: string;
  currentUser?: any;
  onAttributeUpdate?: (attributeType: string, attributeId: string, status: string, adminNotes?: string) => void;
}

interface ProjectAttribute {
  id: string;
  status: string;
  addedAt?: any;
  addedBy?: string;
  adminNotes?: string;
  lastUpdated?: any;
}

interface FeatureRequest extends ProjectAttribute {
  title: string;
  description: string;
  requirements: string[];
  category: string;
  priority: string;
  estimatedHours: number;
  conversationId?: string;
}

interface APIKey extends ProjectAttribute {
  provider: string;
  keyName: string;
  keyValue: string;
  environment: string;
}

interface DNSRecord extends ProjectAttribute {
  type: string;
  name: string;
  value: string;
  ttl: number;
  priority?: number;
  domain: string;
  lastChecked?: any;
}

interface UIDesign extends ProjectAttribute {
  targetDevices: string[];
  stylePreferences: string;
  uploadedImage?: string;
  imageUrl?: string;
  requestType: string;
  adminFeedback?: string;
}

const ProjectAttributesView: React.FC<ProjectAttributesViewProps> = ({
  projectId,
  projectName,
  currentUser,
  onAttributeUpdate
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'features' | 'api-keys' | 'dns-records' | 'ui-designs'>('features');
  
  // Attribute data
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [uiDesigns, setUiDesigns] = useState<UIDesign[]>([]);
  const [requiredAPIKeys, setRequiredAPIKeys] = useState<any[]>([]);
  const [requiredDNSRecords, setRequiredDNSRecords] = useState<any[]>([]);

  // UI state
  const [selectedAttribute, setSelectedAttribute] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: '',
    adminNotes: ''
  });
  
  // Required modals state
  const [showRequiredAPIKeyModal, setShowRequiredAPIKeyModal] = useState(false);
  const [showRequiredDNSModal, setShowRequiredDNSModal] = useState(false);
  
  // Inline form state for API keys
  const [showAPIKeyForm, setShowAPIKeyForm] = useState(false);
  const [apiKeyForm, setApiKeyForm] = useState({
    keyName: '',
    description: '',
    costNotes: '',
    priority: 'medium'
  });
  
  // API key visibility state
  const [visibleAPIKeys, setVisibleAPIKeys] = useState<{[key: string]: boolean}>({});

  // Load project attributes
  useEffect(() => {
    if (projectId) {
      loadProjectAttributes();
    }
  }, [projectId]);

  const loadProjectAttributes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3002/api/projects/project/${projectId}/attributes`);
      const result = await response.json();
      
      if (result.success) {
        setFeatureRequests(result.attributes.featureRequests || []);
        setApiKeys(result.attributes.apiKeys || []);
        setDnsRecords(result.attributes.dnsRecords || []);
        setUiDesigns(result.attributes.uiDesigns || []);
        setRequiredAPIKeys(result.attributes.requiredAPIKeys || []);
        setRequiredDNSRecords(result.attributes.requiredDNSRecords || []);
        
        console.log('✅ Loaded project attributes:', {
          features: result.attributes.featureRequests?.length || 0,
          apiKeys: result.attributes.apiKeys?.length || 0,
          dnsRecords: result.attributes.dnsRecords?.length || 0,
          uiDesigns: result.attributes.uiDesigns?.length || 0,
          requiredAPIKeys: result.attributes.requiredAPIKeys?.length || 0,
          requiredDNSRecords: result.attributes.requiredDNSRecords?.length || 0
        });
      } else {
        throw new Error(result.error || 'Failed to load project attributes');
      }
    } catch (error) {
      console.error('❌ Error loading project attributes:', error);
      setError('Failed to load project attributes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (attributeType: string, attribute: any) => {
    setSelectedAttribute({ ...attribute, type: attributeType });
    setStatusForm({
      status: attribute.status || 'pending',
      adminNotes: attribute.adminNotes || ''
    });
    setShowStatusModal(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedAttribute) return;
    
    try {
      const response = await fetch(
        `http://localhost:3002/api/projects/project/${projectId}/${selectedAttribute.type}/${selectedAttribute.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: statusForm.status,
            adminNotes: statusForm.adminNotes,
            adminUserId: currentUser?.uid || currentUser?.id
          })
        }
      );

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Status updated successfully');
        setShowStatusModal(false);
        setSelectedAttribute(null);
        // Reload attributes to show updated data
        await loadProjectAttributes();
        
        // Callback to parent component
        if (onAttributeUpdate) {
          onAttributeUpdate(selectedAttribute.type, selectedAttribute.id, statusForm.status, statusForm.adminNotes);
        }
      } else {
        throw new Error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'approved': return <CheckCircle size={14} />;
      case 'in-progress': return <Activity size={14} />;
      case 'completed': return <CheckCircle size={14} className="completed-icon" />;
      case 'rejected': return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    // Handle Firestore timestamp
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    
    // Handle regular date
    return new Date(timestamp).toLocaleDateString();
  };

  // Image handling functions
  const handleImageDownload = async (imageName: string, imageUrl?: string) => {
    try {
      if (imageUrl) {
        // If we have a URL, download from URL
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = imageName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Show message if no image URL is available
        alert('Image download not available. The image may not have been uploaded successfully.');
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const getImageDisplayUrl = (design: UIDesign) => {
    // Return the actual Firebase Storage URL if available
    if (design.imageUrl) {
      return design.imageUrl;
    }
    return null;
  };

  // Required API Key handlers
  const handleRequiredAPIKeySubmit = async (requiredAPIKeyData: any) => {
    try {
      const response = await fetch(`http://localhost:3002/api/projects/project/${projectId}/required-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requiredAPIKeyData,
          adminUserId: currentUser?.uid || currentUser?.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Required API key request created successfully:', result);
        setShowRequiredAPIKeyModal(false);
        // Reload attributes to show updated data
        await loadProjectAttributes();
      } else {
        throw new Error(result.error || 'Failed to create required API key request');
      }
    } catch (error) {
      console.error('❌ Error creating required API key request:', error);
      alert('Failed to create required API key request. Please try again.');
    }
  };

  // Required DNS Record handlers
  const handleRequiredDNSRecordSubmit = async (requiredDNSData: any) => {
    try {
      const response = await fetch(`http://localhost:3002/api/projects/project/${projectId}/required-dns-record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requiredDNSData,
          adminUserId: currentUser?.uid || currentUser?.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Required DNS record request created successfully:', result);
        setShowRequiredDNSModal(false);
        // Reload attributes to show updated data
        await loadProjectAttributes();
      } else {
        throw new Error(result.error || 'Failed to create required DNS record request');
      }
    } catch (error) {
      console.error('❌ Error creating required DNS record request:', error);
      alert('Failed to create required DNS record request. Please try again.');
    }
  };

  // Handle inline API key form submission
  const handleAPIKeyFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKeyForm.keyName.trim() || !apiKeyForm.description.trim()) {
      alert('Please fill in both API Key Name and Description');
      return;
    }

    try {
      const requiredAPIKeyData = {
        keyName: apiKeyForm.keyName,
        provider: 'Custom', // Default provider
        description: apiKeyForm.description,
        priority: apiKeyForm.priority,
        adminNotes: apiKeyForm.costNotes || ''
      };

      const response = await fetch(`http://localhost:3002/api/projects/project/${projectId}/required-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requiredAPIKeyData,
          adminUserId: currentUser?.uid || currentUser?.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Required API key request created successfully:', result);
        // Reset form
        setApiKeyForm({
          keyName: '',
          description: '',
          costNotes: '',
          priority: 'medium'
        });
        setShowAPIKeyForm(false);
        // Reload attributes to show updated data
        await loadProjectAttributes();
      } else {
        throw new Error(result.error || 'Failed to create required API key request');
      }
    } catch (error) {
      console.error('❌ Error creating required API key request:', error);
      alert('Failed to create required API key request. Please try again.');
    }
  };

  const getTabCounts = () => {
    return {
      features: featureRequests.length,
      apiKeys: apiKeys.length,
      dnsRecords: dnsRecords.length,
      uiDesigns: uiDesigns.length
    };
  };

  const toggleAPIKeyVisibility = (apiKeyId: string) => {
    setVisibleAPIKeys(prev => ({
      ...prev,
      [apiKeyId]: !prev[apiKeyId]
    }));
  };

  const copyAPIKeyToClipboard = async (apiKeyValue: string) => {
    try {
      await navigator.clipboard.writeText(apiKeyValue);
      // You could add a toast notification here
      console.log('✅ API key copied to clipboard');
    } catch (error) {
      console.error('❌ Failed to copy API key:', error);
    }
  };

  const tabCounts = getTabCounts();

  if (loading) {
    return (
      <div className="project-attributes-loading">
        <div className="loading-spinner"></div>
        <p>Loading project attributes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-attributes-error">
        <AlertCircle size={48} />
        <h3>Error Loading Attributes</h3>
        <p>{error}</p>
        <button onClick={loadProjectAttributes} className="btn-secondary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="project-attributes-view">
      <div className="attributes-header">
        <h3>Client Project Attributes</h3>
        <p>Review and manage client-added features, API keys, DNS records, and UI designs for {projectName}</p>
      </div>

      {/* Tab Navigation */}
      <div className="attributes-tabs">
        <button
          className={`attr-tab ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          <Plus size={16} />
          Features
          {tabCounts.features > 0 && <span className="tab-count">{tabCounts.features}</span>}
        </button>
        
        <button
          className={`attr-tab ${activeTab === 'api-keys' ? 'active' : ''}`}
          onClick={() => setActiveTab('api-keys')}
        >
          <Key size={16} />
          API Keys
          {tabCounts.apiKeys > 0 && <span className="tab-count">{tabCounts.apiKeys}</span>}
        </button>
        
        <button
          className={`attr-tab ${activeTab === 'dns-records' ? 'active' : ''}`}
          onClick={() => setActiveTab('dns-records')}
        >
          <Globe size={16} />
          DNS Records
          {tabCounts.dnsRecords > 0 && <span className="tab-count">{tabCounts.dnsRecords}</span>}
        </button>
        
        <button
          className={`attr-tab ${activeTab === 'ui-designs' ? 'active' : ''}`}
          onClick={() => setActiveTab('ui-designs')}
        >
          <Palette size={16} />
          UI Designs
          {tabCounts.uiDesigns > 0 && <span className="tab-count">{tabCounts.uiDesigns}</span>}
        </button>
      </div>

      {/* Content Area */}
      <div className="attributes-content">
        {/* Feature Requests */}
        {activeTab === 'features' && (
          <div className="features-section">
            {featureRequests.length > 0 ? (
              <div className="features-grid">
                {featureRequests.map((feature) => (
                  <div key={feature.id} className="feature-card">
                    <div className="feature-header">
                      <h4>{feature.title}</h4>
                      <div className="feature-badges">
                        <span className={`status-badge ${getStatusBadgeClass(feature.status)}`}>
                          {getStatusIcon(feature.status)}
                          {feature.status}
                        </span>
                        <span className={`priority-badge priority-${feature.priority}`}>
                          {feature.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="feature-content">
                      <p className="feature-description">{feature.description}</p>
                      
                      {feature.requirements && feature.requirements.length > 0 && (
                        <div className="feature-requirements">
                          <strong>Requirements:</strong>
                          <ul>
                            {feature.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="feature-meta">
                        <span><Target size={14} /> {feature.category}</span>
                        <span><Clock size={14} /> {feature.estimatedHours}h estimated</span>
                        <span><Calendar size={14} /> {formatDate(feature.addedAt)}</span>
                      </div>
                      
                      {feature.adminNotes && (
                        <div className="admin-notes">
                          <strong>Admin Notes:</strong>
                          <p>{feature.adminNotes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="feature-actions">
                      <button
                        onClick={() => handleStatusUpdate('feature_requests', feature)}
                        className="btn-secondary small"
                      >
                        <Settings size={14} />
                        Update Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-attributes">
                <Plus size={48} />
                <h4>No Feature Requests</h4>
                <p>Client hasn't submitted any feature requests yet.</p>
              </div>
            )}
          </div>
        )}

        {/* API Keys */}
        {activeTab === 'api-keys' && (
          <div className="api-keys-section">
            <div className="section-header-with-actions">
              <div className="section-header">
                <h3>API Keys</h3>
                <p>Client-provided API keys for this project</p>
              </div>
              <button
                onClick={() => setShowAPIKeyForm(!showAPIKeyForm)}
                className="btn-primary"
              >
                <Bell size={16} />
                {showAPIKeyForm ? 'Cancel' : 'Request API Key'}
              </button>
            </div>
            
            {/* Inline API Key Request Form */}
            {showAPIKeyForm && (
              <div className="inline-api-key-form">
                <h4>Request New API Key</h4>
                <form onSubmit={handleAPIKeyFormSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="keyName">API Key Name *</label>
                      <input
                        type="text"
                        id="keyName"
                        value={apiKeyForm.keyName}
                        onChange={(e) => setApiKeyForm(prev => ({ ...prev, keyName: e.target.value }))}
                        placeholder="e.g., Stripe Secret Key, SendGrid API Key"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="priority">Priority</label>
                      <select
                        id="priority"
                        value={apiKeyForm.priority}
                        onChange={(e) => setApiKeyForm(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                      id="description"
                      value={apiKeyForm.description}
                      onChange={(e) => setApiKeyForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What does this API key do? Why do we need it?"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="costNotes">Cost/Additional Notes</label>
                    <textarea
                      id="costNotes"
                      value={apiKeyForm.costNotes}
                      onChange={(e) => setApiKeyForm(prev => ({ ...prev, costNotes: e.target.value }))}
                      placeholder="Any costs associated? Special instructions? (optional)"
                      rows={2}
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowAPIKeyForm(false)} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Request API Key
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Required API Keys Section */}
            {requiredAPIKeys.length > 0 && (
              <div className="required-section">
                <h4>Required API Keys (Pending from Client)</h4>
                <div className="required-api-keys-grid">
                  {requiredAPIKeys.map((requiredKey) => (
                    <div key={requiredKey.id} className="required-api-key-card">
                      <div className="required-key-header">
                        <h5>{requiredKey.keyName}</h5>
                        <span className="provider-tag">{requiredKey.provider}</span>
                      </div>
                      <p className="required-key-description">{requiredKey.description}</p>
                      <div className="required-key-meta">
                        <span className={`priority-badge ${requiredKey.priority}`}>
                          {requiredKey.priority}
                        </span>
                        <span className={`status-badge ${getStatusBadgeClass(requiredKey.status)}`}>
                          {getStatusIcon(requiredKey.status)}
                          {requiredKey.status}
                        </span>
                      </div>
                      <div className="required-key-details">
                        <span>Requested: {formatDate(requiredKey.requestedAt)}</span>
                        {requiredKey.adminNotes && (
                          <div className="admin-notes">
                            <strong>Admin Notes:</strong>
                            <p>{requiredKey.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Provided API Keys Section */}
            <div className="provided-section">
              <h4>Provided API Keys</h4>
            {apiKeys.length > 0 ? (
              <div className="api-keys-grid">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="api-key-card">
                    <div className="api-key-header">
                      <div className="key-info">
                        <h4>{apiKey.keyName}</h4>
                        <span className="provider-tag">{apiKey.provider}</span>
                      </div>
                      <span className={`status-badge ${getStatusBadgeClass(apiKey.status)}`}>
                        {getStatusIcon(apiKey.status)}
                        {apiKey.status}
                      </span>
                    </div>
                    
                    <div className="api-key-content">
                      <div className="key-details">
                        <div className="detail-row">
                          <span className="detail-label">Environment:</span>
                          <span className={`env-badge ${apiKey.environment}`}>{apiKey.environment}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Key Value:</span>
                          <code className="key-value">
                              {visibleAPIKeys[apiKey.id]
                                ? apiKey.keyValue
                                : `${apiKey.keyValue.substring(0, 8)}...${apiKey.keyValue.slice(-4)}`}
                          </code>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Added:</span>
                          <span>{formatDate(apiKey.addedAt)}</span>
                        </div>
                      </div>
                      
                      {apiKey.adminNotes && (
                        <div className="admin-notes">
                          <strong>Admin Notes:</strong>
                          <p>{apiKey.adminNotes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="api-key-actions">
                      <button
                        onClick={() => handleStatusUpdate('api_keys', apiKey)}
                        className="btn-secondary small"
                      >
                        <Settings size={14} />
                        Update Status
                      </button>
                        <button 
                          onClick={() => toggleAPIKeyVisibility(apiKey.id)}
                          className="btn-secondary small"
                        >
                          {visibleAPIKeys[apiKey.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          {visibleAPIKeys[apiKey.id] ? 'Hide Key' : 'View Full Key'}
                        </button>
                        {visibleAPIKeys[apiKey.id] && (
                          <button 
                            onClick={() => copyAPIKeyToClipboard(apiKey.keyValue)}
                            className="btn-secondary small"
                            title="Copy to clipboard"
                          >
                            <Copy size={14} />
                            Copy
                      </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-attributes">
                <Key size={48} />
                <h4>No API Keys</h4>
                <p>Client hasn't added any API keys yet.</p>
              </div>
            )}
            </div>
          </div>
        )}

        {/* DNS Records */}
        {activeTab === 'dns-records' && (
          <div className="dns-records-section">
            <div className="section-header-with-actions">
              <div className="section-header">
                <h3>DNS Records</h3>
                <p>Client-provided DNS records for this project</p>
              </div>
              <button
                onClick={() => setShowRequiredDNSModal(true)}
                className="btn-primary"
              >
                <Bell size={16} />
                Request DNS Record
              </button>
            </div>
            
            {/* Required DNS Records Section */}
            {requiredDNSRecords.length > 0 && (
              <div className="required-section">
                <h4>Required DNS Records (Pending from Client)</h4>
                <div className="required-dns-records-grid">
                  {requiredDNSRecords.map((requiredRecord) => (
                    <div key={requiredRecord.id} className="required-dns-record-card">
                      <div className="required-record-header">
                        <h5>{requiredRecord.recordName}</h5>
                        <span className="record-type-tag">{requiredRecord.recordType}</span>
                      </div>
                      <p className="required-record-description">{requiredRecord.description}</p>
                      <div className="required-record-meta">
                        <span className={`priority-badge ${requiredRecord.priority}`}>
                          {requiredRecord.priority}
                        </span>
                        <span className={`status-badge ${getStatusBadgeClass(requiredRecord.status)}`}>
                          {getStatusIcon(requiredRecord.status)}
                          {requiredRecord.status}
                        </span>
                      </div>
                      <div className="required-record-details">
                        <span>Requested: {formatDate(requiredRecord.requestedAt)}</span>
                        {requiredRecord.adminNotes && (
                          <div className="admin-notes">
                            <strong>Admin Notes:</strong>
                            <p>{requiredRecord.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Provided DNS Records Section */}
            <div className="provided-section">
              <h4>Provided DNS Records</h4>
            {dnsRecords.length > 0 ? (
              <div className="dns-records-table">
                <div className="table-header">
                  <div>Type</div>
                  <div>Name</div>
                  <div>Value</div>
                  <div>TTL</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                
                {dnsRecords.map((record) => (
                  <div key={record.id} className="table-row">
                    <div className="dns-type-cell">
                      <span className="record-type-badge">{record.type}</span>
                    </div>
                    <div>{record.name}</div>
                    <div className="dns-value-cell">
                      <code>{record.value}</code>
                    </div>
                    <div>{record.ttl}s</div>
                    <div>
                      <span className={`status-badge ${getStatusBadgeClass(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status}
                      </span>
                    </div>
                    <div className="dns-actions">
                      <button
                        onClick={() => handleStatusUpdate('dns_records', record)}
                        className="btn-secondary small"
                      >
                        <Settings size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-attributes">
                <Globe size={48} />
                <h4>No DNS Records</h4>
                <p>Client hasn't added any DNS records yet.</p>
              </div>
            )}
            </div>
          </div>
        )}

        {/* UI Designs */}
        {activeTab === 'ui-designs' && (
          <div className="ui-designs-section">
            {uiDesigns.length > 0 ? (
              <div className="ui-designs-grid">
                {uiDesigns.map((design) => (
                  <div key={design.id} className="ui-design-card">
                    <div className="design-header">
                      <h4>UI Design Request</h4>
                      <span className={`status-badge ${getStatusBadgeClass(design.status)}`}>
                        {getStatusIcon(design.status)}
                        {design.status}
                      </span>
                    </div>
                    
                    <div className="design-content">
                      <div className="design-devices">
                        <strong>Target Devices:</strong>
                        <div className="device-tags">
                          {design.targetDevices.map((device) => (
                            <span key={device} className="device-tag">
                              {device === 'desktop' && <Monitor size={12} />}
                              {device === 'tablet' && <Tablet size={12} />}
                              {device === 'mobile' && <Smartphone size={12} />}
                              {device}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {design.stylePreferences && (
                        <div className="design-preferences">
                          <strong>Style Preferences:</strong>
                          <p>{design.stylePreferences}</p>
                        </div>
                      )}
                      
                      {design.uploadedImage && (
                        <div className="design-reference">
                          <div className="reference-image-section">
                            <div className="reference-image-header">
                              <Image size={16} />
                              <span>Reference Image</span>
                                                             <button
                                 onClick={() => handleImageDownload(design.uploadedImage!, getImageDisplayUrl(design) || undefined)}
                                 className="download-image-btn"
                                 title="Download image"
                               >
                                <Download size={14} />
                              </button>
                            </div>
                            <div className="reference-image-content">
                              <div className="image-preview">
                                {getImageDisplayUrl(design) ? (
                                  <img 
                                    src={getImageDisplayUrl(design)!} 
                                    alt="Reference design" 
                                    className="reference-image"
                                  />
                                ) : (
                                  <div className="image-placeholder">
                                    <Image size={32} />
                                    <span>{design.uploadedImage}</span>
                                    <small>Image uploaded - download available</small>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="design-meta">
                        <span><Calendar size={14} /> {formatDate(design.addedAt)}</span>
                      </div>
                      
                      {design.adminNotes && (
                        <div className="admin-notes">
                          <strong>Admin Notes:</strong>
                          <p>{design.adminNotes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="design-actions">
                      <button
                        onClick={() => handleStatusUpdate('ui_designs', design)}
                        className="btn-secondary small"
                      >
                        <Settings size={14} />
                        Update Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-attributes">
                <Palette size={48} />
                <h4>No UI Design Requests</h4>
                <p>Client hasn't submitted any UI design requests yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedAttribute && (
        <div className="modal-overlay">
          <div className="modal-content status-modal">
            <div className="modal-header">
              <h3>Update Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="close-button"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                  className="form-select"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Admin Notes</label>
                <textarea
                  value={statusForm.adminNotes}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Add notes about this update..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowStatusModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={submitStatusUpdate}
                className="btn-primary"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Required API Key Modal */}
      <AddRequiredAPIKeyModal
        isOpen={showRequiredAPIKeyModal}
        onClose={() => setShowRequiredAPIKeyModal(false)}
        onSubmit={handleRequiredAPIKeySubmit}
        project={{ id: projectId, name: projectName }}
      />

      {/* Required DNS Record Modal */}
      <AddRequiredDNSRecordModal
        isOpen={showRequiredDNSModal}
        onClose={() => setShowRequiredDNSModal(false)}
        onSubmit={handleRequiredDNSRecordSubmit}
        project={{ id: projectId, name: projectName }}
      />
    </div>
  );
};

export default ProjectAttributesView; 