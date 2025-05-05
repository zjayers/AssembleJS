/**
 * Task Updates Module
 * Handles real-time task updates using Server-Sent Events (SSE)
 */

import { tasks, showTaskDetails } from "./tasks.js";
import { updatePipeline, calculatePipelineProgress } from "./pipeline.js";

// Active SSE connections
const activeConnections = new Map();

/**
 * Connect to the SSE endpoint for a specific task
 * @param {string|number} taskId - The task ID to subscribe to
 * @returns {function} A function to close the connection
 */
function connectToTaskUpdates(taskId) {
  // Close existing connection for this task if it exists
  if (activeConnections.has(taskId)) {
    closeTaskConnection(taskId);
  }

  try {
    // Create new EventSource connection
    const eventSource = new EventSource(`/api/tasks/${taskId}/stream`);
    
    // Connection opened
    eventSource.onopen = () => {
      console.log(`Connected to task updates for task ${taskId}`);
      
      // Update subscriber count in UI
      updateSubscriberCount(taskId);
      
      // Show a notification
      if (window.showNotification) {
        window.showNotification(`Connected to real-time updates for task ${taskId}`, 'info');
      }
    };
    
    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleTaskUpdate(taskId, data);
      } catch (error) {
        console.error('Error processing task update:', error);
      }
    };
    
    // Handle connection error
    eventSource.onerror = (error) => {
      console.error(`Task updates connection error for task ${taskId}:`, error);
      
      // If connection fails completely, clean up
      if (eventSource.readyState === EventSource.CLOSED) {
        closeTaskConnection(taskId);
        
        // Show a notification
        if (window.showNotification) {
          window.showNotification(`Lost connection to task ${taskId} updates`, 'error');
        }
      }
    };
    
    // Store the connection
    activeConnections.set(taskId, eventSource);
    
    // Return function to close connection
    return () => closeTaskConnection(taskId);
  } catch (error) {
    console.error(`Error setting up SSE connection for task ${taskId}:`, error);
    return () => {};
  }
}

/**
 * Close a task update connection
 * @param {string|number} taskId - The task ID to close connection for
 */
function closeTaskConnection(taskId) {
  if (activeConnections.has(taskId)) {
    const eventSource = activeConnections.get(taskId);
    eventSource.close();
    activeConnections.delete(taskId);
    console.log(`Closed task updates connection for task ${taskId}`);
  }
}

/**
 * Close all active task update connections
 */
function closeAllConnections() {
  for (const [taskId, eventSource] of activeConnections.entries()) {
    eventSource.close();
    console.log(`Closed task updates connection for task ${taskId}`);
  }
  activeConnections.clear();
}

/**
 * Handle an incoming task update
 * @param {string|number} taskId - The task ID
 * @param {Object} data - The update data
 */
function handleTaskUpdate(taskId, data) {
  // Find task in our local tasks array
  const task = tasks.find(t => t.id === parseInt(taskId));
  
  if (!task) {
    console.warn(`Received update for unknown task ${taskId}`);
    return;
  }
  
  // Handle different event types
  switch (data.event) {
    case 'connected':
      console.log(`Connected to real-time updates for task ${taskId}`);
      break;
      
    case 'task:status_changed':
      // Update task status
      if (data.status) {
        task.status = data.status;
        task.logs.push(`[${new Date().toLocaleTimeString()}] Status changed to: ${data.status}`);
        
        // If task completed or failed, show notification
        if (data.status === 'completed' || data.status === 'failed') {
          if (window.showNotification) {
            window.showNotification(
              `Task ${taskId} ${data.status}`,
              data.status === 'completed' ? 'success' : 'error'
            );
          }
        }
      }
      break;
      
    case 'task:log_added':
      // Add new log entry
      if (data.log) {
        task.logs.push(`[${new Date().toLocaleTimeString()}] ${data.log}`);
      }
      break;
      
    case 'execution:step_started':
      // Handle execution step start
      if (data.agent && data.step) {
        task.logs.push(`[${new Date().toLocaleTimeString()}] ${data.agent} agent starting step: ${data.step}`);
      }
      break;
      
    case 'execution:step_completed':
      // Handle execution step completion
      if (data.agent && data.step) {
        task.logs.push(`[${new Date().toLocaleTimeString()}] ${data.agent} agent completed step: ${data.step}`);
      }
      break;
      
    case 'execution:step_failed':
      // Handle execution step failure
      if (data.agent && data.step && data.error) {
        task.logs.push(`[${new Date().toLocaleTimeString()}] ${data.agent} agent failed step: ${data.step} - ${data.error}`);
      }
      break;
      
    case 'file:operation':
      // Handle file operation
      if (data.operation && data.path) {
        task.logs.push(`[${new Date().toLocaleTimeString()}] File ${data.operation}: ${data.path}`);
      }
      break;
      
    case 'git:operation':
      // Handle git operation
      if (data.operation) {
        const details = data.branch ? `branch: ${data.branch}` : '';
        task.logs.push(`[${new Date().toLocaleTimeString()}] Git ${data.operation} ${details}`);
      }
      break;
      
    default:
      // For unknown event types, just log them if task is included
      if (data.task) {
        // Update the task with latest data
        Object.assign(task, data.task);
      }
      break;
  }
  
  // Update the UI if this is the current task
  if (parseInt(taskId) === window.currentTaskId) {
    showTaskDetails(parseInt(taskId));
    updatePipeline(parseInt(taskId), tasks, window.currentTaskId);
  }
}

/**
 * Update the subscriber count in the UI
 * @param {string|number} taskId - The task ID
 */
async function updateSubscriberCount(taskId) {
  try {
    const response = await fetch(`/api/tasks/${taskId}/subscribers`);
    const data = await response.json();
    
    if (data.success) {
      // Update the UI if needed
      const subscriberCountElement = document.getElementById('subscriber-count');
      if (subscriberCountElement) {
        subscriberCountElement.textContent = data.subscriberCount > 0 ? 
          `${data.subscriberCount} watching` : 'No watchers';
      }
    }
  } catch (error) {
    console.error('Error fetching subscriber count:', error);
  }
}

/**
 * Check if a task has an active connection
 * @param {string|number} taskId - The task ID to check
 * @returns {boolean} Whether the task has an active connection
 */
function hasActiveConnection(taskId) {
  return activeConnections.has(taskId);
}

// Listen for unload to clean up connections
window.addEventListener('beforeunload', closeAllConnections);

// Export the public API
export {
  connectToTaskUpdates,
  closeTaskConnection,
  closeAllConnections,
  hasActiveConnection,
  updateSubscriberCount
};