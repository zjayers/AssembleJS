/**
 * Error utilities for AssembleJS
 * @description Standard error handling and error classes for AssembleJS
 * @author Zach Ayers
 */
import { HttpError, HttpStatusCode } from "./http.utils";

/**
 * Error codes for AssembleJS specific errors
 */
export enum AssembleJSErrorCode {
  // General errors
  UNKNOWN_ERROR = "ASSEMBLEJS_UNKNOWN_ERROR",
  INVALID_CONFIGURATION = "ASSEMBLEJS_INVALID_CONFIGURATION",

  // Component errors
  COMPONENT_NOT_FOUND = "ASSEMBLEJS_COMPONENT_NOT_FOUND",
  COMPONENT_LOAD_ERROR = "ASSEMBLEJS_COMPONENT_LOAD_ERROR",
  COMPONENT_RENDER_ERROR = "ASSEMBLEJS_COMPONENT_RENDER_ERROR",

  // Blueprint errors
  BLUEPRINT_NOT_FOUND = "ASSEMBLEJS_BLUEPRINT_NOT_FOUND",
  BLUEPRINT_COMPOSITION_ERROR = "ASSEMBLEJS_BLUEPRINT_COMPOSITION_ERROR",

  // Factory errors
  FACTORY_ERROR = "ASSEMBLEJS_FACTORY_ERROR",
  FACTORY_TIMEOUT = "ASSEMBLEJS_FACTORY_TIMEOUT",

  // Event system errors
  EVENT_PUBLISH_ERROR = "ASSEMBLEJS_EVENT_PUBLISH_ERROR",
  EVENT_SUBSCRIBE_ERROR = "ASSEMBLEJS_EVENT_SUBSCRIBE_ERROR",

  // Authentication errors
  AUTH_CONFIGURATION_ERROR = "ASSEMBLEJS_AUTH_CONFIGURATION_ERROR",
  AUTH_TOKEN_INVALID = "ASSEMBLEJS_AUTH_TOKEN_INVALID",
  AUTH_UNAUTHORIZED = "ASSEMBLEJS_AUTH_UNAUTHORIZED",

  // Template errors
  TEMPLATE_PARSE_ERROR = "ASSEMBLEJS_TEMPLATE_PARSE_ERROR",
  TEMPLATE_LOAD_ERROR = "ASSEMBLEJS_TEMPLATE_LOAD_ERROR",
}

/**
 * Base error class for AssembleJS errors
 */
export class AssembleJSError extends Error {
  /**
   * The error code
   */
  public readonly code: string;

  /**
   * Additional context for the error
   */
  public readonly context?: Record<string, any>;

  /**
   * Creates a new AssembleJS error
   * @param message - Human-readable error message
   * @param code - Error code from AssembleJSErrorCode
   * @param context - Additional context information
   */
  constructor(
    message: string,
    code: string = AssembleJSErrorCode.UNKNOWN_ERROR,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = "AssembleJSError";
    this.code = code;
    this.context = context;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converts to an HTTP error for API responses
   * @return HttpError instance
   */
  public toHttpError(): HttpError {
    // Map common error codes to HTTP status codes
    let statusCode: number;

    switch (this.code) {
      case AssembleJSErrorCode.COMPONENT_NOT_FOUND:
      case AssembleJSErrorCode.BLUEPRINT_NOT_FOUND:
        statusCode = HttpStatusCode.NOT_FOUND;
        break;
      case AssembleJSErrorCode.AUTH_UNAUTHORIZED:
        statusCode = HttpStatusCode.UNAUTHORIZED;
        break;
      case AssembleJSErrorCode.FACTORY_TIMEOUT:
        statusCode = HttpStatusCode.REQUEST_TIMEOUT;
        break;
      case AssembleJSErrorCode.INVALID_CONFIGURATION:
      case AssembleJSErrorCode.AUTH_CONFIGURATION_ERROR:
        statusCode = HttpStatusCode.BAD_REQUEST;
        break;
      default:
        statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
    }

    return new HttpError(this.message, statusCode, {
      code: this.code,
      ...this.context,
    });
  }

  /**
   * Returns a formatted object for logging
   */
  public toLogObject(): Record<string, any> {
    return {
      message: this.message,
      code: this.code,
      stack: this.stack,
      ...this.context,
    };
  }
}

/**
 * Creates a component not found error
 * @param componentName - Name of the component that was not found
 * @param viewName - Name of the view that was not found
 * @return AssembleJSError instance
 */
export function createComponentNotFoundError(
  componentName: string,
  viewName?: string
): AssembleJSError {
  const message = viewName
    ? `Component '${componentName}' with view '${viewName}' not found`
    : `Component '${componentName}' not found`;

  return new AssembleJSError(message, AssembleJSErrorCode.COMPONENT_NOT_FOUND, {
    componentName,
    viewName,
  });
}

/**
 * Creates a component rendering error
 * @param componentName - Name of the component
 * @param viewName - Name of the view
 * @param error - Original error that occurred
 * @return AssembleJSError instance
 */
export function createComponentRenderError(
  componentName: string,
  viewName: string,
  error: Error
): AssembleJSError {
  return new AssembleJSError(
    `Error rendering component '${componentName}/${viewName}': ${error.message}`,
    AssembleJSErrorCode.COMPONENT_RENDER_ERROR,
    {
      componentName,
      viewName,
      originalError: error.message,
      stack: error.stack,
    }
  );
}

/**
 * Creates a factory error
 * @param factoryName - Name of the factory
 * @param error - Original error that occurred
 * @return AssembleJSError instance
 */
export function createFactoryError(
  factoryName: string,
  error: Error
): AssembleJSError {
  return new AssembleJSError(
    `Error in factory '${factoryName}': ${error.message}`,
    AssembleJSErrorCode.FACTORY_ERROR,
    {
      factoryName,
      originalError: error.message,
      stack: error.stack,
    }
  );
}

/**
 * Safely executes a function and wraps errors in an AssembleJSError
 * @param fn - The function to execute
 * @param errorCode - The error code to use if an error occurs
 * @param errorContext - Additional context for the error
 * @return The result of the function
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  errorCode: string = AssembleJSErrorCode.UNKNOWN_ERROR,
  errorContext?: Record<string, any>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof AssembleJSError) {
      throw error;
    }

    throw new AssembleJSError(
      error instanceof Error ? error.message : String(error),
      errorCode,
      {
        ...errorContext,
        originalError: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    );
  }
}
