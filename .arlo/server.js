/**
 * A.R.L.O. (AssembleJS Repository Logic Orchestrator)
 * Express server with EJS templating
 */

// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const path = require("path");

// Import API routes and database models
const apiRoutes = require("./api");
const fileDB = require("./api/models/fileDB");
const tasksDB = require("./api/models/tasksDB");
const analytics = require("./api/models/analytics");

// Create Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Import error handling middleware
const {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
  errorLoggerMiddleware,
  validateJsonMiddleware,
  timeoutMiddleware,
  finalErrorHandler,
} = require("./api/middleware/errorHandler");

// Request preprocessing middleware
app.use(requestIdMiddleware);
app.use(errorLoggerMiddleware);

// Standard middleware
app.use(express.json());
app.use(validateJsonMiddleware);

// Disable caching for all responses
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Request timeout middleware
app.use(timeoutMiddleware(60000)); // 60 second timeout

// Serve static files from the static directory
app.use("/static", express.static(path.join(__dirname, "ui/static")));

// Serve favicon.ico directly using the SVG favicon
app.get('/favicon.ico', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.sendFile(path.join(__dirname, 'ui/static/favicon.svg'));
});

// API routes
app.use("/api", apiRoutes);

// Serve index.ejs at the root route using EJS templating
app.get("/", (req, res) => {
  res.render("index");
});

// Error handling middleware (applied after routes)
app.use(notFoundHandler); // Handle 404 errors for undefined routes
app.use(errorHandler); // Main error handler
app.use(finalErrorHandler); // Fallback error handler

// Initialize databases and services before starting server
const initDatabases = async () => {
  try {
    // Initialize file database
    await fileDB.initDatabase();

    // Initialize tasks database
    await tasksDB.initTasksDB();

    // Initialize analytics
    await analytics.initialize();

    // Initialize agent configurations
    console.log("Initializing agent configurations...");
    const agentConfig = require("./api/models/agentConfig");
    await agentConfig.initializeAgentConfigs();

    // Initialize task execution service
    const taskExecutionService = require("./api/services/taskExecutionService");
    const executionServiceStatus = await taskExecutionService.initialize();

    if (executionServiceStatus) {
      console.log("Task execution service initialized successfully");
    } else {
      console.warn(
        "Task execution service initialization had warnings, check logs for details"
      );
    }

    // Ensure all agents have system prompt files
    if (taskExecutionService._loadSavedSystemPrompts) {
      console.log("Ensuring all agents have system prompt files...");
      await taskExecutionService._loadSavedSystemPrompts();
    }

    console.log("All databases and services initialized successfully");

    // Start the server after database initialization
    app.listen(PORT, () => {
      console.log(`A.R.L.O. Server Running: http://localhost:${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Press Ctrl+C to stop the server`);
    });
  } catch (error) {
    console.error("Database/service initialization error:", error);

    // Start server anyway, but log the error
    app.listen(PORT, () => {
      console.log(`A.R.L.O. Server Running: http://localhost:${PORT}`);
      console.log(
        `WARNING: Initialization failed. Some features might not work properly.`
      );
      console.log(`Press Ctrl+C to stop the server`);
    });
  }
};

// Initialize and start server
initDatabases();
