/**
 * Code Executor View
 * Handles UI interactions for code execution panel
 */

const codeExecutorView = (() => {
  // DOM Elements
  let elements = {};

  // Current state
  const state = {
    currentTask: null,
    workingDirectory: "/Users/zachariahayers/development/minimesh",
    modifiedFiles: [],
    editorMode: "create", // 'create' or 'edit'
  };

  /**
   * Initialize the view
   */
  function init() {
    // Cache DOM elements
    cacheElements();

    // Bind event handlers
    bindEvents();

    // Initialize code editor (using CodeMirror or similar)
    initializeCodeEditor();

    // Listen for task selection events
    window.addEventListener("taskSelected", handleTaskSelected);
  }

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements = {
      // Main panels
      codePanel: document.querySelector(".code-execution-panel"),
      editorSection: document.querySelector(".code-editor-section"),
      gitSection: document.querySelector(".git-operations-section"),

      // Path and file inputs
      pathInput: document.getElementById("code-path-input"),
      workingDirDisplay: document.getElementById("working-dir-display"),
      editorFilePath: document.getElementById("editor-file-path"),

      // Buttons
      analyzeBtn: document.getElementById("code-analyzer-btn"),
      commitBtn: document.getElementById("code-commit-btn"),
      prBtn: document.getElementById("code-pr-btn"),
      browsePathBtn: document.getElementById("browse-path-btn"),
      newFileBtn: document.getElementById("new-file-btn"),
      editFileBtn: document.getElementById("edit-file-btn"),
      deleteFileBtn: document.getElementById("delete-file-btn"),
      runCommandBtn: document.getElementById("run-command-btn"),
      saveCodeBtn: document.getElementById("save-code-btn"),
      cancelEditBtn: document.getElementById("cancel-edit-btn"),
      clearOutputBtn: document.getElementById("clear-output-btn"),
      refreshFilesBtn: document.getElementById("refresh-files-btn"),
      submitCommitBtn: document.getElementById("submit-commit-btn"),
      submitPrBtn: document.getElementById("submit-pr-btn"),

      // Inputs
      commandInput: document.getElementById("command-input"),
      commitMessage: document.getElementById("commit-message"),
      prTitle: document.getElementById("pr-title"),
      prDescription: document.getElementById("pr-description"),
      sourceBranch: document.getElementById("source-branch"),
      targetBranch: document.getElementById("target-branch"),

      // Output and lists
      commandOutput: document.getElementById("command-output"),
      commitFileList: document.getElementById("commit-file-list"),

      // Editor
      codeEditor: document.getElementById("code-editor"),
    };
  }

  /**
   * Bind event handlers
   */
  function bindEvents() {
    // Analysis and file operations
    elements.analyzeBtn.addEventListener("click", handleAnalyzeCode);
    elements.browsePathBtn.addEventListener("click", handleBrowsePath);
    elements.newFileBtn.addEventListener("click", () => showEditor("create"));
    elements.editFileBtn.addEventListener("click", handleEditFile);
    elements.deleteFileBtn.addEventListener("click", handleDeleteFile);

    // Command execution
    elements.runCommandBtn.addEventListener("click", handleRunCommand);
    elements.clearOutputBtn.addEventListener("click", clearOutput);

    // Editor actions
    elements.saveCodeBtn.addEventListener("click", handleSaveCode);
    elements.cancelEditBtn.addEventListener("click", hideEditor);

    // Git operations
    elements.commitBtn.addEventListener("click", showGitCommitSection);
    elements.prBtn.addEventListener("click", showPrSection);
    elements.refreshFilesBtn.addEventListener("click", refreshModifiedFiles);
    elements.submitCommitBtn.addEventListener("click", handleCreateCommit);
    elements.submitPrBtn.addEventListener("click", handleCreatePullRequest);
  }

  /**
   * Initialize code editor
   */
  function initializeCodeEditor() {
    // This would initialize CodeMirror or a similar editor
    // For now, we'll just use a simple textarea
    console.log("Code editor initialized");
  }

  /**
   * Handle task selection event
   * @param {CustomEvent} event - Task selection event
   */
  function handleTaskSelected(event) {
    state.currentTask = event.detail.taskId;
    // Update UI based on selected task
    updateTaskContext(event.detail);
  }

  /**
   * Update the UI context based on selected task
   * @param {Object} taskDetails - Selected task details
   */
  function updateTaskContext(taskDetails) {
    // Set working directory if available in task
    if (taskDetails.workingDirectory) {
      state.workingDirectory = taskDetails.workingDirectory;
      elements.workingDirDisplay.textContent = state.workingDirectory;
    }

    // Populate path input if task has a focus path
    if (taskDetails.focusPath) {
      elements.pathInput.value = taskDetails.focusPath;
    }

    // Clear output when switching tasks
    clearOutput();
  }

  /**
   * Handle code analysis request
   */
  async function handleAnalyzeCode() {
    const path = elements.pathInput.value;
    if (!path) {
      appendOutput("Error: Please specify a path to analyze");
      return;
    }

    try {
      appendOutput(`Analyzing code at: ${path}...`);
      const result = await codeExecutor.analyzeCode(path, {
        taskId: state.currentTask,
      });

      appendOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      appendOutput(`Error analyzing code: ${error.message}`);
    }
  }

  /**
   * Handle browse path button click
   */
  function handleBrowsePath() {
    // This would normally show a file browser
    // For now, we'll just run an ls command to show directory contents
    handleRunCommand(null, `ls -la ${state.workingDirectory}`);
  }

  /**
   * Show the editor in create or edit mode
   * @param {string} mode - 'create' or 'edit'
   * @param {string} filePath - File path for edit mode
   * @param {string} content - File content for edit mode
   */
  function showEditor(mode, filePath = "", content = "") {
    state.editorMode = mode;
    elements.editorFilePath.textContent = filePath || "New File";
    elements.codeEditor.value = content;
    elements.editorSection.style.display = "block";

    // If we're creating a new file, set the path input as the directory
    if (mode === "create" && elements.pathInput.value) {
      elements.editorFilePath.textContent = elements.pathInput.value;
    }
  }

  /**
   * Hide the editor
   */
  function hideEditor() {
    elements.editorSection.style.display = "none";
    elements.codeEditor.value = "";
  }

  /**
   * Handle edit file button click
   */
  async function handleEditFile() {
    const filePath = elements.pathInput.value;
    if (!filePath) {
      appendOutput("Error: Please specify a file to edit");
      return;
    }

    try {
      appendOutput(`Loading file: ${filePath}...`);
      // Execute a command to get file contents
      const command = `cat ${filePath}`;
      const result = await codeExecutor.runCommand(
        command,
        state.workingDirectory,
        state.currentTask
      );

      if (result.success) {
        showEditor("edit", filePath, result.output);
      } else {
        appendOutput(`Error loading file: ${result.error}`);
      }
    } catch (error) {
      appendOutput(`Error: ${error.message}`);
    }
  }

  /**
   * Handle delete file button click
   */
  async function handleDeleteFile() {
    const filePath = elements.pathInput.value;
    if (!filePath) {
      appendOutput("Error: Please specify a file to delete");
      return;
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete ${filePath}?`
    );
    if (!confirmDelete) return;

    try {
      appendOutput(`Deleting file: ${filePath}...`);
      const result = await codeExecutor.deleteFile(filePath, state.currentTask);

      if (result.success) {
        appendOutput(`Successfully deleted ${filePath}`);
        refreshModifiedFiles();
      } else {
        appendOutput(`Error deleting file: ${result.error}`);
      }
    } catch (error) {
      appendOutput(`Error: ${error.message}`);
    }
  }

  /**
   * Handle save code button click
   */
  async function handleSaveCode() {
    const content = elements.codeEditor.value;
    let filePath;

    if (state.editorMode === "edit") {
      filePath = elements.editorFilePath.textContent;
    } else {
      // For new files, we need to get the path from input
      filePath = prompt(
        "Enter file path:",
        elements.editorFilePath.textContent
      );
      if (!filePath) return;
    }

    try {
      appendOutput(`Saving file: ${filePath}...`);
      let result;

      if (state.editorMode === "edit") {
        result = await codeExecutor.modifyFile(
          filePath,
          content,
          state.currentTask
        );
      } else {
        result = await codeExecutor.createFile(
          filePath,
          content,
          state.currentTask
        );
      }

      if (result.success) {
        appendOutput(`Successfully saved ${filePath}`);
        hideEditor();
        refreshModifiedFiles();
      } else {
        appendOutput(`Error saving file: ${result.error}`);
      }
    } catch (error) {
      appendOutput(`Error: ${error.message}`);
    }
  }

  /**
   * Handle run command button click
   * @param {Event} event - Click event
   * @param {string} cmd - Optional command to run (overrides input)
   */
  async function handleRunCommand(event, cmd) {
    const command = cmd || elements.commandInput.value;
    if (!command) {
      appendOutput("Error: Please enter a command");
      return;
    }

    try {
      appendOutput(`> ${command}`);
      const result = await codeExecutor.runCommand(
        command,
        state.workingDirectory,
        state.currentTask
      );

      if (result.success) {
        appendOutput(result.output);
      } else {
        appendOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      appendOutput(`Error: ${error.message}`);
    }
  }

  /**
   * Append text to the command output
   * @param {string} text - Text to append
   */
  function appendOutput(text) {
    if (elements.commandOutput.textContent === "No output yet...") {
      elements.commandOutput.textContent = text;
    } else {
      elements.commandOutput.textContent += `\n${text}`;
    }

    // Auto scroll to bottom
    elements.commandOutput.scrollTop = elements.commandOutput.scrollHeight;
  }

  /**
   * Clear command output
   */
  function clearOutput() {
    elements.commandOutput.textContent = "No output yet...";
  }

  /**
   * Show git commit section
   */
  function showGitCommitSection() {
    elements.gitSection.style.display = "block";
    // Hide PR form, show commit form
    document.querySelector(".pr-form").style.display = "none";
    document.querySelector(".commit-form").style.display = "block";
    refreshModifiedFiles();
  }

  /**
   * Show pull request section
   */
  function showPrSection() {
    elements.gitSection.style.display = "block";
    // Hide commit form, show PR form
    document.querySelector(".commit-form").style.display = "none";
    document.querySelector(".pr-form").style.display = "block";

    // Get current branch
    getCurrentBranch();
  }

  /**
   * Get current git branch
   */
  async function getCurrentBranch() {
    try {
      const result = await codeExecutor.runCommand(
        "git branch --show-current",
        state.workingDirectory,
        state.currentTask
      );

      if (result.success) {
        const branch = result.output.trim();
        elements.sourceBranch.value = branch;
      }
    } catch (error) {
      appendOutput(`Error getting current branch: ${error.message}`);
    }
  }

  /**
   * Refresh list of modified files
   */
  async function refreshModifiedFiles() {
    try {
      const result = await codeExecutor.runCommand(
        "git status --porcelain",
        state.workingDirectory,
        state.currentTask
      );

      if (result.success) {
        updateModifiedFilesList(result.output);
      } else {
        appendOutput(`Error getting modified files: ${result.error}`);
      }
    } catch (error) {
      appendOutput(`Error: ${error.message}`);
    }
  }

  /**
   * Update the modified files list in the UI
   * @param {string} gitStatusOutput - Output from git status --porcelain
   */
  function updateModifiedFilesList(gitStatusOutput) {
    const lines = gitStatusOutput.trim().split("\n");
    state.modifiedFiles = [];

    // Clear the list
    elements.commitFileList.innerHTML = "";

    if (!gitStatusOutput.trim()) {
      elements.commitFileList.innerHTML =
        '<li class="text-muted">No modified files</li>';
      return;
    }

    // Parse git status output and create list items
    lines.forEach((line) => {
      if (!line.trim()) return;

      const status = line.substring(0, 2).trim();
      const filePath = line.substring(3).trim();

      state.modifiedFiles.push({ status, path: filePath });

      // Create list item
      const li = document.createElement("li");
      li.className = "file-list-item";

      // Create checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "file-checkbox";
      checkbox.value = filePath;
      checkbox.checked = true;

      // Create label with status indicator
      const label = document.createElement("label");
      let statusClass = "";
      let statusText = "";

      switch (status) {
        case "M":
          statusClass = "modified";
          statusText = "Modified";
          break;
        case "A":
          statusClass = "added";
          statusText = "Added";
          break;
        case "??":
          statusClass = "untracked";
          statusText = "New";
          break;
        case "D":
          statusClass = "deleted";
          statusText = "Deleted";
          break;
        default:
          statusClass = "other";
          statusText = status;
      }

      label.innerHTML = `<span class="status-indicator ${statusClass}">${statusText}</span> ${filePath}`;

      // Append checkbox and label to list item
      li.appendChild(checkbox);
      li.appendChild(label);

      // Append list item to list
      elements.commitFileList.appendChild(li);
    });
  }

  /**
   * Handle create commit button click
   */
  async function handleCreateCommit() {
    const message = elements.commitMessage.value;
    if (!message) {
      appendOutput("Error: Please enter a commit message");
      return;
    }

    // Get checked files
    const checkboxes = elements.commitFileList.querySelectorAll(
      ".file-checkbox:checked"
    );
    if (checkboxes.length === 0) {
      appendOutput("Error: Please select at least one file to commit");
      return;
    }

    const files = Array.from(checkboxes).map((checkbox) => checkbox.value);

    try {
      appendOutput(`Creating commit with message: "${message}"`);
      const result = await codeExecutor.createCommit(
        message,
        files,
        state.currentTask
      );

      if (result.success) {
        appendOutput(`Successfully created commit: ${result.commit}`);
        elements.commitMessage.value = "";
        refreshModifiedFiles();
      } else {
        appendOutput(`Error creating commit: ${result.error}`);
      }
    } catch (error) {
      appendOutput(`Error: ${error.message}`);
    }
  }

  /**
   * Handle create pull request button click
   */
  async function handleCreatePullRequest() {
    const title = elements.prTitle.value;
    const description = elements.prDescription.value;
    const sourceBranch = elements.sourceBranch.value;
    const targetBranch = elements.targetBranch.value;

    if (!title || !sourceBranch || !targetBranch) {
      appendOutput("Error: Please fill in all required fields");
      return;
    }

    try {
      appendOutput(`Creating pull request: "${title}"`);
      const result = await codeExecutor.createPullRequest(
        title,
        description,
        sourceBranch,
        targetBranch,
        state.currentTask
      );

      if (result.success) {
        appendOutput(`Successfully created PR: ${result.url}`);
        // Create clickable link
        const linkElement = document.createElement("a");
        linkElement.href = result.url;
        linkElement.textContent = "Open Pull Request";
        linkElement.target = "_blank";
        elements.commandOutput.appendChild(document.createElement("br"));
        elements.commandOutput.appendChild(linkElement);

        // Reset form
        elements.prTitle.value = "";
        elements.prDescription.value = "";
      } else {
        appendOutput(`Error creating PR: ${result.error}`);
      }
    } catch (error) {
      appendOutput(`Error: ${error.message}`);
    }
  }

  // Public API
  return {
    init,
  };
})();

// Initialize module when DOM is ready
document.addEventListener("DOMContentLoaded", codeExecutorView.init);

// Export module if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = codeExecutorView;
}
