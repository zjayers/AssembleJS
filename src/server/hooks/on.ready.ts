/**
 * Triggered before the server starts listening for requests and when .ready() is invoked.
 * It cannot change the routes or add new hooks.
 *
 * Registered hook functions are executed serially.
 *
 * Only after all onReady hook functions have completed will the server start listening for requests.
 *
 * Hook functions accept one argument: a callback, done,
 * to be invoked after the hook function is complete.
 *
 * Hook functions are invoked with this bound to the associated Fastify instance.
 *
 * @returns Promise<void>
 * @internal
 * @author Zachariah Ayers
 * @category Hooks
 * @example
 * ```typescript
 * async () => {
 *   // Some async code
 *   await loadCacheFromDatabase()
 * }
 * ```
 */
export type OnReadyHook = () => Promise<void>;
