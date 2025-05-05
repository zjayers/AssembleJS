/**
 * Tasks Routes
 * API routes for task management
 */

const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/tasksController");

// Get all tasks
router.get("/", tasksController.getAllTasks);

// Search tasks - Must come before the :id route to prevent conflicts
router.post("/search", tasksController.searchTasks);

// Get task by ID
router.get("/:id", tasksController.getTaskById);

// Create a new task
router.post("/", tasksController.createTask);

// Update a task
router.put("/:id", tasksController.updateTask);

// Add a log to a task
router.post("/:id/log", tasksController.addTaskLog);

// Update task status
router.post("/:id/status", tasksController.updateTaskStatus);

// Get task execution status (with agent information)
router.get("/:id/execution", tasksController.getTaskExecutionStatus);

// Stream task updates in real-time (Server-Sent Events)
router.get("/:id/stream", tasksController.streamTaskUpdates);

// Get subscriber count for a task
router.get("/:id/subscribers", tasksController.getTaskSubscribers);

module.exports = router;
