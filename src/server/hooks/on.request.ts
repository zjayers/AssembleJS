import type { ApiReply, ApiRequest } from "../../types/blueprint.simple.types";

/**
 * When a request comes in this hook is called after the instance logger and before preParsing
 *
 * Notice: in the onRequest hook, request.body will always be null,
 * because the body parsing happens before the preValidation hook.
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
export type OnRequestHook = (
  request: ApiRequest,
  reply: ApiReply
) => Promise<void>;
