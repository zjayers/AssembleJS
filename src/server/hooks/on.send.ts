import type { ApiReply, ApiRequest } from "../../types/blueprint.simple.types";

/**
 * If you are using the onSend hook, you can change the payload.
 *
 * Note: If you change the payload, you may only change it to a string, a Buffer, a stream, or null.
 *
 * @returns {Promise<void>}
 * @internal
 * @category (Hooks)
 * @author Zach Ayers
 * @example
 * ```typescript
 * async (request, reply, payload) => {
 *   const newPayload = payload.replace('some-text', 'some-new-text')
 *   return newPayload
 * }
 * ```
 */
export type OnSendHook<P> = (
  request: ApiRequest,
  reply: ApiReply,
  payload: P
) => Promise<unknown>;
