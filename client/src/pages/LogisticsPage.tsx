import React from 'react';
import ExampleNavbar from '../components/ExampleNavbar';
import LogisticsDashboard from '../components/LogisticsDashboard';

const LogisticsPage: React.FC = () => {
  return (
    <>
      <ExampleNavbar />
      <div className="example-page-content" style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        padding: '20px'
      }}>
        <LogisticsDashboard />
      </div>
    </>
  );
};

export default LogisticsPage; 