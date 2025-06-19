import React from 'react';
import ExampleNavbar from '../components/ExampleNavbar';
import CustomerPortalPlatform from '../components/CustomerPortalPlatform';

const CustomerPortalPage: React.FC = () => {
  return (
    <>
      <ExampleNavbar />
      <div className="example-page-content" style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        padding: '20px'
      }}>
        <CustomerPortalPlatform />
      </div>
    </>
  );
};

export default CustomerPortalPage; 