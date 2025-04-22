/**
 * Get the Global window object
 * @description The Global window object is used to mount the eventManager as a singleton.
 * @description The window object may either be globalThis or Window
 * @return {Window} The global Window object.
 * @category (Eventing)
 * @author Zach Ayers
 * @internal
 * @example
 * ```typescript
 * // Retrieves the global window object
 * cost window = getWindow();
 * ```
 */
export function getWindow(): Window {
  // window check - get the window if it exists.
  if (typeof window !== "undefined") {
    return window;
  }

  // globalThis check - get the `globalThis` object if it exists.
  if (typeof global !== "undefined") {
    return global as any;
  }

  // If no window or globalThis were found, throw an error.
  throw new Error("Error: Unable to locate global object!");
}
