/**
 * Task View Module
 * Handles task controls and real-time updates UI 
 */

import { connectToTaskUpdates, closeTaskConnection, hasActiveConnection } from "../modules/taskUpdates.js";

// Task details enhancements
let currentTask = null;

// Real-time update toggle state
let realtimeUpdatesEnabled = false;

// Control buttons for task
export function setupTaskControls() {
  const pauseButton = document.getElementById("pause-task");
  const cancelButton = document.getElementById("cancel-task");
  const feedbackButton = document.getElementById("provide-feedback");
  const realtimeToggleButton = document.getElementById("toggle-realtime-updates");

  if (pauseButton) {
    pauseButton.addEventListener("click", () => {
      const isPaused = pauseButton.textContent === "Resume Task";
      pauseButton.textContent = isPaused ? "Pause Task" : "Resume Task";

      // Send task pause/resume request to the API
      if (currentTask) {
        fetch(`/api/tasks/${currentTask.id}/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: isPaused ? "running" : "paused",
            response: isPaused ? "Task resumed" : "Task paused",
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              if (window.showNotification) {
                window.showNotification(
                  isPaused ? "Task resumed!" : "Task paused!",
                  "info"
                );
              } else {
                alert(isPaused ? "Task resumed!" : "Task paused!");
              }
            }
          })
          .catch((error) => {
            console.error("Error pausing/resuming task:", error);
          });
      }
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to cancel this task? This action cannot be undone."
        )
      ) {
        // Send task cancellation request to the API
        if (currentTask) {
          fetch(`/api/tasks/${currentTask.id}/status`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "cancelled",
              response: "Task cancelled by user",
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                if (window.showNotification) {
                  window.showNotification("Task cancelled!", "warning");
                } else {
                  alert("Task cancelled!");
                }
                
                // Close real-time updates connection if active
                if (realtimeUpdatesEnabled) {
                  toggleRealtimeUpdates(false);
                }
              }
            })
            .catch((error) => {
              console.error("Error cancelling task:", error);
            });
        }
      }
    });
  }

  if (feedbackButton) {
    feedbackButton.addEventListener("click", () => {
      const feedback = prompt(
        "Provide feedback or guidance for the agents working on this task:"
      );
      if (feedback && currentTask) {
        // Send feedback as a log entry
        fetch(`/api/tasks/${currentTask.id}/log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            log: `User feedback: ${feedback}`,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              if (window.showNotification) {
                window.showNotification("Feedback submitted!", "success");
              } else {
                alert("Feedback submitted!");
              }
            }
          })
          .catch((error) => {
            console.error("Error submitting feedback:", error);
          });
      }
    });
  }

  // Setup real-time updates toggle
  if (realtimeToggleButton) {
    realtimeToggleButton.addEventListener("click", () => {
      toggleRealtimeUpdates(!realtimeUpdatesEnabled);
    });
  }

  // Add refresh button event listener
  const refreshButton = document.getElementById("refresh-details");
  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      if (currentTask) {
        // Refresh task details from API
        fetch(`/api/tasks/${currentTask.id}/execution`)
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              // Update task with new data - this would be handled by your app's task display logic
              if (window.showTaskDetails && typeof window.showTaskDetails === 'function') {
                window.showTaskDetails(currentTask.id);
              }
              
              if (window.showNotification) {
                window.showNotification("Task details refreshed", "info");
              }
            }
          })
          .catch((error) => {
            console.error("Error refreshing task details:", error);
          });
      }
    });
  }
}

/**
 * Set the current task for the task view
 * @param {Object} task - The task object
 */
export function setCurrentTask(task) {
  // Close existing connection if switching tasks
  if (currentTask && currentTask.id !== task.id && realtimeUpdatesEnabled) {
    closeTaskConnection(currentTask.id);
  }
  
  // Update current task
  currentTask = task;
  
  // Auto-connect to real-time updates for active tasks
  if (task.status === "analyzing" || task.status === "planning" || task.status === "executing" || task.status === "validating") {
    toggleRealtimeUpdates(true);
  } else if (realtimeUpdatesEnabled) {
    // Update button state without changing connection for completed tasks
    updateRealtimeToggleButton();
  }
}

/**
 * Toggle real-time updates for the current task
 * @param {boolean} enable - Whether to enable real-time updates
 */
