import React from 'react';
import { Rocket, Plus } from 'lucide-react';

interface ProjectRequestSectionProps {
  onOpenAIChat: () => void;
}

const ProjectRequestSection: React.FC<ProjectRequestSectionProps> = ({ onOpenAIChat }) => {
  return (
    <div className="request-project-section">
      <div className="request-header">
        <div className="request-info">
          <h2>
            <Rocket size={24} />
            Request New Project
          </h2>
          <p>Have a project idea? Let us help bring it to life. Our team will review your request and get back to you within 24 hours.</p>
        </div>
        <button 
          className="request-project-btn"
          onClick={onOpenAIChat}
        >
          <Plus size={16} />
          Start New Request
        </button>
      </div>
    </div>
  );
};

export default ProjectRequestSection; 