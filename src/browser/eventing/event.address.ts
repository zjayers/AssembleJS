import type { BlueprintEvent } from "./blueprint.event";

/**
 * Address to use when publishing/subscribing to events.
 * @category (Eventing)
 * @author Zach Ayers
 * @public
 * @example
 * ```typescript
 * // Build the Address
 * const address: EventAddress = {
 *   channel: 'my-channel',
 *   topic: 'my-topic'
 * }
 *
 * // Initialize an eventBus
 * const eventBus = new EventBus();
 *
 * // Publish a payload to the address
 * eventBus.publish(address, {data: 'my-payload'}
 * ```
 */
export type EventAddress = Omit<BlueprintEvent<never>, "payload">;
