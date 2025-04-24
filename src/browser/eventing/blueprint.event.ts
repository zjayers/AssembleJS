/**
 * Event interface used by the Eventing system
 * @author Zachariah Ayers
 * @category Eventing
 * @public
 * @example
 * ```typescript
 * // Create an event that expects a payload of type 'string'.
 * const event: BlueprintEvent<string> = { channel: 'my-channel', topic: 'my-topic', payload: 'my-payload' };
 * ```
 */
export interface BlueprintEvent<P> {
  /**
   * The channel to publish the event on. Channels may have many topics.
   */
  channel: string;

  /**
   * The topic to publish within the channel. Channel / Topic combinations relate to a single event queue.
   * New payloads are added to the end of the matching event queue if one is found.
   */
  topic: string;

  /**
   * The payload to publish on the corresponding channel & topic.
   */
  payload: P;
}
