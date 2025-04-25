import type { BlueprintEvent } from "./blueprint.event";
import type { EventAddress } from "./event.address";

/**
 * Serialize the channel and topic of an Event so it may be used as a key identifier in a Map
 * @param {Event<any>} event - The event whose channel and topic need to be serialized.
 * @return {string} - The channel and topic in the format of '<channel>:<topic>'
 * @category Eventing
 * @author Zachariah Ayers
 * @internal
 * @example
 * ```typescript
 * // Create an event.
 * const event: BlueprintEvent = { channel: 'my-channel', topic: 'my-topic', payload: 'my-payload' };
 *
 * // Create a Map that stores Events based on their serialized address.
 * const myMap = new Map<string, Event>();
 *
 * // Serialize the address and append to the Map.
 * myMap.set(serializeEventAddress(event), event.payload);
 * ```
 */
export function serializeEventAddress(event: BlueprintEvent<any>): string {
  // Pull out the address and pass it to the serializer
  return serializeAddress({ channel: event.channel, topic: event.topic });
}

/**
 * Serialize the channel and topic of an EventAddress so it may be used as a key identifier in a Map
 * @param {EventAddress} address - The event address whose channel and topic need to be serialized.
 * @return {string} - The channel and topic in the format of '<channel>:<topic>'
 * @category Eventing
 * @author Zachariah Ayers
 * @internal
 * @example
 * ```typescript
 * // Create an event address.
 * const address: EventAddress = { channel: 'my-channel', topic: 'my-topic' };
 *
 * // Create a Map that stores Events based on their serialized address.
 * const myMap = new Map<string, Event>();
 *
 * // Serialize the address and append to the Map.
 * myMap.set(serializeAddress(address), 'my-payload');
 * ```
 */
export function serializeAddress(address: EventAddress): string {
  return `${address.channel}:${address.topic}`;
}