function toggleRealtimeUpdates(enable) {
  if (!currentTask) return;
  
  realtimeUpdatesEnabled = enable;
  
  if (enable) {
    // If not already connected, connect to real-time updates
    if (!hasActiveConnection(currentTask.id)) {
      connectToTaskUpdates(currentTask.id);
    }
  } else {
    // Close the connection
    closeTaskConnection(currentTask.id);
  }
  
  // Update the toggle button
  updateRealtimeToggleButton();
}

/**
 * Update the real-time toggle button state
 */
function updateRealtimeToggleButton() {
  const realtimeToggleButton = document.getElementById("toggle-realtime-updates");
  if (!realtimeToggleButton) return;
  
  if (realtimeUpdatesEnabled) {
    realtimeToggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      Disable Live Updates
    `;
    realtimeToggleButton.classList.add("active");
  } else {
    realtimeToggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      Enable Live Updates
    `;
    realtimeToggleButton.classList.remove("active");
  }
}

/**
 * Render the task execution view with agent information
 * @param {Object} task - The task object
 * @param {Array} agents - Agent information array
 * @param {string} executionMode - Execution mode (enhanced or standard)
 */
export function renderTaskExecution(task, agents, executionMode) {
  const executionDiv = document.querySelector('.task-execution');
  if (!executionDiv) return;
  
  // Calculate progress percentage based on status
  let progressPercentage = 0;
  switch(task.status) {
    case 'analyzing': progressPercentage = 20; break;
    case 'planning': progressPercentage = 40; break;
    case 'executing': progressPercentage = 60; break;
    case 'validating': progressPercentage = 80; break;
    case 'completed': progressPercentage = 100; break;
    case 'failed': progressPercentage = 100; break;
    case 'cancelled': progressPercentage = 100; break;
    default: progressPercentage = 10;
  }
  
  // Create execution header with status
  executionDiv.innerHTML = `
    <div class="execution-header">
      <h3>Execution Progress (${executionMode} mode)</h3>
      <div class="execution-status">
        <div class="progress-percentage">${progressPercentage}%</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercentage}%"></div>
        </div>
      </div>
      <div class="execution-controls">
        <button id="toggle-realtime-updates" class="realtime-toggle">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          Enable Live Updates
        </button>
        <span id="subscriber-count" class="subscriber-count"></span>
      </div>
    </div>
    
    <div class="agent-pipeline">
      ${renderAgentPipeline(task, agents)}
    </div>
  `;
  
  // Setup real-time updates toggle button
  setupTaskControls();
}

/**
 * Render the agent pipeline for the task
 * @param {Object} task - The task object
 * @param {Array} agents - Agent information array
 * @returns {string} HTML for the agent pipeline
 */
function renderAgentPipeline(task, agents) {
  if (!agents || agents.length === 0) {
    return `<div class="empty-state">No agent information available</div>`;
  }
  
  // Get task steps information if available
  const taskSteps = task.steps || [];
  
  // Determine active agent based on status
  let activeAgent = null;
  switch(task.status) {
    case 'analyzing': activeAgent = 'Admin'; break;
    case 'planning': activeAgent = 'Config'; break;
    case 'executing': 
      // Get the last active step's agent
      if (taskSteps.length > 0) {
        const activeStep = taskSteps.find(step => step.status === 'in_progress');
        if (activeStep) {
          activeAgent = activeStep.agent;
        } else {
          activeAgent = 'Developer';
        }
      } else {
        activeAgent = 'Developer';
      }
      break;
    case 'validating': activeAgent = 'Validator'; break;
    default: activeAgent = null;
  }

  // Generate HTML for each agent
  return agents.map(agent => {
    const agentStatus = activeAgent === agent.name ? 'active' : 
                         task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled' ? 'completed' : 
                         'waiting';
    
    // Get agent-specific tasks if available
    const agentTasks = taskSteps.filter(step => step.agent === agent.name);
    
    return `
      <div class="agent-card ${agentStatus}">
        <div class="agent-header">
          <div class="agent-icon" style="background-color: ${agent.color}"></div>
          <div class="agent-info">
            <div class="agent-name">${agent.name} Agent</div>
            <div class="agent-status">${
              agentStatus === 'active' ? 'Working' : 
              agentStatus === 'completed' ? 'Completed' : 
              'Waiting'
            }</div>
          </div>
        </div>
        ${agentTasks.length > 0 ? `
          <div class="agent-tasks">
            ${agentTasks.map(step => `
              <div class="agent-task ${step.status}">
                ${step.description || `Step ${step.step || ''}`}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}