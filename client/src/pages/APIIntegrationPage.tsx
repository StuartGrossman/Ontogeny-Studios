import React from 'react';
import ExampleNavbar from '../components/ExampleNavbar';
import APIIntegrationHub from '../components/APIIntegrationHub';

const APIIntegrationPage: React.FC = () => {
  return (
    <>
      <ExampleNavbar />
      <div className="example-page-content" style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        padding: '20px'
      }}>
        <APIIntegrationHub />
      </div>
    </>
  );
};

export default APIIntegrationPage; 