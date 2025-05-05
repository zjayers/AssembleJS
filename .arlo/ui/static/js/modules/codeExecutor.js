/**
 * Code Executor Module
 * Client-side integration with code execution API
 */

import { trackCodeExecution } from "./tasks.js";

const codeExecutor = (() => {
  // API endpoint base
  const apiBase = "/api/code";

  /**
   * Analyze code in a specific path
   * @param {string} path - Repository path to analyze
   * @param {object} options - Analysis options
   * @return {Promise} Analysis results
   */
  async function analyzeCode(path, options = {}) {
    const url = `${apiBase}/analyze/${encodeURIComponent(path)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });

    const result = await response.json();

    // Track code execution
    if (options.taskId) {
      trackCodeExecution(options.taskId, {
        type: "Analyze",
        path,
        result: result.success ? "success" : "error",
      });
    }

    return result;
  }

  /**
   * Modify an existing file
   * @param {string} path - File path
   * @param {string} content - New file content
   * @param {string} taskId - Associated task ID
   * @return {Promise} Result of operation
   */
  async function modifyFile(path, content, taskId) {
    const url = `${apiBase}/file/${encodeURIComponent(path)}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, taskId }),
    });

    const result = await response.json();

    // Track code execution
    if (taskId) {
      trackCodeExecution(taskId, {
        type: "Modify File",
        path,
        result: result.success ? "success" : "error",
      });
    }

    return result;
  }

  /**
   * Create a new file
   * @param {string} path - File path
   * @param {string} content - File content
   * @param {string} taskId - Associated task ID
   * @return {Promise} Result of operation
   */
  async function createFile(path, content, taskId) {
    const url = `${apiBase}/file/${encodeURIComponent(path)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, taskId }),
    });

    const result = await response.json();

    // Track code execution
    if (taskId) {
      trackCodeExecution(taskId, {
        type: "Create File",
        path,
        result: result.success ? "success" : "error",
      });
    }

    return result;
  }

  /**
   * Delete a file
   * @param {string} path - File path
   * @param {string} taskId - Associated task ID
   * @return {Promise} Result of operation
   */
  async function deleteFile(path, taskId) {
    const url = `${apiBase}/file/${encodeURIComponent(path)}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    });

    const result = await response.json();

    // Track code execution
    if (taskId) {
      trackCodeExecution(taskId, {
        type: "Delete File",
        path,
        result: result.success ? "success" : "error",
      });
    }

    return result;
  }

  /**
   * Run a shell command
   * @param {string} command - Command to execute
   * @param {string} workingDir - Working directory
   * @param {string} taskId - Associated task ID
   * @return {Promise} Command execution results
   */
  async function runCommand(command, workingDir, taskId) {
    const url = `${apiBase}/command`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command, workingDir, taskId }),
    });

    const result = await response.json();

    // Track code execution
    if (taskId) {
      trackCodeExecution(taskId, {
        type: "Command",
        command,
        workingDir,
        result: result.success ? "success" : "error",
      });
    }

    return result;
  }

  /**
   * Create a git commit
   * @param {string} message - Commit message
   * @param {Array} files - Files to include
   * @param {string} taskId - Associated task ID
   * @return {Promise} Commit results
   */
  async function createCommit(message, files, taskId) {
    const url = `${apiBase}/git/commit`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, files, taskId }),
    });

    const result = await response.json();

    // Track code execution
    if (taskId) {
      trackCodeExecution(taskId, {
        type: "Git Commit",
        message,
        files,
        result: result.success ? "success" : "error",
        commit: result.commit,
      });
    }

    return result;
  }

  /**
   * Create a pull request
   * @param {string} title - PR title
   * @param {string} description - PR description
   * @param {string} branch - Source branch
   * @param {string} targetBranch - Target branch
   * @param {string} taskId - Associated task ID
   * @return {Promise} PR creation results
   */
  async function createPullRequest(
    title,
    description,
    branch,
    targetBranch,
    taskId
  ) {
    const url = `${apiBase}/git/pull-request`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        branch,
        targetBranch,
        taskId,
      }),
    });

    const result = await response.json();

    // Track code execution
    if (taskId) {
      trackCodeExecution(taskId, {
        type: "Pull Request",
        title,
        branch,
        targetBranch,
        result: result.success ? "success" : "error",
        url: result.url,
      });
    }

    return result;
  }

  // Public API
  return {
    analyzeCode,
    modifyFile,
    createFile,
    deleteFile,
    runCommand,
    createCommit,
    createPullRequest,
  };
})();

// Export as ES module
export default codeExecutor;
