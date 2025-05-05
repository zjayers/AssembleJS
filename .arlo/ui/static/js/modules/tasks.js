import VectorDB from "./vectordb.js";
import {
  initializePipeline,
  updatePipeline,
  calculatePipelineProgress,
} from "./pipeline.js";

// Task history data
const tasks = [];
let currentTaskId = null;
let taskIdCounter = 1;

// Code execution tracking
const codeExecutions = {};

// Submit a new task
async function submitTask(e) {
  e.preventDefault();

  const taskDescription = document
    .getElementById("task-description")
    .value.trim();
  if (!taskDescription) return;

  // Disable submit button and show loading state
  const submitButton = document.querySelector(
    '#task-form button[type="submit"]'
  );
  const originalButtonText = submitButton.innerText;
  submitButton.disabled = true;
  submitButton.innerHTML = '<div class="spinner"></div> Processing...';

  try {
    const response = await fetch("/api/admin/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task_description: taskDescription }),
    });

    const result = await response.json();

    // Create a new task in history
    const newTask = {
      id: taskIdCounter++,
      title:
        taskDescription.length > 60
          ? taskDescription.substring(0, 60) + "..."
          : taskDescription,
      description: taskDescription,
      status: "pending",
      timestamp: new Date().toISOString(),
      response: result.response,
      logs: [
        `[${new Date().toLocaleTimeString()}] Task submitted: ${taskDescription}`,
      ],
    };

    tasks.unshift(newTask);
    currentTaskId = newTask.id;

    // Store task in Admin agent's knowledge base
    try {
      await VectorDB.addAgentKnowledge("Admin", {
        document: taskDescription,
        metadata: {
          type: "task",
          task_id: newTask.id.toString(),
          timestamp: newTask.timestamp,
          status: newTask.status,
        },
      });
      newTask.logs.push(
        `[${new Date().toLocaleTimeString()}] Task stored in Admin agent knowledge base`
      );
    } catch (knowledgeError) {
      console.error("Error storing task in knowledge base:", knowledgeError);
      newTask.logs.push(
        `[${new Date().toLocaleTimeString()}] Error storing task in knowledge base: ${
          knowledgeError.message
        }`
      );
    }

    // Clear form
    document.getElementById("task-description").value = "";

    // Update UI
    updateTaskHistory();
    showTaskDetails(newTask.id);
    initializePipeline(newTask.id, tasks, currentTaskId);
  } catch (error) {
    console.error("Error submitting task:", error);
    // Show error in details section
    const taskDetails = document.getElementById("task-details-body");
    if (taskDetails) {
      taskDetails.innerHTML = `
                <div class="error-message">
                    <p>There was a problem processing your request: ${error.message}</p>
                </div>
            `;
    }
  } finally {
    // Re-enable submit button
    submitButton.disabled = false;
    submitButton.innerText = originalButtonText;
  }
}

