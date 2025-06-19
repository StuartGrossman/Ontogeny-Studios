import React from 'react';
import ExampleNavbar from '../components/ExampleNavbar';
import PayrollDashboard from '../components/PayrollDashboard';

const PayrollPage: React.FC = () => {
  return (
    <>
      <ExampleNavbar />
      <div className="example-page-content" style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        padding: '20px'
      }}>
        <PayrollDashboard />
      </div>
    </>
  );
};

export default PayrollPage; 