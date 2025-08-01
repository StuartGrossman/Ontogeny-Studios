import React from 'react';
import { Activity, Calendar, Users, Clock, CheckCircle, Play, Pause } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'in-progress' | 'completed' | 'paused';
  progress: number;
  deadline?: string;
  teamSize?: number;
  assignments?: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    title: string;
    assignedAt: Date;
  }>;
  createdAt?: string;
  category?: string;
}

interface ModernProjectCardProps {
  project: Project;
  onClick?: (project: Project) => void;
  className?: string;
}

const ModernProjectCard: React.FC<ModernProjectCardProps> = ({
  project,
  onClick,
  className = ''
}) => {
  const { elementRef, isVisible } = useScrollAnimation();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'in-progress':
        return <Play size={16} />;
      case 'paused':
        return <Pause size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'modern-badge-success';
      case 'in-progress':
        return 'modern-badge-warning';
      case 'paused':
        return 'modern-badge-error';
      default:
        return 'modern-badge-neutral';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      ref={elementRef}
      className={`modern-card modern-animate-on-scroll ${isVisible ? 'animate-in' : ''} ${className}`}
      onClick={() => onClick?.(project)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Header */}
      <div className="modern-space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="modern-text-xl modern-text-primary modern-font-semibold truncate">
              {project.name}
            </h3>
            {project.category && (
              <p className="modern-text-sm modern-text-secondary mt-1">
                {project.category}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {getStatusIcon(project.status)}
            <span className={`modern-badge ${getStatusBadgeClass(project.status)}`}>
              {project.status.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="modern-text-base modern-text-secondary line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="modern-space-y-2">
          <div className="flex items-center justify-between">
            <span className="modern-text-sm modern-text-secondary">Progress</span>
            <span className="modern-text-sm modern-font-semibold modern-text-primary">
              {project.progress}%
            </span>
          </div>
          <div className="modern-progress">
            <div 
              className="modern-progress-fill"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Meta Information */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="modern-text-tertiary" />
            <span className="modern-text-xs modern-text-secondary">
              {formatDate(project.deadline)}
            </span>
          </div>
          {(project.teamSize || project.assignments?.length) && (
            <div className="flex items-center gap-2">
              <Users size={14} className="modern-text-tertiary" />
              <span className="modern-text-xs modern-text-secondary">
                {project.assignments?.length || project.teamSize || 0} members
              </span>
            </div>
          )}
        </div>

        {/* Created Date */}
        {project.createdAt && (
          <div className="flex items-center gap-2 pt-2 border-t border-border-light">
            <Clock size={14} className="modern-text-tertiary" />
            <span className="modern-text-xs modern-text-tertiary">
              Created {formatDate(project.createdAt)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernProjectCard; 