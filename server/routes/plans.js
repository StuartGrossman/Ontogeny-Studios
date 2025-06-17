const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Ensure plans directory exists
const PLANS_DIR = path.join(__dirname, '../plans');

async function ensurePlansDirectory() {
  try {
    await fs.access(PLANS_DIR);
  } catch (error) {
    await fs.mkdir(PLANS_DIR, { recursive: true });
  }
}

// Save conversation to plans directory
router.post('/save-conversation', async (req, res) => {
  try {
    await ensurePlansDirectory();
    
    const { conversationId, userId, messages, title, createdAt, updatedAt } = req.body;
    
    if (!conversationId || !userId || !messages) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: conversationId, userId, messages' 
      });
    }
    
    // Create user-specific directory
    const userDir = path.join(PLANS_DIR, userId);
    await fs.mkdir(userDir, { recursive: true });
    
    // Create conversation file
    const conversationFile = path.join(userDir, `${conversationId}.json`);
    
    const conversationData = {
      id: conversationId,
      userId,
      messages,
      title: title || 'Project Planning Session',
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: updatedAt || new Date().toISOString()
    };
    
    await fs.writeFile(conversationFile, JSON.stringify(conversationData, null, 2));
    
    console.log(`Conversation saved: ${conversationFile}`);
    
    res.json({ 
      success: true, 
      message: 'Conversation saved successfully',
      filePath: conversationFile
    });
    
  } catch (error) {
    console.error('Error saving conversation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save conversation' 
    });
  }
});

// Get all conversations for a user
router.get('/conversations/:userId', async (req, res) => {
  try {
    await ensurePlansDirectory();
    
    const { userId } = req.params;
    const userDir = path.join(PLANS_DIR, userId);
    
    try {
      await fs.access(userDir);
    } catch (error) {
      return res.json({ success: true, conversations: [] });
    }
    
    const files = await fs.readdir(userDir);
    const conversations = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(userDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const conversation = JSON.parse(content);
          conversations.push(conversation);
        } catch (error) {
          console.error(`Error reading conversation file ${file}:`, error);
        }
      }
    }
    
    // Sort by updatedAt (newest first)
    conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    res.json({ 
      success: true, 
      conversations 
    });
    
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get conversations' 
    });
  }
});

// Get specific conversation
router.get('/conversation/:userId/:conversationId', async (req, res) => {
  try {
    const { userId, conversationId } = req.params;
    const conversationFile = path.join(PLANS_DIR, userId, `${conversationId}.json`);
    
    try {
      const content = await fs.readFile(conversationFile, 'utf8');
      const conversation = JSON.parse(content);
      
      res.json({ 
        success: true, 
        conversation 
      });
    } catch (error) {
      res.status(404).json({ 
        success: false, 
        error: 'Conversation not found' 
      });
    }
    
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get conversation' 
    });
  }
});

// Update conversation
router.put('/conversation/:userId/:conversationId', async (req, res) => {
  try {
    await ensurePlansDirectory();
    
    const { userId, conversationId } = req.params;
    const { messages, title } = req.body;
    
    const userDir = path.join(PLANS_DIR, userId);
    await fs.mkdir(userDir, { recursive: true });
    
    const conversationFile = path.join(userDir, `${conversationId}.json`);
    
    let existingData = {};
    try {
      const content = await fs.readFile(conversationFile, 'utf8');
      existingData = JSON.parse(content);
    } catch (error) {
      // File doesn't exist, create new
    }
    
    const updatedData = {
      ...existingData,
      messages: messages || existingData.messages,
      title: title || existingData.title,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(conversationFile, JSON.stringify(updatedData, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Conversation updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update conversation' 
    });
  }
});

// Delete conversation
router.delete('/conversation/:userId/:conversationId', async (req, res) => {
  try {
    const { userId, conversationId } = req.params;
    const conversationFile = path.join(PLANS_DIR, userId, `${conversationId}.json`);
    
    try {
      await fs.unlink(conversationFile);
      res.json({ 
        success: true, 
        message: 'Conversation deleted successfully' 
      });
    } catch (error) {
      res.status(404).json({ 
        success: false, 
        error: 'Conversation not found' 
      });
    }
    
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete conversation' 
    });
  }
});

module.exports = router; 