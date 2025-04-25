/**
 * Tasks Routes
 * API routes for task management
 */

const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');

// Get all tasks
router.get('/', tasksController.getAllTasks);

// Get task by ID
router.get('/:id', tasksController.getTaskById);

// Create a new task
router.post('/', tasksController.createTask);

// Update a task
router.put('/:id', tasksController.updateTask);

// Add a log to a task
router.post('/:id/log', tasksController.addTaskLog);

// Update task status
router.post('/:id/status', tasksController.updateTaskStatus);

// Search tasks
router.post('/search', tasksController.searchTasks);

module.exports = router;