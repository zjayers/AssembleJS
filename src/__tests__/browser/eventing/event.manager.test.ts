import {
  EventManager,
  getEventManager,
} from "../../../browser/eventing/event.manager";
import * as getWindowModule from "../../../browser/common/get.window";

// Mock dependencies
jest.mock("../../../browser/common/get.window");
jest.mock("events", () => {
  return {
    EventEmitter: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    })),
  };
});
jest.mock("../../../browser/eventing/event.sink", () => {
  return {
    EventSink: jest.fn().mockImplementation(() => ({
      eventMap: new Map(),
      getKeyMappedQueue: jest.fn(),
      peek: jest.fn(),
      push: jest.fn(),
    })),
  };
});

describe("EventManager", () => {
  // Setup mocks
  let mockWindow: any;
  let mockEventEmitter: any;
  let mockEventSink: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock EventEmitter
    mockEventEmitter = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    };

    // We'll use the jest.requireMock approach to get the mocked constructor
    const { EventEmitter } = jest.requireMock("events");
    EventEmitter.mockImplementation(() => mockEventEmitter);

    // Setup mock EventSink
    mockEventSink = {
      eventMap: new Map(),
      getKeyMappedQueue: jest.fn(),
      peek: jest.fn(),
      push: jest.fn(),
    };

    // We'll use the jest.requireMock approach to get the mocked constructor
    const { EventSink } = jest.requireMock(
      "../../../browser/eventing/event.sink"
    );
    EventSink.mockImplementation(() => mockEventSink);

    // Setup mock window
    mockWindow = {};
    (getWindowModule.getWindow as jest.Mock).mockReturnValue(mockWindow);
  });

  describe("getEventManager", () => {
    it("should create a new EventManager if one does not exist on the window", () => {
      // Act
      const result = getEventManager();

      // Assert
      expect(getWindowModule.getWindow).toHaveBeenCalled();
      const { EventEmitter } = jest.requireMock("events");
      expect(EventEmitter).toHaveBeenCalled();
      const { EventSink } = jest.requireMock(
        "../../../browser/eventing/event.sink"
      );
      expect(EventSink).toHaveBeenCalled();

      expect(result).toEqual({
        eventEmitter: mockEventEmitter,
        eventSink: mockEventSink,
      });

      // Should be stored on the window
      expect(mockWindow.ASSEMBLE_EVENT_MANAGER).toBe(result);
    });

    it("should return the existing EventManager if one exists on the window", () => {
      // Arrange
      const existingManager: EventManager = {
        eventEmitter: mockEventEmitter,
        eventSink: mockEventSink,
      };
      mockWindow.ASSEMBLE_EVENT_MANAGER = existingManager;

      // Act
      const result = getEventManager();

      // Assert
      expect(getWindowModule.getWindow).toHaveBeenCalled();
      expect(result).toBe(existingManager);

      // Should not create new instances
      const { EventEmitter } = jest.requireMock("events");
      expect(EventEmitter).not.toHaveBeenCalled();
      const { EventSink } = jest.requireMock(
        "../../../browser/eventing/event.sink"
      );
      expect(EventSink).not.toHaveBeenCalled();
    });

    it("should handle errors from getWindow by propagating them", () => {
      // Arrange
      const error = new Error("Unable to locate global object!");
      (getWindowModule.getWindow as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => getEventManager()).toThrow(error);
    });
  });
});
