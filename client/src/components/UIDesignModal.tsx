import React, { useState, useEffect } from 'react';
import { X, Palette, Monitor, Tablet, Smartphone, Image, Calendar, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styles/UIDesignModal.css';

const sanitizeFileName = (name: string): string => {
  const base = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  return base
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
};

interface UIDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  project?: any;
  editingRequest?: any;
  editOnly?: boolean;
}

interface UIDesignRequest {
  id: string;
  title: string;
  description: string;
  targetDevices: string[];
  stylePreferences: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  requestedBy: string;
  requestedByName: string;
  requestedByEmail: string;
  requestedAt: Date;
  hasReferenceImage: boolean;
  referenceImageUrl?: string;
  projectId?: string;
}

const UIDesignModal: React.FC<UIDesignModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  project,
  editingRequest: initialEditingRequest,
  editOnly
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'create'>('requests');
  const [designRequests, setDesignRequests] = useState<UIDesignRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRequest, setEditingRequest] = useState<UIDesignRequest | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Form state for creating new design request
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    targetDevices: [] as string[],
    stylePreferences: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    hasReferenceImage: false,
    referenceImage: null as File | null
  });

  // Form state for editing existing request
  const [editRequest, setEditRequest] = useState({
    title: '',
    description: '',
    targetDevices: [] as string[],
    stylePreferences: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    hasReferenceImage: false,
    referenceImage: null as File | null
  });

  // Local preview URLs for newly selected images
  const [newRequestPreviewUrl, setNewRequestPreviewUrl] = useState<string | null>(null);
  const [editRequestPreviewUrl, setEditRequestPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDesignRequests();
    }
  }, [isOpen, project?.id]);

  // Handle editing request prop
  useEffect(() => {
    if (initialEditingRequest && isOpen) {
      setEditingRequest(initialEditingRequest);
      setEditRequest({
        title: initialEditingRequest.title || '',
        description: initialEditingRequest.description || '',
        targetDevices: initialEditingRequest.targetDevices || [],
        stylePreferences: initialEditingRequest.stylePreferences || '',
        priority: initialEditingRequest.priority || 'medium',
        hasReferenceImage: initialEditingRequest.hasReferenceImage || false,
        referenceImage: null
      });
      setShowEditModal(true);
      setActiveTab('create');
    } else if (!isOpen) {
      // Reset editing state when modal closes
      setEditingRequest(null);
      setShowEditModal(false);
      setActiveTab('requests');
      setEditRequest({
        title: '',
        description: '',
        targetDevices: [],
        stylePreferences: '',
        priority: 'medium',
        hasReferenceImage: false,
        referenceImage: null
      });
      setEditRequestPreviewUrl(null);
    }
  }, [initialEditingRequest, isOpen]);

  const closeEdit = () => {
    if (editOnly) {
      onClose();
    } else {
      setShowEditModal(false);
    }
  };

  const loadDesignRequests = async () => {
    setLoading(true);
    try {
      let designRequestsQuery;
      
      if (project?.id) {
        // Load design requests for specific project
        designRequestsQuery = query(
          collection(db, 'ui_design_requests'),
          where('projectId', '==', project.id),
          orderBy('requestedAt', 'desc')
        );
      } else {
        // Load all design requests for current user
        designRequestsQuery = query(
          collection(db, 'ui_design_requests'),
          where('requestedBy', '==', currentUser?.uid),
          orderBy('requestedAt', 'desc')
        );
      }
      
      const designRequestsSnapshot = await getDocs(designRequestsQuery);
      const requests = designRequestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate ? doc.data().requestedAt.toDate() : doc.data().requestedAt
      })) as UIDesignRequest[];
      
      setDesignRequests(requests);
    } catch (error) {
      console.error('Error loading design requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceToggle = (device: string) => {
    setNewRequest(prev => ({
      ...prev,
      targetDevices: prev.targetDevices.includes(device)
        ? prev.targetDevices.filter(d => d !== device)
        : [...prev.targetDevices, device]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewRequest(prev => ({
        ...prev,
        referenceImage: file,
        hasReferenceImage: true
      }));
      try {
        const url = URL.createObjectURL(file);
        setNewRequestPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch {}
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditRequest(prev => ({
        ...prev,
        referenceImage: file,
        hasReferenceImage: true
      }));
      try {
        const url = URL.createObjectURL(file);
        setEditRequestPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch {}
    }
  };

  const handleEditDeviceToggle = (device: string) => {
    setEditRequest(prev => ({
      ...prev,
      targetDevices: prev.targetDevices.includes(device)
        ? prev.targetDevices.filter(d => d !== device)
        : [...prev.targetDevices, device]
    }));
  };

  const handleEditRequest = (request: UIDesignRequest) => {
    setEditingRequest(request);
    setEditRequest({
      title: request.title,
      description: request.description,
      targetDevices: request.targetDevices,
      stylePreferences: request.stylePreferences,
      priority: request.priority,
      hasReferenceImage: request.hasReferenceImage,
      referenceImage: null
    });
    setShowEditModal(true);
  };

  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editRequest.title.trim() || !editRequest.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (editRequest.targetDevices.length === 0) {
      alert('Please select at least one target device');
      return;
    }

    if (!editingRequest) return;

    try {
      const requestRef = doc(db, 'ui_design_requests', editingRequest.id);

      // If a new reference image was selected, upload it and set the URL
      let referenceImageUrl = editingRequest.referenceImageUrl || null;
      if (editRequest.referenceImage) {
        const file = editRequest.referenceImage as File;
        const safeName = sanitizeFileName(file.name);
        const path = `ui_design_requests/${project?.id || editingRequest.projectId || 'unassigned'}/${Date.now()}_${safeName}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file, {
          contentType: file.type || 'image/png',
          cacheControl: 'public, max-age=31536000'
        });
        referenceImageUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(requestRef, {
        title: editRequest.title,
        description: editRequest.description,
        targetDevices: editRequest.targetDevices,
        stylePreferences: editRequest.stylePreferences,
        priority: editRequest.priority,
        hasReferenceImage: !!referenceImageUrl,
        ...(referenceImageUrl ? { referenceImageUrl, attachmentUrl: referenceImageUrl } : {}),
        updatedAt: new Date()
      });
      
      // Reset form and close modal
      setEditRequest({
        title: '',
        description: '',
        targetDevices: [],
        stylePreferences: '',
        priority: 'medium',
        hasReferenceImage: false,
        referenceImage: null
      });
      setEditingRequest(null);
      setShowEditModal(false);
      
      // Reload requests
      loadDesignRequests();
      
    } catch (error) {
      console.error('Error updating design request:', error);
      alert('Error updating design request. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRequest.title.trim() || !newRequest.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (newRequest.targetDevices.length === 0) {
      alert('Please select at least one target device');
      return;
    }

    try {
      // Upload reference image if provided
      let referenceImageUrl: string | null = null;
      if (newRequest.referenceImage) {
        const file = newRequest.referenceImage as File;
        const safeName = sanitizeFileName(file.name);
        const path = `ui_design_requests/${project?.id || 'unassigned'}/${Date.now()}_${safeName}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file, {
          contentType: file.type || 'image/png',
          cacheControl: 'public, max-age=31536000'
        });
        referenceImageUrl = await getDownloadURL(storageRef);
      }

      const designRequest = {
        title: newRequest.title,
        description: newRequest.description,
        targetDevices: newRequest.targetDevices,
        stylePreferences: newRequest.stylePreferences,
        priority: newRequest.priority,
        status: 'pending',
        requestedBy: currentUser?.uid,
        requestedByName: currentUser?.displayName || currentUser?.email,
        requestedByEmail: currentUser?.email,
        requestedAt: new Date(),
        hasReferenceImage: !!referenceImageUrl,
        ...(referenceImageUrl ? { referenceImageUrl, attachmentUrl: referenceImageUrl } : {}),
        projectId: project?.id || null
      };

      await addDoc(collection(db, 'ui_design_requests'), designRequest);
      
      // Reset form
      setNewRequest({
        title: '',
        description: '',
        targetDevices: [],
        stylePreferences: '',
        priority: 'medium',
        hasReferenceImage: false,
        referenceImage: null
      });
      setNewRequestPreviewUrl(null);
      
      // Switch to requests tab and reload
      setActiveTab('requests');
      loadDesignRequests();
      
    } catch (error) {
      console.error('Error submitting design request:', error);
      alert('Error submitting design request. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="status-icon pending" />;
      case 'in-progress':
        return <AlertCircle size={16} className="status-icon in-progress" />;
      case 'completed':
        return <CheckCircle size={16} className="status-icon completed" />;
      case 'rejected':
        return <AlertCircle size={16} className="status-icon rejected" />;
      default:
        return <Clock size={16} className="status-icon pending" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'in-progress':
        return 'in-progress';
      case 'completed':
        return 'completed';
      case 'rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!isOpen) return null;

  // Render only the edit overlay when editOnly is true
  if (editOnly) {
    if (!editingRequest) return null;
    return (
      <div className="ui-design-edit-modal-overlay" onClick={closeEdit}>
        <div className="ui-design-edit-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ui-design-edit-modal-header">
            <div className="ui-design-edit-modal-title">
              <Palette size={24} />
              <div>
                <h2>Edit Design Request</h2>
                <p>Update your design request details</p>
              </div>
            </div>
            <button className="ui-design-edit-modal-close-btn" onClick={closeEdit}>
              <X size={20} />
            </button>
          </div>

          <div className="ui-design-edit-modal-content">
            <form onSubmit={handleUpdateRequest} className="ui-design-form">
              <div className="form-columns">
                <div className="form-column-left">
                  <div className="form-group">
                    <label htmlFor="edit-title">Design Title *</label>
                    <input
                      type="text"
                      id="edit-title"
                      value={editRequest.title}
                      onChange={(e) => setEditRequest(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Dashboard Redesign, Mobile App Interface"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-description">Description *</label>
                    <textarea
                      id="edit-description"
                      value={editRequest.description}
                      onChange={(e) => setEditRequest(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your design requirements, goals, and any specific features you want to include..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Target Devices *</label>
                    <div className="device-selection">
                      {['desktop', 'tablet', 'mobile'].map((device) => (
                        <button
                          key={device}
                          type="button"
                          className={`device-select-btn ${editRequest.targetDevices.includes(device) ? 'selected' : ''}`}
                          onClick={() => handleEditDeviceToggle(device)}
                        >
                          {device === 'desktop' && <Monitor size={16} />}
                          {device === 'tablet' && <Tablet size={16} />}
                          {device === 'mobile' && <Smartphone size={16} />}
                          {device.charAt(0).toUpperCase() + device.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-column-right">
                  <div className="form-group">
                    <label htmlFor="edit-stylePreferences">Style Preferences</label>
                    <textarea
                      id="edit-stylePreferences"
                      value={editRequest.stylePreferences}
                      onChange={(e) => setEditRequest(prev => ({ ...prev, stylePreferences: e.target.value }))}
                      placeholder="Describe your preferred design style, colors, themes, or any specific design inspiration..."
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-priority">Priority</label>
                    <select
                      id="edit-priority"
                      value={editRequest.priority}
                      onChange={(e) => setEditRequest(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-referenceImage">Reference Image (Optional)</label>
                    <input
                      type="file"
                      id="edit-referenceImage"
                      accept="image/*"
                      onChange={handleEditImageUpload}
                    />
                    <p className="form-help">Upload a reference image to help illustrate your design vision</p>
                    {editRequestPreviewUrl && (
                      <div className="reference-image-preview" style={{ marginTop: '0.75rem' }}>
                        <img src={editRequestPreviewUrl} alt="Selected preview" className="reference-image" />
                      </div>
                    )}

                    {editingRequest.hasReferenceImage && editingRequest.referenceImageUrl && !editRequestPreviewUrl && (
                      <div className="form-group">
                        <label>Current Reference Image</label>
                        <div className="reference-image-preview">
                          <img 
                            src={editingRequest.referenceImageUrl} 
                            alt="Reference" 
                            className="reference-image"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeEdit}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Design Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-design-modal-overlay" onClick={onClose}>
      <div className="ui-design-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ui-design-modal-header">
          <div className="ui-design-modal-title">
            <Palette size={24} />
            <div>
              <h2>UI Design</h2>
              <p>{project ? `Design requests for ${project.name}` : 'Manage UI/UX design requests'}</p>
            </div>
          </div>
          <button className="ui-design-modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="ui-design-modal-tabs">
          <button 
            className={`ui-design-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <FileText size={16} />
            Design Requests ({designRequests.length})
          </button>
          <button 
            className={`ui-design-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <Palette size={16} />
            Create New Request
          </button>
        </div>

        <div className="ui-design-modal-content">
          {activeTab === 'requests' && (
            <div className="ui-design-tab">
              <div className="ui-design-tab-header">
                <h3>Design Requests</h3>
                <p>Track your UI/UX design requests and deliverables</p>
              </div>
              
              {loading ? (
                <div className="ui-design-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading design requests...</p>
                </div>
              ) : (
                <div className="ui-design-requests-grid">
                  {designRequests.length > 0 ? (
                    designRequests.map((request) => (
                      <div 
                        key={request.id} 
                        className={`ui-design-request-card ${request.status} clickable`}
                        onClick={() => handleEditRequest(request)}
                      >
                        <div className="request-header">
                          <div className="request-title-section">
                            <h4>{request.title}</h4>
                            <div className="request-badges">
                              <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                                {getStatusIcon(request.status)}
                                {request.status.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="request-content">
                          <p className="request-description">{request.description}</p>
                          
                          <div className="design-details">
                            <div className="detail-group">
                              <span className="detail-label">Target Devices:</span>
                              <div className="device-tags">
                                {request.targetDevices.map((device) => (
                                  <span key={device} className="device-tag">
                                    {device === 'desktop' && <Monitor size={12} />}
                                    {device === 'tablet' && <Tablet size={12} />}
                                    {device === 'mobile' && <Smartphone size={12} />}
                                    {device}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="detail-group">
                              <span className="detail-label">Style Preferences:</span>
                              <p className="style-preferences">{request.stylePreferences}</p>
                            </div>
                          </div>

                          <div className="request-meta design-meta">
                            <div className="meta-item">
                              <Calendar size={14} />
                              <span>Requested {formatDate(request.requestedAt)}</span>
                            </div>
                            {request.hasReferenceImage && (
                              <div className="meta-item">
                                <Image size={14} />
                                <span>Reference image provided</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="ui-design-empty">
                      <Palette size={48} />
                      <h4>No Design Requests</h4>
                      <p>You haven't submitted any design requests yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="ui-design-tab">
              <div className="ui-design-tab-header">
                <h3>Create New Design Request</h3>
                <p>Submit a new UI/UX design request</p>
              </div>
              
              <form onSubmit={handleSubmit} className="ui-design-form">
                <div className="form-columns">
                  <div className="form-column-left">
                    <div className="form-group">
                      <label htmlFor="title">Design Title *</label>
                      <input
                        type="text"
                        id="title"
                        value={newRequest.title}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Dashboard Redesign, Mobile App Interface"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">Description *</label>
                      <textarea
                        id="description"
                        value={newRequest.description}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your design requirements, goals, and any specific features you want to include..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Target Devices *</label>
                      <div className="device-selection">
                        {['desktop', 'tablet', 'mobile'].map((device) => (
                          <button
                            key={device}
                            type="button"
                            className={`device-select-btn ${newRequest.targetDevices.includes(device) ? 'selected' : ''}`}
                            onClick={() => handleDeviceToggle(device)}
                          >
                            {device === 'desktop' && <Monitor size={16} />}
                            {device === 'tablet' && <Tablet size={16} />}
                            {device === 'mobile' && <Smartphone size={16} />}
                            {device.charAt(0).toUpperCase() + device.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-column-right">
                    <div className="form-group">
                      <label htmlFor="stylePreferences">Style Preferences</label>
                      <textarea
                        id="stylePreferences"
                        value={newRequest.stylePreferences}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, stylePreferences: e.target.value }))}
                        placeholder="Describe your preferred design style, colors, themes, or any specific design inspiration..."
                        rows={3}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="priority">Priority</label>
                      <select
                        id="priority"
                        value={newRequest.priority}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="referenceImage">Reference Image (Optional)</label>
                      <input
                        type="file"
                        id="referenceImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <p className="form-help">Upload a reference image to help illustrate your design vision</p>
                      {newRequestPreviewUrl && (
                        <div className="reference-image-preview" style={{ marginTop: '0.75rem' }}>
                          <img src={newRequestPreviewUrl} alt="Selected preview" className="reference-image" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setActiveTab('requests')}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Submit Design Request
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Request Modal */}
          {showEditModal && editingRequest && (
            <div className="ui-design-edit-modal-overlay" onClick={() => setShowEditModal(false)}>
              <div className="ui-design-edit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="ui-design-edit-modal-header">
                  <div className="ui-design-edit-modal-title">
                    <Palette size={24} />
                    <div>
                      <h2>Edit Design Request</h2>
                      <p>Update your design request details</p>
                    </div>
                  </div>
                  <button className="ui-design-edit-modal-close-btn" onClick={() => setShowEditModal(false)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="ui-design-edit-modal-content">
                  <form onSubmit={handleUpdateRequest} className="ui-design-form">
                    <div className="form-columns">
                      <div className="form-column-left">
                        <div className="form-group">
                          <label htmlFor="edit-title">Design Title *</label>
                          <input
                            type="text"
                            id="edit-title"
                            value={editRequest.title}
                            onChange={(e) => setEditRequest(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g., Dashboard Redesign, Mobile App Interface"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="edit-description">Description *</label>
                          <textarea
                            id="edit-description"
                            value={editRequest.description}
                            onChange={(e) => setEditRequest(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe your design requirements, goals, and any specific features you want to include..."
                            rows={4}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Target Devices *</label>
                          <div className="device-selection">
                            {['desktop', 'tablet', 'mobile'].map((device) => (
                              <button
                                key={device}
                                type="button"
                                className={`device-select-btn ${editRequest.targetDevices.includes(device) ? 'selected' : ''}`}
                                onClick={() => handleEditDeviceToggle(device)}
                              >
                                {device === 'desktop' && <Monitor size={16} />}
                                {device === 'tablet' && <Tablet size={16} />}
                                {device === 'mobile' && <Smartphone size={16} />}
                                {device.charAt(0).toUpperCase() + device.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="form-column-right">
                        <div className="form-group">
                          <label htmlFor="edit-stylePreferences">Style Preferences</label>
                          <textarea
                            id="edit-stylePreferences"
                            value={editRequest.stylePreferences}
                            onChange={(e) => setEditRequest(prev => ({ ...prev, stylePreferences: e.target.value }))}
                            placeholder="Describe your preferred design style, colors, themes, or any specific design inspiration..."
                            rows={3}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="edit-priority">Priority</label>
                          <select
                            id="edit-priority"
                            value={editRequest.priority}
                            onChange={(e) => setEditRequest(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="edit-referenceImage">Reference Image (Optional)</label>
                          <input
                            type="file"
                            id="edit-referenceImage"
                            accept="image/*"
                            onChange={handleEditImageUpload}
                          />
                          <p className="form-help">Upload a reference image to help illustrate your design vision</p>
                         {editRequestPreviewUrl && (
                           <div className="reference-image-preview" style={{ marginTop: '0.75rem' }}>
                             <img src={editRequestPreviewUrl} alt="Selected preview" className="reference-image" />
                           </div>
                         )}
                        </div>

                        {/* Show existing reference image if available */}
                        {editingRequest.hasReferenceImage && editingRequest.referenceImageUrl && !editRequestPreviewUrl && (
                          <div className="form-group">
                            <label>Current Reference Image</label>
                            <div className="reference-image-preview">
                              <img 
                                src={editingRequest.referenceImageUrl} 
                                alt="Reference" 
                                className="reference-image"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="submit-btn">
                        Update Design Request
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UIDesignModal; 