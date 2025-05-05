/**
 * Simple event emitter implementation for client-side event handling
 */
export default class EventEmitter {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event
   *
   * @param {string} event - Event name
   * @param {Function} listener - Event handler function
   * @return {Function} Unsubscribe function
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(listener);

    // Return a function to remove this listener
    return () => {
      this.off(event, listener);
    };
  }

  /**
   * Subscribe to an event for one-time handling
   *
   * @param {string} event - Event name
   * @param {Function} listener - Event handler function
   */
  once(event, listener) {
    const removeListener = this.on(event, (...args) => {
      removeListener();
      listener.apply(this, args);
    });
  }

  /**
   * Unsubscribe from an event
   *
   * @param {string} event - Event name
   * @param {Function} listener - Event handler function to remove
   */
  off(event, listener) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter((l) => l !== listener);

    // Clean up empty event arrays
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }

  /**
   * Emit an event with data
   *
   * @param {string} event - Event name
   * @param {...any} args - Data to pass to listeners
   */
  emit(event, ...args) {
    if (!this.events[event]) return;

    // Create a copy of the listeners array before iterating
    // This prevents issues if a listener adds/removes other listeners
    const listeners = [...this.events[event]];

    listeners.forEach((listener) => {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error(`Error in event listener for '${event}':`, error);
      }
    });
  }

  /**
   * Remove all listeners for a specific event or all events
   *
   * @param {string} [event] - Event name (if not provided, all events are cleared)
   */
  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }

  /**
   * Get all listeners for an event
   *
   * @param {string} event - Event name
   * @return {Function[]} Array of listener functions
   */
  listeners(event) {
    return this.events[event] || [];
  }

  /**
   * Get the number of listeners for an event
   *
   * @param {string} event - Event name
   * @return {number} Number of listeners
   */
  listenerCount(event) {
    return this.listeners(event).length;
  }
}
