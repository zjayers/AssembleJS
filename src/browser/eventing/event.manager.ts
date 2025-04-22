import { EventEmitter } from "events";
import { EventSink, IEventSink } from "./event.sink";
import { getWindow } from "../common/get.window";

/**
 * @module Event Manager
 * @description The EventManager is responsible for registering and de-registering event listeners on the global window.
 * @description The EventManager consists of an EventEmitter object, and an EventSink for managing the internal event queue system.
 * @description Front end services may publish and subscribe to events delegated by the EventManager.
 * @author Zach Ayers
 * @internal
 */
declare global {
  interface Window {
    ASSEMBLE_EVENT_MANAGER: EventManager;
  }
}

/**
 * Event Manager Declaration - Implementing this interface creates a new Event Manager object.
 * @description The Event Manager consists of two pieces - EventEmitter & EventSink
 * @category (Eventing)
 * @author Zach Ayers
 * @internal
 * @example
 * ```typescript
 * // Create a new Event Manager
 * const eventManager: EventManager = {
 *  eventEmitter: new EventEmitter(),
 *  eventSink: new EventSink(),
 * };
 * ```
 */
export interface EventManager {
  /**
   * Event Manager - Event Emitter
   * @description Emits browser side events and exists as a singleton emitter on the Event Manager object.
   * @internal
   */
  eventEmitter: EventEmitter;
  /**
   * Event Manager - Event Sink
   * @description Source of truth for creating and managing the EventQueue.
   * @internal
   */
  eventSink: IEventSink;
}

/**
 * Get the Event Manager singleton from the global window. If one does not exist, create a new singleton.
 * @category (Eventing)
 * @author Zach Ayers
 * @return {EventManager} The singleton Event Manager instance (stored on the window object)
 * @internal
 * @example
 * ```typescript
 * // Get the global EventManager from the window object
 * const eventManager: EventManger = getWindow().assembleEventManager;
 * ```
 */
export function getEventManager(): EventManager {
  // Get the window object
  const globalWindow = getWindow();

  // Pull the EventManager from the window.
  let eventManager = globalWindow.ASSEMBLE_EVENT_MANAGER;

  // If no EventManager was found, create one.
  if (!eventManager) {
    // Create a new EventManager, and initialize a new EventEmitter and EventSink
    eventManager = {
      eventEmitter: new EventEmitter(),
      eventSink: new EventSink(),
    };

    // Set the new EventManager on the window object.
    globalWindow.ASSEMBLE_EVENT_MANAGER = eventManager;
  }

  // Return the found (or new) EventManager object.
  return eventManager;
}
