import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

const TestDataGenerator: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addTestProjects = async () => {
    if (!currentUser?.uid) {
      setMessage('❌ User not authenticated');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const testProjects = [
      {
        name: 'E-commerce Website',
        description: 'A modern e-commerce platform with payment processing and inventory management',
        status: 'in-progress',
        progress: 65,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
        features: [],
        totalTimeEstimate: 120,
        estimatedCost: 9000,
        timeline: '3 months'
      },
      {
        name: 'Mobile App Development',
        description: 'Cross-platform mobile application for iOS and Android',
        status: 'planning',
        progress: 25,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        priority: 'medium',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(),
        features: [],
        totalTimeEstimate: 200,
        estimatedCost: 15000,
        timeline: '4 months'
      },
      {
        name: 'Data Analytics Dashboard',
        description: 'Real-time analytics dashboard with interactive charts and reports',
        status: 'completed',
        progress: 100,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        priority: 'low',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        updatedAt: new Date(),
        features: [],
        totalTimeEstimate: 80,
        estimatedCost: 6000,
        timeline: '2 months'
      }
    ];

    try {
      for (const project of testProjects) {
        await addDoc(collection(db, 'projects'), project);
      }
      setMessage('✅ Test projects added successfully! Refresh the page to see them in the dropdown.');
    } catch (error) {
      console.error('Error adding test projects:', error);
      setMessage('❌ Error adding test projects');
    } finally {
      setIsLoading(false);
    }
  };

  const addTestProjectRequests = async () => {
    if (!currentUser?.uid) {
      setMessage('❌ User not authenticated');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const testRequests = [
      {
        projectName: 'AI Chatbot Integration',
        description: 'I need help integrating an AI chatbot into my customer service system. The chatbot should be able to handle common customer inquiries and escalate complex issues to human agents.',
        features: '',
        requestedBy: currentUser.uid,
        requestedByName: currentUser.displayName || currentUser.email,
        requestedByEmail: currentUser.email,
        status: 'pending',
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectName: 'Inventory Management System',
        description: 'Looking to build a comprehensive inventory management system that can track stock levels, automate reordering, and provide detailed reports.',
        features: '',
        requestedBy: currentUser.uid,
        requestedByName: currentUser.displayName || currentUser.email,
        requestedByEmail: currentUser.email,
        status: 'pending',
        priority: 'medium',
        createdAt: new Date(Date.now() - 43200000), // 12 hours ago
        updatedAt: new Date()
      }
    ];

    try {
      for (const request of testRequests) {
        await addDoc(collection(db, 'user_project_requests'), request);
      }
      setMessage('✅ Test project requests added successfully! Refresh the page to see them in the dropdown.');
    } catch (error) {
      console.error('Error adding test project requests:', error);
      setMessage('❌ Error adding test project requests');
    } finally {
      setIsLoading(false);
    }
  };

  const addAllTestData = async () => {
    if (!currentUser?.uid) {
      setMessage('❌ User not authenticated');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      await addTestProjects();
      await addTestProjectRequests();
      setMessage('✅ All test data added successfully! Refresh the page to see them in the dropdown.');
    } catch (error) {
      console.error('Error adding test data:', error);
      setMessage('❌ Error adding test data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '16px',
      zIndex: 1000,
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#ffffff', fontSize: '14px' }}>
        🧪 Test Data Generator
      </h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={addTestProjects}
          disabled={isLoading}
          style={{
            padding: '8px 12px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          {isLoading ? 'Adding...' : 'Add Test Projects'}
        </button>
        
        <button
          onClick={addTestProjectRequests}
          disabled={isLoading}
          style={{
            padding: '8px 12px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          {isLoading ? 'Adding...' : 'Add Test Requests'}
        </button>
        
        <button
          onClick={addAllTestData}
          disabled={isLoading}
          style={{
            padding: '8px 12px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          {isLoading ? 'Adding...' : 'Add All Test Data'}
        </button>
      </div>
      
      {message && (
        <div style={{
          marginTop: '12px',
          padding: '8px',
          background: message.includes('✅') ? '#10b981' : '#ef4444',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default TestDataGenerator; 