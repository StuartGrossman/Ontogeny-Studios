const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try to initialize with environment variables first (recommended for production)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        })
      });
      console.log('✅ Firebase Admin initialized with environment variables');
    } else {
      // Fallback to service account file (for development)
      try {
        const serviceAccount = require('../config/firebase-admin-sdk.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized with service account file');
      } catch (error) {
        console.error('❌ Firebase Admin initialization failed - no service account file found');
        console.log('Please either:');
        console.log('1. Set environment variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
        console.log('2. Create server/config/firebase-admin-sdk.json with your service account credentials');
        console.log('3. Copy server/config/firebase-admin-template.json to firebase-admin-sdk.json and fill in your credentials');
      }
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
  }
}

// Initialize db after admin is set up
let db = null;

// Helper function to get database instance
function getDb() {
  if (!db) {
    try {
      db = admin.firestore();
    } catch (error) {
      throw new Error('Firebase Admin not properly initialized. Please check your configuration.');
    }
  }
  return db;
}

// Update project request status and handle data migration
router.post('/update-request-status', async (req, res) => {
  try {
    const { projectId, newStatus, currentUser } = req.body;
    
    if (!projectId || !newStatus || !currentUser) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, newStatus, currentUser'
      });
    }

    // Get the original project request
    const projectRef = getDb().collection('user_project_requests').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Project request not found'
      });
    }

    const projectData = projectDoc.data();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    // Update the status of the original request
    await projectRef.update({
      status: newStatus,
      lastUpdated: timestamp,
      ...(newStatus === 'accepted' && {
        acceptedAt: timestamp,
        acceptedBy: currentUser.uid,
        acceptedByName: currentUser.displayName || currentUser.email
      }),
      ...(newStatus === 'in-progress' && {
        startedAt: timestamp,
        startedBy: currentUser.uid,
        startedByName: currentUser.displayName || currentUser.email
      })
    });

    // If status is 'accepted' or 'in-progress', create admin project
    if ((newStatus === 'accepted' || newStatus === 'in-progress') && !projectData.adminProjectId) {
      const adminProjectId = await createAdminProject(projectData, currentUser, projectId);
      
      // Update the original request with admin project ID
      await projectRef.update({
        adminProjectId: adminProjectId
      });

      return res.json({
        success: true,
        message: `Project ${newStatus === 'accepted' ? 'accepted' : 'moved to in-progress'} and admin project created`,
        adminProjectId: adminProjectId
      });
    }

    res.json({
      success: true,
      message: 'Project status updated successfully'
    });

  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update project status'
    });
  }
});

// Create admin project from user request
async function createAdminProject(projectData, currentUser, originalRequestId) {
  try {
    // Parse features from string format
    const features = parseFeatures(projectData.features || '');
    
    const adminProjectData = {
      name: projectData.projectName || projectData.name,
      description: projectData.description,
      assignedTo: [projectData.requestedBy],
      assignedToNames: [projectData.requestedByName || 'Unknown User'],
      createdBy: currentUser.uid,
      createdByName: currentUser.displayName || currentUser.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'in-progress',
      priority: projectData.priority || 'medium',
      progress: 0,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      features: features.map((f, index) => ({
        id: index,
        text: f.text,
        priority: f.priority,
        completed: false,
        startedAt: null,
        completedAt: null,
        workLog: '',
        estimatedHours: getEstimatedHours(f.text, f.priority),
        actualHours: 0
      })),
      tasks: features.map((f, index) => ({
        id: `task_${index}`,
        title: f.text,
        description: `Implement: ${f.text}`,
        completed: false,
        priority: f.priority,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        assignedTo: currentUser.uid,
        assignedToName: currentUser.displayName || currentUser.email
      })),
      originalRequestId: originalRequestId,
      workLogs: [{
        id: `log_${Date.now()}`,
        featureId: -1, // -1 for project-level logs
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        action: 'started',
        description: `Project accepted and development started by ${currentUser.displayName || currentUser.email}`,
        adminId: currentUser.uid,
        adminName: currentUser.displayName || currentUser.email
      }],
      totalEstimatedHours: features.reduce((total, f) => total + getEstimatedHours(f.text, f.priority), 0),
      totalActualHours: 0,
      milestones: generateMilestones(features),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      type: 'user-requested', // Mark as originating from user request
      userId: projectData.requestedBy // For easy querying
    };

    // Add to admin_projects collection
    const adminProjectRef = await getDb().collection('admin_projects').add(adminProjectData);
    
    console.log(`Admin project created: ${adminProjectRef.id} for original request: ${originalRequestId}`);
    
    return adminProjectRef.id;
  } catch (error) {
    console.error('Error creating admin project:', error);
    throw error;
  }
}

// Parse features from string format to array
function parseFeatures(featuresString) {
  if (!featuresString) return [];
  
  const lines = featuresString.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const cleanLine = line.replace(/^[\[\]✓\s]+/, '').trim();
    return {
      text: cleanLine,
      priority: determinePriority(cleanLine),
      completed: line.includes('✓')
    };
  });
}

