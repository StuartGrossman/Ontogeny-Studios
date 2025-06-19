import React from 'react';
import ExampleNavbar from '../components/ExampleNavbar';
import SchedulingDashboard from '../components/SchedulingDashboard';

const SchedulingPage: React.FC = () => {
  return (
    <>
      <ExampleNavbar />
      <div className="example-page-content" style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        padding: '20px'
      }}>
        <SchedulingDashboard />
      </div>
    </>
  );
};

export default SchedulingPage; 