import type { ApiReply, ApiRequest } from "../../types/blueprint.simple.types";

/**
 * The onResponse hook is executed when a response has been sent,
 * so you will not be able to send more data to the client.
 * It can, however, be useful for sending data to external services, for example,
 * to gather statistics.
 *
 * @returns {Promise<void>}
 * @internal
 * @category (Hooks)
 * @author Zach Ayers
 * @example
 * ```typescript
 * async (request, reply) => {
 *   // Some code
 *   await asyncMethod()
 * }
 * ```
 */
export type OnResponseHook = (
  request: ApiRequest,
  reply: ApiReply
) => Promise<void>;
