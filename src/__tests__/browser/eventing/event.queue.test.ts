import { EventQueue } from "../../../browser/eventing/event.queue";

describe("EventQueue", () => {
  let eventQueue: EventQueue;

  beforeEach(() => {
    // Create a new EventQueue for each test
    eventQueue = new EventQueue();
  });

  describe("constructor", () => {
    it("should initialize with default maxQueueLength of 10", () => {
      expect(eventQueue.maxQueueLength).toBe(10);
      expect(eventQueue.queueStore).toEqual([]);
    });

    it("should initialize with custom maxQueueLength", () => {
      const customQueue = new EventQueue(5);
      expect(customQueue.maxQueueLength).toBe(5);
      expect(customQueue.queueStore).toEqual([]);
    });
  });

  describe("enqueue", () => {
    it("should add an item to the queue", () => {
      // Act
      eventQueue.enqueue("test-item");

      // Assert
      expect(eventQueue.queueStore).toEqual(["test-item"]);
    });

    it("should call trim when adding an item", () => {
      // Arrange
      const trimSpy = jest.spyOn(eventQueue, "trim");

      // Act
      eventQueue.enqueue("test-item");

      // Assert
      expect(trimSpy).toHaveBeenCalled();
    });

    it("should add multiple items to the queue", () => {
      // Act
      eventQueue.enqueue("item1");
      eventQueue.enqueue("item2");
      eventQueue.enqueue("item3");

      // Assert
      expect(eventQueue.queueStore).toEqual(["item1", "item2", "item3"]);
    });
  });

  describe("dequeue", () => {
    it("should remove and return the first item from the queue", () => {
      // Arrange
      eventQueue.enqueue("item1");
      eventQueue.enqueue("item2");

      // Act
      const result = eventQueue.dequeue();

      // Assert
      expect(result).toBe("item1");
      expect(eventQueue.queueStore).toEqual(["item2"]);
    });

    it("should return undefined for an empty queue", () => {
      // Act
      const result = eventQueue.dequeue();

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("peek", () => {
    it("should return the first item without removing it", () => {
      // Arrange
      eventQueue.enqueue("item1");
      eventQueue.enqueue("item2");

      // Act
      const result = eventQueue.peek();

      // Assert
      expect(result).toBe("item1");
      expect(eventQueue.queueStore).toEqual(["item1", "item2"]); // Item still in queue
    });

    it("should return undefined for an empty queue", () => {
      // Act
      const result = eventQueue.peek();

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("trim", () => {
    it("should remove oldest item when queue length equals maxQueueLength", () => {
      // Arrange
      const smallQueue = new EventQueue(3);
      smallQueue.enqueue("item1");
      smallQueue.enqueue("item2");
      smallQueue.enqueue("item3");

      // Act - adding a 4th item should trigger trim to remove the oldest
      smallQueue.enqueue("item4");

      // Assert
      expect(smallQueue.queueStore).toEqual(["item2", "item3", "item4"]);
    });

    it("should not remove items when queue length is less than maxQueueLength", () => {
      // Arrange
      eventQueue.enqueue("item1");
      eventQueue.enqueue("item2");

      // Act - manually call trim
      eventQueue.trim();

      // Assert
      expect(eventQueue.queueStore).toEqual(["item1", "item2"]);
    });

    it("should remove multiple items to keep the queue at maxQueueLength", () => {
      // Arrange
      const smallQueue = new EventQueue(2);
      smallQueue.enqueue("item1");
      smallQueue.enqueue("item2");

      // Act - adding 3 more items should keep only the last 2
      smallQueue.enqueue("item3");
      smallQueue.enqueue("item4");
      smallQueue.enqueue("item5");

      // Assert
      expect(smallQueue.queueStore).toEqual(["item4", "item5"]);
    });
  });
});
