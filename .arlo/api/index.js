/**
 * API Entry Point
 * Configures and exports all API routes
 */

const express = require("express");
const router = express.Router();

// Import route modules
const collectionsRoutes = require("./routes/collections");
const agentRoutes = require("./routes/agent");
const adminRoutes = require("./routes/admin");
const tasksRoutes = require("./routes/tasks");
const codeExecutorRoutes = require("./routes/codeExecutor");
const knowledgeRoutes = require("./routes/knowledge");
const brainRoutes = require("./routes/brain");
const collaborationRoutes = require("./routes/collaboration");
const searchRoutes = require("./routes/search");
const analyticsRoutes = require("./routes/analytics");
const chatbotRoutes = require("./routes/chatbot");

// Check if we're running in API-only mode for public deployment
// This restricts all internal routes when the server is deployed publicly
const isApiOnlyMode = process.env.API_ONLY_MODE === "true";

// Internal access middleware to block all internal routes in API-only mode
const internalAccessOnly = (req, res, next) => {
  if (isApiOnlyMode) {
    return res.status(403).json({
      success: false,
      error: "This endpoint is disabled in API-only mode",
    });
  }
  next();
};

// Public chatbot API route - always accessible with API key auth
router.use("/chatbot", chatbotRoutes);

// API status endpoint - always accessible
router.get("/status", (req, res) => {
  res.json({
    status: "ok",
    message: "ARLO API is running",
    mode: isApiOnlyMode ? "public-api-only" : "full-access",
  });
});

// Apply internal access restriction to all internal routes in API-only mode
router.use(internalAccessOnly);

// Internal API Routes - only accessible when not in API-only mode
router.use("/collections", collectionsRoutes);
router.use("/agent", agentRoutes);
router.use("/admin", adminRoutes);
router.use("/tasks", tasksRoutes);
router.use("/code", codeExecutorRoutes);
router.use("/knowledge", knowledgeRoutes);
router.use("/brain", brainRoutes);
router.use("/search", searchRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/collaboration", collaborationRoutes);

module.exports = router;
