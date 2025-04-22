/* eslint-disable valid-jsdoc */
/**
 * Return 'true' to if the given string is a valid HTTP url.
 * @param {string} url - The url to check.
 * @return {boolean} - True if the url is valid, false otherwise.
 * @author Zach Ayers
 */
export function isValidHttpUrl(url: string) {
  let builtUrl;
  try {
    builtUrl = new URL(url);
  } catch (_) {
    return false;
  }

  return builtUrl.protocol === "http:" || builtUrl.protocol === "https:";
}

/**
 * HTTP Status Codes
 * @description Common HTTP status codes used throughout the application
 */
export enum HttpStatusCode {
  // Success status codes
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // Client error status codes
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // Server error status codes
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * HTTP Error class for standardized error handling
 * @description Used to create consistent HTTP errors throughout the application
 * @author Zach Ayers
 */
export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  /**
   * Creates a new HttpError
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param details - Additional error details (optional)
   */
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Creates a formatted error response object
   * @return Error response object
   */
  public toResponse() {
    return {
      error: {
        message: this.message,
        statusCode: this.statusCode,
        details: this.details,
      },
    };
  }

  /**
   * Creates a Bad Request (400) error
   * @param message - Error message
   * @param details - Additional error details
   * @return HttpError instance
   */
  public static badRequest(message = "Bad Request", details?: unknown) {
    return new HttpError(message, HttpStatusCode.BAD_REQUEST, details);
  }

  /**
   * Creates a Not Found (404) error
   * @param message - Error message
   * @param details - Additional error details
   * @return HttpError instance
   */
  public static notFound(message = "Not Found", details?: unknown) {
    return new HttpError(message, HttpStatusCode.NOT_FOUND, details);
  }

  /**
   * Creates an Internal Server Error (500)
   * @param message - Error message
   * @param details - Additional error details
   * @return HttpError instance
   */
  public static serverError(
    message = "Internal Server Error",
    details?: unknown
  ) {
    return new HttpError(
      message,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      details
    );
  }

  /**
   * Creates a Request Timeout (408) error
   * @param message - Error message
   * @param details - Additional error details
   * @return HttpError instance
   */
  public static timeout(message = "Request Timeout", details?: unknown) {
    return new HttpError(message, HttpStatusCode.REQUEST_TIMEOUT, details);
  }
}
