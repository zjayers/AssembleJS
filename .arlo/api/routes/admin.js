/**
 * Admin Routes
 * API routes for admin operations and task management
 */

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Process a new task
router.post("/task", adminController.processTask);

module.exports = router;
