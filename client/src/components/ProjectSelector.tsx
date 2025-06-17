import React from 'react';
import '../styles/ProjectSelector.css';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: string;
  features: string[];
  technologies: string[];
  benefits: string[];
  stats: {
    metric: string;
    value: string;
    description: string;
  }[];
  uiMockup: {
    component?: React.FC;
    image?: string;
    description: string;
    highlights: string[];
    mobileImage?: string;
  };
  caseStudy?: {
    title: string;
    description: string;
    results: string[];
    link: string;
  };
}

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: number;
  onProjectSelect: (project: Project) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ 
  projects, 
  selectedProjectId, 
  onProjectSelect 
}) => {
  return (
    <div className="project-selector">
      <div className="project-selector-container">
        <h3 className="selector-title">Select a Project</h3>
        <div className="projects-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`project-thumbnail ${project.id === selectedProjectId ? 'active' : ''}`}
              onClick={() => onProjectSelect(project)}
            >
              <div className="thumbnail-icon">{project.icon}</div>
              <div className="thumbnail-content">
                <h4 className="thumbnail-title">{project.title}</h4>
                <span className="thumbnail-category">{project.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectSelector; 