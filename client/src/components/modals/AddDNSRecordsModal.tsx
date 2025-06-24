import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, Shield, Check, AlertCircle, Copy, ExternalLink, Server, Zap, Settings, Plus, Eye, Trash2 } from 'lucide-react';

interface AddDNSRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dnsData: any) => void;
  project?: any;
}

interface DNSRecord {
  id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';
  name: string;
  value: string;
  ttl: number;
  status: 'active' | 'pending' | 'error';
  createdAt: Date;
  lastChecked?: Date;
}

const AddDNSRecordsModal: React.FC<AddDNSRecordsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    domain: '',
    recordType: 'A' as 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS',
    name: '',
    value: '',
    ttl: 3600,
    priority: 10
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  // Mock existing DNS records
  const [existingRecords] = useState<DNSRecord[]>([
    {
      id: '1',
      type: 'A',
      name: '@',
      value: '192.168.1.100',
      ttl: 3600,
      status: 'active',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lastChecked: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'CNAME',
      name: 'www',
      value: 'example.com',
      ttl: 3600,
      status: 'active',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      lastChecked: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: '3',
      type: 'MX',
      name: '@',
      value: 'mail.example.com',
      ttl: 3600,
      status: 'pending',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ]);

  // DNS record types with descriptions
  const recordTypes = [
    {
      type: 'A',
      label: 'A Record',
      description: 'Points domain to IPv4 address',
      icon: '🌐',
      example: '192.168.1.1'
    },
    {
      type: 'AAAA',
      label: 'AAAA Record',
      description: 'Points domain to IPv6 address',
      icon: '🌐',
      example: '2001:0db8:85a3::8a2e:0370:7334'
    },
    {
      type: 'CNAME',
      label: 'CNAME Record',
      description: 'Points domain to another domain',
      icon: '🔗',
      example: 'example.com'
    },
    {
      type: 'MX',
      label: 'MX Record',
      description: 'Mail server configuration',
      icon: '📧',
      example: 'mail.example.com'
    },
    {
      type: 'TXT',
      label: 'TXT Record',
      description: 'Text information and verification',
      icon: '📝',
      example: 'v=spf1 include:_spf.google.com ~all'
    },
    {
      type: 'NS',
      label: 'NS Record',
      description: 'Name server configuration',
      icon: '🛠️',
      example: 'ns1.example.com'
    }
  ];

  // Common TTL values
  const ttlOptions = [
    { value: 300, label: '5 minutes (300s)' },
    { value: 1800, label: '30 minutes (1800s)' },
    { value: 3600, label: '1 hour (3600s)' },
    { value: 21600, label: '6 hours (21600s)' },
    { value: 43200, label: '12 hours (43200s)' },
    { value: 86400, label: '24 hours (86400s)' }
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        domain: project?.domain || '',
        recordType: 'A',
        name: '',
        value: '',
        ttl: 3600,
        priority: 10
      });
      setErrors({});
      setActiveTab('add');
      setCopiedValue(null);
    }
  }, [isOpen, project]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.domain.trim()) {
      newErrors.domain = 'Domain is required';
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,})$/.test(formData.domain)) {
      newErrors.domain = 'Please enter a valid domain';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Record name is required';
    }

    if (!formData.value.trim()) {
      newErrors.value = 'Record value is required';
    } else {
      // Basic validation based on record type
      if (formData.recordType === 'A' && !/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.value)) {
        newErrors.value = 'Please enter a valid IPv4 address';
      } else if (formData.recordType === 'CNAME' && !/^[a-zA-Z0-9][a-zA-Z0-9-.]*[a-zA-Z0-9]$/.test(formData.value)) {
        newErrors.value = 'Please enter a valid domain name';
      }
    }

    if (formData.ttl < 60) {
      newErrors.ttl = 'TTL must be at least 60 seconds';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const dnsData = {
        ...formData,
        projectId: project?.id,
        createdAt: new Date(),
        id: Date.now().toString(),
        status: 'pending'
      };

      await onSubmit(dnsData);
      handleClose();
    } catch (error) {
      console.error('Error adding DNS record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      domain: project?.domain || '',
      recordType: 'A',
      name: '',
      value: '',
      ttl: 3600,
      priority: 10
    });
    setErrors({});
    setIsSubmitting(false);
    setActiveTab('add');
    setCopiedValue(null);
    onClose();
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      setTimeout(() => setCopiedValue(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'error': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getRecordIcon = (type: string) => {
    const record = recordTypes.find(r => r.type === type);
    return record?.icon || '📋';
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="dns-modal-overlay" onClick={handleClose}>
      <div className="dns-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <Globe className="header-icon" />
            <div className="header-text">
              <h2>DNS Management</h2>
              <p>Configure DNS records for {project?.name || 'your project'}</p>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <Plus size={18} />
            Add DNS Record
          </button>
          <button
            className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <Settings size={18} />
            Manage Records ({existingRecords.length})
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'add' ? (
            /* Add DNS Record Form */
            <div className="dns-form-container">
              <form onSubmit={handleSubmit} className="dns-form">
                {/* Domain Configuration */}
                <div className="form-section">
                  <h3>Domain Configuration</h3>
                  <div className="form-group">
                    <label htmlFor="domain">Domain Name</label>
                    <input
                      id="domain"
                      type="text"
                      value={formData.domain}
                      onChange={(e) => handleInputChange('domain', e.target.value)}
                      placeholder="example.com"
                      className={`form-input ${errors.domain ? 'error' : ''}`}
                    />
                    {errors.domain && (
                      <span className="error-message">
                        <AlertCircle size={14} />
                        {errors.domain}
                      </span>
                    )}
                  </div>
                </div>

                {/* Record Type Selection */}
                <div className="form-section">
                  <h3>Record Type</h3>
                  <div className="record-type-grid">
                    {recordTypes.map((record) => (
                      <div
                        key={record.type}
                        className={`record-type-card ${
                          formData.recordType === record.type ? 'selected' : ''
                        }`}
                        onClick={() => handleInputChange('recordType', record.type)}
                      >
                        <div className="record-icon">{record.icon}</div>
                        <div className="record-info">
                          <h4>{record.label}</h4>
                          <p>{record.description}</p>
                          <span className="record-example">e.g., {record.example}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Record Details */}
                <div className="form-section">
                  <h3>Record Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Record Name</label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="@ (root domain) or subdomain"
                        className={`form-input ${errors.name ? 'error' : ''}`}
                      />
                      {errors.name && (
                        <span className="error-message">
                          <AlertCircle size={14} />
                          {errors.name}
                        </span>
                      )}
                      <div className="form-help">
                        Use "@" for root domain, or enter subdomain name (e.g., "www", "mail")
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="ttl">TTL (Time to Live)</label>
                      <select
                        id="ttl"
                        value={formData.ttl}
                        onChange={(e) => handleInputChange('ttl', parseInt(e.target.value))}
                        className="form-select"
                      >
                        {ttlOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="value">Record Value</label>
                    <input
                      id="value"
                      type="text"
                      value={formData.value}
                      onChange={(e) => handleInputChange('value', e.target.value)}
                      placeholder={recordTypes.find(r => r.type === formData.recordType)?.example || 'Enter record value'}
                      className={`form-input ${errors.value ? 'error' : ''}`}
                    />
                    {errors.value && (
                      <span className="error-message">
                        <AlertCircle size={14} />
                        {errors.value}
                      </span>
                    )}
                  </div>

                  {/* Priority field for MX records */}
                  {formData.recordType === 'MX' && (
                    <div className="form-group">
                      <label htmlFor="priority">Priority</label>
                      <input
                        id="priority"
                        type="number"
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                        min="0"
                        max="65535"
                        className="form-input"
                      />
                      <div className="form-help">
                        Lower numbers have higher priority (0-65535)
                      </div>
                    </div>
                  )}
                </div>

                {/* DNS Propagation Info */}
                <div className="info-section">
                  <div className="info-card">
                    <Zap className="info-icon" />
                    <div className="info-content">
                      <h4>DNS Propagation</h4>
                      <p>DNS changes can take 24-48 hours to propagate worldwide. Lower TTL values update faster but increase DNS queries.</p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* Manage DNS Records */
            <div className="dns-records-manager">
              <div className="manager-header">
                <h3>
                  <Server size={20} />
                  DNS Records for {formData.domain || 'your domain'}
                </h3>
                <p>Manage and monitor your DNS configuration</p>
              </div>

              {existingRecords.length > 0 ? (
                <div className="records-table">
                  <div className="table-header">
                    <div className="header-cell">Type</div>
                    <div className="header-cell">Name</div>
                    <div className="header-cell">Value</div>
                    <div className="header-cell">TTL</div>
                    <div className="header-cell">Status</div>
                    <div className="header-cell">Actions</div>
                  </div>
                  
                  {existingRecords.map((record) => (
                    <div key={record.id} className="table-row">
                      <div className="table-cell">
                        <div className="record-type-badge">
                          <span className="type-icon">{getRecordIcon(record.type)}</span>
                          <span className="type-text">{record.type}</span>
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        <span className="record-name">{record.name}</span>
                      </div>
                      
                      <div className="table-cell">
                        <div className="record-value-container">
                          <span className="record-value">{record.value}</span>
                          <button
                            onClick={() => handleCopy(record.value)}
                            className="copy-button"
                            title="Copy to clipboard"
                          >
                            {copiedValue === record.value ? (
                              <Check size={14} className="copy-success" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        <span className="ttl-value">{record.ttl}s</span>
                      </div>
                      
                      <div className="table-cell">
                        <span className={`status-badge ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                        {record.lastChecked && (
                          <div className="last-checked">
                            Checked {formatRelativeTime(record.lastChecked)}
                          </div>
                        )}
                      </div>
                      
                      <div className="table-cell">
                        <div className="record-actions">
                          <button className="btn-secondary small">
                            <Eye size={14} />
                          </button>
                          <button className="btn-secondary small">
                            <ExternalLink size={14} />
                          </button>
                          <button className="btn-danger small">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-records">
                  <Server size={64} />
                  <h3>No DNS Records Found</h3>
                  <p>Add your first DNS record to get started with domain configuration</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="btn-primary"
                  >
                    <Plus size={16} />
                    Add DNS Record
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'add' && (
          <div className="modal-footer">
            <button onClick={handleClose} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <>Adding DNS Record...</>
              ) : (
                <>
                  <Globe size={16} />
                  Add DNS Record
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddDNSRecordsModal; 