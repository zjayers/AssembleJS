/**
 * Authentication Utilities for AssembleJS
 * @description Helper functions for authentication
 * @author Zach Ayers
 */
import type { FastifyRequest, FastifyReply } from "fastify";
import { ASSEMBLEJS } from "../../config/blueprint.config";
import { HttpError, HttpStatusCode } from "../../../utils/http.utils";
import type { BlueprintServerAuth } from "../../../types/blueprint.server.options";
import { isWildcardMatch } from "../../../utils/pattern.utils";

/**
 * JWT Token Payload
 */
export interface JwtPayload {
  userId: string;
  name: string;
  role: string;
  [key: string]: any;
}

/**
 * Check if a route should be public (not require authentication)
 * @param routePath - The route path to check
 * @param authConfig - The authentication configuration
 * @return True if the route should be public
 */
export function isPublicRoute(
  routePath: string,
  authConfig?: BlueprintServerAuth
): boolean {
  // Combine default public routes with custom ones from config
  const publicRoutes = [
    ...(ASSEMBLEJS.defaultPublicRoutes || []),
    ...(authConfig?.publicRoutes || []),
  ];

  // Check if the route matches any public route pattern
  return publicRoutes.some((pattern) => isWildcardMatch(routePath, pattern));
}

/**
 * Create the authentication middleware based on the server configuration
 * @param authConfig - The authentication configuration
 * @return Authentication middleware function
 */
export function createAuthMiddleware(authConfig?: BlueprintServerAuth) {
  return async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    // Skip authentication for development mode if not enabled
    if (ASSEMBLEJS.isLocal() && authConfig?.enableInDevelopment !== true) {
      return;
    }

    // Skip authentication for public routes
    if (isPublicRoute(request.url, authConfig)) {
      return;
    }

    // Use custom authentication if provided
    if (authConfig?.authenticate) {
      try {
        await new Promise<void>((resolve, reject) => {
          authConfig.authenticate!(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        return;
      } catch (error) {
        throw new HttpError(
          "Authentication failed",
          HttpStatusCode.UNAUTHORIZED,
          { message: error instanceof Error ? error.message : "Unknown error" }
        );
      }
    }

    // Use basic auth if enabled
    if (authConfig?.useBasicAuth === true) {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Basic ")) {
        throw new HttpError(
          "Authentication required",
          HttpStatusCode.UNAUTHORIZED
        );
      }

      try {
        const base64Credentials = authHeader.split(" ")[1];
        const credentials = Buffer.from(base64Credentials, "base64").toString(
          "ascii"
        );
        const separatorIndex = credentials.indexOf(":");

        // Validate credentials format
        if (separatorIndex === -1) {
          throw new HttpError(
            "Invalid credentials format",
            HttpStatusCode.BAD_REQUEST
          );
        }

        const username = credentials.substring(0, separatorIndex);
        const password = credentials.substring(separatorIndex + 1);

        const validUser = authConfig.basicAuthUser || ASSEMBLEJS.basicAuthUser;
        const validPassword =
          authConfig.basicAuthPassword || ASSEMBLEJS.basicAuthPassword;

        // Use timing-safe comparison to prevent timing attacks
        // This is a simple implementation; in production, use a dedicated crypto library
        const validUserString = typeof validUser === "string" ? validUser : "";
        const validPasswordString =
          typeof validPassword === "string" ? validPassword : "";
        let usernameMatch = username.length === validUserString.length;
        let passwordMatch = password.length === validPasswordString.length;

        // Only perform char-by-char comparison if lengths match to avoid leaking info
        if (usernameMatch && passwordMatch) {
          let result = 0;

          // Username comparison
          for (let i = 0; i < username.length; i++) {
            result |= username.charCodeAt(i) ^ validUserString.charCodeAt(i);
          }
          usernameMatch = result === 0;

          result = 0;
          // Password comparison
          for (let i = 0; i < password.length; i++) {
            result |=
              password.charCodeAt(i) ^ validPasswordString.charCodeAt(i);
          }
          passwordMatch = result === 0;
        }

        if (!(usernameMatch && passwordMatch)) {
          throw new HttpError(
            "Invalid credentials",
            HttpStatusCode.UNAUTHORIZED
          );
        }

        return;
      } catch (error) {
        if (error instanceof HttpError) {
          throw error;
        }
        // Prevent leaking internal errors to client
        throw new HttpError(
          "Authentication failed",
          HttpStatusCode.UNAUTHORIZED
        );
      }
    }

    // If no authentication method is configured, allow the request
    // This maintains backward compatibility
    return;
  };
}
