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
      console.warn('⚠️ Firebase Admin not initialized, using mock mode');
      return null; // Return null instead of throwing
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

// ===== CLIENT PROJECT ATTRIBUTES ENDPOINTS =====

// Add Feature Request
router.post('/project/:projectId/feature-request', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { featureData, userId } = req.body;
    
    if (!projectId || !featureData || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, featureData, userId'
      });
    }

    const db = getDb();
    
    // If Firebase is not available, return mock success
    if (!db) {
      console.log(`📝 Mock: Feature request for project ${projectId}:`, featureData.featureName || featureData.title);
      return res.json({
        success: true,
        message: 'Feature request added successfully (mock mode - Firebase not configured)',
        featureId: `feature_${Date.now()}_mock`,
        mockMode: true
      });
    }

    const featureRequest = {
      id: `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      title: featureData.featureName || featureData.title || 'New Feature Request',
      description: featureData.description || '',
      requirements: featureData.requirements || [],
      category: featureData.category || 'Feature',
      priority: featureData.priority || 'medium',
      estimatedHours: featureData.estimatedHours || 0,
      requestedBy: userId,
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      adminNotes: '',
      conversationId: featureData.conversationId || null
    };

    // Add to admin_projects sub-collection
    await db.collection('admin_projects').doc(projectId)
      .collection('feature_requests').add(featureRequest);

    console.log(`✅ Feature request added to project ${projectId}`);
    
    res.json({
      success: true,
      message: 'Feature request added successfully',
      featureId: featureRequest.id
    });
    
  } catch (error) {
    console.error('❌ Error adding feature request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add feature request'
    });
  }
});

// Get API Keys for a project
router.get('/project/:projectId/api-keys', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Missing projectId parameter'
      });
    }

    const db = getDb();
    
    // If Firebase is not available, return mock data
    if (!db) {
      console.log(`📝 Mock: Fetching API keys for project ${projectId}`);
      return res.json({
        success: true,
        apiKeys: [
          {
            id: 'mock_api_key_1',
            keyName: 'OpenAI API Key',
            provider: 'OpenAI',
            keyValue: 'sk-mock-key-1234567890abcdef',
            environment: 'production',
            addedAt: new Date(),
            status: 'active'
          }
        ],
        mockMode: true
      });
    }

    // Get API keys from admin_projects sub-collection
    const apiKeysSnapshot = await db.collection('admin_projects').doc(projectId)
      .collection('api_keys').get();

    const apiKeys = [];
    apiKeysSnapshot.forEach(doc => {
      const data = doc.data();
      apiKeys.push({
        id: doc.id,
        keyName: data.keyName,
        provider: data.provider,
        keyValue: data.keyValue,
        environment: data.environment,
        addedAt: data.addedAt,
        status: data.status,
        adminNotes: data.adminNotes
      });
    });

    console.log(`✅ Retrieved ${apiKeys.length} API keys for project ${projectId}`);
    
    res.json({
      success: true,
      apiKeys: apiKeys
    });
    
  } catch (error) {
    console.error('❌ Error fetching API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch API keys'
    });
  }
});

// Get Required API Keys for a project
router.get('/project/:projectId/required-api-keys', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Missing projectId parameter'
      });
    }

    const db = getDb();
    
    // If Firebase is not available, return mock data
    if (!db) {
      console.log(`📝 Mock: Fetching required API keys for project ${projectId}`);
      return res.json({
        success: true,
        requiredApiKeys: [
          {
            id: 'mock_required_api_key_1',
            keyName: 'Stripe API Key',
            provider: 'Stripe',
            description: 'Required for payment processing',
            priority: 'high',
            status: 'pending',
            requestedAt: new Date(),
            requestedBy: 'Admin User'
          }
        ],
        mockMode: true
      });
    }

    // Get required API keys from admin_projects sub-collection
    const requiredApiKeysSnapshot = await db.collection('admin_projects').doc(projectId)
      .collection('required_api_keys').get();

    const requiredApiKeys = [];
    requiredApiKeysSnapshot.forEach(doc => {
      const data = doc.data();
      requiredApiKeys.push({
        id: doc.id,
        keyName: data.keyName,
        provider: data.provider,
        description: data.description,
        priority: data.priority,
        status: data.status,
        requestedAt: data.requestedAt,
        requestedBy: data.requestedBy,
        adminNotes: data.adminNotes
      });
    });

    console.log(`✅ Retrieved ${requiredApiKeys.length} required API keys for project ${projectId}`);
    
    res.json({
      success: true,
      requiredApiKeys: requiredApiKeys
    });
    
  } catch (error) {
    console.error('❌ Error fetching required API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch required API keys'
    });
  }
});

// Add API Key
router.post('/project/:projectId/api-key', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { apiKeyData, userId } = req.body;
    
    if (!projectId || !apiKeyData || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, apiKeyData, userId'
      });
    }

    const db = getDb();
    
    // If Firebase is not available, return mock success
    if (!db) {
      console.log(`📝 Mock: API key for project ${projectId}:`, apiKeyData.name || apiKeyData.keyName);
      return res.json({
        success: true,
        message: 'API key added successfully (mock mode - Firebase not configured)',
        apiKeyId: `api_${Date.now()}_mock`,
        mockMode: true
      });
    }

    const apiKey = {
      id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      provider: apiKeyData.provider || 'custom',
      keyName: apiKeyData.name || apiKeyData.keyName,
      keyValue: apiKeyData.value || apiKeyData.keyValue, // In production, encrypt this
      environment: apiKeyData.environment || 'production',
      addedBy: userId,
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      adminNotes: '',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add to admin_projects sub-collection
    await db.collection('admin_projects').doc(projectId)
      .collection('api_keys').add(apiKey);

    console.log(`✅ API key added to project ${projectId}`);
    
    res.json({
      success: true,
      message: 'API key added successfully',
      apiKeyId: apiKey.id
    });
    
  } catch (error) {
    console.error('❌ Error adding API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add API key'
    });
  }
});

// Add DNS Record
router.post('/project/:projectId/dns-record', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { dnsData, userId } = req.body;
    
    if (!projectId || !dnsData || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, dnsData, userId'
      });
    }

    const db = getDb();
    
    // If Firebase is not available, return mock success
    if (!db) {
      console.log(`📝 Mock: DNS record for project ${projectId}:`, `${dnsData.recordType || dnsData.type} ${dnsData.name} ${dnsData.value}`);
      return res.json({
        success: true,
        message: 'DNS record added successfully (mock mode - Firebase not configured)',
        dnsRecordId: `dns_${Date.now()}_mock`,
        mockMode: true
      });
    }

    const dnsRecord = {
      id: `dns_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      type: dnsData.recordType || dnsData.type,
      name: dnsData.name,
      value: dnsData.value,
      ttl: dnsData.ttl || 3600,
      priority: dnsData.priority || null,
      domain: dnsData.domain,
      addedBy: userId,
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      adminNotes: '',
      lastChecked: null
    };

    // Add to admin_projects sub-collection
    await db.collection('admin_projects').doc(projectId)
      .collection('dns_records').add(dnsRecord);

    console.log(`✅ DNS record added to project ${projectId}`);
    
    res.json({
      success: true,
      message: 'DNS record added successfully',
      dnsRecordId: dnsRecord.id
    });
    
  } catch (error) {
    console.error('❌ Error adding DNS record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add DNS record'
    });
  }
});

