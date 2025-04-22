import { EventQueue } from "../../../browser/eventing/event.queue";
import { EventSink } from "../../../browser/eventing/event.sink";
import { serializeAddress } from "../../../browser/eventing/seralize.address";

// Mock the EventQueue class
jest.mock("../../../browser/eventing/event.queue");
jest.mock("../../../browser/eventing/seralize.address");

describe("EventSink", () => {
  let eventSink: EventSink;
  let mockEventQueue: jest.Mocked<EventQueue>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock for serializeAddress
    (serializeAddress as jest.Mock).mockImplementation(
      (address) => `${address.channel}:${address.topic}`
    );

    // Setup mock EventQueue
    mockEventQueue = new EventQueue() as jest.Mocked<EventQueue>;
    (EventQueue as jest.Mock).mockImplementation(() => mockEventQueue);

    // Create a new EventSink for each test
    eventSink = new EventSink();
  });

  describe("constructor", () => {
    it("should initialize with an empty Map", () => {
      expect(eventSink.eventMap).toBeInstanceOf(Map);
      expect(eventSink.eventMap.size).toBe(0);
    });
  });

  describe("getKeyMappedQueue", () => {
    it("should return a new EventQueue if no queue exists for the address", () => {
      // Arrange
      const address = { channel: "test-channel", topic: "test-topic" };
      const serializedAddress = "test-channel:test-topic";
      (serializeAddress as jest.Mock).mockReturnValue(serializedAddress);

      // Act
      const result = eventSink.getKeyMappedQueue(address);

      // Assert
      expect(serializeAddress).toHaveBeenCalledWith(address);
      expect(EventQueue).toHaveBeenCalled();
      expect(result).toBe(mockEventQueue);
    });

    it("should return an existing EventQueue if one exists for the address", () => {
      // Arrange
      const address = { channel: "test-channel", topic: "test-topic" };
      const serializedAddress = "test-channel:test-topic";
      const existingQueue = new EventQueue() as jest.Mocked<EventQueue>;

      (serializeAddress as jest.Mock).mockReturnValue(serializedAddress);
      eventSink.eventMap.set(serializedAddress, existingQueue);

      // Act
      const result = eventSink.getKeyMappedQueue(address);

      // Assert
      expect(serializeAddress).toHaveBeenCalledWith(address);
      expect(result).toBe(existingQueue);
    });
  });

  describe("peek", () => {
    it("should call peek on the queue for the given address", () => {
      // Arrange
      const address = { channel: "test-channel", topic: "test-topic" };
      const mockPayload = { data: "test-data" };

      // Setup mock to return a value from peek
      mockEventQueue.peek.mockReturnValue(mockPayload);

      // Mock getKeyMappedQueue to return our mockEventQueue
      jest
        .spyOn(eventSink, "getKeyMappedQueue")
        .mockReturnValue(mockEventQueue);

      // Act
      const result = eventSink.peek(address);

      // Assert
      expect(eventSink.getKeyMappedQueue).toHaveBeenCalledWith(address);
      expect(mockEventQueue.peek).toHaveBeenCalled();
      expect(result).toBe(mockPayload);
    });

    it("should return undefined if the queue is empty", () => {
      // Arrange
      const address = { channel: "test-channel", topic: "test-topic" };

      // Setup mock to return undefined from peek
      mockEventQueue.peek.mockReturnValue(undefined);

      // Mock getKeyMappedQueue to return our mockEventQueue
      jest
        .spyOn(eventSink, "getKeyMappedQueue")
        .mockReturnValue(mockEventQueue);

      // Act
      const result = eventSink.peek(address);

      // Assert
      expect(eventSink.getKeyMappedQueue).toHaveBeenCalledWith(address);
      expect(mockEventQueue.peek).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe("push", () => {
    it("should add the payload to the queue for the given event address", () => {
      // Arrange
      const event = {
        channel: "test-channel",
        topic: "test-topic",
        payload: { data: "test-data" },
      };
      const serializedAddress = "test-channel:test-topic";

      (serializeAddress as jest.Mock).mockReturnValue(serializedAddress);

      // Mock getKeyMappedQueue to return our mockEventQueue
      jest
        .spyOn(eventSink, "getKeyMappedQueue")
        .mockReturnValue(mockEventQueue);

      // Act
      eventSink.push(event);

      // Assert
      expect(eventSink.getKeyMappedQueue).toHaveBeenCalledWith({
        channel: event.channel,
        topic: event.topic,
      });
      expect(mockEventQueue.enqueue).toHaveBeenCalledWith(event.payload);
      expect(serializeAddress).toHaveBeenCalledWith({
        channel: event.channel,
        topic: event.topic,
      });
      expect(eventSink.eventMap.get(serializedAddress)).toBe(mockEventQueue);
    });

    it("should create a new queue if one does not exist for the address", () => {
      // Arrange
      const event = {
        channel: "test-channel",
        topic: "test-topic",
        payload: { data: "test-data" },
      };
      const serializedAddress = "test-channel:test-topic";

      (serializeAddress as jest.Mock).mockReturnValue(serializedAddress);

      // Act
      eventSink.push(event);

      // Assert
      expect(eventSink.eventMap.has(serializedAddress)).toBe(true);
      expect(mockEventQueue.enqueue).toHaveBeenCalledWith(event.payload);
    });
  });
});