// Determine feature priority based on text content
function determinePriority(text) {
  const highKeywords = ['critical', 'urgent', 'security', 'payment', 'authentication', 'database'];
  const mediumKeywords = ['dashboard', 'interface', 'user', 'management', 'integration'];
  
  const lowerText = text.toLowerCase();
  
  if (highKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'high';
  } else if (mediumKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'medium';
  } else {
    return 'low';
  }
}

// Calculate estimated hours for a feature
function getEstimatedHours(featureText, priority) {
  const baseHours = {
    high: 8,
    medium: 5,
    low: 3
  };

  const complexityMultiplier = getComplexityMultiplier(featureText);
  return Math.round(baseHours[priority] * complexityMultiplier);
}

// Get complexity multiplier based on feature text
function getComplexityMultiplier(text) {
  const lowerText = text.toLowerCase();
  const complexKeywords = ['integration', 'api', 'database', 'authentication', 'payment', 'real-time', 'advanced'];
  const simpleKeywords = ['button', 'text', 'color', 'layout', 'simple', 'basic'];
  
  if (complexKeywords.some(keyword => lowerText.includes(keyword))) return 1.5;
  if (simpleKeywords.some(keyword => lowerText.includes(keyword))) return 0.7;
  return 1;
}

// Generate project milestones based on features
function generateMilestones(features) {
  const highPriorityFeatures = features.filter(f => f.priority === 'high');
  const mediumPriorityFeatures = features.filter(f => f.priority === 'medium');
  const lowPriorityFeatures = features.filter(f => f.priority === 'low');

  const milestones = [];
  
  if (highPriorityFeatures.length > 0) {
    milestones.push({
      id: 'milestone_1',
      title: 'Core Features Complete',
      description: 'All high-priority features implemented',
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      completed: false,
      features: highPriorityFeatures.map((f, index) => index)
    });
  }

  if (mediumPriorityFeatures.length > 0) {
    milestones.push({
      id: 'milestone_2',
      title: 'Enhanced Features Complete',
      description: 'All medium-priority features implemented',
      targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
      completed: false,
      features: mediumPriorityFeatures.map((f, index) => index + highPriorityFeatures.length)
    });
  }

  if (lowPriorityFeatures.length > 0) {
    milestones.push({
      id: 'milestone_3',
      title: 'Polish & Optimization Complete',
      description: 'All remaining features and optimizations',
      targetDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 4 weeks
      completed: false,
      features: lowPriorityFeatures.map((f, index) => index + highPriorityFeatures.length + mediumPriorityFeatures.length)
    });
  }

  return milestones;
}

// Bulk update multiple project statuses
router.post('/bulk-update-status', async (req, res) => {
  try {
    const { projectIds, newStatus, currentUser } = req.body;
    
    if (!projectIds || !Array.isArray(projectIds) || !newStatus || !currentUser) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectIds (array), newStatus, currentUser'
      });
    }

    const batch = getDb().batch();
    const results = [];
    
    for (const projectId of projectIds) {
      try {
        const projectRef = getDb().collection('user_project_requests').doc(projectId);
        const projectDoc = await projectRef.get();
        
        if (projectDoc.exists) {
          const projectData = projectDoc.data();
          const timestamp = admin.firestore.FieldValue.serverTimestamp();
          
          // Update status
          batch.update(projectRef, {
            status: newStatus,
            lastUpdated: timestamp,
            ...(newStatus === 'accepted' && {
              acceptedAt: timestamp,
              acceptedBy: currentUser.uid,
              acceptedByName: currentUser.displayName || currentUser.email
            }),
            ...(newStatus === 'in-progress' && {
              startedAt: timestamp,
              startedBy: currentUser.uid,
              startedByName: currentUser.displayName || currentUser.email
            })
          });
          
          // Create admin project if needed
          if ((newStatus === 'accepted' || newStatus === 'in-progress') && !projectData.adminProjectId) {
            const adminProjectId = await createAdminProject(projectData, currentUser, projectId);
            batch.update(projectRef, { adminProjectId: adminProjectId });
            results.push({ projectId, adminProjectId, success: true });
          } else {
            results.push({ projectId, success: true });
          }
        } else {
          results.push({ projectId, success: false, error: 'Project not found' });
        }
      } catch (error) {
        console.error(`Error processing project ${projectId}:`, error);
        results.push({ projectId, success: false, error: error.message });
      }
    }
    
    // Commit all updates
    await batch.commit();
    
    res.json({
      success: true,
      message: 'Bulk status update completed',
      results: results
    });

  } catch (error) {
    console.error('Error in bulk status update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update project statuses'
    });
  }
});

// Get admin project by original request ID
router.get('/admin-project/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const adminProjectsSnapshot = await getDb().collection('admin_projects')
      .where('originalRequestId', '==', requestId)
      .limit(1)
      .get();
    
    if (adminProjectsSnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'Admin project not found for this request'
      });
    }
    
    const adminProject = adminProjectsSnapshot.docs[0];
    res.json({
      success: true,
      adminProject: {
        id: adminProject.id,
        ...adminProject.data()
      }
    });
    
  } catch (error) {
    console.error('Error getting admin project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get admin project'
    });
  }
});

module.exports = router; 