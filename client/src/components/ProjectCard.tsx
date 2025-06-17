import React from 'react';

interface ProjectCardProps {
  project: any;
  isActive: boolean;
  selectedView: 'desktop' | 'mobile';
  setSelectedView: (view: 'desktop' | 'mobile') => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isActive, selectedView, setSelectedView }) => {
  return (
    <div className={`project-card${isActive ? ' active' : ''}`}>
      <div className="project-header">
        <div className="project-icon">{project.icon}</div>
        <div className="project-title-section">
          <h2>{project.title}</h2>
          <span className="category">{project.category}</span>
        </div>
      </div>

      <div className="project-content">
        <div className="project-main">
          <p className="project-description">{project.description}</p>

          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={`view-toggle-button${selectedView === 'desktop' ? ' active' : ''}`}
              onClick={() => setSelectedView('desktop')}
            >
              Desktop
            </button>
            <button
              className={`view-toggle-button${selectedView === 'mobile' ? ' active' : ''}`}
              onClick={() => setSelectedView('mobile')}
            >
              Mobile
            </button>
          </div>

          {/* User Interface Section */}
          <div className="ui-mockup-section">
            <div className="ui-mockup-container">
              <div className={`ui-mockup-frame ${selectedView}`}>
                {project.uiMockup.component ? (
                  <project.uiMockup.component view={selectedView} />
                ) : (
                  <img 
                    src={project.uiMockup.image!}
                    alt="UI Mockup"
                    className="ui-mockup-image"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="project-stats">
            {project.stats.map((stat: any, i: number) => (
              <div key={i} className="stat-card">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-metric">{stat.metric}</span>
                <span className="stat-description">{stat.description}</span>
              </div>
            ))}
          </div>

          <details className="details-section" open>
            <summary>Key Benefits</summary>
            <ul className="benefits-list">
              {project.benefits.map((benefit: string, i: number) => (
                <li key={i} className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </details>
        </div>

        <div className="project-details">
          <details className="details-section" open>
            <summary>Core Features</summary>
            <ul className="features-list">
              {project.features.map((feature: string, i: number) => (
                <li key={i} className="feature-item">
                  <span className="feature-icon">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </details>
          
          <details className="details-section" open>
            <summary>Technology Stack</summary>
            <div className="tech-tags">
              {project.technologies.map((tech: string, i: number) => (
                <span key={i} className="tech-tag">{tech}</span>
              ))}
            </div>
          </details>
        </div>

        {project.caseStudy && (
          <div className="case-study-section">
            <div className="case-study-content">
              <h4>{project.caseStudy.title}</h4>
              <p>{project.caseStudy.description}</p>
              <ul className="case-study-results">
                {project.caseStudy.results.map((result: string, i: number) => (
                  <li key={i}>{result}</li>
                ))}
              </ul>
              <a href={project.caseStudy.link} className="case-study-link">
                Read Full Case Study
                <span className="link-icon">→</span>
              </a>
            </div>
          </div>
        )}

        <div className="project-actions">
          <button className="demo-button">
            <span className="button-icon">🎥</span>
            Watch Demo
          </button>
          <button className="learn-more">
            <span className="button-icon">📋</span>
            Request Case Study
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 