// Add UI Design Request
router.post('/project/:projectId/ui-design', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { designData, userId } = req.body;
    
    console.log('📝 UI Design Request received:', { projectId, userId, designData });
    
    if (!designData || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: designData, userId'
      });
    }

    const db = getDb();
    
    // If Firebase is not available, return mock success
    if (!db) {
      console.log(`📝 Mock: UI design request for project ${projectId}`);
      return res.json({
        success: true,
        message: 'UI design request added successfully (mock mode - Firebase not configured)',
        designId: `design_${Date.now()}_mock`,
        mockMode: true
      });
    }

    const uiDesign = {
      id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      targetDevices: designData.targetDevices || ['desktop'],
      stylePreferences: designData.stylePreferences || '',
      uploadedImage: designData.uploadedImage || null,
      imageUrl: designData.imageUrl || null,
      requestType: designData.requestType || 'general',
      addedBy: userId,
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      adminNotes: '',
      adminFeedback: ''
    };

    // Add to admin_projects sub-collection
    await db.collection('admin_projects').doc(projectId)
      .collection('ui_designs').add(uiDesign);

    console.log(`✅ UI design request added to project ${projectId}`);
    
    res.json({
      success: true,
      message: 'UI design request added successfully',
      designId: uiDesign.id
    });
    
  } catch (error) {
    console.error('❌ Error adding UI design request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add UI design request'
    });
  }
});

