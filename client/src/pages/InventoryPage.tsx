import React from 'react';
import ExampleNavbar from '../components/ExampleNavbar';
import InventoryManagementSystem from '../components/InventoryManagementSystem';

const InventoryPage: React.FC = () => {
  return (
    <>
      <ExampleNavbar />
      <div className="example-page-content" style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        padding: '20px'
      }}>
        <InventoryManagementSystem />
      </div>
    </>
  );
};

export default InventoryPage; 