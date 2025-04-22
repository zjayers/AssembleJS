/**
 * AssembleJS Configuration
 * @description Core configuration for AssembleJS
 * @author Zach Ayers
 */
import path from "path";
import { toBoolean } from "../../utils/boolean.utils";
import { CONSTANTS } from "../../constants/blueprint.constants";
import { getEnv } from "../../utils/env.utils";

/**
 * AssembleJS Configuration Object
 * @description Contains environment-specific configuration and utility methods
 * @author Zach Ayers
 */
export const ASSEMBLEJS = {
  ...CONSTANTS,
  /**
   * Check if the current environment is production
   * @return {boolean} True if production environment
   */
  isProduction: function () {
    return this.environment === "production";
  },

  /**
   * Check if the current environment is local development
   * @return {boolean} True if local development environment
   */
  isLocal: function () {
    return this.environment === "local";
  },

  /**
   * Sets the root directory for the server
   * @param {string} dir - The root directory path
   */
  setRoot: function (dir: string) {
    this.root = path.dirname(path.normalize(dir));
  },

  /**
   * Server host
   * @default "0.0.0.0"
   */
  host: getEnv(CONSTANTS.env.host.key) ?? CONSTANTS.env.host.value,

  /**
   * Server port
   * @default 3000
   */
  port: getEnv(CONSTANTS.env.port.key) ?? CONSTANTS.env.port.value,

  /**
   * Current working directory
   */
  root: process.cwd(),

  /**
   * Current environment
   * @default "local"
   */
  environment: (getEnv(CONSTANTS.env.environment.key) ??
    CONSTANTS.env.environment.value) as
    | "local"
    | "development"
    | "test"
    | "production",

  /**
   * Enable request logging
   * @default false
   */
  enableRequestLogging: toBoolean(
    getEnv(CONSTANTS.env.enableRequestLogging.key) as string
  ),

  /**
   * Log level
   * @default "info"
   */
  logLevel: getEnv(CONSTANTS.env.logLevel.key) ?? CONSTANTS.env.logLevel.value,

  /**
   * Basic auth username
   * @default "test"
   */
  basicAuthUser:
    getEnv(CONSTANTS.env.basicAuthUser.key) ??
    CONSTANTS.env.basicAuthUser.value,

  /**
   * Basic auth password
   * @default "test"
   */
  basicAuthPassword:
    getEnv(CONSTANTS.env.basicAuthPassword.key) ??
    CONSTANTS.env.basicAuthPassword.value,

  /**
   * JWT secret for token signing/verification
   * In production, this should be set via environment variable
   * @private - Should not be directly accessed outside auth modules
   */
  jwtSecret: (() => {
    // In production, require a proper secret
    const envSecret = getEnv(CONSTANTS.env.jwtSecret.key);
    if (process.env.NODE_ENV === "production" && !envSecret) {
      console.warn(
        "WARNING: No JWT secret provided in production environment. " +
          "Please set ASSEMBLEJS_JWT_SECRET environment variable."
      );
    }

    // Use environment variable or generate a random one for development
    return envSecret ?? CONSTANTS.env.jwtSecret.value;
  })(),

  /**
   * JWT token expiration time (in seconds)
   * @default 3600 (1 hour)
   */
  jwtExpiresIn: getEnv(CONSTANTS.env.jwtExpiresIn.key)
    ? Number(getEnv(CONSTANTS.env.jwtExpiresIn.key))
    : CONSTANTS.env.jwtExpiresIn.value,

  /**
   * Cookie secret for signing cookies
   * In production, this should be set via environment variable
   * @private - Should not be directly accessed outside auth modules
   */
  cookieSecret: (() => {
    // In production, require a proper secret
    const envSecret = getEnv(CONSTANTS.env.cookieSecret.key);
    if (process.env.NODE_ENV === "production" && !envSecret) {
      console.warn(
        "WARNING: No cookie secret provided in production environment. " +
          "Please set ASSEMBLEJS_COOKIE_SECRET environment variable."
      );
    }

    // Use environment variable or generate a random one for development
    return envSecret ?? CONSTANTS.env.cookieSecret.value;
  })(),

  /**
   * Default public routes that don't require authentication
   */
  defaultPublicRoutes: [
    "/health",
    "/health/check",
    "/auth/login",
    "/bundles/*",
    "/favicon.ico",
    "/assets/*",
    "/public/*",
    "/static/*",
  ],
};
