/**
 * Tasks Controller
 * Handles task creation, retrieval, and updates
 */

const tasksDB = require("../models/tasksDB");
const fileDB = require("../models/fileDB");
const taskExecutionService = require("../services/taskExecutionService");
const enhancedTaskExecutionService = require("../services/enhancedTaskExecutionService");
const eventService = require("../services/eventService");

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await tasksDB.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error("Error getting tasks:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving tasks",
      error: error.message,
    });
  }
};

// Get a task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await tasksDB.getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${id} not found`,
      });
    }

    res.json(task);
  } catch (error) {
    console.error(`Error getting task ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Error retrieving task",
      error: error.message,
    });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { task_description, task_title, use_enhanced = true, create_pr = false } = req.body;

    if (!task_description) {
      return res.status(400).json({
        success: false,
        message: "Task description is required",
      });
    }

    // Create the task
    const task = await tasksDB.createTask({
      title: task_title || 'Task Implementation',
      description: task_description,
      create_pr: !!create_pr
    });

    // Emit task created event
    eventService.emitTaskUpdate(
      task.id,
      eventService.EVENT_TYPES.TASK_CREATED,
      { task }
    );

    // Choose which service to use based on configuration
    const executionService = use_enhanced ? enhancedTaskExecutionService : taskExecutionService;
    
    // Start the task execution
    executionService.startTaskExecution(task.id).catch((error) => {
      console.error(
        `Error in task execution pipeline for task ${task.id}:`,
        error
      );
      
      // Emit task failed event
      eventService.emitTaskUpdate(
        task.id,
        eventService.EVENT_TYPES.TASK_FAILED,
        { error: error.message }
      );
    });

    res.json({
      success: true,
      message: "Task created successfully",
      task_id: task.id,
      mode: use_enhanced ? "enhanced" : "standard",
      response: `Task received and being processed by the ${use_enhanced ? "Enhanced" : "Standard"} execution pipeline.`,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      success: false,
      message: "Error creating task",
      error: error.message,
    });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedTask = await tasksDB.updateTask(id, updateData);

    res.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(`Error updating task ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Error updating task",
      error: error.message,
    });
  }
};

// Add a log entry to a task
const addTaskLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { log } = req.body;

    if (!log) {
      return res.status(400).json({
        success: false,
        message: "Log message is required",
      });
    }

    const updatedTask = await tasksDB.addTaskLog(id, log);

    // Emit task log added event
    eventService.emitTaskUpdate(
      id,
      eventService.EVENT_TYPES.TASK_LOG_ADDED,
      { task: updatedTask, log }
    );

    res.json({
      success: true,
      message: "Log added successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(`Error adding log to task ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Error adding log to task",
      error: error.message,
    });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const updatedTask = await tasksDB.updateTaskStatus(id, status, response);

    // Emit task status changed event
    eventService.emitTaskUpdate(
      id,
      eventService.EVENT_TYPES.TASK_STATUS_CHANGED,
      { task: updatedTask, status, response }
    );
    
    // If the status is completed or failed, emit the corresponding event
    if (status === 'completed') {
      eventService.emitTaskUpdate(
        id,
        eventService.EVENT_TYPES.TASK_COMPLETED,
        { task: updatedTask }
      );
    } else if (status === 'failed') {
      eventService.emitTaskUpdate(
        id,
        eventService.EVENT_TYPES.TASK_FAILED,
        { task: updatedTask, error: response }
      );
    }

    res.json({
      success: true,
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(`Error updating task status ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Error updating task status",
      error: error.message,
    });
  }
};

// Search tasks
const searchTasks = async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const results = await tasksDB.searchTasks(query, limit);

    res.json(results);
  } catch (error) {
    console.error("Error searching tasks:", error);
    res.status(500).json({
      success: false,
      message: "Error searching tasks",
      error: error.message,
    });
  }
};

// Endpoint to get task execution status
const getTaskExecutionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await tasksDB.getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${id} not found`,
      });
    }

    // Add agent color information for UI display
    const agents = fileDB.agents;
    
    // Get additional execution information for enhanced tasks
    let executionInfo = {};
    let executionService = null;
    
    // Determine which service to use based on task properties
    // If use_enhanced is defined in the task, use that value
    // Otherwise, check if create_pr is set (implies enhanced)
    if (task.use_enhanced !== undefined) {
      executionService = task.use_enhanced ? enhancedTaskExecutionService : taskExecutionService;
    } else if (task.create_pr) {
      executionService = enhancedTaskExecutionService;
    } else {
      executionService = taskExecutionService;
    }
    
    // If task is being executed by the enhanced service, get git info
    if (executionService === enhancedTaskExecutionService) {
      try {
        const gitService = require('../services/gitService');
        if (await gitService.isGitRepository()) {
          executionInfo.git = {
            isRepo: true,
            branch: await gitService.getCurrentBranch(),
            status: await gitService.getStatus()
          };
        } else {
          executionInfo.git = { isRepo: false };
        }
      } catch (gitError) {
        console.warn('Error getting git information:', gitError);
        executionInfo.git = { error: gitError.message };
      }
    }

    res.json({
      success: true,
      task,
      agents: agents.map((agent) => ({
        name: agent,
        color: executionService.getAgentColor(agent),
      })),
      executionMode: executionService === enhancedTaskExecutionService ? 'enhanced' : 'standard',
      executionInfo
    });
  } catch (error) {
    console.error(
      `Error getting task execution status ${req.params.id}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error retrieving task execution status",
      error: error.message,
    });
  }
};

// Stream task updates in real-time using Server-Sent Events (SSE)
const streamTaskUpdates = (req, res) => {
  const { id } = req.params;
  
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  // Send initial connection established event
  res.write(`data: ${JSON.stringify({ event: 'connected', taskId: id })}\n\n`);
  
  // Create event listener
  const handleTaskEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  // Subscribe to task updates
  const unsubscribe = eventService.subscribeToTask(id, handleTaskEvent);
  
  // Handle client disconnect
  req.on('close', () => {
    unsubscribe();
  });
};

// Get subscriber count for a task
const getTaskSubscribers = async (req, res) => {
  const { id } = req.params;
  
  try {
    const count = eventService.getSubscriberCount(id);
    
    res.json({
      success: true,
      taskId: id,
      subscriberCount: count
    });
  } catch (error) {
    console.error(`Error getting subscribers for task ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error getting task subscribers',
      error: error.message
    });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  addTaskLog,
  updateTaskStatus,
  searchTasks,
  getTaskExecutionStatus,
  streamTaskUpdates,
  getTaskSubscribers
};
