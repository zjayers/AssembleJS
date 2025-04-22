import type { ApiReply, ApiRequest } from "../../types/blueprint.simple.types";

/**
 * @return {Promise<void>}
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
export type PreHandlerHook = (
  request: ApiRequest,
  reply: ApiReply
) => Promise<void>;
