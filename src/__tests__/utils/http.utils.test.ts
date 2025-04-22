import {
  HttpError,
  HttpStatusCode,
  isValidHttpUrl,
} from "../../utils/http.utils";

describe("http.utils", () => {
  describe("isValidHttpUrl", () => {
    it("should return true for valid HTTP URLs", () => {
      expect(isValidHttpUrl("http://example.com")).toBe(true);
      expect(isValidHttpUrl("https://example.com")).toBe(true);
      expect(isValidHttpUrl("https://example.com/path?query=string#hash")).toBe(
        true
      );
      expect(isValidHttpUrl("https://sub.domain.example.com")).toBe(true);
    });

    it("should return false for invalid URLs", () => {
      expect(isValidHttpUrl("not-a-url")).toBe(false);
      expect(isValidHttpUrl("example.com")).toBe(false);
      expect(isValidHttpUrl("ftp://example.com")).toBe(false);
      expect(isValidHttpUrl("//example.com")).toBe(false);
      expect(isValidHttpUrl("")).toBe(false);
    });
  });

  describe("HttpError", () => {
    it("should create an error with the provided message and status code", () => {
      const error = new HttpError("Test error", HttpStatusCode.BAD_REQUEST);
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(error.name).toBe("HttpError");
      expect(error.details).toBeUndefined();
    });

    it("should create an error with optional details", () => {
      const details = { field: "username", issue: "required" };
      const error = new HttpError(
        "Field required",
        HttpStatusCode.BAD_REQUEST,
        details
      );
      expect(error.details).toBe(details);
    });

    it("should convert to response object with correct structure", () => {
      const details = { reason: "test" };
      const error = new HttpError(
        "Error message",
        HttpStatusCode.NOT_FOUND,
        details
      );
      const response = error.toResponse();

      expect(response).toEqual({
        error: {
          message: "Error message",
          statusCode: HttpStatusCode.NOT_FOUND,
          details: details,
        },
      });
    });

    it("should create a badRequest error", () => {
      const error = HttpError.badRequest("Bad input");
      expect(error).toBeInstanceOf(HttpError);
      expect(error.message).toBe("Bad input");
      expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    });

    it("should create a badRequest error with default message", () => {
      const error = HttpError.badRequest();
      expect(error.message).toBe("Bad Request");
    });

    it("should create a notFound error", () => {
      const details = { resource: "user", id: 123 };
      const error = HttpError.notFound("User not found", details);
      expect(error).toBeInstanceOf(HttpError);
      expect(error.message).toBe("User not found");
      expect(error.statusCode).toBe(HttpStatusCode.NOT_FOUND);
      expect(error.details).toBe(details);
    });

    it("should create a serverError", () => {
      const error = HttpError.serverError();
      expect(error).toBeInstanceOf(HttpError);
      expect(error.message).toBe("Internal Server Error");
      expect(error.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    });

    it("should create a timeout error", () => {
      const error = HttpError.timeout("Operation timed out");
      expect(error).toBeInstanceOf(HttpError);
      expect(error.message).toBe("Operation timed out");
      expect(error.statusCode).toBe(HttpStatusCode.REQUEST_TIMEOUT);
    });
  });
});