// Update the task history list
function updateTaskHistory() {
  const taskHistoryBody = document.getElementById("task-history-body");

  if (tasks.length === 0) {
    taskHistoryBody.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">No tasks yet. Submit a task to see it here.</div>
            </div>
        `;
    return;
  }

  taskHistoryBody.innerHTML = tasks
    .map(
      (task) => `
        <div class="task-item" data-task-id="${task.id}">
            <div class="task-status">
                <div class="task-status-icon task-status-${task.status}"></div>
            </div>
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    ${new Date(task.timestamp).toLocaleString()} • ${
        task.status
      }
                </div>
            </div>
            <div class="task-actions">
                <button onclick="showTaskDetails(${
                  task.id
                })">View Details</button>
            </div>
        </div>
    `
    )
    .join("");

  // Add click listeners
  document.querySelectorAll(".task-item").forEach((item) => {
    item.addEventListener("click", () => {
      const taskId = parseInt(item.dataset.taskId);
      showTaskDetails(taskId);
    });
  });
}

// Show task details
async function showTaskDetails(taskId) {
  currentTaskId = taskId;
  const task = tasks.find((t) => t.id === taskId);

  if (!task) return;

  // Set current task in the task view
  if (typeof window.setCurrentTask === 'function') {
    window.setCurrentTask(task);
  }

  // Get the latest task execution info from the API
  let executionInfo = {
    agents: [],
    executionMode: 'standard'
  };
  
  try {
    const response = await fetch(`/api/tasks/${taskId}/execution`);
    const data = await response.json();
    
    if (data.success) {
      // Update task with latest information
      if (data.task) {
        Object.assign(task, data.task);
      }
      
      // Get agent information
      if (data.agents) {
        executionInfo.agents = data.agents;
      }
      
      // Get execution mode
      if (data.executionMode) {
        executionInfo.executionMode = data.executionMode;
      }
      
      // Store execution info
      executionInfo = {
        ...executionInfo,
        ...data.executionInfo
      };
    }
  } catch (error) {
    console.error(`Error fetching task execution info for task ${taskId}:`, error);
  }

  const taskDetails = document.getElementById("task-details-body");

  if (taskDetails) {
    // Fill the task details content
    taskDetails.innerHTML = '';
    
    // Create and append main info section
    const taskInfoSection = document.createElement('div');
    taskInfoSection.className = 'task-info-details';
    taskInfoSection.innerHTML = `
      <h3>${task.title}</h3>
      <div class="task-meta">
        Submitted: ${new Date(task.timestamp).toLocaleString()} • 
        Status: <span class="task-status task-status-${task.status}">${task.status}</span>
      </div>
      <p class="task-description-full">
        ${task.description}
      </p>
    `;
    taskDetails.appendChild(taskInfoSection);
    
    // Create and append execution view
    const executionView = document.createElement('div');
    executionView.className = 'task-execution';
    taskDetails.appendChild(executionView);
    
    // Render the execution view using the task view module
    if (typeof window.renderTaskExecution === 'function') {
      window.renderTaskExecution(task, executionInfo.agents, executionInfo.executionMode);
    } else {
      // Fallback to basic pipeline view if task view module not available
      executionView.innerHTML = `
        <div class="pipeline-view" id="pipeline-view">
          <h4>Pipeline Status</h4>
          <div class="pipeline-progress">
            <div class="pipeline-progress-bar" style="width: ${calculatePipelineProgress(task)}%"></div>
          </div>
          <div class="pipeline-steps" id="pipeline-steps">
            <!-- Pipeline steps will be populated here -->
          </div>
        </div>
      `;
    }
    
    // Add git info if available in enhanced mode
    if (executionInfo.git && executionInfo.git.isRepo) {
      const gitSection = document.createElement('div');
      gitSection.className = 'git-info-section';
      gitSection.innerHTML = `
        <h4>Git Status</h4>
        <div class="git-status-info">
          <div class="git-branch">Current branch: <strong>${executionInfo.git.branch || 'unknown'}</strong></div>
          ${executionInfo.git.status ? `
            <div class="git-status-details">
              <div>Modified files: ${executionInfo.git.status.modified?.length || 0}</div>
              <div>Staged files: ${executionInfo.git.status.staged?.length || 0}</div>
            </div>
          ` : ''}
        </div>
      `;
      taskDetails.appendChild(gitSection);
    }
    
    // Add PR info if available
    if (task.pr_url) {
      const prSection = document.createElement('div');
      prSection.className = 'pr-info-section';
      prSection.innerHTML = `
        <h4>Pull Request</h4>
        <div class="pr-info">
          <div class="pr-title">${task.pr_title || 'PR created'}</div>
          <div class="pr-url">
            <a href="${task.pr_url}" target="_blank" rel="noopener noreferrer">
              #${task.pr_number} - View on GitHub
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      `;
      taskDetails.appendChild(prSection);
    }
    
    // Create and append response section
    const responseSection = document.createElement('div');
    responseSection.innerHTML = `
      <h4>Response</h4>
      <div class="task-response">
        <p>${task.response || "Processing..."}</p>
      </div>
    `;
    taskDetails.appendChild(responseSection);
    
    // Create and append logs section
    const logsSection = document.createElement('div');
    logsSection.innerHTML = `
      <h4>Logs</h4>
      <div class="log-viewer">
        ${task.logs.map((log) => {
          const [time, ...content] = log.split("] ");
          return `<div class="log-line">
            <span class="log-time">${time}]</span>
            <span class="log-content">${content.join("] ")}</span>
          </div>`;
        }).join("")}
      </div>
    `;
    taskDetails.appendChild(logsSection);
    
    // Scroll logs to bottom
    const logViewer = logsSection.querySelector('.log-viewer');
    if (logViewer) {
      logViewer.scrollTop = logViewer.scrollHeight;
    }
    
    // Show the task detail content
    const taskDetailContent = document.getElementById('task-detail-content');
    if (taskDetailContent) {
      taskDetailContent.style.display = 'block';
    }
  }

  // If task is in progress, fetch updates
  if (task.status === "pending" || task.status === "analyzing" || 
      task.status === "planning" || task.status === "executing" || 
      task.status === "validating") {
    updatePipeline(taskId, tasks, currentTaskId);
  }
}

// Track code execution for a task
function trackCodeExecution(taskId, execution) {
  if (!codeExecutions[taskId]) {
    codeExecutions[taskId] = [];
  }

  codeExecutions[taskId].push({
    ...execution,
    timestamp: new Date().toISOString(),
  });

  // Also add to task logs
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    const operationType = execution.type || "code operation";
    const path = execution.path || "";
    task.logs.push(
      `[${new Date().toLocaleTimeString()}] ${operationType}: ${path}`
    );

    // Update task details if this is the current task
    if (currentTaskId === taskId) {
      showTaskDetails(taskId);
    }
  }
}

// Get code executions for a task
function getCodeExecutions(taskId) {
  return codeExecutions[taskId] || [];
}

export {
  submitTask,
  updateTaskHistory,
  showTaskDetails,
  trackCodeExecution,
  getCodeExecutions,
  tasks,
  currentTaskId,
  taskIdCounter,
};
