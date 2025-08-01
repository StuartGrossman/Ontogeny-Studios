import React from 'react';
import { X, FileText } from 'lucide-react';
import RequestedProjectsSection from './RequestedProjectsSection';
import '../styles/RequestedProjectsModal.css';

interface Project {
  id: string;
  projectName?: string;
  description?: string;
  status: string;
  progress?: number;
  features?: string;
  priority?: string;
  createdAt?: any;
  meetingScheduled?: boolean;
}

interface RequestedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestedProjects: Project[];
  requestedProjectsLoading: boolean;
}

const RequestedProjectsModal: React.FC<RequestedProjectsModalProps> = ({
  isOpen,
  onClose,
  requestedProjects,
  requestedProjectsLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="requested-projects-modal-overlay" onClick={onClose}>
      <div className="requested-projects-modal" onClick={(e) => e.stopPropagation()}>
        <div className="requested-projects-modal-header">
          <div className="requested-projects-modal-title">
            <FileText size={24} />
            <div>
              <h2>Requested Projects</h2>
              <p>Track the status of your project requests</p>
            </div>
          </div>
          <button className="requested-projects-modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="requested-projects-modal-content">
          <RequestedProjectsSection
            requestedProjects={requestedProjects}
            requestedProjectsLoading={requestedProjectsLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default RequestedProjectsModal; 