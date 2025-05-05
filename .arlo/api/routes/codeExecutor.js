/**
 * Code Executor Routes
 * API endpoints for code analysis and execution
 */

const express = require("express");
const router = express.Router();
const codeExecutorController = require("../controllers/codeExecutorController");

// Simplified routes - no wildcard paths
router.get("/analyze", codeExecutorController.analyzeCode);
router.post("/analyze", codeExecutorController.analyzeCode);

// File operations - use query parameters instead of path parameters
router.put("/file", codeExecutorController.modifyFile);
router.post("/file", codeExecutorController.createFile);
router.delete("/file", codeExecutorController.deleteFile);

// Run a command
router.post("/command", codeExecutorController.runCommand);

// Git operations
router.post("/git/commit", codeExecutorController.createCommit);
router.post("/git/pull-request", codeExecutorController.createPullRequest);

module.exports = router;
