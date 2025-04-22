import type {
  ApiPayload,
  ApiReply,
  ApiRequest,
} from "../../types/blueprint.simple.types";

/**
 * If you are using the preParsing hook,
 * you can transform the request payload stream before it is parsed.
 * It receives the request and reply objects as other hooks,
 * and a stream with the current request payload.
 *
 *
 * If it returns a value (via return or via the callback function), it must return a stream.
 * Notice: in the preParsing hook, request.body will always be null,
 * because the body parsing happens before the preValidation hook.
 *
 *
 * Notice: you should also add a receivedEncodedLength property to the returned stream.
 * This property is used to correctly match the request payload with the Content-Length header value.
 * Ideally, this property should be updated on each received chunk.
 *
 *
 * Notice:
 * The old syntaxes function(request, reply, done) and async function(request, reply)
 * for the parser are still supported but they are deprecated.
 *
 * @return {Promise<void>}
 * @internal
 * @category (Hooks)
 * @author Zach Ayers
 * @example
 * ```typescript
 * async (request, reply, payload) => {
 *   // Some code
 *   await asyncMethod()
 *   return newPayload
 * }
 * ```
 */
export type PreParsingHook = (
  request: ApiRequest,
  reply: ApiReply,
  payload: ApiPayload
) => Promise<unknown>;
