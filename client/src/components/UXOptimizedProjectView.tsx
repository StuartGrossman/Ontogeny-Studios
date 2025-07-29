import React, { useState } from 'react';
import { 
  Activity, 
  Settings, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import '../styles/ActiveProjectsSection.css';

interface ProjectData {
  id: string;
  name: string;
  status: string;
  progress: number;
  description: string;
  assignedTo: string[];
  deadline: Date;
  features: Array<{
    id: number;
    text: string;
    completed: boolean;
    priority: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  estimatedHours: number;
  actualHours: number;
}

interface UXOptimizedProjectViewProps {
  project: ProjectData;
  onUpdateStatus?: (status: string) => void;
  onAddFeature?: () => void;
  onEditProject?: () => void;
  onDeleteProject?: () => void;
}

const UXOptimizedProjectView: React.FC<UXOptimizedProjectViewProps> = ({
  project,
  onUpdateStatus,
  onAddFeature,
  onEditProject,
  onDeleteProject
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const completedFeatures = project.features.filter(f => f.completed).length;
  const completedTasks = project.tasks.filter(t => t.completed).length;

  return (
    <div className="ux-optimized-project-view">
      {/* Project Header - Clear visual hierarchy */}
      <div className="project-header-ux">
        <h1 className="project-title-ux">{project.name}</h1>
        
        <div className="project-status-ux">
          <span 
            className="status-badge-ux"
            style={{ backgroundColor: getStatusColor(project.status) + '40' }}
          >
            {project.status}
          </span>
          <span>•</span>
          <span>{project.assignedTo.length} team members</span>
        </div>

        <div className="progress-container-ux">
          <div className="progress-bar-ux">
            <div 
              className="progress-fill-ux"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{project.progress}% Complete</span>
            <span>{completedFeatures}/{project.features.length} Features</span>
          </div>
        </div>
      </div>

      {/* Information Chunking - Group related content */}
      <div className="project-chunks-ux">
        {/* Overview Chunk */}
        <div className="project-chunk-ux">
          <div className="chunk-header-ux">
            <Activity className="chunk-icon-ux" />
            <h2 className="chunk-title-ux">Project Overview</h2>
          </div>
          
          <div className="info-grid-ux">
            <div className="info-item-ux">
              <span className="info-label-ux">Status</span>
              <span className="info-value-ux">{project.status}</span>
            </div>
            <div className="info-item-ux">
              <span className="info-label-ux">Progress</span>
              <span className="info-value-ux">{project.progress}%</span>
            </div>
            <div className="info-item-ux">
              <span className="info-label-ux">Team Size</span>
              <span className="info-value-ux">{project.assignedTo.length}</span>
            </div>
            <div className="info-item-ux">
              <span className="info-label-ux">Deadline</span>
              <span className="info-value-ux">
                {new Date(project.deadline).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="project-actions-ux">
            <button className="primary-action-ux" onClick={onEditProject}>
              <Edit size={16} />
              Edit Project
            </button>
            <button className="secondary-action-ux" onClick={() => onUpdateStatus?.('completed')}>
              <CheckCircle size={16} />
              Mark Complete
            </button>
          </div>
        </div>

        {/* Development Status Chunk */}
        <div className="project-chunk-ux">
          <div className="chunk-header-ux">
            <Settings className="chunk-icon-ux" />
            <h2 className="chunk-title-ux">Development Status</h2>
          </div>
          
          <div className="info-grid-ux">
            <div className="info-item-ux">
              <span className="info-label-ux">Features</span>
              <span className="info-value-ux">{completedFeatures}/{project.features.length}</span>
            </div>
            <div className="info-item-ux">
              <span className="info-label-ux">Tasks</span>
              <span className="info-value-ux">{completedTasks}/{project.tasks.length}</span>
            </div>
            <div className="info-item-ux">
              <span className="info-label-ux">Estimated Hours</span>
              <span className="info-value-ux">{project.estimatedHours}h</span>
            </div>
            <div className="info-item-ux">
              <span className="info-label-ux">Actual Hours</span>
              <span className="info-value-ux">{project.actualHours}h</span>
            </div>
          </div>

          <div className="project-actions-ux">
            <button className="primary-action-ux" onClick={onAddFeature}>
              <Plus size={16} />
              Add Feature
            </button>
            <button className="secondary-action-ux">
              <Eye size={16} />
              View Details
            </button>
          </div>
        </div>

        {/* Team & Communication Chunk */}
        <div className="project-chunk-ux">
          <div className="chunk-header-ux">
            <Users className="chunk-icon-ux" />
            <h2 className="chunk-title-ux">Team & Communication</h2>
          </div>
          
          <div className="info-grid-ux">
            <div className="info-item-ux">
              <span className="info-label-ux">Team Members</span>
              <span className="info-value-ux">{project.assignedTo.length}</span>
            </div>
            <div className="info-item-ux">
              <span className="info-label-ux">Last Updated</span>
              <span className="info-value-ux">2 hours ago</span>
            </div>
          </div>

          <div className="project-actions-ux">
            <button className="primary-action-ux">
              <MessageCircle size={16} />
              Send Message
            </button>
            <button className="secondary-action-ux">
              <Users size={16} />
              Manage Team
            </button>
          </div>
        </div>
      </div>

      {/* Progressive Disclosure - Expandable sections */}
      <div className="expandable-section-ux">
        <div 
          className="expandable-header-ux"
          onClick={() => toggleSection('features')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={20} />
            <span style={{ fontWeight: '600' }}>Features & Tasks</span>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
              ({completedFeatures}/{project.features.length} completed)
            </span>
          </div>
          {expandedSections.has('features') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        <div className={`expandable-content-ux ${expandedSections.has('features') ? 'expanded' : ''}`}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {project.features.map((feature) => (
              <div 
                key={feature.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: feature.completed ? '#f0fdf4' : '#fefefe',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              >
                <CheckCircle 
                  size={16} 
                  color={feature.completed ? '#10b981' : '#9ca3af'} 
                />
                <span style={{ flex: 1 }}>{feature.text}</span>
                <span 
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: feature.priority === 'high' ? '#fef2f2' : 
                               feature.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                    color: feature.priority === 'high' ? '#dc2626' : 
                           feature.priority === 'medium' ? '#d97706' : '#059669'
                  }}
                >
                  {feature.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="expandable-section-ux">
        <div 
          className="expandable-header-ux"
          onClick={() => toggleSection('description')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={20} />
            <span style={{ fontWeight: '600' }}>Project Description</span>
          </div>
          {expandedSections.has('description') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        <div className={`expandable-content-ux ${expandedSections.has('description') ? 'expanded' : ''}`}>
          <p style={{ lineHeight: '1.6', color: '#374151' }}>
            {project.description}
          </p>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1.5rem',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        marginTop: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="secondary-action-ux">
            <Download size={16} />
            Export Report
          </button>
          <button className="secondary-action-ux">
            <Eye size={16} />
            View History
          </button>
        </div>
        
        <button 
          className="secondary-action-ux"
          style={{ 
            background: '#fef2f2', 
            color: '#dc2626', 
            borderColor: '#dc2626' 
          }}
          onClick={onDeleteProject}
        >
          <Trash2 size={16} />
          Delete Project
        </button>
      </div>
    </div>
  );
};

export default UXOptimizedProjectView; 