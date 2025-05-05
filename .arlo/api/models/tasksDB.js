/**
 * Tasks Database Model
 * File-based storage for tasks with semantic search capabilities
 */

const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fileDB = require("./fileDB");

// Tasks are stored in individual JSON files
const TASKS_DIR = path.join(__dirname, "../../data/tasks");

// Initialize tasks database
const initTasksDB = async () => {
  try {
    // Ensure tasks directory exists
    await fs.mkdir(TASKS_DIR, { recursive: true });

    // Create a tasks collection in the fileDB for search capabilities
    await fileDB.createCollection("tasks");

    console.log("Tasks database initialized");
    return true;
  } catch (error) {
    console.error("Error initializing tasks database:", error);
    throw error;
  }
};

// Create a new task
const createTask = async (taskData) => {
  const taskId = uuidv4();

  const task = {
    id: taskId,
    title:
      taskData.title ||
      taskData.description.substring(0, 60) +
        (taskData.description.length > 60 ? "..." : ""),
    description: taskData.description,
    status: taskData.status || "pending",
    timestamp: new Date().toISOString(),
    response: taskData.response || "",
    logs: taskData.logs || [
      `[${new Date().toLocaleTimeString()}] Task created: ${
        taskData.description
      }`,
    ],
    // Enhanced execution properties
    use_enhanced: taskData.use_enhanced !== undefined ? taskData.use_enhanced : true,
    create_pr: taskData.create_pr || false,
    pr_branch: taskData.pr_branch || null,
    pr_number: taskData.pr_number || null,
    pr_url: taskData.pr_url || null,
    pr_title: taskData.pr_title || null,
    pr_description: taskData.pr_description || null,
  };

  // Save task to individual file
  const taskPath = path.join(TASKS_DIR, `${taskId}.json`);
  await fs.writeFile(taskPath, JSON.stringify(task, null, 2));

  // Also add to the fileDB for searching
  await fileDB.addDocument("tasks", {
    content: JSON.stringify(task),
    metadata: {
      id: task.id,
      title: task.title,
      status: task.status,
      timestamp: task.timestamp,
      type: "task",
    },
  });

  // Also add to the Admin agent's knowledge
  await fileDB.addAgentKnowledge("Admin", {
    document: task.description,
    metadata: {
      task_id: task.id,
      timestamp: task.timestamp,
      status: task.status,
      type: "task",
    },
  });

  return task;
};

// Get all tasks
const getAllTasks = async (limit = 100) => {
  try {
    // Read all files in the tasks directory
    const files = await fs.readdir(TASKS_DIR);
    const tasks = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        try {
          const taskPath = path.join(TASKS_DIR, file);
          const taskData = JSON.parse(await fs.readFile(taskPath, "utf8"));
          tasks.push(taskData);
        } catch (error) {
          console.warn(`Error reading task file ${file}:`, error);
        }
      }
    }

    // Sort by timestamp descending (newest first)
    tasks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Return only the requested number of tasks
    return tasks.slice(0, limit);
  } catch (error) {
    console.error("Error getting tasks:", error);

    // If directory doesn't exist, initialize and return empty array
    if (error.code === "ENOENT") {
      await initTasksDB();
      return [];
    }

    throw error;
  }
};

// Get a task by ID
const getTaskById = async (taskId) => {
  try {
    const taskPath = path.join(TASKS_DIR, `${taskId}.json`);
    const taskData = await fs.readFile(taskPath, "utf8");
    return JSON.parse(taskData);
  } catch (error) {
    console.error(`Error getting task ${taskId}:`, error);

    // If file doesn't exist, return null
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
};

// Update a task
const updateTask = async (taskId, updateData) => {
  // Get the current task
  const task = await getTaskById(taskId);

  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  // Update the task with new data
  const updatedTask = {
    ...task,
    ...updateData,
    id: taskId, // Ensure ID doesn't change
  };

  // Add a log entry if provided
  if (updateData.log) {
    updatedTask.logs = [...task.logs, updateData.log];
  }

  // Save the updated task
  const taskPath = path.join(TASKS_DIR, `${taskId}.json`);
  await fs.writeFile(taskPath, JSON.stringify(updatedTask, null, 2));

  // Update the search index
  await fileDB.addDocument("tasks", {
    content: JSON.stringify(updatedTask),
    metadata: {
      id: updatedTask.id,
      title: updatedTask.title,
      status: updatedTask.status,
      timestamp: updatedTask.timestamp,
      type: "task",
      use_enhanced: updatedTask.use_enhanced,
      create_pr: updatedTask.create_pr,
      has_pr: !!updatedTask.pr_url
    },
  });

  return updatedTask;
};

// Add a log to a task
const addTaskLog = async (taskId, logMessage) => {
  const task = await getTaskById(taskId);

  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  // Add the log message
  const timeStamp = new Date().toLocaleTimeString();
  const formattedLog = `[${timeStamp}] ${logMessage}`;

  return updateTask(taskId, {
    logs: [...task.logs, formattedLog],
  });
};

// Update task status
const updateTaskStatus = async (taskId, status, response = null) => {
  const updates = { status };

  if (response) {
    updates.response = response;
  }

  return updateTask(taskId, updates);
};

// Search tasks
const searchTasks = async (query, limit = 10) => {
  return fileDB.queryCollection("tasks", {
    query,
    limit,
    filters: { type: "task" },
  });
};

module.exports = {
  initTasksDB,
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  addTaskLog,
  updateTaskStatus,
  searchTasks,
};
