import type { EventEmitter } from "events";
import type { IEventSink } from "./event.sink";
import type { EventAddress } from "./event.address";
import type { BlueprintEvent } from "./blueprint.event";
import { serializeAddress, serializeEventAddress } from "./seralize.address";
import { getEventManager } from "./event.manager";
import { CONSTANTS } from "../../constants/blueprint.constants";

/**
 * AssembleJS View Event Adapter
 * @author Zach Ayers*/
export interface ViewEventAdapter {
  /**
   * Send an event to the global channel and topic for 'COMPONENTS'.
   * @description - Only the top level Blueprint will receive this message.
   * @param {Payload} payload - The payload to send with the event.
   * @param {string} topic - The topic to send the event to.
   * @returns {BlueprintEvent<Response>} - The event that was sent.
   * @author Zach Ayers
   */
  toComponents<Payload, Response>(
    payload: Payload,
    topic?: string
  ): BlueprintEvent<Response>;

  /**
   * Send an event to the global channel and topic for 'BLUEPRINTS'.
   * @description - Only the top level Blueprint will receive this message.
   * @param {Payload} payload - The payload to send with the event.
   * @param {string} topic - The topic to send the event to.
   * @returns {BlueprintEvent<Response>} - The event that was sent.
   * @author Zach Ayers
   */
  toBlueprint<Payload, Response>(
    payload: Payload,
    topic?: string
  ): BlueprintEvent<Response>;

  /**
   * Send an event to the global channel and topic.
   * @description - ALL Blueprints and Components will receive this message.
   * @param {Payload} payload - The payload to send.
   * @param {string} topic - The topic to send the payload to.
   * @returns {BlueprintEvent<Response>} - The event that was sent. Responses should be handled through callbacks or additional events.
   * @author Zach Ayers
   */
  toAll<Payload, Response>(
    payload: Payload,
    topic?: string
  ): BlueprintEvent<Response>;
}

/**
 * Event Listener declaration for us by the EventManager / EventEmitter to register / un-register events.
 * @category (Eventing)
 * @author Zach Ayers
 * @internal
 * @example
 * ```typescript
 * // Initialize the eventBus
 * const eventBus = new EventBus();
 *
 * // Create an eventing address.
 * const address: EventAddress = { channel: 'my-channel', topic: 'my-topic' };
 *
 * // Create an anonymous event listener function
 * const eventListener: EventListener<number> = (payload => console.log(payload));
 *
 * // Subscribe to the address and use the predefined listener.
 * eventBus.subscribe(address, eventListener);
 *
 * ...
 *
 * // Upon some removal logic, you may also unregister the listener
 * eventBus.unsubscribe(address, eventListener);
 * ```
 */
export type EventListener<P = unknown> = (
  blueprintEvent: BlueprintEvent<P>
) => void;

/**
 * Event Bus
 * @description An Event bus makes use of an EventSink, EvenEmitter, and EventQueue to pass events using the global window object.
 * @description Event addresses may be published or subscribed to - to pass payloads between front end services.
 * @category (Eventing)
 * @author Zach Ayers
 * @public
 */
export interface IEventBus extends ViewEventAdapter {
  /**
   * Emits browser side events and exists as a singleton emitter on the Event Manager object.
   */
  eventEmitter: EventEmitter;

  /**
   * Source of truth for creating and managing the EventQueue.
   */
  eventSink: IEventSink;

  /**
   * View the next (newest) item in a channel:topic associated queue
   * @author Zach Ayers
   * @example
   *
   * ```typescript
   * // Create a new event sink that intakes a generic type of string.
   * const eventBus = new EventBus<string>();
   *
   * // Create an event.
   * const event: BlueprintEvent = { channel: 'my-channel', topic: 'my-topic', payload: 'my-payload' };
   *
   * // Add an event to the queue
   * eventBus.publish(event);
   *
   * // View the first item in the associated queue
   * const firstItem = eventBus.peek({ channel: event.channel, topic: event.topic });
   * ```
   */
  peek<P>(address: EventAddress): P | undefined;

