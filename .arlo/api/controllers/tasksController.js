/**
 * Tasks Controller
 * Handles task creation, retrieval, and updates
 */

const tasksDB = require('../models/tasksDB');

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await tasksDB.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving tasks',
      error: error.message
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
        message: `Task with ID ${id} not found`
      });
    }
    
    res.json(task);
  } catch (error) {
    console.error(`Error getting task ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving task',
      error: error.message
    });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { task_description } = req.body;
    
    if (!task_description) {
      return res.status(400).json({
        success: false,
        message: 'Task description is required'
      });
    }
    
    // Create the task
    const task = await tasksDB.createTask({
      description: task_description
    });
    
    // Start the pipeline simulation
    startTaskPipeline(task.id);
    
    res.json({
      success: true,
      message: 'Task created successfully',
      task_id: task.id,
      response: 'Task received and being processed by the Admin agent.'
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
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
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error(`Error updating task ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
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
        message: 'Log message is required'
      });
    }
    
    const updatedTask = await tasksDB.addTaskLog(id, log);
    
    res.json({
      success: true,
      message: 'Log added successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error(`Error adding log to task ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error adding log to task',
      error: error.message
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
        message: 'Status is required'
      });
    }
    
    const updatedTask = await tasksDB.updateTaskStatus(id, status, response);
    
    res.json({
      success: true,
      message: 'Task status updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error(`Error updating task status ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error updating task status',
      error: error.message
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
        message: 'Search query is required'
      });
    }
    
    const results = await tasksDB.searchTasks(query, limit);
    
    res.json(results);
  } catch (error) {
    console.error('Error searching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching tasks',
      error: error.message
    });
  }
};

// Pipeline simulation
const startTaskPipeline = async (taskId) => {
  // Define a smooth rainbow color spectrum for agents
  const agentColors = {
    'Admin': '#F44336',       // Red
    'Types': '#E91E63',       // Pink
    'Utils': '#9C27B0',       // Purple
    'Validator': '#673AB7',   // Deep Purple
    'Developer': '#3F51B5',   // Indigo
    'Browser': '#2196F3',     // Blue
    'Version': '#03A9F4',     // Light Blue
    'Server': '#00BCD4',      // Cyan
    'Testbed': '#009688',     // Teal
    'Pipeline': '#4CAF50',    // Green
    'Generator': '#8BC34A',   // Light Green
    'Config': '#CDDC39',      // Lime
    'Docs': '#FFEB3B',        // Yellow
    'Git': '#FFC107',         // Amber
    'Analyzer': '#FF9800',    // Orange
    'Bundler': '#FF5722'      // Deep Orange
  };

  const pipelineSteps = [
    { 
      name: 'Admin Analysis', 
      agent: 'Admin',
      color: agentColors.Admin,
      delay: 5000,
      details: 'Analyzing task requirements...',
      knowledge: taskId => `Task Analysis for task ${taskId}:\n\nThis task requires the following agents:\n- Config agent for environment setup\n- Developer agent for code implementation\n- Validator agent for testing\n- Git agent for PR creation`
    },
    { 
      name: 'Planning', 
      agent: 'Config',
      color: agentColors.Config,
      delay: 7000,
      details: 'Determining specialist agents needed',
      knowledge: taskId => `Task Plan for task ${taskId}:\n\n1. Analyze the requirements\n2. Prepare development environment\n3. Implement requested functionality\n4. Test the changes\n5. Create pull request`
    },
    { 
      name: 'Execution', 
      agent: 'Developer',
      color: agentColors.Developer,
      delay: 10000,
      details: 'Code changes by specialist agents',
      knowledge: taskId => `Code implementation notes for task ${taskId}:\n\nImplemented the following changes:\n- Updated UI components\n- Added vector database integration\n- Fixed styling issues\n- Added file upload capabilities`
    },
    { 
      name: 'Validation', 
      agent: 'Validator',
      color: agentColors.Validator,
      delay: 8000,
      details: 'Testing and quality assurance',
      knowledge: taskId => `Test results for task ${taskId}:\n\nAll tests passing:\n- Unit tests: 32 passed\n- Integration tests: 8 passed\n- E2E tests: 3 passed\n\nCode coverage: 94%`
    },
    { 
      name: 'Git Operations', 
      agent: 'Git',
      color: agentColors.Git,
      delay: 6000,
      details: 'Creating PR and code review',
      knowledge: taskId => `Pull request created for task ${taskId}:\n\nPR #123 - Knowledge Base UI and Vector DB Integration\n\nChanges:\n- Added Knowledge Base UI\n- Integrated ChromaDB\n- Added agent-specific collections\n- Improved styling`
    }
  ];

  // Ensure task exists
  const task = await tasksDB.getTaskById(taskId);
  if (!task) {
    console.error(`Cannot start pipeline: Task ${taskId} not found`);
    return;
  }

  // Add pipeline initialized log
  await tasksDB.addTaskLog(taskId, 'Pipeline initialized');
  await tasksDB.addTaskLog(taskId, 'Admin agent analyzing task...');

  // Process each step sequentially
  let currentStep = 0;

  const processStep = async () => {
    if (currentStep >= pipelineSteps.length) {
      // Pipeline complete
      await tasksDB.updateTaskStatus(taskId, 'success', 
        'Task completed successfully! PR created: https://github.com/example/repo/pull/123');
      await tasksDB.addTaskLog(taskId, 'Pipeline completed successfully');
      
      // Add final knowledge to Git agent about task completion
      await fileDB.addAgentKnowledge('Git', {
        document: `Task ${taskId} completed successfully. PR #123 created for "${task.description}". Ready for review.`,
        metadata: {
          type: 'task_completion',
          task_id: taskId,
          timestamp: new Date().toISOString(),
          pr_number: '123'
        }
      });
      
      await tasksDB.addTaskLog(taskId, 'Git agent recorded task completion');
      return;
    }

    const step = pipelineSteps[currentStep];
    
    // Process step (simulated delay)
    setTimeout(async () => {
      // Mark step as completed
      await tasksDB.addTaskLog(taskId, `Completed step: ${step.name}`);
      
      // Add knowledge to agent's collection
      try {
        await fileDB.addAgentKnowledge(step.agent, {
          document: step.knowledge(taskId),
          metadata: {
            type: 'task_knowledge',
            task_id: taskId,
            step: step.name,
            timestamp: new Date().toISOString()
          }
        });
        
        await tasksDB.addTaskLog(taskId, `${step.agent} agent added knowledge to its collection`);
      } catch (error) {
        console.error(`Error adding ${step.agent} agent knowledge:`, error);
        await tasksDB.addTaskLog(taskId, `Error adding ${step.agent} agent knowledge: ${error.message}`);
      }
      
      // Start next step
      currentStep++;
      if (currentStep < pipelineSteps.length) {
        await tasksDB.addTaskLog(taskId, `Starting step: ${pipelineSteps[currentStep].name}`);
        processStep();
      } else {
        // This will complete the pipeline
        processStep();
      }
    }, step.delay);
  };

  // Start the pipeline
  processStep();
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  addTaskLog,
  updateTaskStatus,
  searchTasks
};