import {
  AssembleJSError,
  AssembleJSErrorCode,
  createComponentNotFoundError,
  createComponentRenderError,
  createFactoryError,
  safeExecute,
} from "../../utils/error.utils";
import { HttpError, HttpStatusCode } from "../../utils/http.utils";

describe("error.utils", () => {
  describe("AssembleJSError", () => {
    it("should create an error with default code if none provided", () => {
      const error = new AssembleJSError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.code).toBe(AssembleJSErrorCode.UNKNOWN_ERROR);
      expect(error.name).toBe("AssembleJSError");
      expect(error.context).toBeUndefined();
    });

    it("should create an error with provided code and context", () => {
      const context = { foo: "bar" };
      const error = new AssembleJSError(
        "Test error",
        AssembleJSErrorCode.COMPONENT_NOT_FOUND,
        context
      );
      expect(error.message).toBe("Test error");
      expect(error.code).toBe(AssembleJSErrorCode.COMPONENT_NOT_FOUND);
      expect(error.context).toBe(context);
    });

    it("should convert to HttpError with correct status code for COMPONENT_NOT_FOUND", () => {
      const error = new AssembleJSError(
        "Component not found",
        AssembleJSErrorCode.COMPONENT_NOT_FOUND
      );
      const httpError = error.toHttpError();

      expect(httpError).toBeInstanceOf(HttpError);
      expect(httpError.statusCode).toBe(HttpStatusCode.NOT_FOUND);
      expect(httpError.message).toBe("Component not found");
      expect(httpError.details).toEqual({
        code: AssembleJSErrorCode.COMPONENT_NOT_FOUND,
      });
    });

    it("should convert to HttpError with correct status code for AUTH_UNAUTHORIZED", () => {
      const error = new AssembleJSError(
        "Unauthorized",
        AssembleJSErrorCode.AUTH_UNAUTHORIZED
      );
      const httpError = error.toHttpError();

      expect(httpError.statusCode).toBe(HttpStatusCode.UNAUTHORIZED);
    });

    it("should convert to HttpError with correct status code for FACTORY_TIMEOUT", () => {
      const error = new AssembleJSError(
        "Timeout",
        AssembleJSErrorCode.FACTORY_TIMEOUT
      );
      const httpError = error.toHttpError();

      expect(httpError.statusCode).toBe(HttpStatusCode.REQUEST_TIMEOUT);
    });

    it("should convert to HttpError with correct status code for INVALID_CONFIGURATION", () => {
      const error = new AssembleJSError(
        "Invalid config",
        AssembleJSErrorCode.INVALID_CONFIGURATION
      );
      const httpError = error.toHttpError();

      expect(httpError.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    });

    it("should convert to HttpError with INTERNAL_SERVER_ERROR for unknown error codes", () => {
      const error = new AssembleJSError("Unknown error", "UNKNOWN_CODE");
      const httpError = error.toHttpError();

      expect(httpError.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    });

    it("should convert to log object with correct properties", () => {
      const context = { foo: "bar" };
      const error = new AssembleJSError(
        "Log message",
        AssembleJSErrorCode.COMPONENT_RENDER_ERROR,
        context
      );
      const logObject = error.toLogObject();

      expect(logObject.message).toBe("Log message");
      expect(logObject.code).toBe(AssembleJSErrorCode.COMPONENT_RENDER_ERROR);
      expect(logObject.stack).toBeDefined();
      expect(logObject.foo).toBe("bar");
    });
  });

  describe("createComponentNotFoundError", () => {
    it("should create error with component name only", () => {
      const error = createComponentNotFoundError("test-component");
      expect(error).toBeInstanceOf(AssembleJSError);
      expect(error.message).toBe("Component 'test-component' not found");
      expect(error.code).toBe(AssembleJSErrorCode.COMPONENT_NOT_FOUND);
      expect(error.context).toEqual({
        componentName: "test-component",
        viewName: undefined,
      });
    });

    it("should create error with component and view name", () => {
      const error = createComponentNotFoundError("test-component", "test-view");
      expect(error.message).toBe(
        "Component 'test-component' with view 'test-view' not found"
      );
      expect(error.context).toEqual({
        componentName: "test-component",
        viewName: "test-view",
      });
    });
  });

  describe("createComponentRenderError", () => {
    it("should create error with original error details", () => {
      const originalError = new Error("Render failed");
      const error = createComponentRenderError(
        "test-component",
        "test-view",
        originalError
      );

      expect(error).toBeInstanceOf(AssembleJSError);
      expect(error.message).toBe(
        "Error rendering component 'test-component/test-view': Render failed"
      );
      expect(error.code).toBe(AssembleJSErrorCode.COMPONENT_RENDER_ERROR);
      expect(error.context).toEqual({
        componentName: "test-component",
        viewName: "test-view",
        originalError: "Render failed",
        stack: originalError.stack,
      });
    });
  });

  describe("createFactoryError", () => {
    it("should create error with factory name and original error", () => {
      const originalError = new Error("Factory execution failed");
      const error = createFactoryError("test-factory", originalError);

      expect(error).toBeInstanceOf(AssembleJSError);
      expect(error.message).toBe(
        "Error in factory 'test-factory': Factory execution failed"
      );
      expect(error.code).toBe(AssembleJSErrorCode.FACTORY_ERROR);
      expect(error.context).toEqual({
        factoryName: "test-factory",
        originalError: "Factory execution failed",
        stack: originalError.stack,
      });
    });
  });

  describe("safeExecute", () => {
    it("should return the result of successful execution", async () => {
      const fn = jest.fn().mockResolvedValue("success");
      const result = await safeExecute(fn);
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalled();
    });

    it("should pass through AssembleJSError without wrapping", async () => {
      const originalError = new AssembleJSError(
        "Original error",
        AssembleJSErrorCode.COMPONENT_NOT_FOUND
      );
      const fn = jest.fn().mockRejectedValue(originalError);

      await expect(safeExecute(fn)).rejects.toThrow(originalError);
      expect(fn).toHaveBeenCalled();
    });

    it("should wrap normal Error with AssembleJSError", async () => {
      const originalError = new Error("Normal error");
      const fn = jest.fn().mockRejectedValue(originalError);

      try {
        await safeExecute(fn, AssembleJSErrorCode.FACTORY_ERROR, {
          customContext: "test",
        });
        fail("Should have thrown error");
      } catch (error) {
        const asmError = error as AssembleJSError;
        expect(asmError).toBeInstanceOf(AssembleJSError);
        expect(asmError.code).toBe(AssembleJSErrorCode.FACTORY_ERROR);
        expect(asmError.message).toBe("Normal error");
        expect(asmError.context).toEqual({
          customContext: "test",
          originalError: "Normal error",
          stack: originalError.stack,
        });
      }
    });

    it("should handle non-Error objects", async () => {
      const fn = jest.fn().mockRejectedValue("string error");

      try {
        await safeExecute(fn);
        fail("Should have thrown error");
      } catch (error) {
        const asmError = error as AssembleJSError;
        expect(asmError).toBeInstanceOf(AssembleJSError);
        expect(asmError.code).toBe(AssembleJSErrorCode.UNKNOWN_ERROR);
        expect(asmError.message).toBe("string error");
        expect(asmError.context?.originalError).toBe("string error");
      }
    });

    it("should use provided error code", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("Test"));

      try {
        await safeExecute(fn, AssembleJSErrorCode.EVENT_PUBLISH_ERROR);
        fail("Should have thrown error");
      } catch (error) {
        const asmError = error as AssembleJSError;
        expect(asmError).toBeInstanceOf(AssembleJSError);
        expect(asmError.code).toBe(AssembleJSErrorCode.EVENT_PUBLISH_ERROR);
      }
    });
  });
});
