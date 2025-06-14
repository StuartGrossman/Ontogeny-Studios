import React, { useState } from 'react';
import './ResourcePage.css';

interface ResourcePageProps {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}

const ResourcePage: React.FC<ResourcePageProps> = ({
  isOpen,
  isMinimized,
  isMaximized,
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'tutorials' | 'tools'>('articles');

  if (!isOpen) return null;

  const resources = {
    articles: [
      {
        title: 'Getting Started with Mobile App Development',
        description: 'A comprehensive guide to mobile app development best practices',
        date: '2024-03-20',
        readTime: '10 min read',
      },
      {
        title: 'Optimizing App Performance',
        description: 'Tips and tricks for improving your mobile app\'s performance',
        date: '2024-03-18',
        readTime: '8 min read',
      },
      {
        title: 'UI/UX Design Principles',
        description: 'Essential design principles for creating user-friendly mobile apps',
        date: '2024-03-15',
        readTime: '12 min read',
      },
    ],
    tutorials: [
      {
        title: 'Building Your First React Native App',
        description: 'Step-by-step tutorial for creating a React Native application',
        date: '2024-03-19',
        difficulty: 'Beginner',
      },
      {
        title: 'Advanced State Management',
        description: 'Learn about Redux and other state management solutions',
        date: '2024-03-17',
        difficulty: 'Advanced',
      },
      {
        title: 'Testing Mobile Applications',
        description: 'Comprehensive guide to mobile app testing strategies',
        date: '2024-03-14',
        difficulty: 'Intermediate',
      },
    ],
    tools: [
      {
        name: 'App Performance Monitor',
        description: 'Real-time monitoring tool for app performance metrics',
        category: 'Monitoring',
      },
      {
        name: 'UI Component Library',
        description: 'Collection of reusable UI components for mobile apps',
        category: 'Development',
      },
      {
        name: 'Code Quality Analyzer',
        description: 'Tool for analyzing and improving code quality',
        category: 'Quality Assurance',
      },
    ],
  };

  return (
    <div className={`resource-window ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}>
      <div className="window-header">
        <div className="window-title">
          <span className="title-icon">📚</span>
          Resources
        </div>
        <div className="window-controls">
          <button onClick={onMinimize} className="control-button minimize">─</button>
          <button onClick={onMaximize} className="control-button maximize">□</button>
          <button onClick={onClose} className="control-button close">×</button>
        </div>
      </div>
      <div className="window-content">
        <div className="resource-tabs">
          <button
            className={`tab-button ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            Articles
          </button>
          <button
            className={`tab-button ${activeTab === 'tutorials' ? 'active' : ''}`}
            onClick={() => setActiveTab('tutorials')}
          >
            Tutorials
          </button>
          <button
            className={`tab-button ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('tools')}
          >
            Tools
          </button>
        </div>
        <div className="resource-content">
          {activeTab === 'articles' && (
            <div className="articles-list">
              {resources.articles.map((article, index) => (
                <div key={index} className="resource-item">
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <div className="resource-meta">
                    <span>{article.date}</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'tutorials' && (
            <div className="tutorials-list">
              {resources.tutorials.map((tutorial, index) => (
                <div key={index} className="resource-item">
                  <h3>{tutorial.title}</h3>
                  <p>{tutorial.description}</p>
                  <div className="resource-meta">
                    <span>{tutorial.date}</span>
                    <span className={`difficulty ${tutorial.difficulty.toLowerCase()}`}>
                      {tutorial.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'tools' && (
            <div className="tools-list">
              {resources.tools.map((tool, index) => (
                <div key={index} className="resource-item">
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                  <div className="resource-meta">
                    <span className="category">{tool.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcePage; 