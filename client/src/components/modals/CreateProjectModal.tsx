import { useState } from 'react';
import { CreateProjectModalProps } from '../../types';
import './Modal.css';

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onCreateSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // TODO: Implement actual project creation logic
      // For now, simulate a successful project creation
      onCreateSuccess();
    } catch (err) {
      setError('Failed to create project');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Project Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                <option value="Development">Development</option>
                <option value="AI">AI</option>
                <option value="Analytics">Analytics</option>
                <option value="Research">Research</option>
              </select>
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="modal-actions">
              <button type="submit" className="button button-primary">Create Project</button>
              <button type="button" className="button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal; 