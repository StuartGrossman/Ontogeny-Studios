const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const plansRoutes = require('./routes/plans');
const projectsRoutes = require('./routes/projects');

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/plans', plansRoutes);
app.use('/api/projects', projectsRoutes);

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
const server = app.listen(port, () => {
  const actualPort = server.address().port;
  console.log(`Server is running on port ${actualPort}`);
  console.log(`Health check: http://localhost:${actualPort}/api/health`);
}); 