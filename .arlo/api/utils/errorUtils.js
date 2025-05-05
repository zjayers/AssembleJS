/**
 * Error Handling Utilities
 * Provides helper functions for consistent error handling
 */
const { AppError, ERROR_TYPES, STATUS } = require("../middleware/errorHandler");

/**
 * Creates a standardized error object
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {Object} details - Additional error details
 * @return {Error} Enhanced error object
 */
const createError = (message, type = "INTERNAL_ERROR", details = null) => {
  const error = new Error(message);
  error.type = type;
  error.details = details;
  return error;
};

/**
 * Wraps an async request handler to catch errors and pass them to next()
 * Eliminates the need for try/catch blocks in controller functions
 *
 * @param {Function} fn - The async controller function
 * @return {Function} - Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Wraps a function in a try/catch and logs the error in a consistent format
 *
 * @param {Function} fn - The function to wrap
 * @param {string} [context=''] - The context label for the error
 * @return {Function} - Wrapped function
 */
const withErrorLogging = (fn, context = "") => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const contextLabel = context ? `[${context}] ` : "";
      console.error(`${contextLabel}Error:`, error);
      throw error;
    }
  };
};

/**
 * Creates a safe API wrapper for any function that can throw
 * Returns an object with success, data, and error properties
 *
 * @param {Function} fn - The function to wrap
 * @param {Object} [options={}] - Options
 * @return {Function} - Wrapped function
 */
const createSafeWrapper = (fn, options = {}) => {
  const { defaultValue = null, context = "" } = options;

  return async (...args) => {
    try {
      const result = await fn(...args);
      return { success: true, data: result, error: null };
    } catch (error) {
      if (context) {
        console.error(`[${context}] Error:`, error);
      }

      return {
        success: false,
        data: defaultValue,
        error: {
          message: error.message,
          type: error.type || ERROR_TYPES.INTERNAL,
          details: error.details || null,
        },
      };
    }
  };
};

/**
 * Creates consistent fallback behavior for async operations
 * Allows specifying a default value and whether to throw
 *
 * @param {Promise} promise - The promise to handle
 * @param {*} defaultValue - Default value to return on error
 * @param {boolean} shouldThrow - Whether to rethrow the error
 * @return {Promise} - Promise with fallback behavior
 */
const withFallback = async (
  promise,
  defaultValue = null,
  shouldThrow = false
) => {
  try {
    return await promise;
  } catch (error) {
    console.error("Error with fallback:", error);

    if (shouldThrow) {
      throw error;
    }

    return defaultValue;
  }
};

/**
 * Checks if a condition is true, throws an error if not
 *
 * @param {boolean} condition - The condition to check
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {number} statusCode - HTTP status code
 * @throws {AppError} If condition is false
 */
const assertThat = (
  condition,
  message,
  type = ERROR_TYPES.INTERNAL,
  statusCode = STATUS.INTERNAL_SERVER_ERROR
) => {
  if (!condition) {
    throw new AppError(message, type, statusCode);
  }
};

/**
 * Throws a custom error if value is null or undefined
 *
 * @param {*} value - The value to check
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {number} statusCode - HTTP status code
 * @return {*} The original value if not null/undefined
 * @throws {AppError} If value is null or undefined
 */
const requireValue = (
  value,
  message,
  type = ERROR_TYPES.VALIDATION,
  statusCode = STATUS.BAD_REQUEST
) => {
  if (value === null || value === undefined) {
    throw new AppError(message, type, statusCode);
  }
  return value;
};

/**
 * Validates an object against a schema and throws if invalid
 *
 * @param {Object} data - The data to validate
 * @param {Object} schema - Simple schema object with validation functions
 * @throws {AppError} If validation fails
 */
const validateData = (data, schema) => {
  const errors = {};

  Object.entries(schema).forEach(([field, validator]) => {
    if (typeof validator === "function") {
      try {
        validator(data[field], field, data);
      } catch (error) {
        errors[field] = error.message;
      }
    }
  });

  if (Object.keys(errors).length > 0) {
    throw new AppError(
      "Validation failed",
      ERROR_TYPES.VALIDATION,
      STATUS.VALIDATION_ERROR,
      errors
    );
  }
};

// Simple validators
const validators = {
  required: (value, field) => {
    if (value === undefined || value === null || value === "") {
      throw new Error(`${field} is required`);
    }
    return value;
  },

  string: (value, field) => {
    if (value !== undefined && value !== null && typeof value !== "string") {
      throw new Error(`${field} must be a string`);
    }
    return value;
  },

  number: (value, field) => {
    if (value !== undefined && value !== null && typeof value !== "number") {
      throw new Error(`${field} must be a number`);
    }
    return value;
  },

  boolean: (value, field) => {
    if (value !== undefined && value !== null && typeof value !== "boolean") {
      throw new Error(`${field} must be a boolean`);
    }
    return value;
  },

  array: (value, field) => {
    if (value !== undefined && value !== null && !Array.isArray(value)) {
      throw new Error(`${field} must be an array`);
    }
    return value;
  },

  object: (value, field) => {
    if (
      value !== undefined &&
      value !== null &&
      (typeof value !== "object" || Array.isArray(value))
    ) {
      throw new Error(`${field} must be an object`);
    }
    return value;
  },

  email: (value, field) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error(`${field} must be a valid email address`);
    }
    return value;
  },

  minLength: (min) => (value, field) => {
    if (value && value.length < min) {
      throw new Error(`${field} must be at least ${min} characters long`);
    }
    return value;
  },

  maxLength: (max) => (value, field) => {
    if (value && value.length > max) {
      throw new Error(`${field} must be no more than ${max} characters long`);
    }
    return value;
  },

  min: (min) => (value, field) => {
    if (value !== undefined && value !== null && value < min) {
      throw new Error(`${field} must be at least ${min}`);
    }
    return value;
  },

  max: (max) => (value, field) => {
    if (value !== undefined && value !== null && value > max) {
      throw new Error(`${field} must be no more than ${max}`);
    }
    return value;
  },

  oneOf: (values) => (value, field) => {
    if (value !== undefined && value !== null && !values.includes(value)) {
      throw new Error(`${field} must be one of: ${values.join(", ")}`);
    }
    return value;
  },
};

module.exports = {
  createError,
  asyncHandler,
  withErrorLogging,
  createSafeWrapper,
  withFallback,
  assertThat,
  requireValue,
  validateData,
  validators,
};
