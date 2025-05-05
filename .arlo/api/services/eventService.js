/**
 * Event Service
 * Provides real-time updates for task execution
 */

const EventEmitter = require('events');

/**
 * Event Service for real-time updates
 */
class EventService extends EventEmitter {
  constructor() {
    super();
    
    // Set a higher limit for max listeners
    this.setMaxListeners(50);
    
    // Event types
    this.EVENT_TYPES = {
      TASK_CREATED: 'task:created',
      TASK_UPDATED: 'task:updated',
      TASK_STATUS_CHANGED: 'task:status_changed',
      TASK_LOG_ADDED: 'task:log_added',
      TASK_COMPLETED: 'task:completed',
      TASK_FAILED: 'task:failed',
      EXECUTION_STEP_STARTED: 'execution:step_started',
      EXECUTION_STEP_COMPLETED: 'execution:step_completed',
      EXECUTION_STEP_FAILED: 'execution:step_failed',
      GIT_OPERATION: 'git:operation',
      FILE_OPERATION: 'file:operation',
      SYSTEM_ERROR: 'system:error'
    };
    
    // Connected clients for tasks
    this.taskClients = new Map();
    
    console.log('Event Service initialized');
  }

  /**
   * Emit a task update event
   * @param {string} taskId - ID of the task
   * @param {string} eventType - Type of event
   * @param {Object} data - Event data
   */
  emitTaskUpdate(taskId, eventType, data) {
    // Emit event for specific task
    this.emit(`${eventType}:${taskId}`, data);
    
    // Also emit general event
    this.emit(eventType, { taskId, ...data });
  }

  /**
   * Subscribe to updates for a specific task
   * @param {string} taskId - ID of the task
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribeToTask(taskId, callback) {
    // Function to handle task events
    const handleEvent = (data) => {
      callback(data);
    };
    
    // Subscribe to all task-related events for this task
    Object.values(this.EVENT_TYPES)
      .filter(type => type.startsWith('task:') || type.startsWith('execution:'))
      .forEach(eventType => {
        this.on(`${eventType}:${taskId}`, handleEvent);
      });
    
    // Track subscription
    if (!this.taskClients.has(taskId)) {
      this.taskClients.set(taskId, new Set());
    }
    this.taskClients.get(taskId).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.unsubscribeFromTask(taskId, callback);
    };
  }

  /**
   * Unsubscribe from updates for a specific task
   * @param {string} taskId - ID of the task
   * @param {Function} callback - Callback function
   */
  unsubscribeFromTask(taskId, callback) {
    // Unsubscribe from all task-related events for this task
    Object.values(this.EVENT_TYPES)
      .filter(type => type.startsWith('task:') || type.startsWith('execution:'))
      .forEach(eventType => {
        this.removeListener(`${eventType}:${taskId}`, callback);
      });
    
    // Remove from tracked subscriptions
    if (this.taskClients.has(taskId)) {
      this.taskClients.get(taskId).delete(callback);
      if (this.taskClients.get(taskId).size === 0) {
        this.taskClients.delete(taskId);
      }
    }
  }

  /**
   * Get the number of subscribers for a task
   * @param {string} taskId - ID of the task
   * @returns {number} Number of subscribers
   */
  getSubscriberCount(taskId) {
    return this.taskClients.has(taskId) ? this.taskClients.get(taskId).size : 0;
  }

  /**
   * Check if a task has subscribers
   * @param {string} taskId - ID of the task
   * @returns {boolean} Whether the task has subscribers
   */
  hasSubscribers(taskId) {
    return this.taskClients.has(taskId) && this.taskClients.get(taskId).size > 0;
  }
}

// Create singleton instance
const eventService = new EventService();

// Export the singleton instance
module.exports = eventService;