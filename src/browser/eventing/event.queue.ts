/**
 * Event Queue
 * @description An Event queue is a simple array that adds new events to the beginning and trims old events from the end.
 * @description Members may be 'enqueued' to the queue, viewed, and dequeued
 * @category Eventing
 * @author Zachariah Ayers
 * @internal
 */
export interface IEventQueue {
  /**
   * The max length of the EventQueue
   * @default 10
   */
  maxQueueLength: number;

  /**
   * Simple array that stores the most recent events.
   */
  queueStore: Array<unknown>;

  /**
   * Add an item to the Queue
   * @description Items are added at the end of the Queue
   * @typeParam {P} payload - The payload to add to the storage array.
   * @returns {void}
   * @example
   * ```typescript
   * // Create a new event queue for string types and add a payload to the Queue
   * new EventQueue<string>().enqueue('hello')
   * ```
   */
  enqueue<P>(payload: P): void;

  /**
   * Remove an item from the queue
   * @description Items are removed from the beginning of the storage array.
   * @returns {P | undefined} - The generic member at the first position in the queue.
   * @example
   * ```typescript
   * // Create a new event queue that intakes a generic type of string.
   * const eventQueue = new EventQueue<string>();
   *
   * // Add a member to the queue
   * eventQueue.enqueue('hello');
   *
   * // Remove the queued item
   * eventQueue.dequeue();
   * ```
   */
  dequeue<P>(): P | undefined;

  /**
   * View the next (newest) item in the queue
   * @description Peeking will view the first item in the storage array.
   * @returns {P | undefined} - The generic member at the first position in the queue.
   * @example
   * ```typescript
   * // Create a new event queue that intakes a generic type of string.
   * const eventQueue = new EventQueue<string>();
   *
   * // Add a member to the queue
   * eventQueue.enqueue('hello');
   *
   * // View the first item in the queue
   * const upcomingEventPayload = eventQueue.peek();
   * ```
   */
  peek<P>(): P | undefined;

  /**
   * When the storage array reaches the defined maxQueueLength, dequeue the oldest item in the queue.
   * @description Trimming will first check the length of the storage array. If the length is grater than maxQueueLength, the first item in the array will be removed.
   * @returns {void}
   * @example
   * ```typescript
   * // Create a new event queue that intakes a generic type of string.
   * // Pass in a maxQueueLength of 5
   * const eventQueue = new EventQueue<string>(5);
   *
   * // Add a member to the queue
   * eventQueue.enqueue(1);
   * eventQueue.enqueue(2);
   * eventQueue.enqueue(3);
   * eventQueue.enqueue(4);
   *
   * // Once we add the 5th item,
   * // our maxQueueLength will be met and the `trim` function will fire
   * eventQueue.enqueue(5);
   * ```
   */
  trim(): void;
}

/**
 * @see IEventQueue
 * @internal
 * @category Eventing
 */
export class EventQueue implements IEventQueue {
  public maxQueueLength: number;
  public queueStore: Array<unknown>;

  /** @inheritDoc */
  public enqueue<P>(payload: P): void {
    this.trim();
    this.queueStore.push(payload);
  }

  /** @inheritDoc */
  public dequeue<P>(): P | undefined {
    return <P>this.queueStore.shift();
  }

  /** @inheritDoc */
  public peek<P>(): P | undefined {
    return <P>this.queueStore[0];
  }

  /** @inheritDoc */
  public trim(): void {
    if (this.queueStore.length >= this.maxQueueLength) {
      this.dequeue();
    }
  }

  /**
   * Event Queue creation
   * @param {number} maxQueueLength - The max length the Queue can be before trimming older items.
   */
  constructor(maxQueueLength: number = 10) {
    this.maxQueueLength = maxQueueLength;
    this.queueStore = [];
  }
}
