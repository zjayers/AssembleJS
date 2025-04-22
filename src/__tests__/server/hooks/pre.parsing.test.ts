import type { PreParsingHook } from "../../../server/hooks/pre.parsing";
import { Readable } from "stream";

describe("PreParsingHook", () => {
  // Test that the type definition behaves as expected
  it("should be a function that takes request, reply, and payload parameters", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const mockPayload = new Readable();

    let hookWasCalled = false;

    // Create a function that satisfies the PreParsingHook type
    const preParsingHook: PreParsingHook = async (request, reply, payload) => {
      // Verify the parameters
      expect(request).toBe(mockRequest);
      expect(reply).toBe(mockReply);
      expect(payload).toBe(mockPayload);

      // Mark the hook as called
      hookWasCalled = true;

      // Return the payload unmodified
      return payload;
    };

    // Act
    const result = await preParsingHook(mockRequest, mockReply, mockPayload);

    // Assert
    expect(hookWasCalled).toBe(true);
    expect(result).toBe(mockPayload);
  });

  it("should allow modifying the payload stream", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;

    // Original payload stream
    const originalPayload = new Readable({
      read() {
        this.push("original data");
        this.push(null); // end of stream
      },
    });

    // Create a modified stream
    const modifiedPayload = new Readable({
      read() {
        this.push("modified data");
        this.push(null); // end of stream
      },
    });

    // Add required receivedEncodedLength property
    Object.defineProperty(modifiedPayload, "receivedEncodedLength", {
      value: "modified data".length,
      writable: true,
    });

    // Create a hook function that modifies the payload
    const preParsingHook: PreParsingHook = async (request, reply, payload) => {
      // In a real implementation, you might transform the stream contents
      // Here we just replace it with a new stream for testing
      return modifiedPayload;
    };

    // Act
    const result = await preParsingHook(
      mockRequest,
      mockReply,
      originalPayload
    );

    // Assert
    expect(result).toBe(modifiedPayload);
    expect(result).toHaveProperty("receivedEncodedLength");
  });

  it("should support async operations", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const originalPayload = new Readable();
    let asyncOperationCompleted = false;

    // Create an async hook function
    const preParsingHook: PreParsingHook = async (request, reply, payload) => {
      // Simulate an async operation
      await new Promise((resolve) =>
        setTimeout(() => {
          asyncOperationCompleted = true;
          resolve(undefined);
        }, 10)
      );

      return payload; // Return original for simplicity
    };

    // Act
    const result = await preParsingHook(
      mockRequest,
      mockReply,
      originalPayload
    );

    // Assert
    expect(asyncOperationCompleted).toBe(true);
    expect(result).toBe(originalPayload);
  });

  it("should propagate errors from the hook function", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const originalPayload = new Readable();
    const hookError = new Error("Hook failed");

    // Create a hook function that throws
    const preParsingHook: PreParsingHook = async (request, reply, payload) => {
      throw hookError;
    };

    // Act & Assert
    await expect(
      preParsingHook(mockRequest, mockReply, originalPayload)
    ).rejects.toThrow(hookError);
  });

  it("should handle content decoding use case", async () => {
    // Arrange
    const mockRequest = {
      headers: {
        "content-encoding": "gzip",
      },
    } as any;

    const mockReply = {} as any;

    // A mock payload stream that would be gzipped in a real request
    const originalPayload = new Readable({
      read() {
        this.push(Buffer.from([0x1f, 0x8b, 0x08])); // Mock gzipped data
        this.push(null);
      },
    });

    // Mock decoded content
    const decodedPayload = new Readable({
      read() {
        this.push('{"decoded":"data"}');
        this.push(null);
      },
    });

    // Set required property
    Object.defineProperty(decodedPayload, "receivedEncodedLength", {
      value: Buffer.from('{"decoded":"data"}').length,
      writable: true,
    });

    // Create a simulated zlib gunzip function for testing
    const createGunzip = jest.fn().mockImplementation(() => {
      // Simple mock transform stream that just returns decoded data
      const transform = new Readable({
        read() {
          this.push('{"decoded":"data"}');
          this.push(null);
        },
      });
      return transform;
    });

    // Create a hook function that decodes content
    const preParsingHook: PreParsingHook = async (request, reply, payload) => {
      // Check for content encoding
      const contentEncoding =
        request.headers["content-encoding"]?.toLowerCase();

      if (contentEncoding === "gzip") {
        // In a real implementation, we would use zlib to decode
        // Here we just simulate with our mock
        createGunzip(); // Call our mock function to track invocation
        // payload.pipe(gunzip) would happen in real code

        return decodedPayload;
      }

      return payload;
    };

    // Act
    const result = await preParsingHook(
      mockRequest,
      mockReply,
      originalPayload
    );

    // Assert
    expect(result).toBe(decodedPayload);
    expect(result).toHaveProperty("receivedEncodedLength");
  });
});
