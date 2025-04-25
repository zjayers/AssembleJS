/**
 * A.R.L.O. (AssembleJS Repository Logic Orchestrator)
 * Express server with EJS templating
 */

const express = require('express');
const path = require('path');

// Import API routes and database models
const apiRoutes = require('./api');
const fileDB = require('./api/models/fileDB');
const tasksDB = require('./api/models/tasksDB');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());

// Disable caching for all responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve static files from the static directory
app.use('/static', express.static(path.join(__dirname, 'ui/static')));

// API routes
app.use('/api', apiRoutes);

// Serve index.ejs at the root route using EJS templating
app.get('/', (req, res) => {
  res.render('index');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize databases before starting server
const initDatabases = async () => {
  try {
    // Initialize file database
    await fileDB.initDatabase();
    
    // Initialize tasks database
    await tasksDB.initTasksDB();
    
    console.log('All databases initialized successfully');
    
    // Start the server after database initialization
    app.listen(PORT, () => {
      console.log(`A.R.L.O. Server Running: http://localhost:${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Press Ctrl+C to stop the server`);
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    
    // Start server anyway, but log the error
    app.listen(PORT, () => {
      console.log(`A.R.L.O. Server Running: http://localhost:${PORT}`);
      console.log(`WARNING: Database initialization failed. Some features might not work properly.`);
      console.log(`Press Ctrl+C to stop the server`);
    });
  }
};

// Initialize and start server
initDatabases();