  /**
   * Add a new item to the channel:topic associated queue
   * @description New event payloads will be added to the end of the queue.
   * @author Zach Ayers
   * @returnss {Event} The published event.
   * @example
   *
   * ```typescript
   * // Create a new event sink that intakes a generic type of string.
   * const eventBus = new EventBus<string>();
   *
   * // Create an event.
   * const event: BlueprintEvent = { channel: 'my-channel', topic: 'my-topic', payload: 'my-payload' };
   *
   * // Add an event to the queue
   * eventBus.publish(event));
   * ```
   */
  publish<P>(event: BlueprintEvent<P>): BlueprintEvent<P>;

  /**
   * Subscribe to an EventAddress
   * and perform an action when a payload is received on that channel:topic.
   * @author Zach Ayers
   * @returnss {void}
   * @example
   *
   * ```typescript
   * // Initialize the eventBus
   * const eventBus = new EventBus();
   *
   * // Create an eventing address.
   * const address: EventAddress = { channel: 'my-channel', topic: 'my-topic' };
   *
   * // Create an anonymous event listener function
   * const eventListener: EventListener<number> = (payload => console.log(payload));
   *
   * // Subscribe to the address and use the predefined listener.
   * eventBus.subscribe(address, eventListener);
   *
   * // Upon some removal logic, you may also unregister the listener
   * eventBus.unsubscribe(address, eventListener);
   * ```
   */
  subscribe<P>(address: EventAddress, listener: EventListener<P>): void;

  /**
   * Unsubscribe from an EventAddress
   * @author Zach Ayers
   * @returnss {void}
   * @example
   *
   * ```typescript
   * // Initialize the eventBus
   * const eventBus = new EventBus();
   *
   * // Create an eventing address.
   * const address: EventAddress = { channel: 'my-channel', topic: 'my-topic' };
   *
   * // Create an anonymous event listener function
   * const eventListener: EventListener<number> = (payload => console.log(payload));
   *
   * // Subscribe to the address and use the predefined listener.
   * eventBus.subscribe(address, eventListener);
   *
   * ...
   *
   * // Upon some removal logic, you may also unregister the listener
   * eventBus.unsubscribe(address, eventListener);
   * ```
   */
  unsubscribe(address: EventAddress, listener: EventListener): void;
}

/**
 * @see IEventBus
 * @public
 * @category (Eventing)
 */
export class EventBus implements IEventBus {
  public eventEmitter: EventEmitter;
  public eventSink: IEventSink;

  /** @inheritDoc */
  public peek<P>(address: EventAddress): P | undefined {
    return this.eventSink.peek(address);
  }

  /** @inheritDoc */
  public publish<P>(event: BlueprintEvent<P>): BlueprintEvent<P> {
    // Validate event has required properties before publishing
    if (!event.channel || !event.topic) {
      throw new Error("Event must have channel and topic properties");
    }

    this.eventEmitter.emit(serializeEventAddress(event), event);
    this.eventSink.push(event);

    // Return the same event with its original type rather than unsafe casting
    return event;
  }

  /** @inheritDoc */
  public toAll<Payload, Response = Payload>(
    payload: Payload,
    topic: string = CONSTANTS.eventingGlobalTopic
  ): BlueprintEvent<Response> {
    return this.publish<Payload>({
      channel: CONSTANTS.eventingGlobalChannel,
      topic: topic,
      payload,
    }) as unknown as BlueprintEvent<Response>;
  }

  /** @inheritDoc */
  public toComponents<Payload, Response = Payload>(
    payload: Payload,
    topic: string = CONSTANTS.eventingGlobalTopic
  ): BlueprintEvent<Response> {
    return this.publish<Payload>({
      channel: CONSTANTS.eventingGlobalComponentChannel,
      topic: topic,
      payload,
    }) as unknown as BlueprintEvent<Response>;
  }

  /** @inheritDoc */
  public toBlueprint<Payload, Response = Payload>(
    payload: Payload,
    topic: string = CONSTANTS.eventingGlobalTopic
  ): BlueprintEvent<Response> {
    return this.publish<Payload>({
      channel: CONSTANTS.eventingGlobalBlueprintChannel,
      topic: topic,
      payload,
    }) as unknown as BlueprintEvent<Response>;
  }

