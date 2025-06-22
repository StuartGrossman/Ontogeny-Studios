import React, { useState } from 'react';
import { X, FolderPlus, Link, FileText, User, AlertCircle, Plus, GripVertical, Trash2, Settings, Clock, Bot, Sparkles, Send } from 'lucide-react';
import '../../styles/CreateProjectModal.css';
import { analyzeProjectText } from '../../services/aiService';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: ProjectFormData) => void;
  userDisplayName: string;
}

interface Feature {
  id: string;
  text: string;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedHours: number;
}

export interface ProjectFormData {
  name: string;
  link: string;
  description: string;
  features: Feature[];
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userDisplayName
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    link: '',
    description: '',
    features: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [newFeatureText, setNewFeatureText] = useState('');
  const [newFeatureComplexity, setNewFeatureComplexity] = useState<'simple' | 'moderate' | 'complex'>('moderate');
  
  // AI Analysis State
  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getEstimatedHours = (complexity: 'simple' | 'moderate' | 'complex'): number => {
    switch (complexity) {
      case 'simple': return 2;
      case 'moderate': return 8;
      case 'complex': return 24;
      default: return 8;
    }
  };

  const addFeature = () => {
    if (!newFeatureText.trim()) return;
    
    const newFeature: Feature = {
      id: Date.now().toString(),
      text: newFeatureText.trim(),
      complexity: newFeatureComplexity,
      estimatedHours: getEstimatedHours(newFeatureComplexity)
    };

    setFormData(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
    
    setNewFeatureText('');
    setNewFeatureComplexity('moderate');
  };

  const removeFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f.id !== featureId)
    }));
  };

  const getTotalEstimatedHours = () => {
    return formData.features.reduce((total, feature) => total + feature.estimatedHours, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Project description is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        link: '',
        description: '',
        features: []
      });
      setNewFeatureText('');
      setNewFeatureComplexity('moderate');
      setError('');
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleAIAnalysis = async () => {
    if (!aiInput.trim()) return;
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const analysis = await analyzeProjectText(aiInput.trim());
      setAiAnalysisResults(analysis);
      
      // Auto-populate form fields with AI results
      setFormData(prev => ({
        ...prev,
        name: analysis.projectName || prev.name,
        description: analysis.description || prev.description,
        features: [
          ...prev.features,
          ...analysis.features.map(feature => ({
            id: Date.now().toString() + Math.random().toString(),
            text: feature.text,
            complexity: feature.complexity,
            estimatedHours: feature.estimatedHours
          }))
        ]
      }));
      
      // Clear AI input after successful analysis
      setAiInput('');
      
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setError('Failed to analyze project description. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAIResults = () => {
    setAiAnalysisResults(null);
  };

  if (!isOpen) return null;

  return (
    <div className="create-project-modal-overlay" onClick={handleClose}>
      <div className="create-project-modal-container" onClick={e => e.stopPropagation()}>
        <div className="create-project-modal-header">
          <div className="create-project-modal-title">
            <FolderPlus size={24} />
            <h2>Create New Project</h2>
          </div>
          <button 
            className="create-project-modal-close-btn" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="create-project-modal-subtitle">
          <User size={16} />
          <span>Creating project for: <strong>{userDisplayName}</strong></span>
        </div>

        {/* Error Display */}
        {error && (
          <div className="create-project-modal-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="create-project-modal-content">
            {/* AI Assistant Section */}
            <div className="create-project-ai-section">
              <div className="create-project-ai-header">
                <div className="create-project-ai-title">
                  <Bot size={18} />
                  <Sparkles size={16} />
                  AI Project Assistant
                </div>
                <span className="create-project-ai-subtitle">
                  Paste your project description and let AI extract features automatically
                </span>
              </div>

              <div className="create-project-ai-input-container">
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Paste your project description here... AI will analyze it and automatically populate project details and features with 15-minute estimates."
                  className="create-project-ai-textarea"
                  rows={4}
                  disabled={isAnalyzing || isSubmitting}
                />
                <div className="create-project-ai-actions">
                  <button
                    type="button"
                    onClick={handleAIAnalysis}
                    disabled={!aiInput.trim() || isAnalyzing || isSubmitting}
                    className="create-project-ai-analyze-btn"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="create-project-ai-spinner" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Analyze Project
                      </>
                    )}
                  </button>
                  {aiAnalysisResults && (
                    <button
                      type="button"
                      onClick={clearAIResults}
                      className="create-project-ai-clear-btn"
                      disabled={isSubmitting}
                    >
                      Clear Results
                    </button>
                  )}
                </div>
              </div>

              {aiAnalysisResults && (
                <div className="create-project-ai-results">
                  <div className="create-project-ai-results-header">
                    <Sparkles size={16} />
                    <span>AI Analysis Complete</span>
                  </div>
                  <div className="create-project-ai-results-content">
                    <p>✅ Added {aiAnalysisResults.features.length} features with 15-minute estimates</p>
                    <p>✅ {aiAnalysisResults.projectName ? 'Updated project name' : 'Enhanced project description'}</p>
                    <p>🎯 All features optimized for AI-assisted development</p>
                  </div>
                </div>
              )}
            </div>

            {/* Left Column */}
            <div className="create-project-modal-left">
              <div className="create-project-form-group">
                <label htmlFor="name" className="create-project-form-label">
                  <FileText size={16} />
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter project name"
                  className="create-project-form-input"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="create-project-form-group">
                <label htmlFor="link" className="create-project-form-label">
                  <Link size={16} />
                  Project Link
                </label>
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://example.com/project"
                  className="create-project-form-input"
                  disabled={isSubmitting}
                />
              </div>

              <div className="create-project-form-group">
                <label htmlFor="description" className="create-project-form-label">
                  <FileText size={16} />
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the project goals and objectives..."
                  className="create-project-form-textarea"
                  rows={6}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Right Column - Features */}
            <div className="create-project-modal-right">
              <div className="create-project-features-section">
                <div className="create-project-features-header">
                  <div className="create-project-features-title">
                    <Settings size={16} />
                    Key Features & Requirements
                  </div>
                  <div className="create-project-features-count">{formData.features.length}</div>
                </div>

                {/* Add Feature Form */}
                <div className="create-project-add-feature-form">
                  <div className="create-project-feature-input-row">
                    <div className="create-project-feature-input-group">
                      <label className="create-project-feature-input-label">Feature Description</label>
                      <input
                        type="text"
                        value={newFeatureText}
                        onChange={(e) => setNewFeatureText(e.target.value)}
                        placeholder="Enter feature description..."
                        className="create-project-feature-input"
                        disabled={isSubmitting}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                    </div>
                    <div className="create-project-feature-input-group">
                      <label className="create-project-feature-input-label">Time Complexity</label>
                      <select
                        value={newFeatureComplexity}
                        onChange={(e) => setNewFeatureComplexity(e.target.value as 'simple' | 'moderate' | 'complex')}
                        className="create-project-complexity-select"
                        disabled={isSubmitting}
                      >
                        <option value="simple">Simple (2h)</option>
                        <option value="moderate">Moderate (8h)</option>
                        <option value="complex">Complex (24h)</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={addFeature}
                      disabled={!newFeatureText.trim() || isSubmitting}
                      className="create-project-add-feature-btn"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                </div>

                {/* Features List */}
                {formData.features.length > 0 ? (
                  <div className="create-project-features-list">
                    {formData.features.map((feature) => (
                      <div key={feature.id} className="create-project-feature-item">
                        <div className="create-project-feature-grip">
                          <GripVertical size={16} />
                        </div>
                        <div className="create-project-feature-text">{feature.text}</div>
                        <div className={`create-project-feature-complexity ${feature.complexity}`}>
                          {feature.complexity === 'simple' && '⚡ Simple'}
                          {feature.complexity === 'moderate' && '⚙️ Moderate'}
                          {feature.complexity === 'complex' && '🔥 Complex'}
                        </div>
                        <div className="create-project-feature-time">
                          <Clock size={12} />
                          {feature.estimatedHours}h
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFeature(feature.id)}
                          className="create-project-remove-feature-btn"
                          disabled={isSubmitting}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="create-project-empty-features">
                    <div className="create-project-empty-features-icon">
                      <Settings size={32} />
                    </div>
                    <h4>No features added yet</h4>
                    <p>Add project features manually or use AI Assistant above</p>
                  </div>
                )}

                {/* Total Time Estimate */}
                {formData.features.length > 0 && (
                  <div className="create-project-total-estimate">
                    <span>Total Estimated Development Time:</span>
                    <span>{getTotalEstimatedHours()} hours</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="create-project-modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="create-project-btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-project-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal; 