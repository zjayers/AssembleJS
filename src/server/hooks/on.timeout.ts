import type { ApiReply, ApiRequest } from "../../types/blueprint.simple.types";

/**
 * onTimeout is useful if you need to monitor the request timed out in your service
 * (if the connectionTimeout property is set on the Fastify instance).
 * The onTimeout hook is executed when a request is timed out and the HTTP socket has been hanged up.
 * Therefore, you will not be able to send data to the client.
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
export type OnTimeoutHook = (
  request: ApiRequest,
  reply: ApiReply
) => Promise<void>;
