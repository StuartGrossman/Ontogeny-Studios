// Utility script to add test projects to the database
// Run this in the browser console to add test projects

import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

export const addTestProjects = async (userId) => {
  if (!userId) {
    console.error('User ID is required');
    return;
  }

  const testProjects = [
    {
      name: 'E-commerce Website',
      description: 'A modern e-commerce platform with payment processing and inventory management',
      status: 'in-progress',
      progress: 65,
      userId: userId,
      userEmail: 'test@example.com',
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
      userId: userId,
      userEmail: 'test@example.com',
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
      userId: userId,
      userEmail: 'test@example.com',
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
    console.log('Adding test projects for user:', userId);
    
    for (const project of testProjects) {
      const docRef = await addDoc(collection(db, 'projects'), project);
      console.log('Added project:', project.name, 'with ID:', docRef.id);
    }
    
    console.log('✅ All test projects added successfully!');
    console.log('Refresh the page and check the Projects dropdown to see the new projects.');
    
  } catch (error) {
    console.error('Error adding test projects:', error);
  }
};

// Function to add test project requests
export const addTestProjectRequests = async (userId) => {
  if (!userId) {
    console.error('User ID is required');
    return;
  }

  const testRequests = [
    {
      projectName: 'AI Chatbot Integration',
      description: 'I need help integrating an AI chatbot into my customer service system. The chatbot should be able to handle common customer inquiries and escalate complex issues to human agents.',
      features: '',
      requestedBy: userId,
      requestedByName: 'Test User',
      requestedByEmail: 'test@example.com',
      status: 'pending',
      priority: 'high',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      projectName: 'Inventory Management System',
      description: 'Looking to build a comprehensive inventory management system that can track stock levels, automate reordering, and provide detailed reports.',
      features: '',
      requestedBy: userId,
      requestedByName: 'Test User',
      requestedByEmail: 'test@example.com',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(Date.now() - 43200000), // 12 hours ago
      updatedAt: new Date()
    }
  ];

  try {
    console.log('Adding test project requests for user:', userId);
    
    for (const request of testRequests) {
      const docRef = await addDoc(collection(db, 'user_project_requests'), request);
      console.log('Added project request:', request.projectName, 'with ID:', docRef.id);
    }
    
    console.log('✅ All test project requests added successfully!');
    console.log('Refresh the page and check the Projects dropdown to see the new requests.');
    
  } catch (error) {
    console.error('Error adding test project requests:', error);
  }
};

// Function to run both
export const addAllTestData = async (userId) => {
  await addTestProjects(userId);
  await addTestProjectRequests(userId);
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.addTestProjects = addTestProjects;
  window.addTestProjectRequests = addTestProjectRequests;
  window.addAllTestData = addAllTestData;
} 