  /** @inheritDoc */
  public subscribe<P>(address: EventAddress, listener: EventListener<P>): void {
    this.eventEmitter.on(serializeAddress(address), listener);
  }

  /** @inheritDoc */
  public unsubscribe(address: EventAddress, listener: EventListener): void {
    this.eventEmitter.off(serializeAddress(address), listener);
  }

  /**
   * EventBus Constructor
   * Initializing an event bus will ensure there is an EventManager on the global window object.
   * Once an EventManager is created, the EventSink and EventEmitter will be referenced by this class.
   */
  constructor() {
    const { eventEmitter, eventSink } = getEventManager();
    this.eventEmitter = eventEmitter;
    this.eventSink = eventSink;
  }
}

/** @inheritDoc */
function publish<P, R>(address: EventAddress, payload: P): BlueprintEvent<R> {
  const eventManager = getEventManager();
  const event = { ...address, payload };
  eventManager.eventEmitter.emit(serializeEventAddress(event), event);
  eventManager.eventSink.push(event);
  return event as unknown as BlueprintEvent<R>;
}

/** @inheritDoc */
function subscribe<P>(address: EventAddress, listener: EventListener<P>): void {
  getEventManager().eventEmitter.on(serializeAddress(address), listener);
}

/**
 * Functional Eventing Interface
 * @description - Use this to access the AssembleJS eventing system outside an AssembleJS View.
 * @type {{Partial<IEventBus>}}
 * @author Zach Ayers
 */
export const events: Pick<
  IEventBus,
  | "subscribe"
  | "unsubscribe"
  | "peek"
  | "toAll"
  | "toComponents"
  | "toBlueprint"
> & {
  publish: <P, R>(address: EventAddress, payload: P) => BlueprintEvent<R>;
  useOnMessageListener<P>(listener: (message: BlueprintEvent<P>) => void): void;
} = {
  publish,
  subscribe,
  unsubscribe: function (
    address: EventAddress,
    listener: EventListener<unknown>
  ): void {
    getEventManager().eventEmitter.off(serializeAddress(address), listener);
  },
  peek: function <P>(address: EventAddress): P | undefined {
    return getEventManager().eventSink.peek(address);
  },
  toAll: function <P, R>(payload: P): BlueprintEvent<R> {
    return publish(
      {
        channel: CONSTANTS.eventingGlobalChannel,
        topic: CONSTANTS.eventingGlobalTopic,
      },
      payload
    );
  },
  toComponents: function <P, R>(payload: P): BlueprintEvent<R> {
    return publish(
      {
        channel: CONSTANTS.eventingGlobalComponentChannel,
        topic: CONSTANTS.eventingGlobalTopic,
      },
      payload
    );
  },
  toBlueprint: function <P, R>(payload: P): BlueprintEvent<R> {
    return publish(
      {
        channel: CONSTANTS.eventingGlobalBlueprintChannel,
        topic: CONSTANTS.eventingGlobalTopic,
      },
      payload
    );
  },
  /**
   * Specialized Message listener hook.
   * @description When using outside a Blueprint - this hook will allow you to subscribe to the global channels.
   * @param {EventListener} listener - The event listener function to register
   * @return {Function} - A cleanup function that unsubscribes all listeners to prevent memory leaks
   */
  useOnMessageListener<P>(listener: EventListener<P>): () => void {
    const addresses = [
      // Global
      {
        channel: CONSTANTS.eventingGlobalChannel,
        topic: CONSTANTS.eventingGlobalTopic,
      },
      // Components
      {
        channel: CONSTANTS.eventingGlobalComponentChannel,
        topic: CONSTANTS.eventingGlobalTopic,
      },
      // Blueprints
      {
        channel: CONSTANTS.eventingGlobalBlueprintChannel,
        topic: CONSTANTS.eventingGlobalTopic,
      },
    ];

    // Subscribe to all channels
    addresses.forEach((address) => {
      subscribe(address, listener);
    });

    // Return a cleanup function to unsubscribe from all channels
    return () => {
      addresses.forEach((address) => {
        getEventManager().eventEmitter.off(serializeAddress(address), listener);
      });
    };
  },
};
