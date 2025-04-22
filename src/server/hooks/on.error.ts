import type {
  ApiError,
  ApiReply,
  ApiRequest,
} from "../../types/blueprint.simple.types";

/**
 * This hook is useful if you need to do some custom error logging or add some specific header in case of error.
 *
 * This hook is useful if you need to do some custom error logging or add some specific header in case of error.
 *
 * This hook will be executed only after the customErrorHandler has been executed, and only if the customErrorHandler sends an error back to the user (Note that the default customErrorHandler always sends the error back to the user).
 *
 * Notice: unlike the other hooks, pass an error to the done function is not supported.
 *
 * @return {Promise<void>}
 * @internal
 * @category (Hooks)
 * @author Zach Ayers
 * @example
 * ```typescript
 * async (request, reply, error) => {
 *   // Useful for custom error logging
 *   // You should not use this hook to update the error
 * }
 * ```
 */
export type OnErrorHook = (
  request: ApiRequest,
  reply: ApiReply,
  error: ApiError
) => Promise<void>;
