/**
 * @jest-environment node
 */
import {
  isPublicRoute,
  createAuthMiddleware,
} from "../../../../server/app/auth/auth.utils";
import { ASSEMBLEJS } from "../../../../server/config/blueprint.config";
import { HttpError } from "../../../../utils/http.utils";
import * as patternUtils from "../../../../utils/pattern.utils";

// Mock dependencies
jest.mock("../../../../server/config/blueprint.config", () => ({
  ASSEMBLEJS: {
    isLocal: jest.fn().mockReturnValue(false),
    defaultPublicRoutes: ["/api/public/*", "/auth/login", "/auth/status"],
    basicAuthUser: "testuser",
    basicAuthPassword: "testpass",
  },
}));

jest.mock("../../../../utils/pattern.utils", () => ({
  isWildcardMatch: jest.fn(),
}));

describe("auth.utils", () => {
  describe("isPublicRoute", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should check route against default public routes", () => {
      // Arrange
      (patternUtils.isWildcardMatch as jest.Mock).mockReturnValue(false);

      // Act
      isPublicRoute("/api/private/resource");

      // Assert
      expect(patternUtils.isWildcardMatch).toHaveBeenCalledTimes(3);
      expect(patternUtils.isWildcardMatch).toHaveBeenCalledWith(
        "/api/private/resource",
        "/api/public/*"
      );
      expect(patternUtils.isWildcardMatch).toHaveBeenCalledWith(
        "/api/private/resource",
        "/auth/login"
      );
      expect(patternUtils.isWildcardMatch).toHaveBeenCalledWith(
        "/api/private/resource",
        "/auth/status"
      );
    });

    it("should check route against custom public routes", () => {
      // Arrange
      (patternUtils.isWildcardMatch as jest.Mock).mockReturnValue(false);
      const authConfig = {
        publicRoutes: ["/custom/public/*", "/custom/login"],
      };

      // Act
      isPublicRoute("/custom/public/resource", authConfig);

      // Assert
      expect(patternUtils.isWildcardMatch).toHaveBeenCalledTimes(5);
      expect(patternUtils.isWildcardMatch).toHaveBeenCalledWith(
        "/custom/public/resource",
        "/custom/public/*"
      );
      expect(patternUtils.isWildcardMatch).toHaveBeenCalledWith(
        "/custom/public/resource",
        "/custom/login"
      );
    });

    it("should return true when route matches a public pattern", () => {
      // Arrange
      (patternUtils.isWildcardMatch as jest.Mock).mockImplementation(
        (route, pattern) => {
          return (
            pattern === "/api/public/*" && route.startsWith("/api/public/")
          );
        }
      );

      // Act
      const result = isPublicRoute("/api/public/resource");

      // Assert
      expect(result).toBe(true);
    });

    it("should return false when route does not match any public pattern", () => {
      // Arrange
      (patternUtils.isWildcardMatch as jest.Mock).mockReturnValue(false);

      // Act
      const result = isPublicRoute("/api/private/resource");

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("createAuthMiddleware", () => {
    let mockRequest: any;
    let mockReply: any;
    let mockDone: jest.Mock;

    // Adapter function to handle different middleware signatures
    const runMiddleware = async (
      middleware: Function,
      req: any,
      reply: any,
      done: Function
    ) => {
      try {
        await middleware(req, reply);
        done();
      } catch (error) {
        // Don't call done on error, emulating fastify behavior
        throw error;
      }
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(false);

      mockRequest = {
        url: "/api/private/resource",
        headers: {},
      };

      mockReply = {};

      mockDone = jest.fn();
    });

    it("should skip authentication in development mode", async () => {
      // Arrange
      (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);
      const middleware = createAuthMiddleware();

      // Act
      await runMiddleware(middleware, mockRequest, mockReply, mockDone);

      // Assert
      expect(mockDone).toHaveBeenCalled();
    });

    it("should enable authentication in development if configured", async () => {
      // Arrange
      (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);
      const middleware = createAuthMiddleware({ enableInDevelopment: true });
      jest.spyOn(patternUtils, "isWildcardMatch").mockReturnValue(false);

      // Need to mock more to prevent error
      mockRequest.headers.authorization =
        "Basic " + Buffer.from("testuser:testpass").toString("base64");

      // Act
      await runMiddleware(middleware, mockRequest, mockReply, mockDone);

      // Assert
      expect(mockDone).toHaveBeenCalled();
    });

    it("should skip authentication for public routes", async () => {
      // Arrange
      jest.spyOn(patternUtils, "isWildcardMatch").mockReturnValue(true);
      const middleware = createAuthMiddleware();

      // Act
      await runMiddleware(middleware, mockRequest, mockReply, mockDone);

      // Assert
      expect(mockDone).toHaveBeenCalled();
    });

    it("should use custom authentication if provided", async () => {
      // Arrange
      jest.spyOn(patternUtils, "isWildcardMatch").mockReturnValue(false);
      const mockAuthenticate = jest
        .fn()
        .mockImplementation((req, rep, done) => done());
      const middleware = createAuthMiddleware({
        authenticate: mockAuthenticate,
      });

      // Act
      await runMiddleware(middleware, mockRequest, mockReply, mockDone);

      // Assert
      expect(mockAuthenticate).toHaveBeenCalledWith(
        mockRequest,
        mockReply,
        expect.any(Function)
      );
      expect(mockDone).toHaveBeenCalled();
    });

    it("should throw error if custom authentication fails", async () => {
      // Arrange
      jest.spyOn(patternUtils, "isWildcardMatch").mockReturnValue(false);
      const mockAuthenticate = jest
        .fn()
        .mockImplementation((req, rep, done) => done(new Error("Auth failed")));
      const middleware = createAuthMiddleware({
        authenticate: mockAuthenticate,
      });

      // Act & Assert
      await expect(
        runMiddleware(middleware, mockRequest, mockReply, mockDone)
      ).rejects.toThrow(HttpError);
      expect(mockAuthenticate).toHaveBeenCalledWith(
        mockRequest,
        mockReply,
        expect.any(Function)
      );
      expect(mockDone).not.toHaveBeenCalled();
    });

    it("should use basic auth if enabled", async () => {
      // Arrange
      jest.spyOn(patternUtils, "isWildcardMatch").mockReturnValue(false);
      const middleware = createAuthMiddleware({ useBasicAuth: true });

      // Add valid authorization header
      mockRequest.headers.authorization =
        "Basic " + Buffer.from("testuser:testpass").toString("base64");

      // Act
      await runMiddleware(middleware, mockRequest, mockReply, mockDone);

      // Assert
      expect(mockDone).toHaveBeenCalled();
    });

    it("should throw error if basic auth is enabled but no authorization header", async () => {
      // Arrange
      jest.spyOn(patternUtils, "isWildcardMatch").mockReturnValue(false);
      const middleware = createAuthMiddleware({ useBasicAuth: true });

      // Act & Assert
      await expect(
        runMiddleware(middleware, mockRequest, mockReply, mockDone)
      ).rejects.toThrow(HttpError);
      expect(mockDone).not.toHaveBeenCalled();
    });

    it("should throw error if basic auth credentials are invalid", async () => {
      // Arrange
      jest.spyOn(patternUtils, "isWildcardMatch").mockReturnValue(false);
      const middleware = createAuthMiddleware({ useBasicAuth: true });

      // Add invalid authorization header
      mockRequest.headers.authorization =
        "Basic " + Buffer.from("wronguser:wrongpass").toString("base64");

      // Act & Assert
      await expect(
        runMiddleware(middleware, mockRequest, mockReply, mockDone)
      ).rejects.toThrow(HttpError);
      expect(mockDone).not.toHaveBeenCalled();
    });

    it("should allow request with no auth configuration", async () => {
      // Arrange
      jest.spyOn(patternUtils, "isWildcardMatch").mockReturnValue(false);
      const middleware = createAuthMiddleware();

      // Act
      await runMiddleware(middleware, mockRequest, mockReply, mockDone);

      // Assert
      expect(mockDone).toHaveBeenCalled();
    });
  });
});
