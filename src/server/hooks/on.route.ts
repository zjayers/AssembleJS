import type { ApiRouteOptions } from "../../types/blueprint.simple.types";

/**
 * Triggered when a new route is registered.
 * Listeners are passed a routeOptions object as the sole parameter.
 * The interface is synchronous, and, as such, the listeners are not passed a callback.
 * This hook is encapsulated.
 * @returns {Promise<void>}
 * @internal
 * @category (Hooks)
 * @author Zach Ayers
 * @example
 * ```typescript
 * (routeOptions) => {
 *   function onPreSerialization(request, reply, payload, done) {
 *     // Your code
 *     done(null, payload)
 *   }
 *   // preSerialization can be an array or undefined
 *   routeOptions.preSerialization = [...(routeOptions.preSerialization || []), onPreSerialization]
 * }
 * ```
 */
export type OnRouteHook = (routeOptions: ApiRouteOptions) => void;
