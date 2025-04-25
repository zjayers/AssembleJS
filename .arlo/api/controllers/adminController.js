/**
 * Admin Controller
 * Handles tasks and admin-specific operations
 */

const tasksController = require('./tasksController');

// Process a new task - delegates to the tasks controller
const processTask = (req, res) => {
  return tasksController.createTask(req, res);
};

module.exports = {
  processTask
};