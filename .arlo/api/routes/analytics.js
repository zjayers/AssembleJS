/**
 * Analytics Routes
 * API routes for system analytics and reporting
 */
const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

// Get analytics summaries
router.get("/search", analyticsController.getSearchAnalytics);
router.get("/tasks", analyticsController.getTaskAnalytics);
router.get("/agents", analyticsController.getAgentAnalytics);
router.get("/usage", analyticsController.getUsageAnalytics);
router.get("/dashboard", analyticsController.getDashboardAnalytics);

// Track events
router.post("/track/search", analyticsController.trackSearch);
router.post("/track/event", analyticsController.trackEvent);

module.exports = router;
