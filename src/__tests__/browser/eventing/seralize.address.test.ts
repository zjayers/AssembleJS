import {
  serializeAddress,
  serializeEventAddress,
} from "../../../browser/eventing/seralize.address";

describe("seralize.address", () => {
  describe("serializeAddress", () => {
    it("should combine channel and topic with a colon separator", () => {
      // Arrange
      const address = { channel: "test-channel", topic: "test-topic" };

      // Act
      const result = serializeAddress(address);

      // Assert
      expect(result).toBe("test-channel:test-topic");
    });

    it("should work with numeric values in channel or topic", () => {
      // Arrange
      const address = { channel: "channel-123", topic: "topic-456" };

      // Act
      const result = serializeAddress(address);

      // Assert
      expect(result).toBe("channel-123:topic-456");
    });

    it("should handle special characters in channel or topic", () => {
      // Arrange
      const address = { channel: "ch@nnel", topic: "t#pic" };

      // Act
      const result = serializeAddress(address);

      // Assert
      expect(result).toBe("ch@nnel:t#pic");
    });

    it("should handle empty channel or topic", () => {
      // Arrange
      const address1 = { channel: "", topic: "test-topic" };
      const address2 = { channel: "test-channel", topic: "" };

      // Act
      const result1 = serializeAddress(address1);
      const result2 = serializeAddress(address2);

      // Assert
      expect(result1).toBe(":test-topic");
      expect(result2).toBe("test-channel:");
    });
  });

  describe("serializeEventAddress", () => {
    it("should serialize the channel and topic from an event", () => {
      // Arrange
      const event = {
        channel: "test-channel",
        topic: "test-topic",
        payload: { data: "test-data" },
      };

      // Act
      const result = serializeEventAddress(event);

      // Assert
      expect(result).toBe("test-channel:test-topic");
    });

    it("should ignore the payload when serializing", () => {
      // Arrange
      const event1 = {
        channel: "ch1",
        topic: "top1",
        payload: { data: "test-data-1" },
      };

      const event2 = {
        channel: "ch1",
        topic: "top1",
        payload: { data: "test-data-2" },
      };

      // Act
      const result1 = serializeEventAddress(event1);
      const result2 = serializeEventAddress(event2);

      // Assert
      expect(result1).toBe("ch1:top1");
      expect(result2).toBe("ch1:top1");
      expect(result1).toEqual(result2);
    });

    it("should call serializeAddress internally - implementation test", () => {
      // This is more of an implementation detail test to demonstrate the relationship
      // between the two functions - rather than using spies, we'll just verify that
      // the result matches what we'd expect by calling serializeAddress directly

      // Arrange
      const event = {
        channel: "test-channel",
        topic: "test-topic",
        payload: { data: "test-data" },
      };

      // The address we expect to be created internally
      const address = {
        channel: event.channel,
        topic: event.topic,
      };

      // Act
      const result1 = serializeEventAddress(event);
      const result2 = serializeAddress(address);

      // Assert
      expect(result1).toBe(result2);
      expect(result1).toBe("test-channel:test-topic");
    });
  });
});
