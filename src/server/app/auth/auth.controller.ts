/**
 * Authentication Controller for AssembleJS
 * @description Provides authentication endpoints
 * @author Zach Ayers
 */
import { BlueprintController } from "../../../server/abstract/blueprint.controller";
import type { Assembly } from "../../../types/blueprint.simple.types";
import type {
  ApiRequest,
  ApiReply,
} from "../../../types/blueprint.simple.types";
import { HttpError, HttpStatusCode } from "../../../utils/http.utils";
import { ASSEMBLEJS } from "../../config/blueprint.config";
import type { JwtPayload } from "./auth.utils";
import * as jwt from "jsonwebtoken";

/**
 * Authentication controller that provides login endpoints
 */
export class AuthController extends BlueprintController {
  /**
   * Register authentication endpoints with the server
   * @param {Assembly} app - The AssembleJS instance
   */
  public register(app: Assembly): void {
    // Login endpoint
    app.post("/auth/login", this.login.bind(this));

    // Logout endpoint
    app.post("/auth/logout", this.logout.bind(this));

    // Check authentication status
    app.get("/auth/status", this.checkAuthStatus.bind(this));
  }

  /**
   * Login endpoint that handles credential validation and token generation
   * @param {ApiRequest} request - FastifyRequest object
   * @param {ApiReply} reply - FastifyReply object
   */
  private async login(request: ApiRequest, reply: ApiReply): Promise<void> {
    // Use rate limiting to prevent brute force attacks
    // This is a simple implementation; in production use a dedicated rate limiter
    const clientIp = request.ip || "localhost";
    const now = Date.now();

    // Static in-memory rate limiting - would use Redis or similar in production
    if (!this.loginAttempts) {
      this.loginAttempts = new Map<
        string,
        { count: number; resetTime: number }
      >();
    }

    // Get or initialize rate limit info for this IP
    const attempts = this.loginAttempts.get(clientIp) || {
      count: 0,
      resetTime: now + 3600000,
    };

    // Reset counter if the reset time has passed
    if (now > attempts.resetTime) {
      attempts.count = 0;
      attempts.resetTime = now + 3600000; // 1 hour window
    }

    // Check if rate limited
    if (attempts.count >= 5) {
      // Max 5 failed attempts per hour
      reply.status(HttpStatusCode.TOO_MANY_REQUESTS).send({
        error: {
          message: "Too many login attempts, please try again later",
          statusCode: HttpStatusCode.TOO_MANY_REQUESTS,
        },
      });
      return;
    }

    try {
      // Destructure and validate with default values to prevent undefined
      const { username = "", password = "" } = request.body as {
        username?: string;
        password?: string;
      };

      // Validation - ensure we have both fields
      if (!username || !password) {
        throw new HttpError(
          "Username and password are required",
          HttpStatusCode.BAD_REQUEST
        );
      }

      // In a real implementation, you would validate credentials against your database
      // For this example, we use the basic auth credentials from config
      // We'll use the same timing-safe comparison as in auth.utils.ts
      const validUser = ASSEMBLEJS.basicAuthUser as string;
      const validPassword = ASSEMBLEJS.basicAuthPassword as string;

      let isValid =
        username.length === validUser.length &&
        password.length === validPassword.length;

      if (isValid) {
        let result = 0;

        // Username comparison
        for (let i = 0; i < username.length; i++) {
          result |= username.charCodeAt(i) ^ validUser.charCodeAt(i);
        }
        isValid = result === 0;

        if (isValid) {
          result = 0;
          // Password comparison
          for (let i = 0; i < password.length; i++) {
            result |= password.charCodeAt(i) ^ validPassword.charCodeAt(i);
          }
          isValid = result === 0;
        }
      }

      if (!isValid) {
        // Increment attempt counter
        attempts.count++;
        this.loginAttempts.set(clientIp, attempts);

        throw new HttpError("Invalid credentials", HttpStatusCode.UNAUTHORIZED);
      }

      // Reset attempts on successful login
      attempts.count = 0;
      this.loginAttempts.set(clientIp, attempts);

      // Generate JWT token
      const payload: JwtPayload = {
        userId: "1", // In a real implementation, this would be the user's ID
        name: username,
        role: "user",
        timestamp: Date.now(),
      };

      // Ensure we have a JWT secret
      const jwtSecret =
        (ASSEMBLEJS.jwtSecret as string) || "assemblejs-default-jwt-secret";
      const jwtExpiresIn = (ASSEMBLEJS.jwtExpiresIn as number) || 3600;

      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: jwtExpiresIn,
      });

      // Set token in cookie for automatic inclusion in future requests
      reply.setCookie("assemblejs_auth", token, {
        path: "/",
        httpOnly: true,
        secure: !ASSEMBLEJS.isLocal(), // Only send over HTTPS in production
        maxAge: jwtExpiresIn * 1000,
        signed: true,
      });

      reply.status(HttpStatusCode.OK).send({
        success: true,
        message: "Authentication successful",
        user: {
          name: username,
          role: "user",
        },
      });
    } catch (error) {
      // Use HTTP error if it's already an HttpError, otherwise create a new one
      if (error instanceof HttpError) {
        reply.status(error.statusCode).send(error.toResponse());
      } else {
        // Log internal error but don't expose details to client
        request.log.error({ err: error }, "Login error");
        const httpError = new HttpError(
          "Authentication failed",
          HttpStatusCode.INTERNAL_SERVER_ERROR
        );
        reply.status(httpError.statusCode).send(httpError.toResponse());
      }
    }
  }

  // Rate limiting storage - would use Redis or similar in production
  private loginAttempts?: Map<string, { count: number; resetTime: number }>;

  /**
   * Logout endpoint that clears the authentication cookie
   * @param {ApiRequest} _request - FastifyRequest object
   * @param {ApiReply} reply - FastifyReply object
   */
  private async logout(_request: ApiRequest, reply: ApiReply): Promise<void> {
    // Clear the auth cookie
    reply.clearCookie("assemblejs_auth", { path: "/" });

    reply.status(HttpStatusCode.OK).send({
      success: true,
      message: "Logout successful",
    });
  }

  /**
   * Check the current authentication status
   * @param {ApiRequest} request - FastifyRequest object
   * @param {ApiReply} reply - FastifyReply object
   */
  private async checkAuthStatus(
    request: ApiRequest,
    reply: ApiReply
  ): Promise<void> {
    try {
      // Check if we have an auth cookie
      const token = request.cookies.assemblejs_auth;

      if (!token) {
        reply.status(HttpStatusCode.OK).send({
          authenticated: false,
        });
        return;
      }

      try {
        // Verify the token
        const jwtSecret =
          (ASSEMBLEJS.jwtSecret as string) || "assemblejs-default-jwt-secret";
        const payload = jwt.verify(token, jwtSecret) as JwtPayload;

        reply.status(HttpStatusCode.OK).send({
          authenticated: true,
          user: {
            name: payload.name,
            role: payload.role,
          },
        });
      } catch (tokenError) {
        // Token verification failed (invalid or expired)
        // Clear the invalid cookie
        reply.clearCookie("assemblejs_auth", { path: "/" });

        reply.status(HttpStatusCode.OK).send({
          authenticated: false,
          message: "Session expired",
        });
      }
    } catch (error) {
      // General error handling
      request.log.error({ err: error }, "Auth status check error");

      reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        error: {
          message: "Error checking authentication status",
          statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
        },
      });
    }
  }
}
