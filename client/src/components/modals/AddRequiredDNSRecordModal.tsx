import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, AlertCircle, Plus, Bell, Users, Check, Server } from 'lucide-react';

interface AddRequiredDNSRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requiredDNSData: any) => void;
  project?: any;
}

interface RequiredDNSRecord {
  id: string;
  recordName: string;
  recordType: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'requested' | 'provided' | 'verified';
  requestedBy: string;
  requestedAt: Date;
  providedAt?: Date;
  providedBy?: string;
  recordValue?: string;
  adminNotes?: string;
}

const AddRequiredDNSRecordModal: React.FC<AddRequiredDNSRecordModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    recordName: '',
    recordType: 'A' as 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    adminNotes: ''
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock existing required DNS records
  const [existingRequiredRecords] = useState<RequiredDNSRecord[]>([
    {
      id: '1',
      recordName: 'A Record for Root Domain',
      recordType: 'A',
      description: 'Required to point the root domain to the server IP address',
      priority: 'critical',
      status: 'pending',
      requestedBy: 'Admin User',
      requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      recordName: 'CNAME for www Subdomain',
      recordType: 'CNAME',
      description: 'Required to redirect www to the root domain',
      priority: 'high',
      status: 'requested',
      requestedBy: 'Admin User',
      requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
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

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low Priority', icon: '🟢', description: 'Nice to have' },
    { value: 'medium', label: 'Medium Priority', icon: '🟡', description: 'Important for functionality' },
    { value: 'high', label: 'High Priority', icon: '🟠', description: 'Critical for core features' },
    { value: 'critical', label: 'Critical Priority', icon: '🔴', description: 'Required for launch' }
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        recordName: '',
        recordType: 'A',
        description: '',
        priority: 'medium',
        adminNotes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.recordName.trim()) {
      newErrors.recordName = 'DNS record name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const requiredDNSData = {
        ...formData,
        projectId: project?.id,
        projectName: project?.name,
        createdAt: new Date(),
        id: Date.now().toString(),
        status: 'pending',
        requestedBy: 'Admin', // This would come from the current admin user
        requestedAt: new Date()
      };

      await onSubmit(requiredDNSData);
      handleClose();
    } catch (error) {
      console.error('Error adding required DNS record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      recordName: '',
      recordType: 'A',
      description: '',
      priority: 'medium',
      adminNotes: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const getRecordTypeInfo = (type: string) => {
    return recordTypes.find(r => r.type === type);
  };

  const getPriorityInfo = (priority: string) => {
    return priorityOptions.find(p => p.value === priority);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-700 bg-gray-100';
      case 'requested': return 'text-blue-700 bg-blue-100';
      case 'provided': return 'text-green-700 bg-green-100';
      case 'verified': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="required-dns-modal-overlay" onClick={handleClose}>
      <div className="required-dns-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <Bell className="header-icon" />
            <div className="header-text">
              <h2>Request DNS Record from Client</h2>
              <p>Create a request for {project?.name || 'the project'} client to provide a DNS record</p>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Existing Required DNS Records */}
          <div className="existing-required-records-section">
            <div className="section-header">
              <h3>
                <Users size={18} />
                Existing DNS Record Requests ({existingRequiredRecords.length})
              </h3>
              <span className="section-subtitle">DNS records requested from the client</span>
            </div>

            {existingRequiredRecords.length > 0 ? (
              <div className="required-records-grid">
                {existingRequiredRecords.map((requiredRecord) => (
                  <div key={requiredRecord.id} className="required-record-card">
                    <div className="record-header">
                      <div className="record-info">
                        <h4>{requiredRecord.recordName}</h4>
                        <span className="record-type-tag">{requiredRecord.recordType}</span>
                      </div>
                      <div className="record-meta">
                        <span className={`priority-badge ${requiredRecord.priority}`}>
                          {getPriorityInfo(requiredRecord.priority)?.icon} {requiredRecord.priority}
                        </span>
                        <span className={`status-badge ${getStatusColor(requiredRecord.status)}`}>
                          {requiredRecord.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="record-content">
                      <p className="record-description">{requiredRecord.description}</p>
                      <div className="record-details">
                        <div className="detail-row">
                          <span className="detail-label">Requested by:</span>
                          <span>{requiredRecord.requestedBy}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Requested on:</span>
                          <span>{formatDate(requiredRecord.requestedAt)}</span>
                        </div>
                        {requiredRecord.providedAt && (
                          <div className="detail-row">
                            <span className="detail-label">Provided on:</span>
                            <span>{formatDate(requiredRecord.providedAt)}</span>
                          </div>
                        )}
                      </div>
                      
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
            ) : (
              <div className="empty-state">
                <Server size={48} />
                <h3>No DNS Record Requests Yet</h3>
                <p>Create your first DNS record request for the client</p>
              </div>
            )}
          </div>

          {/* Add New Required DNS Record Form */}
          <div className="add-required-record-section">
            <div className="section-header">
              <h3>
                <Plus size={18} />
                Request New DNS Record
              </h3>
              <span className="section-subtitle">Create a new request for the client to provide a DNS record</span>
            </div>

            <form onSubmit={handleSubmit} className="required-dns-form">
              {/* Record Type Selection */}
              <div className="form-group">
                <label htmlFor="recordType">DNS Record Type</label>
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

              {/* Record Name */}
              <div className="form-group">
                <label htmlFor="recordName">DNS Record Name</label>
                <input
                  id="recordName"
                  type="text"
                  value={formData.recordName}
                  onChange={(e) => handleInputChange('recordName', e.target.value)}
                  placeholder="e.g., A Record for Root Domain, CNAME for www"
                  className={`form-input ${errors.recordName ? 'error' : ''}`}
                />
                {errors.recordName && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.recordName}
                  </span>
                )}
                <div className="form-help">
                  Be specific about which DNS record you need from the client
                </div>
              </div>

              {/* Priority Selection */}
              <div className="form-group">
                <label htmlFor="priority">Priority Level</label>
                <div className="priority-options">
                  {priorityOptions.map((priority) => (
                    <div
                      key={priority.value}
                      className={`priority-option ${formData.priority === priority.value ? 'selected' : ''}`}
                      onClick={() => handleInputChange('priority', priority.value)}
                    >
                      <div className="priority-icon">{priority.icon}</div>
                      <div className="priority-info">
                        <h4>{priority.label}</h4>
                        <p>{priority.description}</p>
                      </div>
                      {formData.priority === priority.value && (
                        <Check size={16} className="check-icon" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Explain why this DNS record is needed and how it will be used..."
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  rows={3}
                />
                {errors.description && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.description}
                  </span>
                )}
                <div className="form-help">
                  Provide clear instructions for the client about what DNS record is needed
                </div>
              </div>

              {/* Admin Notes */}
              <div className="form-group">
                <label htmlFor="adminNotes">Admin Notes (Optional)</label>
                <textarea
                  id="adminNotes"
                  value={formData.adminNotes}
                  onChange={(e) => handleInputChange('adminNotes', e.target.value)}
                  placeholder="Internal notes about this request..."
                  className="form-textarea"
                  rows={2}
                />
                <div className="form-help">
                  Internal notes that won't be shown to the client
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
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
              <>Creating Request...</>
            ) : (
              <>
                <Bell size={16} />
                Request DNS Record
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddRequiredDNSRecordModal; 