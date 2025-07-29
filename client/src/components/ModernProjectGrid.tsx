import React from 'react';
import { useStaggeredScrollAnimation } from '../hooks/useScrollAnimation';
import ModernProjectCard from './ModernProjectCard';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'in-progress' | 'completed' | 'paused';
  progress: number;
  deadline?: string;
  teamSize?: number;
  createdAt?: string;
  category?: string;
}

interface ModernProjectGridProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  autoFit?: boolean;
}

const ModernProjectGrid: React.FC<ModernProjectGridProps> = ({
  projects,
  onProjectClick,
  className = '',
  columns = 3,
  autoFit = false
}) => {
  const { containerRef, visibleItems } = useStaggeredScrollAnimation(projects.length);

  const getGridClass = () => {
    if (autoFit) return 'modern-grid-auto-fit';
    return `modern-grid-cols-${columns}`;
  };

  return (
    <div
      ref={containerRef}
      className={`modern-grid ${getGridClass()} ${className}`}
    >
      {projects.map((project, index) => (
        <div
          key={project.id}
          data-index={index}
          className={`modern-animate-on-scroll ${
            visibleItems.has(index) ? 'animate-in' : ''
          }`}
          style={{
            transitionDelay: `${index * 0.1}s`
          }}
        >
          <ModernProjectCard
            project={project}
            onClick={onProjectClick}
          />
        </div>
      ))}
    </div>
  );
};

export default ModernProjectGrid; 