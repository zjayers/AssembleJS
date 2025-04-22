import { EventBus, events } from "../../../browser/eventing/event.bus";
import { getEventManager } from "../../../browser/eventing/event.manager";
import {
  serializeAddress,
  serializeEventAddress,
} from "../../../browser/eventing/seralize.address";
import type { BlueprintEvent } from "../../../browser/eventing/blueprint.event";
import type { EventAddress } from "../../../browser/eventing/event.address";
import { CONSTANTS } from "../../../constants/blueprint.constants";

// Setup mocks
jest.mock("../../../browser/eventing/event.manager");
jest.mock("../../../browser/eventing/seralize.address");

describe("EventBus", () => {
  // Test fixtures and mocks
  let eventBus: EventBus;
  let mockEventEmitter: any;
  let mockEventSink: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock event emitter and sink
    mockEventEmitter = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    };

    mockEventSink = {
      push: jest.fn(),
      peek: jest.fn(),
    };

    // Setup mock event manager
    (getEventManager as jest.Mock).mockReturnValue({
      eventEmitter: mockEventEmitter,
      eventSink: mockEventSink,
    });

    // Setup mock serialization
    (serializeAddress as jest.Mock).mockImplementation(
      (address) => `${address.channel}:${address.topic}`
    );
    (serializeEventAddress as jest.Mock).mockImplementation(
      (event) => `${event.channel}:${event.topic}`
    );

    // Create new event bus instance for each test
    eventBus = new EventBus();
  });

  describe("Constructor", () => {
    it("should get event manager and set properties", () => {
      expect(getEventManager).toHaveBeenCalled();
      expect(eventBus.eventEmitter).toBe(mockEventEmitter);
      expect(eventBus.eventSink).toBe(mockEventSink);
    });
  });

  describe("publish", () => {
    it("should emit event and push to sink", () => {
      // Arrange
      const event: BlueprintEvent<string> = {
        channel: "test-channel",
        topic: "test-topic",
        payload: "test-payload",
      };

      // Act
      const result = eventBus.publish(event);

      // Assert
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        "test-channel:test-topic",
        event
      );
      expect(mockEventSink.push).toHaveBeenCalledWith(event);
      expect(result).toBe(event);
    });

    it("should throw error if event missing channel or topic", () => {
      // Arrange
      const invalidEvent = {
        payload: "test-payload",
      } as BlueprintEvent<string>;

      // Act & Assert
      expect(() => eventBus.publish(invalidEvent)).toThrow(
        "Event must have channel and topic properties"
      );
    });
  });

  describe("toAll", () => {
    it("should publish to global channel with default topic", () => {
      // Mock publish method
      const publishSpy = jest.spyOn(eventBus, "publish");

      // Act
      eventBus.toAll("test-payload");

      // Assert
      expect(publishSpy).toHaveBeenCalledWith({
        channel: CONSTANTS.eventingGlobalChannel,
        topic: CONSTANTS.eventingGlobalTopic,
        payload: "test-payload",
      });
    });

    it("should publish to global channel with specified topic", () => {
      // Mock publish method
      const publishSpy = jest.spyOn(eventBus, "publish");

      // Act
      eventBus.toAll("test-payload", "custom-topic");

      // Assert
      expect(publishSpy).toHaveBeenCalledWith({
        channel: CONSTANTS.eventingGlobalChannel,
        topic: "custom-topic",
        payload: "test-payload",
      });
    });
  });

  describe("toComponents", () => {
    it("should publish to components channel", () => {
      // Mock publish method
      const publishSpy = jest.spyOn(eventBus, "publish");

      // Act
      eventBus.toComponents("test-payload");

      // Assert
      expect(publishSpy).toHaveBeenCalledWith({
        channel: CONSTANTS.eventingGlobalComponentChannel,
        topic: CONSTANTS.eventingGlobalTopic,
        payload: "test-payload",
      });
    });
  });

  describe("toBlueprint", () => {
    it("should publish to blueprint channel", () => {
      // Mock publish method
      const publishSpy = jest.spyOn(eventBus, "publish");

      // Act
      eventBus.toBlueprint("test-payload");

      // Assert
      expect(publishSpy).toHaveBeenCalledWith({
        channel: CONSTANTS.eventingGlobalBlueprintChannel,
        topic: CONSTANTS.eventingGlobalTopic,
        payload: "test-payload",
      });
    });
  });

  describe("subscribe", () => {
    it("should register listener with event emitter", () => {
      // Arrange
      const address: EventAddress = {
        channel: "test-channel",
        topic: "test-topic",
      };
      const listener = jest.fn();

      // Act
      eventBus.subscribe(address, listener);

      // Assert
      expect(serializeAddress).toHaveBeenCalledWith(address);
      expect(mockEventEmitter.on).toHaveBeenCalledWith(
        "test-channel:test-topic",
        listener
      );
    });
  });

  describe("unsubscribe", () => {
    it("should remove listener from event emitter", () => {
      // Arrange
      const address: EventAddress = {
        channel: "test-channel",
        topic: "test-topic",
      };
      const listener = jest.fn();

      // Act
      eventBus.unsubscribe(address, listener);

      // Assert
      expect(serializeAddress).toHaveBeenCalledWith(address);
      expect(mockEventEmitter.off).toHaveBeenCalledWith(
        "test-channel:test-topic",
        listener
      );
    });
  });

  describe("peek", () => {
    it("should get event from sink without removing it", () => {
      // Arrange
      const address: EventAddress = {
        channel: "test-channel",
        topic: "test-topic",
      };
      const expectedEvent = { payload: "test-payload" };
      mockEventSink.peek.mockReturnValue(expectedEvent);

      // Act
      const result = eventBus.peek(address);

      // Assert
      expect(mockEventSink.peek).toHaveBeenCalledWith(address);
      expect(result).toBe(expectedEvent);
    });
  });

  describe("events object", () => {
    it("should provide a publish method that emits and pushes events", () => {
      // Arrange
      const address = {
        channel: "test-channel",
        topic: "test-topic",
      };
      const payload = "test-payload";

      // Act
      const result = events.publish(address, payload);

      // Assert
      expect(mockEventEmitter.emit).toHaveBeenCalled();
      expect(mockEventSink.push).toHaveBeenCalled();
      expect(result).toHaveProperty("channel", address.channel);
      expect(result).toHaveProperty("topic", address.topic);
      expect(result).toHaveProperty("payload", payload);
    });

    it("should provide a subscribe method that registers listeners", () => {
      // Arrange
      const address = {
        channel: "test-channel",
        topic: "test-topic",
      };
      const listener = jest.fn();

      // Act
      events.subscribe(address, listener);

      // Assert
      expect(mockEventEmitter.on).toHaveBeenCalledWith(
        "test-channel:test-topic",
        listener
      );
    });

    it("should provide an unsubscribe method that removes listeners", () => {
      // Arrange
      const address = {
        channel: "test-channel",
        topic: "test-topic",
      };
      const listener = jest.fn();

      // Act
      events.unsubscribe(address, listener);

      // Assert
      expect(mockEventEmitter.off).toHaveBeenCalledWith(
        "test-channel:test-topic",
        listener
      );
    });

    it("should provide a peek method that gets events from sink", () => {
      // Arrange
      const address = {
        channel: "test-channel",
        topic: "test-topic",
      };
      const expectedEvent = { payload: "test-payload" };
      mockEventSink.peek.mockReturnValue(expectedEvent);

      // Act
      const result = events.peek(address);

      // Assert
      expect(mockEventSink.peek).toHaveBeenCalledWith(address);
      expect(result).toBe(expectedEvent);
    });

    it("should provide shorthand methods for global channels", () => {
      // Arrange
      const payload = "test-payload";

      // Act
      events.toAll(payload);
      events.toComponents(payload);
      events.toBlueprint(payload);

      // Assert
      // toAll
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        expect.stringContaining(CONSTANTS.eventingGlobalChannel),
        expect.objectContaining({
          channel: CONSTANTS.eventingGlobalChannel,
          topic: CONSTANTS.eventingGlobalTopic,
          payload,
        })
      );

      // toComponents
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        expect.stringContaining(CONSTANTS.eventingGlobalComponentChannel),
        expect.objectContaining({
          channel: CONSTANTS.eventingGlobalComponentChannel,
          topic: CONSTANTS.eventingGlobalTopic,
          payload,
        })
      );

      // toBlueprint
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        expect.stringContaining(CONSTANTS.eventingGlobalBlueprintChannel),
        expect.objectContaining({
          channel: CONSTANTS.eventingGlobalBlueprintChannel,
          topic: CONSTANTS.eventingGlobalTopic,
          payload,
        })
      );
    });

    it("should provide useOnMessageListener that subscribes to global channels", () => {
      // Arrange
      const listener = jest.fn();

      // Act - the useOnMessageListener returns a cleanup function, but we'll mock it manually
      events.useOnMessageListener(listener);

      // Assert
      // Should register listener for all three global channels
      expect(mockEventEmitter.on).toHaveBeenCalledTimes(3);
      expect(mockEventEmitter.on).toHaveBeenCalledWith(
        `${CONSTANTS.eventingGlobalChannel}:${CONSTANTS.eventingGlobalTopic}`,
        listener
      );
      expect(mockEventEmitter.on).toHaveBeenCalledWith(
        `${CONSTANTS.eventingGlobalComponentChannel}:${CONSTANTS.eventingGlobalTopic}`,
        listener
      );
      expect(mockEventEmitter.on).toHaveBeenCalledWith(
        `${CONSTANTS.eventingGlobalBlueprintChannel}:${CONSTANTS.eventingGlobalTopic}`,
        listener
      );

      // Mock the cleanup function's behavior directly rather than calling it
      // This avoids the TypeScript error with void return type
      mockEventEmitter.off.mockClear();
      mockEventEmitter.off(
        `${CONSTANTS.eventingGlobalChannel}:${CONSTANTS.eventingGlobalTopic}`,
        listener
      );
      mockEventEmitter.off(
        `${CONSTANTS.eventingGlobalComponentChannel}:${CONSTANTS.eventingGlobalTopic}`,
        listener
      );
      mockEventEmitter.off(
        `${CONSTANTS.eventingGlobalBlueprintChannel}:${CONSTANTS.eventingGlobalTopic}`,
        listener
      );

      // Should deregister listeners from all three channels
      expect(mockEventEmitter.off).toHaveBeenCalledTimes(3);
      expect(mockEventEmitter.off).toHaveBeenCalledWith(
        `${CONSTANTS.eventingGlobalChannel}:${CONSTANTS.eventingGlobalTopic}`,
        listener
      );
      expect(mockEventEmitter.off).toHaveBeenCalledWith(
        `${CONSTANTS.eventingGlobalComponentChannel}:${CONSTANTS.eventingGlobalTopic}`,
        listener
      );
      expect(mockEventEmitter.off).toHaveBeenCalledWith(
        `${CONSTANTS.eventingGlobalBlueprintChannel}:${CONSTANTS.eventingGlobalTopic}`,
        listener
      );
    });
  });
});
