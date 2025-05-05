/**
 * ARLO - Global namespace for ARLO functionality
 * This must be loaded before any module scripts
 */
(function() {
  "use strict";
  
  // Initialize ARLO namespace
  if (!window.ARLO) {
    window.ARLO = {};
  }
  
  // Initialize core ARLO modules
  if (!window.ARLO.utils) {
    window.ARLO.utils = {};
  }
  
  /**
   * ARLO storage utility for managing localStorage
   */
  window.ARLO.utils.storage = {
    /**
     * Get an item from localStorage with optional default value
     * @param {string} key - The key to retrieve
     * @param {any} defaultValue - Default value if key not found
     * @returns {any} The stored value or default
     */
    get: function(key, defaultValue = null) {
      try {
        const value = localStorage.getItem(key);
        if (value === null) return defaultValue;
        
        // Try to parse as JSON
        try {
          return JSON.parse(value);
        } catch (e) {
          // Return as is if not JSON
          return value;
        }
      } catch (error) {
        console.warn(`Error getting item ${key} from localStorage:`, error);
        return defaultValue;
      }
    },
    
    /**
     * Set an item in localStorage
     * @param {string} key - The key to set
     * @param {any} value - The value to store
     */
    set: function(key, value) {
      try {
        // Convert objects to JSON
        const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
        localStorage.setItem(key, valueToStore);
      } catch (error) {
        console.warn(`Error setting item ${key} in localStorage:`, error);
      }
    },
    
    /**
     * Remove an item from localStorage
     * @param {string} key - The key to remove
     */
    remove: function(key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Error removing item ${key} from localStorage:`, error);
      }
    },
    
    /**
     * Clear all ARLO items from localStorage
     */
    clear: function() {
      try {
        const arloKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith('arlo_')) {
            arloKeys.push(key);
          }
        }
        
        arloKeys.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.warn('Error clearing ARLO items from localStorage:', error);
      }
    }
  };
  
  /**
   * Simple event bus for ARLO components
   */
  window.ARLO.utils.eventBus = {
    events: {},
    
    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on: function(event, callback) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
      
      // Return unsubscribe function
      return function() {
        if (this.events[event]) {
          this.events[event] = this.events[event].filter(function(cb) {
            return cb !== callback;
          });
        }
      }.bind(this);
    },
    
    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    emit: function(event, data) {
      if (this.events[event]) {
        this.events[event].forEach(function(callback) {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in event handler for ${event}:`, error);
          }
        });
      }
    }
  };
  
  console.log("ARLO global namespace initialized");
})();