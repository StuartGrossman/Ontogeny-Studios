import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';

const DebugInfo: React.FC = () => {
  const { currentUser } = useAuth();
  const dashboardData = useDashboardData(currentUser);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <h4>Debug Info</h4>
      <p><strong>User Authenticated:</strong> {currentUser ? '✅ Yes' : '❌ No'}</p>
      <p><strong>User ID:</strong> {currentUser?.uid || 'None'}</p>
      <p><strong>User Email:</strong> {currentUser?.email || 'None'}</p>
      <p><strong>Display Name:</strong> {currentUser?.displayName || 'None'}</p>
      
      <hr style={{ margin: '10px 0', borderColor: '#666' }} />
      
      <h5>Dashboard Data</h5>
      <p><strong>Loading:</strong> {dashboardData.loading ? '⏳ Yes' : '✅ No'}</p>
      <p><strong>Is Admin:</strong> {dashboardData.isAdmin ? '👑 Yes' : '👤 No'}</p>
      <p><strong>Customer Projects Loading:</strong> {dashboardData.customerProjectsLoading ? '⏳ Yes' : '✅ No'}</p>
      <p><strong>Customer Projects Count:</strong> {dashboardData.customerProjects?.length || 0}</p>
      <p><strong>Requested Projects Count:</strong> {dashboardData.requestedProjects?.length || 0}</p>
      
      {dashboardData.customerProjects?.length > 0 && (
        <div>
          <h6>Projects:</h6>
          {dashboardData.customerProjects.slice(0, 3).map((project, index) => (
            <p key={index} style={{ fontSize: '10px' }}>
              {index + 1}. {project.name || project.projectName || 'Unnamed'} ({project.status})
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebugInfo; 