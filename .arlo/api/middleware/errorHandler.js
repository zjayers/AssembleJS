/**
 * Error Handler Middleware
 * Provides consistent error handling across the API
 */

// HTTP status constants
const STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error types
const ERROR_TYPES = {
  VALIDATION: "VALIDATION_ERROR",
  AUTHENTICATION: "AUTHENTICATION_ERROR",
  AUTHORIZATION: "AUTHORIZATION_ERROR",
  NOT_FOUND: "NOT_FOUND_ERROR",
  CONFLICT: "CONFLICT_ERROR",
  INTERNAL: "INTERNAL_ERROR",
  EXTERNAL_SERVICE: "EXTERNAL_SERVICE_ERROR",
  DATABASE: "DATABASE_ERROR",
  FILESYSTEM: "FILESYSTEM_ERROR",
  NETWORK: "NETWORK_ERROR",
};

// Custom error class with type support
class AppError extends Error {
  constructor(
    message,
    type = ERROR_TYPES.INTERNAL,
    statusCode = STATUS.INTERNAL_SERVER_ERROR,
    details = null
  ) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      error: {
        type: this.type,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp,
      },
      success: false,
    };
  }
}

// Create typed error factories
const createNotFoundError = (message, details = null) =>
  new AppError(message, ERROR_TYPES.NOT_FOUND, STATUS.NOT_FOUND, details);

const createValidationError = (message, details = null) =>
  new AppError(
    message,
    ERROR_TYPES.VALIDATION,
    STATUS.VALIDATION_ERROR,
    details
  );

const createAuthenticationError = (message, details = null) =>
  new AppError(
    message,
    ERROR_TYPES.AUTHENTICATION,
    STATUS.UNAUTHORIZED,
    details
  );

const createAuthorizationError = (message, details = null) =>
  new AppError(message, ERROR_TYPES.AUTHORIZATION, STATUS.FORBIDDEN, details);

const createConflictError = (message, details = null) =>
  new AppError(message, ERROR_TYPES.CONFLICT, STATUS.CONFLICT, details);

const createDatabaseError = (message, details = null) =>
  new AppError(
    message,
    ERROR_TYPES.DATABASE,
    STATUS.INTERNAL_SERVER_ERROR,
    details
  );

const createFilesystemError = (message, details = null) =>
  new AppError(
    message,
    ERROR_TYPES.FILESYSTEM,
    STATUS.INTERNAL_SERVER_ERROR,
    details
  );

const createExternalServiceError = (message, details = null) =>
  new AppError(
    message,
    ERROR_TYPES.EXTERNAL_SERVICE,
    STATUS.SERVICE_UNAVAILABLE,
    details
  );

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error("Error caught in middleware:", err);

  let error = err;

  // Convert known errors from external libraries
  if (err.name === "ValidationError") {
    error = createValidationError(err.message, err.errors);
  } else if (err.name === "MongoError" && err.code === 11000) {
    error = createConflictError("Duplicate resource", {
      field: Object.keys(err.keyValue)[0],
    });
  } else if (err.name === "CastError") {
    error = createValidationError("Invalid ID format");
  } else if (err.code === "ENOENT") {
    error = createFilesystemError("File not found", { path: err.path });
  } else if (!err.statusCode) {
    // Default internal error for untyped errors
    error = new AppError(
      err.message || "An unexpected error occurred",
      ERROR_TYPES.INTERNAL,
      STATUS.INTERNAL_SERVER_ERROR,
      process.env.NODE_ENV === "development" ? { stack: err.stack } : null
    );
  }

  // Log detailed error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Detailed error:", {
      type: error.type,
      message: error.message,
      details: error.details,
      stack: error.stack,
      originalError: err,
    });
  }

  // Track error for analytics
  trackError(req, error);

  // Send response
  return res.status(error.statusCode || STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      type: error.type || ERROR_TYPES.INTERNAL,
      message: error.message || "An unexpected error occurred",
      details: error.details || null,
      timestamp: error.timestamp || new Date().toISOString(),
    },
    request: {
      id: req.id,
      path: req.path,
      method: req.method,
    },
  });
};

// Track error for analytics
const trackError = (req, error) => {
  try {
    // In production, this would integrate with analytics system
    // For now, just logging
    console.log("Error tracked:", {
      type: error.type,
      endpoint: `${req.method} ${req.path}`,
      timestamp: new Date().toISOString(),
    });

    // In a real system, would call something like:
    // analytics.trackEvent('system_error', {
    //   type: error.type,
    //   message: error.message,
    //   endpoint: `${req.method} ${req.path}`
    // });
  } catch (trackingError) {
    console.error("Error tracking error:", trackingError);
  }
};

// Request ID middleware
const requestIdMiddleware = (req, res, next) => {
  req.id = Math.random().toString(36).substring(2, 15);
  next();
};

// Error logging middleware
const errorLoggerMiddleware = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    // Log 4xx and 5xx responses
    if (res.statusCode >= 400) {
      const logData = {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: Date.now() - req._startTime,
        userAgent: req.headers["user-agent"],
        error: JSON.parse(data).error,
      };

      console.error("Request error:", logData);
    }

    return originalSend.call(this, data);
  };

  req._startTime = Date.now();
  next();
};

// Fallback middleware for unhandled errors
const finalErrorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    error: {
      type: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      timestamp: new Date().toISOString(),
    },
  });
};

// Not found middleware for 404 errors
const notFoundHandler = (req, res, next) => {
  const error = createNotFoundError(
    `Endpoint not found: ${req.method} ${req.originalUrl}`
  );
  next(error);
};

// Validate JSON middleware
const validateJsonMiddleware = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return next(
      createValidationError("Invalid JSON", { details: err.message })
    );
  }
  next(err);
};

// Timeout middleware
const timeoutMiddleware =
  (timeout = 30000) =>
  (req, res, next) => {
    res.setTimeout(timeout, () => {
      const error = new AppError(
        "Request timeout",
        ERROR_TYPES.NETWORK,
        STATUS.SERVICE_UNAVAILABLE
      );
      next(error);
    });
    next();
  };

module.exports = {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
  errorLoggerMiddleware,
  validateJsonMiddleware,
  timeoutMiddleware,
  finalErrorHandler,
  AppError,
  ERROR_TYPES,
  STATUS,
  // Error factories
  createNotFoundError,
  createValidationError,
  createAuthenticationError,
  createAuthorizationError,
  createConflictError,
  createDatabaseError,
  createFilesystemError,
  createExternalServiceError,
};
