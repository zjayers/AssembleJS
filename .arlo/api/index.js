/**
 * API Entry Point
 * Configures and exports all API routes
 */

const express = require('express');
const router = express.Router();

// Import route modules
const collectionsRoutes = require('./routes/collections');
const agentRoutes = require('./routes/agent');
const adminRoutes = require('./routes/admin');
const tasksRoutes = require('./routes/tasks');

// API Routes
router.use('/collections', collectionsRoutes);
router.use('/agent', agentRoutes);
router.use('/admin', adminRoutes);
router.use('/tasks', tasksRoutes);

// API status endpoint
router.get('/status', (req, res) => {
  res.json({ status: 'ok', message: 'ARLO API is running' });
});

module.exports = router;