import React, { useState } from 'react';
import { X, Palette, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface EditUIDesignRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any | null;
  onUpdated?: () => void;
}

const EditUIDesignRequestModal: React.FC<EditUIDesignRequestModalProps> = ({ isOpen, onClose, request, onUpdated }) => {
  const [status, setStatus] = useState<string>(request?.status || 'pending');
  const [priority, setPriority] = useState<string>(request?.priority || 'medium');
  const [adminNotes, setAdminNotes] = useState<string>(request?.adminNotes || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen || !request) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateDoc(doc(db, 'ui_design_requests', request.id), {
        status,
        priority,
        adminNotes
      });
      onUpdated?.();
      onClose();
    } catch (e) {
      console.error('Failed to update UI design request', e);
      setSaving(false);
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'in-progress': return <AlertCircle size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const description = request.stylePreferences || request.description || 'No description provided';
  const imageUrls: string[] = [];
  if (request.referenceImageUrl) imageUrls.push(request.referenceImageUrl);
  if (request.attachmentUrl && !imageUrls.includes(request.attachmentUrl)) imageUrls.push(request.attachmentUrl);
  if (Array.isArray(request.attachments)) {
    request.attachments.forEach((u: string) => { if (u && !imageUrls.includes(u)) imageUrls.push(u); });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette size={20} />
            <div>
              <h2 style={{ margin: 0 }}>{request.title || 'UI Design Request'}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 12 }}>
                {getStatusIcon(status)}
                <span>{status}</span>
                <span>•</span>
                <span>Priority: {priority}</span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
            <div>
              <div className="feature-requirements" style={{ marginBottom: 12 }}>
                <strong>Description</strong>
                <p style={{ marginTop: 6 }}>{description}</p>
              </div>

              {Array.isArray(request.targetDevices) && request.targetDevices.length > 0 && (
                <div className="feature-requirements" style={{ marginBottom: 12 }}>
                  <strong>Target Devices</strong>
                  <ul>
                    {request.targetDevices.map((d: string, i: number) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}

              {imageUrls.length > 0 && (
                <div className="ui-images">
                  <strong>Reference Images</strong>
                  <div className="ui-image-grid" style={{ marginTop: 8 }}>
                    {imageUrls.map((u, i) => (
                      <a key={i} href={u} target="_blank" rel="noopener noreferrer">
                        <img src={u} alt={`UI reference ${i+1}`} className="ui-design-image" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Admin Notes</label>
                <textarea rows={4} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="button button-secondary" onClick={onClose} disabled={saving}>Cancel</button>
                <button className="button button-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUIDesignRequestModal;