// Get all project attributes (for management view)
router.get('/project/:projectId/attributes', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Missing projectId parameter'
      });
    }

    const projectRef = getDb().collection('admin_projects').doc(projectId);
    
    // Get all sub-collections in parallel
    const [
      featureRequests,
      apiKeys,
      dnsRecords,
      uiDesigns,
      requiredAPIKeys,
      requiredDNSRecords
    ] = await Promise.all([
      projectRef.collection('feature_requests').orderBy('requestedAt', 'desc').get(),
      projectRef.collection('api_keys').orderBy('addedAt', 'desc').get(),
      projectRef.collection('dns_records').orderBy('addedAt', 'desc').get(),
      projectRef.collection('ui_designs').orderBy('addedAt', 'desc').get(),
      projectRef.collection('required_api_keys').orderBy('requestedAt', 'desc').get(),
      projectRef.collection('required_dns_records').orderBy('requestedAt', 'desc').get()
    ]);

    const attributes = {
      featureRequests: featureRequests.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      apiKeys: apiKeys.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      dnsRecords: dnsRecords.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      uiDesigns: uiDesigns.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      requiredAPIKeys: requiredAPIKeys.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      requiredDNSRecords: requiredDNSRecords.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };

    console.log(`✅ Retrieved attributes for project ${projectId}:`, {
      features: attributes.featureRequests.length,
      apiKeys: attributes.apiKeys.length,
      dnsRecords: attributes.dnsRecords.length,
      uiDesigns: attributes.uiDesigns.length,
      requiredAPIKeys: attributes.requiredAPIKeys.length,
      requiredDNSRecords: attributes.requiredDNSRecords.length
    });
    
    res.json({
      success: true,
      attributes
    });
    
  } catch (error) {
    console.error('❌ Error getting project attributes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get project attributes'
    });
  }
});

// Add required API key request
router.post('/project/:projectId/required-api-key', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { requiredAPIKeyData, adminUserId } = req.body;
    
    if (!projectId || !requiredAPIKeyData) {
      return res.status(400).json({
        success: false,
        error: 'Project ID and required API key data are required'
      });
    }

    const db = getDb();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not available'
      });
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    const requiredAPIKeyDoc = {
      keyName: requiredAPIKeyData.keyName,
      provider: requiredAPIKeyData.provider,
      description: requiredAPIKeyData.description,
      priority: requiredAPIKeyData.priority,
      status: 'pending',
      requestedBy: adminUserId || 'admin',
      requestedAt: timestamp,
      adminNotes: requiredAPIKeyData.adminNotes || '',
      createdAt: timestamp,
      lastUpdated: timestamp
    };

    // Add to required_api_keys subcollection
    const docRef = await db.collection('admin_projects').doc(projectId)
      .collection('required_api_keys').add(requiredAPIKeyDoc);

    console.log(`✅ Required API key request created: ${docRef.id} for project ${projectId}`);

    res.json({
      success: true,
      message: 'Required API key request created successfully',
      requiredAPIKeyId: docRef.id
    });

  } catch (error) {
    console.error('❌ Error creating required API key request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create required API key request'
    });
  }
});

// Add required DNS record request
router.post('/project/:projectId/required-dns-record', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { requiredDNSData, adminUserId } = req.body;
    
    if (!projectId || !requiredDNSData) {
      return res.status(400).json({
        success: false,
        error: 'Project ID and required DNS data are required'
      });
    }

    const db = getDb();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not available'
      });
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    const requiredDNSDoc = {
      recordName: requiredDNSData.recordName,
      recordType: requiredDNSData.recordType,
      description: requiredDNSData.description,
      priority: requiredDNSData.priority,
      status: 'pending',
      requestedBy: adminUserId || 'admin',
      requestedAt: timestamp,
      adminNotes: requiredDNSData.adminNotes || '',
      createdAt: timestamp,
      lastUpdated: timestamp
    };

    // Add to required_dns_records subcollection
    const docRef = await db.collection('admin_projects').doc(projectId)
      .collection('required_dns_records').add(requiredDNSDoc);

    console.log(`✅ Required DNS record request created: ${docRef.id} for project ${projectId}`);

    res.json({
      success: true,
      message: 'Required DNS record request created successfully',
      requiredDNSId: docRef.id
    });

  } catch (error) {
    console.error('❌ Error creating required DNS record request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create required DNS record request'
    });
  }
});

// Update attribute status (admin only)
router.patch('/project/:projectId/:attributeType/:attributeId/status', async (req, res) => {
  try {
    const { projectId, attributeType, attributeId } = req.params;
    const { status, adminNotes, adminUserId } = req.body;
    
    if (!projectId || !attributeType || !attributeId || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, attributeType, attributeId, status'
      });
    }

    const validTypes = ['feature_requests', 'api_keys', 'dns_records', 'ui_designs', 'required_api_keys', 'required_dns_records'];
    if (!validTypes.includes(attributeType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid attributeType. Must be one of: ' + validTypes.join(', ')
      });
    }

    const updateData = {
      status,
      adminNotes: adminNotes || '',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      ...(adminUserId && { updatedBy: adminUserId })
    };

    // Update the specific attribute
    await getDb().collection('admin_projects').doc(projectId)
      .collection(attributeType).doc(attributeId).update(updateData);

    console.log(`✅ Updated ${attributeType} status for project ${projectId}`);
    
    res.json({
      success: true,
      message: 'Attribute status updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating attribute status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update attribute status'
    });
  }
});

module.exports = router; 