import type { BlueprintEvent } from "./blueprint.event";
import type { EventAddress } from "./event.address";
import { EventQueue, IEventQueue } from "./event.queue";
import { serializeAddress } from "./seralize.address";

/**
 * Event Sink
 * @description An Event sink manages the channel / topic / queue mappings.
 * @description Each channel/topic combination maps to a EventQueue of a predetermined link (default 10)
 * @category (Eventing)
 * @author Zach Ayers
 * @internal
 */
export interface IEventSink {
  /**
   * The internal Map which holds the channel/topic -> EventQueue mappings.
   */
  eventMap: Map<string, IEventQueue>;

  /**
   * Get the EventQueue associated with a channel:topic combination.
   * If an EventQueue is not found - create one and set it to a key of channel:topic in the eventMap.
   * @param {EventAddress} address The channel:topic combination.
   * @returnss {IEventQueue<AnyObject>} An event queue of the most recent payloads.
   * @internal
   * @example
   * ```typescript
   * // Create an event.
   * const address: EventAddress = { channel: 'my-channel', topic: 'my-topic' };
   *
   * // Ge the existing queue (or a new queue) associated with the EventAddress
   * const eventQueue = this.getKeyMappedQueue(eventAddress);
   * ```
   */
  getKeyMappedQueue(address: EventAddress): IEventQueue;

  /**
   * View the next (newest) item in a channel:topic associated queue
   * @description Peeking will view the first item in the queue.
   * @returnss { P | undefined } - The generic member at the first position in the queue.
   * @example
   * ```typescript
   * // Create a new event sink that intakes a generic type of string.
   * const eventSink = new EventSink<string>();
   *
   * // Create an event.
   * const event: BlueprintEvent = { channel: 'my-channel', topic: 'my-topic', payload: 'my-payload' };
   *
   * // Add an event to the queue
   * eventSink.push(event);
   *
   * // View the first item in the associated queue
   * const firstItem = eventSink.peek({ channel: event.channel, topic: event.topic });
   * ```
   */
  peek<P>(address: EventAddress): P | undefined;

  /**
   * Add a new item to the channel:topic associated queue
   * @description New event payloads will be added to the end of the queue.
   * @returnss {void}
   * @example
   * ```typescript
   * // Create a new event sink that intakes a generic type of string.
   * const eventSink = new EventSink<string>();
   *
   * // Create an event.
   * const event: BlueprintEvent = { channel: 'my-channel', topic: 'my-topic', payload: 'my-payload' };
   *
   * // Add an event to the queue
   * eventSink.push(event);
   * ```
   */
  push<P>(event: BlueprintEvent<P>): void;
}

/**
 * @see IEventSink
 * @internal
 * @category (Eventing)
 */
export class EventSink implements IEventSink {
  public eventMap: Map<string, IEventQueue>;

  /** @inheritDoc */
  public getKeyMappedQueue(address: EventAddress): IEventQueue {
    return this.eventMap.get(serializeAddress(address)) ?? new EventQueue();
  }

  /** @inheritDoc */
  public peek<P>(address: EventAddress): P | undefined {
    return this.getKeyMappedQueue(address).peek();
  }

  /** @inheritDoc */
  public push<P>(event: BlueprintEvent<P>): void {
    const eventAddress: EventAddress = {
      channel: event.channel,
      topic: event.topic,
    };
    const eventQueue = this.getKeyMappedQueue(eventAddress);

    eventQueue.enqueue(event.payload);

    this.eventMap.set(serializeAddress(eventAddress), eventQueue);
  }

  /**
   * EventSink creation
   * This constructor instantiates a new eventMap when initialized.
   */
  constructor() {
    this.eventMap = new Map<string, IEventQueue>();
  }
}
