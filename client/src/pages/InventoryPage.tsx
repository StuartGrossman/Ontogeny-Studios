import React from 'react';
import { useNavigate } from 'react-router-dom';
import InventoryManagementSystem from '../components/InventoryManagementSystem';

const InventoryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/examples')}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '8px 16px',
          cursor: 'pointer',
          zIndex: 1000,
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
          e.currentTarget.style.transform = 'translateY(0px)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        }}
      >
        ← Back to Examples
      </button>

      <InventoryManagementSystem />
    </div>
  );
};

export default InventoryPage; 