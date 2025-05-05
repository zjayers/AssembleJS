/**
 * Code Executor Controller
 * Handles API endpoints for code analysis and execution
 */

const codeExecutor = require("../models/codeExecutor");
const fileDB = require("../models/fileDB");
const tasksDB = require("../models/tasksDB");

/**
 * Analyze code in repository
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const analyzeCode = async (req, res) => {
  try {
    // Extract path from query parameter
    const path = req.query.path || (req.body && req.body.path);
    const options = req.body || {};

    if (!path) {
      return res.status(400).json({
        success: false,
        message:
          "Path parameter is required as a query parameter or in request body",
      });
    }

    // Validate path to prevent directory traversal
    if (path.includes("..") || path.startsWith("/") || path.startsWith("~")) {
      return res.status(400).json({
        success: false,
        message: "Invalid path",
      });
    }

    const result = await codeExecutor.analyzeCode(path, options);

    // Store analysis in appropriate agent's knowledge base
    if (req.query.agent) {
      const agent = req.query.agent;

      // Store analysis summary as knowledge
      await fileDB.addAgentKnowledge(agent, {
        document: `## Code Analysis: ${path}\n\n${JSON.stringify(
          result,
          null,
          2
        )}`,
        metadata: {
          title: `Analysis of ${path}`,
          type: "code_analysis",
          path: path,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error analyzing code:", error);
    res.status(500).json({
      success: false,
      message: "Error analyzing code",
      error: error.message,
    });
  }
};

/**
 * Modify a file in the repository
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const modifyFile = async (req, res) => {
  try {
    // Extract parameters
    const path = req.query.path || (req.body && req.body.path);
    const { oldContent, newContent, taskId, agentName } = req.body;

    if (!path || !oldContent || !newContent) {
      return res.status(400).json({
        success: false,
        message: "Path, oldContent, and newContent are required",
      });
    }

    // Validate path to prevent directory traversal
    if (path.includes("..") || path.startsWith("/") || path.startsWith("~")) {
      return res.status(400).json({
        success: false,
        message: "Invalid path",
      });
    }

    // Add log entry if taskId is provided
    if (taskId) {
      await tasksDB.addTaskLog(taskId, `Modifying file: ${path}`);
    }

    const result = await codeExecutor.modifyFile(path, oldContent, newContent);

    // Update task log
    if (taskId) {
      if (result.success) {
        await tasksDB.addTaskLog(taskId, `Successfully modified file: ${path}`);
      } else {
        await tasksDB.addTaskLog(
          taskId,
          `Failed to modify file: ${path} - ${result.message}`
        );
      }
    }

    // Store change in agent's knowledge if specified
    if (result.success && agentName) {
      await fileDB.addAgentKnowledge(agentName, {
        document: `## File Modification: ${path}\n\nReplaced:\n\`\`\`\n${oldContent}\n\`\`\`\n\nWith:\n\`\`\`\n${newContent}\n\`\`\``,
        metadata: {
          title: `Modified ${path}`,
          type: "code_change",
          path: path,
          taskId: taskId,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error modifying file:", error);
    res.status(500).json({
      success: false,
      message: "Error modifying file",
      error: error.message,
      changesMade: false,
    });
  }
};

/**
 * Create a new file in the repository
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createFile = async (req, res) => {
  try {
    // Extract parameters
    const path = req.query.path || (req.body && req.body.path);
    const { content, taskId, agentName } = req.body;

    if (!path || content === undefined) {
      return res.status(400).json({
        success: false,
        message: "Path and content are required",
        changesMade: false,
      });
    }

    // Validate path to prevent directory traversal
    if (path.includes("..") || path.startsWith("/") || path.startsWith("~")) {
      return res.status(400).json({
        success: false,
        message: "Invalid path",
        changesMade: false,
      });
    }

    // Add log entry if taskId is provided
    if (taskId) {
      await tasksDB.addTaskLog(taskId, `Creating file: ${path}`);
    }

    const result = await codeExecutor.createFile(path, content);

    // Update task log
    if (taskId) {
      if (result.success) {
        await tasksDB.addTaskLog(taskId, `Successfully created file: ${path}`);
      } else {
        await tasksDB.addTaskLog(
          taskId,
          `Failed to create file: ${path} - ${result.message}`
        );
      }
    }

    // Store change in agent's knowledge if specified
    if (result.success && agentName) {
      await fileDB.addAgentKnowledge(agentName, {
        document: `## File Creation: ${path}\n\nContent:\n\`\`\`\n${content}\n\`\`\``,
        metadata: {
          title: `Created ${path}`,
          type: "code_change",
          path: path,
          taskId: taskId,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error creating file:", error);
    res.status(500).json({
      success: false,
      message: "Error creating file",
      error: error.message,
      changesMade: false,
    });
  }
};

/**
 * Delete a file from the repository
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteFile = async (req, res) => {
  try {
    // Extract parameters
    const path = req.query.path || (req.body && req.body.path);
    const { taskId, agentName } = req.body;

    if (!path) {
      return res.status(400).json({
        success: false,
        message: "Path is required",
        changesMade: false,
      });
    }

    // Validate path to prevent directory traversal
    if (path.includes("..") || path.startsWith("/") || path.startsWith("~")) {
      return res.status(400).json({
        success: false,
        message: "Invalid path",
        changesMade: false,
      });
    }

    // Add log entry if taskId is provided
    if (taskId) {
      await tasksDB.addTaskLog(taskId, `Deleting file: ${path}`);
    }

    const result = await codeExecutor.deleteFile(path);

    // Update task log
    if (taskId) {
      if (result.success) {
        await tasksDB.addTaskLog(taskId, `Successfully deleted file: ${path}`);
      } else {
        await tasksDB.addTaskLog(
          taskId,
          `Failed to delete file: ${path} - ${result.message}`
        );
      }
    }

    // Store change in agent's knowledge if specified
    if (result.success && agentName) {
      await fileDB.addAgentKnowledge(agentName, {
        document: `## File Deletion: ${path}\n\nThe file was successfully deleted.`,
        metadata: {
          title: `Deleted ${path}`,
          type: "code_change",
          path: path,
          taskId: taskId,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting file",
      error: error.message,
      changesMade: false,
    });
  }
};

/**
 * Run a command in the repository
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const runCommand = async (req, res) => {
  try {
    const { command, options, taskId, agentName } = req.body;

    if (!command) {
      return res.status(400).json({
        success: false,
        message: "Command is required",
      });
    }

    // Add log entry if taskId is provided
    if (taskId) {
      await tasksDB.addTaskLog(taskId, `Running command: ${command}`);
    }

    const result = await codeExecutor.runCommand(command, options || {});

    // Update task log
    if (taskId) {
      if (result.success) {
        await tasksDB.addTaskLog(
          taskId,
          `Command executed successfully: ${command}`
        );
      } else {
        await tasksDB.addTaskLog(
          taskId,
          `Command execution failed: ${command} - ${result.message}`
        );
      }
    }

    // Store result in agent's knowledge if specified
    if (agentName) {
      await fileDB.addAgentKnowledge(agentName, {
        document: `## Command Execution: ${command}\n\nStdout:\n\`\`\`\n${result.stdout}\n\`\`\`\n\nStderr:\n\`\`\`\n${result.stderr}\n\`\`\``,
        metadata: {
          title: `Command: ${command}`,
          type: "command_execution",
          command: command,
          taskId: taskId,
          success: result.success,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error running command:", error);
    res.status(500).json({
      success: false,
      message: "Error running command",
      error: error.message,
      stdout: "",
      stderr: error.message,
    });
  }
};

/**
 * Create a git commit
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createCommit = async (req, res) => {
  try {
    const { message, files, taskId, agentName } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Commit message is required",
        changesMade: false,
      });
    }

    // Add log entry if taskId is provided
    if (taskId) {
      await tasksDB.addTaskLog(taskId, `Creating commit: ${message}`);
    }

    const result = await codeExecutor.createCommit(message, files || []);

    // Update task log
    if (taskId) {
      if (result.success) {
        await tasksDB.addTaskLog(
          taskId,
          `Commit created successfully: ${message}`
        );
      } else {
        await tasksDB.addTaskLog(
          taskId,
          `Failed to create commit: ${message} - ${result.message}`
        );
      }
    }

    // Store result in agent's knowledge if specified
    if (result.success && agentName) {
      await fileDB.addAgentKnowledge(agentName, {
        document: `## Git Commit: ${message}\n\n${result.commitInfo}`,
        metadata: {
          title: `Commit: ${message}`,
          type: "git_operation",
          operation: "commit",
          taskId: taskId,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error creating commit:", error);
    res.status(500).json({
      success: false,
      message: "Error creating commit",
      error: error.message,
      changesMade: false,
    });
  }
};

/**
 * Create a pull request
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createPullRequest = async (req, res) => {
  try {
    const { title, body, baseBranch, headBranch, taskId, agentName } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and body are required",
        changesMade: false,
      });
    }

    // Add log entry if taskId is provided
    if (taskId) {
      await tasksDB.addTaskLog(taskId, `Creating pull request: ${title}`);
    }

    const result = await codeExecutor.createPullRequest(
      title,
      body,
      baseBranch,
      headBranch
    );

    // Update task log
    if (taskId) {
      if (result.success) {
        await tasksDB.addTaskLog(
          taskId,
          `Pull request created successfully: ${title}`
        );

        // Update task status to success
        await tasksDB.updateTaskStatus(
          taskId,
          "success",
          `Task completed successfully. Pull request created: ${result.prInfo.url}`
        );
      } else {
        await tasksDB.addTaskLog(
          taskId,
          `Failed to create pull request: ${title} - ${result.message}`
        );
      }
    }

    // Store result in agent's knowledge if specified
    if (result.success && agentName) {
      await fileDB.addAgentKnowledge(agentName, {
        document: `## Pull Request: ${title}\n\n${body}\n\nPR URL: ${result.prInfo.url}`,
        metadata: {
          title: `PR: ${title}`,
          type: "git_operation",
          operation: "pull_request",
          taskId: taskId,
          url: result.prInfo.url,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error creating pull request:", error);
    res.status(500).json({
      success: false,
      message: "Error creating pull request",
      error: error.message,
      changesMade: false,
    });
  }
};

module.exports = {
  analyzeCode,
  modifyFile,
  createFile,
  deleteFile,
  runCommand,
  createCommit,
  createPullRequest,
};
