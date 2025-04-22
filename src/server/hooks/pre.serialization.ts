import type { ApiReply, ApiRequest } from "../../types/blueprint.simple.types";

/**
 * If you are using the preSerialization hook, you can change (or replace) the payload before it is serialized.
 *
 * Note: the hook is NOT called if the payload is a string, a Buffer, a stream, or null.
 *
 * @returns {Promise<void>}
 * @internal
 * @category (Hooks)
 * @author Zach Ayers
 * @example
 * ```typescript
 * async (request, reply, payload) => {
 *   return { wrapped: payload }
 * }
 * ```
 */
export type PreSerializationHook<P> = (
  request: ApiRequest,
  reply: ApiReply,
  payload: P
) => Promise<unknown>;
