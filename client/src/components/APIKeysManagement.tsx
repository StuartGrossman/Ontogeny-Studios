import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Copy, Shield, AlertCircle, ExternalLink } from 'lucide-react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/Settings.css';

interface ProjectAPIKey {
  id: string;
  projectId: string;
  projectName: string;
  keyName: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  permissions: string[];
  isActive: boolean;
  provider: string; // e.g., 'OpenAI', 'DeepSeek', 'Google', etc.
}

interface APIKeysManagementProps {
  userId: string;
  userName: string;
  currentUser: any;
}

const APIKeysManagement: React.FC<APIKeysManagementProps> = ({
  userId,
  userName,
  currentUser
}) => {
  const [projectAPIKeys, setProjectAPIKeys] = useState<ProjectAPIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secondaryPassword, setSecondaryPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjectAPIKeys();
    }
  }, [isAuthenticated, userId]);

  const fetchProjectAPIKeys = async () => {
    try {
      setLoading(true);
      
      // Get user's active projects
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', userId),
        where('status', 'in', ['planning', 'in-progress'])
      );
      
      const projectsSnapshot = await getDocs(projectsQuery);
      const allAPIKeys: ProjectAPIKey[] = [];
      
      // Extract API keys from each project
      projectsSnapshot.docs.forEach(doc => {
        const projectData = doc.data();
        const projectId = doc.id;
        const projectName = projectData.name || 'Unnamed Project';
        
        // Check for various API key fields that might exist in projects
        const apiKeyFields = [
          'openaiApiKey',
          'deepseekApiKey',
          'googleApiKey',
          'anthropicApiKey',
          'mistralApiKey',
          'apiKeys' // Generic array of API keys
        ];
        
        apiKeyFields.forEach(field => {
          if (projectData[field]) {
            if (Array.isArray(projectData[field])) {
              // Handle array of API keys
              projectData[field].forEach((keyData: any, index: number) => {
                allAPIKeys.push({
                  id: `${projectId}-${field}-${index}`,
                  projectId,
                  projectName,
                  keyName: keyData.name || `${field} Key ${index + 1}`,
                  key: keyData.key || keyData.value || keyData,
                  createdAt: keyData.createdAt?.toDate() || projectData.createdAt?.toDate() || new Date(),
                  permissions: keyData.permissions || ['read', 'write'],
                  isActive: keyData.isActive !== false,
                  provider: getProviderFromField(field)
                });
              });
            } else {
              // Handle single API key
              allAPIKeys.push({
                id: `${projectId}-${field}`,
                projectId,
                projectName,
                keyName: `${getProviderFromField(field)} API Key`,
                key: typeof projectData[field] === 'object' ? projectData[field].key : projectData[field],
                createdAt: projectData.createdAt?.toDate() || new Date(),
                permissions: ['read', 'write'],
                isActive: true,
                provider: getProviderFromField(field)
              });
            }
          }
        });
      });
      
      setProjectAPIKeys(allAPIKeys);
    } catch (error) {
      console.error('Error fetching project API keys:', error);
      setError('Failed to load project API keys');
    } finally {
      setLoading(false);
    }
  };

  const getProviderFromField = (field: string): string => {
    const providerMap: { [key: string]: string } = {
      'openaiApiKey': 'OpenAI',
      'deepseekApiKey': 'DeepSeek',
      'googleApiKey': 'Google',
      'anthropicApiKey': 'Anthropic',
      'mistralApiKey': 'Mistral',
      'apiKeys': 'Custom'
    };
    return providerMap[field] || 'Unknown';
  };

  const verifySecondaryPassword = async () => {
    try {
      const adminDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        const storedSecondaryPassword = adminData.secondaryPassword;
        
        if (!storedSecondaryPassword) {
          setError('No secondary password set. Please configure one in Settings first.');
          return;
        }

        if (secondaryPassword === storedSecondaryPassword) {
          setIsAuthenticated(true);
          setError('');
        } else {
          setError('Incorrect secondary password');
        }
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      setError('Failed to verify password');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const maskAPIKey = (key: string): string => {
    if (!key) return '••••••••';
    if (key.length <= 8) return '••••••••';
    return `${key.substring(0, 4)}${'•'.repeat(20)}${key.slice(-4)}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="api-keys-auth">
        <div className="auth-container">
          <div className="auth-header">
            <Shield size={48} />
            <h3>Secondary Authentication Required</h3>
            <p>Enter your secondary password to view API keys for {userName}</p>
          </div>
          
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div className="auth-form">
            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                value={secondaryPassword}
                onChange={(e) => setSecondaryPassword(e.target.value)}
                placeholder="Enter secondary password"
                className="password-input"
                onKeyPress={(e) => e.key === 'Enter' && verifySecondaryPassword()}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              className="action-btn primary"
              onClick={verifySecondaryPassword}
              disabled={!secondaryPassword.trim()}
            >
              <Shield size={16} />
              Verify Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="api-keys-management">
      <div className="api-keys-header">
        <div className="header-content">
          <h4>Project API Keys for {userName}</h4>
          <p>View API keys configured in this user's active projects. Keys are managed within individual projects.</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="api-keys-list">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading project API keys...</p>
          </div>
        ) : projectAPIKeys.length > 0 ? (
          <div className="keys-grid">
            {projectAPIKeys.map((apiKey) => (
              <div key={apiKey.id} className="api-key-card project-key">
                <div className="key-header">
                  <div className="key-info">
                    <div className="key-title">
                      <h5>{apiKey.keyName}</h5>
                      <span className="provider-badge">{apiKey.provider}</span>
                    </div>
                    <div className="project-info">
                      <ExternalLink size={14} />
                      <span className="project-name">{apiKey.projectName}</span>
                    </div>
                    <span className="key-date">
                      Added: {apiKey.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="key-actions">
                    <button
                      className="icon-btn"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      title={visibleKeys.has(apiKey.id) ? 'Hide key' : 'Show key'}
                    >
                      {visibleKeys.has(apiKey.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => copyToClipboard(apiKey.key)}
                      title="Copy to clipboard"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="key-value">
                  <code>
                    {visibleKeys.has(apiKey.id) ? apiKey.key : maskAPIKey(apiKey.key)}
                  </code>
                </div>
                
                <div className="key-permissions">
                  <span className="permissions-label">Permissions:</span>
                  {apiKey.permissions.map(permission => (
                    <span key={permission} className="permission-badge">
                      {permission}
                    </span>
                  ))}
                  {apiKey.isActive && (
                    <span className="status-badge active">Active</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Key size={48} />
            <h4>No Project API Keys Found</h4>
            <p>This user doesn't have any API keys configured in their active projects yet.</p>
            <div className="empty-state-help">
              <p>API keys are typically added when:</p>
              <ul>
                <li>Setting up AI integrations in projects</li>
                <li>Configuring external service connections</li>
                <li>Enabling automated workflows</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIKeysManagement; 